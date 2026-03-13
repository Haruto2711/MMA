import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import HistoryItem from '../components/HistoryItem';
import { getCheckinHistory } from '../services/checkInService';
import { useAuth } from "../context/AuthContext";

export default function HistoryScreen() {

  const { user } = useAuth();   // lấy user từ context
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      setLoading(true);

      if (!user) return;

      const data = await getCheckinHistory(user.id);
      setHistory(data);

    } catch (error) {
      console.log("Load history error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Lịch sử Check-in</Text>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <HistoryItem item={item} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có lịch sử check-in</Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});