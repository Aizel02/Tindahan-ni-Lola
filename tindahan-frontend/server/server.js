require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

console.log(
  process.env.OPENAI_API_KEY
    ? "OPENAI KEY LOADED ✅"
    : "OPENAI KEY MISSING ❌"
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req,res)=>{
  res.send("AI server running 🚀");
});

app.post("/ai-insights", async (req,res)=>{

 const { products, debts } = req.body;

 try{

  const completion = await openai.chat.completions.create({

   model:"gpt-4o-mini",

   messages:[
    {
     role:"system",
     content:`
     You are an AI assistant helping analyze sari-sari store data.
     Provide simple insights that are easy to understand.
     Keep answer short and practical.
     `
    },

    {
     role:"user",
     content:`
     PRODUCTS:
     ${JSON.stringify(products)}

     DEBTS:
     ${JSON.stringify(debts)}

     Give insights:
     1. store summary
     2. popular products guess
     3. debt observation
     4. recommendation
     `
    }
   ]

  });

  res.json({
   result: completion.choices[0].message.content
  });

 }catch(error){

  console.log("AI ERROR:", error.message);

  res.status(500).json({
   error:"AI failed to analyze data"
  });

 }

});

app.listen(5000, ()=>{
 console.log("AI server running on http://localhost:5000");
});