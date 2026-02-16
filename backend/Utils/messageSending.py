# Download the helper library from https://www.twilio.com/docs/python/install
import os
from twilio.rest import Client
from dotenv import load_dotenv
load_dotenv()

class TwillioClient():
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token =  os.getenv("TWILIO_AUTH_TOKEN")
        self.from_number = os.getenv("FROM_NUMBER")
        self.client = Client(self.account_sid, self.auth_token)

    def send_sms(self, to_number: str, body: str):
        to_number = to_number if to_number.startswith("+") else "+91" + to_number
        message = self.client.messages.create(
            body=body,
            from_=self.from_number,
            to=to_number,
        )
        return message.sid
