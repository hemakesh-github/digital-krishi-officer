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

# print(get_suggestion("rice"))
# print(get_suggestion)

# def get_suggestion(cropname, disease=None, district=None):
#     """
#     Args:
#         cropname (str): name of crop
#         disease(str): disease name(optional)
#         district(str): name of district of farmer(optional)
        
#     """
#     return   { "district":"Srikakulam","crop":"Rabi Rice","stage":"Vegetative","problem_disease":"Leaf folder","advice":"Spray Acephate @1.5 g/L or Chlorantraniliprole @0.3 ml/L"},



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
        """Agent that helps farmers with their queries. 
        You can access relavant information from the knowledge base using the retrieve_answer tool,
        You can also get suggestions based on crop, disease and district using get_suggestion tool,
        If you dont have relavant information to answer user query then you can perform search using search_agent tool or if you still have no context of user query even after performing search then you can escalate the conversation to human agent by returing escalate : True in the response.
        You are multi lingual (telugu and english) agent.
        The first thing you do is to check the get_suggestion tool to see if you can get relavant information based on crop, disease and district, then you check the retrieve_answer tool to see if you can get relavant information from the knowledge base based on user query, then you can perform search using search_agent tool to get more information about the query, you should use search agent tool wisely as it is costly and should be used only when necessary.
        """
    ),
    instruction=(
        """
        You are an assistant for farmers to help them with their crop-related queries. You have access to the following tools:
        1. get_suggestion: This tool provides suggestions based on the crop name, disease (optional), and district (optional). It returns advice for the farmer based on the provided information.
        2. retrieve_answer: This tool retrieves relevant answers from the knowledge base based on the query and an optional crop filter. It returns a list of relevant answers along with their relevance scores. You use this to get more context, if the context retrieved is relavant answer based on the context.
        3. search_agent: This tool allows you to perform a Google search to find relevant information for the farmer's query. You can use this tool when you need more information to answer the query or when the provided information is insufficient or to get disease from symptoms or gain knowledge about the crop, Search Agent is also a last resort before escalation.
        4. Every new information you get with tools should be considered only when it is relavant to the original user query.
        5. You final answer should be shorter, should contain about solution to the problem rather than elaborate explanation of the problem. keep problem explanation short
        6. The most important thing is avoid false information as this is critical for the application and stakeholders.
        7. You should respond in user language there are 2 languages the user can interact with english and telugu, you should respond accordingly
        8. If you dont have relavant information to answer user query then you can perform search using search_agent tool or if you still have no context of user query even after performing search then you can escalate the conversation to human agent by returing needs_escalate : True in the response.
        9. It is not quarantee that every query is related to disease, so you should not assume that every query is related to disease, it can be related to any aspect of crop like fertilizer, irrigation, harvesting etc. So you should consider all aspects of crop and not just disease.
        10. You donot need to use all the tools provided to you, you can use only the tools that are necessary to answer the user query. Stop when you have enough information to answer the user query.
        """
    ),
    tools=[get_suggestion, AgentTool(agent=search_agent), retrieve_answer],
    output_schema=AdvisoryResponse,
)


async def query_agent(cropData, dbSession, userId, sessionId=None, role="farmer"):
    print(cropData.crop, cropData.location, cropData.query)
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

    content = types.Content(role='user', parts=[types.Part(text=message)])
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
