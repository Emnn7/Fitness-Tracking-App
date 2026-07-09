import React, { useEffect, useState } from "react";
import { AppProvider, useAppState } from "./context/AppContext";
import TabBar from "./components/TabBar";
import Onboarding from "./screens/Onboarding";
import Home from "./screens/Home";
import Planner from "./screens/Planner";
import Sprints from "./screens/Sprints";
import Insights from "./screens/Insights";
import Settings from "./screens/Settings";

function Shell() {
  const state = useAppState();
  const [tab, setTab] = useState("home");

  useEffect(() => {
    document.documentElement.setAttribute("data-colorblind", state.settings.colorblindMode ? "true" : "false");
  }, [state.settings.colorblindMode]);

  if (!state.onboarded) {
    return <Onboarding />;
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--paper)" }}>
      {tab === "home" && <Home />}
      {tab === "planner" && <Planner />}
      {tab === "sprints" && <Sprints />}
      {tab === "insights" && <Insights />}
      {tab === "settings" && <Settings />}
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
