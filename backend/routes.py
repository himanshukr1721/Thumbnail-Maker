import asyncio
import json
import logging

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse

from pydantic import BaseModel
from sqlmodel import Session, select

from database import get_session
from models import Job, Thumbnail

from services.generator import process_job, STYLES
from services.imagekit_service import upload_file, get_variants

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

_running_jobs: set[str] = set()


async def _run_job_once(job_id: str) -> None:
    if job_id in _running_jobs:
        logger.warning("Job %s already running, skipping duplicate", job_id)
        return
    _running_jobs.add(job_id)
    try:
        await process_job(job_id)
    finally:
        _running_jobs.discard(job_id)


class CreateJobRequest(BaseModel):
    prompt: str
    headshot_url: str
    style_name: str = "vibrant"


class CreateJobResponse(BaseModel):
    job_id: str


class ThumbnailResponse(BaseModel):
    id: str
    style_name: str
    status: str
    imagekit_url: str | None = None
    error_message: str | None = None
    variants: dict | None = None


class JobResponse(BaseModel):
    id: str
    prompt: str
    num_thumbnails: int
    headshot_url: str
    status: str
    thumbnails: list[ThumbnailResponse]


@router.get("/jobs/health")
def health_check():
    return {"status": "ok"}


@router.post("/upload-headshot")
async def upload_headshot(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        url = upload_file(
            file_bytes=contents,
            file_name=file.filename or "headshot.jpg",
            folder="headshots",
            content_type=file.content_type or "image/png",
        )
        return {"url": url}
    except Exception as e:
        logger.exception("Headshot upload failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/jobs", response_model=CreateJobResponse)
async def create_job(
    request: CreateJobRequest,
    session: Session = Depends(get_session),
):
    if request.style_name not in STYLES:
        raise HTTPException(
            status_code=400,
            detail=f"style_name must be one of: {', '.join(STYLES)}",
        )

    job = Job(
        prompt=request.prompt,
        num_thumbnails=1,
        headshot_url=request.headshot_url,
    )

    session.add(job)
    session.flush()

    session.add(Thumbnail(job_id=job.id, style_name=request.style_name))

    session.commit()
    session.refresh(job)

    asyncio.create_task(_run_job_once(job.id))

    return CreateJobResponse(job_id=job.id)


@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: str, session: Session = Depends(get_session)):
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    thumbnails = session.exec(
        select(Thumbnail).where(Thumbnail.job_id == job_id)
    ).all()

    thumb_responses = [
        ThumbnailResponse(
            id=t.id,
            style_name=t.style_name,
            status=t.status,
            imagekit_url=t.imagekit_url,
            error_message=t.error_message,
            variants=get_variants(t.imagekit_url) if t.imagekit_url else None,
        )
        for t in thumbnails
    ]

    return JobResponse(
        id=job.id,
        prompt=job.prompt,
        num_thumbnails=job.num_thumbnails,
        headshot_url=job.headshot_url,
        status=job.status,
        thumbnails=thumb_responses,
    )


@router.get("/jobs/{job_id}/stream")
async def stream_job(job_id: str):
    async def event_generator():
        from database import engine

        sent_thumbnails: set[str] = set()

        while True:
            with Session(engine) as session:
                job = session.get(Job, job_id)
                if not job:
                    yield f"event: error\ndata: {json.dumps({'error': 'Job not found'})}\n\n"
                    return

                thumbnails = session.exec(
                    select(Thumbnail).where(Thumbnail.job_id == job_id)
                ).all()

                for t in thumbnails:
                    if t.id in sent_thumbnails:
                        continue

                    if t.status == "uploaded" and t.imagekit_url:
                        data = json.dumps({
                            "thumbnail_id": t.id,
                            "style_name": t.style_name,
                            "imagekit_url": t.imagekit_url,
                            "variants": get_variants(t.imagekit_url),
                        })
                        yield f"event: thumbnail_ready\ndata: {data}\n\n"
                        sent_thumbnails.add(t.id)

                    elif t.status in ("failed", "error"):
                        data = json.dumps({
                            "thumbnail_id": t.id,
                            "style_name": t.style_name,
                            "error": t.error_message or "Generation failed",
                        })
                        yield f"event: thumbnail_failed\ndata: {data}\n\n"
                        sent_thumbnails.add(t.id)

                all_done = all(
                    t.status in ("uploaded", "failed", "error") for t in thumbnails
                )
                if all_done and len(thumbnails) >= job.num_thumbnails:
                    data = json.dumps({"job_id": job.id, "status": "completed"})
                    yield f"event: job_complete\ndata: {data}\n\n"
                    return

            await asyncio.sleep(1.5)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
