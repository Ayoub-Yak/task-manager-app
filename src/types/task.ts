export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'Work' | 'Personal' | 'Urgent';
export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate?: string;
  category: TaskCategory;
  completed: boolean;
  createdAt: string;
  subtasks: Subtask[];
  notificationId?: string;
  recurrence: TaskRecurrence;
  streak: number;
  lastCompletedDate: string | null;
};

export type TaskDraft = Omit<
  Task,
  'id' | 'createdAt' | 'completed' | 'notificationId' | 'recurrence' | 'streak' | 'lastCompletedDate'
> & {
  completed?: boolean;
  recurrence?: TaskRecurrence;
};
