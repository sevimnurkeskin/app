import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Dimensions, 
  Animated, 
  Image,
  ScrollView,
  RefreshControl
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL, getCurrentUserId } from '../auth';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/tr';

const { width } = Dimensions.get('window');

export default function EventsScreen({ navigation, route }) {
  const [tab, setTab] = useState('created'); // 'created' | 'joined'
  const [createdEvents, setCreatedEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tabAnim] = useState(new Animated.Value(0));
  const [userId, setUserId] = useState('');

  const navRoute = useRoute();

  const fetchEvents = async () => {
    try {
      const currentUserId = await getCurrentUserId();
      const allRes = await axios.get(`${API_BASE_URL}/events`);

      const myCreatedEvents = allRes.data.filter(ev =>
        ev.creator_id && currentUserId && ev.creator_id.toString().trim() === currentUserId.toString().trim()
      );
      
      const myJoinedEvents = allRes.data.filter(ev => 
        ev.participants && ev.participants.some(p => p.user_id.toString().trim() === currentUserId.toString().trim())
      );

      setCreatedEvents(myCreatedEvents);
      setJoinedEvents(myJoinedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  // useFocusEffect ile her odaklanmada veya refresh parametresiyle fetchEvents tetikle
  useFocusEffect(
    React.useCallback(() => {
      if (navRoute.params && navRoute.params.refresh) {
        fetchEvents();
        // refresh parametresini sıfırla
        navigation.setParams({ refresh: false });
      } else {
        fetchEvents();
      }
    }, [navRoute.params?.refresh])
  );

  useEffect(() => {
    if (route.params?.tab) {
      setTab(route.params.tab);
    }
  }, [route.params]);

  // Tab bar animation
  useEffect(() => {
    Animated.spring(tabAnim, {
      toValue: tab === 'created' ? 0 : 1,
      useNativeDriver: false,
      friction: 7,
    }).start();
  }, [tab]);

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCardModern}
      activeOpacity={0.92}
      onPress={() => navigation.navigate('EventDetailScreen', { eventId: item.id })}
    >
      <View style={styles.eventImageWrapper}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.eventImageModern} />
        ) : (
          <View style={styles.eventImagePlaceholderModern}>
            <MaterialCommunityIcons name="calendar-star" size={38} color="#ea4c89" />
          </View>
        )}
      </View>
      <View style={styles.eventContentModern}>
        <Text style={styles.eventTitleModern} numberOfLines={1}>{item.title}</Text>
        <View style={styles.metaRowModern}>
          <Ionicons name="location-sharp" size={16} color="#6c757d" />
          <Text style={styles.eventMetaModern}>{item.city} / {item.district}</Text>
        </View>
        <View style={styles.metaRowModern}>
          <Ionicons name="calendar-sharp" size={16} color="#6c757d" />
          <Text style={styles.eventMetaModern}>{moment(item.date).locale('tr').format('DD MMMM YYYY')} • {item.time}</Text>
        </View>
        
        {item.category && (
          <View style={styles.categoryBadgeModern}>
            <Text style={styles.categoryTextModern}>{item.category}</Text>
          </View>
        )}
        {item.description ? (
          <Text style={styles.eventDescModern} numberOfLines={2}>{item.description}</Text>
        ) : null}
        <View style={styles.eventFooterModern}>
          <View style={styles.participantBoxModern}>
            <MaterialCommunityIcons name="groups" size={18} color="#a1c9ff" />
            <Text style={styles.participantCountModern}>{item.participants ? item.participants.length : 1} kişi</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Tab bar indicator animation
  const indicatorTranslate = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.5],
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <Animated.View
          style={[
            styles.tabIndicator,
            { transform: [{ translateX: indicatorTranslate }] },
          ]}
        />
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setTab('created')}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="create-outline" 
            size={20} 
            color={tab === 'created' ? '#6c5ce7' : '#adb5bd'} 
          />
          <Text style={[styles.tabText, tab === 'created' && styles.activeTabText]}>
            Oluşturduklarım
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setTab('joined')}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="people-outline" 
            size={20} 
            color={tab === 'joined' ? '#6c5ce7' : '#adb5bd'} 
          />
          <Text style={[styles.tabText, tab === 'joined' && styles.activeTabText]}>
            Katıldıklarım
          </Text>
        </TouchableOpacity>
      </View>

      {/* Event List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6c5ce7']}
            tintColor="#6c5ce7"
          />
        }
      >
        {tab === 'created' ? (
          createdEvents.length > 0 ? (
            <FlatList
              data={createdEvents}
              keyExtractor={item => item.id?.toString() || Math.random().toString()}
              renderItem={renderEventItem}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
              ListHeaderComponent={
                <Text style={styles.sectionHeader}>
                  Oluşturduğunuz Etkinlikler ({createdEvents.length})
                </Text>
              }
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="calendar-remove" 
                size={60} 
                color="#dee2e6" 
              />
              <Text style={styles.emptyText}>Henüz etkinlik oluşturmadınız</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CreateIndividualEventScreen')}
              >
                <Text style={styles.createButtonText}>Etkinlik Oluştur</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          joinedEvents.length > 0 ? (
            <FlatList
              data={joinedEvents}
              keyExtractor={item => item.id?.toString() || Math.random().toString()}
              renderItem={renderEventItem}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
              ListHeaderComponent={
                <Text style={styles.sectionHeader}>
                  Katıldığınız Etkinlikler ({joinedEvents.length})
                </Text>
              }
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="people-outline" 
                size={60} 
                color="#dee2e6" 
              />
              <Text style={styles.emptyText}>Henüz bir etkinliğe katılmadınız</Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.exploreButtonText}>Etkinlikleri Keşfet</Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </ScrollView>
      {/* Alt barda artı butonu */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateIndividualEventScreen')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
    height: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    zIndex: 2,
  },
  tabText: {
    fontSize: 15,
    color: '#adb5bd',
    fontWeight: '600',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#6c5ce7',
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.5 - 32,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 0,
    zIndex: 1,
    shadowColor: '#6c5ce7',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#495057',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    height: 140,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  eventImage: {
    width: 120,
    height: '100%',
    backgroundColor: '#e9ecef',
  },
  eventImagePlaceholder: {
    width: 120,
    height: '100%',
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#343a40',
    marginBottom: 4,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventMetaText: {
    fontSize: 13,
    color: '#6c757d',
    marginLeft: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3e8ff',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c5ce7',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorText: {
    fontSize: 12,
    color: '#495057',
    marginLeft: 6,
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 12,
    color: '#495057',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#adb5bd',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    fontWeight: '500',
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  exploreButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#6c5ce7',
  },
  exploreButtonText: {
    color: '#6c5ce7',
    fontWeight: '600',
    fontSize: 15,
  },
  eventCardModern: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 12,
    marginBottom: 14,
    shadowColor: '#6c5ce7',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  eventImageWrapper: {
    width: '100%',
    height: 110, // daha küçük yükseklik
    backgroundColor: '#f3e8ff',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    overflow: 'hidden',
  },
  eventImageModern: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventImagePlaceholderModern: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ea4c89',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContentModern: {
    padding: 12,
  },
  eventTitleModern: {
    fontSize: 16,
    fontWeight: '700',
    color: '#343a40',
    marginBottom: 2,
  },
  metaRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  eventMetaModern: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 5,
  },
  categoryBadgeModern: {
    alignSelf: 'flex-start',
    backgroundColor: '#ea4c89',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
    marginBottom: 4,
  },
  categoryTextModern: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
  eventDescModern: {
    fontSize: 13,
    color: '#444',
    marginTop: 2,
    fontStyle: 'italic',
  },
  eventFooterModern: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 6,
  },
  participantBoxModern: {
    flexDirection: 'row',
    backgroundColor: '#dceaff',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  participantCountModern: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#5a81cc',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});