# Focus Flow

Focus Flow is an offline-first task management and productivity mobile app built with Expo, React Native, TypeScript, and Expo Router.

It helps users capture tasks, organize them by priority and category, schedule due dates, manage recurring habits, track completion streaks, and work in focused Pomodoro sessions.

> This document describes the current app implementation. The repository's `README.md` file is intentionally unchanged.

## Contents

- [Features](#features)
- [Screens](#screens)
- [Task model](#task-model)
- [Data persistence](#data-persistence)
- [Notifications](#notifications)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Validation](#validation)
- [Expo Go limitations](#expo-go-limitations)

## Features

### Task management

- Create tasks with the floating action button.
- Edit tasks by tapping a task card.
- Delete tasks by swiping left.
- Mark tasks complete by tapping the checkbox or swiping right.
- Reactivate completed tasks.
- Prevent accidental duplicate tasks when the save button is tapped repeatedly.
- Animate task completion with a short spring checkbox pulse.

### Task details

Every task can include:

- Title
- Description
- Priority
- Category
- Due date and time
- Recurrence rule
- Completion status
- Subtasks
- Completion streak
- Last completion date

### Priorities

Tasks support three priority levels:

- **Low**
- **Medium**
- **High**

Priority badges use different colors to make important work easier to scan.

### Categories

Tasks can be grouped into:

- **Work**
- **Personal**
- **Urgent**

Category chips filter the task list instantly.

### Due dates

The task editor includes a native date and time picker:

- Android uses the imperative date/time picker API.
- iOS uses the inline date/time picker.
- Past dates are prevented.
- Due dates can be removed.
- Due dates are shown on task cards.
- Tasks can be sorted by due date.

### Recurring tasks

Tasks can repeat using:

- Never
- Daily
- Weekly
- Monthly

When a recurring task is completed:

1. Its streak increases by one.
2. Its completion date is recorded.
3. Its next due date is calculated automatically.
4. The task becomes active again instead of remaining completed.
5. A reminder is rescheduled for the next occurrence.
6. Haptic feedback and a confirmation message are shown.

The next due date is calculated as follows:

| Recurrence | Next due date |
|---|---|
| Daily | One day later |
| Weekly | Seven days later |
| Monthly | One month later |

### Habit streaks

Recurring tasks display their current streak:

- A repeat icon appears beside the due date.
- A compact `🔥 X` badge appears when the streak is greater than zero.
- The streak is stored locally with the task.
- Existing tasks created before recurrence support receive safe default values.

### Subtasks

Tasks can contain a checklist:

- Add subtasks from the task editor.
- Remove subtasks.
- Preserve subtasks when editing a task.
- Track the completion state of each subtask in the store.

### Search, filtering, and sorting

The Home screen provides:

- Real-time search by task title and description.
- Status filters:
  - All
  - Today
  - Upcoming
  - Completed
- Category filters.
- Sorting by:
  - Due date
  - Priority
  - Creation date

### Progress tracking

The Home screen includes a daily progress card showing:

- Completed task count.
- Total task count.
- Completion percentage.
- Visual progress bar.

### Focus timer

The Focus screen provides a 25-minute Pomodoro-style timer:

- Select an active task.
- Start a focus session.
- Pause the timer.
- Reset the timer.
- Receive haptic feedback when the session finishes.

### Swipe gestures

Task rows support fast gesture actions:

- **Swipe right:** complete or reactivate a task.
- **Swipe left:** delete a task.

### Haptic feedback

Haptics are used for important interactions:

- Saving a task.
- Completing a task.
- Starting or pausing focus mode.
- Pull-to-refresh.
- Finishing a focus session.

### Offline persistence

Tasks are stored locally with AsyncStorage and managed through Zustand.

Task data remains available after:

- Closing the app.
- Restarting the device.
- Reloading the development server.

Persisted tasks are normalized during hydration so older saved tasks continue to work after the data model gains recurrence and streak fields.

### Local reminders

Tasks with future due dates can schedule local reminders through `expo-notifications`.

The notification utility:

- Requests permission when required.
- Schedules a reminder for a task's due date.
- Cancels old reminders when tasks are edited or deleted.
- Handles unsupported notification environments without crashing the app.

### Light and dark mode

The app follows the device system color scheme and supports:

- Light mode
- Dark mode

Cards, backgrounds, text, borders, badges, controls, and navigation adapt automatically.

### Mobile UI

The interface includes:

- Safe-area support for notches and system bars.
- A floating action button.
- Horizontal scrolling filter and category chips.
- Keyboard-aware task editing.
- Touch-friendly controls.
- Responsive layouts for Android, iOS, and web.

## Screens

### Home screen

The Home screen contains:

- Greeting header.
- Current-day label.
- User avatar.
- Daily progress summary.
- Search bar.
- Status filter tabs.
- Category filter chips.
- Sort control.
- Task list.
- Empty-state message.
- Floating action button.

### Focus screen

The Focus screen contains:

- Focus mode introduction.
- 25-minute timer.
- Start, pause, and reset controls.
- Active task selector.
- Current focus-task indicator.

## Task model

The task type is defined in `src/types/task.ts`.

```ts
type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

type Task = {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category: 'Work' | 'Personal' | 'Urgent';
  completed: boolean;
  createdAt: string;
  subtasks: Subtask[];
  notificationId?: string;
  recurrence: TaskRecurrence;
  streak: number;
  lastCompletedDate: string | null;
};
```

## Technology stack

| Technology | Purpose |
|---|---|
| Expo SDK 58 | App framework and native runtime |
| React Native | Cross-platform mobile UI |
| TypeScript | Static typing |
| Expo Router | File-based navigation |
| Zustand | Task state management |
| AsyncStorage | Offline local persistence |
| Expo Notifications | Local task reminders |
| Expo Haptics | Tactile feedback |
| React Native Gesture Handler | Swipe gestures |
| React Native Reanimated | Gesture and animation support |
| React Native Safe Area Context | Safe-area handling |
| React Native Community DateTimePicker | Native date/time selection |
| Expo Vector Icons | Ionicons and interface icons |

## Project structure

```text
myFirstMobileApp/
├── assets/
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── explore.tsx
│   ├── components/
│   │   ├── app-tabs.tsx
│   │   ├── app-tabs.web.tsx
│   │   ├── task-modal.tsx
│   │   └── task-row.tsx
│   ├── constants/
│   │   └── theme.ts
│   ├── hooks/
│   ├── store/
│   │   └── task-store.ts
│   ├── types/
│   │   └── task.ts
│   └── utils/
│       └── notifications.ts
├── app.json
├── package.json
├── tsconfig.json
├── APP_FEATURES.md
└── README.md
```

## Getting started

### Requirements

- Node.js
- npm
- Expo-compatible Android or iOS environment
- Expo Go for the core app experience, or an Expo development build for full native notification support

### Installation

```bash
npm install
```

### Start the development server

```bash
npx expo start
```

Useful commands:

```bash
npx expo start -c
npx expo start --android
npx expo start --ios
npx expo start --web
```

## Validation

Typecheck the project:

```bash
npx tsc --noEmit
```

Run Expo lint:

```bash
npx expo lint
```

Verify the Android bundle:

```bash
npx expo export --platform android
```

## Expo Go limitations

The main task-management features work in Expo Go, including:

- Task CRUD.
- AsyncStorage persistence.
- Search and filtering.
- Recurring task logic.
- Streak tracking.
- Swipe gestures.
- Haptics.
- Focus timer.

Android notification functionality has platform limitations in Expo Go. Remote push notifications require an Expo development build. Local notification APIs may also be limited depending on the Expo Go runtime and device. The app handles unavailable notification APIs safely without crashing.

## License

This project is a private application project. Add a license here if the project is later distributed publicly.
