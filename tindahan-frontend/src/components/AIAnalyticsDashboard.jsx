import { useState } from "react";
import { BrainCircuit, Send } from "lucide-react";
import {
 ResponsiveContainer,
 LineChart,
 Line,
 XAxis,
 YAxis,
 Tooltip,
 CartesianGrid,
 BarChart,
 Bar,
 AreaChart,
 Area
} from "recharts";

const SUPABASE_URL = "https://ljtwvvvtdjhchnfbwvhz.supabase.co/functions/v1/ai-insights";

const SUPABASE_KEY = "PASTE_YOUR_PUBLIC_ANON_KEY_HERE";

export default function AIChatDashboard({ products = [], debts = [] }) {
 const [messages, setMessages] = useState([
  {
   role: "ai",
   content: "Hi 👋 Ask me anything about utang, sales, trends, prediction or customers."
  }
 ]);

 const [input, setInput] = useState("");
 const [widgets, setWidgets] = useState([]);
 const [loading, setLoading] = useState(false);

 const sendPrompt = async () => {
  if (!input) return;

  const userMsg = { role: "user", content: input };

  setMessages(prev => [...prev, userMsg]);
  setInput("");
  setLoading(true);

  try {
   const res = await fetch(SUPABASE_URL, {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
     apikey: SUPABASE_KEY,
     Authorization: `Bearer ${SUPABASE_KEY}`
    },
    body: JSON.stringify({
     prompt: input,
     products,
     debts
    })
   });

   const data = await res.json();

   setMessages(prev => [
    ...prev,
    {
     role: "ai",
     content: data.text || "Here is what I found."
    }
   ]);

   if (data.widgets) {
    setWidgets(prev => [...prev, ...data.widgets]);
   }
  } catch (err) {
   console.log(err);
  }

  setLoading(false);
 };

 return (
  <div className="grid grid-cols-2 gap-4 h-screen p-6 bg-slate-950 text-white">
   {/* CHAT */}
   <div className="bg-slate-900 rounded-2xl p-4 flex flex-col shadow-lg">
    <div className="flex items-center gap-2 mb-4">
     <BrainCircuit />
     <h2 className="text-lg font-semibold">AI Copilot</h2>
    </div>

    <div className="flex-1 overflow-y-auto space-y-3">
     {messages.map((m, i) => (
      <div
       key={i}
       className={`p-3 rounded-xl max-w-[80%] ${
        m.role === "user"
         ? "bg-indigo-600 ml-auto"
         : "bg-slate-800"
       }`}
      >
       {m.content}
      </div>
     ))}

     {loading && (
      <div className="bg-slate-800 p-3 rounded-xl w-fit">
       analyzing...
      </div>
     )}
    </div>

    <div className="flex gap-2 mt-4">
     <input
      value={input}
      onChange={e => setInput(e.target.value)}
      placeholder="ask AI... show utang trend"
      className="flex-1 bg-slate-800 p-3 rounded-xl"
     />

     <button
      onClick={sendPrompt}
      className="bg-indigo-600 px-4 rounded-xl"
     >
      <Send size={18} />
     </button>
    </div>
   </div>

   {/* WIDGETS */}
   <div className="space-y-4 overflow-y-auto">
    {widgets.map((w, i) => (
     <Widget key={i} config={w} />
    ))}
   </div>
  </div>
 );
}

function Widget({ config }) {
 if (config.type === "kpi") {
  return (
   <div className="bg-slate-900 p-4 rounded-2xl shadow">
    <p className="text-sm text-slate-400">{config.label}</p>
    <h2 className="text-2xl">{config.value}</h2>
   </div>
  );
 }

 if (config.type === "line") {
  return (
   <div className="bg-slate-900 p-4 rounded-2xl shadow">
    <h3>{config.title}</h3>

    <ResponsiveContainer width="100%" height={260}>
     <LineChart data={config.data}>
      <CartesianGrid />
      <XAxis dataKey="label" />
      <YAxis />
      <Tooltip />
      <Line dataKey="value" stroke="#6366f1" strokeWidth={3} />
     </LineChart>
    </ResponsiveContainer>
   </div>
  );
 }

 if (config.type === "bar") {
  return (
   <div className="bg-slate-900 p-4 rounded-2xl shadow">
    <h3>{config.title}</h3>

    <ResponsiveContainer width="100%" height={260}>
     <BarChart data={config.data}>
      <CartesianGrid />
      <XAxis dataKey="label" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" />
     </BarChart>
    </ResponsiveContainer>
   </div>
  );
 }

 if (config.type === "area") {
  return (
   <div className="bg-slate-900 p-4 rounded-2xl shadow">
    <h3>{config.title}</h3>

    <ResponsiveContainer width="100%" height={260}>
     <AreaChart data={config.data}>
      <CartesianGrid />
      <XAxis dataKey="label" />
      <YAxis />
      <Tooltip />
      <Area dataKey="value" stroke="#ef4444" fill="#fecaca" />
     </AreaChart>
    </ResponsiveContainer>
   </div>
  );
 }

 return null;
}
