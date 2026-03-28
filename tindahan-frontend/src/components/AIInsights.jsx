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

const SUPABASE_URL =
"https://ljtwvvvtdjhchnfbwvhz.supabase.co/functions/v1/ai-insights";

const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHd2dnZ0ZGpoY2huZmJ3dmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMzI1NjMsImV4cCI6MjA4MzYwODU2M30.iuF7dowazzJnGMILsjTguNu1OguNwTpB5KZiGz6RjOk";

export default function MiniStoreAI({ debts=[] }){

 const [open,setOpen]=useState(false);
 const [loading,setLoading]=useState(false);
 const [input,setInput]=useState("");

 const [messages,setMessages]=useState([
  {
   role:"ai",
   content:
   "Hi 👋 pwede mo itanong:\n• utang ni kuya\n• overdue list\n• sino dapat singilin\n• total utang\n• utang trend"
  }
 ]);

 const [widgets,setWidgets]=useState([]);

 const sendPrompt=async(promptText)=>{

  if(!promptText) return;

  setLoading(true);

  try{

   const res=await fetch(
    SUPABASE_URL,
    {
     method:"POST",
     headers:{
      "Content-Type":"application/json",
      "apikey":SUPABASE_KEY,
      "Authorization":`Bearer ${SUPABASE_KEY}`
     },
     body:JSON.stringify({
      prompt:promptText,
      debts
     })
    }
   );

   const data=await res.json();

   setMessages(prev=>[
    ...prev,
    {
     role:"ai",
     content:data.text
    }
   ]);

   setWidgets(data.widgets || []);

  }

  catch{

   setMessages(prev=>[
    ...prev,
    {
     role:"ai",
     content:"AI error"
    }
   ]);

  }

  setLoading(false);

 };

 const sendMessage=()=>{

  if(!input) return;

  setMessages(prev=>[
   ...prev,
   {
    role:"user",
    content:input
   }
  ]);

  sendPrompt(input);

  setInput("");

 };

 const removeWidget=(index)=>{

  setWidgets(prev=>
   prev.filter((_,i)=>i!==index)
  );

 };

 return(

 <>

 <button
  className="ai-float-btn"
  title="MiniStore AI"
  onClick={()=>setOpen(!open)}
 >
  {open ? <X/> : <BrainCircuit/>}
 </button>

 {open && (

 <div className="ai-chat-window glass">

 <div className="ai-chat-header">
  <BrainCircuit size={16}/>
  MiniStore AI
 </div>

 <div className="ai-chat-body">

 {messages.map((m,i)=>(

 <div
  key={i}
  className={`ai-msg ${
   m.role==="user"
   ? "ai-user"
   : "ai-bot"
  }`}
 >

  {m.content}

 </div>

 ))}

 {loading && (
  <div className="ai-msg ai-bot">
   analyzing...
  </div>
 )}

 </div>

 <div className="ai-chat-input">

 <input
  value={input}
  onChange={(e)=>setInput(e.target.value)}
  placeholder="ask AI..."
 />

 <button
  className="ai-send"
  onClick={sendMessage}
 >
  <Send size={16}/>
 </button>

 </div>

 </div>

 )}

 <div className="ai-widget-area">

 {widgets.map((w,i)=>(

 <Draggable key={i}>

 <div className="ai-widget glass">

 <button
  onClick={()=>removeWidget(i)}
  style={{
   position:"absolute",
   top:6,
   right:6,
   background:"none",
   border:"none",
   color:"#94a3b8",
   cursor:"pointer"
  }}
 >
  ✕
 </button>

 <Widget config={w}/>

 </div>

 </Draggable>

 ))}

 </div>

 </>

 );

}

function Widget({config}){

 if(config.type==="kpi"){

  return(

  <div className="ai-kpi">

   <div className="ai-kpi-label">
    {config.label}
   </div>

   <div className="ai-kpi-value">
    {config.value}
   </div>

  </div>

  );

 }

 if(config.type==="line"){

  return(

  <>

  <div className="ai-chart-title">
   {config.title}
  </div>

  <ResponsiveContainer width="100%" height={200}>

   <LineChart data={config.data}>

    <CartesianGrid/>

    <XAxis dataKey="label"/>

    <YAxis/>

    <Tooltip/>

    <Line dataKey="value"/>

   </LineChart>

  </ResponsiveContainer>

  </>

  );

 }

 if(config.type==="bar"){

  return(

  <>

  <div className="ai-chart-title">
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

  </>

  );

 }

 if(config.type==="area"){

  return(

  <>

  <div className="ai-chart-title">
   {config.title}
  </div>

  <ResponsiveContainer width="100%" height={200}>

   <AreaChart data={config.data}>

    <CartesianGrid/>

    <XAxis dataKey="label"/>

    <YAxis/>

    <Tooltip/>

    <Area dataKey="value"/>

   </AreaChart>

  </ResponsiveContainer>

  </>

  );

 }

 return null;

}