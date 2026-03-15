import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { resetPassword } from "../services/authService";

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleReset = async () => {
    try {
      if (!email || !newPassword) {
        Alert.alert("Error", "Please fill all fields");
        return;
      }

      await resetPassword(email, newPassword);

      Alert.alert("Success", "Password updated successfully");

      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>Quên mật khẩu</Text>
          <TextInput
            style={styles.input}
            placeholder="Email của bạn"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#b0b0b0"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu mới"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            placeholderTextColor="#b0b0b0"
          />
          <TouchableOpacity style={styles.button} onPress={handleReset}>
            <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
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
