const express = require('express');
const axios = require('axios');
const cors = require('cors')
const bodyParser = require('body-parser')

const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
dotenv.config();
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = 3000;

const openai = new OpenAIApi(configuration);
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cors({
  origin: '*'
}));

app.get('/', async (req, res) => {
    
    res.send({ data: "data"});
});

app.get('/test', async (req, res) => {
    
  res.send({ data: "test"});
});
app.post('/moderation', async (req, res) => {
    const response = await openai.createModeration({
        input: req.body.userInput,
      });
    const flagged = response.data.results[0].flagged;
      
    res.status(200).json({ flagged: flagged });
});

app.post('/short', async (req, res) => {
  
  const {userInput} = req.body;
  console.log(userInput)
 const prompt = userInput.preprompt + userInput.prompt
    const response = await openai.createCompletion({
        model: userInput.model,
        prompt: prompt,
        max_tokens: userInput.max_tokens,
        temperature:userInput.temperature,
        top_p: userInput.top_p,
        frequency_penalty: userInput.frequency_penalty,
        presence_penalty: userInput.presence_penalty,
        stream: userInput.stream,
    });

    const promptOutput = response.data.choices.pop(); 
   
    res.status(200).json({ output: promptOutput });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});