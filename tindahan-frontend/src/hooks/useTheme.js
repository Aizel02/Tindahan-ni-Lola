import { useEffect, useState } from "react";

export default function useTheme(){

const [dark,setDark]=useState(

localStorage.getItem("theme")==="dark"

);

useEffect(()=>{

document.body.classList.toggle("dark",dark);

localStorage.setItem("theme",dark?"dark":"light");

},[dark]);

return [dark,setDark];

}