const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
dotenv.config();
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = 3000;

const openai = new OpenAIApi(configuration);


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/moderation', async (req, res) => {
    const response = await openai.createModeration({
        input: `Write a Job Description for a 6 years experienced Full Stack engineer with expertise in React.JS`,
      });
    const flagged = response.data.results[0].flagged;
      
    res.status(200).json({ flagged: flagged });
});

app.get('/short', async (req, res) => {
    const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `Write a Job Description for a 6 years experienced Full Stack engineer with expertise in React.JS`,
        max_tokens: 150,
        temperature: 0,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false,
    });

    const promptOutput = response.data.choices.pop(); 
   
    res.status(200).json({ output: promptOutput });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});