import { NavLink } from "react-router-dom";
import "./Tabs.css";

export default function Tabs() {
  return (
    <div className="tabs">
      <NavLink
        to="/products"
        className={({ isActive }) => isActive ? "tab active" : "tab"}
      >
        Products
      </NavLink>

      <NavLink
        to="/liabilities"
        className={({ isActive }) => isActive ? "tab active" : "tab"}
      >
        Liabilities
      </NavLink>
    </div>
  );
}
