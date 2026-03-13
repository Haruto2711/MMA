import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
// Giả sử bạn sẽ dùng hàm updateUserProfile từ userService do Thành viết
// import { updateUserProfile } from '../services/userService'; 

export default function ProfileScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyEmail, setEmergencyEmail] = useState('');
  const [alertDays, setAlertDays] = useState('3');

  const handleSaveProfile = async () => {
    if (!emergencyEmail || !alertDays) {
      Alert.alert('Lỗi', 'Vui lòng nhập Email người thân và Số ngày báo động!');
      return;
    }

    const userData = { fullName, phone, emergencyEmail, alertDays: parseInt(alertDays) };
    
    try {
      // Sau này bạn sẽ gọi API ở đây:
      // await updateUserProfile(userData);
      console.log("Dữ liệu chuẩn bị lưu:", userData);
      Alert.alert('Thành công', 'Đã cập nhật hồ sơ cá nhân an toàn!');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu thông tin. Vui lòng thử lại.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Hồ sơ của tôi</Text>

      {/* Tối ưu: Nếu file components/CustomInput.js của team đã làm xong, bạn có thể thay thế TextInput mặc định bằng <CustomInput /> nhé */}
      <Text style={styles.label}>Họ và tên</Text>
      <TextInput style={styles.input} placeholder="Nhập tên" value={fullName} onChangeText={setFullName} />

      <Text style={styles.label}>Số điện thoại</Text>
      <TextInput style={styles.input} placeholder="Nhập số điện thoại" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

      <Text style={styles.label}>Email người thân</Text>
      <TextInput style={styles.input} placeholder="nguoi.nha@gmail.com" keyboardType="email-address" autoCapitalize="none" value={emergencyEmail} onChangeText={setEmergencyEmail} />

      <Text style={styles.label}>Số ngày cảnh báo</Text>
      <TextInput style={styles.input} placeholder="VD: 3" keyboardType="numeric" value={alertDays} onChangeText={setAlertDays} />

      <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
        <Text style={styles.buttonText}>Lưu thông tin</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 16, marginBottom: 5, color: '#555', fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});