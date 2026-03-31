const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());



function clean(text=""){

 return text
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g,"");

}


function has(q,words){

 return words.some(w=>q.includes(w));

}



app.get("/",(req,res)=>{

 res.send("MiniStore AI running 🚀");

});



app.post("/ai-insights",(req,res)=>{

 try{

  const {
   prompt="",
   debts=[]
  } = req.body;



  const q = clean(prompt);



  let text =
   "No matching data found.";



  let widgets = [];



/* normalize liabilities */

  const records =
   debts.map(d=>({

    name:

     (
      d.name ||
      d.customer ||
      d.person ||
      d.personName ||
      ""
     )
     .toLowerCase(),


    label:

      d.name ||
      d.customer ||
      d.person ||
      d.personName ||
      "Unknown",


    amount:

     Number(

      d.amount ||
      d.value ||
      d.total ||
      d.balance ||
      0

     ),


    paid:

     d.paid ||
     d.status==="Paid",


    dueDate:

     d.dueDate ||
     d.due ||
     d.deadline ||
     null

   }));



/* total */

  if(

   has(q,[

    "total",
    "lahat",
    "overall",
    "sum"

   ])

  ){

   const total =
    records.reduce(
     (s,r)=>s+r.amount,
     0
    );


   text =
    `Total utang is ₱${total}.`;


   widgets = [

    {

     type:"kpi",
     label:"Total Utang",
     value:total

    }

   ];

  }



/* person utang */

  else if(

   has(q,[

    "utang",
    "balance",
    "magkano"

   ])

  ){

   const found =
    records.find(r=>

     q.includes(r.name)

    );


   if(found){

    text =
     `${found.label} has utang ₱${found.amount}.`;

   }

  }



/* pending */

  else if(

   has(q,[

    "pending",
    "unpaid"

   ])

  ){

   const pending =
    records.filter(
     r=>!r.paid
    );


   text =
    pending.length

    ? `Pending customers:
       ${pending.map(p=>p.label).join(", ")}`

    : "No pending utang.";


   widgets = [

    {

     type:"bar",
     title:"Pending Utang",

     data:

      pending.map(p=>({

       label:p.label,
       value:p.amount

      }))

    }

   ];

  }



/* overdue */

  else if(

   has(q,[

    "overdue",
    "late",
    "delay"

   ])

  ){

   const today =
    new Date();


   const overdue =
    records.filter(r=>

     r.dueDate &&
     new Date(r.dueDate)<today &&
     !r.paid

    );


   text =
    overdue.length

    ? `Overdue:
       ${overdue.map(o=>o.label).join(", ")}`

    : "No overdue customers.";


   widgets = [

    {

     type:"bar",
     title:"Overdue Utang",

     data:

      overdue.map(o=>({

       label:o.label,
       value:o.amount

      }))

    }

   ];

  }



/* suggest collect */

  else if(

   has(q,[

    "singilin",
    "collect",
    "priority"

   ])

  ){

   const sorted =
    [...records]
    .sort((a,b)=>b.amount-a.amount);


   const top =
    sorted[0];


   text =
    top

    ? `Collect from ${top.label} first. Amount ₱${top.amount}.`

    : "No data.";


   widgets = [

    {

     type:"bar",
     title:"Collection Priority",

     data:

      sorted.map(r=>({

       label:r.label,
       value:r.amount

      }))

    }

   ];

  }



/* chart */

  else if(

   has(q,[

    "chart",
    "graph",
    "trend"

   ])

  ){

   widgets = [

    {

     type:"bar",
     title:"Utang Chart",

     data:

      records.map(r=>({

       label:r.label,
       value:r.amount

      }))

    }

   ];


   text =
    "Here is the utang chart.";

  }



  res.json({

   text,
   widgets

  });

 }

 catch(e){

  console.log(e);


  res.status(500).json({

   text:"AI error"

  });

 }

});



app.listen(

 5000,

 ()=>{

  console.log(

   "MiniStore AI running on http://localhost:5000"

  );

 }

);