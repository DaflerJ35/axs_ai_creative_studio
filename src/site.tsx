import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AXSLandingPage } from "./components/marketing/AXSLandingPage";
import "./axs.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AXSLandingPage standalone appUrl="/app" />
  </StrictMode>
);
