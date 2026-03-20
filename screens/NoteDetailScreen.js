import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const API_URL = "http://192.168.1.34:3000";
const NOTES_URL = `${API_URL}/notes`;

const getUserNotesKey = (userId) => `userNotes_${String(userId)}`;

const NoteDetailScreen = ({ route, navigation }) => {
  const { note } = route.params || {};
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const storageKey = user?.id ? getUserNotesKey(user.id) : null;
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [attachments, setAttachments] = useState(note?.attachments || []);
  const scrollViewRef = useRef(null);
  const [attachmentAnimations, setAttachmentAnimations] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      title: note ? 'Chỉnh sửa ghi chú' : 'Tạo ghi chú',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#f7f9ff',
      },
      headerTitleStyle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0f172a',
      },
    });
  }, [navigation, note]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền tiêu đề và nội dung');
      return;
    }

    if (!storageKey) {
      Alert.alert('Lỗi', 'Không tìm thấy tài khoản người dùng.');
      return;
    }

    const noteId = note?.id || Date.now().toString();
    const savedNote = {
      id: noteId,
      title: title.trim(),
      content: content.trim(),
      attachments,
      createdAt: note?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const storedNotes = await AsyncStorage.getItem(storageKey);
      const parsedNotes = storedNotes ? JSON.parse(storedNotes) : [];
      const currentNotes = Array.isArray(parsedNotes) ? parsedNotes : [];

      const existingIndex = currentNotes.findIndex((item) => item.id === noteId);
      let newNotes = [];

      if (existingIndex !== -1) {
        newNotes = [...currentNotes];
        newNotes[existingIndex] = savedNote;
      } else {
        newNotes = [savedNote, ...currentNotes];
      }

      await AsyncStorage.setItem(storageKey, JSON.stringify(newNotes));

      // Sync note to backend so the server can include it in reminder emails
      try {
        const backendNote = { ...savedNote, userId: String(user.id) };
        // Check if note already exists on backend
        const existingRes = await fetch(`${NOTES_URL}/${noteId}`);
        if (existingRes.ok) {
          await fetch(`${NOTES_URL}/${noteId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backendNote),
          });
        } else {
          await fetch(NOTES_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backendNote),
          });
        }
      } catch (syncErr) {
        console.warn('Note sync to backend failed (non-critical):', syncErr);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving note detail:', error);
      Alert.alert('Lỗi', 'Không thể lưu ghi chú');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const pickedFile = result.assets && result.assets[0];
      if (!pickedFile) return;

      const fileId = Date.now().toString();
      const fileInfo = {
        uri: pickedFile.uri,
        name: pickedFile.name || 'tep-tin',
        size: pickedFile.size || 0,
        id: fileId,
        mimeType: pickedFile.mimeType || '',
      };

      // Create animation for new attachment
      const animValue = new Animated.Value(0);
      setAttachmentAnimations((prev) => ({
        ...prev,
        [fileId]: animValue,
      }));

      setAttachments((prev) => [...prev, fileInfo]);
      Alert.alert('Thành công', `Tệp "${fileInfo.name}" đã được thêm`);

      // Auto scroll to attachment section
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);

      // Animate fade-in
      Animated.timing(animValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const removeAttachment = (attachmentId) => {
    setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
  };

  const openImageModal = (attachment) => {
    setSelectedImage(attachment);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bgCircleTop} />
      <View style={styles.bgCircleBottom} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ref={scrollViewRef}
        >
          <View style={styles.heroCard}>
            <Text style={styles.heroKicker}>Nội dung cá nhân</Text>
            <Text style={styles.heroTitle}>{note ? 'Cập nhật ghi chú' : 'Tạo ghi chú mới'}</Text>
            <Text style={styles.heroSubtitle}>Nhập thông tin ngắn gọn, rõ ràng để dễ xem lại bất cứ lúc nào.</Text>
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.label}>Tiêu đề</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Tiêu đề ghi chú"
              placeholderTextColor="#9aa3b2"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text style={styles.characterCount}>{title.length}/100</Text>

            <Text style={[styles.label, styles.contentLabel]}>Nội dung</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Nhập nội dung ghi chú của bạn..."
              placeholderTextColor="#9aa3b2"
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={5000}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{content.length}/5000</Text>
          </View>

          <View style={styles.attachmentSection}>
            <Text style={styles.sectionTitle}>Tệp đính kèm</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
              <Text style={styles.uploadButtonText}>Tải lên tệp</Text>
            </TouchableOpacity>

            {attachments.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentScroll}>
                {attachments.map((att) => {
                  const opacity = attachmentAnimations[att.id] || new Animated.Value(1);
                  const isImage = att.mimeType && att.mimeType.startsWith('image/');
                  return (
                    <Animated.View key={att.id} style={[styles.attachmentCard, { opacity }]}>
                      {isImage ? (
                        <TouchableOpacity onPress={() => openImageModal(att)} style={{ flex: 1, width: '100%' }}>
                          <Image source={{ uri: att.uri }} style={styles.attachmentThumbnail} />
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.attachmentPlaceholder}>
                          <Text style={styles.attachmentPlaceholderText}>📄</Text>
                        </View>
                      )}
                      <Text style={styles.attachmentCardName} numberOfLines={1}>{att.name}</Text>
                      <TouchableOpacity
                        style={styles.attachmentCardRemove}
                        onPress={() => removeAttachment(att.id)}
                      >
                        <Text style={styles.removeButton}>✕</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {note && (
            <View style={styles.infoSection}>
              <Text style={styles.infoText}>
                Tạo: {new Date(note.createdAt).toLocaleDateString('vi-VN')}
              </Text>
              {note.updatedAt && (
                <Text style={styles.infoText}>
                  Cập nhật: {new Date(note.updatedAt).toLocaleDateString('vi-VN')}
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        <View
          style={[
            styles.buttonContainer,
            { paddingBottom: Math.max(insets.bottom, 12) + 10 },
          ]}
        >
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Lưu ghi chú</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Image Preview Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={closeImageModal}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          
          <View style={styles.modalContent}>
            <Image
              source={{ uri: selectedImage?.uri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.modalFooter}>
            <Text style={styles.modalImageName} numberOfLines={2}>
              {selectedImage?.name}
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f9ff',
  },
  bgCircleTop: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#dbeafe',
    top: -120,
    right: -70,
  },
  bgCircleBottom: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#fce7f3',
    bottom: -90,
    left: -60,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  heroCard: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e4ebff',
    marginBottom: 12,
  },
  heroKicker: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: '#0284c7',
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  inputCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e4ebff',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  contentLabel: {
    marginTop: 8,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '700',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#f8fbff',
    borderRadius: 12,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#dbe7ff',
    color: '#0f172a',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  contentInput: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 220,
    backgroundColor: '#f8fbff',
    borderRadius: 12,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#dbe7ff',
    textAlign: 'left',
    color: '#0f172a',
  },
  attachmentSection: {
    marginTop: 14,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e4ebff',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#334155',
  },
  uploadButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  attachmentScroll: {
    marginTop: 10,
  },
  attachmentCard: {
    width: 100,
    height: 120,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#dbe7ff',
    overflow: 'hidden',
    alignItems: 'center',
  },
  attachmentThumbnail: {
    width: '100%',
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#dbe7ff',
  },
  attachmentPlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dbe7ff',
  },
  attachmentPlaceholderText: {
    fontSize: 32,
  },
  attachmentCardName: {
    fontSize: 11,
    color: '#1e293b',
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
    textAlign: 'center',
  },
  attachmentCardRemove: {
    padding: 2,
  },
  removeButton: {
    fontSize: 14,
    color: '#e11d48',
    fontWeight: '700',
  },
  infoSection: {
    backgroundColor: '#fff7ed',
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  infoText: {
    fontSize: 12,
    color: '#9a3412',
    marginVertical: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 22,
    gap: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  fullImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.7,
  },
  modalFooter: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  modalImageName: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
  },
});

export default NoteDetailScreen;
