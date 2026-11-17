import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Alert, Platform, ToastAndroid } from 'react-native';

import { cancelTaskReminder, scheduleTaskReminder } from '@/utils/notifications';
import { Task, TaskDraft, TaskRecurrence } from '@/types/task';

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

function normalizeTask(task: Partial<Task> & Pick<Task, 'id' | 'title'>): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    priority: task.priority ?? 'medium',
    dueDate: task.dueDate,
    category: task.category ?? 'Personal',
    completed: task.completed ?? false,
    createdAt: task.createdAt ?? new Date().toISOString(),
    subtasks: task.subtasks ?? [],
    notificationId: task.notificationId,
    recurrence: task.recurrence ?? 'none',
    streak: task.streak ?? 0,
    lastCompletedDate: task.lastCompletedDate ?? null,
  };
}

function getNextDueDate(dueDate: string | undefined, recurrence: TaskRecurrence) {
  const nextDate = dueDate ? new Date(dueDate) : new Date();
  if (recurrence === 'daily') nextDate.setDate(nextDate.getDate() + 1);
  if (recurrence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
  if (recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate.toISOString();
}

function showRescheduledMessage(recurrence: TaskRecurrence, streak: number) {
  const period = recurrence === 'daily' ? 'tomorrow' : recurrence === 'weekly' ? 'next week' : 'next month';
  const message = `Rescheduled for ${period}! Streak: ${streak} ${streak === 1 ? 'day' : 'days'}`;
  if (Platform.OS === 'android') ToastAndroid.show(message, ToastAndroid.SHORT);
  else Alert.alert('Streak updated', message);
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
          recurrence: draft.recurrence ?? 'none',
          streak: 0,
          lastCompletedDate: null,
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
          recurrence: draft.recurrence ?? existing.recurrence,
          streak: existing.streak,
          lastCompletedDate: existing.lastCompletedDate,
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
        if (!task.completed && task.recurrence !== 'none') {
          const streak = task.streak + 1;
          await cancelTaskReminder(task.notificationId);
          const rescheduled = await withReminder({
            ...task,
            completed: false,
            dueDate: getNextDueDate(task.dueDate, task.recurrence),
            streak,
            lastCompletedDate: new Date().toISOString(),
            notificationId: undefined,
          });
          set({ tasks: get().tasks.map((item) => (item.id === id ? rescheduled : item)) });
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          showRescheduledMessage(task.recurrence, streak);
          return;
        }
        set({
          tasks: get().tasks.map((item) =>
            item.id === id
              ? {
                  ...item,
                  completed: !item.completed,
                  lastCompletedDate: !item.completed ? new Date().toISOString() : item.lastCompletedDate,
                }
              : item
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
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<TaskStore> | undefined;
        return {
          ...currentState,
          ...persisted,
          tasks: (persisted?.tasks ?? []).map((task) => normalizeTask(task)),
        };
      },
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    }
  )
);
