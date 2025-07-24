import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { FontAwesome5, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL, getCurrentUserId } from '../auth';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const FILTER_OPTIONS = [
  { label: 'Tüm Şehirler', value: 'all' },
  { label: 'Adana', value: 'Adana' },
  { label: 'Adıyaman', value: 'Adıyaman' },
  { label: 'Afyonkarahisar', value: 'Afyonkarahisar' },
  { label: 'Ağrı', value: 'Ağrı' },
  { label: 'Aksaray', value: 'Aksaray' },
  { label: 'Amasya', value: 'Amasya' },
  { label: 'Ankara', value: 'Ankara' },
  { label: 'Antalya', value: 'Antalya' },
  { label: 'Ardahan', value: 'Ardahan' },
  { label: 'Artvin', value: 'Artvin' },
  { label: 'Aydın', value: 'Aydın' },
  { label: 'Balıkesir', value: 'Balıkesir' },
  { label: 'Bartın', value: 'Bartın' },
  { label: 'Batman', value: 'Batman' },
  { label: 'Bayburt', value: 'Bayburt' },
  { label: 'Bilecik', value: 'Bilecik' },
  { label: 'Bingöl', value: 'Bingöl' },
  { label: 'Bitlis', value: 'Bitlis' },
  { label: 'Bolu', value: 'Bolu' },
  { label: 'Burdur', value: 'Burdur' },
  { label: 'Bursa', value: 'Bursa' },
  { label: 'Çanakkale', value: 'Çanakkale' },
  { label: 'Çankırı', value: 'Çankırı' },
  { label: 'Çorum', value: 'Çorum' },
  { label: 'Denizli', value: 'Denizli' },
  { label: 'Diyarbakır', value: 'Diyarbakır' },
  { label: 'Düzce', value: 'Düzce' },
  { label: 'Edirne', value: 'Edirne' },
  { label: 'Elazığ', value: 'Elazığ' },
  { label: 'Erzincan', value: 'Erzincan' },
  { label: 'Erzurum', value: 'Erzurum' },
  { label: 'Eskişehir', value: 'Eskişehir' },
  { label: 'Gaziantep', value: 'Gaziantep' },
  { label: 'Giresun', value: 'Giresun' },
  { label: 'Gümüşhane', value: 'Gümüşhane' },
  { label: 'Hakkari', value: 'Hakkari' },
  { label: 'Hatay', value: 'Hatay' },
  { label: 'Iğdır', value: 'Iğdır' },
  { label: 'Isparta', value: 'Isparta' },
  { label: 'İstanbul', value: 'İstanbul' },
  { label: 'İzmir', value: 'İzmir' },
  { label: 'Kahramanmaraş', value: 'Kahramanmaraş' },
  { label: 'Karabük', value: 'Karabük' },
  { label: 'Karaman', value: 'Karaman' },
  { label: 'Kars', value: 'Kars' },
  { label: 'Kastamonu', value: 'Kastamonu' },
  { label: 'Kayseri', value: 'Kayseri' },
  { label: 'Kırıkkale', value: 'Kırıkkale' },
  { label: 'Kırklareli', value: 'Kırklareli' },
  { label: 'Kırşehir', value: 'Kırşehir' },
  { label: 'Kilis', value: 'Kilis' },
  { label: 'Kocaeli', value: 'Kocaeli' },
  { label: 'Konya', value: 'Konya' },
  { label: 'Kütahya', value: 'Kütahya' },
  { label: 'Malatya', value: 'Malatya' },
  { label: 'Manisa', value: 'Manisa' },
  { label: 'Mardin', value: 'Mardin' },
  { label: 'Mersin', value: 'Mersin' },
  { label: 'Muğla', value: 'Muğla' },
  { label: 'Muş', value: 'Muş' },
  { label: 'Nevşehir', value: 'Nevşehir' },
  { label: 'Niğde', value: 'Niğde' },
  { label: 'Ordu', value: 'Ordu' },
  { label: 'Osmaniye', value: 'Osmaniye' },
  { label: 'Rize', value: 'Rize' },
  { label: 'Sakarya', value: 'Sakarya' },
  { label: 'Samsun', value: 'Samsun' },
  { label: 'Siirt', value: 'Siirt' },
  { label: 'Sinop', value: 'Sinop' },
  { label: 'Sivas', value: 'Sivas' },
  { label: 'Şanlıurfa', value: 'Şanlıurfa' },
  { label: 'Şırnak', value: 'Şırnak' },
  { label: 'Tekirdağ', value: 'Tekirdağ' },
  { label: 'Tokat', value: 'Tokat' },
  { label: 'Trabzon', value: 'Trabzon' },
  { label: 'Tunceli', value: 'Tunceli' },
  { label: 'Uşak', value: 'Uşak' },
  { label: 'Van', value: 'Van' },
  { label: 'Yalova', value: 'Yalova' },
  { label: 'Yozgat', value: 'Yozgat' },
  { label: 'Zonguldak', value: 'Zonguldak' },
];

