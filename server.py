import torch
import torch.nn as nn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os

app = FastAPI()

# Allow React frontend to talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Same network architecture
class TinyAI(nn.Module):
    def __init__(self, vocab_size, embed_size=16, hidden_size=64):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, embed_size)
        self.hidden1 = nn.Linear(embed_size * 3, hidden_size)
        self.hidden2 = nn.Linear(hidden_size, hidden_size)
        self.hidden3 = nn.Linear(hidden_size, hidden_size)
        self.output = nn.Linear(hidden_size, vocab_size)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)

    def forward(self, x):
        x = self.embed(x)
        x = x.view(1, -1)
        x = self.relu(self.hidden1(x))
        x = self.dropout(x)
        x = self.relu(self.hidden2(x))
        x = self.dropout(x)
        x = self.relu(self.hidden3(x))
        x = self.output(x)
        return x

# Load model on startup
print("Loading model...")
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
checkpoint = torch.load(os.path.join(BASE_DIR, 'model.pth'))
word_to_idx = checkpoint['word_to_idx']
idx_to_word = checkpoint['idx_to_word']
vocab_size = checkpoint['vocab_size']
context_size = checkpoint['context_size']

model = TinyAI(vocab_size)
model.load_state_dict(checkpoint['model_state'])
model.eval()
print("✅ Model loaded!")

# Request format
class ChatRequest(BaseModel):
    message: str

# Chat endpoint
@app.post("/chat")
def chat(req: ChatRequest):
    words = req.message.strip().lower().split()

    # Validate input
    if len(words) != 3:
        return {"reply": "⚠️ Please enter exactly 3 words!", "error": True}

    unknown = [w for w in words if w not in word_to_idx]
    if unknown:
        return {"reply": f"⚠️ Unknown words: {unknown}. Try words from the vocabulary!", "error": True}

    # Generate text
    context = [word_to_idx[w] for w in words]
    result = list(words)

    for _ in range(15):
        input_tensor = torch.tensor(context)
        output = model(input_tensor)
        probs = torch.softmax(output, dim=1)
        next_idx = torch.multinomial(probs, 1).item()
        next_word = idx_to_word[next_idx]
        result.append(next_word)
        context = context[1:] + [next_idx]

    return {"reply": " ".join(result), "error": False}

# Vocabulary endpoint
# Get all sentences
@app.get("/data")
def get_data():
    with open('data.py', 'r') as f:
        content = f.read()
    # Extract sentences from training_text
    start = content.find('"""') + 3
    end = content.rfind('"""')
    text = content[start:end].strip()
    sentences = [s.strip() for s in text.split('\n') if s.strip()]
    return {"sentences": sentences}

# Add a sentence
class SentenceRequest(BaseModel):
    sentence: str

@app.post("/data/add")
def add_sentence(req: SentenceRequest):
    with open('data.py', 'r') as f:
        content = f.read()
    # Find the closing triple quote and add before it
    idx = content.rfind('"""')
    new_content = content[:idx] + req.sentence.strip() + '\n' + content[idx:]
    with open('data.py', 'w') as f:
        f.write(new_content)
    return {"success": True, "message": "Sentence added!"}

# Remove a sentence
# Get all sentences
@app.get("/data")
def get_data():
    with open('data.py', 'r') as f:
        content = f.read()
    # Extract sentences from training_text
    start = content.find('"""') + 3
    end = content.rfind('"""')
    text = content[start:end].strip()
    sentences = [s.strip() for s in text.split('\n') if s.strip()]
    return {"sentences": sentences}

# Add a sentence
class SentenceRequest(BaseModel):
    sentence: str

@app.post("/data/add")
def add_sentence(req: SentenceRequest):
    with open('data.py', 'r') as f:
        content = f.read()
    # Find the closing triple quote and add before it
    idx = content.rfind('"""')
    new_content = content[:idx] + req.sentence.strip() + '\n' + content[idx:]
    with open('data.py', 'w') as f:
        f.write(new_content)
    return {"success": True, "message": "Sentence added!"}

# Remove a sentence
@app.post("/data/remove")
def remove_sentence(req: SentenceRequest):
    with open('data.py', 'r') as f:
        content = f.read()
    # Remove the sentence
    new_content = content.replace(req.sentence.strip() + '\n', '')
    with open('data.py', 'w') as f:
        f.write(new_content)
    return {"success": True, "message": "Sentence removed!"}

# Retrain the model
training_logs = []

@app.post("/retrain")
def retrain():
    import subprocess
    import threading

    def run_training():
        process = subprocess.Popen(
            ["python","-u", "train.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            cwd=BASE_DIR
        )
        for line in process.stdout:
            training_logs.append(line.strip())
        training_logs.append("✅ Training complete!")

    training_logs.clear()
    thread = threading.Thread(target=run_training)
    thread.start()
    return {"success": True, "message": "Retraining started!"}

@app.get("/retrain/logs")
def get_logs():
    return {"logs": training_logs}