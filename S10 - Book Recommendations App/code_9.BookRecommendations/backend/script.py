import sqlite3
from nomic import atlas
import numpy as np

# Connect to the SQLite database
conn = sqlite3.connect('data/book_embeddings_cache.db')
cursor = conn.cursor()

# Retrieve the embeddings from the table
cursor.execute('SELECT embedding FROM embeddings_text_embedding_ada_002')
results = cursor.fetchall()
embeddings = np.array([eval(embedding) for (embedding,) in results])

# Retrieve data from the embeddings_text_embedding_ada_002 table
cursor.execute('SELECT id, title, text FROM embeddings_text_embedding_ada_002')
results = cursor.fetchall()
data = [{"id": id, "Title": title, "Text": text}
        for (id, title, text) in results]

# Close the database connection
conn.close()

# Perform embedding mapping
project = atlas.map_embeddings(embeddings=embeddings,
                               data=data,
                               id_field='id',
                               name='Science Books')
#    map link
#    https://atlas.nomic.ai/map/0df03a93-d682-407a-a9c8-2d4d25f74f86/35a298b5-0b3d-457c-8f0d-a65318af6c1f
