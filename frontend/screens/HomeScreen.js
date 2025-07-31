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
  ImageBackground, // <-- BURAYA EKLE
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

// Kart tasarımı için örnek (renderFeedItem fonksiyonunda kullan)
const cardBaseStyle = {
  backgroundColor: "#fff",
  borderRadius: 24,
  marginHorizontal: 23,
  marginBottom: 20,
  overflow: "hidden",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
};

const renderFeedItem = ({ item }) => {
  const isEvent = item.type === 'event';
  const isClub = item.type === 'club';
  const isSaved = isEvent && savedEventIds.has(item.id);
  const isJoined = isEvent && joinedEventIds.has(item.id);
  const isOwner = isEvent && item.creator_id && currentUserId && item.creator_id.toString() === currentUserId.toString();
  const city = isEvent
    ? (item.location?.city || item.city || '-')
    : (item.city || '-');
  const date = isEvent
    ? (item.date ? new Date(item.date).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" }) : "")
    : (item.created_at ? new Date(item.created_at).toLocaleDateString("tr-TR") : "");
  const imageUrl = isEvent
    ? (item.image_url || item.image || "https://placehold.co/400x200/23234B/fff?text=Etkinlik")
    : (item.cover_image || "https://placehold.co/400x200/23234B/fff?text=Kulüp");
  const title = isEvent ? item.title : item.name;
  const desc = isEvent ? item.description : item.description;
  const category = item.category;
  const participantCount = isEvent ? Math.max(1, item.participants?.length || 0) : (item.member_count ?? 1);
  const eventCount = isClub ? events.filter(ev => ev.club_id === item.id).length : null;

  // Kart rengi: etkinlik açık, kulüp koyu
  const cardStyle = {
    backgroundColor: isEvent ? "#fff" : "#23234B",
    borderRadius: 24,
    marginHorizontal: 23,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  };

  // Yazı rengi: etkinlikte koyu, kulüpte açık
  const titleColor = isEvent ? "#23234B" : "#fff";
  const descColor = isEvent ? "#23234B" : "#fff";
  const metaColor = isEvent ? "#23234B" : "#fff";

  return (
    <View style={cardStyle}>
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: "100%",
          height: 180,
          backgroundColor: "#eaeaea",
        }}
        resizeMode="cover"
      />
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 9 }}>
          <View style={{ alignItems: "center", marginRight: 9 }}>
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: 62,
                height: 62,
                borderRadius: 12,
                backgroundColor: "#23234B"
              }}
              resizeMode="cover"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: titleColor, fontSize: 22, fontWeight: "bold", marginBottom: 3 }}>
              {title}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {category && (
                <View style={{
                  backgroundColor: "#8FA0D8",
                  borderRadius: 15,
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  marginRight: 9,
                }}>
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                    {category}
                  </Text>
                </View>
              )}
              <Text style={{
                color: metaColor,
                fontSize: 12,
                fontWeight: "bold",
                marginRight: 12,
              }}>
                {isEvent ? `${participantCount} kişi` : `${participantCount} üye`}
              </Text>
              {isClub && (
                <View style={{
                  backgroundColor: "#8FA0D8",
                  borderRadius: 15,
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                }}>
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                    {eventCount} Etkinlik
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", marginHorizontal: 0 }}>
          <Text style={{
            color: descColor,
            fontSize: 14,
            fontWeight: "bold",
            marginTop: 2,
            flex: 1,
          }}>
            {desc}
          </Text>
          {isEvent && !isOwner && (
            <TouchableOpacity
              style={{
                backgroundColor: isJoined ? "#b2bec3" : "#FF8502",
                borderRadius: 17,
                paddingVertical: 4,
                paddingHorizontal: 14,
                alignSelf: "flex-end",
                marginLeft: 8,
              }}
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
              <Text style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "bold",
              }}>
                {isJoined ? "Katıldın" : "Katıl"}
              </Text>
            </TouchableOpacity>
          )}
          {isClub && (
            <TouchableOpacity
              style={{
                backgroundColor: "#FF8502",
                borderRadius: 17,
                paddingVertical: 4,
                paddingHorizontal: 14,
                alignSelf: "flex-end",
                marginLeft: 8,
              }}
              onPress={() => navigation.navigate('ClubDetail', { clubId: item.id })}
            >
              <Text style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "bold",
              }}>
                Kulübe Git
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
          <Text style={{
            color: metaColor,
            fontSize: 12,
            fontWeight: "bold",
            flex: 1,
          }}>
            {city}
          </Text>
          <Text style={{
            color: metaColor,
            fontSize: 12,
            fontWeight: "bold",
            marginRight: 12,
          }}>
            {date}
          </Text>
          {isEvent && (
            <TouchableOpacity
              style={{
                backgroundColor: "#FCA311",
                borderRadius: 20,
                padding: 5,
                marginLeft: 8,
              }}
              onPress={async () => {
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
              }}
            >
              <Feather name={isSaved ? 'bookmark' : 'bookmark'} size={22} color={isSaved ? '#ea4c89' : '#fff'} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
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

  // Hero kartlar için gerçek veri seçimi
  const heroEvent = feed.find(item => item.type === 'event');
  const heroClub = feed.find(item => item.type === 'club');

  return (
  <View style={styles.container}>
    <ScrollView
      style={{ backgroundColor: "#fff" }}
      contentContainerStyle={{ paddingBottom: 0 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Arama Barı */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderColor: "#0C0829",
          borderRadius: 24,
          borderWidth: 1,
          paddingVertical: 8,
          paddingHorizontal: 11,
          marginTop: 58,
          marginBottom: 20,
          marginHorizontal: 23,
          backgroundColor: "#fff",
        }}
        onPress={() => setFilterModalVisible(true)}
      >
        <Image
          source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/vWIRdWhLXn/5jdamrhu_expires_30_days.png" }}
          resizeMode={"stretch"}
          style={{ width: 26, height: 29, marginRight: 16 }}
        />
        <Text
          style={{
            color: "#000",
            fontSize: 15,
            flex: 1,
          }}
        >
          Etkinlik, kulüp, şehir ara…
        </Text>
        <Image
          source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/vWIRdWhLXn/gwpng84y_expires_30_days.png" }}
          resizeMode={"stretch"}
          style={{ width: 26, height: 16 }}
        />
      </TouchableOpacity>

      {/* Filtre Butonları */}
      <View style={{ flexDirection: "row", marginBottom: 24, marginLeft: 23 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#FF8502",
            borderRadius: 24,
            paddingVertical: 5,
            paddingHorizontal: 16,
            marginRight: 6,
          }}
          onPress={() => setSortOption('date-desc')}
        >
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "bold" }}>Son Yüklenen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "#FF8502",
            borderRadius: 24,
            paddingVertical: 5,
            paddingHorizontal: 18,
            marginRight: 6,
          }}
          onPress={() => setSortOption('newest')}
        >
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "bold" }}>Yeni</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "#FF8502",
            borderRadius: 24,
            paddingVertical: 5,
            paddingHorizontal: 17,
            marginRight: 6,
          }}
          onPress={() => setSortOption('popular')}
        >
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "bold" }}>Popüler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "#FF8502",
            borderRadius: 24,
            paddingVertical: 5,
            paddingHorizontal: 18,
          }}
          onPress={() => setSortOption('all')}
        >
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "bold" }}>Hepsi</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Event Kartı (Gerçek veriyle) */}
      {heroEvent && (
        <ImageBackground
          source={{ uri: heroEvent.image_url || heroEvent.image || "https://placehold.co/400x200/23234B/fff?text=Etkinlik" }}
          resizeMode="cover"
          style={{
            paddingVertical: 12,
            marginBottom: 20,
            marginHorizontal: 23,
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <View style={{ flexDirection: "row", marginBottom: 80, marginHorizontal: 14 }}>
            <View style={{ alignItems: "center", marginTop: 6, marginRight: 6 }}>
              <Image
                source={{ uri: heroEvent.image_url || heroEvent.image || "https://placehold.co/62x62/23234B/fff?text=E" }}
                resizeMode="cover"
                style={{ width: 33, height: 33, borderRadius: 8 }}
              />
            </View>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>
                {heroEvent.title}
              </Text>
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold", marginLeft: 1 }}>
                {heroEvent.location?.city || heroEvent.city || "-"}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 16 }}>
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold", flex: 1 }}>
              {heroEvent.date ? new Date(heroEvent.date).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" }) : ""}
            </Text>
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
              {heroEvent.category}
            </Text>
          </View>
        </ImageBackground>
      )}

      {/* Hero Club Kartı (Gerçek veriyle) */}
      {heroClub && (
        <View
          style={{
            backgroundColor: "#0A0827",
            borderRadius: 17,
            paddingVertical: 19,
            marginBottom: 20,
            marginHorizontal: 23,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 9, marginLeft: 14 }}>
            <View style={{ alignItems: "center", marginRight: 9 }}>
              <Image
                source={{ uri: heroClub.cover_image || "https://placehold.co/62x62/23234B/fff?text=K" }}
                resizeMode="cover"
                style={{ width: 62, height: 62, borderRadius: 12, backgroundColor: "#23234B" }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: "bold",
                  marginBottom: 3,
                  flexShrink: 1,
                  flexWrap: "wrap",
                  maxWidth: 220,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {heroClub.name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {heroClub.category && (
                  <View
                    style={{
                      backgroundColor: "#8FA0D8",
                      borderRadius: 15,
                      paddingVertical: 4,
                      paddingHorizontal: 10,
                      marginRight: 9,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                      {heroClub.category}
                    </Text>
                  </View>
                )}
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold", marginRight: 12 }}>
                  {heroClub.member_count ?? "-"} üye
                </Text>
                <View
                  style={{
                    backgroundColor: "#8FA0D8",
                    borderRadius: 15,
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                    {(events.filter(ev => ev.club_id === heroClub.id).length) || 0} Etkinlik
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", marginHorizontal: 14 }}>
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold", marginTop: 2, flex: 1 }}>
              {heroClub.description}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#FF8502",
                borderRadius: 17,
                paddingVertical: 4,
                paddingHorizontal: 14,
              }}
              onPress={() => navigation.navigate('ClubDetail', { clubId: heroClub.id })}
            >
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>Kulübe Git</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Kulüp Listesi */}
      {clubs.length > 0 && (
  <View style={{ marginBottom: 24 }}>
    <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", marginLeft: 23, marginBottom: 10 }}>
      Tüm Kulüpler
    </Text>
    {clubs
      .filter(club => !heroClub || club.id !== heroClub.id) // Hero club'ı listeden çıkar
      .map(club => (
        <View
          key={club.id}
          style={{
            backgroundColor: "#0A0827",
            borderRadius: 17,
            paddingVertical: 19,
            marginBottom: 20,
            marginHorizontal: 23,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 9, marginLeft: 14 }}>
            <View style={{ alignItems: "center", marginRight: 9 }}>
              <Image
                source={{ uri: club.cover_image || "https://placehold.co/62x62/23234B/fff?text=K" }}
                resizeMode="cover"
                style={{ width: 62, height: 62, borderRadius: 12, backgroundColor: "#23234B" }}
              />
            </View>
            <View>
              <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 3, flexShrink: 1, flexWrap: "wrap", maxWidth: 220 }} numberOfLines={1} ellipsizeMode="tail">
                {club.name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {club.category && (
                  <View style={{
                    backgroundColor: "#8FA0D8",
                    borderRadius: 15,
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    marginRight: 9,
                  }}>
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                      {club.category}
                    </Text>
                  </View>
                )}
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold", marginRight: 12 }}>
                  {club.member_count ?? "-"} üye
                </Text>
                <View style={{
                  backgroundColor: "#8FA0D8",
                  borderRadius: 15,
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                }}>
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                    {(events.filter(ev => ev.club_id === club.id).length) || 0} Etkinlik
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", marginHorizontal: 14 }}>
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold", marginTop: 2, flex: 1 }}>
              {club.description}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#FF8502",
                borderRadius: 17,
                paddingVertical: 4,
                paddingHorizontal: 14,
              }}
              onPress={() => navigation.navigate('ClubDetail', { clubId: club.id })}
            >
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>Kulübe Git</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
  </View>
)}

      {/* Akış: Hero kartlar hariç tüm kulüp ve etkinlikler */}
      {feed
        .filter(item =>
          // Hero club ve hero event hariç tümünü göster
          (!heroClub || item.id !== heroClub.id || item.type !== 'club') &&
          (!heroEvent || item.id !== heroEvent.id || item.type !== 'event')
        )
        .map(item => (
          <View key={item.type + '-' + item.id}>
            {item.type === 'club' ? (
              // Kulüp kartı
              <View
                style={{
                  backgroundColor: "#0A0827",
                  borderRadius: 17,
                  paddingVertical: 19,
                  marginBottom: 20,
                  marginHorizontal: 23,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 9, marginLeft: 14 }}>
                  <View style={{ alignItems: "center", marginRight: 9 }}>
                    <Image
                      source={{ uri: item.cover_image || "https://placehold.co/62x62/23234B/fff?text=K" }}
                      resizeMode="cover"
                      style={{ width: 62, height: 62, borderRadius: 12, backgroundColor: "#23234B" }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 22,
                        fontWeight: "bold",
                        marginBottom: 3,
                        flexShrink: 1,
                        flexWrap: "wrap",
                        maxWidth: 220,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.name}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      {item.category && (
                        <View
                          style={{
                            backgroundColor: "#8FA0D8",
                            borderRadius: 15,
                            paddingVertical: 4,
                            paddingHorizontal: 10,
                            marginRight: 9,
                          }}
                        >
                          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                            {item.category}
                          </Text>
                        </View>
                      )}
                      <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold", marginRight: 12 }}>
                        {item.member_count ?? "-"} üye
                      </Text>
                      <View
                        style={{
                          backgroundColor: "#8FA0D8",
                          borderRadius: 15,
                          paddingVertical: 4,
                          paddingHorizontal: 10,
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                          {(events.filter(ev => ev.club_id === item.id).length) || 0} Etkinlik
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: "row", marginHorizontal: 14 }}>
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold", marginTop: 2, flex: 1 }}>
                    {item.description}
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#FF8502",
                      borderRadius: 17,
                      paddingVertical: 4,
                      paddingHorizontal: 14,
                    }}
                    onPress={() => navigation.navigate('ClubDetail', { clubId: item.id })}
                  >
                    <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>Kulübe Git</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Etkinlik kartı
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 17,
                  paddingVertical: 19,
                  marginBottom: 20,
                  marginHorizontal: 23,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Image
                  source={{ uri: item.image_url || item.image || "https://placehold.co/400x200/23234B/fff?text=Etkinlik" }}
                  resizeMode="cover"
                  style={{ width: "100%", height: 180, borderRadius: 12, marginBottom: 10 }}
                />
                <View style={{ paddingHorizontal: 16 }}>
                  <Text style={{ color: "#23234B", fontSize: 22, fontWeight: "bold", marginBottom: 3 }}>
                    {item.title}
                  </Text>
                  <Text style={{ color: "#23234B", fontSize: 14, fontWeight: "bold", marginBottom: 6 }}>
                    {item.location?.city || item.city || "-"}
                  </Text>
                  <Text style={{ color: "#23234B", fontSize: 14, marginBottom: 6 }}>
                    {item.date ? new Date(item.date).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" }) : ""}
                  </Text>
                  <Text style={{ color: "#23234B", fontSize: 14, marginBottom: 6 }}>
                    {item.category}
                  </Text>
                  <Text style={{ color: "#23234B", fontSize: 14, marginBottom: 6 }}>
                    {item.description}
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#FF8502",
                      borderRadius: 17,
                      paddingVertical: 4,
                      paddingHorizontal: 14,
                      alignSelf: "flex-end",
                      marginTop: 8,
                    }}
                    onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
                  >
                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Detay</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))}
    </ScrollView>
    {/* ... */}
  </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18183A', // Koyu arka plan
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#18183A',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 24,
    marginBottom: 14,
    backgroundColor: '#23234B', // Koyu bar
    borderRadius: 30,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  filterIcon: {
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#23234B',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 18,
    maxHeight: '75%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#FCA311',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
    color: '#fff',
  },
  filterHeaderSticky: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 10, 
    borderBottomWidth: 1, 
    borderColor: '#23234B', 
    paddingBottom: 8 
  },
  filterSearchRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#18183A', 
    borderRadius: 14, 
    paddingHorizontal: 10, 
    marginBottom: 14, 
    height: 38 
  },
  filterSearchInput: { 
    flex: 1, 
    fontSize: 15, 
    color: '#fff' 
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
    backgroundColor: '#23234B',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#23234B',
  },
  badgeSelected: {
    backgroundColor: '#FCA311',
    borderColor: '#FCA311',
  },
  badgeText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 6,
  },
  badgeTextSelected: {
    color: '#23234B',
    fontWeight: '700',
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23234B',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18183A',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#23234B',
  },
  dateInputText: {
    fontSize: 15,
    color: '#fff',
    marginLeft: 8,
  },
  filterModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: '#23234B',
    paddingTop: 15,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#23234B',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FCA311',
    fontWeight: '700',
    fontSize: 16,
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#FCA311',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#23234B',
    fontWeight: '700',
    fontSize: 16,
  },
  citySelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23234B',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 4,
    borderWidth: 0,
  },
  citySelectButtonText: {
    color: '#FCA311',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 15,
  },
  // Kategori badge stilleri
  categoryBadge: {
    backgroundColor: '#23234B',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryBadgeSelected: {
    backgroundColor: '#FCA311',
  },
  categoryBadgeText: {
    fontSize: 14,
    color: '#fff',
  },
  categoryBadgeTextSelected: {
    color: '#23234B',
    fontWeight: '600',
  },
  // Kart stilleri
  clubCard: {
    backgroundColor: '#23234B',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
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
    backgroundColor: '#18183A',
  },
  clubContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },
  clubTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FCA311',
    marginBottom: 4,
  },
  clubMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 10,
  },
  clubCategory: {
    backgroundColor: '#18183A',
    color: '#FCA311',
    fontWeight: '700',
    fontSize: 13,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  clubMembers: {
    color: '#fff',
    fontSize: 13,
  },
  clubEventCount: {
    backgroundColor: '#18183A',
    color: '#FCA311',
    fontWeight: '700',
    fontSize: 13,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  clubDesc: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  clubButton: {
    backgroundColor: '#FCA311',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
  },
  clubButtonText: {
    color: '#23234B',
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
    color: '#FCA311',
    fontSize: 14,
    fontWeight: '600',
  },
  igCard: {
    backgroundColor: '#23234B',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
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
    backgroundColor: '#FCA311',
    borderRadius: 20,
    padding: 5,
  },
  igTypeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FCA311',
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
    color: '#FCA311',
    marginBottom: 4,
  },
  igDesc: {
    color: '#fff',
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
    backgroundColor: '#18183A',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  igCategoryText: {
    color: '#FCA311',
    fontWeight: '700',
    fontSize: 13,
  },
  igMetaText: {
    color: '#fff',
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
    backgroundColor: '#18183A',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  igParticipantsText: {
    marginLeft: 6,
    color: '#FCA311',
    fontWeight: '700',
    fontSize: 13,
  },
  igDetailButton: {
    backgroundColor: '#FCA311',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  igDetailButtonText: {
    color: '#23234B',
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
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#18183A',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FCA311',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#23234B',
    fontWeight: '600',
    fontSize: 16,
  },
});

// Alt bar ve modal için örnek
function FloatingActionBar({ onCreateEvent, onCreateClub }) {
  const [modalVisible, setModalVisible] = React.useState(false);
  return (
    <>
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 32,
          alignSelf: "center",
          backgroundColor: "#FF8502",
          width: 64,
          height: 64,
          borderRadius: 32,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
          zIndex: 10,
        }}
        onPress={() => setModalVisible(true)}
      >
        <Feather name="plus" size={32} color="#fff" />
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.18)",
            justifyContent: "flex-end",
          }}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              marginHorizontal: 10,
              marginBottom: 24,
              elevation: 8,
            }}
          >
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}
              onPress={() => { setModalVisible(false); onCreateEvent && onCreateEvent(); }}
            >
              <Feather name="user" size={22} color="#6c5ce7" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 17, color: "#23234B" }}>Etkinlik Oluştur</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() => { setModalVisible(false); onCreateClub && onCreateClub(); }}
            >
              <Feather name="users" size={22} color="#6c5ce7" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 17, color: "#23234B" }}>Kulüp Oluştur</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}