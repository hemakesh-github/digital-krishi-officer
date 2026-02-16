import json
import os
import sys

# Add parent directory to path to access backend configuration
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from sqlalchemy.orm import Session
from models import CropAdvice


def extract_and_load_weekly_advice(session: Session, json_file_path: str):
    """
    Reads weekly advice data from a JSON file and inserts it into the database 
    using the provided SQLAlchemy session.
    """
    
    if not os.path.exists(json_file_path):
        print(f"Error: JSON file not found at {json_file_path}")
        return

    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Ensure data is a list; if it's a single dict, wrap it
        if isinstance(data, dict):
            data = [data]

        count = 0
        for entry in data:
            # Check if entry already exists to avoid duplicates
            # Criteria: district, crop, stage, problem_disease
            stmt = select(CropAdvice).where(
                CropAdvice.district == entry.get("district").lower(),
                CropAdvice.crop == entry.get("crop").lower(),
                CropAdvice.stage == entry.get("stage").lower(),
                CropAdvice.problem_disease == entry.get("problem_disease").lower()
            )
            existing_advice = session.execute(stmt).scalars().first()

            if not existing_advice:
                new_advice = CropAdvice(
                    district=entry.get("district").lower(),
                    crop=entry.get("crop").lower(),
                    stage=entry.get("stage").lower(),
                    problem_disease=entry.get("problem_disease").lower(),
                    advice=entry.get("advice").lower()
                )
                session.add(new_advice)
                count += 1
            else:
                # Optional: Update logic could go here
                pass

        session.commit()
        msg = f"Successfully processed {len(data)} entries. Added {count} new records."
        print(msg)
        return msg

    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
        session.rollback()

