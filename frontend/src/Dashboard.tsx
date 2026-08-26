import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { ThemePicker, type ThemeName } from './ThemePicker';
import { PlayerHud, type UserStats } from './components/PlayerHud';
import { PomodoroTimer } from './components/PomodoroTimer';
import { AnalyticsView } from './components/AnalyticsView';
import { KanbanBoard } from './components/KanbanBoard';
import { CommandPalette } from './components/CommandPalette';
import { AchievementsModal } from './components/AchievementsModal';
import { soundEffects } from './utils/SoundEffects';
import {
  generateAiSubtasks,
  exportTasksToCsv,
  exportTasksToMarkdown,
  exportTasksToJson,
} from './utils/TaskHelpers';

export interface TaskStep {
  id?: string;
  title: string;
  completed: boolean;
  order?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category?: { id: string; name: string } | null;
  createdAt: string;
  dueDate?: string | null;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  estimatedMinutes?: number;
  kanbanStatus?: string;
  isRecurring?: boolean;
  recurrenceRule?: string | null;
  steps?: TaskStep[];
}

interface DashboardProps {
  userEmail?: string;
  onLogout?: () => void;
  currentTheme?: ThemeName;
  onThemeChange?: (theme: ThemeName) => void;
}

type ViewMode = 'list' | 'cards' | 'table' | 'kanban' | 'analytics';
type SortField = 'title' | 'category' | 'status' | 'createdAt' | 'dueDate' | 'priority';
type SortOrder = 'asc' | 'desc';

// FUNNY ROAST SYSTEM
const FUNNY_OVERDUE_ROASTS = [
  { emoji: '💀', title: 'Deadline Left The Chat', quote: 'This was due in the previous epoch. Even the final boss gave up waiting!' },
  { emoji: '🦥', title: 'Sloth Speed Activated', quote: 'Procrastination lvl: 9999. Pro gamer move: finish it now before it fossils!' },
  { emoji: '🧟', title: 'Zombie Quest Alert', quote: 'This deadline died 404 years ago and is now haunting your quest log.' },
  { emoji: '🦖', title: 'Archaeological Relic', quote: 'Historians found hieroglyphs predicting you would finish this by now.' },
  { emoji: '🚨', title: 'Houston, We Dropped It', quote: 'The deadline was sucked into a black hole. Time dilation won\'t save you!' },
  { emoji: '☕', title: 'Send Espresso SOS', quote: 'Coffee can\'t reverse time, but it will power your emergency speedrun!' },
  { emoji: '🛸', title: 'Beamed Up By Aliens', quote: 'Extraterrestrials intercepted this deadline. Please rescue it immediately.' },
  { emoji: '🐌', title: 'High-Ping Reality', quote: 'Lag detected: 9999ms. Your deadline expired while buffering!' },
];

const TIME_PRESETS = [
  { label: 'Morning', time: '06:00', icon: '🌅', desc: '6:00 AM' },
  { label: 'Morning', time: '09:00', icon: '☕', desc: '9:00 AM' },
  { label: 'Afternoon', time: '14:00', icon: '☀️', desc: '2:00 PM' },
  { label: 'Evening', time: '18:00', icon: '🌆', desc: '6:00 PM' },
  { label: 'Night', time: '21:00', icon: '🌙', desc: '9:00 PM' },
];

