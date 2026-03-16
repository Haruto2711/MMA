import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  SafeAreaView,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

import { createCheckin, getLastCheckin } from "../services/checkInService";
import { getToday } from "../utils/dateUtils";
import { checkUserTimeout } from "../services/notificationService";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

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

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const todayDate = getToday().slice(0, 10);
    if (!lastCheckin) {
      setStatusMessage("Bạn chưa check-in hôm nay");
      return;
    }
    if (lastCheckin.slice(0, 10) === todayDate) {
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

  const handleCheckin = async () => {
    if (!userId) return;
    try {
      const result = await createCheckin(userId);
      const today = getToday();
      setLastCheckin(today);
      setStatusMessage("Bạn đã check-in ngày hôm nay");
      // Không gọi loadData lại ngay để tránh bị backend trả về dữ liệu cũ
    } catch (error) {
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
            <Text style={styles.iconText}>⚙️</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Notification")}
          >
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.iconText}>👤</Text>
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

        {/* HISTORY */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate("History")}
        >
          <Text style={styles.historyButtonText}>Lịch sử Check-in</Text>
        </TouchableOpacity>
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
  iconText: {
    fontSize: 26,
    color: "#4F8EF7",
    fontWeight: "bold",
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
    alignSelf: "center",
    width: "82%",
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F8EF7",
    marginTop: 10,
    marginBottom: 8,
    shadowColor: "#4F8EF7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },

  historyButtonText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
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
