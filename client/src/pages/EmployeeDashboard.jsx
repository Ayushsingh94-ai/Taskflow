import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, updateTaskStatus, submitReport, getReports } from '../utils/api';
import toast from 'react-hot-toast';
import { LogOut, ClipboardList, FileText, Plus } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({
    task: '',
    progress: '',
    hoursWorked: '',
    blockers: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, reportsRes] = await Promise.all([
        getTasks(),
        getReports()
      ]);
      setTasks(tasksRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateTaskStatus(id, { status });
      setTasks(tasks.map(t => t._id === id ? { ...t, status } : t));
      toast.success('Status updated!');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitReport(reportData);
      toast.success('Report submitted successfully!');
      setShowReportForm(false);
      setReportData({ task: '', progress: '', hoursWorked: '', blockers: '' });
      const reportsRes = await getReports();
      setReports(reportsRes.data);
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-700';
    if (status === 'in-progress') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-red-100 text-red-700';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-indigo-600 text-xl font-semibold">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">TaskFlow</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">👋 Hello, {user?.name}</span>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <ClipboardList className="text-indigo-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">My Tasks</p>
              <p className="text-2xl font-bold text-gray-800">{tasks.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <ClipboardList className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl font-bold text-gray-800">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FileText className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Reports Submitted</p>
              <p className="text-2xl font-bold text-gray-800">{reports.length}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === 'tasks' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            My Tasks
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === 'reports' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            My Reports
          </button>
        </div>

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 gap-4">
            {tasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
                No tasks assigned yet.
              </div>
            ) : (
              tasks.map(task => (
                <div key={task._id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-800">{task.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mb-3">{task.description}</p>
                      {task.dueDate && (
                        <p className="text-gray-400 text-xs mb-3">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {['pending', 'in-progress', 'completed'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(task._id, status)}
                        className={`text-xs px-3 py-1 rounded-lg transition ${task.status === status ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">My Daily Reports</h2>
              <button
                onClick={() => setShowReportForm(!showReportForm)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus size={16} /> Submit Report
              </button>
            </div>

            {/* Report Form */}
            {showReportForm && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Report</h3>
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <select
                    value={reportData.task}
                    onChange={(e) => setReportData({ ...reportData, task: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select a task</option>
                    {tasks.map(task => (
                      <option key={task._id} value={task._id}>{task.title}</option>
                    ))}
                  </select>
                  <textarea
                    placeholder="What did you work on today?"
                    value={reportData.progress}
                    onChange={(e) => setReportData({ ...reportData, progress: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Hours worked"
                    value={reportData.hoursWorked}
                    onChange={(e) => setReportData({ ...reportData, hoursWorked: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <textarea
                    placeholder="Any blockers? (optional)"
                    value={reportData.blockers}
                    onChange={(e) => setReportData({ ...reportData, blockers: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                      Submit Report
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReportForm(false)}
                      className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Reports List */}
            <div className="grid grid-cols-1 gap-4">
              {reports.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
                  No reports submitted yet.
                </div>
              ) : (
                reports.map(report => (
                  <div key={report._id} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{report.task?.title}</h3>
                      <span className="text-xs text-gray-400">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{report.progress}</p>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>⏱ {report.hoursWorked} hours</span>
                      {report.blockers && report.blockers !== 'None' && (
                        <span>🚧 {report.blockers}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;