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


/* use your express AI server */
const API_URL =
"http://localhost:5000/ai-insights";


export default function MiniStoreAI({

 debts = [],
 products = []

}){

 const [open,setOpen]=useState(false);
 const [loading,setLoading]=useState(false);
 const [input,setInput]=useState("");

 const [messages,setMessages]=useState([

  {
   role:"ai",
   content:
`Hi 👋 ask me anything about your store

example:
• sino may utang
• magkano total utang
• sino overdue
• sino dapat singilin
• utang trend`
  }

 ]);

 const [widgets,setWidgets]=useState([]);



/* send prompt to AI */

 const sendPrompt = async(promptText)=>{

  if(!promptText.trim()) return;

  setLoading(true);

  try{

   const res =
    await fetch(

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


   const data =
    await res.json();


   setMessages(prev=>[

    ...prev,

    {

     role:"ai",

     content:
      data.text ||
      "no result"

    }

   ]);


   /* avoid widget duplication */

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



 const removeWidget = (index)=>{

  setWidgets(prev=>

   prev.filter((_,i)=>i!==index)

  );

 };



 return(

 <>

 {/* floating AI button */}

 <button

  className="ai-float-btn"

  onClick={()=>

   setOpen(!open)

  }

 >

  {open
   ? <X/>
   : <BrainCircuit/>
  }

 </button>



 {/* chat window */}

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

  onChange={(e)=>

   setInput(e.target.value)

  }

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



 {/* widgets */}

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



/* widget renderer */

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


  <ResponsiveContainer
   width="100%"
   height={200}
  >

  <LineChart
   data={config.data}
  >

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


  <ResponsiveContainer
   width="100%"
   height={200}
  >

  <BarChart
   data={config.data}
  >

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


  <ResponsiveContainer
   width="100%"
   height={200}
  >

  <AreaChart
   data={config.data}
  >

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