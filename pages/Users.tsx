import React, { useEffect, useState } from 'react';
import type { User } from '../types';
import { getAllUsers } from '../services/storage';

export const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getAllUsers(); // async call to backend/local
        if (!cancelled) {
          setUsers(data);
        }
      } catch (err: any) {
        console.error('Failed to load users:', err);
        if (!cancelled) {
          setError(err.message || 'Failed to load users');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400 text-sm md:text-base">Loading users…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="bg-red-900/40 border border-red-500/70 px-4 py-3 rounded-lg max-w-md w-full text-center">
          <p className="text-red-100 text-sm md:text-base font-medium">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 md:px-8 py-6 md:py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Team Crew
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-400">
            All NexoraCrew members registered in the system.
          </p>
        </div>

        {users.length === 0 ? (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl px-4 py-10 text-center">
            <p className="text-sm md:text-base text-slate-400">
              No users found. Create an account from the login page to see it
              listed here.
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
            <table className="min-w-full text-sm md:text-base">
              <thead className="bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-800/70 hover:bg-slate-900/60 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium text-slate-50">
                        {u.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                      {u.position || 'Member'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400 text-xs md:text-sm">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// default export (in case something imports default)
export default UsersList;
