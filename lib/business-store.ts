import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useEffect, useSyncExternalStore } from "react";

import type { ReadinessKey } from "./business-content";
import type { KabarCategory } from "./kabar-content";

export type ExpenseCategory = "Bahan baku" | "Operasional" | "Pemasaran" | "Lainnya";
export type IncomeCategory = "Penjualan" | "Jasa" | "Pesanan khusus" | "Lainnya";
export type TransactionCategory = ExpenseCategory | IncomeCategory;
export type CashTransaction = { id: string; type: "income" | "expense"; amount: number; note: string; date: string; category?: TransactionCategory };
export type BusinessDeadline = { id: string; kind: "Pajak" | "Izin usaha"; dueDate: string; notificationId: string | null };
export type BusinessProfile = { businessName: string; ownerName: string; logoUri: string | null };
type Readiness = Record<ReadinessKey, boolean | null>;
export type BusinessState = { transactions: CashTransaction[]; readiness: Readiness; guideProgress: Record<string, number[]>; completedLessons: string[]; newsRead: boolean; savedArticleIds: string[]; articleNotes: Record<string, string>; interests: KabarCategory[]; qrisUri: string | null; reminderHour: number | null; reminderNotificationId: string | null; budgets: Partial<Record<ExpenseCategory, number>>; deadlines: BusinessDeadline[]; budgetAlertKeys: string[]; profile: BusinessProfile };

const initialState: BusinessState = { transactions: [], readiness: { profile: null, product: null, money: null, legal: null, capital: null }, guideProgress: {}, completedLessons: [], newsRead: false, savedArticleIds: [], articleNotes: {}, interests: [], qrisUri: null, reminderHour: null, reminderNotificationId: null, budgets: {}, deadlines: [], budgetAlertKeys: [], profile: { businessName: "Usaha Anda", ownerName: "Pemilik usaha", logoUri: null } };
const STORAGE_KEY = "bantuusaha-local-state";
let snapshot = initialState;
let hydrated = false;
let hydrationStarted = false;
let persistenceTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit() { listeners.forEach((listener) => listener()); }
function persistSoon() {
  if (!hydrated) return;
  if (persistenceTimer) clearTimeout(persistenceTimer);
  persistenceTimer = setTimeout(() => { persistenceTimer = null; void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); }, 180);
}
function setState(nextState: BusinessState) { snapshot = nextState; emit(); persistSoon(); }
async function notifyBudgetThreshold(transaction: CashTransaction, transactions: CashTransaction[]) { const category = transaction.category as ExpenseCategory; const budget = snapshot.budgets[category] ?? 0; if (!budget) return; const date = new Date(transaction.date); const spent = transactions.filter((item) => item.type === "expense" && item.category === category && new Date(item.date).getFullYear() === date.getFullYear() && new Date(item.date).getMonth() === date.getMonth()).reduce((total, item) => total + item.amount, 0); const key = `${date.getFullYear()}-${date.getMonth()}-${category}`; if (spent >= budget * 0.8 && !snapshot.budgetAlertKeys.includes(key)) { const nextState = { ...snapshot, budgetAlertKeys: [...snapshot.budgetAlertKeys, key] }; setState(nextState); const { sendBudgetThresholdAlert } = await import("./budget-alert"); await sendBudgetThresholdAlert(category, spent, budget); } }
async function hydrate() {
  if (hydrationStarted) return;
  hydrationStarted = true;
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<BusinessState>;
      snapshot = { transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [], readiness: { ...initialState.readiness, ...parsed.readiness }, guideProgress: parsed.guideProgress ?? {}, completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [], newsRead: parsed.newsRead === true, savedArticleIds: Array.isArray(parsed.savedArticleIds) ? parsed.savedArticleIds : [], articleNotes: parsed.articleNotes ?? {}, interests: Array.isArray(parsed.interests) ? parsed.interests : [], qrisUri: typeof parsed.qrisUri === "string" ? parsed.qrisUri : null, reminderHour: typeof parsed.reminderHour === "number" ? parsed.reminderHour : null, reminderNotificationId: typeof parsed.reminderNotificationId === "string" ? parsed.reminderNotificationId : null, budgets: parsed.budgets ?? {}, deadlines: Array.isArray(parsed.deadlines) ? parsed.deadlines : [], budgetAlertKeys: Array.isArray(parsed.budgetAlertKeys) ? parsed.budgetAlertKeys : [], profile: { ...initialState.profile, ...parsed.profile } };
    }
  } catch { snapshot = initialState; } finally { hydrated = true; emit(); }
}
const subscribe = (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); };
const getSnapshot = () => snapshot;

