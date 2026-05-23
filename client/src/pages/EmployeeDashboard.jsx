import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, updateTaskStatus, submitReport, getReports } from '../utils/api';
import toast from 'react-hot-toast';
import {
  CheckSquare, BarChart3, ChevronLeft, ChevronRight,
  Bell, Search, LogOut, Calendar, X, Plus,
  CheckCircle2, Clock, FileText
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState('all');
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

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const statusConfig = {
    completed: { label: 'Completed', class: 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' },
    'in-progress': { label: 'In Progress', class: 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30' },
    pending: { label: 'Pending', class: 'bg-zinc-500/20 text-zinc-400 ring-1 ring-zinc-500/30' },
  };

  const priorityConfig = {
    high: { label: 'High', class: 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30' },
    medium: { label: 'Medium', class: 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30' },
    low: { label: 'Low', class: 'bg-zinc-500/20 text-zinc-400 ring-1 ring-zinc-500/30' },
  };

  const stats = [
    { title: 'My Tasks', value: tasks.length, change: 'Assigned to you', icon: CheckSquare, gradient: 'from-blue-500/20 via-blue-500/5 to-transparent', iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400' },
    { title: 'Completed', value: tasks.filter(t => t.status === 'completed').length, change: 'Tasks done', icon: CheckCircle2, gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent', iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
    { title: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, change: 'Active now', icon: Clock, gradient: 'from-amber-500/20 via-amber-500/5 to-transparent', iconBg: 'bg-amber-500/20', iconColor: 'text-amber-400' },
    { title: 'Reports', value: reports.length, change: 'Submitted', icon: FileText, gradient: 'from-purple-500/20 via-purple-500/5 to-transparent', iconBg: 'bg-purple-500/20', iconColor: 'text-purple-400' },
  ];

  const navItems = [
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
    { id: 'reports', label: 'My Reports', icon: BarChart3 },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1117]">
      <div className="text-blue-400 text-xl font-semibold">Loading...</div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F1117]">
      {/* Sidebar */}
      <aside className={`flex h-screen flex-col bg-[#13151F] border-r border-white/5 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-4">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-500/30">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">TaskFlow</span>
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 mx-auto">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        <div className="p-4">
          <button
            onClick={() => setShowReportForm(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 w-full"
          >
            <Plus className="h-4 w-4" />
            {!collapsed && <span>Submit Report</span>}
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full ${activeTab === id ? 'bg-blue-600/20 text-blue-400' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/5 p-3">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white text-xs font-medium">{user?.name}</p>
                <p className="text-zinc-500 text-xs">Employee</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="h-5 w-5 shrink-0" /> : <><ChevronLeft className="h-5 w-5 shrink-0" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/5 bg-[#13151F]/80 backdrop-blur-sm px-6">
          <h1 className="text-xl font-semibold text-white">
            {activeTab === 'tasks' ? 'My Tasks' : 'My Reports'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                placeholder="Search tasks..."
                className="w-64 bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button className="relative rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500" />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium ring-2 ring-blue-500/30">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-zinc-400">Employee</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
              <p className="mt-1 text-zinc-400">Here's your work summary for today.</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.title} className="relative overflow-hidden rounded-xl border border-white/5 bg-[#13151F] p-6 shadow-lg">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} pointer-events-none`} />
                  <div className="relative flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-zinc-400">{stat.title}</p>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <div className="relative">
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <p className="mt-1 text-xs text-zinc-500">{stat.change}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="rounded-xl border border-white/5 bg-[#13151F] shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b border-white/5">
                  <h3 className="text-lg font-semibold text-white">Assigned Tasks</h3>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'pending', 'in-progress', 'completed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${filter === status ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}`}
                      >
                        {status === 'all' ? 'All' : status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  {filteredTasks.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500">
                      <p className="text-4xl mb-3">📭</p>
                      <p className="font-medium">No tasks found</p>
                      <p className="text-sm mt-1">Your manager will assign tasks soon</p>
                    </div>
                  ) : (
                    filteredTasks.map(task => (
                      <div key={task._id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/5 hover:border-white/10">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="font-medium text-white">{task.title}</h4>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityConfig[task.priority]?.class}`}>
                                {priorityConfig[task.priority]?.label}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-500">{task.description}</p>
                            {task.dueDate && (
                              <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-500">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[task.status]?.class}`}>
                            {statusConfig[task.status]?.label}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {['pending', 'in-progress', 'completed'].map(status => (
                            <button
                              key={status}
                              onClick={() => handleStatusUpdate(task._id, status)}
                              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${task.status === status ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}`}
                            >
                              {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
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
              <div className="rounded-xl border border-white/5 bg-[#13151F] shadow-lg">
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                  <h3 className="text-lg font-semibold text-white">Submitted Reports</h3>
                  <span className="text-xs text-zinc-400 bg-white/5 px-2 py-1 rounded-full">{reports.length} total</span>
                </div>
                <div className="p-6 space-y-3">
                  {reports.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500">
                      <p className="text-4xl mb-3">📝</p>
                      <p className="font-medium">No reports yet</p>
                      <p className="text-sm mt-1">Submit your first daily report</p>
                    </div>
                  ) : (
                    reports.map(report => (
                      <div key={report._id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/5 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-white text-sm">{report.task?.title}</h4>
                          <span className="text-xs text-zinc-500">{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-zinc-400 mb-2">{report.progress}</p>
                        <div className="flex gap-4 text-xs text-zinc-500">
                          <span>⏱ {report.hoursWorked} hrs</span>
                          {report.blockers && report.blockers !== 'None' && (
                            <span className="text-red-400">🚧 {report.blockers}</span>
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
      </div>

      {/* Report Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#13151F] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
              <h3 className="font-semibold text-white">Submit Daily Report</h3>
              <button onClick={() => setShowReportForm(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Select Task</label>
                <select
                  value={reportData.task}
                  onChange={(e) => setReportData({ ...reportData, task: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="" className="bg-[#13151F]">Choose a task</option>
                  {tasks.map(task => (
                    <option key={task._id} value={task._id} className="bg-[#13151F]">{task.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">What did you work on today?</label>
                <textarea
                  placeholder="Describe your progress..."
                  value={reportData.progress}
                  onChange={(e) => setReportData({ ...reportData, progress: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Hours Worked</label>
                <input
                  type="number"
                  placeholder="e.g. 6"
                  value={reportData.hoursWorked}
                  onChange={(e) => setReportData({ ...reportData, hoursWorked: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Any blockers? <span className="text-zinc-600">(optional)</span></label>
                <textarea
                  placeholder="e.g. Waiting for API docs..."
                  value={reportData.blockers}
                  onChange={(e) => setReportData({ ...reportData, blockers: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium transition-all">
                  Submit Report
                </button>
                <button type="button" onClick={() => setShowReportForm(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-zinc-300 py-2.5 rounded-lg text-sm font-medium transition-all">
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