// services/storage.ts - NexoraCrew Finance (MongoDB API + Offline Demo)

// NOTE: Backend base URL must be set in .env.local as:
// VITE_API_URL=http://localhost:4000/api

import {
  User,
  Transaction,
  BankAccount,
  TransactionType,
  PaymentMethod,
} from '../types';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '';


// If no API configured -> offline/demo mode using LocalStorage
const isDemoMode = !API_BASE_URL;

if (isDemoMode) {
  console.warn(
    '⚠️ API NOT CONFIGURED: Running in Offline/Demo Mode using LocalStorage.'
  );
}

const STORAGE_KEYS = {
  USERS: 'nexora_users',
  TRANSACTIONS: 'nexora_transactions',
  SESSION: 'nexora_session',
  TOKEN: 'nexora_token',
};

// ------------------------------------------------------------------
// LOCALSTORAGE HELPERS (Demo Mode)
// ------------------------------------------------------------------

const getLocalUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

const getLocalTransactions = (): Transaction[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
};

const saveLocalTransactions = (tx: Transaction[]) => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(tx));
};

// ------------------------------------------------------------------
// API HELPERS (Online Mode)
// ------------------------------------------------------------------

const getToken = (): string | null =>
  localStorage.getItem(STORAGE_KEYS.TOKEN);

const authHeaders = (extra: HeadersInit = {}): HeadersInit => {
  const token = getToken();
  return token
    ? {
        ...extra,
        Authorization: `Bearer ${token}`,
      }
    : extra;
};

const apiFetch = async (path: string, options: RequestInit = {}) => {
  if (!API_BASE_URL) {
    throw new Error('API not configured (VITE_API_URL missing)');
  }

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
// REAL-TIME / SUBSCRIPTION (Poll-based)
// ------------------------------------------------------------------

export const subscribeToTransactions = (onUpdate: () => void) => {
  if (isDemoMode) {
    // In demo mode, nothing external to listen to
    return () => {};
  }

  // Simple polling: refresh every 15 seconds
  const interval = setInterval(onUpdate, 15000);
  return () => clearInterval(interval);
};

// ------------------------------------------------------------------
// AUTH SERVICES
// ------------------------------------------------------------------

type AuthResult = { user: User | null; error: string | null };

export const registerUser = async (
  user: Omit<User, 'id' | 'createdAt'>
): Promise<AuthResult> => {
  // DEMO MODE: LocalStorage only
  if (isDemoMode) {
    const users = getLocalUsers();
    if (users.find((u) => u.email === user.email)) {
      return { user: null, error: 'Demo Mode: Email already taken.' };
    }

    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newUser));
    return { user: newUser, error: null };
  }

  // ONLINE MODE: Call backend /auth/register
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        password: user.password,
        position: user.position,
      }),
    });

    const mappedUser = data.user as User;
    const token = data.token as string;
    saveSession(mappedUser, token);

    return { user: mappedUser, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Registration failed' };
  }
};

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  // DEMO MODE
  if (isDemoMode) {
    const users = getLocalUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) return { user: null, error: 'Demo Mode: Invalid credentials.' };

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    return { user, error: null };
  }

  // ONLINE MODE
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const user = data.user as User;
    const token = data.token as string;
    saveSession(user, token);

    return { user, error: null };
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
  if (isDemoMode) {
    return getLocalUsers();
  }

  const data = await apiFetch('/users', {
    headers: authHeaders(),
  });
  return data as User[];
};

// ------------------------------------------------------------------
// TRANSACTION SERVICES
// ------------------------------------------------------------------

export const getTransactions = async (_currentUser: User): Promise<
  Transaction[]
