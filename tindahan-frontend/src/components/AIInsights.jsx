import { BrainCircuit } from "lucide-react";
import { useState } from "react";

import AIAnalyticsDashboard from "./AIAnalyticsDashboard";

const SUPABASE_URL =
"https://ljtwvvvtdjhchnfbwvhz.supabase.co/functions/v1/ai-insights";

const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHd2dnZ0ZGpoY2huZmJ3dmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMzI1NjMsImV4cCI6MjA4MzYwODU2M30.iuF7dowazzJnGMILsjTguNu1OguNwTpB5KZiGz6RjOk";

export default function AIInsights({

 products = [],
 debts = []

}){

 const [loading,setLoading] = useState(false);

 const [insight,setInsight] = useState("");

 const [risk,setRisk] = useState("");

 const [analytics,setAnalytics] = useState(null);

 const [warning,setWarning] = useState("");

 const [overdueList,setOverdueList] = useState([]);

 const [topCustomers,setTopCustomers] = useState([]);

 const runAI = async ()=>{

  setLoading(true);

  try{

   const res = await fetch(
    SUPABASE_URL,
    {
     method:"POST",
     headers:{
      "Content-Type":"application/json",
      "apikey":SUPABASE_KEY,
      "Authorization":`Bearer ${SUPABASE_KEY}`
     },
     body:JSON.stringify({
      products,
      debts
     })
    }
   );

   if(!res.ok){

    throw new Error("API error " + res.status);

   }

   const data = await res.json();

   setInsight(data.result || "");

   setRisk(data.risk || "");

   setAnalytics(data.analytics || null);

   setWarning(data.warning || "");

   // overdue detection
   const overdue = debts.filter(d=>

    d.status !== "Paid"
    && d.due_date
    && new Date(d.due_date) < new Date()

   );

   setOverdueList(overdue);

   // ranking personal utang
   const ranking = {};

   debts.forEach(d=>{

    if(!ranking[d.debtor_name]){

     ranking[d.debtor_name] = 0;

    }

    if(d.status !== "Paid"){

     ranking[d.debtor_name] += Number(d.amount);

    }

   });

   setTopCustomers(

    Object.entries(ranking)

    .map(([name,total])=>({

     name,
     total

    }))

    .sort((a,b)=>b.total-a.total)

   );

  }

  catch(error){

   console.error("AI error:",error);

   setInsight("AI connection failed");

  }

  setLoading(false);

 };

 return(

  <div className="ai-box">

   <div className="ai-title">

    <BrainCircuit size={20}/>

    AI Insights {risk}

   </div>

   <button
    className="ai-button"
    onClick={runAI}
   >

    {loading ? "Analyzing..." : "Generate AI Insights"}

   </button>

   {warning &&

    <div className="ai-warning">

     {warning}

    </div>

   }

   {insight &&

    <div className="ai-result">

     {insight}

    </div>

   }

   {analytics && (

    <div className="ai-reminder">

     <strong>Collection Message Suggestion</strong>

     <p>

      Hi {topCustomers[0]?.name || "po"},  
      paalala lang po sa utang nyo.  
      Sana mabayaran nyo po soon.  

      salamat po 🙏

     </p>

    </div>

   )}

   <AIAnalyticsDashboard
    analytics={analytics}
   />

   {overdueList.length>0 &&

    <div className="ai-section">

     <h3>Overdue Customers</h3>

     {overdueList.map(d=>(

      <div key={d.id}>

       {d.debtor_name} – ₱{d.amount}

      </div>

     ))}

    </div>

   }

   {topCustomers.length>0 &&

    <div className="ai-section">

     <h3>Top Personal Utang</h3>

     {topCustomers.slice(0,5).map(c=>(

      <div key={c.name}>

       {c.name} – ₱{c.total}

      </div>

     ))}

    </div>

   }

  </div>

 );

}