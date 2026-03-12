import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

const CheckinButton = ({ onCheckin }) => {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    try {
      setLoading(true);

      if (onCheckin) {
        await onCheckin();
      }
    } catch (error) {
      console.log("Checkin error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>Check In</Text>
      )}
    </TouchableOpacity>
  );
};

export default CheckinButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },

  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
