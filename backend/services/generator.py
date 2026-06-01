import logging

from sqlmodel import Session, select

from database import engine
from models import Job, Thumbnail
from services.gemini_service import fetch_headshot, generate_thumbnail
from services.imagekit_service import upload_file

logger = logging.getLogger(__name__)

STYLES = {
    "vibrant": "Generate a vibrant and colorful thumbnail that grabs attention.",
    "minimalist": "Generate a minimalist thumbnail with clean lines and simple design.",
    "cinematic": "Generate a cinematic thumbnail with dramatic lighting and composition.",
}


async def generate_single_thumbnail(
    thumbnail_id: str,
    prompt: str,
    headshot_bytes: bytes,
    mime_type: str,
):
    with Session(engine) as session:
        thumb = session.get(Thumbnail, thumbnail_id)
        if not thumb:
            logger.error("Thumbnail %s not found", thumbnail_id)
            return
        thumb.status = "generating"
        style_name = thumb.style_name
        session.add(thumb)
        session.commit()

    style_prompt = STYLES.get(style_name, STYLES["vibrant"])

    try:
        image_bytes = await generate_thumbnail(
            prompt, style_prompt, headshot_bytes, mime_type
        )

        with Session(engine) as session:
            thumb = session.get(Thumbnail, thumbnail_id)
            if not thumb:
                return
            job_id = thumb.job_id

        url = upload_file(
            file_bytes=image_bytes,
            file_name=f"{thumbnail_id}.png",
            folder=f"thumbnails/{job_id}",
            content_type="image/png",
        )

        with Session(engine) as session:
            thumb = session.get(Thumbnail, thumbnail_id)
            if not thumb:
                return
            thumb.imagekit_url = url
            thumb.status = "uploaded"
            session.add(thumb)
            session.commit()

        logger.info("Thumbnail %s generated and uploaded", thumbnail_id)

    except Exception as e:
        logger.exception("Error generating thumbnail %s", thumbnail_id)
        with Session(engine) as session:
            thumb = session.get(Thumbnail, thumbnail_id)
            if not thumb:
                return
            thumb.status = "failed"
            thumb.error_message = str(e)[:500]
            session.add(thumb)
            session.commit()


async def process_job(job_id: str):
    with Session(engine) as session:
        job = session.get(Job, job_id)
        if not job:
            logger.error("Job %s not found", job_id)
            return

        job.status = "processing"
        prompt = job.prompt
        headshot_url = job.headshot_url
        session.add(job)
        session.commit()

        thumbnails = session.exec(
            select(Thumbnail).where(Thumbnail.job_id == job_id)
        ).all()
        if not thumbnails:
            logger.warning("Job %s has no thumbnails", job_id)
            return
        thumbnail_id = thumbnails[0].id

    try:
        headshot_bytes, mime_type = await fetch_headshot(headshot_url)
    except Exception as e:
        logger.exception("Failed to fetch headshot for job %s", job_id)
        with Session(engine) as session:
            thumb = session.get(Thumbnail, thumbnail_id)
            if thumb:
                thumb.status = "failed"
                thumb.error_message = f"Could not load headshot: {e}"[:500]
                session.add(thumb)
            job = session.get(Job, job_id)
            if job:
                job.status = "failed"
                session.add(job)
            session.commit()
        return

    await generate_single_thumbnail(thumbnail_id, prompt, headshot_bytes, mime_type)

    with Session(engine) as session:
        thumb = session.get(Thumbnail, thumbnail_id)
        job = session.get(Job, job_id)
        if not job:
            return

        job.status = "failed" if thumb and thumb.status == "failed" else "completed"
        final_status = job.status
        session.add(job)
        session.commit()

    logger.info("Job %s finished with status %s", job_id, final_status)
