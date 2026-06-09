import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, DragOverlay,
  closestCorners
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiPlus, FiMoreHorizontal, FiCalendar, FiFlag, FiMessageSquare, FiUser, FiEdit2 } from 'react-icons/fi';
import api from '../utils/api';
import type { Board, Task, Project } from '../types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

function TaskCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: sortDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: sortDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="task-card select-none"
      >
        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {task.labels.slice(0, 3).map(label => (
              <span key={label} className="h-1.5 w-8 rounded-full" style={{ background: 'var(--accent)' }} />
            ))}
          </div>
        )}

        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>{task.title}</p>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-1 mb-3 flex-wrap">
            {task.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-md"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Checklist progress */}
        {task.checklist && task.checklist.length > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
              <span>Checklist</span>
              <span>{task.checklist.filter(c => c.completed).length}/{task.checklist.length}</span>
            </div>
            <div className="h-1 rounded-full" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full"
                style={{
                  width: `${(task.checklist.filter(c => c.completed).length / task.checklist.length) * 100}%`,
                  background: 'var(--accent)'
                }} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiFlag size={12} style={{ color: PRIORITY_COLORS[task.priority] }} />
            {task.due_date && (
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <FiCalendar size={10} />
                {new Date(task.due_date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </div>
            )}
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <FiMessageSquare size={10} />
                {task.comments.length}
              </div>
            )}
          </div>
          {task.assignees && task.assignees.length > 0 && (
            <div className="flex -space-x-1.5">
              {task.assignees.slice(0, 2).map((a: any) => (
                <div key={a.id} className="w-6 h-6 rounded-full border flex items-center justify-center text-xs text-white font-bold"
                  style={{ background: 'var(--accent)', borderColor: 'var(--bg-tertiary)' }}>
                  {a.name?.[0]?.toUpperCase() || 'U'}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function BoardColumn({ board, onAddTask }: { board: Board; onAddTask: (boardId: number) => void }) {
  const STATUS_COLORS: Record<string, string> = {
    'To Do': '#6b7280',
    'In Progress': '#3b82f6',
    'Review': '#8b5cf6',
    'Done': '#10b981',
    'Design': '#ec4899',
    'Frontend': '#0ea5e9',
    'Backend': '#f59e0b',
    'Testing': '#ef4444',
  };

  const color = STATUS_COLORS[board.name] || 'var(--accent)';

  return (
    <div className="kanban-col flex-shrink-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>
            {board.name}
          </span>
          <span className="badge px-2 py-0.5 text-xs rounded-full"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            {board.tasks?.length || 0}
          </span>
        </div>
        <button className="p-1 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
          style={{ color: 'var(--text-secondary)' }}>
          <FiMoreHorizontal size={16} />
        </button>
      </div>

      <SortableContext items={(board.tasks || []).map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1 min-h-32">
          {(board.tasks || []).map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          {(!board.tasks || board.tasks.length === 0) && (
            <div className="flex-1 flex items-center justify-center py-8 rounded-xl border-2 border-dashed"
              style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                Drop tasks here<br />or add a new one
              </p>
            </div>
          )}
        </div>
      </SortableContext>

      <button
        onClick={() => onAddTask(board.id)}
        className="w-full mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:bg-[var(--bg-tertiary)]"
        style={{ color: 'var(--text-secondary)', border: '1px dashed var(--border)' }}
      >
        <FiPlus size={14} /> Add Task
      </button>
    </div>
  );
}

export default function BoardPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      api.get(`/projects/${projectId}`),
      api.get(`/projects/${projectId}/boards`),
    ]).then(([pRes, bRes]) => {
      setProject(pRes.data.data);
      setBoards(bRes.data.data || []);
    }).catch(() => toast.error('Failed to load board')).finally(() => setLoading(false));
  }, [projectId]);

  const findBoard = (taskId: number) => boards.find(b => b.tasks?.some(t => t.id === taskId));

  const handleDragStart = (e: DragStartEvent) => {
    const board = findBoard(Number(e.active.id));
    const task = board?.tasks?.find(t => t.id === Number(e.active.id));
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;

    const activeBoard = findBoard(Number(active.id));
    const overBoard = boards.find(b => b.id === Number(over.id)) || findBoard(Number(over.id));

    if (!activeBoard || !overBoard) return;

    if (activeBoard.id === overBoard.id) {
      const oldIdx = activeBoard.tasks!.findIndex(t => t.id === Number(active.id));
      const newIdx = activeBoard.tasks!.findIndex(t => t.id === Number(over.id));
      if (oldIdx !== newIdx) {
        const newTasks = arrayMove(activeBoard.tasks!, oldIdx, newIdx);
        setBoards(prev => prev.map(b => b.id === activeBoard.id ? { ...b, tasks: newTasks } : b));
        await api.patch(`/tasks/${active.id}/move`, { board_id: activeBoard.id, order: newIdx }).catch(() => {});
      }
    } else {
      const task = activeBoard.tasks!.find(t => t.id === Number(active.id))!;
      setBoards(prev => prev.map(b => {
        if (b.id === activeBoard.id) return { ...b, tasks: b.tasks!.filter(t => t.id !== Number(active.id)) };
        if (b.id === overBoard.id) return { ...b, tasks: [...(b.tasks || []), task] };
        return b;
      }));
      await api.patch(`/tasks/${active.id}/move`, { board_id: overBoard.id }).catch(() => {});
    }
  };

  const handleAddTask = async (boardId: number) => {
    const title = prompt('Task title:');
    if (!title) return;
    try {
      const res = await api.post(`/tasks`, { title, board_id: boardId, project_id: Number(projectId), priority: 'medium', status: 'todo' });
      const newTask = res.data.data;
      setBoards(prev => prev.map(b => b.id === boardId ? { ...b, tasks: [...(b.tasks || []), newTask] } : b));
      toast.success('Task created! ✅');
    } catch {
      toast.error('Failed to create task');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-4xl animate-bounce">🤖</div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Board Header */}
      <div className="flex items-center gap-4 mb-6">
  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
    style={{ background: project?.color || 'var(--accent)' }}>
    {project?.icon || '📋'}
  </div>
  <div>
    <h1 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
      {project?.name || 'Project Board'}
    </h1>
    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
      {boards.length} boards • {boards.reduce((acc, b) => acc + (b.tasks?.length || 0), 0)} tasks
    </p>
  </div>
  <div style={{ marginLeft: 'auto' }}>
    <motion.button
      onClick={() => navigate(`/projects/${projectId}/whiteboard`)}
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
      style={{
        padding: '8px 16px', borderRadius: 10, border: 'none',
        background: 'linear-gradient(135deg,#E8540A,#6B1010)', color: '#fff',
        fontSize: 13, fontWeight: 700, fontFamily: 'Figtree', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 7,
        boxShadow: '0 4px 16px rgba(232,84,10,0.3)',
      }}>
      <FiEdit2 size={14}/> Whiteboard
    </motion.button>
  </div>
</div>


      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="text-6xl">📋</div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>No boards yet!</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Boards will appear here once your project is set up.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide flex-1">
            {boards.map(board => (
              <BoardColumn key={board.id} board={board} onAddTask={handleAddTask} />
            ))}
            <div className="kanban-col flex-shrink-0 items-center justify-center cursor-pointer hover:border-purple-500/50 transition-all"
              style={{ border: '2px dashed var(--border)' }}>
              <div className="flex flex-col items-center gap-2 py-8">
                <FiPlus size={24} style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Add Board</span>
              </div>
            </div>
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
