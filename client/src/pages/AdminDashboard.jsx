import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, createTask, deleteTask, getEmployees } from '../utils/api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, CheckSquare, Users, BarChart3,
  ChevronLeft, ChevronRight, Plus, Bell,
  Search, LogOut, Calendar, User, Trash2, X,
  CheckCircle2, Clock, TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState('all');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [formData, setFormData] = useState({
    title: '', description: '', assignedTo: '', priority: 'medium', dueDate: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, employeesRes] = await Promise.all([getTasks(), getEmployees()]);
      setTasks(tasksRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask(formData);
      setShowForm(false);
      setFormData({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
      toast.success('Task created!');
      fetchData();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success('Task deleted!');
    } catch (error) {
      toast.error('Failed to delete task');
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
    { title: 'Total Tasks', value: tasks.length, change: 'All time', icon: TrendingUp, gradient: 'from-blue-500/20 via-blue-500/5 to-transparent', iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400' },
    { title: 'Completed', value: tasks.filter(t => t.status === 'completed').length, change: 'Tasks done', icon: CheckCircle2, gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent', iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
    { title: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, change: 'Active now', icon: Clock, gradient: 'from-amber-500/20 via-amber-500/5 to-transparent', iconBg: 'bg-amber-500/20', iconColor: 'text-amber-400' },
    { title: 'Employees', value: employees.length, change: 'Team size', icon: Users, gradient: 'from-purple-500/20 via-purple-500/5 to-transparent', iconBg: 'bg-purple-500/20', iconColor: 'text-purple-400' },
  ];

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: CheckSquare, label: 'Tasks', id: 'tasks' },
    { icon: Users, label: 'Employees', id: 'employees' },
    { icon: BarChart3, label: 'Reports', id: 'reports' },
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
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 w-full"
          >
            <Plus className="h-4 w-4" />
            {!collapsed && <span>New Task</span>}
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full ${activeNav === item.id ? 'bg-blue-600/20 text-blue-400' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
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
                <p className="text-zinc-500 text-xs">Admin</p>
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
          <h1 className="text-xl font-semibold text-white capitalize">{activeNav}</h1>
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
                <p className="text-xs text-zinc-400">Admin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">

            {/* Dashboard & Tasks view */}
            {(activeNav === 'dashboard' || activeNav === 'tasks') && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
                  <p className="mt-1 text-zinc-400">Here's what's happening with your team today.</p>
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

                {/* Tasks Table */}
                <div className="rounded-xl border border-white/5 bg-[#13151F] shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b border-white/5">
                    <h3 className="text-lg font-semibold text-white">All Tasks</h3>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'pending', 'in-progress', 'completed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilter(status)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${filter === status ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}`}
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
                        <p className="text-sm mt-1">Create a new task to get started</p>
                      </div>
                    ) : (
                      filteredTasks.map(task => (
                        <div key={task._id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/5 hover:border-white/10">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="font-medium text-white truncate">{task.title}</h4>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[task.status]?.class}`}>
                                {statusConfig[task.status]?.label}
                              </span>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityConfig[task.priority]?.class}`}>
                                {priorityConfig[task.priority]?.label}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-500 line-clamp-1">{task.description}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-zinc-500">
                            {task.dueDate && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <User className="h-4 w-4" />
                              <span>{task.assignedTo?.name}</span>
                            </div>
                            <button
                              onClick={() => handleDelete(task._id)}
                              className="rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Employees View */}
            {activeNav === 'employees' && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-white">Team Members 👥</h2>
                  <p className="mt-1 text-zinc-400">{employees.length} employee{employees.length !== 1 ? 's' : ''} in your workspace</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#13151F] shadow-lg">
                  <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-semibold text-white">All Employees</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {employees.length === 0 ? (
                      <div className="py-12 text-center text-zinc-500">
                        <p className="text-4xl mb-3">👥</p>
                        <p className="font-medium">No employees yet</p>
                        <p className="text-sm mt-1">Employees will appear here after they register</p>
                      </div>
                    ) : (
                      employees.map(emp => (
                        <div key={emp._id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/5 transition-all">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {emp.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white text-sm">{emp.name}</p>
                            <p className="text-xs text-zinc-500">{emp.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full ring-1 ring-blue-500/30">
                              {tasks.filter(t => t.assignedTo?._id === emp._id).length} tasks
                            </span>
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full ring-1 ring-emerald-500/30">
                              {tasks.filter(t => t.assignedTo?._id === emp._id && t.status === 'completed').length} done
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Reports View */}
            {activeNav === 'reports' && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-white">Reports Overview 📊</h2>
                  <p className="mt-1 text-zinc-400">Track progress across all tasks and employees</p>
                </div>

                {/* Report Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { label: 'Total Tasks', value: tasks.length, color: 'text-blue-400', bg: 'bg-blue-500/20' },
                    { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
                    { label: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: 'text-amber-400', bg: 'bg-amber-500/20' },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl border border-white/5 bg-[#13151F] p-6">
                      <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
                        <BarChart3 className={`h-5 w-5 ${s.color}`} />
                      </div>
                      <p className="text-zinc-400 text-sm">{s.label}</p>
                      <p className={`text-3xl font-bold ${s.color} mt-1`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-white/5 bg-[#13151F] shadow-lg">
                  <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-semibold text-white">Task Status Report</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {tasks.length === 0 ? (
                      <div className="py-12 text-center text-zinc-500">
                        <p className="text-4xl mb-3">📊</p>
                        <p className="font-medium">No data yet</p>
                      </div>
                    ) : (
                      tasks.map(task => (
                        <div key={task._id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/5 transition-all">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-white text-sm">{task.title}</p>
                              <p className="text-xs text-zinc-500 mt-1">
                                Assigned to: <span className="text-zinc-300">{task.assignedTo?.name}</span>
                                {task.dueDate && <span> · Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[task.status]?.class}`}>
                                {statusConfig[task.status]?.label}
                              </span>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityConfig[task.priority]?.class}`}>
                                {priorityConfig[task.priority]?.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#13151F] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
              <h3 className="font-semibold text-white">Create New Task</h3>
              <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Design the landing page"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description</label>
                <textarea
                  placeholder="What needs to be done?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Assign To</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="" className="bg-[#13151F]">Select employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id} className="bg-[#13151F]">{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="low" className="bg-[#13151F]">Low</option>
                    <option value="medium" className="bg-[#13151F]">Medium</option>
                    <option value="high" className="bg-[#13151F]">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium transition-all">
                  Create Task
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-zinc-300 py-2.5 rounded-lg text-sm font-medium transition-all">
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

export default AdminDashboard;