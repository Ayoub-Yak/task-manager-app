# Focus Flow

Focus Flow is a modern, offline-first task management mobile app built with Expo, React Native, TypeScript, and Expo Router. It helps users capture tasks, organize priorities, plan due dates, complete work, and focus through Pomodoro-style work sessions.

## Main Features

### Task management

- Create new tasks from the floating action button.
- Edit existing tasks from the task card.
- Delete tasks by swiping left.
- Mark tasks complete or active by:
  - Tapping the circular checkbox.
  - Swiping right.
- Store the following task information:
  - Title
  - Description
  - Priority
  - Category
  - Due date and time
  - Completion status
  - Subtasks

### Priorities

Tasks support three priority levels:

- Low
- Medium
- High

Each priority has its own visual color badge so important tasks can be identified quickly.

### Categories

Tasks can be organized into:

- Work
- Personal
- Urgent

Category chips allow users to filter the task list instantly.

### Due dates

The task editor includes a native date and time picker. Users can choose a future date and time or remove an existing due date.

Due dates are displayed on task cards and can be used for sorting and filtering.

### Subtasks

Each task can contain a checklist of subtasks. Users can:

- Add checklist items while creating or editing a task.
- Remove checklist items.
- View the checklist inside the task editor.

### Search and filtering

The home screen includes:

- Real-time task search by title and description.
- Status filters:
  - All
  - Today
  - Upcoming
  - Completed
- Horizontal category filters.

### Sorting

Tasks can be sorted by:

- Due date
- Priority
- Creation date

The sort button cycles between the available sorting modes.

### Productivity progress

The home screen displays a daily progress card showing:

- Completed task count
- Total task count
- Completion percentage
- Visual progress bar

### Focus timer

The Focus tab includes a 25-minute Pomodoro timer. Users can:

- Select an active task to focus on.
- Start the focus session.
- Pause the timer.
- Reset the timer.
- Receive haptic feedback when the session finishes.

### Offline persistence

Tasks are saved locally on the device using AsyncStorage. The task state is managed with Zustand, so tasks remain available after closing and reopening the app.

### Local reminders

Tasks with future due dates can schedule local reminders through `expo-notifications`.

The app:

- Requests notification permission when needed.
- Schedules a reminder for the task due time.
- Cancels the previous reminder when a task is updated or deleted.
- Handles unavailable notification APIs without crashing the app.

Remote push notifications are not included. Android remote push notifications require an Expo development build rather than Expo Go.

### Haptic feedback

Haptic feedback is used for important interactions, including:

- Completing tasks.
- Starting or pausing focus sessions.
- Saving tasks.
- Pull-to-refresh.
- Completing the focus timer.

### Swipe gestures

Task rows use gesture handling for quick actions:

- Swipe right: mark the task complete or active.
- Swipe left: delete the task.

### Light and dark mode

The app follows the device system color scheme and supports:

- Light mode
- Dark mode

Colors, cards, text, borders, badges, and navigation controls adapt automatically.

### Responsive mobile interface

The interface includes:

- Safe-area support for notches and system bars.
- A floating action button for quick task creation.
- Scrollable filter and category chips.
- Keyboard-aware task editing.
- Touch-friendly controls.
- Expo Router tab navigation.

## App Screens

### Home

The Home screen provides the complete task workspace:

- Greeting and current-day header.
- Daily progress summary.
- Search bar.
- Status filters.
- Category filters.
- Sorting control.
- Task list.
- Floating action button.

### Focus

The Focus screen provides the Pomodoro timer and a list of active tasks that can be selected as the current focus task.

## Technology

- Expo SDK 58
- React Native
- TypeScript
- Expo Router
- Zustand
- AsyncStorage
- Expo Notifications
- Expo Haptics
- React Native Gesture Handler
- React Native Reanimated
- React Native Safe Area Context
- React Native Community DateTimePicker
- Expo Vector Icons

## Project Structure

```text
src/
  app/
    _layout.tsx
    index.tsx
    explore.tsx
  components/
    app-tabs.tsx
    app-tabs.web.tsx
    task-modal.tsx
    task-row.tsx
  constants/
    theme.ts
  store/
    task-store.ts
  types/
    task.ts
  utils/
    notifications.ts
```

## Running the App

Install dependencies and start Expo:

```bash
npm install
npx expo start
```

The project also passes:

```bash
npx tsc --noEmit
npx expo lint
```
