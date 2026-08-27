const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const prisma = require('./prismaClient');

// AUTH MIDDLEWARE
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    next();
  });
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'TaskForge API is running' });
});

// Helper to calculate next level threshold (500 XP per level)
function getNextLevelXp(level) {
  return (level || 1) * 500;
}

// Helper to compute next recurring date
function calculateNextRecurrenceDate(baseDate, rule) {
  const next = new Date(baseDate || Date.now());
  if (rule === 'DAILY') {
    next.setDate(next.getDate() + 1);
  } else if (rule === 'WEEKDAYS') {
    do {
      next.setDate(next.getDate() + 1);
    } while (next.getDay() === 0 || next.getDay() === 6); // Skip Sun/Sat
  } else if (rule === 'WEEKLY') {
    next.setDate(next.getDate() + 7);
  } else if (rule === 'MONTHLY') {
    next.setMonth(next.getMonth() + 1);
  } else {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

// -------------------------------------------------------------
// USER AUTHENTICATION & PROFILE
// -------------------------------------------------------------
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email: cleanEmail, password: hashedPassword, xp: 0, level: 1, streakCount: 0 }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        xp: user.xp || 0,
        level: user.level || 1,
        streakCount: user.streakCount || 0,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong during signup' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        xp: user.xp || 0,
        level: user.level || 1,
        streakCount: user.streakCount || 0,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong during login' });
  }
});

// GET USER GAMIFIED PROFILE STATS
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, xp: true, level: true, streakCount: true, lastCompletedDate: true, createdAt: true }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const lvl = user.level || 1;
    const nextLevelXp = getNextLevelXp(lvl);
    res.json({
      ...user,
      xp: user.xp || 0,
      level: lvl,
      streakCount: user.streakCount || 0,
      nextLevelXp,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// -------------------------------------------------------------
// TASK CRUD WITH SUB-TASKS, PRIORITY & KANBAN
// -------------------------------------------------------------

// READ all tasks belonging to the logged-in user
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        steps: { orderBy: { order: 'asc' } },
      },
    });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// CREATE a new task
app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, dueDate, priority, estimatedMinutes, kanbanStatus, isRecurring, recurrenceRule, steps } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let categoryId = null;
    if (category) {
      const categoryRecord = await prisma.category.findUnique({ where: { name: category } });
      if (categoryRecord) {
        categoryId = categoryRecord.id;
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        userId: req.userId,
        categoryId,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'MEDIUM',
        estimatedMinutes: estimatedMinutes !== undefined ? Number(estimatedMinutes) : 25,
        kanbanStatus: kanbanStatus || 'TODO',
        isRecurring: Boolean(isRecurring),
        recurrenceRule: recurrenceRule || null,
        steps: steps && Array.isArray(steps) && steps.length > 0
          ? {
            create: steps.map((step, idx) => ({
              title: typeof step === 'string' ? step : step.title,
              completed: typeof step === 'object' && step.completed !== undefined ? Boolean(step.completed) : false,
              order: idx,
            })),
          }
          : undefined,
      },
      include: {
        category: true,
        steps: { orderBy: { order: 'asc' } },
      },
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// UPDATE a task
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed, category, dueDate, priority, estimatedMinutes, kanbanStatus, isRecurring, recurrenceRule } = req.body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== req.userId) {
      return res.status(404).json({ error: 'Task not found' });
    }

    let categoryId = existingTask.categoryId;
    if (category !== undefined) {
      const categoryRecord = await prisma.category.findUnique({ where: { name: category } });
      categoryId = categoryRecord ? categoryRecord.id : null;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingTask.title,
        description: description !== undefined ? description : existingTask.description,
        completed: completed !== undefined ? completed : existingTask.completed,
        categoryId,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existingTask.dueDate,
        priority: priority !== undefined ? priority : existingTask.priority,
        estimatedMinutes: estimatedMinutes !== undefined ? Number(estimatedMinutes) : existingTask.estimatedMinutes,
        kanbanStatus: kanbanStatus !== undefined ? kanbanStatus : (completed ? 'DONE' : existingTask.kanbanStatus),
        isRecurring: isRecurring !== undefined ? Boolean(isRecurring) : existingTask.isRecurring,
        recurrenceRule: recurrenceRule !== undefined ? recurrenceRule : existingTask.recurrenceRule,
      },
      include: {
        category: true,
        steps: { orderBy: { order: 'asc' } },
      },
    });

    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// QUICK KANBAN STATUS UPDATE
