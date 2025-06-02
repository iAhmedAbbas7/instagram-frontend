// <= IMPORTS =>
import "./index.css";
import React from "react";
import App from "./App.jsx";
import ReactDOM from "react-dom/client";

// <= SELECTING THE ROOT ELEMENT =>
const rootElement = document.getElementById("root");

// <= CREATING THE ROOT ELEMENT =>
const root = ReactDOM.createRoot(rootElement);

// <= RENDERING THE APP =>
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
