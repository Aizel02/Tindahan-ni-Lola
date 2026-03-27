import { BrainCircuit } from "lucide-react";
import { useState } from "react";

export default function AIInsights({ products = [], debts = [] }) {

  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState("");
  const [error, setError] = useState("");

  const runAI = async () => {

    if (products.length === 0 && debts.length === 0) {
      setInsight("");
      setError("No data to analyze yet.");
      return;
    }

    setLoading(true);
    setError("");
    setInsight("");

    try {

      const res = await fetch(
        "https://ljtwvvvtdjhchnfbwvhz.supabase.co/functions/v1/ai-insights",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",

            // public key safe for frontend
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHd2dnZ0ZGpoY2huZmJ3dmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMzI1NjMsImV4cCI6MjA4MzYwODU2M30.iuF7dowazzJnGMILsjTguNu1OguNwTpB5KZiGz6RjOk",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHd2dnZ0ZGpoY2huZmJ3dmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMzI1NjMsImV4cCI6MjA4MzYwODU2M30.iuF7dowazzJnGMILsjTguNu1OguNwTpB5KZiGz6RjOk"
          },
          body: JSON.stringify({
            products,
            debts
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "AI error");
      }

      setInsight(data.result || "No insight generated.");

    } catch (err) {

      console.log("AI ERROR:", err);
      setError(err.message || "AI failed to analyze data. Try again.");

    }

    setLoading(false);

  };

  return (

    <div className="ai-box">

      <div className="ai-title">
        <BrainCircuit size={22} />
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
          {insight.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

    </div>

  );

}