import json
import os
import sys

# Add parent directory to path to access backend configuration
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from sqlalchemy.orm import Session
from models import CropAdvice


def extract_and_load_weekly_advice(session: Session, json_file_path: str = "data_gen\\weekly_advice_example.json"):
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
        return {"msg":msg}

    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
        session.rollback()


def load_locations(session: Session, csv_file_path: str = "data_gen\\locations.csv"):
    import csv
    from models import Locations
    from sqlalchemy.dialects.postgresql import insert
    
    
    
    try:
        inserted_count = 0
        skipped_count = 0
        
        with open(csv_file_path, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            
            for row in csv_reader:
                # Create location object
                location_data = {
                    'city': row['city'].strip(),
                    'pincode': row['pincode'].strip(),
                    'district': row['district'].strip(),
                    'state': row['state'].strip(),
                    'country': row['country'].strip()
                }
                
                # Use PostgreSQL's INSERT ... ON CONFLICT DO NOTHING
                stmt = insert(Locations).values(**location_data)
                stmt = stmt.on_conflict_do_nothing()
                
                result = session.exec(stmt)
                
                if result.rowcount > 0:
                    inserted_count += 1
                else:
                    skipped_count += 1
            
            session.commit()
        
        return {
            "status": "success",
            "message": f"Loaded locations from CSV",
            "inserted": inserted_count,
            "skipped": skipped_count,
            "total_rows": inserted_count + skipped_count
        }
        
    except FileNotFoundError:
        return {"status": "error", "message": f"CSV file not found at {csv_file_path}"}
    except Exception as e:
        session.rollback()
        return {"status": "error", "message": str(e)}

