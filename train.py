import torch
import torch.nn as nn

# Our training text - you can change this to anything!
text = """
the cat sat on the mat
the dog sat on the log
the cat ate the rat
the dog ate the hog
the rat ran fast
the hog ran slow
"""

# Step 1 - Build vocabulary from our text
words = text.split()
vocab = sorted(set(words))
print(f"Vocabulary: {vocab}")
print(f"Vocab size: {len(vocab)}")

# Step 2 - Convert words to numbers
word_to_idx = {w: i for i, w in enumerate(vocab)}
idx_to_word = {i: w for i, w in enumerate(vocab)}

# Step 3 - Prepare training data
data = [word_to_idx[w] for w in words]

# Step 4 - Build the Neural Network
class TinyAI(nn.Module):
    def __init__(self, vocab_size, embed_size=10, hidden_size=32):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, embed_size)
        self.hidden = nn.Linear(embed_size, hidden_size)
        self.output = nn.Linear(hidden_size, vocab_size)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.embed(x)
        x = self.relu(self.hidden(x))
        return self.output(x)

# Step 5 - Train the model
vocab_size = len(vocab)
model = TinyAI(vocab_size)
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
loss_fn = nn.CrossEntropyLoss()

print("\nTraining...")
for epoch in range(500):
    total_loss = 0
    for i in range(len(data) - 1):
        input_word = torch.tensor([data[i]])
        target_word = torch.tensor([data[i + 1]])

        output = model(input_word)
        loss = loss_fn(output, target_word)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    if (epoch + 1) % 100 == 0:
        print(f"Epoch {epoch+1}/500 - Loss: {total_loss:.4f}")

# Step 6 - Generate text from our trained AI
print("\n--- AI Generated Text ---")
current_word = "the"
result = [current_word]

for _ in range(10):
    input_tensor = torch.tensor([word_to_idx[current_word]])
    output = model(input_tensor)
    probs = torch.softmax(output, dim=1)
    next_idx = torch.multinomial(probs, 1).item()
    next_word = idx_to_word[next_idx]
    result.append(next_word)
    current_word = next_word

print(" ".join(result))