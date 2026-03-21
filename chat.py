import torch
import torch.nn as nn

# Same network architecture as train.py
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

# Load the saved model
print("Loading model...")
checkpoint = torch.load('model.pth')

word_to_idx = checkpoint['word_to_idx']
idx_to_word = checkpoint['idx_to_word']
vocab_size = checkpoint['vocab_size']
context_size = checkpoint['context_size']

model = TinyAI(vocab_size)
model.load_state_dict(checkpoint['model_state'])
model.eval()

print("✔ Model loaded!")
print(f"Vocabulary size: {vocab_size} words")
print("\nType 3 words to start generating text!")
print("Type 'quit' to exit\n")

# Chat loop
while True:
    user_input = input("You: ").strip().lower()

    if user_input == 'quit':
        print("Goodbye!")
        break

    words = user_input.split()

    if len(words) != 3:
        print("⚠️  Please enter exactly 3 words!\n")
        continue

    if any(w not in word_to_idx for w in words):
        unknown = [w for w in words if w not in word_to_idx]
        print(f"⚠️  Unknown words: {unknown}")
        print(f"Try words from: {list(word_to_idx.keys())}\n")
        continue

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

    print(f"AI: {' '.join(result)}\n")