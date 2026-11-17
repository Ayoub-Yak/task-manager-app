import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useTaskStore } from '@/store/task-store';

const FOCUS_SECONDS = 25 * 60;

export default function FocusScreen() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const tasks = useTaskStore((state) => state.tasks);
  const [selectedId, setSelectedId] = useState<string>();
  const [seconds, setSeconds] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const activeTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);
  const selected = activeTasks.find((task) => task.id === selectedId) ?? activeTasks[0];

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((value) => {
      if (value <= 1) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setRunning(false);
        return FOCUS_SECONDS;
      }
      return value - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [running]);

  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Text style={[styles.kicker, { color: colors.accent }]}>FOCUS MODE</Text>
        <Text style={[styles.title, { color: colors.text }]}>One thing at a time.</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>A 25-minute sprint to make meaningful progress.</Text>
        <View style={[styles.timerCard, { backgroundColor: colors.card }]}>
          <View style={[styles.timerRing, { borderColor: `${colors.accent}35` }]}>
            <View style={[styles.timerRingInner, { borderColor: colors.accent }]}>
              <Text style={[styles.timer, { color: colors.text }]}>{minutes}:{remainder}</Text>
              <Text style={[styles.timerCaption, { color: colors.muted }]}>{running ? 'IN PROGRESS' : 'READY WHEN YOU ARE'}</Text>
            </View>
          </View>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setRunning(!running); }} style={[styles.startButton, { backgroundColor: colors.accent }]}>
            <Ionicons name={running ? 'pause' : 'play'} size={18} color="#fff" />
            <Text style={styles.startText}>{running ? 'Pause focus' : 'Start focus'}</Text>
          </Pressable>
          <Pressable onPress={() => { setRunning(false); setSeconds(FOCUS_SECONDS); }}><Text style={{ color: colors.muted, fontWeight: '700' }}>Reset timer</Text></Pressable>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Focus on</Text>
        <View style={styles.taskList}>
          {activeTasks.length ? activeTasks.slice(0, 4).map((task) => <Pressable key={task.id} onPress={() => setSelectedId(task.id)} style={[styles.task, { backgroundColor: selected?.id === task.id ? `${colors.accent}16` : colors.card, borderColor: selected?.id === task.id ? colors.accent : 'transparent' }]}><View style={[styles.taskDot, { backgroundColor: colors.accent }]} /><Text numberOfLines={1} style={{ color: colors.text, flex: 1, fontWeight: '700' }}>{task.title}</Text>{selected?.id === task.id && <Ionicons name="checkmark-circle" size={19} color={colors.accent} />}</Pressable>) : <Text style={{ color: colors.muted }}>Add an active task from Home to start a sprint.</Text>}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 24, gap: 12 },
  kicker: { fontSize: 11, letterSpacing: 1.5, fontWeight: '800', marginTop: 8 },
  title: { fontSize: 30, fontWeight: '900', marginTop: 2 },
  subtitle: { fontSize: 14, lineHeight: 21, marginBottom: 18 },
  timerCard: { borderRadius: 26, padding: 24, alignItems: 'center', gap: 18, marginBottom: 24 },
  timerRing: { width: 220, height: 220, borderRadius: 110, borderWidth: 12, alignItems: 'center', justifyContent: 'center' },
  timerRingInner: { width: 184, height: 184, borderRadius: 92, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  timer: { fontSize: 44, fontWeight: '900', letterSpacing: 1 },
  timerCaption: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginTop: 3 },
  startButton: { minHeight: 52, borderRadius: 16, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 8 },
  startText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  taskList: { gap: 8, marginTop: 4 },
  task: { minHeight: 54, borderRadius: 15, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  taskDot: { width: 8, height: 8, borderRadius: 4 },
});
