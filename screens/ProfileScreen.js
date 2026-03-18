import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import * as userService from '../services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from "expo-document-picker";


export default function ProfileScreen() {
  const { user, logout, setUser } = useAuth();
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState(null); // 'name', 'phone', 'emergencyEmail', 'alertDays'
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePickAvatar = async () => {
    if (!user) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const avatarUri = result.assets[0].uri;
      await userService.updateUser(user.id, { avatarUri });
      const freshUser = await userService.getUserById(user.id);
      await AsyncStorage.setItem('user', JSON.stringify(freshUser));
      setUser(freshUser);
      Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện!');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể cập nhật ảnh đại diện. Vui lòng thử lại.');
    }
  };

  // Helper: get field label
  const getLabel = (field) => {
    switch (field) {
      case 'emergencyEmail': return 'Email người thân';
      case 'email': return 'Email';
      default: return '';
    }
  };

  // Helper: get current value
  const getCurrentValue = (field) => {
    if (!user) return '';
    if (field === 'alertDays') return user.alertDays?.toString() || '';
    return user[field] || '';
  };

  // Open modal to edit field
  const handleEdit = (field) => {
    setFieldToEdit(field);
    setEditValue(getCurrentValue(field));
    setModalVisible(true);
  };

  // Save change
  const handleSave = async () => {
    if (!user || !fieldToEdit) return;
    if (!editValue.trim()) {
      Alert.alert('Lỗi', 'Không được để trống');
      return;
    }
    setSaving(true);
    try {
      let value = editValue;
      await userService.updateUser(user.id, { [fieldToEdit]: value });
      // Fetch lại user mới nhất từ server
      const freshUser = await userService.getUserById(user.id);
      await AsyncStorage.setItem('user', JSON.stringify(freshUser));
      setUser(freshUser); // Cập nhật context để hiển thị ngay
      Alert.alert('Thành công', 'Đã cập nhật thông tin!');
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8}>
              <View style={styles.avatarCircle}>
                {user?.avatarUri ? (
                  <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {user?.name ? user.name.trim().split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : 'U'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePickAvatar}>
              <Text style={styles.avatarChangeText}>Đổi ảnh đại diện</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitle}>Hồ sơ của tôi</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.infoValueRow}>
              <Text style={styles.infoValue}>{user?.email || ''}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email người thân</Text>
            <View style={styles.infoValueRow}>
              <Text style={styles.infoValue}>{user?.emergencyEmail || ''}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal chỉnh sửa */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thay đổi {getLabel(fieldToEdit)}</Text>
            <TextInput
              style={styles.input}
              placeholder={getLabel(fieldToEdit)}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType={fieldToEdit === 'alertDays' ? 'numeric' : (fieldToEdit === 'phone' ? 'phone-pad' : (fieldToEdit === 'emergencyEmail' ? 'email-address' : 'default'))}
              autoCapitalize={fieldToEdit === 'emergencyEmail' ? 'none' : 'sentences'}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#4F8EF7' }]} onPress={handleSave} disabled={saving}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={() => setModalVisible(false)} disabled={saving}>
                <Text style={{ color: '#333', fontWeight: 'bold' }}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eaf0fa",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 30,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 32,
    marginHorizontal: 12,
    paddingVertical: 36,
    paddingHorizontal: 20,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 7,
    alignItems: 'center',
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#eaf0fa',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#2563eb',
    letterSpacing: 1,
  },
  avatarChangeText: {
    color: '#2563eb',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#2563eb",
    textAlign: "center",
    letterSpacing: 1.2,
  },
  infoRow: {
    marginBottom: 26,
    width: '100%',
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    backgroundColor: '#f6f8fc',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 18,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  infoValue: {
    fontSize: 18,
    color: '#222',
    fontWeight: '500',
    flex: 1,
  },
  editBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#2563eb',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 18,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
  editBtnText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.2,
  },
  logoutButton: {
    backgroundColor: "#f44336",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 36,
    shadowColor: "#f44336",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 7,
    elevation: 3,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#2563eb',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  modalButton: {
    minWidth: 90,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginHorizontal: 6,
  },
});
