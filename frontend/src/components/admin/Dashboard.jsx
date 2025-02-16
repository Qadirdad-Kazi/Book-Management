import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import {
  FiUsers,
  FiBook,
  FiActivity,
  FiHardDrive,
  FiCpu,
  FiAlertCircle,
  FiDownload,
  FiUpload
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { getApiUrl } from '../../config/api';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    system: [],
    users: [],
    books: [],
    errors: []
  });
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchMetrics();
    fetchBackups();
  }, []);

  const fetchMetrics = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      const [systemRes, usersRes, booksRes, errorsRes] = await Promise.all([
        axios.get(getApiUrl('/api/admin/metrics/system'), config),
        axios.get(getApiUrl('/api/admin/metrics/users'), config),
        axios.get(getApiUrl('/api/admin/metrics/books'), config),
        axios.get(getApiUrl('/api/admin/metrics/errors'), config)
      ]);

      setMetrics({
        system: systemRes.data,
        users: usersRes.data,
        books: booksRes.data,
        errors: errorsRes.data
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error fetching metrics', { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBackups = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.get(
        getApiUrl('/api/admin/backups'),
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      setBackups(response.data);
    } catch (error) {
      console.error('Error fetching backups:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error fetching backups', { 
        variant: 'error' 
      });
    }
  };

  const handleCreateBackup = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.post(
        getApiUrl('/api/admin/backups'),
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      enqueueSnackbar('Backup created successfully', { variant: 'success' });
      fetchBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error creating backup', { 
        variant: 'error' 
      });
    }
  };

  const handleRestoreBackup = async (backupId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.post(
        getApiUrl(`/api/admin/backups/${backupId}/restore`),
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      enqueueSnackbar('Backup restored successfully', { variant: 'success' });
      fetchMetrics();
    } catch (error) {
      console.error('Error restoring backup:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error restoring backup', { 
        variant: 'error' 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FiUsers />}
          title="Total Users"
          value={metrics.users.total || 0}
          change={metrics.users.change || 0}
        />
        <StatCard
          icon={<FiBook />}
          title="Total Books"
          value={metrics.books.total || 0}
          change={metrics.books.change || 0}
        />
        <StatCard
          icon={<FiActivity />}
          title="Active Users"
          value={metrics.users.active || 0}
          change={metrics.users.activeChange || 0}
        />
        <StatCard
          icon={<FiAlertCircle />}
          title="Error Rate"
          value={`${metrics.errors.rate || 0}%`}
          change={metrics.errors.change || 0}
          negative
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Activity Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.users.activity || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Book Categories Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Book Categories</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.books.categories || []}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#3B82F6"
                label
              >
                {(metrics.books.categories || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Resources */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">System Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">CPU Usage</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    {metrics.system.cpu || 0}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div
                  style={{ width: `${metrics.system.cpu || 0}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Memory Usage</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                    {formatBytes(metrics.system.memory?.used || 0)} / {formatBytes(metrics.system.memory?.total || 0)}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                <div
                  style={{ width: `${(metrics.system.memory?.used / metrics.system.memory?.total) * 100 || 0}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                ></div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Disk Usage</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-yellow-600 bg-yellow-200">
                    {formatBytes(metrics.system.disk?.used || 0)} / {formatBytes(metrics.system.disk?.total || 0)}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-yellow-200">
                <div
                  style={{ width: `${(metrics.system.disk?.used / metrics.system.disk?.total) * 100 || 0}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Backups</h2>
          <button
            onClick={handleCreateBackup}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Create Backup
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backups.map((backup) => (
                <tr key={backup.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(backup.date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatBytes(backup.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      backup.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {backup.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRestoreBackup(backup.id)}
                      className="text-blue-600 hover:text-blue-900"
                      disabled={backup.status !== 'completed'}
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, change, negative }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex items-center justify-between">
      <div className="text-xl text-gray-500">{icon}</div>
      <div className={`text-sm ${negative ? (change > 0 ? 'text-red-500' : 'text-green-500') : (change > 0 ? 'text-green-500' : 'text-red-500')}`}>
        {change > 0 ? '+' : ''}{change}%
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-lg font-medium text-gray-900">{value}</h3>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  </div>
);

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default Dashboard;
