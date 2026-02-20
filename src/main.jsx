import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";

const rawBase = import.meta.env.BASE_URL || "/";
const base = rawBase.replace(/\/\.$/, "/"); // ✅ remove "/."
// (opcional) garantir que termina com "/"
const basename = base.endsWith("/") ? base : `${base}/`;

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={basename}>
    <App />
  </BrowserRouter>
);