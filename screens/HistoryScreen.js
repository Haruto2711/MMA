import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import HistoryItem from '../components/HistoryItem'; // Import component có sẵn của bạn

// Dữ liệu giả lập sử dụng timestamp để khớp với HistoryItem.js của bạn
// Lưu ý: Định dạng chuỗi ngày tháng (ISO 8601) hoặc số mili-giây để hàm formatDate xử lý
const mockHistoryData = [
  { id: '1', timestamp: '2026-03-12T08:30:00Z', status: 'Safe' },
  { id: '2', timestamp: '2026-03-11T09:15:00Z', status: 'Safe' },
  { id: '3', timestamp: '2026-03-10T10:00:00Z', status: 'Missed' },
  { id: '4', timestamp: '2026-03-09T07:45:00Z', status: 'Safe' },
];

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Lịch sử Check-in</Text>
      
      <FlatList
        data={mockHistoryData}
        keyExtractor={(item) => item.id}
        // Gọi HistoryItem của bạn và truyền item vào
        renderItem={({ item }) => <HistoryItem item={item} />} 
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false} // Ẩn thanh cuộn cho đẹp
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
});