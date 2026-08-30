from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv(".env")

c = MongoClient(os.getenv("MONGO_URI"))
col = c["test"]["experiencechunks"]

total = col.count_documents({})

with_embedding = 0
without_embedding = 0
sample = None

for doc in col.find({}, {"embedding": 1}).limit(1012):
    if "embedding" in doc:
        with_embedding += 1
        if sample is None:
            sample = doc
    else:
        without_embedding += 1

print("Total:", total)
print("Has embedding field:", with_embedding)
print("No embedding field:", without_embedding)

if sample:
    print("Sample embedding type:", type(sample["embedding"]).__name__)
    print("Sample dimensions:", len(sample["embedding"]))
else:
    print("No embedding found.")

c.close()
