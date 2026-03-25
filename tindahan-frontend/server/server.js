require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");
const cors = require("cors");

const app = express();

/* allow frontend requests */
app.use(cors());

/* allow json body */
app.use(express.json());


/* connect to OpenAI using env key */
const openai = new OpenAI({

 apiKey: process.env.OPENAI_API_KEY

});


/* test route */
app.get("/", (req,res)=>{

 res.send("AI server running 🚀");

});


/* AI INSIGHTS */
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

     Analyze this sari-sari store data.

     PRODUCTS:
     ${JSON.stringify(products)}

     DEBTS:
     ${JSON.stringify(debts)}

     Give insights:

     1. store summary
     2. possible popular products
     3. debt observation
     4. recommendation

     Keep answer short.

     `

    }

   ]

  });


  res.json({

   result: completion.choices[0].message.content

  });


 }catch(error){

  console.log("AI ERROR:", error);

  res.status(500).json({

   error:"AI failed to analyze data"

  });

 }

});


/* start server */
app.listen(5000, ()=>{

 console.log("AI server running on http://localhost:5000");

});