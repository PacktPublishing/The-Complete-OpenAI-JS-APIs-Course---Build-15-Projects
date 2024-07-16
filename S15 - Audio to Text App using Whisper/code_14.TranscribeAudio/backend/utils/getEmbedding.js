const dotenv = require("dotenv");
const path = require('path');
//environment variables
dotenv.config({path: path.join(__dirname, '../../.env')});
//OpenAIApi Configuration
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const getEmbedding = async(text, model = 'text-embedding-ada-002') => {

    //replace newlines with space
    const cleanedText = text.replace(/\n/g, ' ');

    //create embedding using OPENAI API
    const response = await openai.createEmbedding({
        model: model,
        input: cleanedText,
    });

    return response.data.data[0].embedding;

}
module.exports = getEmbedding;