app.put('/api/tasks/:id/kanban', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { kanbanStatus } = req.body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== req.userId) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const isDone = kanbanStatus === 'DONE';
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        kanbanStatus,
        completed: isDone,
      },
      include: {
        category: true,
        steps: { orderBy: { order: 'asc' } },
      },
    });

    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update kanban status' });
  }
});

// DELETE a task
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== req.userId) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// -------------------------------------------------------------
// SUB-TASKS / STEPS API
// -------------------------------------------------------------
app.post('/api/tasks/:id/steps', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Step title is required' });

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task || task.userId !== req.userId) return res.status(404).json({ error: 'Task not found' });

    const count = await prisma.taskStep.count({ where: { taskId: id } });
    const step = await prisma.taskStep.create({
      data: {
        title,
        taskId: id,
        order: count,
      }
    });

    res.status(201).json(step);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create sub-task step' });
  }
});

app.put('/api/tasks/:id/steps/:stepId', authenticateToken, async (req, res) => {
  try {
    const { id, stepId } = req.params;
    const { title, completed } = req.body;

    const step = await prisma.taskStep.findUnique({
      where: { id: stepId },
      include: { task: true }
    });

    if (!step || step.taskId !== id || step.task.userId !== req.userId) {
      return res.status(404).json({ error: 'Step not found' });
    }

    const updatedStep = await prisma.taskStep.update({
      where: { id: stepId },
      data: {
        title: title !== undefined ? title : step.title,
        completed: completed !== undefined ? Boolean(completed) : step.completed,
      }
    });

    res.json(updatedStep);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update step' });
  }
});

app.delete('/api/tasks/:id/steps/:stepId', authenticateToken, async (req, res) => {
  try {
    const { id, stepId } = req.params;
    const step = await prisma.taskStep.findUnique({
      where: { id: stepId },
      include: { task: true }
    });

    if (!step || step.taskId !== id || step.task.userId !== req.userId) {
      return res.status(404).json({ error: 'Step not found' });
    }

    await prisma.taskStep.delete({ where: { id: stepId } });
    res.json({ message: 'Step deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete step' });
  }
});

