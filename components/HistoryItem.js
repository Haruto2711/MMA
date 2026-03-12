import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatDate } from "../utils/dateUtils";

const HistoryItem = ({ item }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check-in</Text>

      <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
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
