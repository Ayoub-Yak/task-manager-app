import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TaskModal } from '@/components/task-modal';
import { TaskRow } from '@/components/task-row';
import { Colors } from '@/constants/theme';
import { useTaskStore } from '@/store/task-store';
import { Task, TaskDraft } from '@/types/task';

type Filter = 'All' | 'Today' | 'Upcoming' | 'Completed';
type Sort = 'due' | 'priority' | 'created';

const filters: Filter[] = ['All', 'Today', 'Upcoming', 'Completed'];
const categories = ['All', 'Work', 'Personal', 'Urgent'] as const;
const priorityWeight = { high: 0, medium: 1, low: 2 };

function isToday(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useTaskStore();
  const [filter, setFilter] = useState<Filter>('All');
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const [sort, setSort] = useState<Sort>('due');
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Task>();

  const visibleTasks = useMemo(() => {
    const now = new Date().getTime();
    return tasks
      .filter((task) => {
        const matchesFilter =
          filter === 'All' ||
          (filter === 'Today' && isToday(task.dueDate)) ||
          (filter === 'Upcoming' && !!task.dueDate && new Date(task.dueDate).getTime() > now && !task.completed) ||
          (filter === 'Completed' && task.completed);
        const matchesCategory = category === 'All' || task.category === category;
        const query = search.trim().toLowerCase();
        return matchesFilter && matchesCategory && (!query || `${task.title} ${task.description}`.toLowerCase().includes(query));
      })
      .sort((a, b) => {
        if (sort === 'priority') return priorityWeight[a.priority] - priorityWeight[b.priority];
        if (sort === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return (a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER) - (b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER);
      });
  }, [category, filter, search, sort, tasks]);

  const openNew = () => {
    setEditing(undefined);
    setModalVisible(true);
  };

  const saveTask = async (draft: TaskDraft) => {
    if (editing) await updateTask(editing.id, draft);
    else await addTask(draft);
  };

  const completedCount = tasks.filter((task) => task.completed).length;
  const progress = tasks.length ? completedCount / tasks.length : 0;

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} tintColor={colors.accent} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.kicker, { color: colors.accent }]}>TUESDAY, NOVEMBER 17</Text>
            <Text style={[styles.greeting, { color: colors.text }]}>Good morning, Ayoub</Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        </View>
        <View style={[styles.progressCard, { backgroundColor: colors.accent }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.progressLabel}>YOUR DAILY FLOW</Text>
            <Text style={styles.progressTitle}>{completedCount} of {tasks.length} tasks complete</Text>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(progress, 0.02) * 100}%` }]} /></View>
          </View>
          <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
        </View>
        <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={19} color={colors.muted} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search your tasks..." placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.text }]} />
          {search.length > 0 && <Pressable onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={colors.muted} /></Pressable>}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
          {filters.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, { backgroundColor: filter === item ? colors.text : colors.card }]}><Text style={{ color: filter === item ? colors.background : colors.muted, fontWeight: '700' }}>{item}</Text></Pressable>)}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
          {categories.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.category, { borderColor: category === item ? colors.accent : colors.border, backgroundColor: category === item ? `${colors.accent}16` : 'transparent' }]}><Text style={{ color: category === item ? colors.accent : colors.muted, fontWeight: '700', fontSize: 12 }}>{item}</Text></Pressable>)}
          <Pressable onPress={() => setSort(sort === 'due' ? 'priority' : sort === 'priority' ? 'created' : 'due')} style={[styles.sortButton, { backgroundColor: colors.card }]}><Ionicons name="swap-vertical" size={15} color={colors.muted} /><Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700' }}>{sort === 'due' ? 'Due date' : sort === 'priority' ? 'Priority' : 'Created'}</Text></Pressable>
        </ScrollView>
        <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.text }]}>My tasks</Text><Text style={[styles.count, { color: colors.muted }]}>{visibleTasks.length} items</Text></View>
        {visibleTasks.length ? visibleTasks.map((task) => <TaskRow key={task.id} task={task} colors={colors} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} onPress={() => { setEditing(task); setModalVisible(true); }} />) : <View style={[styles.empty, { backgroundColor: colors.card }]}><Ionicons name="sparkles-outline" size={32} color={colors.accent} /><Text style={[styles.emptyTitle, { color: colors.text }]}>A clear mind starts here</Text><Text style={[styles.emptyText, { color: colors.muted }]}>Add a task to turn your next idea into momentum.</Text></View>}
      </ScrollView>
      <Pressable onPress={openNew} style={[styles.fab, { backgroundColor: colors.accent }]}><Ionicons name="add" size={29} color="#fff" /></Pressable>
      <TaskModal key={`${modalVisible}-${editing?.id ?? 'new'}`} visible={modalVisible} task={editing} colors={colors} onClose={() => setModalVisible(false)} onSave={saveTask} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingHorizontal: 20, paddingBottom: 110, gap: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 },
  kicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginBottom: 6 },
  greeting: { fontSize: 26, fontWeight: '800' },
  avatar: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  progressCard: { borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16 },
  progressLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  progressTitle: { color: '#fff', fontSize: 17, fontWeight: '800', marginTop: 6, marginBottom: 13 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
  progressPercent: { color: '#fff', fontSize: 26, fontWeight: '900' },
  searchBox: { minHeight: 50, borderRadius: 15, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9 },
  searchInput: { flex: 1, fontSize: 14 },
  horizontal: { gap: 8, paddingRight: 20 },
  filter: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 12 },
  category: { borderWidth: 1, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 12 },
  sortButton: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 3 },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  count: { fontSize: 12 },
  empty: { borderRadius: 20, padding: 28, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptyText: { textAlign: 'center', fontSize: 13, lineHeight: 19 },
  fab: { position: 'absolute', right: 22, bottom: 24, width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
});
