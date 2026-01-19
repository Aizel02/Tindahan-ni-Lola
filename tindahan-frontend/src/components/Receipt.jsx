import React from "react";
import "./Receipt.css";

export default function Receipt({ cart, total }) {
  const date = new Date().toLocaleString();

  return (
    <div className="receipt">
      <h2>TINDAHAN NI LOLA</h2>
      <p className="center">Receipt of Sale</p>
      <p className="center">{date}</p>

      <hr />

      {cart.map((item) => (
        <div className="row" key={item.id}>
          <span>{item.name} x {item.qty}</span>
          <span>₱{(item.qty * item.price).toFixed(2)}</span>
        </div>
      ))}

      <hr />

      <div className="row total">
        <strong>TOTAL</strong>
        <strong>₱{total.toFixed(2)}</strong>
      </div>

      <p className="center thankyou">
        Thank you for your purchase! <br />
        Visit us again ❤️
      </p>
    </div>
  );
}
