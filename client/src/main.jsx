import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.jsx";
import "./index.css";
import Store from "./services/Store.jsx";

// Patch localStorage access so token/role được lưu theo từng tab (sessionStorage)
const patchAuthStorage = () => {
  if (typeof window === "undefined") return;
  if (window.__authStoragePatched) return;

  const authKeys = new Set(["token", "role"]);
  const local = window.localStorage;
  const session = window.sessionStorage;

  if (!local || !session) return;

  const originalSet = local.setItem.bind(local);
  const originalGet = local.getItem.bind(local);
  const originalRemove = local.removeItem.bind(local);

  local.setItem = (key, value) => {
    if (authKeys.has(key)) {
      session.setItem(key, value);
      return value;
    }
    return originalSet(key, value);
  };

  local.getItem = (key) => {
    if (authKeys.has(key)) {
      const sessionValue = session.getItem(key);
      if (sessionValue !== null) return sessionValue;
    }
    return originalGet(key);
  };

  local.removeItem = (key) => {
    if (authKeys.has(key)) {
      session.removeItem(key);
      return;
    }
    return originalRemove(key);
  };

  window.__authStoragePatched = true;
};

patchAuthStorage();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={Store}>
      <App />
    </Provider>
  </React.StrictMode>
);