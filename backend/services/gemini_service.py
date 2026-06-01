import asyncio
import logging

import httpx
from google import genai
from google.genai import types
from google.genai.errors import ClientError

from config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

# No automatic retries — each retry counts as another API request and burns quota.
client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options=types.HttpOptions(
        retry_options=types.HttpRetryOptions(attempts=1),
    ),
)

MODEL = "Gemini API Key Image Gen"

# Only one Gemini request at a time across the whole server process.
_gemini_lock = asyncio.Lock()


async def fetch_headshot(headshot_url: str) -> tuple[bytes, str]:
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


async def generate_thumbnail(
    prompt: str,
    style_prompt: str,
    headshot_bytes: bytes,
    mime_type: str,
) -> bytes:
    """Single Gemini API call — no retries."""
    full_prompt = (
        f"{style_prompt}\n\n"
        f"User request: {prompt}\n\n"
        "IMPORTANT: The generated thumbnail must include the headshot image provided "
        "in the input and be visually appealing."
    )

    async with _gemini_lock:
        try:
            response = await client.aio.models.generate_content(
                model=MODEL,
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
        except ClientError as e:
            if e.code == 429:
                logger.warning("Gemini rate limit (single attempt, no retry)")
                raise RuntimeError(_friendly_rate_limit_message(e)) from e
            raise
