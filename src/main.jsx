// DTN Mythos v2 — Entry Point + Storage Polyfill
const _s = {};
window.storage = {
  get: async (k, sh) => { try { const v = localStorage.getItem((sh?"sh_":"_")+k); if(!v) throw 0; return {value:v}; } catch { if(_s[k]) return {value:_s[k]}; throw new Error("not found"); } },
  set: async (k, v, sh) => { try { localStorage.setItem((sh?"sh_":"_")+k, v); } catch {} _s[k]=v; return {value:v}; },
  delete: async (k, sh) => { try { localStorage.removeItem((sh?"sh_":"_")+k); } catch {} delete _s[k]; return {deleted:true}; },
  list: async () => ({ keys: Object.keys(_s) }),
};
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);