export function useBusinessStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => { void hydrate(); }, []);
  return {
    ...state, hydrated,
    addTransaction(type: CashTransaction["type"], amount: number, note: string, category: TransactionCategory = type === "income" ? "Penjualan" : "Operasional") {
      const transaction: CashTransaction = { id: `${Date.now()}-${Math.round(Math.random() * 1000)}`, type, amount, note: note.trim() || (type === "income" ? "Pemasukan usaha" : "Pengeluaran usaha"), date: new Date().toISOString(), category };
      const nextTransactions = [transaction, ...snapshot.transactions]; setState({ ...snapshot, transactions: nextTransactions }); if (type === "expense") void notifyBudgetThreshold(transaction, nextTransactions);
    },
    importTransactions(transactions: Array<Omit<CashTransaction, "id">>) { const imported = transactions.map((item, index) => ({ ...item, id: `import-${Date.now()}-${index}` })); setState({ ...snapshot, transactions: [...imported, ...snapshot.transactions] }); },
    saveReadiness(readiness: Readiness) { setState({ ...snapshot, readiness }); },
    toggleGuideStep(guideId: string, stepIndex: number) {
      const completed = snapshot.guideProgress[guideId] ?? [];
      const nextCompleted = completed.includes(stepIndex) ? completed.filter((index) => index !== stepIndex) : [...completed, stepIndex];
      setState({ ...snapshot, guideProgress: { ...snapshot.guideProgress, [guideId]: nextCompleted } });
    },
    completeLesson(lessonId: string) { if (!snapshot.completedLessons.includes(lessonId)) setState({ ...snapshot, completedLessons: [...snapshot.completedLessons, lessonId] }); },
    markNewsRead() { if (!snapshot.newsRead) setState({ ...snapshot, newsRead: true }); },
    toggleSavedArticle(articleId: string) {
      const isSaved = snapshot.savedArticleIds.includes(articleId);
      const savedArticleIds = isSaved ? snapshot.savedArticleIds.filter((id) => id !== articleId) : [...snapshot.savedArticleIds, articleId];
      const articleNotes = { ...snapshot.articleNotes };
      if (isSaved) delete articleNotes[articleId];
      setState({ ...snapshot, savedArticleIds, articleNotes });
    },
    saveArticleNote(articleId: string, note: string) { setState({ ...snapshot, articleNotes: { ...snapshot.articleNotes, [articleId]: note.trim() } }); },
    toggleInterest(category: KabarCategory) {
      const interests = snapshot.interests.includes(category) ? snapshot.interests.filter((item) => item !== category) : [...snapshot.interests, category];
      setState({ ...snapshot, interests });
    },
    saveQrisUri(uri: string | null) { setState({ ...snapshot, qrisUri: uri }); },
    saveReminder(hour: number | null, notificationId: string | null) { setState({ ...snapshot, reminderHour: hour, reminderNotificationId: notificationId }); },
    setBudget(category: ExpenseCategory, amount: number) { setState({ ...snapshot, budgets: { ...snapshot.budgets, [category]: Math.max(0, amount) } }); },
    addDeadline(kind: BusinessDeadline["kind"], dueDate: string, notificationId: string | null) { setState({ ...snapshot, deadlines: [...snapshot.deadlines, { id: `${Date.now()}-${kind}`, kind, dueDate, notificationId }] }); },
    removeDeadline(id: string) { setState({ ...snapshot, deadlines: snapshot.deadlines.filter((deadline) => deadline.id !== id) }); },
    saveProfile(profile: BusinessProfile) { setState({ ...snapshot, profile }); },
  };
}
