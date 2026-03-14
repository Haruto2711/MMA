import React from "react";
<<<<<<< HEAD
import { SafeAreaView, StyleSheet } from "react-native";
import { AuthProvider } from "./context/AuthContext";
import AppNavigator from "./navigation/AppNavigator";
=======
import { SafeAreaView,  StyleSheet } from "react-native";
import HomeScreen from "./screens/HomeScreen";
>>>>>>> 21bea9426ad96123d3b715e297a3a65925540d40

export default function App() {

  return (
<<<<<<< HEAD

    <AuthProvider>

      <SafeAreaView style={styles.container}>

        <AppNavigator />

      </SafeAreaView>

    </AuthProvider>

=======
     <SafeAreaView style={styles.container}>
      <HomeScreen />
    </SafeAreaView>
>>>>>>> 21bea9426ad96123d3b715e297a3a65925540d40
  );

}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:"#e9e9e9"
  }
});