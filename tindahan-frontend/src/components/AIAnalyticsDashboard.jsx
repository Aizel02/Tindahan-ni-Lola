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

export default function AIAnalyticsDashboard({

 analytics

}){

 if(!analytics) return null;

 const monthlyData=
 Object.entries(

  analytics.monthlyTotals

 ).map(([month,value])=>({

  month,
  value

 }));

 const compareData=[

 {

  name:"Utang",
  value:analytics.totalUtang

 },

 {

  name:"Products",
  value:analytics.totalProductValue

 }

 ];

 const predictionData=[

 {

  month:"Current",
  value:analytics.totalUtang

 },

 {

  month:"Prediction",
  value:analytics.prediction

 }

 ];

 return(

 <div className="dashboard-grid">

 {/* KPI */}

 <div className="kpi-card glass">

 <span>Total Utang</span>

 <h2>₱{analytics.totalUtang}</h2>

 </div>

 <div className="kpi-card glass">

 <span>Product Value</span>

 <h2>₱{analytics.totalProductValue}</h2>

 </div>

 <div className="kpi-card glass">

 <span>Overdue</span>

 <h2>{analytics.overdueCount}</h2>

 </div>

 <div className="kpi-card glass">

 <span>Predicted</span>

 <h2>₱{Math.round(analytics.prediction)}</h2>

 </div>


 {/* monthly */}

 <div className="chart-card glass">

 <h3>Monthly Trend</h3>

 <ResponsiveContainer

 width="100%"

 height={260}

 >

 <LineChart data={monthlyData}>

 <CartesianGrid/>

 <XAxis dataKey="month"/>

 <YAxis/>

 <Tooltip/>

 <Line

 dataKey="value"

 stroke="#6366f1"

 strokeWidth={3}

 />

 </LineChart>

 </ResponsiveContainer>

 </div>


 {/* comparison */}

 <div className="chart-card glass">

 <h3>Sales vs Utang</h3>

 <ResponsiveContainer

 width="100%"

 height={260}

 >

 <BarChart data={compareData}>

 <CartesianGrid/>

 <XAxis dataKey="name"/>

 <YAxis/>

 <Tooltip/>

 <Bar dataKey="value"/>

 </BarChart>

 </ResponsiveContainer>

 </div>


 {/* prediction */}

 <div className="chart-card glass">

 <h3>Future Utang Trend</h3>

 <ResponsiveContainer

 width="100%"

 height={260}

 >

 <AreaChart

 data={predictionData}

 >

 <CartesianGrid/>

 <XAxis dataKey="month"/>

 <YAxis/>

 <Tooltip/>

 <Area

 dataKey="value"

 stroke="#ef4444"

 fill="#fecaca"

 />

 </AreaChart>

 </ResponsiveContainer>

 </div>

 </div>

 );

}