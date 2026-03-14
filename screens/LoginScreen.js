import React, { useState } from "react";
import { View, TextInput, Button, Text, Alert, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {

  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    try {

      await login(email, password);

      Alert.alert("Login success");

    } catch (error) {

      Alert.alert(error.message);

    }

  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Login</Text>
   


      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button
        title={loading ? "Loading..." : "Login"}
        onPress={handleLogin}
      />
         <Text
  style={styles.link}
  onPress={() => navigation.navigate("ForgotPassword")}
>
  Forgot password?
</Text>

      <Text
        style={styles.link}
        onPress={() => navigation.navigate("Register")}
      >
        Create new account
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:"center",padding:20},
  title:{fontSize:30,marginBottom:20,textAlign:"center"},
  input:{borderWidth:1,padding:10,marginBottom:15},
  link:{marginTop:20,textAlign:"center",color:"blue"}
});