export const Dashboard: React.FC<DashboardProps> = ({
  userEmail = 'player1@nexus.gg',
  onLogout,
  currentTheme = 'acid-glitch',
  onThemeChange = () => {},
}) => {
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 0,
    level: 1,
    nextLevelXp: 500,
    streakCount: 0,
  });
  const token = localStorage.getItem('token');

  // Animation & Particle States
  const [confettiTaskId, setConfettiTaskId] = useState<string | null>(null);
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);
  const [floatingXp, setFloatingXp] = useState<{ id: string; text: string } | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'OVERDUE'>('ALL');

  // Sub-task expansion state in list view
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());
  const [newStepTitle, setNewStepTitle] = useState<{ [taskId: string]: string }>({});

  // Focus Timer Dock State
  const [showFocusTimer, setShowFocusTimer] = useState<boolean>(false);
  const [focusTaskTitle, setFocusTaskTitle] = useState<string | undefined>();

  // Modals & Power Tool States
  const [isCmdOpen, setIsCmdOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // View Mode & Modal State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDesc, setFormDesc] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Work');
  const [formPriority, setFormPriority] = useState<string>('MEDIUM');
  const [formDueDate, setFormDueDate] = useState<string>('');
  const [formDueTime, setFormDueTime] = useState<string>('');
  const [formIsRecurring, setFormIsRecurring] = useState<boolean>(false);
  const [formRecurrenceRule, setFormRecurrenceRule] = useState<string>('DAILY');
  const [formSteps, setFormSteps] = useState<string[]>([]);
  const [formStepInput, setFormStepInput] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Table Sort State
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Global Ctrl+K / Cmd+K Command Palette Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch initial tasks & user stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, profileRes] = await Promise.all([
          fetch('http://localhost:3000/api/tasks', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3000/api/user/profile', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserStats(profileData);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    };
    fetchData();
  }, [token]);

  // Date/Time Helpers
  const toDateInputValue = (dateString?: string | null): string => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const toTimeInputValue = (dateString?: string | null): string => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isOverdue = (task: Task): boolean => {
    if (!task.dueDate || task.completed) return false;
    try {
      const dueTime = new Date(task.dueDate).getTime();
      return !isNaN(dueTime) && (Date.now() - dueTime > 60 * 1000);
    } catch {
      return false;
    }
  };

  const isDueToday = (task: Task): boolean => {
    if (!task.dueDate || task.completed) return false;
    const todayStr = getTodayDateString();
    const taskDueStr = toDateInputValue(task.dueDate);
    return taskDueStr === todayStr && !isOverdue(task);
  };

  const getOverdueDuration = (dueDateStr?: string | null) => {
    if (!dueDateStr) return { days: 0, hours: 0, minutes: 0, label: '0d Late' };
    try {
      const dueTime = new Date(dueDateStr).getTime();
      const diffMs = Date.now() - dueTime;
      if (diffMs <= 60 * 1000) return { days: 0, hours: 0, minutes: 0, label: 'Due Now' };

      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const days = Math.floor(hours / 24);

      if (days >= 1) return { days, hours, minutes: totalMinutes, label: `${days}d Late` };
      if (hours >= 1) return { days: 0, hours, minutes: totalMinutes, label: `${hours}h Late` };
      return { days: 0, hours: 0, minutes: Math.max(1, totalMinutes), label: `${Math.max(1, totalMinutes)}m Late` };
    } catch {
      return { days: 0, hours: 0, minutes: 0, label: 'Late' };
    }
  };

  const getFunnyOverdueRoast = (taskId: string, dueDateStr?: string | null) => {
    const { days, hours, minutes, label } = getOverdueDuration(dueDateStr);
    let hash = 0;
    for (let i = 0; i < taskId.length; i++) {
      hash = (hash << 5) - hash + taskId.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % FUNNY_OVERDUE_ROASTS.length;
    return {
      ...FUNNY_OVERDUE_ROASTS[index],
      days,
      hours,
      minutes,
      label,
    };
  };

  const formatDueDate = (dateString?: string | null): string => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  const getDueDayMonth = (dateString?: string | null) => {
    if (!dateString) return null;
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return null;
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const day = d.getDate();
      const hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHour = hours % 12 || 12;
      const time = `${formattedHour}:${minutes} ${ampm}`;
      return { month, day, time };
    } catch {
      return null;
    }
  };

  // Gamified Task Completion Action
  const handleToggleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const isCompleting = !task.completed;
    if (isCompleting) {
      soundEffects.playTaskComplete();
      setConfettiTaskId(id);
      setAnimatingTaskId(id);

      setTimeout(() => setConfettiTaskId((current) => (current === id ? null : current)), 750);
      setTimeout(() => setAnimatingTaskId((current) => (current === id ? null : current)), 500);
    } else {
      soundEffects.playClick();
    }

    // Optimistic instant toggle
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: isCompleting, kanbanStatus: isCompleting ? 'DONE' : 'TODO' } : t))
    );

    try {
      let res = await fetch(`http://localhost:3000/api/tasks/${id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: isCompleting }),
      });

      if (!res.ok) {
        res = await fetch(`http://localhost:3000/api/tasks/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ completed: isCompleting }),
        });
      }

      const data = await res.json();
      if (res.ok) {
        const updatedTask = data.task || data;
        setTasks((prev) => {
          let list = prev.map((t) => (t.id === id ? updatedTask : t));
          if (data.spawnedTask) {
            list = [data.spawnedTask, ...list];
          }
          return list;
        });

        if (data.xpGained !== undefined && data.xpGained !== 0) {
          const sign = data.xpGained > 0 ? '+' : '';
          setFloatingXp({ id, text: `${sign}${data.xpGained} XP` });
          setTimeout(() => setFloatingXp((curr) => (curr?.id === id ? null : curr)), 1200);
        }
        if (data.newXp !== undefined) {
          setUserStats({
            xp: data.newXp,
            level: data.newLevel || 1,
            nextLevelXp: data.nextLevelXp || 500,
            streakCount: data.streakCount !== undefined ? data.streakCount : 0,
          });
        }
      }
    } catch (err) {
      console.error('Failed to update task completion', err);
    }
  };

  // Kanban status update
  const handleUpdateKanbanStatus = async (taskId: string, newStatus: string) => {
    const isDone = newStatus === 'DONE';
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, kanbanStatus: newStatus, completed: isDone } : t))
    );

    try {
      if (isDone) {
        await handleToggleComplete(taskId);
      } else {
        await fetch(`http://localhost:3000/api/tasks/${taskId}/kanban`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ kanbanStatus: newStatus }),
        });
      }
    } catch (err) {
      console.error('Failed to update kanban status', err);
    }
  };

  // Sub-task Step Toggle Action
  const handleToggleStep = async (taskId: string, stepId: string, currentCompleted: boolean) => {
    soundEffects.playClick();
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${taskId}/steps/${stepId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
      if (res.ok) {
        const updatedStep = await res.json();
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id !== taskId) return t;
            const updatedSteps = (t.steps || []).map((s) => (s.id === stepId ? updatedStep : s));
            return { ...t, steps: updatedSteps };
          })
        );
      }
    } catch (err) {
      console.error('Failed to toggle step', err);
    }
  };

  // Add sub-task to existing task
  const handleAddInlineStep = async (taskId: string) => {
    const title = (newStepTitle[taskId] || '').trim();
    if (!title) return;
    soundEffects.playClick();

    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${taskId}/steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const newStep = await res.json();
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id !== taskId) return t;
            return { ...t, steps: [...(t.steps || []), newStep] };
          })
        );
        setNewStepTitle((prev) => ({ ...prev, [taskId]: '' }));
      }
    } catch (err) {
      console.error('Failed to add step', err);
    }
  };

  const toggleExpandTask = (id: string) => {
    soundEffects.playClick();
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteTask = async (id: string) => {
    soundEffects.playClick();
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const handleOpenAddModal = () => {
    soundEffects.playClick();
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');

    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormCategory('Work');
    setFormPriority('MEDIUM');
    setFormDueDate(getTodayDateString());
    setFormDueTime(`${currentHours}:${currentMinutes}`);
    setFormIsRecurring(false);
    setFormRecurrenceRule('DAILY');
    setFormSteps([]);
    setFormStepInput('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    soundEffects.playClick();
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description || '');
    setFormCategory(
      task.category
        ? typeof task.category === 'object'
          ? task.category.name
          : task.category
        : 'Work'
    );
    setFormPriority(task.priority || 'MEDIUM');
    setFormDueDate(toDateInputValue(task.dueDate));
    setFormDueTime(toTimeInputValue(task.dueDate) || '12:00');
    setFormIsRecurring(Boolean(task.isRecurring));
    setFormRecurrenceRule(task.recurrenceRule || 'DAILY');
    setFormSteps(task.steps?.map((s) => s.title) || []);
    setFormStepInput('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleAddFormStep = () => {
    if (!formStepInput.trim()) return;
    setFormSteps((prev) => [...prev, formStepInput.trim()]);
    setFormStepInput('');
  };

  const handleRemoveFormStep = (idx: number) => {
    setFormSteps((prev) => prev.filter((_, i) => i !== idx));
  };

  // AI Quest Breakdown
  const handleAiBreakdown = () => {
    if (!formTitle.trim()) {
      setFormError('Please enter a quest title first for AI breakdown');
      return;
    }
    soundEffects.playClick();
    const result = generateAiSubtasks(formTitle, formCategory);
    setFormSteps(result.steps);
    setFormPriority(result.suggestedPriority);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Task title is required');
      return;
    }

    let combinedDueDate: string | null = null;
    if (formDueDate) {
      const timePart = formDueTime ? `${formDueTime}:00` : '12:00:00';
      const localDateTime = new Date(`${formDueDate}T${timePart}`);
      combinedDueDate = localDateTime.toISOString();
    }

    const payload = {
      title: formTitle.trim(),
      description: formDesc.trim() || undefined,
      category: formCategory,
      priority: formPriority,
      dueDate: combinedDueDate,
      isRecurring: formIsRecurring,
      recurrenceRule: formIsRecurring ? formRecurrenceRule : null,
      steps: formSteps.map((title, i) => ({ title, order: i })),
    };

    try {
      if (editingTask) {
        const res = await fetch(`http://localhost:3000/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
          setIsModalOpen(false);
        } else {
          setFormError('Failed to update task');
        }
      } else {
        const res = await fetch('http://localhost:3000/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          setTasks((prev) => [created, ...prev]);
          setIsModalOpen(false);
        } else {
          setFormError('Failed to create task');
        }
      }
    } catch (err) {
      console.error(err);
      setFormError('Network error while saving task');
    }
  };

  const handleSort = (field: SortField) => {
    soundEffects.playClick();
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getCategoryName = (category?: { id: string; name: string } | string | null): string => {
    if (!category) return 'Other';
    if (typeof category === 'object') return category.name || 'Other';
    return category;
  };

  // Filter pipeline
  const filteredTasks = tasks.filter((t) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = t.title.toLowerCase().includes(q);
      const matchesDesc = (t.description || '').toLowerCase().includes(q);
      const matchesCat = getCategoryName(t.category).toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc && !matchesCat) return false;
    }

    // 2. Category Filter
    if (categoryFilter !== 'ALL') {
      if (getCategoryName(t.category).toUpperCase() !== categoryFilter) return false;
    }

    // 3. Priority Filter
    if (priorityFilter !== 'ALL') {
      if ((t.priority || 'MEDIUM').toUpperCase() !== priorityFilter) return false;
    }

    // 4. Status Filter
    if (statusFilter === 'ACTIVE') {
      if (t.completed) return false;
    } else if (statusFilter === 'COMPLETED') {
      if (!t.completed) return false;
    } else if (statusFilter === 'OVERDUE') {
      if (!isOverdue(t)) return false;
    }

    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortField === 'category') {
      comparison = getCategoryName(a.category).localeCompare(getCategoryName(b.category));
    } else if (sortField === 'status') {
      comparison = Number(a.completed) - Number(b.completed);
    } else if (sortField === 'createdAt') {
      comparison = a.createdAt.localeCompare(b.createdAt);
    } else if (sortField === 'dueDate') {
      const timeA = a.dueDate ? new Date(a.dueDate).getTime() : sortOrder === 'asc' ? Infinity : -Infinity;
      const timeB = b.dueDate ? new Date(b.dueDate).getTime() : sortOrder === 'asc' ? Infinity : -Infinity;
      comparison = timeA - timeB;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;
  const criticalCount = tasks.filter((t) => (t.priority === 'CRITICAL' || getCategoryName(t.category) === 'Urgent') && !t.completed).length;

  const getCategoryClass = (category?: { id: string; name: string } | string | null) => {
    const cat = getCategoryName(category).toLowerCase();
    if (cat === 'work') return 'work';
    if (cat === 'personal') return 'personal';
    if (cat === 'urgent') return 'urgent';
    return 'other';
  };

  return (
    <div className="dashboard-container">
      {/* ---------------- HEADER ---------------- */}
      <header className="dashboard-header">
        <div className="brand-section">
          <div className="brand-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="12" rx="4" />
              <path d="M6 12h4" />
              <path d="M8 10v4" />
              <circle cx="15" cy="11" r="1" fill="currentColor" />
              <circle cx="18" cy="13" r="1" fill="currentColor" />
            </svg>
          </div>
          <div className="brand-title">
            <span>TASK</span>FORGE
            <span className="brand-badge">PRO</span>
          </div>
        </div>

        {/* Player Gamification HUD */}
        <PlayerHud stats={userStats} />

        <div className="user-section">
          {/* Global Command Palette Trigger */}
          <button
            type="button"
            className="cmd-trigger-btn"
            onClick={() => setIsCmdOpen(true)}
            title="Command Palette (Ctrl + K)"
          >
            <span>⚡ Cmd</span>
            <kbd>Ctrl K</kbd>
          </button>

          {/* Trophy Vault Button */}
          <button
            type="button"
            className="achievements-btn"
            onClick={() => {
              soundEffects.playClick();
              setIsAchievementsOpen(true);
            }}
            title="Trophy Vault & Badges"
          >
            <span>🏆 Vault</span>
          </button>

          {/* Quick Focus Button */}
          <button
            type="button"
            className={`focus-toggle-btn ${showFocusTimer ? 'active' : ''}`}
            onClick={() => {
              soundEffects.playClick();
              setShowFocusTimer(!showFocusTimer);
            }}
            title="Toggle Cyber Focus Mode"
          >
            <span>⏱️ Focus</span>
          </button>

          <ThemePicker currentTheme={currentTheme} onThemeChange={onThemeChange} />

          <div className="user-profile">
            <div className="user-avatar" title={userEmail}>
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <span className="user-email">{userEmail}</span>
          </div>

          <button
            type="button"
            className="logout-btn"
            onClick={onLogout}
            title="Log out of session"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* ---------------- MAIN DASHBOARD ---------------- */}
      <main className="dashboard-main">
        {/* Docked Focus Timer Widget */}
        {showFocusTimer && (
          <div className="focus-timer-dock">
            <PomodoroTimer
              activeTaskTitle={focusTaskTitle}
              onClose={() => setShowFocusTimer(false)}
            />
          </div>
        )}

        {/* ---------------- STATS BANNER ---------------- */}
        <section className="stats-banner" aria-label="Mission Overview Statistics">
          <div className="stat-card">
            <div className="stat-icon total">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{totalCount}</span>
              <span className="stat-label">Total Quests</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{activeCount}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{completedCount}</span>
              <span className="stat-label">Cleared Quests</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon urgent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{criticalCount}</span>
              <span className="stat-label">Critical Missions</span>
            </div>
          </div>
        </section>

        {/* ---------------- FILTER & SEARCH TOOLBAR ---------------- */}
        <section className="filter-search-toolbar">
          <div className="search-input-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search missions by title, description, or tag... (Ctrl + K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="filter-chips-row">
            <div className="chip-group">
              <span className="group-label">STATUS:</span>
              {(['ALL', 'ACTIVE', 'COMPLETED', 'OVERDUE'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setStatusFilter(s);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="chip-group">
              <span className="group-label">CATEGORY:</span>
              {['ALL', 'WORK', 'PERSONAL', 'URGENT'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-chip ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setCategoryFilter(cat);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="chip-group">
              <span className="group-label">PRIORITY:</span>
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`filter-chip ${priorityFilter === p ? 'active' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setPriorityFilter(p);
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- CONTROLS: VIEW SWITCHER & ACTIONS ---------------- */}
        <section className="dashboard-controls">
          <div className="view-switcher" role="tablist">
            <button
              type="button"
              className={`view-tab ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                setViewMode('list');
              }}
              role="tab"
            >
              <span>📑 List</span>
            </button>
            <button
              type="button"
              className={`view-tab ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                setViewMode('cards');
              }}
              role="tab"
            >
              <span>🗂️ Cards</span>
            </button>
            <button
              type="button"
              className={`view-tab ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                setViewMode('table');
              }}
              role="tab"
            >
              <span>📊 Table</span>
            </button>
            <button
              type="button"
              className={`view-tab ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                setViewMode('kanban');
              }}
              role="tab"
            >
              <span>📋 Kanban</span>
            </button>
            <button
              type="button"
              className={`view-tab ${viewMode === 'analytics' ? 'active' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                setViewMode('analytics');
              }}
              role="tab"
            >
              <span>📈 Command Center</span>
            </button>
          </div>

          <div className="right-action-buttons">
            {/* Export Dropdown */}
            <div className="export-dropdown-wrapper">
              <button
                type="button"
                className="export-trigger-btn"
                onClick={() => setIsExportOpen(!isExportOpen)}
                title="Export Missions"
              >
                <span>📤 Export</span>
              </button>
              {isExportOpen && (
                <div className="export-menu">
                  <button
                    type="button"
                    className="export-menu-item"
                    onClick={() => {
                      exportTasksToCsv(tasks);
                      setIsExportOpen(false);
                    }}
                  >
                    📊 CSV Spreadsheet
                  </button>
                  <button
                    type="button"
                    className="export-menu-item"
                    onClick={() => {
                      exportTasksToMarkdown(tasks);
                      setIsExportOpen(false);
                    }}
                  >
                    📝 Markdown Report
                  </button>
                  <button
                    type="button"
                    className="export-menu-item"
                    onClick={() => {
                      exportTasksToJson(tasks);
                      setIsExportOpen(false);
                    }}
                  >
                    💾 JSON Backup
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="add-task-trigger-btn"
              onClick={handleOpenAddModal}
            >
              <span>+ Add Quest</span>
            </button>
          </div>
        </section>

        {/* ---------------- VIEW 5: COMMAND CENTER ANALYTICS ---------------- */}
        {viewMode === 'analytics' ? (
          <AnalyticsView token={token} />
        ) : viewMode === 'kanban' ? (
          /* ---------------- VIEW 4: KANBAN BOARD ---------------- */
          <KanbanBoard
            tasks={filteredTasks}
            onUpdateKanbanStatus={handleUpdateKanbanStatus}
            onToggleComplete={handleToggleComplete}
            onEditTask={handleOpenEditModal}
            onDeleteTask={handleDeleteTask}
            onOpenFocus={(title) => {
              setFocusTaskTitle(title);
              setShowFocusTimer(true);
            }}
          />
        ) : filteredTasks.length === 0 ? (
          /* ---------------- EMPTY STATE ---------------- */
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3 className="empty-title">NO QUESTS FOUND</h3>
            <p className="empty-desc">
              {searchQuery || categoryFilter !== 'ALL' || priorityFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'No missions match your active search or filters.'
                : 'Your quest queue is empty. Click "+ Add Quest" to dispatch a new mission.'}
            </p>
          </div>
        ) : (
          <>
            {/* ---------------- VIEW 1: LIST VIEW ---------------- */}
            {viewMode === 'list' && (
              <div className="task-list-view">
                {sortedTasks.map((task) => {
                  const dateParts = getDueDayMonth(task.dueDate);
                  const isJustCompleted = animatingTaskId === task.id;
                  const overdue = isOverdue(task);
                  const roast = overdue ? getFunnyOverdueRoast(task.id, task.dueDate) : null;
                  const isExpanded = expandedTaskIds.has(task.id);
                  const totalSteps = task.steps?.length || 0;
                  const completedSteps = task.steps?.filter((s) => s.completed).length || 0;

                  return (
                    <div
                      key={task.id}
                      className={`task-list-item ${task.completed ? 'completed' : ''} ${isJustCompleted ? 'just-completed' : ''}`}
                    >
                      <div className="task-list-main-row">
                        <div className="task-list-left">
                          {/* Chrono Capsule Tile */}
                          {dateParts ? (
                            <div
                              className="chrono-capsule-tile"
                              title={`Deadline: ${formatDueDate(task.dueDate)}`}
                            >
                              <div className="chrono-hud-header">
                                <span className="chrono-hud-dot" />
                                <span className="chrono-month">{dateParts.month}</span>
                              </div>
                              <div className="chrono-day-wrap">
                                <span className="chrono-day">{dateParts.day}</span>
                              </div>
                              {dateParts.time && (
                                <div className="chrono-time-bar">
                                  <span className="chrono-time-text">{dateParts.time}</span>
                                </div>
                              )}
                              <div className="chrono-corner-notch" />
                            </div>
                          ) : (
                            <div className="chrono-capsule-tile no-date" title="No deadline assigned">
                              <div className="chrono-hud-header">
                                <span className="chrono-hud-dot dim" />
                                <span className="chrono-month">OPEN</span>
                              </div>
                              <div className="chrono-day-wrap">
                                <span className="chrono-day dim">--</span>
                              </div>
                              <div className="chrono-time-bar">
                                <span className="chrono-time-text">NO DUE</span>
                              </div>
                              <div className="chrono-corner-notch" />
                            </div>
                          )}

                          {/* Checkbox with Floating XP & Confetti */}
                          <div className="checkbox-burst-wrapper">
                            <label className="task-checkbox-label">
                              <input
                                type="checkbox"
                                className="task-checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleComplete(task.id)}
                              />
                            </label>

                            {floatingXp?.id === task.id && (
                              <div className={`floating-xp-tag ${floatingXp.text.startsWith('-') ? 'deduct' : ''}`}>
                                {floatingXp.text}
                              </div>
                            )}

                            {confettiTaskId === task.id && (
                              <div className="confetti-burst" aria-hidden="true">
                                <span className="particle p1" />
                                <span className="particle p2" />
                                <span className="particle p3" />
                                <span className="particle p4" />
                                <span className="particle p5" />
                                <span className="particle p6" />
                                <span className="particle p7" />
                                <span className="particle p8" />
                              </div>
                            )}
                          </div>

                          {/* Title & Metadata */}
                          <div className="task-list-title-wrap">
                            <span className="task-title">{task.title}</span>

                            {/* Priority Badge */}
                            {task.priority && (
                              <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                                {task.priority}
                              </span>
                            )}

                            {/* Category Badge */}
                            {task.category && (
                              <span className={`category-badge ${getCategoryClass(task.category)}`}>
                                {getCategoryName(task.category)}
                              </span>
                            )}

                            {/* Recurring Badge */}
                            {task.isRecurring && (
                              <span className="recurring-badge" title={`Repeats: ${task.recurrenceRule}`}>
                                🔁 {task.recurrenceRule}
                              </span>
                            )}

                            {/* Overdue Warning Pill */}
                            {overdue && roast && (
                              <div className="funny-overdue-pill" tabIndex={0}>
                                <span className="funny-pill-emoji">{roast.emoji}</span>
                                <span className="funny-pill-text">{roast.label}: {roast.title}</span>
                                <div className="funny-roast-popover">
                                  <div className="roast-header">
                                    <span className="roast-badge">🚨 MISSION OVERDUE ({roast.label})</span>
                                  </div>
                                  <p className="roast-quote">"{roast.quote}"</p>
                                  <span className="roast-tip">💡 Pro gamer tip: Click checkbox to redeem yourself!</span>
                                </div>
                              </div>
                            )}

                            {/* Subtask Trigger Chip */}
                            <button
                              type="button"
                              className={`subtask-trigger-chip ${isExpanded ? 'expanded' : ''}`}
                              onClick={() => toggleExpandTask(task.id)}
                            >
                              <span>📋 {completedSteps}/{totalSteps} Steps</span>
                              <span className="caret">{isExpanded ? '▲' : '▼'}</span>
                            </button>

                            {task.description && (
                              <span className="task-desc-inline">— {task.description}</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="action-btn-group">
                          <button
                            type="button"
                            className="action-btn focus"
                            onClick={() => {
                              soundEffects.playClick();
                              setFocusTaskTitle(task.title);
                              setShowFocusTimer(true);
                            }}
                            title="Focus Clock Lock"
                          >
                            ⏱️
                          </button>
                          <button
                            type="button"
                            className="action-btn edit"
                            onClick={() => handleOpenEditModal(task)}
                            title="Edit task"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="action-btn delete"
                            onClick={() => handleDeleteTask(task.id)}
                            title="Delete task"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Sub-Tasks Drawer */}
                      {isExpanded && (
                        <div className="task-subtasks-drawer">
                          <div className="subtasks-header">
                            <span className="subtasks-title">CHECKLIST STEPS:</span>
                            {totalSteps > 0 && (
                              <div className="subtask-mini-progress">
                                <div
                                  className="subtask-mini-fill"
                                  style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                                />
                              </div>
                            )}
                          </div>

                          <div className="subtask-items-list">
                            {task.steps?.map((step) => (
                              <label key={step.id} className="subtask-item-label">
                                <input
                                  type="checkbox"
                                  className="subtask-checkbox"
                                  checked={step.completed}
                                  onChange={() => handleToggleStep(task.id, step.id!, step.completed)}
                                />
                                <span className={`subtask-text ${step.completed ? 'done' : ''}`}>
                                  {step.title}
                                </span>
                              </label>
                            ))}
                          </div>

                          <div className="add-subtask-row">
                            <input
                              type="text"
                              className="add-subtask-input"
                              placeholder="Add checklist item..."
                              value={newStepTitle[task.id] || ''}
                              onChange={(e) =>
                                setNewStepTitle({ ...newStepTitle, [task.id]: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddInlineStep(task.id);
                              }}
                            />
                            <button
                              type="button"
                              className="add-subtask-btn"
                              onClick={() => handleAddInlineStep(task.id)}
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ---------------- VIEW 2: CARDS VIEW ---------------- */}
            {viewMode === 'cards' && (
              <div className="task-cards-view">
                {sortedTasks.map((task) => {
                  const overdue = isOverdue(task);
                  const roast = overdue ? getFunnyOverdueRoast(task.id, task.dueDate) : null;
                  const totalSteps = task.steps?.length || 0;
                  const completedSteps = task.steps?.filter((s) => s.completed).length || 0;

                  return (
                    <div
                      key={task.id}
                      className={`task-card ${task.completed ? 'completed' : ''}`}
                    >
                      <div className="task-card-header">
                        {task.category ? (
                          <span className={`category-badge ${getCategoryClass(task.category)}`}>
                            {getCategoryName(task.category)}
                          </span>
                        ) : (
                          <span className="category-badge other">General</span>
                        )}

                        <div className="action-btn-group">
                          <button
                            type="button"
                            className="action-btn focus"
                            onClick={() => {
                              soundEffects.playClick();
                              setFocusTaskTitle(task.title);
                              setShowFocusTimer(true);
                            }}
                            title="Focus Clock Lock"
                          >
                            ⏱️
                          </button>
                          <button
                            type="button"
                            className="action-btn edit"
                            onClick={() => handleOpenEditModal(task)}
                            title="Edit task"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="action-btn delete"
                            onClick={() => handleDeleteTask(task.id)}
                            title="Delete task"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="task-card-body">
                        <h4 className="task-card-title">{task.title}</h4>
                        {task.description && <p className="task-card-desc">{task.description}</p>}

                        {/* Priority Badge */}
                        {task.priority && (
                          <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                            {task.priority} PRIORITY
                          </span>
                        )}

                        {/* Steps summary */}
                        {totalSteps > 0 && (
                          <div className="card-steps-summary">
                            <span className="steps-count-label">
                              📋 {completedSteps}/{totalSteps} Steps Complete
                            </span>
                            <div className="steps-bar">
                              <div
                                className="steps-fill"
                                style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {overdue && roast && (
                          <div className="funny-overdue-pill" tabIndex={0}>
                            <span className="funny-pill-emoji">{roast.emoji}</span>
                            <span className="funny-pill-text">{roast.label}: {roast.title}</span>
                          </div>
                        )}
                      </div>

                      <div className="task-card-footer">
                        <div className="checkbox-burst-wrapper">
                          <label className="task-checkbox-label">
                            <input
                              type="checkbox"
                              className="task-checkbox"
                              checked={task.completed}
                              onChange={() => handleToggleComplete(task.id)}
                            />
                            <span
                              style={{
                                marginLeft: '8px',
                                fontSize: '13px',
                                fontFamily: 'var(--font-gaming)',
                                fontWeight: 700,
                                color: task.completed ? 'var(--text-dim)' : 'var(--text-secondary)',
                              }}
                            >
                              {task.completed ? 'CLEARED' : 'ACTIVE'}
                            </span>
                          </label>

                          {floatingXp?.id === task.id && (
                            <div className={`floating-xp-tag ${floatingXp.text.startsWith('-') ? 'deduct' : ''}`}>
                              {floatingXp.text}
                            </div>
                          )}
                        </div>

                        <div className="task-card-dates">
                          {task.dueDate && (
                            <span
                              className={`task-card-due-badge ${
                                overdue ? 'due-overdue' : isDueToday(task) ? 'due-today' : 'due-normal'
                              }`}
                            >
                              {formatDueDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ---------------- VIEW 3: TABLE VIEW ---------------- */}
            {viewMode === 'table' && (
              <div className="task-table-container">
                <table className="task-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>Done</th>
                      <th className="sortable" onClick={() => handleSort('title')}>
                        Title {sortField === 'title' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th>Priority</th>
                      <th className="sortable" onClick={() => handleSort('category')}>
                        Category {sortField === 'category' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('dueDate')}>
                        Due Date {sortField === 'dueDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th>Steps</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTasks.map((task) => {
                      const isJustCompleted = animatingTaskId === task.id;
                      const overdue = isOverdue(task);
                      const roast = overdue ? getFunnyOverdueRoast(task.id, task.dueDate) : null;
                      const totalSteps = task.steps?.length || 0;
                      const completedSteps = task.steps?.filter((s) => s.completed).length || 0;

                      return (
                        <tr
                          key={task.id}
                          className={`${task.completed ? 'completed' : ''} ${isJustCompleted ? 'just-completed' : ''}`}
                        >
                          <td>
                            <div className="checkbox-burst-wrapper">
                              <input
                                type="checkbox"
                                className="task-checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleComplete(task.id)}
                              />
                              {floatingXp?.id === task.id && (
                                <div className={`floating-xp-tag ${floatingXp.text.startsWith('-') ? 'deduct' : ''}`}>
                                  {floatingXp.text}
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            <span className="task-title">{task.title}</span>
                          </td>
                          <td>
                            {task.priority && (
                              <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                                {task.priority}
                              </span>
                            )}
                          </td>
                          <td>
                            {task.category ? (
                              <span className={`category-badge ${getCategoryClass(task.category)}`}>
                                {getCategoryName(task.category)}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>
                            {task.dueDate ? (
                              overdue && roast ? (
                                <div className="funny-overdue-pill mini" tabIndex={0}>
                                  <span className="funny-pill-emoji">{roast.emoji}</span>
                                  <span className="funny-pill-text">{roast.label}</span>
                                  <div className="funny-roast-popover">
                                    <div className="roast-header">
                                      <span className="roast-badge">🚨 OVERDUE ({roast.label})</span>
                                    </div>
                                    <p className="roast-quote">"{roast.quote}"</p>
                                  </div>
                                </div>
                              ) : (
                                <span className={`task-due-badge ${isDueToday(task) ? 'due-today' : 'due-normal'}`}>
                                  {formatDueDate(task.dueDate)}
                                </span>
                              )
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>
                            {totalSteps > 0 ? (
                              <span style={{ fontSize: 12, fontFamily: 'var(--font-gaming)' }}>
                                {completedSteps}/{totalSteps} Steps
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-btn-group" style={{ justifyContent: 'center' }}>
                              <button
                                type="button"
                                className="action-btn focus"
                                onClick={() => {
                                  soundEffects.playClick();
                                  setFocusTaskTitle(task.title);
                                  setShowFocusTimer(true);
                                }}
                                title="Focus Clock Lock"
                              >
                                ⏱️
                              </button>
                              <button
                                type="button"
                                className="action-btn edit"
                                onClick={() => handleOpenEditModal(task)}
                                title="Edit task"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="action-btn delete"
                                onClick={() => handleDeleteTask(task.id)}
                                title="Delete task"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {/* ---------------- MODAL / FORM ---------------- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="hud-corner-tl" />
            <div className="hud-corner-br" />

            <div className="modal-header">
              <h3 className="modal-title">{editingTask ? 'EDIT QUEST' : 'NEW MISSION'}</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="task-form">
              {formError && <div className="form-error-banner">{formError}</div>}

              <div className="form-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="modal-task-title">QUEST TITLE *</label>
                  <button
                    type="button"
                    className="ai-breakdown-btn"
                    onClick={handleAiBreakdown}
                    title="Generate structured sub-tasks with AI"
                  >
                    ⚡ AI Breakdown
                  </button>
                </div>
                <input
                  id="modal-task-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Implement Webhook Dispatcher"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label htmlFor="modal-task-desc">DESCRIPTION</label>
                <textarea
                  id="modal-task-desc"
                  className="form-textarea"
                  rows={2}
                  placeholder="Brief briefing on mission objectives..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div className="form-row-2col">
                <div className="form-field">
                  <label htmlFor="modal-task-category">CATEGORY</label>
                  <select
                    id="modal-task-category"
                    className="form-select"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="modal-task-priority">PRIORITY</label>
                  <select
                    id="modal-task-priority"
                    className="form-select"
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                  >
                    <option value="LOW">🟢 Low (+30 XP)</option>
                    <option value="MEDIUM">🔵 Medium (+50 XP)</option>
                    <option value="HIGH">🟠 High (+100 XP)</option>
                    <option value="CRITICAL">🔴 Critical (+150 XP)</option>
                  </select>
                </div>
              </div>

              {/* Recurrence Rule Switch */}
              <div className="form-field recurrence-field">
                <label className="recurrence-toggle-label">
                  <input
                    type="checkbox"
                    checked={formIsRecurring}
                    onChange={(e) => setFormIsRecurring(e.target.checked)}
                    className="task-checkbox"
                  />
                  <span>🔁 Recurring Quest (Auto-Respawn on Complete)</span>
                </label>
                {formIsRecurring && (
                  <select
                    className="form-select recurrence-select"
                    value={formRecurrenceRule}
                    onChange={(e) => setFormRecurrenceRule(e.target.value)}
                  >
                    <option value="DAILY">Daily (Every Day)</option>
                    <option value="WEEKDAYS">Weekdays (Mon - Fri)</option>
                    <option value="WEEKLY">Weekly (Every 7 Days)</option>
                    <option value="MONTHLY">Monthly (Every Month)</option>
                  </select>
                )}
              </div>

              {/* Sub-Tasks Builder */}
              <div className="modal-steps-builder">
                <label>CHECKLIST STEPS ({formSteps.length})</label>
                <div className="step-input-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add step..."
                    value={formStepInput}
                    onChange={(e) => setFormStepInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFormStep();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAddFormStep}
                  >
                    + Add
                  </button>
                </div>

                {formSteps.length > 0 && (
                  <div className="modal-steps-list">
                    {formSteps.map((step, idx) => (
                      <div key={idx} className="modal-step-chip">
                        <span>{step}</span>
                        <button
                          type="button"
                          className="chip-del"
                          onClick={() => handleRemoveFormStep(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Date & Time Row */}
              <div className="form-row-datetime">
                <div className="form-input-subgroup">
                  <span className="input-sublabel">DATE</span>
                  <input
                    type="date"
                    className="form-input"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                  />
                </div>
                <div className="form-input-subgroup">
                  <span className="input-sublabel">TIME</span>
                  <input
                    type="time"
                    className="form-input"
                    value={formDueTime}
                    onChange={(e) => setFormDueTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="time-presets-section">
                <span className="presets-label">QUICK TIME PRESETS:</span>
                <div className="time-presets-bar">
                  {TIME_PRESETS.map((p) => (
                    <button
                      key={p.time}
                      type="button"
                      className={`time-preset-chip ${formDueTime === p.time ? 'active' : ''}`}
                      onClick={() => setFormDueTime(p.time)}
                      title={p.desc}
                    >
                      <span>{p.icon}</span> {p.label} ({p.time})
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTask ? 'Save Changes' : 'Deploy Quest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- COMMAND PALETTE ---------------- */}
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onOpenAddModal={handleOpenAddModal}
        onToggleFocus={() => setShowFocusTimer(!showFocusTimer)}
        onSwitchView={(v) => setViewMode(v)}
        onSwitchTheme={(t) => onThemeChange(t)}
        onSetCategoryFilter={(c) => setCategoryFilter(c.toUpperCase())}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onExportData={(fmt) => {
          if (fmt === 'csv') exportTasksToCsv(tasks);
          else if (fmt === 'markdown') exportTasksToMarkdown(tasks);
          else exportTasksToJson(tasks);
        }}
      />

      {/* ---------------- ACHIEVEMENTS MODAL ---------------- */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        token={token}
      />
    </div>
  );
};

export default Dashboard;
