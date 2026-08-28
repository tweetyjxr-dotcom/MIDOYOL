import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return (
    <div>
      <h1>MIDOYOL</h1>
      <p>Your student journey starts here.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
