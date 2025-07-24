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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import DateTimePicker from '@react-native-community/datetimepicker';

const screenWidth = Dimensions.get('window').width;

// Tarih formatlama fonksiyonu
function formatEventDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export default function ClubDetailScreen({ route, navigation }) {
  const { clubId } = route.params;
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [deleting, setDeleting] = useState(false);
  // Katıl/Ayrıl butonu için state
  const [isMember, setIsMember] = useState(false);
  const [membershipId, setMembershipId] = useState(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'join' veya 'leave' veya null

  useEffect(() => {
    getCurrentUserId().then(id => setCurrentUserId(id));
  }, []);

  // Kulüp detaylarını getir (user_id ile)
  const fetchClubDetails = async (userId = currentUserId) => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/clubs/${clubId}`;
      if (userId) url += `?user_id=${userId}`;
      const response = await axios.get(url);
      setClub(response.data);
      setIsMember(response.data.isMember || false);
      if (response.data.isMember && userId) {
        // Üyelik id'sini bul
        const memRes = await axios.get(`${API_BASE_URL}/club-members/club/${clubId}`);
        const mem = memRes.data.find(m => String(m.user_id) === String(userId));
        setMembershipId(mem ? mem.id : null);
      } else {
        setMembershipId(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // currentUserId ve clubId değiştiğinde fetch et
  useEffect(() => {
    if (currentUserId && clubId) {
      fetchClubDetails(currentUserId);
    }
  }, [clubId, currentUserId]);

  // Etkinlik sahibi mi?
  const isOwner = club && currentUserId && String(club.creator_id) === String(currentUserId);

  // Modal açıldığında mevcut bilgileri doldur
  useEffect(() => {
    if (showEditModal && club) {
      setEditName(club.name || '');
      setEditDescription(club.description || '');
      setEditCity(club.city || '');
      setEditCategory(club.category || '');
    }
  }, [showEditModal, club]);

  // Kulüp güncelle
  const handleUpdateClub = async () => {
    try {
      await axios.put(`${API_BASE_URL}/clubs/${club.id}`, {
        name: editName,
        description: editDescription,
        city: editCity,
        category: editCategory,
        cover_image: club.cover_image,
        is_approval_needed: club.is_approval_needed
      });
      setShowEditModal(false);
      fetchClubDetails();
      Alert.alert('Başarılı', 'Kulüp güncellendi');
    } catch (err) {
      Alert.alert('Hata', 'Kulüp güncellenemedi');
    }
  };

  // Kulüp sil
  const handleDeleteClub = async () => {
    Alert.alert(
      'Kulüp Silinecek',
      'Bu kulübü silmek istediğinizden emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await axios.delete(`${API_BASE_URL}/clubs/${club.id}`);
              setDeleting(false);
              Alert.alert('Başarılı', 'Kulüp silindi');
              navigation.goBack();
            } catch (err) {
              setDeleting(false);
              Alert.alert('Hata', 'Kulüp silinemedi');
            }
          }
        }
      ]
    );
  };

  // Katıl/Ayrıl işlemleri
  const handleJoinLeave = async (action) => {
    if (!currentUserId) return;
    setJoinLoading(true);
    try {
      if (action === 'join' && !isMember) {
        setIsMember(true);
        setClub(prev => prev ? { ...prev, memberCount: (prev.memberCount || 0) + 1 } : prev);
        setPendingAction('join');
        await axios.post(`${API_BASE_URL}/club-members`, { club_id: clubId, user_id: currentUserId });
      } else if (action === 'leave' && isMember && membershipId) {
        setIsMember(false);
        setClub(prev => prev ? { ...prev, memberCount: Math.max((prev.memberCount || 1) - 1, 0) } : prev);
        setPendingAction('leave');
        setMembershipId(null);
        await axios.delete(`${API_BASE_URL}/club-members/${membershipId}`);
      }
      // fetchClubDetails'i burada çağırma!
    } catch (err) {
      Alert.alert('Hata', 'İşlem başarısız');
    } finally {
      setJoinLoading(false);
      setPendingAction(null);
    }
  };

  // Header'a menü ekle
  useEffect(() => {
    if (isOwner) {
      navigation.setOptions({
        headerRight: () => (
          <Menu>
            <MenuTrigger customStyles={{
              TriggerTouchableComponent: TouchableOpacity,
              triggerWrapper: { paddingHorizontal: 16, paddingVertical: 6 },
            }}>
              <Ionicons name="ellipsis-vertical" size={28} color="#6a82fb" />
            </MenuTrigger>
            <MenuOptions customStyles={{
              optionsContainer: {
                borderRadius: 16,
                paddingVertical: 8,
                minWidth: 150,
                backgroundColor: '#fff',
                shadowColor: '#6a82fb',
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
              <MenuOption onSelect={handleDeleteClub} customStyles={{
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
  }, [navigation, isOwner, club]);

  useEffect(() => {
    console.log('club:', club);
    console.log('currentUserId:', currentUserId);
    console.log('isOwner:', isOwner);
  }, [club, currentUserId, isOwner]);

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

  if (!club) {
    return (
      <View style={styles.errorContainer}>
        <Text>Club not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerBox}>
        {club.cover_image || club.image_url ? (
          <Image source={{ uri: club.cover_image || club.image_url }} style={styles.clubPhotoBig} />
        ) : (
          <View style={styles.clubIconBig}>
            <Text style={styles.clubIconTextBig}>{club.name?.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.clubName}>{club.name}</Text>
        <View style={styles.metaRow}>
          {club.category && (
            <View style={styles.metaBadge}><Ionicons name="pricetag" size={16} color="#fff" /><Text style={styles.metaBadgeText}>{club.category}</Text></View>
          )}
          {club.city && (
            <View style={styles.metaBadge}><Ionicons name="location" size={16} color="#fff" /><Text style={styles.metaBadgeText}>{club.city}</Text></View>
          )}
        </View>
        {/* Üye sayısı kutusu */}
        <View style={styles.memberCountBox}>
          <Ionicons name="people" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.memberCountText}>{club.memberCount || 0} üye</Text>
        </View>
        {/* Katıl/Ayrıl butonları modern kutuda */}
        {true && (
          <View style={styles.joinLeaveContainer}>
            <TouchableOpacity
              style={[styles.joinButton, isMember && styles.joinButtonDisabled]}
              onPress={() => handleJoinLeave('join')}
              disabled={isMember || joinLoading}
              activeOpacity={0.85}
            >
              <Text style={[styles.joinButtonText, isMember && styles.joinButtonTextDisabled]}>Katıl</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.leaveButton, !isMember && styles.leaveButtonDisabled]}
              onPress={() => handleJoinLeave('leave')}
              disabled={!isMember || joinLoading}
              activeOpacity={0.85}
            >
              <Text style={[styles.leaveButtonText, !isMember && styles.leaveButtonTextDisabled]}>Ayrıl</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Açıklama</Text>
        <Text style={styles.sectionContent}>{club.description || 'Bu kulüp için açıklama bulunmamaktadır.'}</Text>
      </View>
      {/* Etkinlikler */}
      <View style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>Kulüp Etkinlikleri</Text>
        {club.events && club.events.length > 0 ? (
          club.events.map(event => (
            <TouchableOpacity
              key={event.id}
              onPress={() => navigation.navigate('EventDetailScreen', { eventId: event.id })}
              style={styles.eventCardModern}
              activeOpacity={0.88}
            >
              {event.image_url || event.image ? (
                <View style={styles.eventImageBox}>
                  <Image source={{ uri: event.image_url || event.image }} style={styles.eventImage} />
                </View>
              ) : (
                <View style={styles.eventIconModern}>
                  <MaterialCommunityIcons name={event.category === 'Genel' ? 'calendar-star' : 'calendar'} size={32} color="#fff" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitleModern}>{event.title}</Text>
                <View style={styles.eventMetaModernRow}>
                  {event.category && <View style={styles.eventBadgeModern}><Text style={styles.eventBadgeTextModern}>{event.category}</Text></View>}
                </View>
                <Text style={styles.eventDateModern}>{formatEventDate(event.date)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#6a82fb" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyEventBox}>
            <Ionicons name="calendar-outline" size={48} color="#bdbdbd" />
            <Text style={styles.emptyEventText}>Bu kulüpte henüz etkinlik yok.</Text>
          </View>
        )}
      </View>
      {/* Kulüp düzenleme modalı */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 24, width: '85%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 16, color: '#457b9d' }}>Kulübü Düzenle</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Kulüp Adı"
              style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 10, padding: 10, fontSize: 16 }}
            />
            <TextInput
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Açıklama"
              multiline
              style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 10, padding: 10, fontSize: 16, minHeight: 60 }}
            />
            <TextInput
              value={editCity}
              onChangeText={setEditCity}
              placeholder="Şehir"
              style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 10, padding: 10, fontSize: 16 }}
            />
            <TextInput
              value={editCategory}
              onChangeText={setEditCategory}
              placeholder="Kategori"
              style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 18, padding: 10, fontSize: 16 }}
            />
            <TouchableOpacity
              style={{ backgroundColor: '#6a82fb', borderRadius: 10, padding: 14, marginBottom: 8 }}
              onPress={handleUpdateClub}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>Kaydet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: '#eee', borderRadius: 10, padding: 14 }}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={{ color: '#333', textAlign: 'center', fontSize: 16 }}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerBox: { alignItems: 'center', paddingTop: 36, paddingBottom: 18, backgroundColor: '#fff', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, marginBottom: 10, shadowColor: '#6a82fb', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  clubIconBig: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#fcb045', alignItems: 'center', justifyContent: 'center', marginBottom: 10, shadowColor: '#fcb045', shadowOpacity: 0.13, shadowRadius: 8, elevation: 2 },
  clubIconTextBig: { color: '#fff', fontWeight: 'bold', fontSize: 38 },
  clubName: { fontSize: 28, fontWeight: 'bold', color: '#6a82fb', marginBottom: 6, textAlign: 'center' },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6a82fb', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, marginRight: 6 },
  metaBadgeText: { color: '#fff', fontWeight: '600', fontSize: 13, marginLeft: 4 },
  infoCard: { backgroundColor: '#fff', borderRadius: 18, padding: 20, marginHorizontal: 18, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#457b9d', marginBottom: 8 },
  sectionContent: { fontSize: 16, color: '#555', lineHeight: 24 },
  eventsSection: { marginHorizontal: 10, marginTop: 10 },
  eventCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, paddingVertical: 14, paddingHorizontal: 14, shadowColor: '#6a82fb', shadowOpacity: 0.10, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#fcb04522' },
  eventIconBox: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fcb045', alignItems: 'center', justifyContent: 'center', marginRight: 14, shadowColor: '#fcb045', shadowOpacity: 0.13, shadowRadius: 5, elevation: 1 },
  eventTitle: { fontSize: 17, fontWeight: '700', color: '#6a82fb', marginBottom: 2 },
  eventMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eventBadge: { backgroundColor: '#fcb04522', borderRadius: 7, paddingHorizontal: 6, paddingVertical: 1, marginRight: 6 },
  eventBadgeText: { color: '#fcb045', fontWeight: '600', fontSize: 12 },
  eventDate: { color: '#888', fontSize: 12, fontWeight: '600' },
  emptyEventBox: { alignItems: 'center', padding: 30 },
  emptyEventText: { color: '#bdbdbd', fontSize: 16, marginTop: 10, fontWeight: '600' },
  // Modern etkinlik kartı stilleri ekle
  eventCardModern: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, marginBottom: 14, paddingVertical: 16, paddingHorizontal: 16, shadowColor: '#6a82fb', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: '#fcb04522' },
  eventIconModern: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fcb045', alignItems: 'center', justifyContent: 'center', marginRight: 14, shadowColor: '#fcb045', shadowOpacity: 0.13, shadowRadius: 5, elevation: 1 },
  eventTitleModern: { fontSize: 18, fontWeight: 'bold', color: '#6a82fb', marginBottom: 2 },
  eventMetaModernRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2, gap: 8 },
  eventBadgeModern: { backgroundColor: '#fcb04522', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6 },
  eventBadgeTextModern: { color: '#fcb045', fontWeight: '700', fontSize: 13 },
  eventDateModern: { color: '#888', fontSize: 14, fontWeight: '600', marginTop: 2 },
  // Etkinlik görseli için stil ekle
  eventImageBox: { width: 48, height: 48, borderRadius: 12, overflow: 'hidden', backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  eventImage: { width: 48, height: 48, resizeMode: 'cover' },
  // Kulüp fotoğrafı için stil ekle
  clubPhotoBig: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#eee', marginBottom: 10, resizeMode: 'cover', alignSelf: 'center' },
  // Katıl/Ayrıl butonu stilleri
  joinButton: { backgroundColor: '#6a82fb', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center', shadowColor: '#6a82fb', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  joinButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  joinButtonDisabled: { backgroundColor: '#e0e0e0' },
  joinButtonTextDisabled: { color: '#aaa' },
  leaveButton: { backgroundColor: '#e63946', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center', shadowColor: '#e63946', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  leaveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  leaveButtonDisabled: { backgroundColor: '#e0e0e0' },
  leaveButtonTextDisabled: { color: '#aaa' },
  // Üye sayısı kutusu için stil ekle
  memberCountBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6a82fb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 5, marginTop: 10, alignSelf: 'center', shadowColor: '#6a82fb', shadowOpacity: 0.10, shadowRadius: 6, elevation: 2 },
  memberCountText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  // Katıl/Ayrıl butonları yan yana
  joinLeaveRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 10, marginBottom: 18 },
  // Modern kutu ve buton stilleri ekle
  joinLeaveContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 18, marginTop: 18, marginBottom: 0, backgroundColor: '#fff', borderRadius: 18, padding: 16, shadowColor: '#6a82fb', shadowOpacity: 0.10, shadowRadius: 10, elevation: 3, alignSelf: 'center', minWidth: 260 },
  joinButton: { backgroundColor: '#6a82fb', borderRadius: 10, paddingVertical: 16, paddingHorizontal: 36, alignItems: 'center', shadowColor: '#6a82fb', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  joinButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  joinButtonDisabled: { backgroundColor: '#e0e0e0' },
  joinButtonTextDisabled: { color: '#aaa' },
  leaveButton: { backgroundColor: '#e63946', borderRadius: 10, paddingVertical: 16, paddingHorizontal: 36, alignItems: 'center', shadowColor: '#e63946', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  leaveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  leaveButtonDisabled: { backgroundColor: '#e0e0e0' },
  leaveButtonTextDisabled: { color: '#aaa' },
});
