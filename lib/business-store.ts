import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useEffect, useSyncExternalStore } from "react";

import type { ReadinessKey } from "./business-content";
import type { KabarCategory } from "./kabar-content";

export type ExpenseCategory = "Bahan baku" | "Operasional" | "Pemasaran" | "Lainnya";
export type IncomeCategory = "Penjualan" | "Jasa" | "Pesanan khusus" | "Lainnya";
export type TransactionCategory = ExpenseCategory | IncomeCategory;
export type CashTransaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  note: string;
  date: string;
  category?: TransactionCategory;
};
export type BusinessDeadline = {
  id: string;
  kind: "Pajak" | "Izin usaha";
  dueDate: string;
  notificationId: string | null;
};
export type BusinessProfile = { businessName: string; ownerName: string; logoUri: string | null };
export type MonthCloseStep = "records" | "budget" | "export";
type Readiness = Record<ReadinessKey, boolean | null>;

export type BusinessState = {
  transactions: CashTransaction[];
  readiness: Readiness;
  guideProgress: Record<string, number[]>;
  completedLessons: string[];
  newsRead: boolean;
  savedArticleIds: string[];
  articleNotes: Record<string, string>;
  interests: KabarCategory[];
  qrisUri: string | null;
  reminderHour: number | null;
  reminderNotificationId: string | null;
  budgets: Partial<Record<ExpenseCategory, number>>;
  deadlines: BusinessDeadline[];
  budgetAlertKeys: string[];
  profile: BusinessProfile;
  monthlyCloseProgress: Record<string, MonthCloseStep[]>;
  closedMonths: string[];
  lastBackupAt: string | null;
};

const STORAGE_KEY = "bantuusaha-local-state";
const initialState: BusinessState = {
  transactions: [],
  readiness: { profile: null, product: null, money: null, legal: null, capital: null },
  guideProgress: {},
  completedLessons: [],
  newsRead: false,
  savedArticleIds: [],
  articleNotes: {},
  interests: [],
  qrisUri: null,
  reminderHour: null,
  reminderNotificationId: null,
  budgets: {},
  deadlines: [],
  budgetAlertKeys: [],
  profile: { businessName: "Usaha Anda", ownerName: "Pemilik usaha", logoUri: null },
  monthlyCloseProgress: {},
  closedMonths: [],
  lastBackupAt: null,
};

let snapshot = initialState;
let hydrated = false;
let hydrationStarted = false;
let persistenceTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function isTransaction(value: unknown): value is CashTransaction {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CashTransaction>;
  return typeof item.id === "string"
    && (item.type === "income" || item.type === "expense")
    && typeof item.amount === "number"
    && Number.isFinite(item.amount)
    && item.amount > 0
    && typeof item.note === "string"
    && typeof item.date === "string";
}

function normalizeCloseProgress(value: unknown): Record<string, MonthCloseStep[]> {
  if (!value || typeof value !== "object") return {};
  const allowed: MonthCloseStep[] = ["records", "budget", "export"];
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([month, steps]) => [
      month,
      Array.isArray(steps) ? steps.filter((step): step is MonthCloseStep => allowed.includes(step as MonthCloseStep)) : [],
    ]),
  );
}

/** Converts stored or restored data into the safe current application schema. */
export function normalizeBusinessState(value: Partial<BusinessState> | null | undefined): BusinessState {
  const parsed = value ?? {};
  const deadlines = Array.isArray(parsed.deadlines)
    ? parsed.deadlines.filter((item): item is BusinessDeadline => Boolean(item)
      && (item.kind === "Pajak" || item.kind === "Izin usaha")
      && typeof item.id === "string"
      && typeof item.dueDate === "string").map((item) => ({ ...item, notificationId: typeof item.notificationId === "string" ? item.notificationId : null }))
    : [];
  const profile = parsed.profile ?? initialState.profile;
  return {
    transactions: Array.isArray(parsed.transactions) ? parsed.transactions.filter(isTransaction) : [],
    readiness: { ...initialState.readiness, ...parsed.readiness },
    guideProgress: parsed.guideProgress ?? {},
    completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons.filter((item): item is string => typeof item === "string") : [],
    newsRead: parsed.newsRead === true,
    savedArticleIds: Array.isArray(parsed.savedArticleIds) ? parsed.savedArticleIds.filter((item): item is string => typeof item === "string") : [],
    articleNotes: parsed.articleNotes ?? {},
    interests: Array.isArray(parsed.interests) ? parsed.interests : [],
    qrisUri: typeof parsed.qrisUri === "string" ? parsed.qrisUri : null,
    reminderHour: typeof parsed.reminderHour === "number" ? parsed.reminderHour : null,
    reminderNotificationId: typeof parsed.reminderNotificationId === "string" ? parsed.reminderNotificationId : null,
    budgets: parsed.budgets ?? {},
    deadlines,
    budgetAlertKeys: Array.isArray(parsed.budgetAlertKeys) ? parsed.budgetAlertKeys.filter((item): item is string => typeof item === "string") : [],
    profile: {
      businessName: typeof profile.businessName === "string" ? profile.businessName : initialState.profile.businessName,
      ownerName: typeof profile.ownerName === "string" ? profile.ownerName : initialState.profile.ownerName,
      logoUri: typeof profile.logoUri === "string" ? profile.logoUri : null,
    },
    monthlyCloseProgress: normalizeCloseProgress(parsed.monthlyCloseProgress),
    closedMonths: Array.isArray(parsed.closedMonths) ? [...new Set(parsed.closedMonths.filter((item): item is string => typeof item === "string"))] : [],
    lastBackupAt: typeof parsed.lastBackupAt === "string" ? parsed.lastBackupAt : null,
  };
}

