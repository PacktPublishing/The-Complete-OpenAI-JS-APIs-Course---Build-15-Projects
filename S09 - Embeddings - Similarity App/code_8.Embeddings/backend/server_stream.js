const express = require("express");
const dotenv = require("dotenv");
const app = express();
const { EventEmitter } = require('events');

app.use(express.json());//accept json data in requests

//environment variables
dotenv.config();

//OpenAIApi Configuration
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

//Create an EventEmitter for sending stream data
const completionEmitter = new EventEmitter();


//runCompletion
async function startCompletionStream(prompt) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 1,
    max_tokens: 50,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true
  }, {
    responseType: 'stream'
  });

  response.data.on('data', data => {
    console.log(data.toString().replace(/^data: /, '').trim());
    const message = data.toString().replace(/^data: /, '').trim();

    if (message !== '[DONE]') {
      //Emit data to SSE connection
      completionEmitter.emit('data', message);
    } else {
      completionEmitter.emit('done'); //Notify stream completion
    }
  })
}

// startCompletionStream('Cars are amazing because');


app.post('/api/chatgpt', async (req, res) => {
  try {
    const { text } = req.body;


    // Start the completion stream
    startCompletionStream(text);

    //listen to events
    const dataListener = (data) => {
      res.write(data);
    }
    const doneListener = () => {
      res.write('{"event":"done"}');
      res.end();
      //delete listeners
      completionEmitter.off('data', dataListener);
      completionEmitter.off('done', doneListener);
    }
    completionEmitter.on('data', dataListener);
    completionEmitter.on('done', doneListener);

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