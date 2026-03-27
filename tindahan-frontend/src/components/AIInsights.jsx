import { BrainCircuit } from "lucide-react";
import { useState } from "react";

const SUPABASE_URL =
  "https://ljtwvvvtdjhchnfbwvhz.supabase.co/functions/v1/ai-insights";

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHd2dnZ0ZGpoY2huZmJ3dmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMzI1NjMsImV4cCI6MjA4MzYwODU2M30.iuF7dowazzJnGMILsjTguNu1OguNwTpB5KZiGz6RjOk";

export default function AIInsights({ products = [], debts = [] }) {

  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState("");
  const [risk, setRisk] = useState("🟢");
  const [error, setError] = useState("");

  const runAI = async () => {

    if (!products.length && !debts.length) {
      setError("No data yet.");
      return;
    }

    setLoading(true);
    setError("");
    setInsight("");

    try {

      const today = new Date();

      const formattedProducts = products.map(p => ({
        name: p.name,
        price: p.price,
        category: p.category
      }));

      const formattedDebts = debts.map(d => {

        const dueDate = d.due_date ? new Date(d.due_date) : null;

        const isOverdue =
          dueDate &&
          dueDate < today &&
          d.status !== "Paid";

        return {
          name: d.debtor_name,
          amount: d.amount,
          status: d.status,
          due_date: d.due_date,
          overdue: isOverdue
        };

      });

      const res = await fetch(SUPABASE_URL, {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        },

        body: JSON.stringify({

          products: formattedProducts,

          debts: formattedDebts,

          summary: {

            totalProducts: formattedProducts.length,

            totalDebt: formattedDebts
              .filter(d => d.status !== "Paid")
              .reduce((sum, d) => sum + Number(d.amount), 0),

            overdueCount:
              formattedDebts.filter(d => d.overdue).length

          }

        })

      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      const aiText =
        data.result ||
        "AI could not generate insight.";

      setInsight(aiText);

      // risk indicator logic
      const overdue =
        formattedDebts.filter(d => d.overdue).length;

      if (overdue >= 3) setRisk("🔴");
      else if (overdue > 0) setRisk("🟡");
      else setRisk("🟢");

    } catch (err) {

      console.error(err);
      setError("AI failed.");

    }

    setLoading(false);

  };

  return (

    <div className="ai-box">

      <div className="ai-title">
        <BrainCircuit size={22}/>
        <span>AI Insights {risk}</span>
      </div>

      <button
        className="ai-button"
        onClick={runAI}
        disabled={loading}
      >

        {loading
          ? "Analyzing store data..."
          : "Generate AI Insights"}

      </button>

      {error && (
        <div className="ai-error">
          ⚠️ {error}
        </div>
      )}

      {insight && (

        <div className="ai-result">

          {insight
            .split("\n")
            .map((line,i)=>(

              <div key={i}>
                {line}
              </div>

            ))}

        </div>

      )}

    </div>

  );

}