const express = require("express");
const dotenv = require("dotenv");
const app = express();

// app.use(express.json());//accept json data in requests

//environment variables
dotenv.config();

//OpenAIApi Configuration
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

//***************************************************************//
//********************* pdf summary project *********************//
//***************************************************************//
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

const summariseChunk = async function summariseChunk(chunk, maxWords) {
  // Creating a condition string based on the maxWords value
  let condition = '';
  if (maxWords) {
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

const summariseChunks = async (chunks) => {
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

app.post('/api/pdfsummary', express.json(), upload.single('pdf'), async (req, res) => {
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
    while (calculateTokens(summarisedText) > maxToken) {
      const newChunks = splitTextIntoChunks(summarisedText, maxToken);
      summarisedText = await summariseChunks(newChunks);
    }

    summarisedText = await summariseChunk(summarisedText, maxWords);

    res.json({ summarisedText });

  } catch (error) {
    console.error('An error occured:', error);
    res.status(500).json({ error });
  }
});





//***********************************************************//
//********************* Chatbot project *********************//
//***********************************************************//
//runCompletion
async function runCompletion(messages) {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-16k",
    messages,
    temperature: 1,
    max_tokens: 50,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  return response;
}

app.post('/api/chatbot', express.json(), async (req, res) => {
  try {
    const { messages } = req.body;


    // Pass the request text to the runCompletion function
    const completion = await runCompletion(messages);

    // Return the completion as a JSON response
    res.json({ data: completion.data });
  } catch (error) {
    console.error('An error occured', error)
    res.status(500).json({
      error: {
        message: 'An error occurred during your request.',
      }
    });
  }
});

//*********************************************************************************//
//****************** Embeddings and Book Recommendations project ******************//
//*********************************************************************************//

//import functions
const getEmbedding = require('./utils/getEmbedding.js');
const getEmbeddings = require('./utils/getEmbeddings.js');
const cosineSimilarity = require('./utils/cosineSimilarity.js');
const findNearestNeighbours = require('./utils/nearestNeighbours.js');

app.post('/api/similarity', express.json(), async (req, res) => {
  try {
    const { text1, text2 } = req.body;

    //embedding 1
    const embedding1 = await getEmbedding(text1);
    //embedding 2
    const embedding2 = await getEmbedding(text2);
    //similarity
    const similarity = cosineSimilarity(embedding1, embedding2);

    res.json({ similarity, embedding1, embedding2 });

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

app.post('/api/books', express.json(), async (req, res) => {
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

    res.json({ nearestNeighbours });

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


//***********************************************************//
//********************* PDFChat project *********************//
//***********************************************************//

const upload2 = multer({ dest: path.join(__dirname, 'chatwithpdf') });
app.post('/api/chatwithpdf', express.json(), upload2.single('pdf'), async (req, res) => {
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

    // Split the PDF text into chunks
    const chunks = splitTextIntoChunks(pdfText, 512);

    //generate a random table name of 10 characters.
    const generateRandomTableName = require('./PDF_utils/generateRandomTableName');
    const table_name = generateRandomTableName();

    //calculate embeddings of the chunks and store them inside a table
    const createEmbeddings = require('./PDF_utils/createEmbeddings');
    await createEmbeddings(chunks, table_name);

    // Return a JSON response with the table name and original name of the pdf file
    res.json({ table_name, filename: pdfFile.originalname });

  } catch (error) {
    console.error('An error occured:', error);
    res.status(500).json({ error });
  }
});

app.post('/api/chatwithPDF2', express.json(), async (req, res) => {
  try {
    const { text, tableName } = req.body;

    async function runCompletion2(text, context) {
      console.log(context);
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-16k",
        messages: [{ role: "system", content: `Answer questions based on information included in the provided context. If the information is not available in the provided context, answer saying that the information is not available in the PDF document. Here is the context: ###${context}###` },
        { role: "user", content: text }],
        temperature: 1,
        max_tokens: 200,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      return response;
    }

    //get embedding of text
    const getEmbedding = require('./PDF_utils/getEmbedding');
    const embedding = await getEmbedding(text);

    //get embeddings from the tableName table
    const getEmbeddings = require('./PDF_utils/getEmbeddings');
    const embeddings = await getEmbeddings(tableName);


    //find nearest neighbours
    const findNearestNeighbors = require('./PDF_utils/nearestNeighbours.js')
    const nearestNeighbours = findNearestNeighbors({ embedding, embeddings, k: 3 });

    //build the context
    const contextArray = [];
    nearestNeighbours.forEach((neighbour, index) => {
      contextArray.push(`abstract ${index + 1}: """${neighbour?.text || ''}"""`);
    })

    const context = contextArray.join(' ');

    // Pass the request text and context to the runCompletion function
    const completion = await runCompletion2(text, context);

    // Return the completion as a JSON response
    res.json({ data: completion.data });
  } catch (error) {
    console.error('An error occured', error)
    res.status(500).json({
      error: {
        message: 'An error occurred during your request.',
      }
    });
  }
});

//*********************************************************************//
//********************* DALLE Image Generation v1 *********************//
//*********************************************************************//

app.post('/api/createimages', express.json(), async (req, res) => {
  //extract the text input from the request body
  const { text } = req.body;
  //createImages
  async function createImages(prompt) {
    const response = await openai.createImage({
      prompt: text,
      n: 3,
      size: "1024x1024",
      response_format: "url" //default
    });
    return response;
  }
  try {
    const { text } = req.body;


    // Pass the request text to the runCompletion function
    const output = await createImages(text);

    // Return the completion as a JSON response
    res.json(output.data);
  } catch (error) {
    console.error('An error occured:', error);
    res.status(500).json({ error });
  }
});

//*********************************************************************//
//********************* DALLE Image Storage v1 ************************//
//*********************************************************************//

const fs = require('fs');
const axios = require('axios');
app.post('/api/saveimage', express.json(), async (req, res) => {
  // Create the directory dalle_images if it doesn't exist
  const imageDirectory = path.join(__dirname, "dalle_images");
  if (!fs.existsSync(imageDirectory)) {
    fs.mkdirSync(imageDirectory);
  }

  try {
    // Extract the fileName and imageUrl from the request body
    console.log(req);
    const { fileName, imgURL } = req.body;

    // Construct the image path using the imageDirectory and fileName
    const imagePath = path.join(imageDirectory, fileName);

    // Check if the file already exists
    const fileExists = fs.existsSync(imagePath);
    console.log(imagePath);

    if (fileExists) {
      // Throw an error if an image with the same name already exists
      throw new Error("Image with the same name already exists")
    }



    // Create a writable stream for the image file using the image path
    const writer = fs.createWriteStream(path.join(imageDirectory, fileName));

    // Fetch the image from the imageUrl using axios 
    //with the responseType set to 'stream'
    const response = await axios({
      method: 'GET',
      url: imgURL,
      responseType: 'stream'
    });


    if (response.status !== 200) {
      // Throw an error if the image fetching failed
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }



    // Set up event handlers for the finish and error events of the writable stream

    writer.on('finish', () => {
      // Handle the finish event, which indicates that the image has been saved successfully
      console.log('Image saved successfully: ', fileName);
      res.json({ message: 'Image saved successfully' });
    });


    writer.on('error', (err) => {// Handle any errors that occur during the writing process
      console.log('Error saving the image ', err.message);
      throw new Error(err.message);
    });


    // Pipe the response data stream to the writable stream to save the image
    response.data.pipe(writer);


  } catch (error) {
    // Handle any errors that occur during the image saving process
    console.error('An error occured:', error);
    res.status(500).json({ error });
  }
});

//*********************************************************************//
//********************* DALLE Image Editing ***************************//
//*********************************************************************//

const bodyParser = require('body-parser');
const sharp = require('sharp');


app.post('/api/editimage', bodyParser.json({ limit: '50mb' }), async (req, res) => {
  const { loadImage, createCanvas } = require('canvas');
  try {
    //extract imageURL, points and prompt from the request body
    const { imageURL, points, prompt } = req.body;

    //create a directory to store original images
    const imageDirectory = path.join(__dirname, 'dalle_edit');

    //create a random name for the original image made of 13 characters + timestamp
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const imageName = `${timestamp}_${randomString}`;

    //build the original image path using the image name
    const originalImagePath = path.join(imageDirectory, `${imageName}_original.png`);

    //save the original image to the original image path built above
    const imageBuffer = await axios.get(imageURL, { responseType: 'arraybuffer' });
    fs.writeFileSync(originalImagePath, Buffer.from(imageBuffer.data, 'binary'));

    // Load the image using the canvas library
    const image = await loadImage(originalImagePath);

    // Create a canvas of the same dimensions as the image
    const canvas = createCanvas(image.width, image.height);

    //create a drawing context
    const ctx = canvas.getContext('2d');

    // Draw the original image on the canvas
    ctx.drawImage(image, 0, 0);

    // Create a path using the mask points received from the request body
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.closePath();

    // Apply the mask by setting the path as a clipping region
    ctx.clip();

    // Clear the masked area to make it fully transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save the modified image to the specified file path
    const imagePath = path.join(imageDirectory, `${imageName}.png`);
    const writer = fs.createWriteStream(imagePath);
    const stream = canvas.createPNGStream();
    stream.pipe(writer);

    // Set up event handlers for the finish and error events of the writable stream

    writer.on('finish', async () => {
      // Handle the finish event, which indicates that the image has been saved successfully
      console.log('Image masked successfully', imagePath);

      async function run(prompt, imagePath) {
        // Convert the input image to RGBA format
        const convertedImagePath = imagePath.replace('.png', '_rgba.png');
        await sharp(imagePath).ensureAlpha().toFile(convertedImagePath);
        const response = await openai.createImageEdit(
          fs.createReadStream(convertedImagePath),
          prompt,
          // undefined,
          // 3
        );
        //Deleted the converted image file after processing
        fs.unlinkSync(convertedImagePath);

        return response;
      }
      try {
        // Send request to OPENAI to edit the masked image
        const output = await run(prompt, imagePath);

        // Return the output as a JSON response
        console.log(output.data);
        res.json(output.data);
      } catch (error) {
        console.log("error: ", error);
        res.status(500).json(error);
      }

    });


    writer.on('error', (err) => {// Handle any errors that occur during the writing process
      console.log('Error saving the image ', err.message);
      throw new Error(err.message);
    });


  } catch (error) {
    console.error('An error occured:', error);
    res.status(500).json({ error });
  }
});

//*********************************************************************//
//********************* DALLE Image Variations ************************//
//*********************************************************************//

app.post('/api/imagevariations', bodyParser.json({ limit: '50mb' }),async (req, res) => {

  try {
    //extract imageURL, points and prompt from the request body
    const { imageURL, points, prompt } = req.body;

    //create a directory to store original images
    const imageDirectory = path.join(__dirname, 'dalle_variations');

    //create a random name for the original image made of 13 characters + timestamp
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const imageName = `${timestamp}_${randomString}`;

    //build the original image path using the image name
    const originalImagePath = path.join(imageDirectory, `${imageName}_original.png`);

    //save the original image to the original image path built above
    const imageBuffer = await axios.get(imageURL, { responseType: 'arraybuffer' });
    fs.writeFileSync(originalImagePath, Buffer.from(imageBuffer.data, 'binary'));




    async function run(prompt, imagePath) {
      // Convert the input image to RGBA format
      const convertedImagePath = imagePath.replace('.png', '_rgba.png');
      await sharp(imagePath).ensureAlpha().toFile(convertedImagePath);
      const response = await openai.createImageVariation(
        fs.createReadStream(convertedImagePath),
        3
      );
      //Deleted the converted image file after processing
      fs.unlinkSync(convertedImagePath);

      return response;
    }
    try {
      // Send request to OPENAI to edit the masked image
      const output = await run(prompt, originalImagePath);

      // Return the output as a JSON response
      console.log(output.data);
      res.json(output.data);
    } catch (error) {
      console.log("error: ", error);
      res.status(500).json(error);
    }



  } catch (error) {
    console.error('An error occured:', error);
    res.status(500).json({ error });
  }
});


//***********************************************************************//
//********************* Whisper Transcribe Audio ************************//
//***********************************************************************//

//Upload middleware which will handle the file uplaods to the whisper folder
const upload3 = multer({dest: path.join(__dirname, 'whisper')});
app.post('/api/whisper', upload3.single('audio'), async (req, res) => {
  try {
    // Extract language and prompt from the request body
    const {language, prompt} = req.body;

    // Log the uploaded file information (for debugging purposes)
    console.log(req.file);

    // Extract the path and original name of the uploaded audio file
    const {path: audioPath, originalname: originalFileName} = req.file;

    // Log the temporary path of the uploaded audio file (for debugging purposes)
    console.log(audioPath);

    // Get the file extension from the original file name
    const fileExtension = path.extname(originalFileName);

    // Generate a random file name and combine it with the file extension
    const randomFileName = `${Math.random().toString(36).substring(2)}${fileExtension}`;
    
    // Create a new path for the audio file in the 'whisper' directory
    const newPath = path.join(__dirname, 'whisper', randomFileName);

    // Move the uploaded file to the new path
    await fs.promises.rename(audioPath, newPath);

    // Log the new path of the audio file (for debugging purposes)
    console.log(newPath);

    // Create a function run that sends the transcription request to OPENAI
    async function run(newPath){
      const response = await openai.createTranscription(
        fs.createReadStream(newPath),
        'whisper-1',
        prompt,
        undefined,
        undefined,
        language
      );
      return response;
    }

    // Pass the new audio file path to the run function
    const output = await run(newPath);


    // Return the output as a JSON response
    console.log(output.data);
    res.json(output.data);
    
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ error: 'Transcription failed.' });
  }
});
app.post('/api/whisper2', upload3.single('audio'), async (req, res) => {
  try {
    // Extract language and prompt from the request body
    const {prompt} = req.body;

    // Log the uploaded file information (for debugging purposes)
    console.log(req.file);

    // Extract the path and original name of the uploaded audio file
    const {path: audioPath, originalname: originalFileName} = req.file;

    // Log the temporary path of the uploaded audio file (for debugging purposes)
    console.log(audioPath);

    // Get the file extension from the original file name
    const fileExtension = path.extname(originalFileName);

    // Generate a random file name and combine it with the file extension
    const randomFileName = `${Math.random().toString(36).substring(2)}${fileExtension}`;
    
    // Create a new path for the audio file in the 'whisper' directory
    const newPath = path.join(__dirname, 'whisper', randomFileName);

    // Move the uploaded file to the new path
    await fs.promises.rename(audioPath, newPath);

    // Log the new path of the audio file (for debugging purposes)
    console.log(newPath);

    // Create a function run that sends the transcription request to OPENAI
    async function run(newPath){
      const response = await openai.createTranslation(
        fs.createReadStream(newPath),
        'whisper-1',
        prompt,
        undefined,
        undefined
      );
      return response;
    }

    // Pass the new audio file path to the run function
    const output = await run(newPath);


    // Return the output as a JSON response
    console.log(output.data);
    res.json(output.data);
    
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ error: 'Transcription failed.' });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));