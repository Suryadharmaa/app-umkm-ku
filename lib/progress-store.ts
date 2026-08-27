import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useSyncExternalStore } from "react";
import { WEEKLY_TRANSACTION_TARGET } from "./progress-utils";

type Achievement = { weekKey: string; target: number; achievedAt: string };
type SharedBadge = { badgeId: string; title: string; message: string; sharedAt: string };
type State = { target: number; achievements: Achievement[]; sharedBadges: SharedBadge[] };
const KEY = "umkm-ku-progress-settings"; let state: State = { target: WEEKLY_TRANSACTION_TARGET, achievements: [], sharedBadges: [] }; let started = false; const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener()); const persist = () => void AsyncStorage.setItem(KEY, JSON.stringify(state));
async function hydrate() { if (started) return; started = true; try { const saved = await AsyncStorage.getItem(KEY); if (saved) { const parsed = JSON.parse(saved) as Partial<State>; state = { target: typeof parsed.target === "number" ? Math.max(1, Math.min(30, parsed.target)) : WEEKLY_TRANSACTION_TARGET, achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [], sharedBadges: Array.isArray(parsed.sharedBadges) ? parsed.sharedBadges : [] }; } } finally { emit(); } }
export function useProgressStore() { const snapshot = useSyncExternalStore((listener) => { listeners.add(listener); return () => listeners.delete(listener); }, () => state, () => state); useEffect(() => { void hydrate(); }, []); return { ...snapshot, setTarget(target: number) { state = { ...state, target: Math.max(1, Math.min(30, target)) }; persist(); emit(); }, recordAchievement(achievement: Achievement) { if (state.achievements.some((item) => item.weekKey === achievement.weekKey)) return false; state = { ...state, achievements: [achievement, ...state.achievements].slice(0, 12) }; persist(); emit(); return true; }, recordBadgeShare(share: SharedBadge) { state = { ...state, sharedBadges: [share, ...state.sharedBadges].slice(0, 20) }; persist(); emit(); } }; }
