import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
  ImageBackground,
  Dimensions,
  SafeAreaView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

import { API_BASE_URL, getCurrentUserId } from '../auth';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

const avatarOptions = [
  { id: 1, label: '🦁' }, { id: 2, label: '🐱' }, { id: 3, label: '🐶' },
  { id: 4, label: '🐼' }, { id: 5, label: '🐸' }, { id: 6, label: '🐨' },
  { id: 7, label: '🐰' }, { id: 8, label: '🐧' }, { id: 9, label: '🐢' },
  { id: 10, label: '🦄' }, { id: 11, label: '🐝' }, { id: 12, label: '🦋' },
  { id: 13, label: '🐙' }, { id: 14, label: '🐬' }, { id: 15, label: '🐣' },
  { id: 16, label: '🦀' }, { id: 17, label: '🐞' }, { id: 18, label: '🐿' },
  { id: 19, label: '🌸' }, { id: 20, label: '🌼' }, { id: 21, label: '🌺' },
  { id: 22, label: '🌷' },
  { id: 23, label: '💖' },
  { id: 24, label: '💐' },
  { id: 25, label: '❤' },
  { id: 26, label: '🍓' },
  { id: 27, label: '🌟' },
  { id: 28, label: '🍭' },
];

const ProfileScreen = ({ navigation }) => {
  const [userClubs, setUserClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [showClubs, setShowClubs] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);

  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  const [savedEvents, setSavedEvents] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedModalVisible, setSavedModalVisible] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [clubTab, setClubTab] = useState('created'); // 'created' | 'joined'
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [pastJoinedEvents, setPastJoinedEvents] = useState([]);
  const [loadingJoinedEvents, setLoadingJoinedEvents] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);

  const fetchUserData = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const userResponse = await axios.get(`${API_BASE_URL}/users/${userId}`);
    const userData = userResponse.data;
    
    // API'den gelen kullanıcı adını kontrol ediyoruz
    const displayName = userData.displayName || userData.username || userData.name || userData.email.split('@')[0];
    
    setCurrentUser({
      ...userData,
      displayName: displayName || 'Kullanıcı' // Fallback ekledik
    });
    
    if (userData.avatar) {
      setSelectedAvatar(userData.avatar);
    }

    await fetchUserClubs(userId);
    await fetchSavedEvents(userId);
    await fetchJoinedEvents(userId);
  } catch (error) {
    console.log('Profile fetch error:', error);
    setCurrentUser({
      displayName: 'Kullanıcı',
      email: ''
    });
  }
};

  const fetchUserClubs = async (userId) => {
    setLoadingClubs(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/users/${userId}/clubs`);
      setUserClubs(res.data);
    } catch (error) {
      console.log('Kulüpler çekilemedi:', error);
      setUserClubs([]);
    }
    setLoadingClubs(false);
  };

  const fetchSavedEvents = async (userId) => {
    setLoadingSaved(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/events/saved`, { params: { user_id: userId } });
      setSavedEvents(res.data);
    } catch (error) {
      console.log('Kaydedilen etkinlikler çekilemedi:', error);
      setSavedEvents([]);
    }
    setLoadingSaved(false);
  };

  // Katıldığı etkinlikleri çek ve geçmiş olanları filtrele
  const fetchJoinedEvents = async (userId) => {
    setLoadingJoinedEvents(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/events/joined`, { params: { user_id: userId } });
      setJoinedEvents(res.data);
      // Geçmiş etkinlikler: tarihi bugünden eski olanlar
      const now = moment();
      const past = res.data.filter(ev => ev.date && moment(ev.date).isBefore(now, 'day'));
      setPastJoinedEvents(past);
    } catch (error) {
      setJoinedEvents([]);
      setPastJoinedEvents([]);
    }
    setLoadingJoinedEvents(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleAvatarPress = () => setAvatarModalVisible(true);
  const selectAvatar = (avatar) => {
    if (avatar?.label) setSelectedAvatar(avatar.label);
    setAvatarModalVisible(false);
  };

  const handleShowClubsPress = () => {
    setShowClubs(true);
    setSelectedClub(null);
  };
  
  const handleHideClubsPress = () => {
    setShowClubs(false);
    setSelectedClub(null);
  };

  const openSavedModal = () => setSavedModalVisible(true);
  const closeSavedModal = () => setSavedModalVisible(false);

  const handleLogout = () => {
    setCurrentUser(null);
    if (navigation) navigation.replace('LoginScreen');
  };

  const handleClubPress = (club) => {
    if (navigation) {
      navigation.navigate('ClubDetail', {
        clubId: club.id,
        onClubChange: () => fetchUserClubs(currentUser.id)
      });
    } else {
      setSelectedClub(club);
    }
  };

  const handleBackToClubs = () => {
    setSelectedClub(null);
  };

  const renderClub = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('ClubDetail', { clubId: item.id })}
      style={styles.modernClubCard}
      activeOpacity={0.88}
    >
      <View style={styles.modernClubAvatarBox}>
        <Text style={styles.modernClubAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.modernClubInfoBox}>
        <Text style={styles.modernClubName}>{item.name}</Text>
        <View style={styles.modernClubMetaRow}>
          {item.category && <View style={styles.modernClubBadge}><Text style={styles.modernClubBadgeText}>{item.category}</Text></View>}
          <Text style={styles.modernClubMembers}>{item.memberCount || '1'} üye</Text>
        </View>
        {item.description && <Text style={styles.modernClubDesc} numberOfLines={2}>{item.description}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={24} color="#6a82fb" style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  );

  const renderSavedEvent = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        closeSavedModal();
        if (navigation) navigation.navigate('EventDetailScreen', { eventId: item.id });
      }}
      style={styles.savedEventCardModern}
      activeOpacity={0.88}
    >
      <View style={styles.savedEventStarBoxModern}>
        <Ionicons name="star" size={32} color="#fff" style={{ textShadowColor: '#fcb045', textShadowRadius: 8 }} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.savedEventTitleModern}>{item.title}</Text>
        {item.category && <View style={styles.savedEventBadgeModern}><Text style={styles.savedEventBadgeTextModern}>{item.category}</Text></View>}
      </View>
      <Ionicons name="chevron-forward" size={24} color="#6a82fb" style={{ marginLeft: 10 }} />
    </TouchableOpacity>
  );

  const renderClubDetails = () => (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.clubDetailsContainer}>
        <ImageBackground 
          
          style={styles.clubHeader}
          imageStyle={styles.clubHeaderImage}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent']}
            style={styles.gradient}
          >
            <TouchableOpacity onPress={handleBackToClubs} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
              <Text style={styles.backButtonText}>Kulüplere Dön</Text>
            </TouchableOpacity>
            
            <View style={styles.clubHeaderContent}>
              <View style={styles.clubIconLarge}>
                <Text style={styles.clubIconText}>{selectedClub.name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.clubNameLarge}>{selectedClub.name}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.clubContent}>
          <View style={styles.infoCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={20} color="#457b9d" />
              <Text style={styles.sectionTitle}>Kulüp Açıklaması</Text>
            </View>
            <Text style={styles.sectionContent}>
              {selectedClub.description || 'Bu kulüp için açıklama bulunmamaktadır.'}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={24} color="#f4a261" />
              <Text style={styles.statValue}>{selectedClub.memberCount || '0'}</Text>
              <Text style={styles.statLabel}>Üye</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="calendar" size={24} color="#f4a261" />
              <Text style={styles.statValue}>{selectedClub.events?.length || '0'}</Text>
              <Text style={styles.statLabel}>Etkinlik</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="star" size={24} color="#f4a261" />
              <Text style={styles.statValue}>{selectedClub.rating || '-'}</Text>
              <Text style={styles.statLabel}>Puan</Text>
            </View>
          </View>

          {selectedClub.events?.length > 0 && (
            <View style={styles.eventsSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar" size={20} color="#457b9d" />
                <Text style={styles.sectionTitle}>Yaklaşan Etkinlikler</Text>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.eventsScrollContainer}
              >
                {selectedClub.events.map(event => (
                  <TouchableOpacity key={event.id} style={styles.eventCard}>
                    <Text style={styles.eventDate}>{event.date}</Text>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.eventLocationContainer}>
                      <Ionicons name="location" size={14} color="#666" />
                      <Text style={styles.eventLocation}>{event.location}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>
              {selectedClub.isMember ? 'Kulüpten Ayrıl' : 'Kulübe Katıl'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // Kullanıcının oluşturduğu ve katıldığı kulüpleri ayır
  const createdClubs = userClubs.filter(club => club.creator_id && currentUser && club.creator_id.toString() === currentUser.id.toString());
  const joinedClubs = userClubs.filter(club => club.creator_id && currentUser && club.creator_id.toString() !== currentUser.id.toString());

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a37da6" />
        <Text style={styles.loadingText}>Kullanıcı bilgileri yükleniyor...</Text>
      </View>
    );
  }

  // Modern geçmiş etkinlik kartı
  const renderPastEvent = ({ item }) => (
    <View style={{
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 0,
      marginBottom: 18,
      shadowColor: '#6a82fb',
      shadowOpacity: 0.10,
      shadowRadius: 10,
      elevation: 3,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#f1f3f5',
    }}>
      {/* Kapak görseli */}
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={{ width: '100%', height: 140, borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
      ) : (
        <View style={{ width: '100%', height: 140, backgroundColor: '#f3e8ff', borderTopLeftRadius: 16, borderTopRightRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="calendar" size={48} color="#ea4c89" />
        </View>
      )}
      <View style={{ padding: 16 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#6a82fb', marginBottom: 4 }}>{item.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Ionicons name="calendar-outline" size={16} color="#888" style={{ marginRight: 4 }} />
          <Text style={{ color: '#888', fontSize: 14 }}>{moment(item.date).format('DD MMM YYYY')}</Text>
          {item.time && <Text style={{ color: '#888', fontSize: 14, marginLeft: 10 }}>{item.time.slice(0,5)}</Text>}
        </View>
        {item.category && (
          <View style={{ alignSelf: 'flex-start', backgroundColor: '#ea4c89', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 6 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{item.category}</Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons name="location-sharp" size={16} color="#6c5ce7" style={{ marginRight: 4 }} />
          <Text style={{ color: '#444', fontSize: 14 }}>
            {item.city || ''}{item.city && item.district ? ' / ' : ''}{item.district || ''}
          </Text>
        </View>
        {item.location_name && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="map" size={15} color="#6c5ce7" style={{ marginRight: 4 }} />
            <Text style={{ color: '#444', fontSize: 14 }}>{item.location_name}</Text>
          </View>
        )}
        {item.description && (
          <Text style={{ color: '#444', fontSize: 14, marginTop: 6 }}>{item.description}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {showPastEvents ? (
        <ScrollView contentContainerStyle={styles.profileContainer}>
          <TouchableOpacity onPress={() => setShowPastEvents(false)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
            <Ionicons name="arrow-back" size={24} color="#6a82fb" style={{ marginRight: 8 }} />
            <Text style={{ color: '#6a82fb', fontWeight: 'bold', fontSize: 16 }}>Profili Gör</Text>
          </TouchableOpacity>
          <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#e63946', marginBottom: 18 }}>Geçmiş Etkinlikler</Text>
          {loadingJoinedEvents ? (
            <ActivityIndicator size="large" color="#e63946" />
          ) : pastJoinedEvents.length === 0 ? (
            <Text style={{ color: '#888', fontStyle: 'italic' }}>Henüz geçmiş etkinliğin yok.</Text>
          ) : (
            <FlatList
              data={pastJoinedEvents}
              keyExtractor={item => item.id?.toString() || Math.random().toString()}
              renderItem={renderPastEvent}
              scrollEnabled={false}
            />
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.profileContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarContainer}>
              <LinearGradient
                colors={['#a8dadc', '#457b9d']}
                style={styles.avatarFallback}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {selectedAvatar ? (
                  <Text style={styles.avatarEmoji}>{selectedAvatar}</Text>
                ) : (
                  <Ionicons name="person" size={40} color="white" />
                )}
              </LinearGradient>
            </TouchableOpacity>

           <Text style={styles.userName}>{currentUser?.displayName}</Text>
            <Text style={styles.userEmail}>{currentUser.email || ''}</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation && navigation.navigate('EditProfileScreen')}
              >
                <Text style={styles.editButtonText}>Profili Düzenle</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.editButton, styles.logoutButton]}
                onPress={handleLogout}
              >
                <Text style={styles.editButtonText}>Çıkış Yap</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.iconRow}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={handleShowClubsPress}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name="extension-puzzle-outline"
                  size={28}
                  color="#7f5a82"
                />
              </View>
              <Text style={styles.iconText}>Kulüplerim</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={openSavedModal}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="bookmark" size={28} color="#d8a8e1" />
                {savedEvents.length > 0 && (
                  <View style={styles.bookmarkCountContainer}>
                    <Text style={styles.bookmarkCountText}>{savedEvents.length}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.iconText}>Kaydedilenler</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => setShowPastEvents(true)}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="time-outline" size={28} color="#cda6ce" />
              </View>
              <Text style={styles.iconText}>Geçmiş</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      )}

      {/* Avatar seçimi modalı */}
      <Modal
        visible={avatarModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Avatar Seç</Text>
            <View style={styles.avatarOptions}>
              {avatarOptions.map((avatar) => (
                <TouchableOpacity
                  key={avatar.id}
                  onPress={() => selectAvatar(avatar)}
                  style={[
                    styles.emojiOption,
                    selectedAvatar === avatar.label && styles.selectedEmojiOption
                  ]}
                >
                  <Text style={styles.optionEmoji}>{avatar.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setAvatarModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Kaydedilen etkinlikler modalı */}
      <Modal
        visible={savedModalVisible}
        animationType="slide"
        onRequestClose={closeSavedModal}
      >
        <SafeAreaView style={styles.savedModalSafeAreaModern}>
          <LinearGradient colors={["#fcb045", "#f8fafc", "#6a82fb"]} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.savedModalGradient}>
            <View style={styles.savedModalHeaderModern}>
              <Ionicons name="bookmark" size={36} color="#fff" style={{ marginRight: 12, backgroundColor: '#6a82fb', borderRadius: 16, padding: 6 }} />
              <Text style={styles.savedModalTitleModern}>Kaydedilenler</Text>
              <TouchableOpacity onPress={closeSavedModal} style={styles.savedModalCloseBtnModern}>
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
            {loadingSaved ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6a82fb" />
              </View>
            ) : savedEvents.length === 0 ? (
              <View style={styles.savedEmptyContainerModern}>
                <Ionicons name="star-outline" size={80} color="#fcb045" style={{ marginBottom: 18 }} />
                <Text style={styles.savedEmptyTextModern}>Henüz hiç etkinlik kaydetmedin!
Favorilerine yıldız ekle ✨</Text>
              </View>
            ) : (
              <FlatList
                data={savedEvents}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderSavedEvent}
                contentContainerStyle={styles.savedListContainerModern}
              />
            )}
          </LinearGradient>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  profileContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#457b9d',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatarFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarEmoji: {
    fontSize: 60,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#264653',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#457b9d',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#457b9d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 10,
    shadowColor: '#457b9d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    backgroundColor: '#e63946',
    shadowColor: '#e63946',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  iconButton: {
    alignItems: 'center',
    width: 100,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconText: {
    fontSize: 14,
    color: '#457b9d',
    fontWeight: '500',
    textAlign: 'center',
  },
  bookmarkCountContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e63946',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clubsListContainer: {
    flex: 1,
    paddingTop: 20,
  },
  clubsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButtonSmall: {
    marginRight: 15,
  },
  subTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#264653',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clubIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f4a261',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  clubIconText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 22,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#264653',
    marginBottom: 3,
  },
  clubMembers: {
    fontSize: 14,
    color: '#9e9e9e',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9a9a9a',
    textAlign: 'center',
    marginTop: 20,
  },
  clubDetailsContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  clubHeader: {
    height: 280,
    width: '100%',
    justifyContent: 'flex-start',
  },
  clubHeaderImage: {
    opacity: 0.8,
  },
  gradient: {
    flex: 1,
    paddingTop: 50,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginBottom: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 5,
  },
  clubHeaderContent: {
    alignItems: 'center',
    marginTop: 30,
  },
  clubIconLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(244, 162, 97, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'white',
  },
  clubNameLarge: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  clubContent: {
    padding: 20,
    marginTop: -30,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#457b9d',
    marginLeft: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#264653',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  eventsSection: {
    marginBottom: 25,
  },
  eventsScrollContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: 220,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  eventDate: {
    fontSize: 14,
    color: '#f4a261',
    fontWeight: '600',
    marginBottom: 5,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
    marginBottom: 8,
  },
  eventLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  joinButton: {
    backgroundColor: '#457b9d',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#457b9d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#264653',
  },
  avatarOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 20,
  },
  emojiOption: {
    backgroundColor: '#edf6f9',
    padding: 12,
    borderRadius: 50,
    margin: 8,
  },
  selectedEmojiOption: {
    backgroundColor: '#a8dadc',
    borderWidth: 2,
    borderColor: '#457b9d',
  },
  optionEmoji: {
    fontSize: 32,
    textAlign: 'center',
  },
  savedListContainer: {
    paddingBottom: 30,
  },
  savedItem: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  savedItemText: {
    fontSize: 16,
    color: '#264653',
    fontWeight: '500',
    flex: 1,
  },
  savedItemDate: {
    fontSize: 14,
    color: '#9e9e9e',
    marginLeft: 10,
  },
  closeModalButton: {
    backgroundColor: '#457b9d',
    paddingVertical: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeModalText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  savedModalSafeArea: { flex: 1, backgroundColor: '#fff8f0' },
  savedModalContainer: { flex: 1, backgroundColor: '#fff8f0', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 18 },
  savedModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 18, paddingHorizontal: 18 },
  savedModalTitle: { fontSize: 22, fontWeight: '800', color: '#ea4c89', flex: 1, textAlign: 'center', letterSpacing: 0.5 },
  savedModalCloseBtn: { position: 'absolute', right: 18, top: 0, padding: 8 },
  savedEventCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 18, marginHorizontal: 18, marginBottom: 14, shadowColor: '#ea4c89', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  savedEventIconBox: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#ffe3ef', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  savedEventTitle: { fontSize: 17, fontWeight: '700', color: '#ea4c89', flex: 1 },
  savedEmptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  savedEmptyText: { fontSize: 17, color: '#ea4c89', textAlign: 'center', marginTop: 10, fontWeight: '600', lineHeight: 26 },
  savedModalSafeAreaModern: { flex: 1, backgroundColor: '#fff8f0' },
  savedModalGradient: { flex: 1, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 18 },
  savedModalHeaderModern: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 18, paddingHorizontal: 18 },
  savedModalTitleModern: { fontSize: 26, fontWeight: '900', color: '#fff', flex: 1, textAlign: 'center', letterSpacing: 1.2, fontFamily: 'System', textShadowColor: '#0002', textShadowRadius: 6 },
  savedModalCloseBtnModern: { position: 'absolute', right: 18, top: 0, padding: 8 },
  savedEventCardModern: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16, // küçült
    paddingVertical: 10, // küçült
    paddingHorizontal: 12, // küçült
    marginHorizontal: 10, // küçült
    marginBottom: 10, // küçült
    shadowColor: '#6a82fb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#fcb04522',
  },
  savedEventStarBoxModern: {
    width: 32, // küçült
    height: 32, // küçült
    borderRadius: 16,
    backgroundColor: '#fcb045',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10, // küçült
    shadowColor: '#fcb045',
    shadowOpacity: 0.13,
    shadowRadius: 5,
    elevation: 1,
  },
  savedEventTitleModern: {
    fontSize: 15, // küçült
    fontWeight: '700',
    color: '#6a82fb',
    marginBottom: 1,
  },
  savedEventBadgeModern: {
    backgroundColor: '#fcb04522',
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  savedEventBadgeTextModern: {
    color: '#fcb045',
    fontWeight: '600',
    fontSize: 11, // küçült
  },
  savedEmptyContainerModern: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  savedEmptyTextModern: { fontSize: 18, color: '#fff', textAlign: 'center', marginTop: 10, fontWeight: '700', lineHeight: 28, textShadowColor: '#0002', textShadowRadius: 6 },
  savedListContainerModern: { paddingBottom: 40, paddingTop: 10 },
  modernClubListContainer: { paddingHorizontal: 10, paddingBottom: 30 },
  modernClubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#6a82fb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  modernClubAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fcb045',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#fcb045',
    shadowOpacity: 0.13,
    shadowRadius: 5,
    elevation: 1,
  },
  modernClubAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 22,
  },
  modernClubInfoBox: { flex: 1 },
  modernClubName: { fontSize: 17, fontWeight: '700', color: '#6a82fb', marginBottom: 2 },
  modernClubMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2, gap: 8 },
  modernClubBadge: { backgroundColor: '#fcb04522', borderRadius: 7, paddingHorizontal: 6, paddingVertical: 1, marginRight: 6 },
  modernClubBadgeText: { color: '#fcb045', fontWeight: '600', fontSize: 12 },
  modernClubMembers: { color: '#888', fontSize: 12, fontWeight: '600' },
  modernClubDesc: { color: '#444', fontSize: 13, marginTop: 2 },
});

export default ProfileScreen;