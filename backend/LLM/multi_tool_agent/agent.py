from google.adk.agents import Agent
from Utils.db_operations import addExpertRequest, get_suggestion
import os
from dotenv import load_dotenv
from google.adk.sessions import DatabaseSessionService
from google.adk.runners import Runner
from google.genai import types
from google.adk.tools import google_search
from google.adk.tools.agent_tool import AgentTool
from ..retrieval import retrieve_answer
from google.adk.events import Event
from models import ChatSession, Message, MessageData, CropData
from pydantic import BaseModel, Field
import json


load_dotenv()
APP_NAME = "crop_query_agent"


def escalate(session, sessionId: str):
    """Escalates the conversation to a human agent when the model cannot answer.

    Args:
        sessionId (str): The ID of the chat session that needs to be escalated.

    Returns:
        id of the expert, name of the expert it is assigned to and a string message
    """
    while(True):
        expert = addExpertRequest(session, sessionId)
        if expert:
            break
    return {"exper_name": expert.name, "msg": f"Your query will be resolved by our officer {expert.name} shortly"}

class AdvisoryResponse(BaseModel):
    crop_name: str = Field(description="Name of the crop")
    disease_identified: str = Field(description="Identified disease based on the symptoms provided by the user, empty string if no disease is identified or if the query is not related to disease")
    recommended_action: str = Field(description="Recommended action for the identified disease")
    needs_escalation: bool = Field(description="Indicates whether the conversation needs to be escalated to a human agent")
    
search_agent = Agent(
    model='gemini-2.5-flash',
    name='SearchAgent',
    instruction="""
    You're a specialist in Google Search
    """,
    tools=[google_search],
)

crop_query_agent = Agent(
    name="crop_query_agent",
    model="gemini-2.5-flash",
    description=(
        """
            You are an assistant for farmers to help then with crop related queries.
            You are given crop details and also some context information retrieved from the knowledge base, 
            you should use this information to answer the user query. 
            You can also perform search using search agent tool when you dont have enough information 
            to answer user query. You should try to answer user query with the information you have and only 
            You should only answer if given context is sufficient to construct an answer, if the context is not sufficient to answer user query then
            you just escalate the query"""
    ),
    instruction=(
        """
        You are an assistant for farmers to help them with their crop-related queries:
        - You will be provided with crop details and context information retrieved from the knowledge base.
        - Use the provided information to answer user queries.
        - If the provided context is insufficient to answer a user query, escalate the query to a human agent.
        """
    ),
    output_schema=AdvisoryResponse,
)


async def query_agent(cropData, dbSession, userId, sessionId=None, role="farmer"):
    print(cropData.crop, cropData.location, cropData.query)

    def _build_query(cropData, retrieved_data=None, suggestions=None):
        query_parts = []
        if cropData.crop:
            query_parts.append(f"Crop: {cropData.crop}")
        if cropData.location:
            query_parts.append(f"Location: {cropData.location}")
        if cropData.query:
            query_parts.append(f"Query: {cropData.query}")
        if retrieved_data:
            query_parts.append(f"This is retrieved Data if the data is in the context use it else discard this information: {retrieved_data}")
        if suggestions:
            query_parts.append(f"This is suggestions based on crop, disease and district if the suggestions are in the context use it else discard this information: {suggestions}")
        return " | ".join(query_parts)


    retrieved_data = retrieve_answer(cropData.query)

    message = f"""crop: {cropData.crop}, location: {cropData.location}, query: {cropData.query}"""
    session_service = DatabaseSessionService(db_url=os.getenv("DATABASE_ASYNC_URL"))

    if not sessionId:
        new_session = ChatSession(user_id=userId,
                                    cropdata=dict(cropData))
        dbSession.add(new_session)
        dbSession.commit()
        dbSession.refresh(new_session)
        sessionId = new_session.id
        session = await session_service.create_session(app_name=APP_NAME, user_id=str(userId), session_id=str(sessionId))
        new_user_message = Message(session_id= sessionId, role=role, content = message)

    else:
        session = await session_service.get_session(app_name=APP_NAME, user_id=str(userId), session_id=str(sessionId))
        new_user_message = Message(session_id= sessionId, role=role, content = cropData.query)
    dbSession.add(new_user_message)
    dbSession.commit()
    dbSession.refresh(new_user_message)

    runner = Runner(agent=crop_query_agent, app_name=APP_NAME, session_service=session_service)
    
    query = _build_query(cropData, retrieved_data=retrieved_data, suggestions=get_suggestion(dbSession, cropData.crop, cropData.location, cropData.query))

    content = types.Content(role='user', parts=[types.Part(text=query)])
    events = runner.run_async(user_id=str(userId), session_id=str(sessionId), new_message=content)
    final_answer=""
    async for event in events:
        print(f"\nDEBUG EVENT: {event}\n")
        if event.is_final_response() and event.content:
            if event.content and event.content.parts:
                raw_json_string = event.content.parts[0].text.strip()
                print(raw_json_string)
                try:
                    parsed_output = AdvisoryResponse.model_validate_json(raw_json_string)
                    print("\n🟢 FINAL STRUCTURED ANSWER")
                    print(f"Crop: {parsed_output.crop_name}")
                    print(f"Action: {parsed_output.recommended_action}")
                    final_answer = parsed_output.model_dump()
                except Exception as e:
                    print(f"Failed to parse JSON output: {e}")
                    final_answer = {"error": "Failed to parse agent response"}
            
    
    
    if (final_answer.get("needs_escalation")):
        escalation_result = escalate(dbSession, sessionId)
        new_agent_message = Message(session_id=sessionId, role="Agent", content=json.dumps(escalation_result))
    else:
        new_agent_message = Message(session_id=sessionId, role="Agent", content=json.dumps(final_answer))
    final_answer["sessionId"] = str(sessionId)

    dbSession.add(new_agent_message)
    dbSession.commit()
    dbSession.refresh(new_agent_message)
    print(sessionId)
    return final_answer
    
async def add_expert_reply(reply: MessageData):
    try:
        session_service = DatabaseSessionService(db_url=os.getenv("DATABASE_ASYNC_URL"))
        session = await session_service.get_session(
            app_name=APP_NAME,
            user_id="Expert",
            session_id=str(reply.sessionId)
        )

        # 3. Format the human response as an ADK Event
        human_intervention_event = Event(
            author="human_expert", 
            content=types.Content(
                role="model", # 'model' tells the LLM this is part of the assistant's replies
                parts=[types.Part(text=reply.reply)]
            )
        )

        # 4. Inject it into the ADK history
        session.events.append(human_intervention_event)
        
        # 5. Ensure the updated session is saved back to ADK's database
        await session_service.save_session(session)
        return True
    except Exception as e:
        print(f"Error adding expert reply: {e}")
        return False