> => {
  // _currentUser kept for compatibility, backend uses JWT

  if (isDemoMode) {
    const all = getLocalTransactions();
    return all.sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  try {
    const data = await apiFetch('/transactions', {
      headers: authHeaders(),
    });

    return (data as any[]).map(
      (t): Transaction => ({
        id: t.id,
        userId: t.userId,
        userName: t.userName,
        date: t.date,
        type: t.type as TransactionType,
        category: t.category,
        amount: t.amount,
        paymentMethod: t.paymentMethod as PaymentMethod,
        description: t.description,
        attachment: t.attachment,
        bankAccountId: t.bankAccountId,
        bankName: t.bankName,
        createdAt: t.createdAt,
        investmentType: t.investmentType,
        investors: t.investors,
      })
    );
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const saveTransaction = async (
  transaction: Omit<Transaction, 'id' | 'createdAt'>
): Promise<void> => {
  // DEMO MODE
  if (isDemoMode) {
    const all = getLocalTransactions();
    const newTx: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    all.push(newTx);
    saveLocalTransactions(all);
    return;
  }

  // ONLINE MODE (create)
  await apiFetch('/transactions', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(transaction),
  });
};

export const updateTransaction = async (
  id: string,
  updates: Partial<Transaction>
): Promise<void> => {
  // DEMO MODE
  if (isDemoMode) {
    const all = getLocalTransactions();
    const index = all.findIndex((t) => t.id === id);
    if (index !== -1) {
      all[index] = { ...all[index], ...updates };
      saveLocalTransactions(all);
    }
    return;
  }

  // ONLINE MODE
  await apiFetch(`/transactions/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });
};

export const deleteTransaction = async (id: string): Promise<void> => {
  if (isDemoMode) {
    let all = getLocalTransactions();
    all = all.filter((t) => t.id !== id);
    saveLocalTransactions(all);
    return;
  }

  await apiFetch(`/transactions/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
};

export const bulkDeleteTransactions = async (
  ids: string[]
): Promise<void> => {
  if (isDemoMode) {
    let all = getLocalTransactions();
    all = all.filter((t) => !ids.includes(t.id));
    saveLocalTransactions(all);
    return;
  }

  await apiFetch('/transactions/bulk-delete', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  });
};

export const bulkUpdateCategory = async (
  ids: string[],
  category: string
): Promise<void> => {
  if (isDemoMode) {
    const all = getLocalTransactions();
    ids.forEach((id) => {
      const tx = all.find((t) => t.id === id);
      if (tx) tx.category = category;
    });
    saveLocalTransactions(all);
    return;
  }

  await apiFetch('/transactions/bulk-category', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ids, category }),
  });
};

// ------------------------------------------------------------------
// BANK SERVICES  (still LocalStorage for now)
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// BANK SERVICES  (MongoDB backend + offline demo)
// ------------------------------------------------------------------

export const getBanks = async (): Promise<BankAccount[]> => {
  // DEMO MODE → still use LocalStorage so app works with no API
  if (isDemoMode) {
    const data = localStorage.getItem('nexora_banks');
    return data ? JSON.parse(data) : [];
  }

  const data = await apiFetch('/banks', {
    headers: authHeaders(),
  });

  return data as BankAccount[];
};

export const saveBank = async (
  bank: Omit<BankAccount, 'id' | 'userId'> & { id?: string }
): Promise<void> => {
  // DEMO MODE → LocalStorage
  if (isDemoMode) {
    const banks = await getBanks();
    if (bank.id) {
      const updated = banks.map((b) =>
        b.id === bank.id ? { ...b, ...bank } : b
      );
      localStorage.setItem('nexora_banks', JSON.stringify(updated));
    } else {
      const newBank = { ...bank, id: crypto.randomUUID() };
      banks.push(newBank as BankAccount);
      localStorage.setItem('nexora_banks', JSON.stringify(banks));
    }
    return;
  }

  // ONLINE MODE → call backend
  if (bank.id) {
    const { id, ...rest } = bank;
    await apiFetch(`/banks/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(rest),
    });
  } else {
    await apiFetch('/banks', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(bank),
    });
  }
};

export const deleteBank = async (id: string): Promise<void> => {
  // DEMO MODE
  if (isDemoMode) {
    const banks = await getBanks();
    const filtered = banks.filter((b) => b.id !== id);
    localStorage.setItem('nexora_banks', JSON.stringify(filtered));
    return;
  }

  // ONLINE MODE
  await apiFetch(`/banks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
};

export const isOfflineMode = (): boolean => isDemoMode;
