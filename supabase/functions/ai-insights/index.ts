import { serve } from "https://deno.land/std@0.177.0/http/server.ts";


const corsHeaders = {

 "Access-Control-Allow-Origin":"*",

 "Access-Control-Allow-Headers":
 "authorization,x-client-info,apikey,content-type",

 "Access-Control-Allow-Methods":"POST,OPTIONS"

};



/* =========================
   HELPERS
========================= */

function normalize(text:string=""){

 return text
  .toLowerCase()
  .replace(/[^\w\s]/g,"")
  .trim();

}


/* remove titles */

function removeTitle(name:string){

 return name
  .replace(
   /\b(tita|tito|ate|kuya|ma|mama|nanay|tatay)\b/g,
   ""
  )
  .trim();

}


/* fuzzy match */

function similarity(a:string,b:string){

 let matches = 0;

 for(let i=0;i<Math.min(a.length,b.length);i++){

  if(a[i]===b[i]) matches++;

 }

 return matches / Math.max(a.length,b.length);

}



/* =========================
   SERVER
========================= */

serve(async(req)=>{

 if(req.method==="OPTIONS"){

  return new Response(
   "ok",
   {headers:corsHeaders}
  );

 }


 try{

  const {

   debts=[],
   prompt=""

  } = await req.json();


  const q =
   normalize(prompt);



/* =========================
   NORMALIZE DATA
========================= */

  const records =
   debts.map(d=>{

  const possibleName =

 d.debtor_name ??
 d.customer_name ??
 d.customer ??
 d.customerName ??
 d.person ??
 d.personName ??
 d.name ??
 d.full_name ??
 d.owner ??
 d.title ??
 d.contact ??
 d.borrower ??
 d.debtor ??

 /* nested objects */
 d.customer?.name ??
 d.person?.name ??

 "";


   return {

    label:
     String(possibleName).trim(),

    name:
     normalize(possibleName),


    nameNoTitle:
     normalize(
      removeTitle(possibleName)
     ),


    amount:
     Number(
      d.amount ||
      d.total ||
      d.value ||
      0
     ),


    paid:
     String(d.status)
     .toLowerCase()==="paid",


    due:
     d.due ||
     d.due_date ||
     null

   };

  });



/* =========================
   FIXED PERSON MATCH
========================= */

let personMatch:any = null;

const queryWords =
 normalize(q)
  .split(" ")
  .filter(w=>w.length>1);


/* exact full match first */

personMatch =
 records.find(r=>

  normalize(q).includes(
   normalize(r.label)
  )

);


/* match by individual words */

if(!personMatch){

 personMatch =
  records.find(r=>{

   const words =
    normalize(r.label).split(" ");

   return words.some(w=>

    queryWords.includes(w)

   );

  });

}


/* fuzzy match only if still not found */

if(!personMatch){

 let bestScore = 0;

 records.forEach(r=>{

  queryWords.forEach(w=>{

   const score =
    similarity(
     w,
     r.nameNoTitle
    );

   if(score>bestScore && score>0.8){

    bestScore = score;
    personMatch = r;

   }

  });

 });

}


const person =
 personMatch?.label;



 let filtered = records;


/* filter by person */

 if(person){

  filtered =
   filtered.filter(r=>

    r.label===person

   );

 }



/* =========================
   INTENTS
========================= */

 const pendingIntent =

  q.includes("pending") ||
  q.includes("unpaid") ||
  q.includes("di pa") ||
  q.includes("hindi pa");


 const overdueIntent =

  q.includes("overdue") ||
  q.includes("late") ||
  q.includes("delay") ||
  q.includes("past due");


 const chartIntent =

  q.includes("chart") ||
  q.includes("graph") ||
  q.includes("trend") ||
  q.includes("visual");



 if(pendingIntent){

  filtered =
   filtered.filter(r=>!r.paid);

 }


 if(overdueIntent){

  const today = new Date();


  filtered =
   filtered.filter(r=>

    !r.paid &&

    r.due &&

    new Date(r.due) < today

   );

 }



/* =========================
   PERSON NOT FOUND
========================= */

 if(
  q.includes("ni") &&
  !person
 ){

  const names =

   [...new Set(

    records.map(r=>r.label)

   )];


  return new Response(

   JSON.stringify({

    text:

`Hindi ko makita ang taong yan.

Available persons:
${names.join(", ")}`,

    widgets:[]

   }),

   {

    headers:{
     ...corsHeaders,
     "Content-Type":"application/json"
    }

   }

  );

 }



/* =========================
   TOTAL
========================= */

 const total =

  filtered.reduce(

   (sum,r)=>
   sum + r.amount,

   0

  );



/* =========================
   LABEL
========================= */

 let label = "Total utang";


 if(pendingIntent)
  label = "Pending utang";


 if(overdueIntent)
  label = "Overdue utang";


 if(person)
  label += ` ni ${person}`;



/* =========================
   CHART DATA
========================= */

 const chartData =
  filtered.map(r=>({

   label:r.label,
   value:r.amount

  }));



/* monthly trend */

 const monthly:any = {};


 filtered.forEach(r=>{

  if(!r.due) return;


  const key =
   new Date(r.due)
   .toLocaleString("default",{

    month:"short",
    year:"numeric"

   });


  monthly[key] =
   (monthly[key]||0)
   + r.amount;

 });



/* =========================
   RESPONSE
========================= */

 return new Response(

  JSON.stringify({

   text:
   `${label} ₱${total}`,


   widgets:[

    {

     type:"kpi",

     label,

     value:total

    },


    {

     type:"bar",

     title:"Utang items",

     data:chartData

    },


    {

     type:"line",

     title:"Monthly trend",

     data:

     Object.entries(monthly)
     .map(([label,value])=>({

      label,
      value

     }))

    }

   ]

  }),

  {

   headers:{

    ...corsHeaders,
    "Content-Type":"application/json"

   }

  }

 );


 }


 catch(e){

  return new Response(

   JSON.stringify({

    error:e.message

   }),

   {

    status:500,
    headers:corsHeaders

   }

  );

 }

});