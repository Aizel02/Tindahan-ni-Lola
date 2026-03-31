require("dotenv").config({ path: "./.env" });

const express = require("express");
const OpenAI = require("openai");
const cors = require("cors");

const app = express();

/* middlewares */
app.use(cors());
app.use(express.json());

/* check API key */
if (!process.env.OPENAI_API_KEY) {
 console.log("OPENAI KEY MISSING ❌");
} else {
 console.log("OPENAI KEY LOADED ✅");
}

/* connect to OpenAI */
const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY
});

/* test route */
app.get("/", (req, res) => {
 res.send("AI server running 🚀");
});

/* AI ASSISTANT ROUTE */
app.post("/ai-insights", async (req, res) => {

 try {

  /* get data from frontend */
  const {
   prompt,
   products = [],
   debts = []
  } = req.body;

  /* ask AI */
  const completion =
   await openai.chat.completions.create({

   model: "gpt-4o-mini",

   messages: [

    {
     role: "system",
     content: `
You are an AI assistant for a sari-sari store owner.

You help analyze:

• customer utang
• total utang
• overdue payments
• payment trends
• frequent borrowers
• who to follow up

You understand:
- Taglish
- English
- small typos

Rules:
- answer ONLY based on given data
- compute totals if needed
- identify patterns
- give short clear answers
- if no data found, say "no record found"
`
    },

    {
     role: "user",
     content: `

USER QUESTION:
${prompt}

STORE DATA:

PRODUCTS:
${JSON.stringify(products)}

DEBTS:
${JSON.stringify(debts)}

`
    }

   ]

  });

  /* send response to frontend */
  res.json({

   text:
    completion
    .choices[0]
    .message.content

  });

 }

 catch (error) {

  console.log("AI ERROR:", error);

  res.status(500).json({

   text: "AI error"

  });

 }

});

/* start server */
const PORT = 5000;

app.listen(PORT, () => {

 console.log(
  `AI server running on http://localhost:${PORT}`
 );

});