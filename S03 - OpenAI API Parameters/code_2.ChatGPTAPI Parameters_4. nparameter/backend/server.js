const express = require("express");
const dotenv = require("dotenv");
const app = express();

app.use(express.json());//accept json data in requests

//environment variables
dotenv.config();

//OpenAIApi Configuration
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


//runCompletion
async function runCompletion(prompt) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 1,
    max_tokens: 10,
    top_p: 1,
    n: 3,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  return response;
}


app.post('/api/chatgpt', async (req, res) => {
  try {
    const { text } = req.body;

    // Pass the request body to the getCompletion function
    const completion = await runCompletion(text);

    // Return the completion as a JSON response
    res.json({ data: completion.data });
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