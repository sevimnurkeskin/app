import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import axios from 'axios';
import { API_BASE_URL, getCurrentUserId } from '../auth';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // TODO: Eğer backend'de notification endpoint'i varsa buradan çekilecek
    // axios.get(`${API_BASE_URL}/notifications`, { params: { user_id: getCurrentUserId() } })
    //   .then(res => setNotifications(res.data))
    //   .catch(() => setNotifications([]));
    setNotifications([]); // Şimdilik boş
  }, []);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000); // saniye cinsinden fark

    if (diff < 60) return `${diff} saniye önce`;
    if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} gün önce`;
    return `${Math.floor(diff / 2592000)} ay önce`;
  };

  const handleAccept = (notif) => {
    Alert.alert('Başarılı', `${notif.username} isteği kabul edildi.`);
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
  };

  const handleReject = (notif) => {
    Alert.alert('Bilgi', `${notif.username} isteği reddedildi.`);
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
  };

  const renderItem = ({ item }) => (
    <View style={styles.notificationCard}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.message}>
          <Text style={styles.username}>{item.username}</Text> {item.message}
        </Text>
        <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item)}>
            <Text style={styles.btnText}>Kabul Et</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item)}>
            <Text style={styles.btnText}>Yoksay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <Text style={styles.noNotifText}>Bildirim yok</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f8ff',
    padding: 12,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginTop: 4,
  },
  message: {
    fontSize: 15,
    color: '#111',
  },
  username: {
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  acceptBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginRight: 10,
  },
  rejectBtn: {
    backgroundColor: '#9ca3af',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  btnText: {
    color: 'white',
    fontWeight: '500',
  },
  noNotifText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#666',
  },
});
