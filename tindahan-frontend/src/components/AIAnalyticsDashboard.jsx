import { useState, useEffect, useRef } from "react";
import { BrainCircuit, Send, X, Download } from "lucide-react";
import Draggable from "react-draggable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
 ResponsiveContainer,
 LineChart,
 Line,
 XAxis,
 YAxis,
 Tooltip,
 CartesianGrid,
 BarChart,
 Bar
} from "recharts";


const SUPABASE_URL =
"https://ljtwvvvtdjhchnfbwvhz.supabase.co/functions/v1/ai-insights";

const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHd2dnZ0ZGpoY2huZmJ3dmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMzI1NjMsImV4cCI6MjA4MzYwODU2M30.iuF7dowazzJnGMILsjTguNu1OguNwTpB5KZiGz6RjOk";


export default function MiniStoreAI({ debts = [] }) {

 const [open, setOpen] = useState(false);
 const [input, setInput] = useState("");
 const [loading, setLoading] = useState(false);
 const [widgets, setWidgets] = useState([]);


 /* CHAT HISTORY */

 const [messages, setMessages] = useState(() => {

  const saved = localStorage.getItem("mini_ai_chat");

  return saved
   ? JSON.parse(saved)
   : [
      {
       role: "ai",
       content:
`Hi 👋 pwede mo itanong:

• pending utang
• utang ni kuya
• overdue utang
• sino dapat singilin
• utang trend`
      }
     ];

 });


 useEffect(() => {

  localStorage.setItem(
   "mini_ai_chat",
   JSON.stringify(messages)
  );

 }, [messages]);


 /* SEND PROMPT */

 const sendPrompt = async (prompt) => {

  setLoading(true);

  try {

   const res = await fetch(

    SUPABASE_URL,

    {
     method: "POST",

     headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
     },

     body: JSON.stringify({
      prompt,
      debts
     })

    }

   );


   const data = await res.json();


   setMessages(prev => [

    ...prev,

    {
     role: "ai",
     content: data.text || "No result"
    }

   ]);


   setWidgets(data.widgets || []);

  }

  catch {

   setMessages(prev => [

    ...prev,

    {
     role: "ai",
     content: "AI connection error"
    }

   ]);

  }

  setLoading(false);

 };


 const sendMessage = () => {

  if (!input.trim()) return;


  setMessages(prev => [

   ...prev,

   {
    role: "user",
    content: input
   }

  ]);


  sendPrompt(input);


  setInput("");

 };


 const removeWidget = (index) => {

  setWidgets(prev =>
   prev.filter((_, i) => i !== index)
  );

 };


 /* EXPORT TO EXCEL */

 const exportExcel = () => {

  const rows = [];


  widgets.forEach(w => {

   if (w.type === "kpi") {

    rows.push({

     metric: w.label,
     value: w.value

    });

   }


   if (w.data) {

    w.data.forEach(d => {

     rows.push({

      chart: w.title,
      label: d.label,
      value: d.value

     });

    });

   }

  });


  const sheet =
   XLSX.utils.json_to_sheet(rows);


  const workbook =
   XLSX.utils.book_new();


  XLSX.utils.book_append_sheet(

   workbook,
   sheet,
   "AI Report"

  );


  const file =
   XLSX.write(

    workbook,

    {
     bookType: "xlsx",
     type: "array"
    }

   );


  saveAs(

   new Blob([file]),

   "MiniStoreAI.xlsx"

  );

 };


 return (

 <>

 {/* FLOAT BUTTON */}

 <button
  className="ai-float-btn"
  onClick={() => setOpen(!open)}
 >

  {open ? <X /> : <BrainCircuit />}

 </button>



 {/* CHAT WINDOW */}

 {open && (

 <div className="ai-chat-window glass">

 <div className="ai-chat-header">

  <BrainCircuit size={16} />

  MiniStore AI


  <Download
   size={16}
   style={{ marginLeft: "auto", cursor: "pointer" }}
   onClick={exportExcel}
  />

 </div>



 <div className="ai-chat-body">

 {messages.map((msg, i) => (

 <div
  key={i}
  className={`ai-msg ${
   msg.role === "user"
    ? "ai-user"
    : "ai-bot"
  }`}
 >

  {msg.content}

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
  onChange={(e) =>
   setInput(e.target.value)
  }
  placeholder="ask AI..."
 />


 <button
  className="ai-send"
  onClick={sendMessage}
 >

  <Send size={16} />

 </button>


 </div>

 </div>

 )}



 {/* AI WIDGETS */}

 <div className="ai-widget-area">

 {widgets.map((widget, i) => {

 const nodeRef = useRef(null);

 return (

 <Draggable
  key={i}
  nodeRef={nodeRef}
 >

 <div
  ref={nodeRef}
  className="ai-widget glass"
 >

 <button
  onClick={() => removeWidget(i)}
  style={{
   position: "absolute",
   top: 6,
   right: 6,
   border: "none",
   background: "none",
   color: "#94a3b8",
   cursor: "pointer"
  }}
 >

  ✕

 </button>


 <Widget config={widget} />

 </div>

 </Draggable>

 );

 })}

 </div>

 </>

 );

}



/* WIDGET DISPLAY */

function Widget({ config }) {


 if (config.type === "kpi") {

  return (

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



 if (config.type === "line") {

  return (

  <>

  <div className="ai-chart-title">

   {config.title}

  </div>


  <ResponsiveContainer width="100%" height={200}>

  <LineChart data={config.data}>

   <CartesianGrid />

   <XAxis dataKey="label" />

   <YAxis />

   <Tooltip />

   <Line dataKey="value" />

  </LineChart>

  </ResponsiveContainer>

  </>

  );

 }



 if (config.type === "bar") {

  return (

  <>

  <div className="ai-chart-title">

   {config.title}

  </div>


  <ResponsiveContainer width="100%" height={200}>

  <BarChart data={config.data}>

   <CartesianGrid />

   <XAxis dataKey="label" />

   <YAxis />

   <Tooltip />

   <Bar dataKey="value" />

  </BarChart>

  </ResponsiveContainer>

  </>

  );

 }


 return null;

}