const STATUS_OPTIONS = [
  { label: 'Tüm Etkinlikler', value: 'all' },
  { label: 'Katıldıklarım', value: 'joined' },
  { label: 'Katılmadıklarım', value: 'not-joined' },
];

const SORT_OPTIONS = [
  { label: 'Tarih (Yakın)', value: 'date-asc' },
  { label: 'Tarih (Uzak)', value: 'date-desc' },
  { label: 'Katılımcı (Çok)', value: 'participants-desc' },
  { label: 'Katılımcı (Az)', value: 'participants-asc' },
];

// Yeni kategori listesi
const CATEGORIES = [
  { label: '🎨 Sanat', value: 'Sanat' },
  { label: '💻 Yazılım', value: 'Yazılım' },
  { label: '⚽ Spor', value: 'Spor' },
  { label: '📚 Kitap', value: 'Kitap' },
  { label: '🎮 Oyun', value: 'Oyun' },
  { label: '🎵 Müzik', value: 'Müzik' },
  { label: '🌱 Doğa', value: 'Doğa' },
  { label: '✈ Seyahat', value: 'Seyahat' },
  { label: '🍳 Yemek', value: 'Yemek' },
  { label: '🧘 Kişisel Gelişim', value: 'Kişisel Gelişim' },
  { label: '🧪 Bilim', value: 'Bilim' },
  { label: '🗣 Tartışma', value: 'Tartışma' },
  { label: '📚 Eğitim', value: 'Eğitim' },
  { label: '💻 Teknoloji', value: 'Teknoloji' },
];

const typeOptions = [
  { label: 'Hepsi', value: 'all', icon: 'apps' },
  { label: 'Sadece Kulüpler', value: 'club', icon: 'users' },
  { label: 'Sadece Etkinlikler', value: 'event', icon: 'calendar' },
];

const popularityOptions = [
  { label: 'Hepsi', value: 'all' },
  { label: 'En Popüler', value: 'popular' },
  { label: 'En Yeni', value: 'newest' },
  { label: 'En Eski', value: 'oldest' },
];

