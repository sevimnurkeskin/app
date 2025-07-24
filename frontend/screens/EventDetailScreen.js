import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { API_BASE_URL, getCurrentUserId } from '../auth';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import DateTimePicker from '@react-native-community/datetimepicker';

const screenWidth = Dimensions.get('window').width;

export default function EventDetailScreen({ route }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joined, setJoined] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [joinLoading, setJoinLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'join' veya 'leave' veya null
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDate, setEditDate] = useState(new Date());
  const [editTime, setEditTime] = useState(new Date());
  const [editLocation, setEditLocation] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const navigation = useNavigation();
  const [currentUserId, setCurrentUserId] = useState(null);

  // Kullanıcı ID'sini al
  useEffect(() => {
    getCurrentUserId().then(id => setCurrentUserId(id));
  }, []);

  // currentUserId değiştiğinde event'i tekrar fetch et
  useEffect(() => {
    if (!eventId || !currentUserId) return;
    fetchEventDetails();
  }, [eventId, currentUserId]);

  // joined, currentUserId ve event'i logla
  useEffect(() => {
    console.log('joined:', joined, 'currentUserId:', currentUserId, 'event:', event);
  }, [joined, currentUserId, event]);

  // Etkinlik detaylarını getir
  const fetchEventDetails = async () => {
    if (!eventId || !currentUserId) return; // currentUserId null ise fetch etme
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}`);
      setEvent(response.data);
      // participants array'i yoksa joined false
      let joinedStatus = false;
      if (response.data.hasJoined !== undefined) {
        joinedStatus = response.data.hasJoined;
      } else if (response.data.participants && currentUserId) {
        console.log('participants:', response.data.participants);
        console.log('currentUserId:', currentUserId, 'typeof:', typeof currentUserId);
        if (response.data.participants.length > 0) {
          response.data.participants.forEach(p => {
            console.log('participant user_id:', p.user_id, 'typeof:', typeof p.user_id);
          });
        }
        joinedStatus = response.data.participants.some(
          (p) => String(p.user_id) === String(currentUserId)
        );
      }
      setJoined(joinedStatus);
      setParticipantCount(response.data.participants ? response.data.participants.length : 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Modal açıldığında, mevcut bilgileri doldur
  useEffect(() => {
    if (showEditModal && event) {
      setEditTitle(event.title || '');
      setEditDescription(event.description || '');
      setEditDate(event.date ? new Date(event.date) : new Date());
      // Saat stringini Date objesine çevir
      if (event.time) {
        const [h, m, s] = event.time.split(':');
        const t = new Date();
        t.setHours(Number(h), Number(m), Number(s || 0), 0);
        setEditTime(t);
      } else {
        setEditTime(new Date());
      }
      setEditLocation(event.location_name || '');
    }
  }, [showEditModal, event]);

  // Etkinlik sahibi mi?
  const isOwner = event && currentUserId && String(event.creator_id) === String(currentUserId);

  // Katıl/Ayrıl işlemleri
  const handleJoinLeave = async (action) => {
    if (!currentUserId || joinLoading) return;
    setJoinLoading(true);
    try {
      if (action === 'join' && !joined) {
        setPendingAction('join');
        await axios.post(`${API_BASE_URL}/events/${eventId}/join`, { user_id: currentUserId });
        await fetchEventDetails();
      } else if (action === 'leave' && joined) {
        setPendingAction('leave');
        console.log('Ayrıl isteği:', eventId, currentUserId);
        await axios.delete(`${API_BASE_URL}/events/${eventId}/join`, { data: { user_id: currentUserId } });
        await fetchEventDetails();
      }
    } catch (err) {
      console.log('Ayrılma hatası:', err.response?.data || err.message);
      Alert.alert('Hata', err.response?.data?.error || 'İşlem başarısız');
    } finally {
      setJoinLoading(false);
      setPendingAction(null);
    }
  };

  // Etkinliği sil
  const handleDelete = () => {
    Alert.alert(
      "Etkinlik Silinecek",
      "Bu etkinliği silmek istediğinizden emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Evet, Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/events/${eventId}`);
              Alert.alert('Başarılı', 'Etkinlik silindi');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Hata', err.response?.data?.error || 'Silinemedi');
            }
          }
        }
      ]
    );
  };

  // Header'a menü ekle
  React.useLayoutEffect(() => {
    if (isOwner) {
      navigation.setOptions({
        headerRight: () => (
          <Menu>
            <MenuTrigger customStyles={{
              TriggerTouchableComponent: TouchableOpacity,
              triggerWrapper: { paddingHorizontal: 16, paddingVertical: 6 },
            }}>
              <Ionicons name="ellipsis-vertical" size={28} color="#6c5ce7" />
            </MenuTrigger>
            <MenuOptions customStyles={{
              optionsContainer: {
                borderRadius: 16,
                paddingVertical: 8,
                minWidth: 150,
                backgroundColor: '#fff',
                shadowColor: '#6c5ce7',
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 6,
              },
            }}>
              <MenuOption onSelect={() => setShowEditModal(true)} customStyles={{
                optionWrapper: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
              }}>
                <Ionicons name="create-outline" size={22} color="#3897f0" style={{ marginRight: 10 }} />
                <Text style={{ color: '#3897f0', fontWeight: '700', fontSize: 16 }}>Düzenle</Text>
              </MenuOption>
              <MenuOption onSelect={handleDelete} customStyles={{
                optionWrapper: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
              }}>
                <Ionicons name="trash-outline" size={22} color="#ea4c89" style={{ marginRight: 10 }} />
                <Text style={{ color: '#ea4c89', fontWeight: '700', fontSize: 16 }}>Sil</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        ),
      });
    }
  }, [navigation, isOwner, eventId, event]);

  // Etkinlik güncelle
  const handleUpdateEvent = async () => {
    try {
      await axios.put(`${API_BASE_URL}/events/${event.id}`, {
        title: editTitle,
        description: editDescription,
        date: editDate.toISOString().slice(0, 10),
        time: editTime.toTimeString().slice(0, 8),
        location_name: editLocation,
      });
      setShowEditModal(false);
      Alert.alert('Başarılı', 'Etkinlik güncellendi');
      fetchEventDetails();
    } catch (err) {
      Alert.alert('Hata', 'Güncellenemedi');
    }
  };

  useEffect(() => {
    console.log('event:', event);
    console.log('currentUserId:', currentUserId);
    console.log('isOwner:', isOwner);
  }, [event, currentUserId, isOwner]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text>Event not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Event Image with gradient overlay */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: event.image_url || event.image }}
          style={styles.image}
        />
        <LinearGradient
          colors={['transparent', 'rgba(255, 195, 140, 0.65)']}
          style={styles.gradientOverlay}
        />
        <View style={styles.overlayInfo}>
          {event.category && <Text style={styles.groupName}>{String(event.category)}</Text>}
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={16} color="#fff8e1" />
            {event.city && (
              <Text style={styles.locationText}>
                {String(event.city)}
                {event.district && `, ${String(event.district)}`}
              </Text>
            )}
          </View>
          <View style={styles.dateRow}>
            <MaterialIcons name="date-range" size={16} color="#fff8e1" />
            <Text style={styles.dateText}>
              {event.date && new Date(event.date).toLocaleDateString()}
              {event.time && ` - ${String(event.time)}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Title */}
      {event.title && <Text style={styles.title}>{String(event.title)}</Text>}

      {/* Katıl/Ayrıl butonları modern kutuda */}
      {!isOwner && (
        <View style={styles.joinLeaveContainer}>
          <TouchableOpacity
            style={[styles.joinButton, joined && styles.joinButtonDisabled]}
            onPress={() => handleJoinLeave('join')}
            disabled={joined || joinLoading}
            activeOpacity={0.85}
          >
            <Text style={[styles.joinButtonText, joined && styles.joinButtonTextDisabled]}>Katıl</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.leaveButton, !joined && styles.leaveButtonDisabled]}
            onPress={() => handleJoinLeave('leave')}
            disabled={!joined || joinLoading}
            activeOpacity={0.85}
          >
            <Text style={[styles.leaveButtonText, !joined && styles.leaveButtonTextDisabled]}>Ayrıl</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Katılımcı sayısı kutusu */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#6a82fb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 5, alignSelf: 'center', marginBottom: 10 }}>
        <MaterialIcons name="groups" size={20} color="#fff" style={{ marginRight: 6 }} />
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>{participantCount} kişi</Text>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Açıklama</Text>
        {event.description && (
          <Text style={styles.description}>
            {String(event.description)}
          </Text>
        )}
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yer</Text>
        {event.location_name && (
          <Text style={styles.description}>{String(event.location_name)}</Text>
        )}
      </View>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 24,
            width: '85%'
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Etkinliği Düzenle</Text>
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Başlık"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 10, padding: 8 }}
            />
            <TextInput
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Açıklama"
              multiline
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 10, padding: 8, minHeight: 60 }}
            />
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 10, padding: 12 }}>
              <Text>{editDate ? editDate.toLocaleDateString() : 'Tarih seç'}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={editDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setEditDate(selectedDate);
                }}
              />
            )}
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 10, padding: 12 }}>
              <Text>{editTime ? editTime.toLocaleTimeString().slice(0,5) : 'Saat seç'}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={editTime}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) setEditTime(selectedTime);
                }}
              />
            )}
            <TextInput
              value={editLocation}
              onChangeText={setEditLocation}
              placeholder="Yer"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 16, padding: 8 }}
            />
            <TouchableOpacity
              style={{ backgroundColor: '#6c5ce7', borderRadius: 10, padding: 12, marginBottom: 8 }}
              onPress={handleUpdateEvent}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Kaydet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: '#eee', borderRadius: 10, padding: 12 }}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={{ color: '#333', textAlign: 'center' }}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  imageWrapper: {
    position: 'relative',
    width: screenWidth,
    height: screenWidth * 0.9,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    height: '50%',
    width: '100%',
  },
  overlayInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  groupName: {
    color: '#6c5ce7',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  locationText: {
    color: '#fff8e1',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#fff8e1',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#6c5ce7',
    marginHorizontal: 24,
    marginBottom: 14,
    textShadowColor: 'rgba(108,92,231,0.08)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  joinButton: { backgroundColor: '#6a82fb', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center', shadowColor: '#6a82fb', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  joinButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  joinButtonDisabled: { backgroundColor: '#e0e0e0' },
  joinButtonTextDisabled: { color: '#aaa' },
  leaveButton: { backgroundColor: '#e63946', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center', shadowColor: '#e63946', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  leaveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  leaveButtonDisabled: { backgroundColor: '#e0e0e0' },
  leaveButtonTextDisabled: { color: '#aaa' },
  participantBox: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f5',
    borderRadius: 24,
    marginHorizontal: 96,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 24,
  },
  participantCount: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#3897f0',
    letterSpacing: 0.3,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 18,
    marginBottom: 24,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#6c5ce7',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 14,
    lineHeight: 24,
    color: '#444',
    fontWeight: '400',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  joinLeaveContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 18, marginTop: 0, marginBottom: 18, backgroundColor: '#fff', borderRadius: 18, padding: 16, shadowColor: '#6a82fb', shadowOpacity: 0.10, shadowRadius: 10, elevation: 3, alignSelf: 'center', minWidth: 260 },
  joinButton: { backgroundColor: '#6a82fb', borderRadius: 10, paddingVertical: 16, paddingHorizontal: 36, alignItems: 'center', shadowColor: '#6a82fb', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  joinButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  joinButtonDisabled: { backgroundColor: '#e0e0e0' },
  joinButtonTextDisabled: { color: '#aaa' },
  leaveButton: { backgroundColor: '#e63946', borderRadius: 10, paddingVertical: 16, paddingHorizontal: 36, alignItems: 'center', shadowColor: '#e63946', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  leaveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  leaveButtonDisabled: { backgroundColor: '#e0e0e0' },
  leaveButtonTextDisabled: { color: '#aaa' },
});