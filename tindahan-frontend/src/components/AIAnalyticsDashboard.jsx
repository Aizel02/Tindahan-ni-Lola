// INDUSTRY STANDARD MINISTORE AI COPILOT
// chat based analytics + dynamic widgets + risk scoring

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

const SUPABASE_KEY = "PASTE_PUBLIC_ANON_KEY";

export default function MiniStoreAI({ products = [], debts = [] }){

 const [open,setOpen] = useState(false);
 const [loading,setLoading] = useState(false);

 const [messages,setMessages] = useState([
  {
   role:"ai",
   content:"Hi 👋 I am MiniStore AI. Ask about utang, prediction, trends or customers."
  }
 ]);

 const [widgets,setWidgets] = useState([]);

 const calculateRisk = (debts)=>{

  const total = debts.reduce((a,b)=>a+Number(b.amount),0);

  const overdue = debts.filter(d=>d.status!=="Paid").length;

  const score = overdue*15 + total*0.002;

  if(score>80) return "HIGH 🔴";

  if(score>40) return "MEDIUM 🟡";

  return "LOW 🟢";

 };


 const autoWidgets = (analytics)=>{

  const w = [];

  w.push({
   type:"kpi",
   label:"Total Utang",
   value:`₱${analytics.totalUtang}`
  });

  w.push({
   type:"kpi",
   label:"Risk Level",
   value:calculateRisk(analytics.debts || [])
  });

  const monthlyData = Object.entries(analytics.monthlyTotals || {}).map(
   ([label,value])=>({label,value})
  );

  if(monthlyData.length>0){
   w.push({
    type:"line",
    title:"Utang Trend",
    data:monthlyData
   });
  }

  w.push({
   type:"area",
   title:"Prediction",
   data:[
    {label:"Current",value:analytics.totalUtang},
    {label:"Forecast",value:analytics.prediction}
   ]
  });

  return w;

 };


 const sendPrompt = async ()=>{

  if(!messages.length) return;

  const last = messages[messages.length-1];

  if(last.role!=="user") return;

  setLoading(true);

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
     prompt:last.content,
     products,
     debts
    })
   }
  );

  const data = await res.json();

  const insight = data.result || "analysis complete";

  setMessages(prev=>[
   ...prev,
   {
    role:"ai",
    content:insight
   }
  ]);

  const auto = autoWidgets({
   ...data.analytics,
   debts
  });

  setWidgets(prev=>[...prev,...auto]);

  setLoading(false);

 };


 const sendUser = (text)=>{

  setMessages(prev=>[
   ...prev,
   {
    role:"user",
    content:text
   }
  ]);

 };


 return(

 <>


 <button
  className="ai-float-btn"
  title="MiniStore AI"
  onClick={()=>setOpen(!open)}
 >
  {open ? <X size={20}/> : <BrainCircuit size={20}/>}
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
      className={`ai-msg ${m.role==="user" ? "ai-user" : "ai-bot"}`}
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


   <ChatInput
    onSend={sendUser}
    onTriggerAI={sendPrompt}
   />


  </div>

 )}


 <div className="ai-widget-area">

  {widgets.map((w,i)=>(

   <Draggable key={i}>

    <div className="ai-widget glass">

     <Widget config={w}/>

    </div>

   </Draggable>

  ))}

 </div>


 </>

 );

}


function ChatInput({ onSend,onTriggerAI }){

 const [value,setValue] = useState("");

 const send = ()=>{

  if(!value) return;

  onSend(value);

  setValue("");

  setTimeout(onTriggerAI,200);

 };

 return(

  <div className="ai-chat-input">

   <input
    value={value}
    onChange={(e)=>setValue(e.target.value)}
    placeholder="ask AI about utang..."
   />

   <button
    className="ai-send"
    onClick={send}
   >
    <Send size={16}/>
   </button>

  </div>

 );

}


function Widget({ config }){

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

      <Line dataKey="value" stroke="#6366f1" strokeWidth={3}/>

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

      <Area dataKey="value" stroke="#ef4444" fill="#fecaca"/>

     </AreaChart>

    </ResponsiveContainer>

   </>

  );

 }


 return <div>{config.text}</div>;

}
