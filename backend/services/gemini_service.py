import asyncio
import logging
import os
from io import BytesIO
from urllib.parse import urlparse

import httpx
from google import genai
from google.genai import types
from google.genai.errors import ClientError

from config import GEMINI_API_KEY, IMAGEKIT_URL_ENDPOINT

logger = logging.getLogger(__name__)

# No automatic retries — each retry counts as another API request and burns quota.
client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options=types.HttpOptions(
        retry_options=types.HttpRetryOptions(attempts=1),
    ),
)

IMAGE_MODEL = os.getenv(
    "GEMINI_IMAGE_MODEL",
    "gemini-2.0-flash-preview-image-generation",
)
IMAGE_PROVIDER = os.getenv("IMAGE_PROVIDER", "").strip().lower()
HF_TOKEN = os.getenv("HF_TOKEN", "").strip()
HF_IMAGE_MODEL = os.getenv(
    "HF_IMAGE_MODEL",
    "black-forest-labs/FLUX.1-Kontext-dev",
)

# Only one generation request at a time across the whole server process.
_generation_lock = asyncio.Lock()


def _is_trusted_headshot_url(headshot_url: str) -> bool:
    if not IMAGEKIT_URL_ENDPOINT:
        return False

    parsed_url = urlparse(headshot_url)
    if parsed_url.scheme not in ("http", "https"):
        return False

    trusted_prefix = IMAGEKIT_URL_ENDPOINT.rstrip("/")
    return headshot_url == trusted_prefix or headshot_url.startswith(f"{trusted_prefix}/")


async def fetch_headshot(headshot_url: str) -> tuple[bytes, str]:
    if not _is_trusted_headshot_url(headshot_url):
        raise ValueError("Untrusted headshot URL")

    async with httpx.AsyncClient() as http:
        response = await http.get(headshot_url, timeout=30.0)
        response.raise_for_status()
        content_type = response.headers.get("content-type", "image/jpeg")
        if ";" in content_type:
            content_type = content_type.split(";", 1)[0].strip()
        return response.content, content_type


def _extract_image_bytes(response) -> bytes:
    parts = response.parts
    if not parts and response.candidates:
        parts = response.candidates[0].content.parts

    for part in parts or []:
        if part.inline_data is not None and part.inline_data.data:
            return part.inline_data.data

    raise ValueError("Gemini did not return an image in the response")


def _friendly_rate_limit_message(error: ClientError) -> str:
    return (
        "Gemini API rate limit reached. Wait 1–2 minutes before trying again. "
        "Only one image is generated per click."
    )


def _image_to_png_bytes(image) -> bytes:
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def _generate_with_huggingface(
    prompt: str,
    style_prompt: str,
    headshot_bytes: bytes,
    mime_type: str,
) -> bytes:
    try:
        from huggingface_hub import InferenceClient
    except ImportError as exc:
        raise RuntimeError(
            "Hugging Face support is enabled but `huggingface_hub` is not installed. "
            "Run `pip install -r backend/requirements.txt` and restart the backend."
        ) from exc

    if not HF_TOKEN:
        raise RuntimeError("HF_TOKEN is missing from the environment")

    hf_client = InferenceClient(api_key=HF_TOKEN)
    full_prompt = (
        f"{style_prompt}\n\n"
        f"User request: {prompt}\n\n"
        "IMPORTANT: Edit the provided headshot into a YouTube thumbnail style image. "
        "Keep the face recognizable, make the composition bold and attention-grabbing, "
        "and preserve a clean thumbnail layout."
    )

    image = hf_client.image_to_image(
        image=headshot_bytes,
        prompt=full_prompt,
        model=HF_IMAGE_MODEL,
    )
    return _image_to_png_bytes(image)


async def _generate_with_gemini(
    prompt: str,
    style_prompt: str,
    headshot_bytes: bytes,
    mime_type: str,
) -> bytes:
    full_prompt = (
        f"{style_prompt}\n\n"
        f"User request: {prompt}\n\n"
        "IMPORTANT: The generated thumbnail must include the headshot image provided "
        "in the input and be visually appealing."
    )

    response = await client.aio.models.generate_content(
        model=IMAGE_MODEL,
        contents=[
            types.Part.from_bytes(data=headshot_bytes, mime_type=mime_type),
            full_prompt,
        ],
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
            image_config=types.ImageConfig(aspect_ratio="3:2"),
        ),
    )
    return _extract_image_bytes(response)


async def generate_thumbnail(
    prompt: str,
    style_prompt: str,
    headshot_bytes: bytes,
    mime_type: str,
) -> bytes:
    """Generate one image using the configured provider."""
    async with _generation_lock:
        if IMAGE_PROVIDER == "huggingface":
            return await asyncio.to_thread(
                _generate_with_huggingface,
                prompt,
                style_prompt,
                headshot_bytes,
                mime_type,
            )

        try:
            return await _generate_with_gemini(prompt, style_prompt, headshot_bytes, mime_type)
        except ClientError as e:
            if e.code == 429 and HF_TOKEN:
                logger.warning("Gemini rate limit hit; falling back to Hugging Face")
                return await asyncio.to_thread(
                    _generate_with_huggingface,
                    prompt,
                    style_prompt,
                    headshot_bytes,
                    mime_type,
                )
            if e.code == 429:
                logger.warning("Gemini rate limit (single attempt, no retry)")
                raise RuntimeError(_friendly_rate_limit_message(e)) from e
            raise
