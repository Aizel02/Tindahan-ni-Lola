import { useState } from "react";
import { BrainCircuit, Send, X } from "lucide-react";
import Draggable from "react-draggable";
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

export default function MiniStoreAI({ products = [], debts = [] }) {

 const [open,setOpen] = useState(false);

 const [messages, setMessages] = useState([
  {
   role: "ai",
   content: "Hi 👋 I am MiniStore AI. Ask about utang, prediction, risk, charts, or customers."
  }
 ]);

 const [widgets, setWidgets] = useState([]);
 const [input, setInput] = useState("");
 const [loading, setLoading] = useState(false);


 const sendPrompt = async () => {

  if(!input) return;

  const userMsg = {
   role:"user",
   content:input
  };

  setMessages(prev=>[...prev,userMsg]);

  setInput("");
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
      prompt:input,
      products,
      debts
     })
    }
   );

   const data = await res.json();

   setMessages(prev=>[
    ...prev,
    {
     role:"ai",
     content:data.text || "analysis complete"
    }
   ]);

   if(data.widgets){
    setWidgets(prev=>[
     ...prev,
     ...data.widgets
    ]);
   }

  }
  catch(e){
   console.log(e);
  }

  setLoading(false);
 };


 return(
  <>


{/* FLOATING BUTTON */}

<div className="fixed bottom-6 right-6 z-50">

 <button
  title="MiniStore AI"
  onClick={()=>setOpen(!open)}
  className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:scale-105 transition"
 >
  {
   open
   ? <X size={22}/>
   : <BrainCircuit size={22}/>
  }
 </button>

</div>


{/* CHAT WINDOW */}

{open && (

<div className="fixed bottom-24 right-6 w-[420px] h-[520px] bg-slate-950 text-white rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden">


{/* HEADER */}

<div className="flex items-center gap-2 p-4 border-b border-slate-800 bg-slate-900">

 <BrainCircuit size={18}/>

 <span className="font-semibold">
  MiniStore AI
 </span>

</div>


{/* CHAT */}

<div className="flex-1 overflow-y-auto p-4 space-y-3">

 {messages.map((m,i)=>(

  <div
   key={i}
   className={`p-3 rounded-xl max-w-[80%] text-sm ${{
    user:"bg-indigo-600 ml-auto",
    ai:"bg-slate-800"
   }[m.role]}`}
  >

   {m.content}

  </div>

 ))}

 {loading && (

  <div className="bg-slate-800 p-3 rounded-xl text-sm w-fit">
   analyzing...
  </div>

 )}

</div>


{/* INPUT */}

<div className="p-3 border-t border-slate-800 flex gap-2">

 <input
  value={input}
  onChange={(e)=>setInput(e.target.value)}
  placeholder="ask AI about utang..."
  className="flex-1 bg-slate-900 p-3 rounded-xl text-sm outline-none"
 />

 <button
  onClick={sendPrompt}
  className="bg-indigo-600 px-3 rounded-xl"
 >
  <Send size={18}/>
 </button>

</div>

</div>

)}


{/* DRAGGABLE WIDGETS */}

<div className="fixed top-6 left-6 grid gap-4 z-40">

 {widgets.map((w,i)=>(

  <Draggable key={i}>

   <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl cursor-move w-[320px]">

    <Widget config={w}/>

   </div>

  </Draggable>

 ))}

</div>


</>
 );
}


function Widget({ config }){


 if(config.type==="kpi"){

  return(
   <div>

    <div className="text-xs text-slate-400">
     {config.label}
    </div>

    <div className="text-2xl mt-1">
     {config.value}
    </div>

   </div>
  );

 }


 if(config.type==="line"){

  return(
   <div>

    <div className="mb-2 text-sm">
     {config.title}
    </div>

    <ResponsiveContainer width="100%" height={200}>

     <LineChart data={config.data}>

      <CartesianGrid/>

      <XAxis dataKey="label"/>

      <YAxis/>

      <Tooltip/>

      <Line dataKey="value" stroke="#6366f1" strokeWidth={3}/>

     </LineChart>

    </ResponsiveContainer>

   </div>
  );

 }


 if(config.type==="bar"){

  return(
   <div>

    <div className="mb-2 text-sm">
     {config.title}
    </div>

    <ResponsiveContainer width="100%" height={200}>

     <BarChart data={config.data}>

      <CartesianGrid/>

      <XAxis dataKey="label"/>

      <YAxis/>

      <Tooltip/>

      <Bar dataKey="value"/>

     </BarChart>

    </ResponsiveContainer>

   </div>
  );

 }


 if(config.type==="area"){

  return(
   <div>

    <div className="mb-2 text-sm">
     {config.title}
    </div>

    <ResponsiveContainer width="100%" height={200}>

     <AreaChart data={config.data}>

      <CartesianGrid/>

      <XAxis dataKey="label"/>

      <YAxis/>

      <Tooltip/>

      <Area dataKey="value" stroke="#ef4444" fill="#fecaca"/>

     </AreaChart>

    </ResponsiveContainer>

   </div>
  );

 }


 return(
  <div className="text-sm">
   {config.text}
  </div>
 );

}
