import React from "react";

import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

import App from "./App";
import { FallbackComponent } from "./components";
import "./index.css";
// import reportWebVitals from './reportWebVitals';

Sentry.init({
  dsn: "https://ffe6dfabe4ea43d9947978472d9f11d6@o1068887.ingest.sentry.io/6063180",
  integrations: [new Integrations.BrowserTracing()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

const fallback = <FallbackComponent />;

ReactDOM.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={fallback}>
      <Router>
        <App />
      </Router>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

// reportWebVitals();
