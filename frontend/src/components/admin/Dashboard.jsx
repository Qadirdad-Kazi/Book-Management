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
      const [systemRes, usersRes, booksRes, errorsRes] = await Promise.all([
        axios.get('http://localhost:5555/api/admin/metrics/system'),
        axios.get('http://localhost:5555/api/admin/metrics/users'),
        axios.get('http://localhost:5555/api/admin/metrics/books'),
        axios.get('http://localhost:5555/api/admin/logs/errors')
      ]);

      setMetrics({
        system: systemRes.data,
        users: usersRes.data,
        books: booksRes.data,
        errors: errorsRes.data
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      enqueueSnackbar('Error fetching metrics', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchBackups = async () => {
    try {
      const response = await axios.get('http://localhost:5555/api/admin/backups');
      setBackups(response.data);
    } catch (error) {
      console.error('Error fetching backups:', error);
      enqueueSnackbar('Error fetching backups', { variant: 'error' });
    }
  };

  const createBackup = async () => {
    try {
      await axios.post('http://localhost:5555/api/admin/backup');
      enqueueSnackbar('Backup created successfully', { variant: 'success' });
      fetchBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      enqueueSnackbar('Error creating backup', { variant: 'error' });
    }
  };

  const clearErrorLogs = async () => {
    try {
      await axios.delete('http://localhost:5555/api/admin/logs/errors');
      enqueueSnackbar('Error logs cleared', { variant: 'success' });
      fetchMetrics();
    } catch (error) {
      console.error('Error clearing logs:', error);
      enqueueSnackbar('Error clearing logs', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getErrorRate = () => {
    const latestMetrics = metrics.system[metrics.system.length - 1] || {};
    const failed = latestMetrics?.requests?.failed || 0;
    const total = latestMetrics?.requests?.total || 1;
    return `${((failed / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="p-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FiUsers />}
          title="Total Users"
          value={metrics.users[metrics.users.length - 1]?.totalUsers || 0}
          change="+12%"
        />
        <StatCard
          icon={<FiBook />}
          title="Total Books"
          value={metrics.books[metrics.books.length - 1]?.totalBooks || 0}
          change="+8%"
        />
        <StatCard
          icon={<FiActivity />}
          title="Active Users"
          value={metrics.users[metrics.users.length - 1]?.activeUsers || 0}
          change="+5%"
        />
        <StatCard
          icon={<FiAlertCircle />}
          title="Error Rate"
          value={getErrorRate()}
          change="-2%"
          negative
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Activity Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">User Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.users}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="activeUsers" stroke="#3B82F6" />
              <Line type="monotone" dataKey="newUsers" stroke="#10B981" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* System Performance Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">System Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.system}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cpu.usage" stroke="#EF4444" />
              <Line type="monotone" dataKey="memory.used" stroke="#8B5CF6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Backups and Error Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backups */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Backups</h3>
            <button
              onClick={createBackup}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Backup
            </button>
          </div>
          <div className="space-y-4">
            {backups.map((backup, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{new Date(backup.timestamp).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Size: {formatBytes(backup.size)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-blue-600 hover:text-blue-800">
                    <FiDownload />
                  </button>
                  <button className="p-2 text-green-600 hover:text-green-800">
                    <FiUpload />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Logs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Error Logs</h3>
            <button
              onClick={clearErrorLogs}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Clear Logs
            </button>
          </div>
          <div className="space-y-4">
            {metrics.errors.map((error, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{error.code}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(error.timestamp).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-gray-600">{error.message}</p>
                <p className="text-xs text-gray-500 mt-1">{error.endpoint}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, change, negative }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="text-gray-500">{icon}</div>
      <div className={`text-sm ${negative ? 'text-red-500' : 'text-green-500'}`}>
        {change}
      </div>
    </div>
    <h3 className="text-2xl font-bold">{value}</h3>
    <p className="text-gray-500">{title}</p>
  </div>
);

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default Dashboard;
