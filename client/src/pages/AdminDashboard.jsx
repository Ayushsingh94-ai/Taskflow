import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, updateTaskStatus, submitReport, getReports } from '../utils/api';
import toast from 'react-hot-toast';
import { ClipboardList, FileText, LogOut, Plus, X } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({
    task: '', progress: '', hoursWorked: '', blockers: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, reportsRes] = await Promise.all([getTasks(), getReports()]);
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
      toast.success('Report submitted!');
      setShowReportForm(false);
      setReportData({ task: '', progress: '', hoursWorked: '', blockers: '' });
      const reportsRes = await getReports();
      setReports(reportsRes.data);
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'completed') return 'bg-emerald-100 text-emerald-700';
    if (status === 'in-progress') return 'bg-blue-100 text-blue-700';
    return 'bg-amber-100 text-amber-700';
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'high') return 'bg-red-100 text-red-700';
    if (priority === 'medium') return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-blue-600 text-xl font-semibold">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0D1426] flex flex-col fixed h-full z-10">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="text-white font-bold text-lg">TaskFlow</span>
          </div>
        </div>
        <div className="p-3 flex-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider px-3 mb-2 mt-2">Menu</p>
          {[
            { id: 'tasks', label: 'My Tasks', icon: ClipboardList },
            { id: 'reports', label: 'My Reports', icon: FileText },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all ${activeTab === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white text-xs font-medium">{user?.name}</p>
              <p className="text-slate-500 text-xs">Employee</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-56 flex-1 bg-gray-50 min-h-screen">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {activeTab === 'tasks' ? 'My Tasks' : 'My Reports'}
            </h1>
            <p className="text-xs text-gray-400">
              {activeTab === 'tasks' ? `${tasks.length} task${tasks.length !== 1 ? 's' : ''} assigned to you` : `${reports.length} report${reports.length !== 1 ? 's' : ''} submitted`}
            </p>
          </div>
          {activeTab === 'reports' && (
            <button
              onClick={() => setShowReportForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-200"
            >
              <Plus size={16} /> Submit Report
            </button>
          )}
        </div>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            {[
              { label: 'My Tasks', value: tasks.length, icon: '📋', bg: 'bg-blue-50', text: 'text-blue-600' },
              { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, icon: '✅', bg: 'bg-emerald-50', text: 'text-emerald-600' },
              { label: 'Reports Submitted', value: reports.length, icon: '📝', bg: 'bg-purple-50', text: 'text-purple-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center text-lg mb-3`}>{stat.icon}</div>
                <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.text}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Assigned Tasks</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {tasks.length === 0 ? (
                  <div className="py-16 text-center text-gray-300">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="font-medium">No tasks assigned yet</p>
                    <p className="text-sm">Your manager will assign tasks to you soon</p>
                  </div>
                ) : (
                  tasks.map(task => (
                    <div key={task._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-800 text-sm">{task.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityBadge(task.priority)}`}>{task.priority}</span>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{task.description}</p>
                          {task.dueDate && <p className="text-xs text-gray-400">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadge(task.status)}`}>{task.status}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {['pending', 'in-progress', 'completed'].map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(task._id, status)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${task.status === status ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Submitted Reports</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{reports.length} total</span>
              </div>
              <div className="divide-y divide-gray-50">
                {reports.length === 0 ? (
                  <div className="py-16 text-center text-gray-300">
                    <p className="text-4xl mb-3">📝</p>
                    <p className="font-medium">No reports yet</p>
                    <p className="text-sm">Submit your first daily report</p>
                  </div>
                ) : (
                  reports.map(report => (
                    <div key={report._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-800 text-sm">{report.task?.title}</h3>
                        <span className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{report.progress}</p>
                      <div className="flex gap-4">
                        <span className="text-xs text-gray-400">⏱ {report.hoursWorked} hrs worked</span>
                        {report.blockers && report.blockers !== 'None' && (
                          <span className="text-xs text-red-400">🚧 {report.blockers}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Report Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Submit Daily Report</h3>
              <button onClick={() => setShowReportForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Select Task</label>
                <select
                  value={reportData.task}
                  onChange={(e) => setReportData({ ...reportData, task: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a task</option>
                  {tasks.map(task => (
                    <option key={task._id} value={task._id}>{task.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">What did you work on today?</label>
                <textarea
                  placeholder="Describe your progress..."
                  value={reportData.progress}
                  onChange={(e) => setReportData({ ...reportData, progress: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Hours Worked</label>
                <input
                  type="number"
                  placeholder="e.g. 6"
                  value={reportData.hoursWorked}
                  onChange={(e) => setReportData({ ...reportData, hoursWorked: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Any blockers? <span className="text-gray-400">(optional)</span></label>
                <textarea
                  placeholder="e.g. Waiting for API docs..."
                  value={reportData.blockers}
                  onChange={(e) => setReportData({ ...reportData, blockers: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-all">
                  Submit Report
                </button>
                <button type="button" onClick={() => setShowReportForm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;