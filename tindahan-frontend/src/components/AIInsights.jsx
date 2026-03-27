import { useState, useEffect } from "react";

export default function AIInsights({ products = [], debts = [] }) {

  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState("");
  const [error, setError] = useState("");

  /* wake up render server */
  useEffect(() => {
    fetch("https://tindahan-ai.onrender.com")
      .catch(() => {});
  }, []);

  const runAI = async () => {

    if(products.length === 0 && debts.length === 0){
      setInsight("");
      setError("No data to analyze yet.");
      return;
    }

    setLoading(true);
    setError("");
    setInsight("");

    try{

      const res = await fetch(
        "https://tindahan-ai.onrender.com/ai-insights",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body: JSON.stringify({
            products,
            debts
          })
        }
      );

      if(!res.ok){
        throw new Error("Server error");
      }

      const data = await res.json();

      setInsight(data.result || "No insight generated.");

    }catch(err){

      console.log(err);

      setError("AI failed to analyze data. Try again.");

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
        disabled={loading}
      >

        {loading ? "Analyzing data..." : "Generate AI Insights"}

      </button>

      {error && (
        <div className="ai-error">
          ⚠️ {error}
        </div>
      )}

      {insight && (
        <div className="ai-result">
          {insight.split("\n").map((line,i)=>(
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

    </div>

  );

}