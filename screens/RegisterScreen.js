import React, { useRef, useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emergencyEmail, setEmergencyEmail] = useState("");
  const [timeoutDays, setTimeoutDays] = useState("3");
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  const isValidEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(value.trim());
  };

  const handleRegister = async () => {
    if (submittingRef.current) return;

    const cleanEmail = email.trim().toLowerCase();
    const cleanEmergencyEmail = emergencyEmail.trim().toLowerCase();
    const days = Number(timeoutDays);

    if (!cleanEmail || !password.trim() || !cleanEmergencyEmail || !timeoutDays.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      Alert.alert("Lỗi", "Email đăng nhập không đúng định dạng");
      return;
    }

    if (!isValidEmail(cleanEmergencyEmail)) {
      Alert.alert("Lỗi", "Email người thân không đúng định dạng");
      return;
    }

    if (cleanEmail === cleanEmergencyEmail) {
      Alert.alert("Lỗi", "Email người thân không được trùng email đăng nhập");
      return;
    }

    if (!Number.isInteger(days) || days < 1) {
      Alert.alert("Lỗi", "Số ngày cảnh báo phải là số nguyên lớn hơn 0");
      return;
    }

    try {
      submittingRef.current = true;
      setLoading(true);
      await register({
        email: cleanEmail,
        password: password.trim(),
        emergencyEmail: cleanEmergencyEmail,
        timeoutDays: days,
      });
      Alert.alert("Đăng ký thành công");
    } catch (error) {
      Alert.alert(error.message);
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>Đăng ký tài khoản</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#b0b0b0"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#b0b0b0"
          />
          <TextInput
            style={styles.input}
            placeholder="Email người thân (khẩn cấp)"
            value={emergencyEmail}
            onChangeText={setEmergencyEmail}
            placeholderTextColor="#b0b0b0"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Số ngày cảnh báo (VD: 3)"
            keyboardType="numeric"
            value={timeoutDays}
            onChangeText={setTimeoutDays}
            placeholderTextColor="#b0b0b0"
          />
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Đang đăng ký..." : "Đăng ký"}</Text>
          </TouchableOpacity>
          <Text style={styles.link} onPress={() => navigation.navigate("Login")}>Quay lại đăng nhập</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eaf0fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#4F8EF7',
    textAlign: 'center',
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d7e2',
    backgroundColor: '#f7faff',
    padding: 14,
    marginBottom: 18,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#4F8EF7',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    shadowColor: '#4F8EF7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  link: {
    marginTop: 10,
    textAlign: 'center',
    color: '#4F8EF7',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});