import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./context/AuthContext";
import AppNavigator from "./navigation/AppNavigator";
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  setupNotificationResponseListener,
} from "./services/reminderService";

export default function App() {
  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    // Request permission
    const hasPermission = await requestNotificationPermission();
    if (hasPermission) {
      // Schedule daily reminder
      await scheduleDailyReminder();
      console.log("Notifications initialized");
    }
  };

  return (
    <AuthProvider>
      <NavigationContainer>
        <SafeAreaView style={styles.container}>
          <AppNavigator />
        </SafeAreaView>
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e9e9e9",
  },
});