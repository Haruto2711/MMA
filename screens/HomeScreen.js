import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  TextInput,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { createCheckin, getLastCheckin } from "../services/checkInService";
import { getToday } from "../utils/dateUtils";

const HomeScreen = () => {
  const [userId, setUserId] = useState("1");
  const [lastCheckin, setLastCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const loadData = useCallback(
    async (targetUserId = userId) => {
      const normalizedUserId = String(targetUserId).trim();
      if (!normalizedUserId) {
        setLastCheckin(null);
        setStatusMessage("Nhap User ID de test");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const last = await getLastCheckin(normalizedUserId);
        setLastCheckin(last || null);
      } catch (error) {
        setStatusMessage("Khong tai duoc du lieu.");
        setLastCheckin(null);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

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

  const handleCheckin = async () => {
    const normalizedUserId = String(userId).trim();
    if (!normalizedUserId) {
      setStatusMessage("Nhap User ID truoc khi check-in");
      return;
    }

    try {
      await createCheckin(normalizedUserId);
      await loadData();
    } catch (error) {
      if (error.message === "Already checked in today") {
        setStatusMessage("Ban da check-in ngay hom nay");
        return;
      }
      setStatusMessage("Check-in that bai");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileWrap}>
        <View style={styles.profileIcon}>
          <View style={styles.profileHead} />
          <View style={styles.profileBody} />
        </View>
        <Text style={styles.profileText}>My Profile</Text>
      </View>

      <Text style={styles.title}>Are You Dead?</Text>

      <View style={styles.inputWrap}>
        <Text style={styles.inputLabel}>User ID</Text>
        <TextInput
          value={userId}
          onChangeText={setUserId}
          keyboardType="number-pad"
          style={styles.input}
          placeholder="Nhap user id"
          placeholderTextColor="#888"
          onBlur={() => loadData(userId)}
        />
      </View>

      <View style={styles.centerBlock}>
        <TouchableOpacity style={styles.checkinCircle} onPress={handleCheckin}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.checkinText}>Check-in{"\n"}Today</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.statusText}>{statusMessage}</Text>
      </View>

      <TouchableOpacity style={styles.historyButton} activeOpacity={1}>
        <Text style={styles.historyButtonText}>Lich su Check-in</Text>
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
    alignItems: "center",
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#222",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f7f7",
  },
  profileHead: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#444",
    marginBottom: 2,
  },
  profileBody: {
    width: 24,
    height: 11,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "#444",
  },
  profileText: {
    marginTop: 4,
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
    width: "100%",
    alignSelf: "center",
  },
  inputLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#666",
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 24,
    color: "#000",
    backgroundColor: "#f1f1f1",
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
    lineHeight: 56,
    fontWeight: "700",
    color: "#000",
  },
  statusText: {
    marginTop: 26,
    fontSize: 28,
    color: "#000",
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
    color: "#111",
  },
});
