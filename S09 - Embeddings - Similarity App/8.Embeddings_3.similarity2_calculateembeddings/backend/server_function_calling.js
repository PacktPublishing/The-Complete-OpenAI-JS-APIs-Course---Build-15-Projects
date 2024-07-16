const express = require("express");
const dotenv = require("dotenv");
const app = express();
const axios = require('axios');

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
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "user", content: prompt }
    ],
    "functions": [
      {
        "name": "get_current_weather",
        "description": "Get the current weather in a given location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and state, e.g. San Francisco, CA"
            },
            "unit": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"]
            }
          },
          "required": ["location"]
        }
      }
    ],
    temperature: 1,
    max_tokens: 50,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  return response;
}

//get weather
async function getWeather(parsed_function_arguments) {
  try {
    const response = await axios.get(
      'http://api.weatherapi.com/v1/current.json',
      { params: { q: parsed_function_arguments.location, key: process.env.WEATHER_API_KEY } }
    );
    const weather = response.data;
    const { condition, temp_c, temp_f } = weather.current;
    const unit = parsed_function_arguments.unit !== 'fahrenheit' ? 'celicus' : 'fahrenheit';
    const temperature = unit === 'celicus' ? temp_c : temp_f;
    return { temperature, unit, description: condition.text }
  } catch (error) {
    console.error(error);
  }
}

//runCompletion2
async function runCompletion2(prompt, function_arguments, weatherObject) {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { "role": "user", "content": prompt },
      {
        "role": "assistant",
        "content": null,
        "function_call": {
          "name": "get_current_weather",
          "arguments": function_arguments
        }
      },
      {
        "role": "function",
        "name": "get_current_weather",
        "content": JSON.stringify(weatherObject)
      }
    ],
    "functions": [
      {
        "name": "get_current_weather",
        "description": "Get the current weather in a given location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and state, e.g. San Francisco, CA"
            },
            "unit": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"]
            }
          },
          "required": ["location"]
        }
      }
    ],
    temperature: 1,
    max_tokens: 50,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  return response;
}


app.post('/api/chatgpt', async (req, res) => {
  try {
    const { text } = req.body;

    //request 1
    // Pass the request text to the runCompletion function
    const completion = await runCompletion(text);

    //get called_function
    const called_function = completion.data.choices[0].message.function_call;

    //check if we have a function calling
    if (!called_function) {
      // Return the completion as a JSON response
      res.json({ data: completion.data }); return;
    }

    //get function name and arguments
    const { name: function_name, arguments: function_arguments } = called_function;
    const parsed_function_arguments = JSON.parse(function_arguments);

    if (function_name === "get_current_weather") {
      //request 2
      //get weather
      //temperature, unit & description
      const weatherObject = await getWeather(parsed_function_arguments);

      //request 3
      const response = await runCompletion2(text, function_arguments, weatherObject);

      //send response to react application

      res.json(response.data);

    }








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