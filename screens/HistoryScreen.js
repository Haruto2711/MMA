import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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

  // Refetch history khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      loadHistory();
    }, [user?.id])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F8EF7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Lịch sử Check-in</Text>
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemWrapper}>
              <HistoryItem item={item} />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có lịch sử check-in</Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eaf0fa',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#4F8EF7',
    textAlign: 'center',
    letterSpacing: 1,
  },
  itemWrapper: {
    backgroundColor: '#f7faff',
    borderRadius: 16,
    marginBottom: 14,
    padding: 4,
    shadowColor: '#4F8EF7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#b0b0b0',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eaf0fa',
  },
}); 