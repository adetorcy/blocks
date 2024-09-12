import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { about } from "./utils.js";

// styling
import "./fonts/Blocks6px-Regular.ttf";
import "./style.css";

ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

about();
