
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import {
  getNotificationsByUser,
  markNotificationAsRead,
} from "../services/notificationService";
import { useAuth } from "../context/AuthContext";
import { getLastCheckin } from "../services/checkInService";
import { getToday } from "../utils/dateUtils";

const NotificationScreen = () => {
  const { user, loginTime } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastCheckin, setLastCheckin] = useState(null);

  // Lấy lần check-in gần nhất
  useEffect(() => {
    const fetchCheckin = async () => {
      if (user) {
        try {
          const last = await getLastCheckin(user.id);
          setLastCheckin(last);
        } catch {
          setLastCheckin(null);
        }
      }
    };
    fetchCheckin();
  }, [user]);

  // Lấy thông báo
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      setLoading(true);
      setError("");
      try {
        const data = await getNotificationsByUser(user.id);
        setNotifications(data);
      } catch (err) {
        setError("Không thể tải thông báo.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user]);

  /* useEffect(() => {
    Notifications.requestPermissionsAsync();
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Nhắc nhở Check-in",
        body: "Bạn hãy vào app để check-in hôm nay nhé!",
      },
      trigger: {
        hour: 7,
        minute: 0,
        repeats: true,
      },
    });
  }, []); */

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
      );
    } catch (err) {
      setError("Không thể cập nhật trạng thái.");
    }
  };

  // Hiển thị thông tin đăng nhập và check-in (đẹp, có định dạng)
  const today = getToday();
  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const sec = String(date.getSeconds()).padStart(2, "0");
    return `${hour}:${min}:${sec}, ${day}/${month}/${year}`;
  };

  let checkinMsg = "";
  if (!lastCheckin) {
    checkinMsg = "Bạn chưa check-in hôm nay";
  } else {
    checkinMsg = `Lần check-in gần nhất: ${formatDateTime(lastCheckin)}`;
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => !item.read && handleMarkAsRead(item.id)}
      activeOpacity={0.7}
      style={({ pressed }) => [
        styles.item,
        item.read && styles.readItem,
        pressed && styles.itemActive,
      ]}
    >
      <Text style={styles.title}>
        {item.type === "alert"
          ? "[Cảnh báo] "
          : item.type === "warning"
            ? "[Nhắc nhở] "
            : ""}
        {item.message}
      </Text>
      <Text style={styles.time}>{item.sentAt}</Text>
      {!item.read && <Text style={styles.unread}>Chưa đọc</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Thông báo</Text>
        {/* Bỏ infoBox, chỉ hiển thị danh sách thông báo */}
        {loading ? (
          <ActivityIndicator size="large" color="#4F8EF7" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : notifications.length === null ? (
          <Text style={styles.emptyText}>Không có thông báo nào.</Text>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id?.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eaf0fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#4F8EF7",
    letterSpacing: 1,
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#eaf0fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#4F8EF7",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  infoText: {
    fontSize: 17,
    color: "#222",
    marginBottom: 6,
  },
  item: {
    backgroundColor: "#f7faff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#4F8EF7",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  itemActive: {
    backgroundColor: "#e0e7ff",
  },
  readItem: {
    opacity: 0.5,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  time: {
    fontSize: 13,
    color: "#888",
    marginTop: 6,
  },
  unread: {
    color: "#d00",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#b0b0b0",
    fontSize: 16,
  },
});

export default NotificationScreen;
