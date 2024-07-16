const express = require("express");
const app = express();

app.use(express.json());//accept json data in requests

//import functions
const getEmbedding = require('./utils/getEmbedding.js');
const getEmbeddings = require('./utils/getEmbeddings.js');
const cosineSimilarity = require('./utils/cosineSimilarity.js');
const findNearestNeighbours = require('./utils/nearestNeighbours.js');

app.post('/api/similarity', async (req, res) => {
  try {
    const { text1, text2 } = req.body;

    //embedding 1
    const embedding1 = await getEmbedding(text1);
    //embedding 2
    const embedding2 = await getEmbedding(text2);
    //similarity
    const similarity = cosineSimilarity(embedding1, embedding2);

    res.json({similarity, embedding1, embedding2});

    // Return the completion as a JSON response
    //res.json({ data: completion.data });
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
});

app.post('/api/chatgpt', async (req, res) => {
  try {
    const { text } = req.body;

    //embedding
    const embedding = await getEmbedding(text);

    //embeddings
    const embeddings = await getEmbeddings();

    //get closest neighbours
    const nearestNeighbours = await findNearestNeighbours(
      {
        embedding, embeddings, k: 10
      }
    )

    res.json({nearestNeighbours});

    // Return the completion as a JSON response
    //res.json({ data: completion.data });
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));