import React from "react";
import { useNavigate } from "react-router-dom";

import {
Moon,
Sun,
CheckSquare,
Zap,
BarChart3,
Users,
Store
} from "lucide-react";

import useTheme from "../hooks/useTheme";

import "./LandingPage.css";

export default function LandingPage(){

const navigate = useNavigate();

const [dark,setDark] = useTheme();

return(

<div className="landing-container">

<nav className="navbar">

<h2 className="logo">

<Store size={20} className="logo-icon"/>

Tindahan ni Lola

</h2>

<div className="nav-actions">

<button
className="theme-toggle"
onClick={()=>setDark(!dark)}
>

{dark ? <Sun size={18}/> : <Moon size={18}/>}

</button>

<button
className="login-btn"
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
className="primary-btn"
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


<section className="cta">

<h2>

Ready to grow your business?

</h2>

<button
className="secondary-btn"
onClick={()=>navigate("/auth")}
>

Enter Store

</button>

</section>


<footer className="footer">

<p>

© {new Date().getFullYear()} Tindahan ni Lola

</p>

<p className="footer-sub">

Simple inventory system for sari-sari stores

</p>

</footer>

</div>

);

}

function Card({icon,title,text}){

return(

<div className="feature-card">

{icon}

<h3>{title}</h3>

<p>{text}</p>

</div>

);

}