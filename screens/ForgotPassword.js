import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
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
    <View style={styles.container}>

      <Text style={styles.title}>Forgot Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Your Email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>

      <Text
        style={styles.link}
        onPress={() => navigation.navigate("Login")}
      >
        Back to Login
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
container:{flex:1,justifyContent:"center",padding:20},
title:{fontSize:28,textAlign:"center",marginBottom:30},
input:{borderWidth:1,padding:12,marginBottom:15,borderRadius:6},
button:{backgroundColor:"#007BFF",padding:15,alignItems:"center",borderRadius:6},
buttonText:{color:"#fff",fontWeight:"bold"},
link:{marginTop:20,textAlign:"center",color:"blue"}
});
