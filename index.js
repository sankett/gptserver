const express = require('express');
var bodyParser = require('body-parser')
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const cors = require('cors');


dotenv.config();
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(bodyParser.json());


const port = 3000;

const openai = new OpenAIApi(configuration);
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

app.use(cors({
  origin: '*'
}));


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/api/moderation', async (req, res) => {  
    const response = await openai.createModeration({
        input: req.body.input,
      });    
     
    res.status(200).json({ response: response.data });
});




app.post('/api/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream'); //added
  res.setHeader('Cache-Control', 'no-cache');//added

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://api.openai.com/v1/chat/completions");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + process.env.OPENAI_API_KEY);
  let content = "";
  xhr.onreadystatechange = function () {
    if(this.readyState === 3){      
      var newData = this.responseText.substr(this.seenBytes); 
      const arr = newData.split("\n\n");          
      arr.pop();
      arr.forEach((data, index) => {                     
        if (data.indexOf("[DONE]") === -1) { 
          const currentData = data.trim().replace("data:","");  
          if(currentData !== ""){          
            const delta = JSON.parse(currentData).choices[0].delta;
            content = delta.content ? delta.content : ""; 
            res.write(`${content}`);       
          }                
        }                                        
      })
      xhr.seenBytes = this.responseText.length;
    }
    if (this.readyState === 4) {      
      res.end(); 
    }
  };

  var data = JSON.stringify({
    "model": "gpt-3.5-turbo",
    "messages": req.body.chatList,
    "stream": true
  });
  
  xhr.send(data);
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});