import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()


class EmailClient:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_user)

    def send_email(self, to_email: str, subject: str, body: str):
        """Send a plain-text email to *to_email*."""
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = to_email

            part = MIMEText(body, "plain")
            msg.attach(part)

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.from_email, to_email, msg.as_string())
        except smtplib.SMTPAuthenticationError as e:
            raise Exception(f"SMTP Authentication failed. Check your credentials. Error: {e}")
        except smtplib.SMTPException as e:
            raise Exception(f"Failed to send email: {e}")
        except Exception as e:
            raise Exception(f"Unexpected error sending email: {e}")

    def send_otp_email(self, to_email: str, otp: str):
        subject = "Your Digital Krishi Officer OTP"
        body = (
            f"Dear User,\n\n"
            f"Your One-Time Password (OTP) for Digital Krishi Officer is:\n\n"
            f"    {otp}\n\n"
            f"This OTP is valid for 15 minutes. Do not share it with anyone.\n\n"
            f"Regards,\nDigital Krishi Officer Team"
        )
        self.send_email(to_email, subject, body)

    def send_expert_reply_email(self, to_email: str, chat_url: str, user_lang: str = "en"):
        subject = "Expert Reply – Digital Krishi Officer"
        if user_lang == "te":
            body = (
                f"డిజిటల్ కృషి ఆఫీసర్‌లో మీ ప్రశ్నకు నిపుణులు సమాధానం ఇచ్చారు.\n\n"
                f"వివరాలు చూడండి: {chat_url}\n\n"
                f"ధన్యవాదాలు,\nDigital Krishi Officer"
            )
        else:
            body = (
                f"Dear Farmer,\n\n"
                f"An expert has replied to your query on Digital Krishi Officer.\n\n"
                f"View details here: {chat_url}\n\n"
                f"Regards,\nDigital Krishi Officer Team"
            )
        self.send_email(to_email, subject, body)
