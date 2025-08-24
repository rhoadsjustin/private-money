import { create } from 'zustand';
import { getItem, setItem } from './mmkvStore';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
}

export interface Goal {
  id: string;
  category: string;
  target: number;
}

export interface FixedExpense {
  name: string;
  amount: number;
}

interface BudgetStore {
  transactions: Transaction[];
  goals: Goal[];
  fixedExpenses: FixedExpense[];
  income: number;

  // actions
  setIncome: (amount: number) => void;
  addFixedExpense: (name: string, amount: number) => void;
  categorizeTxn: (id: string, category: string) => void;
  setTransactions: (txns: Transaction[]) => void;
  setGoals: (goals: Goal[]) => void;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  transactions: getItem<Transaction[]>('transactions') ?? [],
  goals: getItem<Goal[]>('goals') ?? [],
  fixedExpenses: getItem<FixedExpense[]>('fixedExpenses') ?? [],
  income: getItem<number>('income') ?? 0,

  setIncome: (amount: number) => {
    set({ income: amount });
    setItem('income', amount);
  },

  addFixedExpense: (name: string, amount: number) => {
    const updated = [...get().fixedExpenses, { name, amount }];
    set({ fixedExpenses: updated });
    setItem('fixedExpenses', updated);
  },

  categorizeTxn: (id: string, category: string) => {
    const updated = get().transactions.map((txn) => (txn.id === id ? { ...txn, category } : txn));
    set({ transactions: updated });
    setItem('transactions', updated);
  },

  setTransactions: (txns) => {
    set({ transactions: txns });
    setItem('transactions', txns);
  },

  setGoals: (goals) => {
    set({ goals });
    setItem('goals', goals);
  },
}));
