require("dotenv").config({ path: "./.env" });

const express = require("express");
const OpenAI = require("openai");
const cors = require("cors");

const app = express();

/* middlewares */
app.use(cors());
app.use(express.json());

/* debug check if key exists */
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

/* AI INSIGHTS ROUTE */
app.post("/ai-insights", async (req, res) => {

  try {

    const { products = [], debts = [] } = req.body;

    const completion = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      messages: [

        {
          role: "system",
          content: `
You analyze sari-sari store data.

Give SHORT insights:
• store summary
• possible popular products
• debt observation
• recommendation

Keep answer simple.
`
        },

        {
          role: "user",
          content: `
PRODUCTS:
${JSON.stringify(products)}

DEBTS:
${JSON.stringify(debts)}
`
        }

      ]

    });

    res.json({
      result: completion.choices[0].message.content
    });

  } catch (error) {

    console.log("AI ERROR:", error);

    res.status(500).json({
      error: "AI failed to analyze data"
    });

  }

});

/* start server */
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});