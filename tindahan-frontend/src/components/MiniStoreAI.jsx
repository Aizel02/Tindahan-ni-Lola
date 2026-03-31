import { useState, useMemo } from "react";
import { BrainCircuit, Send, X } from "lucide-react";
import Draggable from "react-draggable";

import {
 ResponsiveContainer,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 Tooltip,
 CartesianGrid
} from "recharts";


const API_URL =
"http://localhost:5000/ai-insights";



export default function MiniStoreAI({

 debts = [],
 products = []

}){


 const [open,setOpen]=useState(false);
 const [loading,setLoading]=useState(false);
 const [input,setInput]=useState("");
 const [showSuggest,setShowSuggest]=useState(false);


 const [messages,setMessages]=useState([

  {

   role:"ai",

   content:
`Hi 👋 ask me about your store

example:
• utang ni nanay
• pending utang ni kuya
• sino dapat singilin
• generate chart`

  }

 ]);



 const [widgets,setWidgets]=useState([]);



/* =========================
   EXTRACT UNIQUE NAMES
========================= */

 const names =
 useMemo(()=>{

  const list = debts.map(d=>

   d.debtor_name ||
   d.customer_name ||
   d.customer ||
   d.person ||
   d.name ||
   ""

  );


  return [

   ...new Set(

    list
    .filter(Boolean)

   )

  ];

 },[debts]);



/* =========================
   FILTER SUGGESTIONS
========================= */

 const suggestions =
 useMemo(()=>{

  if(!input) return [];


  const q =
   input.toLowerCase();


  return names.filter(n=>

   n.toLowerCase().includes(q)

  ).slice(0,5);

 },[input,names]);



/* =========================
   SEND PROMPT
========================= */

 const sendPrompt = async(promptText)=>{

  if(!promptText.trim()) return;

  setLoading(true);

  setShowSuggest(false);


  try{

   const res = await fetch(

    API_URL,

    {

     method:"POST",

     headers:{

      "Content-Type":"application/json"

     },

     body:JSON.stringify({

      prompt:promptText,
      debts,
      products

     })

    }

   );


   const data = await res.json();


   setMessages(prev=>[

    ...prev,

    {

     role:"ai",

     content:
      data.text ||
      "No result"

    }

   ]);


   if(data.widgets){

    setWidgets(data.widgets);

   }

  }

  catch{

   setMessages(prev=>[

    ...prev,

    {

     role:"ai",

     content:
      "AI connection error"

    }

   ]);

  }


  setLoading(false);

 };



/* =========================
   SEND MESSAGE
========================= */

 const sendMessage = ()=>{

  if(!input.trim()) return;


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



/* =========================
   CLICK SUGGESTION
========================= */

 const useSuggestion = (name)=>{

  setInput(`utang ni ${name}`);

  setShowSuggest(false);

 };



 const removeWidget = (index)=>{

  setWidgets(prev=>

   prev.filter((_,i)=>i!==index)

  );

 };



/* =========================
   UI
========================= */

 return(

 <>

 <button

  className="ai-float-btn"

  onClick={()=>

   setOpen(!open)

  }

 >

  {

   open

   ? <X/>

   : <BrainCircuit/>

  }

 </button>



 {open &&(

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



 {loading &&(

 <div className="ai-msg ai-bot">

  analyzing...

 </div>

 )}

 </div>



 <div className="ai-chat-input">


 <input
 value={input}

 onChange={(e)=>{
  setInput(e.target.value);
  setShowSuggest(true);
 }}

 onKeyDown={(e)=>{

  if(e.key==="Enter"){

   e.preventDefault();

   sendMessage();

  }

 }}

 placeholder="ask AI..."

 enterKeyHint="send"
/>


 <button

  className="ai-send"

  onClick={sendMessage}

 >

  <Send size={16}/>

 </button>



 {/* suggestion dropdown */}

 {

  showSuggest &&

  suggestions.length>0 &&(

  <div className="ai-suggest-box">

   {

    suggestions.map((name,i)=>(

    <div

     key={i}

     className="ai-suggest-item"

     onClick={()=>

      useSuggestion(name)

     }

    >

     {name}

    </div>

    ))

   }

  </div>

 )

 }


 </div>

 </div>

 )}



 <div className="ai-widget-area">


 {widgets.map((w,i)=>(

 <Draggable key={i}>

 <div className="ai-widget glass">


 <button

  onClick={()=>

   removeWidget(i)

  }

  style={{

   position:"absolute",
   top:6,
   right:6,
   border:"none",
   background:"none",
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




/* =========================
   CHART WIDGET
========================= */

function Widget({config}){


 if(config.type==="kpi"){

  return(

  <div className="ai-kpi">

   <div className="ai-kpi-label">

    {config.label}

   </div>


   <div className="ai-kpi-value">

    ₱{config.value}

   </div>

  </div>

  );

 }



 if(config.type==="bar"){

  return(

  <>

  <div className="ai-chart-title">

   {config.title}

  </div>


  <ResponsiveContainer

   width="100%"

   height={200}

  >

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


 return null;

}