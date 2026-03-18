import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

import { createCheckin, getLastCheckin } from "../services/checkInService";
import { getToday } from "../utils/dateUtils";
import { checkUserTimeout } from "../services/notificationService";
import { checkNotCheckedInToday, syncReminderByCheckin } from "../services/reminderService";
import { setupPushToken } from "../services/pushTokenService";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const userId = user?.id;

  const [lastCheckin, setLastCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const loadData = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const last = await getLastCheckin(userId);
      setLastCheckin(last || null);
    } catch (error) {
      setStatusMessage("Khong tai duoc du lieu.");
      setLastCheckin(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Setup push token when user logs in
  useEffect(() => {
    if (userId) {
      setupPushToken(userId);
      loadData();
    }
  }, [userId]);

  // Reload data khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        // Refetch data khi screen được focus lại
        (async () => {
          try {
            setLoading(true);
            const last = await getLastCheckin(userId);
            setLastCheckin(last || null);
          } catch (error) {
            console.error("Refetch error:", error);
            setLastCheckin(null);
          } finally {
            setLoading(false);
          }
        })();
      }
    }, [userId])
  );

  useEffect(() => {
    const todayDate = getToday().slice(0, 10);
    console.log('DEBUG: lastCheckin =', lastCheckin);
    console.log('DEBUG: todayDate =', todayDate);
    
    if (!lastCheckin) {
      setStatusMessage("Bạn chưa check-in hôm nay");
      return;
    }
    const checkinDate = lastCheckin.slice(0, 10);
    console.log('DEBUG: checkinDate =', checkinDate);
    console.log('DEBUG: match =', checkinDate === todayDate);
    
    if (checkinDate === todayDate) {
      setStatusMessage("Bạn đã check-in ngày hôm nay");
    } else {
      setStatusMessage("Bạn chưa check-in hôm nay");
    }
  }, [lastCheckin]);
  useEffect(() => {
    if (user) {
      checkUserTimeout(user);
    }
  }, [user]);

  // Check if user hasn't checked in today and show reminder
  useEffect(() => {
    syncReminderByCheckin(lastCheckin);
    checkNotCheckedInToday(lastCheckin);
  }, [lastCheckin]);

  const handleCheckin = async () => {
    if (!userId) return;
    try {
      console.log("🔵 Starting check-in for user:", userId);
      const result = await createCheckin(userId);
      console.log("✅ Check-in result:", result);
      
      const today = getToday();
      console.log("📅 Today date:", today);
      setLastCheckin(today);
      setStatusMessage("Bạn đã check-in ngày hôm nay");
      
      // Reload data sau 1 giây để đảm bảo backend đã lưu
      setTimeout(() => {
        console.log("🔄 Reloading data after check-in...");
        loadData();
      }, 1000);
    } catch (error) {
      console.error("❌ Check-in error:", error);
      setStatusMessage("Check-in thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER: PROFILE + NOTIFICATION */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Setting")}
          >
            <Ionicons name="settings-outline" size={26} color="#4F8EF7" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Notification")}
          >
            <Ionicons name="notifications-outline" size={26} color="#4F8EF7" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.profileIconButton]}
            onPress={() => navigation.navigate("Profile")}
          >
            {user?.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} style={styles.profileAvatar} />
            ) : (
              <Ionicons name="person-outline" size={26} color="#4F8EF7" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Bạn còn sống chứ?</Text>

        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Mã người dùng</Text>
          <Text style={styles.userIdText}>{userId}</Text>
        </View>

        <View style={styles.centerBlock}>
          <TouchableOpacity
            style={styles.checkinCircle}
            onPress={handleCheckin}
            disabled={lastCheckin === getToday()}
          >
            {loading ? (
              <ActivityIndicator color="#4F8EF7" />
            ) : (
              <Text style={styles.checkinText}>Check-in{"\n"}Hôm nay</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>

        {/* HISTORY & NOTES BUTTONS */}
        <View
          style={[
            styles.buttonRow,
            { marginBottom: Math.max(insets.bottom, 8) + 8 },
          ]}
        >
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate("History")}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="bar-chart-outline" size={20} color="#fff" />
              <Text style={styles.buttonRowText}>Lịch sử</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notesButton}
            onPress={() => navigation.navigate("Notes")}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="document-text-outline" size={20} color="#fff" />
              <Text style={styles.buttonRowText}>Ghi chú</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eaf0fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 30,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  iconButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#eaf0fa",
    shadowColor: "#4F8EF7",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  profileIconButton: {
    width: 44,
    height: 44,
    padding: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profileAvatar: {
    width: "100%",
    height: "100%",
  },
  title: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 38,
    fontWeight: "700",
    color: "#4F8EF7",
    letterSpacing: 1,
  },

  inputWrap: {
    marginTop: 18,
  },

  inputLabel: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },

  userIdText: {
    fontSize: 28,
    fontWeight: "600",
  },

  centerBlock: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  checkinCircle: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 2,
    borderColor: "#4F8EF7",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7faff",
    shadowColor: "#4F8EF7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  checkinText: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: "700",
    color: "#4F8EF7",
  },

  statusText: {
    marginTop: 26,
    fontSize: 22,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },

  historyButton: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F8EF7",
    marginRight: 8,
    shadowColor: "#4F8EF7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },

  notesButton: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    marginLeft: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
    marginBottom: 16,
  },

  buttonRowText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logoutButton: {
    marginTop: 15,
    alignSelf: "center",
    width: "60%",
    height: 50,
    backgroundColor: "#f44336",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#f44336",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },

  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
