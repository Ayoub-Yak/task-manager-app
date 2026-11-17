import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { cancelTaskReminder, scheduleTaskReminder } from '@/utils/notifications';
import { Task, TaskDraft } from '@/types/task';

type TaskStore = {
  tasks: Task[];
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  addTask: (draft: TaskDraft) => Promise<void>;
  updateTask: (id: string, draft: TaskDraft) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
};

async function withReminder(task: Task) {
  const notificationId = await scheduleTaskReminder(task.title, task.dueDate);
  return notificationId ? { ...task, notificationId } : task;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      addTask: async (draft) => {
        const task = await withReminder({
          ...draft,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
          completed: false,
          subtasks: draft.subtasks ?? [],
        });
        set({ tasks: [task, ...get().tasks] });
      },
      updateTask: async (id, draft) => {
        const existing = get().tasks.find((task) => task.id === id);
        if (!existing) return;
        await cancelTaskReminder(existing.notificationId);
        const updated = await withReminder({
          ...existing,
          ...draft,
          completed: draft.completed ?? existing.completed,
          subtasks: draft.subtasks ?? existing.subtasks,
          notificationId: undefined,
        });
        set({ tasks: get().tasks.map((task) => (task.id === id ? updated : task)) });
      },
      deleteTask: async (id) => {
        const task = get().tasks.find((item) => item.id === id);
        await cancelTaskReminder(task?.notificationId);
        set({ tasks: get().tasks.filter((item) => item.id !== id) });
      },
      toggleTask: async (id) => {
        const task = get().tasks.find((item) => item.id === id);
        if (!task) return;
        set({
          tasks: get().tasks.map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item
          ),
        });
      },
      toggleSubtask: (taskId, subtaskId) =>
        set({
          tasks: get().tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map((subtask) =>
                    subtask.id === subtaskId
                      ? { ...subtask, completed: !subtask.completed }
                      : subtask
                  ),
                }
              : task
          ),
        }),
    }),
    {
      name: 'focus-flow-tasks',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    }
  )
);
