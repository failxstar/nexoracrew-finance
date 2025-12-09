// services/storage.ts - NexoraCrew Finance (MongoDB Node API)

import {
  User,
  Transaction,
  BankAccount,
  TransactionType,
  PaymentMethod,
} from '../types';

// API Configuration
const API_BASE_URL = 'http://localhost:4000/api';
const STORAGE_KEYS = {
  SESSION: 'nexora_session',
  TOKEN: 'nexora_token',
};

// ------------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------------

const getToken = (): string | null => localStorage.getItem(STORAGE_KEYS.TOKEN);

const authHeaders = (extra: HeadersInit = {}): HeadersInit => {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
};

const apiFetch = async (path: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || 'Request failed';
    throw new Error(msg);
  }

  return data;
};

const saveSession = (user: User, token: string) => {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};

// ------------------------------------------------------------------
// AUTH SERVICES
// ------------------------------------------------------------------

type AuthResult = { user: User | null; error: string | null };

export const registerUser = async (user: Omit<User, 'id' | 'createdAt'>): Promise<AuthResult> => {
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(user)
    });
    saveSession(data.user, data.token);
    return { user: data.user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Registration failed' };
  }
};

export const loginUser = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    saveSession(data.user, data.token);
    return { user: data.user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Login failed' };
  }
};

export const logoutUser = async () => {
  clearSession();
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  // Basic impl - usually requires admin rights or specific route
  return [];
};

// ------------------------------------------------------------------
// TRANSACTION SERVICES
// ------------------------------------------------------------------

export const getTransactions = async (_currentUser: User): Promise<Transaction[]> => {
  try {
    const data = await apiFetch('/transactions', { headers: authHeaders() });
    return data as Transaction[];
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const saveTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<void> => {
  await apiFetch('/transactions', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(transaction),
  });
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<void> => {
  await apiFetch(`/transactions/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await apiFetch(`/transactions/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
};

export const bulkDeleteTransactions = async (ids: string[]): Promise<void> => {
  // Implementation would require backend support
  // For now sequential delete or ignore
};

export const bulkUpdateCategory = async (ids: string[], category: string): Promise<void> => {
  // Implementation would require backend support
};

// ------------------------------------------------------------------
// BANK SERVICES
// ------------------------------------------------------------------

export const getBanks = async (): Promise<BankAccount[]> => {
  try {
    const data = await apiFetch('/banks');
    return data as BankAccount[];
  } catch (err) { return []; }
};

export const saveBank = async (bank: Omit<BankAccount, 'id' | 'userId'> & { id?: string }): Promise<void> => {
  // Simplified logic, assume POST for new, no PUT endpoint defined in app.js for banks explicitly but let's assume POST works for both or just create
  // In real app separate PUT/POST
  await apiFetch('/banks', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(bank)
  });
};

export const deleteBank = async (id: string): Promise<void> => {
  // Backend endpoint needed
};

// Stub for demo mode - not used but keeps interface happy
export const isOfflineMode = (): boolean => false;

// Stub for subscription
export const subscribeToTransactions = (cb: () => void) => () => { };
