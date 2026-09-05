import React from "react";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#e6f7ff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "50px",
          borderRadius: "24px",
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ color: "#75c9e8" }}>
          MIDOYOL
        </h1>

        <p>
          Your journey to university starts here.
        </p>

        <button
          style={{
            padding: "14px 28px",
            border: "none",
            borderRadius: "12px",
            background: "#75c9e8",
            color: "#ffffff",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Start Application
        </button>
      </div>
    </div>
  );
}

export default App;
