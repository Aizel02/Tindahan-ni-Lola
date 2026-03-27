import { BrainCircuit } from "lucide-react";
import { useState } from "react";

export default function AIInsights({ products = [], debts = [] }) {

  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState("");
  const [error, setError] = useState("");

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
        "https://ljtwvvvtdjhchnfbwvhz.supabase.co/functions/v1/ai-insights",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json",

            // Supabase auth
            "apikey":"sb_publishable_7Qua1GzyLUDXRVq2jRhOqQ_0--ukgHk",
            "Authorization":"Bearer sb_publishable_7Qua1GzyLUDXRVq2jRhOqQ_0--ukgHk"
          },
          body: JSON.stringify({
            products,
            debts
          })
        }
      );

      const data = await res.json();

      if(!res.ok){
        throw new Error(data.error || "AI error");
      }

      setInsight(data.result || "No insight generated.");

    }catch(err){

      console.log("AI ERROR:", err);

      setError("AI failed to analyze data. Try again.");

    }

    setLoading(false);

  };

  return(

    <div className="ai-box">

      <div className="ai-title">
        <BrainCircuit size={22}/>
        <span>AI Insights</span>
      </div>

      <button
        className="ai-button"
        onClick={runAI}
        disabled={loading}
      >

        {loading ? "Analyzing..." : "Generate AI Insights"}

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