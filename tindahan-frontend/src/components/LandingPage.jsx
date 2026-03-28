import React from "react";
import { useNavigate } from "react-router-dom";

import {
Moon,
Sun,
CheckSquare,
Zap,
BarChart3,
Users
} from "lucide-react";

import useTheme from "../hooks/useTheme";

import "./LandingPage.css";
import "./theme.css";

export default function LandingPage(){

const navigate = useNavigate();

const [dark,setDark] = useTheme();

return(

<div className="landing-container">

<nav className="navbar glass gradient-border">

<h2>🏪 Tindahan ni Lola</h2>

<div>

<button
className="icon-btn"
onClick={()=>setDark(!dark)}
>

{dark ? <Sun size={18}/> : <Moon size={18}/>}

</button>

<button
className="btn"
onClick={()=>navigate("/auth")}
>

Login / Register

</button>

</div>

</nav>


<section className="hero">

<h1>

Manage your sari-sari store smarter

</h1>

<p>

Inventory, utang tracking, and analytics in one dashboard.

</p>

<button
className="btn"
onClick={()=>navigate("/auth")}
>

Start Managing Now

</button>

</section>


<section className="features">

<Card
icon={<CheckSquare/>}
title="Easy Inventory"
text="Add products quickly"
/>

<Card
icon={<Zap/>}
title="Quick Search"
text="Find items instantly"
/>

<Card
icon={<BarChart3/>}
title="Reports"
text="Track profits"
/>

<Card
icon={<Users/>}
title="Multi user"
text="For teams"
/>

</section>


<section className="cta glass">

<h2>

Ready to grow your business?

</h2>

<button
className="btn"
onClick={()=>navigate("/auth")}
>

Enter Store

</button>

</section>

</div>

);

}

function Card({icon,title,text}){

return(

<div className="glass gradient-border feature-card">

{icon}

<h3>{title}</h3>

<p>{text}</p>

</div>

);

}