// -------------------------------------------------------------
// GAMIFIED TASK COMPLETION, XP SYSTEM & RECURRING SPAWN
// -------------------------------------------------------------
app.post('/api/tasks/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { category: true, steps: true }
    });

    if (!task || task.userId !== req.userId) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const isCompleting = completed !== undefined ? Boolean(completed) : !task.completed;

    // Calculate XP delta based on task priority and deadline
    let xpAward = 0;
    const priority = task.priority || 'MEDIUM';
    if (priority === 'CRITICAL') xpAward = 150;
    else if (priority === 'HIGH') xpAward = 100;
    else if (priority === 'LOW') xpAward = 30;
    else xpAward = 50;

    if (task.dueDate && new Date(task.dueDate).getTime() >= Date.now()) {
      xpAward += 25;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        completed: isCompleting,
        kanbanStatus: isCompleting ? 'DONE' : 'TODO',
        // WHY: when completing, we SAVE the exact xpAward we're about to give,
        // so undoing this action later can read back the TRUE amount instead
        // of recalculating it (which could give a different, wrong answer if
        // time has passed and the due-date bonus condition changed).
        ...(isCompleting ? { lastXpAwarded: xpAward } : {}),
      },
      include: { category: true, steps: { orderBy: { order: 'asc' } } }
    });

    // Check current completed tasks count for the user
    const totalCompletedTasks = await prisma.task.count({
      where: { userId: req.userId, completed: true }
    });

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    let currentXp = user ? (user.xp || 0) : 0;
    let currentLevel = user ? (user.level || 1) : 1;
    let streak = user ? (user.streakCount || 0) : 0;
    let leveledUp = false;
    let newLastCompletedDate = user?.lastCompletedDate || null;

    let spawnedRecurringTask = null;

    if (user) {
      if (isCompleting) {
        currentXp += xpAward;
        const newCalculatedLevel = Math.max(1, Math.floor(currentXp / 500) + 1);
        if (newCalculatedLevel > currentLevel) {
          leveledUp = true;
        }
        currentLevel = newCalculatedLevel;

        const now = new Date();
        if (user.lastCompletedDate) {
          const lastDate = new Date(user.lastCompletedDate);
          const isSameDay = lastDate.toDateString() === now.toDateString();
          if (!isSameDay) {
            const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              streak += 1;
            } else {
              streak = 1;
            }
          } else {
            streak = Math.max(1, streak);
          }
        } else {
          streak = 1;
        }
        newLastCompletedDate = now;

        // Auto-spawn next instance if recurring
        if (task.isRecurring && task.recurrenceRule) {
          const nextDueDate = calculateNextRecurrenceDate(task.dueDate || new Date(), task.recurrenceRule);
          spawnedRecurringTask = await prisma.task.create({
            data: {
              title: task.title,
              description: task.description,
              userId: req.userId,
              categoryId: task.categoryId,
              dueDate: nextDueDate,
              priority: task.priority,
              estimatedMinutes: task.estimatedMinutes,
              kanbanStatus: 'TODO',
              isRecurring: true,
              recurrenceRule: task.recurrenceRule,
              steps: task.steps && task.steps.length > 0
                ? {
                  create: task.steps.map((s, idx) => ({
                    title: s.title,
                    completed: false,
                    order: idx,
                  })),
                }
                : undefined,
            },
            include: {
              category: true,
              steps: { orderBy: { order: 'asc' } },
            },
          });
        }
      } else {
        // Reverting / Unchecking a mistakenly completed task -> DEDUCT XP
        //
        // THE FIX: read back the EXACT amount stored on the task when it was
        // completed (task.lastXpAwarded), instead of the freshly-recalculated
        // `xpAward`, which could now be wrong if the due date has since passed.
        // Fallback to `xpAward` only if lastXpAwarded is missing (e.g. tasks
        // completed before this fix existed).
        const xpToDeduct = task.lastXpAwarded ?? xpAward;

        currentXp = Math.max(0, currentXp - xpToDeduct);
        currentLevel = Math.max(1, Math.floor(currentXp / 500) + 1);

        // If user has 0 completed tasks left, reset streak to 0
        if (totalCompletedTasks === 0) {
          streak = 0;
          newLastCompletedDate = null;
        }
      }

      await prisma.user.update({
        where: { id: req.userId },
        data: {
          xp: currentXp,
          level: currentLevel,
          streakCount: streak,
          lastCompletedDate: newLastCompletedDate,
        }
      });
    }

    res.json({
      task: updatedTask,
      spawnedTask: spawnedRecurringTask,
      // WHY: report the ACTUAL amount deducted (read from storage) on undo,
      // not the freshly recalculated value — keeps this number honest and
      // matching exactly what happened to the user's real XP total.
      xpGained: isCompleting ? xpAward : -(task.lastXpAwarded ?? xpAward),
      newXp: currentXp,
      newLevel: currentLevel,
      nextLevelXp: getNextLevelXp(currentLevel),
      streakCount: streak,
      leveledUp,
    });
  } catch (err) {
    console.error('Failed to complete task:', err);
    res.status(500).json({ error: 'Failed to process gamified task completion' });
  }
});

