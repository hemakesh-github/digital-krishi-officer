import asyncio
from fastapi import APIRouter, UploadFile, File
from transcription.transcription import Transcription

router = APIRouter()


@router.post("/transcribe")
async def transcribe(audio_file: UploadFile = File(...)):
    contents = await audio_file.read()
    filename = audio_file.filename or "audio.wav"

    # result = await asyncio.to_thread(
    #     Transcription().transcribe, contents, filename
    # )
    result = {
        "transcript": "Hello, I am facing a problem with my crops."
    }
    return result
