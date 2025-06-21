
# from langchain.chat_models import ChatOpenAI
from langchain.agents import Tool, initialize_agent
from langchain.vectorstores import FAISS
# from langchain.embeddings import OpenAIEmbeddings
from langchain.prompts import PromptTemplate
# from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
# from langchain.tools import tool
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_community.document_loaders import JSONLoader
from langchain import HuggingFaceHub


import os
from dotenv import load_dotenv
load_dotenv()

# Load environment variables
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY")
LANGSMITH_PROJECT = os.getenv("LANGSMITH_PROJECT")
LANGSMITH_TRACING = os.getenv("LANGSMITH_TRACING")
LANGSMITH_ENDPOINT = os.getenv("LANGSMITH_ENDPOINT")
os.environ["HUGGINGFACE_API_KEY"] = HUGGINGFACE_API_KEY
os.environ["GROQ_API_KEY"] = "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"
os.environ["LANGSMITH_API_KEY"] = LANGSMITH_API_KEY
os.environ["LANGSMITH_PROJECT"] = LANGSMITH_PROJECT
os.environ["LANGSMITH_TRACING"] = LANGSMITH_TRACING
os.environ["LANGSMITH_ENDPOINT"] = LANGSMITH_ENDPOINT

import json
import numpy as np
from langchain_core.documents import Document

def initializeVectorStorage(jsonl_path="All_Beauty.jsonl", max_docs=10000, index_path="faiss_review_index"):
    reviews = []
    # Load review JSON
    with open(jsonl_path, "r") as f:
        for line in f:
            review = json.loads(line)
            reviews.append({
                "asin": review["asin"],
                "user_id": review["user_id"],
                "timestamp": review["timestamp"],
                "title": review["title"],
                "text": review["text"]
            })

    # Convert to LangChain Documents with metadata
    documents = []
    for r in reviews:
        title = r["title"]
        text = r["text"]
        metadata = {
            "asin": r["asin"],
            "user_id": r["user_id"],
            "timestamp": r["timestamp"]
        }
        documents.append(Document(page_content=title + ", " + text, metadata=metadata))
        if len(documents) >= max_docs:
            break

    # Generate embeddings using HuggingFaceEmbeddings
    embedding_model = HuggingFaceEmbeddings()

    # Create FAISS index from the documents
    faiss_index = FAISS.from_documents(documents, embedding_model)

    # Save index locally
    faiss_index.save_local(index_path)

from datetime import datetime, timedelta
from langchain.vectorstores import FAISS
from langchain.schema import Document

def add_embedding(review_title, review_text, metadata):
    # vectorstore = FAISS.load_local("faiss_review_index", HuggingFaceEmbeddings())
    review_doc = Document(
        page_content=f"{review_title}\n{review_text}",
        metadata=metadata
    )
    faiss_index = FAISS.load_local("faiss_review_index", HuggingFaceEmbeddings(), allow_dangerous_deserialization=True)
    ### check if the review is already in the index
    existing_docs = faiss_index.similarity_search(
        query=review_title,
        k=1,
    )

    if len(existing_docs) == 0:
        faiss_index.add_documents([review_doc])

def check_review_spike(metadata):
    user_id = metadata.get("user_id")
    # vectorstore = FAISS.load_local("faiss_review_index", HuggingFaceEmbeddings())
    # faiss_review_index = FAISS(vectorstore=vectorstore)
    faiss_index = FAISS.load_local("faiss_review_index", HuggingFaceEmbeddings(), allow_dangerous_deserialization=True)
    user_reviews = faiss_index.similarity_search(
        query=".",
        k=100,
        filter={"user_id": user_id}
    )

    currtime = datetime.now()
    time_threshold = currtime - timedelta(minutes=60)
    recent_reviews = [
        review for review in user_reviews
        if datetime.fromisoformat(review.metadata["timestamp"]) >= time_threshold
    ]

    if len(recent_reviews) > 10:
        return True, f"User {user_id} has posted {len(recent_reviews)} reviews in the last hour, which is more than the allowed limit."
    return False, f"User {user_id} has posted {len(recent_reviews)} reviews in the last hour, which is within the allowed limit."


import re
from datetime import datetime

def extract_review_fields(review_str):
    def extract_value(key, text):
        pattern = rf"{key}:\s*(.+)"
        match = re.search(pattern, text)
        return match.group(1).strip() if match else ""

    return {
        "title": extract_value("Title", review_str),
        "text": extract_value("Text", review_str),
        "user_id": extract_value("User ID", review_str),
        "asin": extract_value("ASIN", review_str),
        "timestamp": extract_value("Timestamp", review_str) or datetime.now().isoformat()
    }

def sentiment_analysis_tool(review_str):
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_groq import ChatGroq

    fields = extract_review_fields(review_str)
    full_review = fields["title"] + ". " + fields["text"]

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant that analyzes product reviews."),
        ("user", "Analyze the sentiment of the following review: {review} and classify it as Positive, Negative, or Neutral.")
    ])

    chain = prompt | ChatGroq(model_name="llama3-8b-8192", temperature=0.1)
    sentiment = chain.invoke({"review": full_review})
    return sentiment.content


