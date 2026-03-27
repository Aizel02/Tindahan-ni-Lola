import { BrainCircuit } from "lucide-react";
import { useState } from "react";

const SUPABASE_URL =
  "https://ljtwvvvtdjhchnfbwvhz.supabase.co/functions/v1/ai-insights";

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHd2dnZ0ZGpoY2huZmJ3dmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMzI1NjMsImV4cCI6MjA4MzYwODU2M30.iuF7dowazzJnGMILsjTguNu1OguNwTpB5KZiGz6RjOk";

export default function AIInsights({ products = [], debts = [] }) {

  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState("");
  const [error, setError] = useState("");

  const runAI = async () => {

    if (!products.length && !debts.length) {
      setInsight("");
      setError("Add products or debts first.");
      return;
    }

    setLoading(true);
    setInsight("");
    setError("");

    try {

      // clean data structure for AI
      const formattedProducts = products.map(p => ({
        name: p.name,
        price: p.price,
        category: p.category
      }));

      const formattedDebts = debts.map(d => ({
        name: d.debtor_name,
        amount: d.amount,
        status: d.status,
        due_date: d.due_date
      }));

      const res = await fetch(SUPABASE_URL, {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        },

        body: JSON.stringify({
          products: formattedProducts,
          debts: formattedDebts
        })

      });

      const data = await res.json();

      console.log("AI RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data.error || "AI failed");
      }

      setInsight(data.result || "AI could not generate insight.");

    } catch (err) {

      console.error("AI ERROR:", err);
      setError(err.message || "Failed to generate insight.");

    } finally {

      setLoading(false);

    }

  };

  return (

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
          {insight.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

    </div>

  );

}