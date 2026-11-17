import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Task, TaskCategory, TaskDraft, TaskPriority, TaskRecurrence } from '@/types/task';

type Props = {
  visible: boolean;
  task?: Task;
  colors: Record<string, string>;
  onClose: () => void;
  onSave: (draft: TaskDraft) => Promise<void>;
};

const priorities: TaskPriority[] = ['low', 'medium', 'high'];
const categories: TaskCategory[] = ['Work', 'Personal', 'Urgent'];
const recurrences: { value: TaskRecurrence; label: string }[] = [
  { value: 'none', label: 'Never' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function TaskModal({ visible, task, colors, onClose, onSave }: Props) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');
  const [category, setCategory] = useState<TaskCategory>(task?.category ?? 'Personal');
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate ? new Date(task.dueDate) : undefined);
  const [showPicker, setShowPicker] = useState(false);
  const [subtaskText, setSubtaskText] = useState('');
  const [subtasks, setSubtasks] = useState<Task['subtasks']>(task?.subtasks ?? []);
  const [recurrence, setRecurrence] = useState<TaskRecurrence>(task?.recurrence ?? 'none');
  const [pickerMinimum] = useState(() => new Date());
  const [isSaving, setIsSaving] = useState(false);
  const saveLock = useRef(false);

  const save = async () => {
    if (!title.trim() || saveLock.current) return;
    saveLock.current = true;
    setIsSaving(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        dueDate: dueDate?.toISOString(),
        subtasks,
        recurrence,
      });
      onClose();
    } finally {
      saveLock.current = false;
      setIsSaving(false);
    }
  };

  const openAndroidPicker = () => {
    const initialDate = dueDate ?? new Date(pickerMinimum.getTime() + 60 * 60 * 1000);
    DateTimePickerAndroid.open({
      value: initialDate,
      mode: 'date',
      minimumDate: pickerMinimum,
      onValueChange: (_event, selectedDate) => {
        const date = new Date(selectedDate);
        DateTimePickerAndroid.open({
          value: dueDate ?? date,
          mode: 'time',
          onValueChange: (_timeEvent, selectedTime) => {
            const result = new Date(date);
            result.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
            setDueDate(result);
          },
        });
      },
    });
  };

  const pickerValueChange = (_event: DateTimePickerChangeEvent, value: Date) => {
    setDueDate(value);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.eyebrow, { color: colors.accent }]}>{task ? 'UPDATE TASK' : 'NEW TASK'}</Text>
              <Text style={[styles.heading, { color: colors.text }]}>{task ? 'Make it even better' : 'What will you accomplish?'}</Text>
            </View>
            <Pressable onPress={onClose} style={[styles.close, { backgroundColor: colors.card }]}>
              <Ionicons name="close" size={20} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
            <TextInput autoFocus={!task} placeholder="Task title" placeholderTextColor={colors.muted} value={title} onChangeText={setTitle} style={[styles.input, styles.titleInput, { color: colors.text, borderColor: colors.border }]} />
            <TextInput multiline placeholder="Add a note or description..." placeholderTextColor={colors.muted} value={description} onChangeText={setDescription} style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]} />
            <Text style={[styles.label, { color: colors.muted }]}>Priority</Text>
            <View style={styles.chipRow}>
              {priorities.map((item) => (
                <Pressable key={item} onPress={() => setPriority(item)} style={[styles.chip, { backgroundColor: priority === item ? colors.accent : colors.card }]}>
                  <Text style={{ color: priority === item ? '#fff' : colors.muted, fontWeight: '700', textTransform: 'capitalize' }}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.label, { color: colors.muted }]}>Category</Text>
            <View style={styles.chipRow}>
              {categories.map((item) => (
                <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, { backgroundColor: category === item ? colors.accent : colors.card }]}>
                  <Text style={{ color: category === item ? '#fff' : colors.muted, fontWeight: '700' }}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.label, { color: colors.muted }]}>Due date</Text>
            <Pressable onPress={() => Platform.OS === 'android' ? openAndroidPicker() : setShowPicker(true)} style={[styles.dateButton, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Ionicons name="calendar-outline" size={18} color={colors.accent} />
              <Text style={{ color: colors.text, fontWeight: '600' }}>{dueDate ? dueDate.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Choose date and time'}</Text>
              {dueDate && <Pressable onPress={() => setDueDate(undefined)}><Ionicons name="close-circle" size={18} color={colors.muted} /></Pressable>}
            </Pressable>
            {Platform.OS === 'ios' && showPicker && (
              <DateTimePicker
                value={dueDate ?? new Date(pickerMinimum.getTime() + 60 * 60 * 1000)}
                mode="datetime"
                minimumDate={pickerMinimum}
                onValueChange={pickerValueChange}
                onDismiss={() => setShowPicker(false)}
              />
            )}
            <Text style={[styles.label, { color: colors.muted }]}>Repeat</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.repeatRow}>
              {recurrences.map((item) => (
                <Pressable
                  key={item.value}
                  onPress={() => setRecurrence(item.value)}
                  style={[styles.chip, { backgroundColor: recurrence === item.value ? colors.accent : colors.card }]}>
                  <Text style={{ color: recurrence === item.value ? '#fff' : colors.muted, fontWeight: '700' }}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={[styles.label, { color: colors.muted }]}>Subtasks</Text>
            <View style={styles.subtaskInput}>
              <TextInput value={subtaskText} onChangeText={setSubtaskText} placeholder="Add a checklist item" placeholderTextColor={colors.muted} style={{ flex: 1, color: colors.text }} onSubmitEditing={() => { if (subtaskText.trim()) { setSubtasks([...subtasks, { id: `${Date.now()}`, title: subtaskText.trim(), completed: false }]); setSubtaskText(''); } }} />
              <Pressable onPress={() => { if (subtaskText.trim()) { setSubtasks([...subtasks, { id: `${Date.now()}`, title: subtaskText.trim(), completed: false }]); setSubtaskText(''); } }}>
                <Ionicons name="add-circle" size={24} color={colors.accent} />
              </Pressable>
            </View>
            {subtasks.map((item) => <View key={item.id} style={styles.subtask}><Ionicons name="checkmark-circle-outline" size={17} color={colors.accent} /><Text style={{ color: colors.text, flex: 1 }}>{item.title}</Text><Pressable onPress={() => setSubtasks(subtasks.filter((subtask) => subtask.id !== item.id))}><Ionicons name="trash-outline" size={16} color={colors.muted} /></Pressable></View>)}
            <Pressable disabled={!title.trim() || isSaving} onPress={save} style={[styles.saveButton, { backgroundColor: title.trim() && !isSaving ? colors.accent : colors.border }]}>
              <Text style={styles.saveText}>{isSaving ? 'Saving...' : task ? 'Save changes' : 'Add task'}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.42)' },
  sheet: { maxHeight: '92%', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  eyebrow: { fontSize: 11, letterSpacing: 1.4, fontWeight: '800', marginBottom: 6 },
  heading: { fontSize: 23, fontWeight: '800' },
  close: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  form: { gap: 14, paddingBottom: 24 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 13, fontSize: 15 },
  titleInput: { fontSize: 18, fontWeight: '700' },
  textArea: { minHeight: 88, textAlignVertical: 'top' },
  label: { fontSize: 12, fontWeight: '800', marginTop: 4 },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  repeatRow: { gap: 8, paddingRight: 8 },
  chip: { borderRadius: 12, paddingHorizontal: 13, paddingVertical: 9 },
  dateButton: { minHeight: 50, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  subtaskInput: { borderWidth: 1, borderColor: '#D5D6DE', borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', minHeight: 50 },
  subtask: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  saveButton: { minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 8 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
