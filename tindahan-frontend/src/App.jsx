import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import ProductList from "./components/ProductList";
import Liabilities from "./components/Liabilities";
import AuthCallback from "./pages/AuthCallback";
import Auth from "./pages/Auth";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/products" element={<ProductList />} />
       <Route path="/auth" element={<Auth />} />
       <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/liabilities" element={<Liabilities />} />
    </Routes>
  );
}

export default App;
