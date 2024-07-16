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
    max_tokens: 50,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  return response;
}

const multer = require('multer');
const path = require('path');
const { PDFExtract } = require('pdf.js-extract');
const upload = multer({ dest: path.join(__dirname, 'pdfsummary') });
const { encode } = require('gpt-3-encoder');

const calculateTokens = text => encode(text).length;

// Split the sentence into multiple chunks if it exceeds the token limit
const splitSentence = (sentence, maxChunkSize) => {

  //Define an array variable: chunks where we will store all the chunks
  const sentenceChunks = [];

  //Define a string variable: current Chunk where we will store the chunk being built
  //before inserting it into the chunks array
  let partialChunk = "";

  //get all words in the text and store them inside a variable: words
  const words = sentence.split(' ');

  //Loop over the words
  words.forEach(word => {
    //For each word:
    //if the number of tokens in the combination of partialChunk and word < 2000
    //keep adding words to the partialChunk
    //otherwise add the word to the partialChunk and insert ouput into sentenceChunks

    if (calculateTokens(partialChunk + word) < maxChunkSize) {
      partialChunk += word + "."
    } else {
      sentenceChunks.push(partialChunk.trim());
      partialChunk = word + "."; //set the new chunk to the word
    }
  });
  if (partialChunk) {
    sentenceChunks.push(partialChunk.trim());
  }


  //return the sentenceChunks array
  return sentenceChunks;
}
const splitTextIntoChunks = (text, maxChunkSize) => {
  //Define an array variable: chunks where we will store all the chunks
  const chunks = [];

  //Define a string variable: current Chunk where we will store the chunk being built
  //before inserting it into the chunks array
  let currentChunk = "";

  //get all sentences in the text and store them inside a variable: sentences
  const sentences = text.split('.');

  //Loop over the sentences
  sentences.forEach(sentence => {
    //For each sentence:
    //if the number of tokens in the combination of currentChunk and sentence < 2000
    //keep adding sentences to the currentChunk
    //otherwise add the sentence to the current chunk and insert ouput into chunks

    if (calculateTokens(currentChunk) > maxChunkSize) {
      const sentenceChunks = splitSentence(currentChunk, maxChunkSize);
      chunks.push(...sentenceChunks);
    }

    if (calculateTokens(currentChunk + sentence) < maxChunkSize) {
      currentChunk += sentence + "."
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = sentence + "."; //set the new chunk to the sentence
    }
  });
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  return chunks;

  //if at the start of building a new chunk, 
  //the first sentence that has been inserted to the currentCheck is over 2000 tokens, 
  //split that sentence to chunks and insert them into the chunks array



  //return the chunks array
}
const  summariseChunk = async function  summariseChunk  (chunk, maxWords)  {
  // Creating a condition string based on the maxWords value
  let condition = '';
  if(maxWords){
    condition = `in about ${maxWords} words`;
  }
  try {
    // Making a request to the OpenAI API to summarise the chunk
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k",
      messages: [
        { role: "user", content: `Please summarise the following text ${condition}:\n"""${chunk}"""\n\nSummary:` }
      ],
      temperature: 1,
      max_tokens: 4000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    //return the summary
    return response.data.choices[0].message.content;

  } catch (error) {
    console.log("summariseChunk error", error);
    throw new Error(error);
  }
}

const summariseChunks = async(chunks) => {
  // Creating a delay function using setTimeout and Promises
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  // Summarizing each chunk by making API requests with delays in between using Promise.all
  const summarisedChunks = await Promise.all(chunks.map(async (chunk) => {
    const result = await summariseChunk(chunk);
    await delay(200);
    return result;
  }));

  // Concatenating the summarization results into a single string
  const concatenatedText = summarisedChunks.join(" ");

  // Returning the concatenated summarization text
  return concatenatedText;
}



app.post('/api/pdfsummary', upload.single('pdf'), async (req, res) => {
  try {
    // res.json({ file: req.file, body: req.body });
    const { maxWords } = req.body;
    const pdfFile = req.file;

    //extract text from the pdf file
    const pdfExtract = new PDFExtract();

    const extractOptions = {
      firstPage: 1,
      lastPage: undefined,
      password: '',
      verbosity: -1,
      normalizeWhitespace: false,
      disableCombinedTextItems: false
    }

    const data = await pdfExtract.extract(pdfFile.path, extractOptions);

    const pdfText = data.pages.map(page => page.content.map(item => item.str).join(' ')).join(' ');

    //if there is no text extracted return an error
    if (pdfText.length === 0) {
      res.json({ error: "Text could not be extracted from this PDF. Please try another PDF." });
      return;
    }

    // const chunks = splitTextIntoChunks(pdfText, 2000);
    // const tokens = chunks.map(chunk => encode(chunk).length);
    // res.json({ chunks, tokens });

    let summarisedText = pdfText;

    const maxToken = 2000;
    while(calculateTokens(summarisedText) > maxToken){
      const newChunks = splitTextIntoChunks(summarisedText,maxToken);
      summarisedText = await summariseChunks(newChunks);
    }

    summarisedText = await summariseChunk(summarisedText, maxWords);

    res.json({ summarisedText });

  } catch (error) {
    console.error('An error occured:', error);
    res.status(500).json({ error });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));