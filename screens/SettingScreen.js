
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Switch, TouchableOpacity, Alert, TextInput, Modal, Pressable } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';

export default function SettingScreen() {
	const { user, logout } = useAuth();
	const [notificationEnabled, setNotificationEnabled] = useState(true);
	// Đổi mật khẩu
	const [showChangePassword, setShowChangePassword] = useState(false);
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [changing, setChanging] = useState(false);
	// Đổi tên
	// Đổi email đăng nhập
	const [showChangeLoginEmail, setShowChangeLoginEmail] = useState(false);
	const [newLoginEmail, setNewLoginEmail] = useState("");
	// Đổi email khẩn cấp
	const [showChangeEmergencyEmail, setShowChangeEmergencyEmail] = useState(false);
	const [newEmergencyEmail, setNewEmergencyEmail] = useState("");

	// Cập nhật user context và AsyncStorage
	const updateUserContext = async (updatedFields) => {
		const updatedUser = { ...user, ...updatedFields };
		await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
		// Cập nhật lại user trong context (nếu cần, reload app sẽ lấy từ AsyncStorage)
		// Nếu muốn cập nhật ngay, cần có setUser từ useAuth, ở đây chỉ cập nhật AsyncStorage
	};

	const toggleNotification = () => setNotificationEnabled((prev) => !prev);


	// Đổi email đăng nhập
	const handleChangeLoginEmail = () => {
		setNewLoginEmail(user.email || "");
		setShowChangeLoginEmail(true);
	};
	const handleSubmitChangeLoginEmail = async () => {
		if (!newLoginEmail.trim()) {
			Alert.alert('Lỗi', 'Email không được để trống');
			return;
		}
		// Có thể kiểm tra định dạng email ở đây
		try {
			await userService.updateUser(user.id, { email: newLoginEmail });
			await updateUserContext({ email: newLoginEmail });
			Alert.alert('Thành công', 'Đổi email đăng nhập thành công!');
			setShowChangeLoginEmail(false);
		} catch (e) {
			Alert.alert('Lỗi', 'Đổi email đăng nhập thất bại!');
		}
	};

	// Đổi email khẩn cấp
	const handleChangeEmergencyEmail = () => {
		setNewEmergencyEmail(user.emergencyEmail || "");
		setShowChangeEmergencyEmail(true);
	};
	const handleSubmitChangeEmergencyEmail = async () => {
		if (!newEmergencyEmail.trim()) {
			Alert.alert('Lỗi', 'Email khẩn cấp không được để trống');
			return;
		}
		try {
			await userService.updateUser(user.id, { emergencyEmail: newEmergencyEmail });
			await updateUserContext({ emergencyEmail: newEmergencyEmail });
			Alert.alert('Thành công', 'Đổi email khẩn cấp thành công!');
			setShowChangeEmergencyEmail(false);
		} catch (e) {
			Alert.alert('Lỗi', 'Đổi email khẩn cấp thất bại!');
		}
	};

	// Đổi mật khẩu
	const handleChangePassword = () => {
		setShowChangePassword(true);
	};
	const handleSubmitChangePassword = async () => {
		if (!oldPassword || !newPassword || !confirmPassword) {
			Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
			return;
		}
		if (newPassword !== confirmPassword) {
			Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
			return;
		}
		if (oldPassword !== user.password) {
			Alert.alert('Lỗi', 'Mật khẩu cũ không đúng');
			return;
		}
		setChanging(true);
		try {
			await userService.updateUser(user.id, { password: newPassword });
			await updateUserContext({ password: newPassword });
			Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
			setShowChangePassword(false);
		} catch (e) {
			Alert.alert('Lỗi', 'Đổi mật khẩu thất bại!');
		} finally {
			setChanging(false);
			setOldPassword("");
			setNewPassword("");
			setConfirmPassword("");
		}
	};

	   return (
		   <SafeAreaView style={styles.safeArea}>
			   <View style={styles.container}>
				   <Text style={styles.header}>Cài đặt</Text>

				   <View style={styles.card}>
					   <TouchableOpacity style={styles.settingRow} onPress={handleChangeLoginEmail}>
						   <View style={styles.settingInfo}>
							   <Text style={styles.label}>Đổi email đăng nhập</Text>
							   <Text style={styles.subLabel}>{user?.email || ''}</Text>
						   </View>
						   <Text style={styles.link}>Thay đổi</Text>
					   </TouchableOpacity>
					   <TouchableOpacity style={styles.settingRow} onPress={handleChangeEmergencyEmail}>
						   <View style={styles.settingInfo}>
							   <Text style={styles.label}>Đổi email khẩn cấp</Text>
							   <Text style={styles.subLabel}>{user?.emergencyEmail || ''}</Text>
						   </View>
						   <Text style={styles.link}>Thay đổi</Text>
					   </TouchableOpacity>
					   <View style={styles.settingRow}>
						   <View style={styles.settingInfo}>
							   <Text style={styles.label}>Nhận thông báo</Text>
						   </View>
						   <Switch
							   trackColor={{ false: '#ccc', true: '#4F8EF7' }}
							   thumbColor={notificationEnabled ? '#4F8EF7' : '#f4f3f4'}
							   ios_backgroundColor="#ccc"
							   onValueChange={toggleNotification}
							   value={notificationEnabled}
						   />
					   </View>
					   <TouchableOpacity style={styles.settingRow} onPress={handleChangePassword}>
						   <View style={styles.settingInfo}>
							   <Text style={styles.label}>Đổi mật khẩu</Text>
						   </View>
						   <Text style={styles.link}>Thay đổi</Text>
					   </TouchableOpacity>
				   </View>

				   <TouchableOpacity style={styles.logoutButton} onPress={logout}>
					   <Text style={styles.logoutText}>Đăng xuất</Text>
				   </TouchableOpacity>
			   </View>


			{/* Modal đổi email đăng nhập */}
			<Modal
				visible={showChangeLoginEmail}
				animationType="slide"
				transparent
				onRequestClose={() => setShowChangeLoginEmail(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Đổi email đăng nhập</Text>
						<TextInput
							style={styles.input}
							placeholder="Email đăng nhập mới"
							value={newLoginEmail}
							onChangeText={setNewLoginEmail}
							autoCapitalize="none"
							keyboardType="email-address"
						/>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
							<Pressable
								style={[styles.modalButton, { backgroundColor: '#4F8EF7' }]}
								onPress={handleSubmitChangeLoginEmail}
							>
								<Text style={{ color: '#fff', fontWeight: 'bold' }}>Lưu</Text>
							</Pressable>
							<Pressable
								style={[styles.modalButton, { backgroundColor: '#ccc' }]}
								onPress={() => setShowChangeLoginEmail(false)}
							>
								<Text style={{ color: '#333', fontWeight: 'bold' }}>Hủy</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>

			{/* Modal đổi email khẩn cấp */}
			<Modal
				visible={showChangeEmergencyEmail}
				animationType="slide"
				transparent
				onRequestClose={() => setShowChangeEmergencyEmail(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Đổi email khẩn cấp</Text>
						<TextInput
							style={styles.input}
							placeholder="Email khẩn cấp mới"
							value={newEmergencyEmail}
							onChangeText={setNewEmergencyEmail}
							autoCapitalize="none"
							keyboardType="email-address"
						/>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
							<Pressable
								style={[styles.modalButton, { backgroundColor: '#4F8EF7' }]}
								onPress={handleSubmitChangeEmergencyEmail}
							>
								<Text style={{ color: '#fff', fontWeight: 'bold' }}>Lưu</Text>
							</Pressable>
							<Pressable
								style={[styles.modalButton, { backgroundColor: '#ccc' }]}
								onPress={() => setShowChangeEmergencyEmail(false)}
							>
								<Text style={{ color: '#333', fontWeight: 'bold' }}>Hủy</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>

			{/* Modal đổi mật khẩu */}
			<Modal
				visible={showChangePassword}
				animationType="slide"
				transparent
				onRequestClose={() => setShowChangePassword(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Đổi mật khẩu</Text>
						<TextInput
							style={styles.input}
							placeholder="Mật khẩu cũ"
							secureTextEntry
							value={oldPassword}
							onChangeText={setOldPassword}
						/>
						<TextInput
							style={styles.input}
							placeholder="Mật khẩu mới"
							secureTextEntry
							value={newPassword}
							onChangeText={setNewPassword}
						/>
						<TextInput
							style={styles.input}
							placeholder="Nhập lại mật khẩu mới"
							secureTextEntry
							value={confirmPassword}
							onChangeText={setConfirmPassword}
						/>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
							<Pressable
								style={[styles.modalButton, { backgroundColor: '#4F8EF7' }]}
								onPress={handleSubmitChangePassword}
								disabled={changing}
							>
								<Text style={{ color: '#fff', fontWeight: 'bold' }}>Lưu</Text>
							</Pressable>
							<Pressable
								style={[styles.modalButton, { backgroundColor: '#ccc' }]}
								onPress={() => setShowChangePassword(false)}
								disabled={changing}
							>
								<Text style={{ color: '#333', fontWeight: 'bold' }}>Hủy</Text>
							</Pressable>
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
	   backgroundColor: '#eaf0fa',
   },
   container: {
	   flex: 1,
	   backgroundColor: '#f6f8fc',
	   padding: 20,
   },
   header: {
	   fontSize: 30,
	   fontWeight: 'bold',
	   marginBottom: 28,
	   color: '#2563eb',
	   textAlign: 'center',
	   letterSpacing: 1.2,
   },
   card: {
	   backgroundColor: '#fff',
	   borderRadius: 18,
	   paddingVertical: 8,
	   paddingHorizontal: 0,
	   marginBottom: 32,
	   shadowColor: '#000',
	   shadowOffset: { width: 0, height: 2 },
	   shadowOpacity: 0.07,
	   shadowRadius: 8,
	   elevation: 2,
   },
   settingRow: {
	   flexDirection: 'row',
	   alignItems: 'center',
	   justifyContent: 'space-between',
	   paddingVertical: 18,
	   paddingHorizontal: 18,
	   borderBottomWidth: 1,
	   borderColor: '#f0f0f0',
   },
   settingInfo: {
	   flex: 1,
   },
   label: {
	   fontSize: 17,
	   color: '#222',
	   fontWeight: '600',
   },
   subLabel: {
	   fontSize: 13,
	   color: '#888',
	   marginTop: 2,
   },
   link: {
	   color: '#2563eb',
	   fontSize: 15,
	   fontWeight: 'bold',
	   textDecorationLine: 'underline',
	   paddingVertical: 6,
	   paddingHorizontal: 12,
	   borderRadius: 8,
	   backgroundColor: '#eaf0fa',
   },
   logoutButton: {
	   marginTop: 10,
	   backgroundColor: '#f44336',
	   paddingVertical: 16,
	   borderRadius: 16,
	   alignItems: 'center',
	   shadowColor: '#f44336',
	   shadowOffset: { width: 0, height: 2 },
	   shadowOpacity: 0.13,
	   shadowRadius: 6,
	   elevation: 2,
   },
   logoutText: {
	   color: '#fff',
	   fontWeight: 'bold',
	   fontSize: 18,
	   letterSpacing: 0.5,
   },
   input: {
	   borderWidth: 1,
	   borderColor: '#ddd',
	   borderRadius: 10,
	   paddingHorizontal: 14,
	   paddingVertical: 12,
	   fontSize: 16,
	   marginBottom: 14,
	   backgroundColor: '#fafbfc',
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
	   borderRadius: 18,
	   padding: 26,
	   shadowColor: '#000',
	   shadowOffset: { width: 0, height: 2 },
	   shadowOpacity: 0.11,
	   shadowRadius: 8,
	   elevation: 5,
   },
   modalTitle: {
	   fontSize: 21,
	   fontWeight: 'bold',
	   marginBottom: 18,
	   color: '#2563eb',
	   textAlign: 'center',
   },
   modalButton: {
	   minWidth: 80,
	   borderRadius: 10,
	   paddingVertical: 10,
	   paddingHorizontal: 18,
	   alignItems: 'center',
	   marginHorizontal: 4,
   },
});
