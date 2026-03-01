from dotenv import load_dotenv
import os
import io
import wave
import json
import tempfile
from sarvamai import SarvamAI

load_dotenv()
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")


class Transcription:
    def __init__(self):
        self.client = SarvamAI(api_subscription_key=SARVAM_API_KEY)

    def _get_wav_duration(self, file_bytes: bytes) -> float:
        with wave.open(io.BytesIO(file_bytes), "rb") as wf:
            return wf.getnframes() / wf.getframerate()

    def transcribe(self, file_bytes: bytes, filename: str) -> dict:
        is_wav = filename.lower().endswith(".wav") or file_bytes[:4] == b"RIFF"
        duration = self._get_wav_duration(file_bytes) if is_wav else 999

        if duration < 30:
            # Fast path: direct REST API
            buf = io.BytesIO(file_bytes)
            buf.name = filename
            return self.client.speech_to_text.translate(file=buf)
        else:
            # Batch API for longer audio
            suffix = os.path.splitext(filename)[-1] or ".wav"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(file_bytes)
                tmp_path = tmp.name

            out_dir = tempfile.mkdtemp()

            job = self.client.speech_to_text_job.create_job()
            job.upload_files([tmp_path])
            job.start()
            job.wait_until_complete()
            job.download_outputs(out_dir)

            result_file = os.path.join(out_dir, os.listdir(out_dir)[0])
            with open(result_file, encoding='utf-8') as f:
                return json.load(f)