import React from "react";
import { View, Text, StyleSheet } from "react-native";

const formatDateTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hour}:${min}`;
};

const HistoryItem = ({ item }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check-in</Text>
      <Text style={styles.date}>{formatDateTime(item.timestamp)}</Text>
    </View>
  );
};

export default HistoryItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
});
