'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  phone?: string;
  address?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    role: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, [user, filters, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.role && { role: filters.role }),
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages,
      }));
    } catch (error) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      // Refresh users list
      fetchUsers();
    } catch (error) {
      setError('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Refresh users list
      fetchUsers();
    } catch (error) {
      setError('Failed to delete user');
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/dashboard" className="text-white/70 hover:text-white mr-4">
                  ← Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-white">
                  Admin Users Management
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-white/90 text-sm">
                  Admin: <span className="font-semibold">{user.name}</span>
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Role</label>
                  <select
                    value={filters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Users ({pagination.total})
              </h2>
              <div className="text-white/70 text-sm">
                Page {pagination.page} of {pagination.pages}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-white/70 mt-4">Loading users...</p>
              </div>
            ) : error ? (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-2xl">
                {error}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
                  <p className="text-white/70 text-lg">No users found.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((userItem) => (
                  <div
                    key={userItem._id}
                    className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 transition-all duration-300 hover:bg-white/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">{userItem.name}</h3>
                          <p className="text-white/80 text-sm mb-3">{userItem.email}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <select
                            value={userItem.role}
                            onChange={(e) => handleRoleChange(userItem._id, e.target.value as 'admin' | 'user')}
                            className="px-3 py-1 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            userItem.role === 'admin' ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30' :
                            'bg-blue-500/20 text-blue-200 border border-blue-500/30'
                          }`}>
                            {userItem.role}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70 mb-4">
                        <div>
                          <span className="font-medium">Phone:</span> {userItem.phone || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Address:</span> {userItem.address || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Joined:</span> {new Date(userItem.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">User ID:</span> {userItem._id}
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleDeleteUser(userItem._id)}
                          disabled={userItem._id === user._id}
                          className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {userItem._id === user._id ? 'Cannot Delete Self' : 'Delete User'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-2xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-white/70">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-2xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 