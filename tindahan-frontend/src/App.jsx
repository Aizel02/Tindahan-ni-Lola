import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import ProductList from "./components/ProductList";
import Liabilities from "./components/Liabilities";
import Auth from "./pages/Auth";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/products" element={<ProductList />} />
       <Route path="/auth" element={<Auth />} />
      <Route path="/liabilities" element={<Liabilities />} />
    </Routes>
  );
}

export default App;
