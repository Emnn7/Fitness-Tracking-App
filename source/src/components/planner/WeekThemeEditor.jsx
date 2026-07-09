import React, { useState } from "react";

const THEME_TEMPLATES = [
  { name: "Deep Work", blocks: ["Morning focus block", "No-meeting afternoon", "Inbox triage"] },
  { name: "Recovery", blocks: ["Light exercise", "Extra sleep buffer", "Reflection journal"] },
  { name: "Launch Push", blocks: ["Sprint standup", "Demo prep", "Stakeholder sync"] },
  { name: "Learning", blocks: ["Reading block", "Course module", "Notes review"] },
];

export default function WeekThemeEditor({ weekStartKey, currentTheme, onSetTheme }) {
  const [customTheme, setCustomTheme] = useState(currentTheme?.theme ?? "");

  function applyTemplate(tpl) {
    onSetTheme(weekStartKey, tpl.name, tpl.blocks.map((title) => ({ title })));
    setCustomTheme(tpl.name);
  }

  return (
    <div style={wrapStyle}>
      <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "var(--ink-soft)" }}>
        This week's theme
      </h3>
      <input
        value={customTheme}
        onChange={(e) => setCustomTheme(e.target.value)}
        onBlur={() => onSetTheme(weekStartKey, customTheme, currentTheme?.suggestedBlocks || [])}
        placeholder="Name this week's theme"
        style={inputStyle}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
        {THEME_TEMPLATES.map((tpl) => (
          <button key={tpl.name} onClick={() => applyTemplate(tpl)} style={chipStyle}>
            {tpl.name}
          </button>
        ))}
      </div>
      {currentTheme?.suggestedBlocks?.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 12, color: "var(--ink-faint)", margin: "0 0 6px", fontWeight: 600 }}>Suggested blocks</p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {currentTheme.suggestedBlocks.map((b, i) => (
              <li key={i} style={suggestedItemStyle}>{b.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const wrapStyle = { background: "var(--card)", borderRadius: "var(--radius-md)", padding: 14, boxShadow: "var(--shadow-card)", marginBottom: 14 };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--hairline-strong)", fontSize: 14 };
const chipStyle = {
  padding: "6px 12px", borderRadius: "var(--radius-full)",
  border: "1px solid var(--hairline-strong)", background: "var(--paper)",
  fontSize: 12.5, fontWeight: 600, cursor: "pointer", color: "var(--ink-soft)",
};
const suggestedItemStyle = {
  padding: "8px 10px", background: "var(--paper)", borderRadius: "var(--radius-sm)",
  fontSize: 13, marginBottom: 4,
};