// -------------------------------------------------------------
// ACHIEVEMENTS / TROPHY GALLERY
// -------------------------------------------------------------
app.get('/api/achievements', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const tasks = await prisma.task.findMany({ where: { userId: req.userId } });

    const totalCreated = tasks.length;
    const completedTasks = tasks.filter(t => t.completed);
    const totalCompleted = completedTasks.length;
    const streak = user?.streakCount || 0;
    const userXp = user?.xp || 0;
    const userLevel = user?.level || 1;

    // Check on-time tasks
    const onTimeCount = completedTasks.filter(t => t.dueDate && new Date(t.dueDate).getTime() >= new Date(t.createdAt).getTime()).length;

    // Calculate badges
    const achievements = [
      {
        id: 'first_quest',
        title: 'Initiation Rite',
        emoji: '🔰',
        desc: 'Complete your first quest',
        unlocked: totalCompleted >= 1,
        progress: Math.min(1, totalCompleted / 1),
      },
      {
        id: 'speed_demon',
        title: 'Speed Demon',
        emoji: '⚡',
        desc: 'Complete 3 quests on-time',
        unlocked: onTimeCount >= 3,
        progress: Math.min(1, onTimeCount / 3),
      },
      {
        id: 'streak_master',
        title: 'Streak Master',
        emoji: '🔥',
        desc: 'Achieve a 3-day completion streak',
        unlocked: streak >= 3,
        progress: Math.min(1, streak / 3),
      },
      {
        id: 'centurion',
        title: 'Quest Centurion',
        emoji: '👑',
        desc: 'Complete 10 total quests',
        unlocked: totalCompleted >= 10,
        progress: Math.min(1, totalCompleted / 10),
      },
      {
        id: 'elite_level',
        title: 'Cyber Overlord',
        emoji: '💎',
        desc: 'Reach Level 3 Commander rank',
        unlocked: userLevel >= 3,
        progress: Math.min(1, userLevel / 3),
      },
    ];

    res.json({
      achievements,
      totalCompleted,
      streak,
      xp: userXp,
      level: userLevel,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// -------------------------------------------------------------
// ANALYTICS & INSIGHTS
// -------------------------------------------------------------
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      include: { category: true, steps: true }
    });

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { xp: true, level: true, streakCount: true }
    });

    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const velocityMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      velocityMap[dayName] = 0;
    }

    tasks.forEach(t => {
      if (t.completed && t.createdAt) {
        const d = new Date(t.createdAt);
        const dayName = days[d.getDay()];
        if (velocityMap[dayName] !== undefined) {
          velocityMap[dayName] += 1;
        }
      }
    });

    const velocityData = Object.keys(velocityMap).map(day => ({
      day,
      count: velocityMap[day],
    }));

    const categoryCounts = { Work: 0, Personal: 0, Urgent: 0, Other: 0 };
    tasks.forEach(t => {
      const cat = t.category?.name || 'Other';
      if (categoryCounts[cat] !== undefined) categoryCounts[cat] += 1;
      else categoryCounts.Other += 1;
    });

    const priorityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    tasks.forEach(t => {
      const p = t.priority || 'MEDIUM';
      if (priorityCounts[p] !== undefined) priorityCounts[p] += 1;
    });

    const tasksWithDueDate = tasks.filter(t => t.dueDate && t.completed);
    const onTimeCount = tasksWithDueDate.filter(t => new Date(t.dueDate).getTime() >= new Date(t.createdAt).getTime()).length;
    const onTimeRate = tasksWithDueDate.length > 0 ? Math.round((onTimeCount / tasksWithDueDate.length) * 100) : 100;

    res.json({
      total,
      completed,
      active,
      onTimeRate,
      xp: user?.xp || 0,
      level: user?.level || 1,
      streakCount: user?.streakCount || 0,
      velocityData,
      categoryCounts,
      priorityCounts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute analytics' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`TaskForge Server running on http://localhost:${PORT}`);
});