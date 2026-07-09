import React, { useState } from "react";
import RingTrio from "../components/home/RingTrio";
import QuickLogCards from "../components/home/QuickLogCards";
import QuickLogSheet from "../components/home/QuickLogSheet";
import StreakBar from "../components/home/StreakBar";
import { useAppState, useAppDispatch, useDerived } from "../context/AppContext";
import { todayKey, formatHuman, addDays } from "../lib/dates";
import { canUseFreeze } from "../lib/streaks";

export default function Home() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { streak, points, today, todayPoints, unclaimedBadges } = useDerived();
  const [activeSheet, setActiveSheet] = useState(null);

  const targets = state.settings.targets;
  const progress = {
    exercise: today?.exercise ? today.exercise.minutes / targets.exercise : 0,
    work: today?.work ? today.work.focusedHours / targets.work : 0,
    meditation: today?.meditation ? today.meditation.minutes / targets.meditation : 0,
  };

  function saveLog(category, payload) {
    dispatch({ type: "LOG_CATEGORY", date: todayKey(), category, payload });
    setActiveSheet(null);
  }
  function clearLog(category) {
    dispatch({ type: "UNLOG_CATEGORY", date: todayKey(), category });
    setActiveSheet(null);
  }

  const missedYesterdayUncovered = checkMissedYesterday(state);
  const freezeAvailable = canUseFreeze(state.freezeDatesUsed, todayKey());

  return (
    <div style={{ padding: "calc(20px + var(--safe-top)) 18px 100px" }}>
      <header style={{ marginBottom: 18 }}>
        <p className="font-mono" style={{ fontSize: 12, color: "var(--ink-faint)", margin: 0 }}>
          {formatHuman(todayKey())}
        </p>
        <h1 className="font-display" style={{ fontSize: 26, margin: "2px 0 0", color: "var(--ink)" }}>
          Today
        </h1>
      </header>

      {unclaimedBadges.length > 0 && (
        <BadgeBanner
          badges={unclaimedBadges}
          onClaim={(b) => dispatch({ type: "CLAIM_REWARD", threshold: b })}
        />
      )}

      {missedYesterdayUncovered && freezeAvailable && (
        <FreezeBanner onUseFreeze={() => dispatch({ type: "USE_FREEZE", date: missedYesterdayUncovered })} />
      )}

      <div style={{ margin: "8px 0 22px" }}>
        <RingTrio progress={progress} onRingTap={setActiveSheet} />
      </div>

      <div style={{ marginBottom: 18 }}>
        <StreakBar streak={streak} points={points} todayPoints={todayPoints} />
      </div>

      <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 10px" }}>
        Quick log
      </h2>
      <QuickLogCards today={today} onCardTap={setActiveSheet} />

      {activeSheet && (
        <QuickLogSheet
          category={activeSheet}
          initialValue={today?.[activeSheet] ?? null}
          onSave={(payload) => saveLog(activeSheet, payload)}
          onClose={() => setActiveSheet(null)}
          onClear={today?.[activeSheet] ? () => clearLog(activeSheet) : undefined}
        />
      )}
    </div>
  );
}

function checkMissedYesterday(state) {
  const yesterday = addDays(todayKey(), -1);
  const dayBeforeYesterday = addDays(todayKey(), -2);
  const yesterdayRec = state.entriesByDate[yesterday];
  const hasYesterday = yesterdayRec && (yesterdayRec.mood || yesterdayRec.exercise || yesterdayRec.work || yesterdayRec.meditation);
  if (hasYesterday) return null;
  if (state.freezeDatesUsed.includes(yesterday)) return null;

  // Only worth offering a freeze if there was a real streak going into the gap —
  // i.e. the day before the missed day also has an entry. Otherwise a brand-new
  // user (or someone who simply hadn't started yet) would see a confusing prompt
  // about "protecting" a streak that never existed.
  const dayBeforeRec = state.entriesByDate[dayBeforeYesterday];
  const hadStreakGoingIn = dayBeforeRec && (dayBeforeRec.mood || dayBeforeRec.exercise || dayBeforeRec.work || dayBeforeRec.meditation);
  if (!hadStreakGoingIn) return null;

  return yesterday;
}

function BadgeBanner({ badges, onClaim }) {
  const b = badges[0];
  return (
    <div style={bannerStyle("var(--mood-soft)", "var(--mood)")}>
      <span style={{ fontSize: 20 }} aria-hidden="true">🏅</span>
      <div style={{ flex: 1 }}>
        <strong style={{ fontSize: 14 }}>{b}-day badge earned!</strong>
        <p style={{ fontSize: 12.5, margin: "2px 0 0", color: "var(--ink-soft)" }}>
          Tap to add it to your collection.
        </p>
      </div>
      <button onClick={() => onClaim(b)} style={claimBtnStyle}>Claim</button>
    </div>
  );
}

function FreezeBanner({ onUseFreeze }) {
  return (
    <div style={bannerStyle("var(--work-soft)", "var(--work)")}>
      <span style={{ fontSize: 20 }} aria-hidden="true">❄️</span>
      <div style={{ flex: 1 }}>
        <strong style={{ fontSize: 14 }}>Yesterday was missed</strong>
        <p style={{ fontSize: 12.5, margin: "2px 0 0", color: "var(--ink-soft)" }}>
          Use your monthly streak freeze to keep your streak alive.
        </p>
      </div>
      <button onClick={onUseFreeze} style={claimBtnStyle}>Freeze</button>
    </div>
  );
}

function bannerStyle(bg, accent) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: bg,
    border: `1px solid ${accent}`,
    borderRadius: "var(--radius-md)",
    padding: "12px 14px",
    marginBottom: 16,
  };
}

const claimBtnStyle = {
  border: "none",
  background: "var(--ink)",
  color: "#fff",
  fontSize: 12.5,
  fontWeight: 700,
  padding: "8px 14px",
  borderRadius: "var(--radius-full)",
  cursor: "pointer",
  flexShrink: 0,
};
