import { useState } from "react";

export default function AIInsights({ products, debts }) {

  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState("");

  const runAI = async () => {

    setLoading(true);

    try{

      const res = await fetch("https://tindahan-ai.onrender.com/ai-insights",{

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body: JSON.stringify({
          products,
          debts
        })

      });

      const data = await res.json();

      setInsight(data.result);

    }catch(error){

      console.log(error);

      setInsight("AI failed to analyze data.");

    }

    setLoading(false);

  };

  return(

    <div className="ai-box">

      <div className="ai-title">
        🤖 AI Insights
      </div>

      <button
        className="ai-button"
        onClick={runAI}
      >

        {loading ? "Analyzing..." : "Generate AI Insights"}

      </button>

      {insight && (

        <div className="ai-result">

          {insight}

        </div>

      )}

    </div>

  );

}