def ai_detection_tool(review_str):
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_groq import ChatGroq

    fields = extract_review_fields(review_str)
    full_review = fields["title"] + ". " + fields["text"]

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant that detects AI-generated text."),
        ("user", "Determine if the following review is AI-generated or human-written: {review} and classify it as AI-generated or Human-written.")
    ])

    chain = prompt | ChatGroq(model_name="llama3-8b-8192", temperature=0.1)
    ai_verdict = chain.invoke({"review": full_review})
    return ai_verdict.content


from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings

# assume faiss_index is globally available or injected
def cosine_similarity(vec1, vec2):
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

def similarity_search_tool(review_str):
    fields = extract_review_fields(review_str)
    full_review = fields["title"] + ". " + fields["text"]

    embedding = HuggingFaceEmbeddings().embed_query(full_review)
    faiss_index = FAISS.load_local("faiss_review_index", HuggingFaceEmbeddings(), allow_dangerous_deserialization=True)
    results = faiss_index.similarity_search_by_vector(embedding, k=3)
    # similar_reviews = [res.page_content for res in results]
    similar_reviews = []
    for res in results:
        doc_embedding = HuggingFaceEmbeddings().embed_query(res.page_content)
        # Check cosine similarity
        # if cosine_similarity(embedding, doc_embedding) >= 0.7:  # Adjust threshold as needed
        print(res, cosine_similarity(embedding, doc_embedding))
        similar_reviews.append({
            "title": res.metadata.get("title", ""),
            "text": res.page_content,
            "user_id": res.metadata.get("user_id", ""),
            "asin": res.metadata.get("asin", ""),
            "timestamp": res.metadata.get("timestamp", "")
        })

    return {
        "flagged": len(similar_reviews) > 0,
        "matches": similar_reviews
    }


def spike_detection_tool(review_str):
    fields = extract_review_fields(review_str)
    metadata = {
        "user_id": fields["user_id"],
        "timestamp": fields["timestamp"]
    }

    # Placeholder for your own spike logic
    spike = check_review_spike(metadata)  # assumed to be implemented
    return spike



def add_embedding_tool(review_str):
    fields = extract_review_fields(review_str)
    full_review = fields["title"] + ". " + fields["text"]

    metadata = {
        "user_id": fields["user_id"],
        "asin": fields["asin"],
        "timestamp": fields["timestamp"]
    }

    add_embedding(fields["title"], fields["text"], metadata)  # your existing method
    return "Embedding added successfully."


tools = [
    Tool(name="SentimentAnalysis", func=sentiment_analysis_tool, description="Analyze review sentiment."),
    Tool(name="AIDetection", func=ai_detection_tool, description="Detect if a review is AI-generated."),
    Tool(name="SimilarityCheck", func=similarity_search_tool, description="Check review similarity."),
    Tool(name="SpikeDetection", func=spike_detection_tool, description="Detect review spike by user."),
    Tool(name="AddEmbedding", func=add_embedding_tool, description="Store review in vector DB."),
]

from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

test_title = "Such a lovely scent but not overpowering."
test_review = "This spray is really nice. It smells really good, goes on really fine, and does the trick. I will say it feels like you need a lot of it though to get the texture I want. I have a lot of hair, medium thickness. I am comparing to other brands with yucky chemicals so I'm gonna stick with this. Try it!"
test_user_id = "AGKHLEW2SOWHNMFQIJGBECAF7INQ"
metadata = {
    "asin": "B000123456",
    "user_id": "AGKHLEW2SOWHNMFQIJGBECAF7INQ",
    "timestamp": datetime.now().isoformat()
}

review = {
    "title": test_title,
    "text": test_review,
    "metadata": metadata
}

review_input = f"""Review Analysis Request:
Title: {review['title']}
Text: {review['text']}
User ID: {review['metadata']['user_id']}
ASIN: {review['metadata']['asin']}
Timestamp: {review['metadata']['timestamp']}
"""
# connect tool to the agent
# tools = [analyze_review_tool]
# Initialize the agent with the Groq model and tools
agent = initialize_agent(
    tools=tools,
    llm=ChatGroq(model_name="llama3-8b-8192", temperature=0.1),
    agent_type="zero-shot-react-description",
    verbose=True
)

agent_prompt = """You are a helpful assistant that analyzes product reviews.
You will receive a review.
Your tasks are:
1. Analyze the sentiment of the review and classify it as Positive, Negative, or Neutral.
2. Determine if the review is AI-generated or human-written.
3. Check if the review is similar to existing reviews in the database.
4. Detect if the user has posted too many reviews in a short time.
5. Store the review in the vector database for future reference.
You will use the following tools:
- SentimentAnalysis: Analyze review sentiment.
- AIDetection: Detect if a review is AI-generated.
- SimilarityCheck: Check review similarity.
- SpikeDetection: Detect review spike by user.
- AddEmbedding: Store review in vector DB.

Respond with the analysis results in a structured format from all the tools used.
"""
# Set the agent's prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", agent_prompt),
    ("user", "{input}")
])

chain = prompt | agent

# Pass the review dictionary directly to the agent
# response = chain.invoke({"input": review_input})
# print(response["output"])

# function to call the agent with a review dictionary
def analyze_review(review):
    review_input = f"""Review Analysis Request:
    Title: {review['title']}
    Text: {review['text']}
    User ID: {review['metadata']['user_id']}
    ASIN: {review['metadata']['asin']}
    Timestamp: {review['metadata']['timestamp']}
    """
    
    response = chain.invoke({"input": review_input})
    return response["output"]