function persistSoon() {
  if (!hydrated) return;
  if (persistenceTimer) clearTimeout(persistenceTimer);
  persistenceTimer = setTimeout(() => {
    persistenceTimer = null;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, 180);
}

function setState(nextState: BusinessState) {
  snapshot = nextState;
  emit();
  persistSoon();
}

async function persistNow(nextState: BusinessState) {
  if (persistenceTimer) clearTimeout(persistenceTimer);
  persistenceTimer = null;
  snapshot = nextState;
  emit();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

async function notifyBudgetThreshold(transaction: CashTransaction, transactions: CashTransaction[]) {
  const category = transaction.category as ExpenseCategory;
  const budget = snapshot.budgets[category] ?? 0;
  if (!budget) return;
  const date = new Date(transaction.date);
  const spent = transactions
    .filter((item) => item.type === "expense" && item.category === category && new Date(item.date).getFullYear() === date.getFullYear() && new Date(item.date).getMonth() === date.getMonth())
    .reduce((total, item) => total + item.amount, 0);
  const key = `${date.getFullYear()}-${date.getMonth()}-${category}`;
  if (spent >= budget * 0.8 && !snapshot.budgetAlertKeys.includes(key)) {
    setState({ ...snapshot, budgetAlertKeys: [...snapshot.budgetAlertKeys, key] });
    const { sendBudgetThresholdAlert } = await import("./budget-alert");
    await sendBudgetThresholdAlert(category, spent, budget);
  }
}

async function hydrate() {
  if (hydrationStarted) return;
  hydrationStarted = true;
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) snapshot = normalizeBusinessState(JSON.parse(saved) as Partial<BusinessState>);
  } catch {
    snapshot = initialState;
  } finally {
    hydrated = true;
    emit();
  }
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getSnapshot = () => snapshot;

/** Omits device-specific notification handles from the portable encrypted backup. */
export function createPortableBackupState(state: BusinessState): BusinessState {
  return {
    ...state,
    qrisUri: null,
    reminderHour: null,
    reminderNotificationId: null,
    deadlines: state.deadlines.map((deadline) => ({ ...deadline, notificationId: null })),
    profile: { ...state.profile, logoUri: null },
  };
}

export function useBusinessStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => {
    void hydrate();
  }, []);

  return {
    ...state,
    hydrated,
    addTransaction(type: CashTransaction["type"], amount: number, note: string, category: TransactionCategory = type === "income" ? "Penjualan" : "Operasional") {
      const transaction: CashTransaction = {
        id: `${Date.now()}-${Math.round(Math.random() * 1000)}`,
        type,
        amount,
        note: note.trim() || (type === "income" ? "Pemasukan usaha" : "Pengeluaran usaha"),
        date: new Date().toISOString(),
        category,
      };
      const nextTransactions = [transaction, ...snapshot.transactions];
      setState({ ...snapshot, transactions: nextTransactions });
      if (type === "expense") void notifyBudgetThreshold(transaction, nextTransactions);
      return transaction;
    },
    updateTransaction(id: string, update: Omit<CashTransaction, "id" | "date"> & { date?: string }) {
      const previous = snapshot.transactions.find((item) => item.id === id);
      if (!previous) return null;
      const transaction: CashTransaction = { ...previous, ...update, id };
      const nextTransactions = snapshot.transactions.map((item) => item.id === id ? transaction : item);
      setState({ ...snapshot, transactions: nextTransactions });
      if (transaction.type === "expense") void notifyBudgetThreshold(transaction, nextTransactions);
      return transaction;
    },
    duplicateTransaction(id: string) {
      const original = snapshot.transactions.find((item) => item.id === id);
      if (!original) return null;
      const transaction: CashTransaction = {
        ...original,
        id: `${Date.now()}-${Math.round(Math.random() * 1000)}`,
        date: new Date().toISOString(),
      };
      const nextTransactions = [transaction, ...snapshot.transactions];
      setState({ ...snapshot, transactions: nextTransactions });
      if (transaction.type === "expense") void notifyBudgetThreshold(transaction, nextTransactions);
      return transaction;
    },
    removeTransaction(id: string) {
      const removed = snapshot.transactions.find((item) => item.id === id) ?? null;
      if (removed) setState({ ...snapshot, transactions: snapshot.transactions.filter((item) => item.id !== id) });
      return removed;
    },
    importTransactions(transactions: Array<Omit<CashTransaction, "id">>) {
      const imported = transactions
        .filter((item) => Number.isFinite(item.amount) && item.amount > 0 && (item.type === "income" || item.type === "expense"))
        .map((item, index) => ({ ...item, id: `import-${Date.now()}-${index}` }));
      setState({ ...snapshot, transactions: [...imported, ...snapshot.transactions] });
    },
    async restoreFromBackup(data: Partial<BusinessState>) {
      const restored = normalizeBusinessState(data);
      await persistNow(restored);
    },
    createBackupSnapshot() {
      return createPortableBackupState(snapshot);
    },
    markBackupCompleted(date = new Date().toISOString()) {
      setState({ ...snapshot, lastBackupAt: date });
    },
    toggleMonthlyCloseStep(monthKey: string, step: MonthCloseStep) {
      const current = snapshot.monthlyCloseProgress[monthKey] ?? [];
      const next = current.includes(step) ? current.filter((item) => item !== step) : [...current, step];
      setState({ ...snapshot, monthlyCloseProgress: { ...snapshot.monthlyCloseProgress, [monthKey]: next } });
    },
    setMonthClosed(monthKey: string, closed: boolean) {
      const closedMonths = closed ? [...new Set([...snapshot.closedMonths, monthKey])] : snapshot.closedMonths.filter((item) => item !== monthKey);
      setState({ ...snapshot, closedMonths });
    },
    saveReadiness(readiness: Readiness) {
      setState({ ...snapshot, readiness });
    },
    toggleGuideStep(guideId: string, stepIndex: number) {
      const completed = snapshot.guideProgress[guideId] ?? [];
      const nextCompleted = completed.includes(stepIndex) ? completed.filter((index) => index !== stepIndex) : [...completed, stepIndex];
      setState({ ...snapshot, guideProgress: { ...snapshot.guideProgress, [guideId]: nextCompleted } });
    },
    completeLesson(lessonId: string) {
      if (!snapshot.completedLessons.includes(lessonId)) setState({ ...snapshot, completedLessons: [...snapshot.completedLessons, lessonId] });
    },
    markNewsRead() {
      if (!snapshot.newsRead) setState({ ...snapshot, newsRead: true });
    },
    toggleSavedArticle(articleId: string) {
      const isSaved = snapshot.savedArticleIds.includes(articleId);
      const savedArticleIds = isSaved ? snapshot.savedArticleIds.filter((item) => item !== articleId) : [...snapshot.savedArticleIds, articleId];
      const articleNotes = { ...snapshot.articleNotes };
      if (isSaved) delete articleNotes[articleId];
      setState({ ...snapshot, savedArticleIds, articleNotes });
    },
    saveArticleNote(articleId: string, note: string) {
      setState({ ...snapshot, articleNotes: { ...snapshot.articleNotes, [articleId]: note.trim() } });
    },
    toggleInterest(category: KabarCategory) {
      const interests = snapshot.interests.includes(category) ? snapshot.interests.filter((item) => item !== category) : [...snapshot.interests, category];
      setState({ ...snapshot, interests });
    },
    saveQrisUri(uri: string | null) {
      setState({ ...snapshot, qrisUri: uri });
    },
    saveReminder(hour: number | null, notificationId: string | null) {
      setState({ ...snapshot, reminderHour: hour, reminderNotificationId: notificationId });
    },
    setBudget(category: ExpenseCategory, amount: number) {
      setState({ ...snapshot, budgets: { ...snapshot.budgets, [category]: Math.max(0, amount) } });
    },
    addDeadline(kind: BusinessDeadline["kind"], dueDate: string, notificationId: string | null) {
      setState({ ...snapshot, deadlines: [...snapshot.deadlines, { id: `${Date.now()}-${kind}`, kind, dueDate, notificationId }] });
    },
    removeDeadline(id: string) {
      setState({ ...snapshot, deadlines: snapshot.deadlines.filter((deadline) => deadline.id !== id) });
    },
    saveProfile(profile: BusinessProfile) {
      setState({ ...snapshot, profile });
    },
  };
}