export default function HomeScreen({ navigation }) {
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedClub, setSelectedClub] = useState('all');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPopularity, setSelectedPopularity] = useState('all');
  const [showType, setShowType] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOption, setSortOption] = useState('date-asc');

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [citySearchModalVisible, setCitySearchModalVisible] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({});
  const [appliedSort, setAppliedSort] = useState('all');
  const [joinedEventIds, setJoinedEventIds] = useState(new Set());
  const [savedEventIds, setSavedEventIds] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    getCurrentUserId().then(setCurrentUserId);
  }, []);

  const clubOptions = [
    { label: 'Tüm Kulüpler', value: 'all' },
    ...clubs.map(club => ({ label: club.name, value: club.id }))
  ];

  useFocusEffect(
    React.useCallback(() => {
      fetchFeed();
    }, [])
  );

  const fetchFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const [clubsRes, eventsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/clubs`),
        axios.get(`${API_BASE_URL}/events`),
      ]);
      setClubs(clubsRes.data);
      setEvents(eventsRes.data);
      
      const clubFeed = clubsRes.data.map(club => ({ ...club, type: 'club' }));
      const eventFeed = eventsRes.data.map(event => ({ ...event, type: 'event' }));
      
      const merged = [...clubFeed, ...eventFeed].sort((a, b) => {
        const aDate = a.type === 'event' ? new Date(a.date) : new Date(a.created_at || 0);
        const bDate = b.type === 'event' ? new Date(b.date) : new Date(b.created_at || 0);
        return bDate - aDate;
      });
      setFeed(merged);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  const applyFilters = () => {
    setAppliedFilters({
      city: selectedCity,
      category: selectedCategory,
      club: selectedClub,
      dateRange,
      status: selectedStatus,
      popularity: selectedPopularity,
      type: showType,
    });
    setFilterModalVisible(false);
  };

  const applySort = () => {
    setAppliedSort(sortOption);
    setSortModalVisible(false);
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    );
  };

  const filteredFeed = feed.filter(item => {
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      let haystack = "";
      if (item.type === "event") {
        const city = item.location && item.location.city ? item.location.city : '';
        haystack = `${item.title} ${item.description} ${item.category || ''} ${city}`.toLowerCase();
      } else if (item.type === "club") {
        haystack = `${item.name} ${item.description} ${item.category || ''}`.toLowerCase();
      }
      if (!haystack.includes(q)) return false;
    }
    if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) return false;
    if (appliedFilters.type && appliedFilters.type !== 'all' && item.type !== appliedFilters.type) return false;
    if (appliedFilters.city && appliedFilters.city !== 'all') {
      if (item.type === 'event') {
        const city = item.location && item.location.city ? item.location.city : '';
        if (city !== appliedFilters.city) return false;
      }
    }
    if (appliedFilters.category && appliedFilters.category !== 'all' && item.category !== appliedFilters.category) return false;
    if (appliedFilters.club && appliedFilters.club !== 'all' && item.club_id !== appliedFilters.club) return false;
    if (appliedFilters.status && appliedFilters.status !== 'all') {
      // Katılım durumu için ek kontrol
    }
    if (appliedFilters.dateRange && (appliedFilters.dateRange.from || appliedFilters.dateRange.to) && item.date) {
      const d = new Date(item.date);
      if (appliedFilters.dateRange.from && d < new Date(appliedFilters.dateRange.from)) return false;
      if (appliedFilters.dateRange.to && d > new Date(appliedFilters.dateRange.to)) return false;
    }
    return true;
  });

  const sortedFeed = [...filteredFeed].sort((a, b) => {
    if (appliedSort === 'popular') {
      return (b.participants?.length || 0) - (a.participants?.length || 0);
    }
    if (appliedSort === 'newest') {
      const aDate = a.type === 'event' ? new Date(a.date) : new Date(a.created_at || 0);
      const bDate = b.type === 'event' ? new Date(b.date) : new Date(b.created_at || 0);
      return bDate - aDate;
    }
    if (appliedSort === 'oldest') {
      const aDate = a.type === 'event' ? new Date(a.date) : new Date(a.created_at || 0);
      const bDate = b.type === 'event' ? new Date(b.date) : new Date(b.created_at || 0);
      return aDate - bDate;
    }
    return 0;
  });

  // Kullanıcının kaydettiği etkinlikleri çek
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;
       const res = await axios.get(`${API_BASE_URL}/events/saved`, {
  params: { user_id: userId }
});

        setSavedEventIds(new Set(res.data.map(ev => ev.id)));
      } catch (err) {
        setSavedEventIds(new Set());
      }
    };
    fetchSaved();
  }, [feed.length]);

const renderFeedItem = ({ item }) => {
  if (item.type === 'event') {
    const isSaved = savedEventIds.has(item.id);
    const isJoined = joinedEventIds.has(item.id);
    const creatorClub = clubs.find(club => club.id === item.club_id);
    const isOwner = item.creator_id && currentUserId && item.creator_id.toString() === currentUserId.toString();
    return (
      <TouchableOpacity activeOpacity={0.92} onPress={() => navigation.navigate('EventDetailScreen', { eventId: item.id })}>
        <View style={styles.igCard}>
          <View style={styles.igImageWrapper}>
            <Image source={{ uri: item.image_url || item.image }} style={styles.igImage} />
            <TouchableOpacity style={styles.igSaveButton} onPress={async () => {
              try {
                const userId = await getCurrentUserId();
                if (!userId) {
                  Alert.alert('Hata', 'Kullanıcı bilgisi alınamadı. Lütfen tekrar giriş yapın.');
                  return;
                }
                if (isSaved) {
                  await axios.delete(`${API_BASE_URL}/events/${item.id}/save`, { data: { user_id: userId } });
                  setSavedEventIds(prev => new Set([...prev].filter(id => id !== item.id)));
                } else {
                  await axios.post(`${API_BASE_URL}/events/${item.id}/save`, { user_id: userId });
                  setSavedEventIds(prev => new Set([...prev, item.id]));
                }
                fetchFeed();
              } catch (err) {
                Alert.alert('Kaydetme işlemi başarısız', err.response?.data?.error || err.message || 'İşlem başarısız.');
              }
            }}>
              <Feather name={isSaved ? 'bookmark' : 'bookmark'} size={28} color={isSaved ? '#ea4c89' : '#fff'} />
            </TouchableOpacity>
            <View style={styles.igTypeBadge}>
              <Feather name="calendar" size={18} color="#fff" />
            </View>
          </View>
          <View style={styles.igContent}>
            <Text style={styles.igTitle}>{item.title}</Text>
            {creatorClub && (
              <View style={styles.creatorClubRow}>
                <FontAwesome5 name="users" size={14} color="#6c5ce7" />
                <Text style={styles.creatorClubText}>{creatorClub.name}</Text>
              </View>
            )}
            <Text style={styles.igDesc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.igMetaRow}>
              {item.category && <View style={styles.igCategoryBadge}><Text style={styles.igCategoryText}>{item.category}</Text></View>}
              {item.city && <Text style={styles.igMetaText}>{item.city}</Text>}
              {item.date && <Text style={styles.igMetaText}>{new Date(item.date).toLocaleDateString()}</Text>}
            </View>
            <View style={styles.igFooterRow}>
              <View style={styles.igParticipants}>
                <MaterialCommunityIcons name="account-group" size={18} color="#6c5ce7" />
                <Text style={styles.igParticipantsText}>{Math.max(1, item.participants?.length || 0)} kişi</Text>
              </View>
              {/* Katıl butonunu sadece sahibi değilse göster */}
              {!isOwner && (
                <TouchableOpacity
                  style={[styles.igDetailButton, isJoined && { backgroundColor: '#b2bec3' }]}
                  onPress={async (e) => {
                    if (e && e.stopPropagation) e.stopPropagation();
                    try {
                      const userId = await getCurrentUserId();
                      if (!userId) {
                        Alert.alert('Hata', 'Kullanıcı bilgisi alınamadı. Lütfen tekrar giriş yapın.');
                        return;
                      }
                      if (!isJoined) {
                        await axios.post(`${API_BASE_URL}/events/${item.id}/join`, { user_id: userId });
                        setJoinedEventIds(prev => new Set([...prev, item.id]));
                      } else {
                        await axios.delete(`${API_BASE_URL}/events/${item.id}/join`, { data: { user_id: userId } });
                        setJoinedEventIds(prev => {
                          const newSet = new Set([...prev]);
                          newSet.delete(item.id);
                          return newSet;
                        });
                      }
                      fetchFeed();
                    } catch (err) {
                      Alert.alert('Katılım işlemi başarısız', err.response?.data?.error || err.message || 'İşlem başarısız.');
                    }
                  }}
                >
                  <Text style={styles.igDetailButtonText}>{isJoined ? 'Katıldın' : 'Katıl'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  if (item.type === 'club') {
    const getClubEventCount = (clubId) => events.filter(ev => ev.club_id === clubId).length;
    return (
      <View style={styles.clubCard}>
        <Image source={{ uri: item.cover_image }} style={styles.clubImage} />
        <View style={styles.clubContent}>
          <Text style={styles.clubTitle}>{item.name}</Text>
          <View style={styles.clubMetaRow}>
            <Text style={styles.clubCategory}>{item.category}</Text>
            <Text style={styles.clubMembers}>{(item.member_count ?? 1)} üye</Text>
            <Text style={styles.clubEventCount}>{getClubEventCount(item.id)} etkinlik</Text>
          </View>
          <Text style={styles.clubDesc} numberOfLines={2}>{item.description}</Text>
          <TouchableOpacity style={styles.clubButton} onPress={() => navigation.navigate('ClubDetail', { clubId: item.id })}>
            <Text style={styles.clubButtonText}>Kulübe Git</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return null;
};
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Akış yüklenemedi: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search bar ve filtre/sıralama butonları */}
      <View style={styles.searchBarContainer}>
        <Feather name="search" size={22} color="#666" style={{ marginHorizontal: 12 }} />
        <TextInput
          placeholder="Etkinlik, kulüp, şehir ara..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterIcon}>
          <Feather name="filter" size={22} color="#3897f0" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSortModalVisible(true)} style={styles.filterIcon}>
          <Feather name="sliders" size={22} color="#3897f0" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={sortedFeed}
        keyExtractor={item => `${item.type}-${item.id}`}
        renderItem={renderFeedItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6c5ce7"]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="calendar" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Henüz içerik yok</Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.filterHeaderSticky}>
              <Text style={styles.modalTitle}>Filtrele</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Feather name="x" size={26} color="#6c5ce7" />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              <Text style={styles.sectionTitle}>Gösterim</Text>
              <View style={styles.badgeRow}>
                {typeOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.badgeButton, showType === option.value && styles.badgeSelected]}
                    onPress={() => setShowType(option.value)}
                  >
                    <Feather name={option.icon} size={16} color={showType === option.value ? '#fff' : '#6c5ce7'} />
                    <Text style={[styles.badgeText, showType === option.value && styles.badgeTextSelected]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Şehir seçme */}
              <Text style={styles.sectionTitle}>Şehir</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <TouchableOpacity style={styles.citySelectButton} onPress={() => setCitySearchModalVisible(true)}>
                  <Feather name="map-pin" size={18} color="#6c5ce7" />
                  <Text style={styles.citySelectButtonText}>{selectedCity === 'all' ? 'Şehir Seç' : selectedCity}</Text>
                </TouchableOpacity>
              </View>
              
              {/* Kategoriler */}
              <Text style={styles.sectionTitle}>Kategoriler</Text>
              <ScrollView style={{ maxHeight: 220, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <TouchableOpacity
                    style={[
                      styles.categoryBadge,
                      selectedCategories.length === 0 && styles.categoryBadgeSelected
                    ]}
                    onPress={() => setSelectedCategories([])}
                  >
                    <Text style={[
                      styles.categoryBadgeText,
                      selectedCategories.length === 0 && styles.categoryBadgeTextSelected
                    ]}>
                      Tümü
                    </Text>
                  </TouchableOpacity>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.value}
                      style={[
                        styles.categoryBadge,
                        selectedCategories.includes(category.value) && styles.categoryBadgeSelected
                      ]}
                      onPress={() => toggleCategory(category.value)}
                    >
                      <Text style={[
                        styles.categoryBadgeText,
                        selectedCategories.includes(category.value) && styles.categoryBadgeTextSelected
                      ]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              
              {/* Kulüp seçme */}
              <Text style={styles.sectionTitle}>Kulüp</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                <View style={styles.badgeRow}>
                  {clubOptions.filter(opt => filterSearch === '' || opt.label.toLowerCase().includes(filterSearch.toLowerCase())).map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.badgeButton, selectedClub === option.value && styles.badgeSelected]}
                      onPress={() => setSelectedClub(option.value)}
                    >
                      <FontAwesome5 name="users" size={15} color={selectedClub === option.value ? '#fff' : '#6c5ce7'} />
                      <Text style={[styles.badgeText, selectedClub === option.value && styles.badgeTextSelected]}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              
              {/* Tarih aralığı */}
              <Text style={styles.sectionTitle}>Tarih Aralığı</Text>
              <View style={styles.dateRangeRow}>
                <TouchableOpacity style={styles.dateInput} onPress={() => setShowFromPicker(true)}>
                  <Feather name="calendar" size={16} color="#6c5ce7" />
                  <Text style={styles.dateInputText}>{dateRange.from ? new Date(dateRange.from).toLocaleDateString() : 'Başlangıç'}</Text>
                </TouchableOpacity>
                <Text style={{ marginHorizontal: 8, color: '#888' }}>-</Text>
                <TouchableOpacity style={styles.dateInput} onPress={() => setShowToPicker(true)}>
                  <Feather name="calendar" size={16} color="#6c5ce7" />
                  <Text style={styles.dateInputText}>{dateRange.to ? new Date(dateRange.to).toLocaleDateString() : 'Bitiş'}</Text>
                </TouchableOpacity>
              </View>
              {showFromPicker && (
                <DateTimePicker
                  value={dateRange.from ? new Date(dateRange.from) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(e, selectedDate) => {
                    setShowFromPicker(false);
                    if (selectedDate) setDateRange(r => ({ ...r, from: selectedDate }));
                  }}
                />
              )}
              {showToPicker && (
                <DateTimePicker
                  value={dateRange.to ? new Date(dateRange.to) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(e, selectedDate) => {
                    setShowToPicker(false);
                    if (selectedDate) setDateRange(r => ({ ...r, to: selectedDate }));
                  }}
                />
              )}
              
              {/* Katılım durumu */}
              <Text style={styles.sectionTitle}>Katılım Durumu</Text>
              <View style={styles.badgeRow}>
                {STATUS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.badgeButton, selectedStatus === option.value && styles.badgeSelected]}
                    onPress={() => setSelectedStatus(option.value)}
                  >
                    <Feather name={option.value === 'joined' ? 'check-circle' : option.value === 'not-joined' ? 'x-circle' : 'circle'} size={16} color={selectedStatus === option.value ? '#fff' : '#3897f0'} />
                    <Text style={[styles.badgeText, selectedStatus === option.value && styles.badgeTextSelected]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Popülerlik */}
              <Text style={styles.sectionTitle}>Popülerlik</Text>
              <View style={styles.badgeRow}>
                {popularityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.badgeButton, selectedPopularity === option.value && styles.badgeSelected]}
                    onPress={() => setSelectedPopularity(option.value)}
                  >
                    <MaterialCommunityIcons name={option.value === 'popular' ? 'fire' : option.value === 'newest' ? 'clock-fast' : option.value === 'oldest' ? 'clock-outline' : 'star-outline'} size={16} color={selectedPopularity === option.value ? '#fff' : '#6c5ce7'} />
                    <Text style={[styles.badgeText, selectedPopularity === option.value && styles.badgeTextSelected]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.filterModalFooter}>
                <TouchableOpacity style={styles.resetButton} onPress={() => {
                  setSelectedCity('all'); 
                  setSelectedCategory('all'); 
                  setSelectedClub('all'); 
                  setDateRange({ from: null, to: null }); 
                  setSelectedStatus('all'); 
                  setSelectedPopularity('all'); 
                  setShowType('all'); 
                  setFilterSearch(''); 
                  setSelectedCategories([]);
                }}>
                  <Text style={styles.resetButtonText}>Sıfırla</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                  <Text style={styles.applyButtonText}>Uygula</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Sıralama Seçenekleri</Text>
            <View style={styles.badgeRow}>
              {SORT_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.badgeButton, sortOption === option.value && styles.badgeSelected]}
                  onPress={() => setSortOption(option.value)}
                >
                  <Text style={[styles.badgeText, sortOption === option.value && styles.badgeTextSelected]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.filterModalFooter}>
              <TouchableOpacity style={styles.applyButton} onPress={applySort}>
                <Text style={styles.applyButtonText}>Uygula</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Şehir seçme modalı */}
      <Modal
        visible={citySearchModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCitySearchModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Şehir Seç</Text>
            <View style={styles.filterSearchRow}>
              <Feather name="search" size={18} color="#6c5ce7" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.filterSearchInput}
                placeholder="Şehir ismi yaz..."
                value={citySearch}
                onChangeText={setCitySearch}
                placeholderTextColor="#aaa"
              />
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {FILTER_OPTIONS.filter(opt => citySearch === '' || opt.label.toLowerCase().includes(citySearch.toLowerCase())).map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.badgeButton, selectedCity === option.value && styles.badgeSelected, { marginBottom: 8 }]}
                  onPress={() => { setSelectedCity(option.value); setCitySearchModalVisible(false); }}
                >
                  <Feather name="map-pin" size={16} color={selectedCity === option.value ? '#fff' : '#6c5ce7'} />
                  <Text style={[styles.badgeText, selectedCity === option.value && styles.badgeTextSelected]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.applyButton} onPress={() => setCitySearchModalVisible(false)}>
              <Text style={styles.applyButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 24,
    marginBottom: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 30,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  filterIcon: {
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 18,
    maxHeight: '75%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#3897f0',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
    color: '#333',
  },
  filterHeaderSticky: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 10, 
    borderBottomWidth: 1, 
    borderColor: '#f1f3f5', 
    paddingBottom: 8 
  },
  filterSearchRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f1f3f5', 
    borderRadius: 14, 
    paddingHorizontal: 10, 
    marginBottom: 14, 
    height: 38 
  },
  filterSearchInput: { 
    flex: 1, 
    fontSize: 15, 
    color: '#333' 
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  badgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  badgeSelected: {
    backgroundColor: '#3897f0',
    borderColor: '#3897f0',
  },
  badgeText: {
    fontSize: 14,
    color: '#6c5ce7',
    marginLeft: 6,
  },
  badgeTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateInputText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
  },
  filterModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: '#f1f3f5',
    paddingTop: 15,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f1f3f5',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#6c5ce7',
    fontWeight: '700',
    fontSize: 16,
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#3897f0',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  citySelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 4,
    borderWidth: 0,
  },
  citySelectButtonText: {
    color: '#6c5ce7',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 15,
  },
  // Kategori badge stilleri
  categoryBadge: {
    backgroundColor: '#f1f3f5',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryBadgeSelected: {
    backgroundColor: '#6c5ce7',
  },
  categoryBadgeText: {
    fontSize: 14,
    color: '#333',
  },
  categoryBadgeTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  // Kart stilleri
  clubCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 18,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  clubImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    backgroundColor: '#f1f3f5',
  },
  clubContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },
  clubTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6c5ce7',
    marginBottom: 4,
  },
  clubMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 10,
  },
  clubCategory: {
    backgroundColor: '#e5e7eb',
    color: '#6c5ce7',
    fontWeight: '700',
    fontSize: 13,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  clubMembers: {
    color: '#888',
    fontSize: 13,
  },
  clubEventCount: {
    backgroundColor: '#e5e7eb',
    color: '#6c5ce7',
    fontWeight: '700',
    fontSize: 13,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  clubDesc: {
    color: '#444',
    fontSize: 14,
    marginBottom: 8,
  },
  clubButton: {
    backgroundColor: '#ea4c89',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
  },
  clubButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  creatorClubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  creatorClubText: {
    marginLeft: 6,
    color: '#6c5ce7',
    fontSize: 14,
    fontWeight: '600',
  },
  igCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 18,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  igImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  igImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  igSaveButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  igTypeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#6c5ce7',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  igContent: {
    padding: 14,
  },
  igTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ea4c89',
    marginBottom: 4,
  },
  igDesc: {
    color: '#444',
    fontSize: 14,
    marginBottom: 8,
  },
  igMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 10,
  },
  igCategoryBadge: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  igCategoryText: {
    color: '#6c5ce7',
    fontWeight: '700',
    fontSize: 13,
  },
  igMetaText: {
    color: '#888',
    fontSize: 13,
  },
  igFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  igParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  igParticipantsText: {
    marginLeft: 6,
    color: '#6c5ce7',
    fontWeight: '700',
    fontSize: 13,
  },
  igDetailButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  igDetailButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#888',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});