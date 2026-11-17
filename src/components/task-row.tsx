import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Task } from '@/types/task';

type Props = {
  task: Task;
  colors: Record<string, string>;
  onPress: () => void;
  onToggle: () => void;
  onDelete: () => void;
};

const priorityColors = {
  low: '#4C9A6A',
  medium: '#D58A29',
  high: '#D95C5C',
};

export function TaskRow({ task, colors, onPress, onToggle, onDelete }: Props) {
  const rightAction = () => (
    <Pressable
      accessibilityLabel={`Delete ${task.title}`}
      onPress={onDelete}
      style={[styles.action, { backgroundColor: '#D95C5C' }]}>
      <Ionicons name="trash-outline" size={22} color="#fff" />
    </Pressable>
  );

  const leftAction = () => (
    <Pressable
      accessibilityLabel={task.completed ? `Mark ${task.title} active` : `Complete ${task.title}`}
      onPress={onToggle}
      style={[styles.action, { backgroundColor: '#4C9A6A' }]}>
      <Ionicons name={task.completed ? 'refresh-outline' : 'checkmark-outline'} size={24} color="#fff" />
    </Pressable>
  );

  const dueLabel = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'No due date';

  return (
    <Swipeable renderLeftActions={leftAction} renderRightActions={rightAction} overshootLeft={false} overshootRight={false}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: colors.card }, pressed && styles.pressed]}>
        <Pressable
          hitSlop={10}
          onPress={async () => {
            await Haptics.selectionAsync();
            onToggle();
          }}
          style={[styles.checkbox, { borderColor: task.completed ? colors.accent : colors.muted }]}>
          {task.completed && <Ionicons name="checkmark" size={15} color="#fff" />}
        </Pressable>
        <View style={styles.content}>
          <Text numberOfLines={1} style={[styles.title, { color: task.completed ? colors.muted : colors.text }, task.completed && styles.completed]}>
            {task.title}
          </Text>
          {!!task.description && (
            <Text numberOfLines={1} style={[styles.description, { color: colors.muted }]}>
              {task.description}
            </Text>
          )}
          <View style={styles.meta}>
            <View style={[styles.badge, { backgroundColor: `${priorityColors[task.priority]}20` }]}>
              <View style={[styles.dot, { backgroundColor: priorityColors[task.priority] }]} />
              <Text style={[styles.badgeText, { color: priorityColors[task.priority] }]}>{task.priority}</Text>
            </View>
            <Text style={[styles.metaText, { color: colors.muted }]}>{task.category}</Text>
            <Text style={[styles.metaText, { color: colors.muted }]}>{dueLabel}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  action: { width: 76, justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderRadius: 18 },
  card: { minHeight: 92, borderRadius: 18, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  pressed: { opacity: 0.8 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  content: { flex: 1, gap: 5 },
  title: { fontSize: 16, fontWeight: '700' },
  completed: { textDecorationLine: 'line-through' },
  description: { fontSize: 13 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  metaText: { fontSize: 11 },
});
