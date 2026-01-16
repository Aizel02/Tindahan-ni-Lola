import React from "react";
import "./Liabilities.css";
import { NavLink } from "react-router-dom";
import Header from "./Header";



export default function Liabilities() {
  return (
    <div className="liabilities-page">
      <h1 className="liabilities-title">Liabilities</h1>

      <div className="liabilities-section">
        <div className="liabilities-header">
          <input
            type="text"
            placeholder="Search person who owed..."
            className="liabilities-search"
          />
          <button className="add-liability-btn">+ Add Liability</button>
        </div>

        <div className="liabilities-empty">
          No liabilities recorded. Add one to get started!
        </div>
      </div>
    </div>
  );
}
