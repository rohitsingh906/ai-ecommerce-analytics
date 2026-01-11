import React from "react";

export default function Payment() {
  const orderId = localStorage.getItem("lastOrderId");
  const amount = localStorage.getItem("lastAmount");

  const finish = () => {
    alert("Payment successful");

    // Clear payment data
    localStorage.removeItem("lastOrderId");
    localStorage.removeItem("lastAmount");

    // Redirect to orders
    window.location.href = "/myorders";
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>💳 Payment</h2>
      <p>Order ID: {orderId}</p>
      <p>Amount: ₹{amount}</p>

      <button
        onClick={finish}
        style={{ padding: 10, background: "green", color: "white" }}
      >
        Pay Now
      </button>
    </div>
  );
}
