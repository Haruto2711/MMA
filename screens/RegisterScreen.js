import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {

  const { register } = useAuth();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [emergencyEmail,setEmergencyEmail] = useState("");
  const [timeoutDays,setTimeoutDays] = useState("3");

  const handleRegister = async () => {

    try{

      await register({
        email,
        password,
        emergencyEmail,
        timeoutDays:Number(timeoutDays)
      });

      Alert.alert("Register success");

    }catch(error){

      Alert.alert(error.message);

    }

  };

  return (

    <View style={styles.container}>

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

      <TextInput
        style={styles.input}
        placeholder="Emergency Email"
        value={emergencyEmail}
        onChangeText={setEmergencyEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Timeout Days"
        value={timeoutDays}
        onChangeText={setTimeoutDays}
      />

      <Button title="Register" onPress={handleRegister}/>

    </View>

  );

}

const styles = StyleSheet.create({
container:{flex:1,justifyContent:"center",padding:20},
input:{borderWidth:1,padding:10,marginBottom:15}
});