import React, { useEffect, useState } from 'react';
import type { BankAccount } from '../types';
import { getBanks, saveBank, deleteBank } from '../services/storage';

export const Banks: React.FC = () => {
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [form, setForm] = useState<Omit<BankAccount, 'id'>>({
    bankName: '',
    holderName: '',
    cardNumber: '',
    expiryDate: '',
    cardType: 'DEBIT' as any,
  });

  // Load banks on mount
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getBanks();
        if (!cancelled) {
          setBanks(data);
        }
      } catch (err: any) {
        console.error('Failed to load banks:', err);
        if (!cancelled) {
          setError(err.message || 'Failed to load banks');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({
      bankName: '',
      holderName: '',
      cardNumber: '',
      expiryDate: '',
      cardType: 'DEBIT' as any,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await saveBank(
        editing ? { ...form, id: editing.id } : form
      );

      const updated = await getBanks();
      setBanks(updated);
      resetForm();
    } catch (err: any) {
      console.error('Failed to save bank:', err);
      setError(err.message || 'Failed to save bank');
    }
  };

  const handleEdit = (bank: BankAccount) => {
    setEditing(bank);
    setForm({
      bankName: bank.bankName,
      holderName: bank.holderName,
      cardNumber: bank.cardNumber,
      expiryDate: bank.expiryDate,
      cardType: bank.cardType,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bank/card?')) return;
    try {
      await deleteBank(id);
      const updated = await getBanks();
      setBanks(updated);
    } catch (err: any) {
      console.error('Failed to delete bank:', err);
      setError(err.message || 'Failed to delete bank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400 text-sm md:text-base">
          Loading bank accounts…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 md:px-8 py-6 md:py-8">
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Bank & Card Accounts
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-400">
            Manage the accounts used for NexoraCrew financial transactions.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-500/70 px-4 py-3 rounded-lg text-sm text-red-100">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 md:p-6 space-y-4 shadow-lg shadow-slate-950/60"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Bank Name
              </label>
              <input
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                placeholder="SBI, HDFC, ICICI..."
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Account Holder
              </label>
              <input
                name="holderName"
                value={form.holderName}
                onChange={handleChange}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                placeholder="Full name on card"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Card Number
              </label>
              <input
                name="cardNumber"
                value={form.cardNumber}
                onChange={handleChange}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Expiry Date
              </label>
              <input
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                placeholder="MM/YY"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Card Type
              </label>
              <select
                name="cardType"
                value={form.cardType}
                onChange={handleChange}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              >
                <option value="DEBIT">Debit</option>
                <option value="CREDIT">Credit</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 rounded-lg text-sm bg-slate-800/70 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 transition-colors shadow-md shadow-blue-900/50"
            >
              {editing ? 'Update Account' : 'Add Account'}
            </button>
          </div>
        </form>

        {/* LIST */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-lg shadow-slate-950/60">
          {banks.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm md:text-base text-slate-400">
              No bank accounts added yet.
            </div>
          ) : (
            <table className="min-w-full text-sm md:text-base">
              <thead className="bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium">
                    Bank
                  </th>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium">
                    Holder
                  </th>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium">
                    Card
                  </th>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium">
                    Expiry
                  </th>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-slate-400 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {banks.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-slate-800/70 hover:bg-slate-900/60 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {b.bankName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {b.holderName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {b.cardNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {b.expiryDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {b.cardType}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleEdit(b)}
                        className="text-xs px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-xs px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Banks;
