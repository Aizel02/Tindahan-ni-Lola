import { useEffect, useState } from "react";

export default function useTheme(){

const [dark,setDark]=useState(

localStorage.getItem("theme")==="dark"

);

useEffect(()=>{

if(dark){

document.body.classList.add("dark");

}else{

document.body.classList.remove("dark");

}

localStorage.setItem("theme",dark?"dark":"light");

},[dark]);

return [dark,setDark];

}