import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
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

    const today = getToday();

    if (!lastCheckin) {
      setStatusMessage("Ban chua check-in hom nay");
      return;
    }

    setStatusMessage(
      lastCheckin === today
        ? "Ban da check-in ngay hom nay"
        : "Ban chua check-in hom nay"
    );

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

      if (result?.message === "Already checked in today") {
        setStatusMessage("Ban da check-in ngay hom nay");
        return;
      }

      await loadData();

    } catch (error) {
      setStatusMessage("Check-in that bai");
    }
  };

  return (
    <View style={styles.container}>

      {/* PROFILE */}
      <TouchableOpacity
        style={styles.profileWrap}
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={styles.profileText}>My Profile</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Are You Dead?</Text>

      <View style={styles.inputWrap}>
        <Text style={styles.inputLabel}>User ID</Text>
        <Text style={styles.userIdText}>{userId}</Text>
      </View>

      <View style={styles.centerBlock}>

        <TouchableOpacity
          style={styles.checkinCircle}
          onPress={handleCheckin}
          disabled={lastCheckin === getToday()}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.checkinText}>
              Check-in{"\n"}Today
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.statusText}>
          {statusMessage}
        </Text>

      </View>

      {/* HISTORY */}
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate("History")}
      >
        <Text style={styles.historyButtonText}>
          Lich su Check-in
        </Text>
      </TouchableOpacity>

      {/* LOGOUT */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
      >
        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>

    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#e9e9e9",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 30,
  },

  profileWrap: {
    alignSelf: "flex-end",
  },

  profileText: {
    fontSize: 20,
    color: "#000",
  },

  title: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 46,
    fontWeight: "700",
    color: "#000",
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
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1.5,
    borderColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ededed",
  },

  checkinText: {
    textAlign: "center",
    fontSize: 44,
    fontWeight: "700",
  },

  statusText: {
    marginTop: 26,
    fontSize: 28,
  },

  historyButton: {
    alignSelf: "center",
    width: "82%",
    height: 64,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e6e6e6",
  },

  historyButtonText: {
    fontSize: 40,
    fontWeight: "700",
  },

  logoutButton: {
    marginTop: 15,
    alignSelf: "center",
    width: "60%",
    height: 50,
    backgroundColor: "#ff4444",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  }

});
