import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { AuthProvider } from "./context/AuthContext";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {

  return (

    <AuthProvider>

      <SafeAreaView style={styles.container}>

        <AppNavigator />

      </SafeAreaView>

    </AuthProvider>

  );

}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:"#e9e9e9"
  }
});