import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const getUserNotesKey = (userId) => `userNotes_${String(userId)}`;

const NotesScreen = () => {
  const [notes, setNotes] = useState([]);
  const navigation = useNavigation();
  const { user } = useAuth();
  const storageKey = user?.id ? getUserNotesKey(user.id) : null;

  useFocusEffect(
    React.useCallback(() => {
      loadNotes();
    }, [storageKey])
  );

  const loadNotes = async () => {
    try {
      if (!storageKey) {
        setNotes([]);
        return;
      }

      const storedNotes = await AsyncStorage.getItem(storageKey);
      if (storedNotes) {
        const parsedNotes = JSON.parse(storedNotes);
        setNotes(Array.isArray(parsedNotes) ? parsedNotes : []);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      Alert.alert('Lỗi', 'Không thể tải ghi chú');
    }
  };

  const saveNotes = async (newNotes) => {
    try {
      if (!storageKey) {
        Alert.alert('Lỗi', 'Không tìm thấy tài khoản người dùng.');
        return;
      }

      await AsyncStorage.setItem(storageKey, JSON.stringify(newNotes));
      setNotes(newNotes);
    } catch (error) {
      console.error('Error saving notes:', error);
      Alert.alert('Lỗi', 'Không thể lưu ghi chú');
    }
  };

  const addNote = () => {
    if (!user?.id) {
      Alert.alert('Lỗi', 'Không tìm thấy người dùng để tạo ghi chú.');
      return;
    }

    navigation.navigate('NoteDetail', {
      note: null,
    });
  };

  const editNote = (note) => {
    navigation.navigate('NoteDetail', {
      note,
    });
  };

  const deleteNote = (noteId) => {
    Alert.alert(
      'Xóa ghi chú',
      'Bạn có chắc muốn xóa ghi chú này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            const newNotes = notes.filter(note => note.id !== noteId);
            saveNotes(newNotes);
          },
        },
      ]
    );
  };

  const renderNote = ({ item }) => (
    <TouchableOpacity
      style={styles.noteItem}
      onPress={() => editNote(item)}
      activeOpacity={0.7}
    >
      <View style={styles.noteAccent} />
      <View style={styles.noteContent}>
        <View style={styles.noteTitleRow}>
          <Text style={styles.noteTitle}>{item.title}</Text>
          {item.attachments && item.attachments.length > 0 && (
            <Text style={styles.attachmentBadge}>📎</Text>
          )}
        </View>
        <Text style={styles.noteDate}>
          {new Date(item.updatedAt || item.createdAt).toLocaleDateString('vi-VN')}
        </Text>
        <Text style={styles.notePreview} numberOfLines={2}>{item.content}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNote(item.id)}
      >
        <Text style={styles.deleteText}>Xóa</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.kicker}>Sổ tay an toàn</Text>
        <Text style={styles.headerTitle}>Ghi chú cá nhân</Text>
        <Text style={styles.subtitle}>Lưu nhanh điều quan trọng để không bỏ sót check-in và việc cần làm.</Text>
        <View style={styles.countChip}>
          <Text style={styles.countChipText}>{notes.length} ghi chú</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={addNote}>
        <Text style={styles.addButtonIcon}>+</Text>
        <Text style={styles.addButtonText}>Tạo ghi chú mới</Text>
      </TouchableOpacity>

      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🗒️</Text>
            <Text style={styles.emptyText}>Chưa có ghi chú nào</Text>
            <Text style={styles.emptySubtext}>Nhấn "Tạo ghi chú mới" để bắt đầu.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f6ff',
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edff',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#1d4ed8',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  countChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    marginTop: 12,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countChipText: {
    color: '#1e40af',
    fontSize: 13,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: '#0ea5e9',
    marginBottom: 14,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  addButtonIcon: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 22,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  noteItem: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingRight: 12,
    paddingLeft: 10,
    marginBottom: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8edff',
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  noteAccent: {
    width: 5,
    height: '88%',
    borderRadius: 8,
    backgroundColor: '#38bdf8',
    marginRight: 10,
  },
  noteContent: {
    flex: 1,
    marginRight: 8,
  },
  noteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  attachmentBadge: {
    fontSize: 14,
  },
  noteDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 7,
    marginTop: 3,
  },
  notePreview: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
  },
  deleteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#ffe4e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e11d48',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 56,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8edff',
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 14,
    color: '#38bdf8',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 42,
  },
});

export default NotesScreen;