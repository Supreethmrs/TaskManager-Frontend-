import React, { useState } from 'react';
import './KanbanBoard.css';
import type { Task } from '../Dashboard';
import { soundEffects } from '../utils/SoundEffects';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateKanbanStatus: (taskId: string, newStatus: string) => void;
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenFocus: (taskTitle: string) => void;
}

interface KanbanColumn {
  id: string;
  title: string;
  emoji: string;
  colorVar: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'TODO', title: 'TO-DO', emoji: '📝', colorVar: 'var(--text-secondary)' },
  { id: 'IN_PROGRESS', title: 'IN PROGRESS', emoji: '⚡', colorVar: '#38bdf8' },
  { id: 'REVIEW', title: 'IN REVIEW', emoji: '🔍', colorVar: '#fbbf24' },
  { id: 'DONE', title: 'CLEARED', emoji: '✅', colorVar: 'var(--accent-primary)' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onUpdateKanbanStatus,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onOpenFocus,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropCol, setActiveDropCol] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropCol !== colId) {
      setActiveDropCol(colId);
    }
  };

  const handleDragLeave = () => {
    setActiveDropCol(null);
  };

  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setActiveDropCol(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      soundEffects.playClick();
      onUpdateKanbanStatus(taskId, colId);
      setDraggedTaskId(null);
    }
  };

  const getTasksForColumn = (colId: string) => {
    return tasks.filter((t) => {
      const status = t.kanbanStatus || (t.completed ? 'DONE' : 'TODO');
      return status === colId;
    });
  };

  return (
    <div className="kanban-board-container">
      <div className="kanban-columns-grid">
        {COLUMNS.map((col) => {
          const colTasks = getTasksForColumn(col.id);
          const isDropActive = activeDropCol === col.id;

          return (
            <div
              key={col.id}
              className={`kanban-column ${isDropActive ? 'drop-active' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column Header */}
              <div className="kanban-column-header">
                <div className="kanban-col-title-wrap">
                  <span className="col-emoji">{col.emoji}</span>
                  <span className="col-title">{col.title}</span>
                </div>
                <span className="col-count-badge">{colTasks.length}</span>
              </div>

              {/* Cards Container */}
              <div className="kanban-cards-list">
                {colTasks.length === 0 ? (
                  <div className="kanban-empty-col">
                    <span>Drop missions here</span>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const completedSteps = task.steps?.filter((s) => s.completed).length || 0;
                    const totalSteps = task.steps?.length || 0;

                    return (
                      <div
                        key={task.id}
                        className={`kanban-task-card ${task.completed ? 'completed' : ''} ${draggedTaskId === task.id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={() => setDraggedTaskId(null)}
                      >
                        <div className="kanban-card-top">
                          {task.priority && (
                            <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                              {task.priority}
                            </span>
                          )}
                          <div className="kanban-card-actions">
                            <button
                              type="button"
                              className="kanban-btn focus"
                              onClick={() => onOpenFocus(task.title)}
                              title="Focus Target"
                            >
                              ⏱️
                            </button>
                            <button
                              type="button"
                              className="kanban-btn edit"
                              onClick={() => onEditTask(task)}
                              title="Edit Quest"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="kanban-btn delete"
                              onClick={() => onDeleteTask(task.id)}
                              title="Delete Quest"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <div className="kanban-card-body">
                          <span className="kanban-task-title">{task.title}</span>
                          {task.description && (
                            <p className="kanban-task-desc">{task.description}</p>
                          )}
                        </div>

                        {totalSteps > 0 && (
                          <div className="kanban-steps-bar-wrap">
                            <span className="kanban-steps-txt">
                              📋 {completedSteps}/{totalSteps} Steps
                            </span>
                            <div className="kanban-mini-bar">
                              <div
                                className="kanban-mini-fill"
                                style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="kanban-card-bottom">
                          <label className="kanban-check-label">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => onToggleComplete(task.id)}
                              className="task-checkbox"
                            />
                            <span className="kanban-status-text">
                              {task.completed ? 'Cleared' : 'Complete'}
                            </span>
                          </label>
                          {task.dueDate && (
                            <span className="kanban-due-tag">
                              📅 {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
