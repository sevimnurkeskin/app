// frontend/screens/App.js
import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MenuProvider } from 'react-native-popup-menu';

import EventDetailScreen from './EventDetailScreen';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import HomeScreen from './HomeScreen';
import EventsScreen from './EventsScreen';
import CreateIndividualEventScreen from './CreateIndividualEventScreen';
import CreateClubEventScreen from './CreateClubEventScreen';
import CreateClubScreen from './CreateClubScreen';
import ProfileScreen from './ProfileScreen';
import NotificationsScreen from './NotificationsScreen';
import EditProfileScreen from './EditProfileScreen';  // <-- BURAYA EKLE
import ClubDetailScreen from './ClubDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const EmptyScreen = () => null;

const MainTabs = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => {
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const goToCreateIndividualEvent = () => {
    closeMenu();
    navigation.navigate('CreateIndividualEventScreen');
  };

  const goToCreateClub = () => {
    closeMenu();
    navigation.navigate('CreateClubScreen');
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          tabBarStyle: { height: 60, paddingBottom: 5 },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Events':
                iconName = focused ? 'calendar' : 'calendar-outline';
                break;
              case 'Notifications':
                iconName = focused ? 'notifications' : 'notifications-outline';
                break;
              case 'Profile':
                iconName = focused ? 'person' : 'person-outline';
                break;
              default:
                iconName = null;
            }
            if (route.name === 'Add') return null;
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Events" component={EventsScreen} />
        <Tab.Screen
          name="Add"
          component={EmptyScreen}
          options={{
            tabBarButton: (props) => (
              <TouchableOpacity
                {...props}
                style={styles.addButtonContainer}
                onPress={openMenu}
              >
                <View style={styles.addButton}>
                  <Ionicons name="add" size={36} color="white" />
                </View>
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen name="Notifications" component={NotificationsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeMenu}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={goToCreateIndividualEvent}
            >
              <Ionicons name="person-outline" size={20} color="#4f46e5" />
              <Text style={styles.menuText}>Etkinlik Oluştur</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={goToCreateClub}
            >
              <Ionicons name="people-outline" size={20} color="#4f46e5" />
              <Text style={styles.menuText}>Kulüp Oluştur</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default function App() {
  return (
    <MenuProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LoginScreen">
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Kayıt Ol', headerBackTitle: 'Geri' }}
          />
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EditProfileScreen"   // <-- BURAYI EKLEDİK
            component={EditProfileScreen}
            options={{ title: 'Profilimi Düzenle', headerBackTitle: 'Geri' }}
          />
          <Stack.Screen
            name="CreateIndividualEventScreen"
            component={CreateIndividualEventScreen}
            options={{ title: 'Bireysel Etkinlik Oluştur', headerBackTitle: 'Geri' }}
          />
          <Stack.Screen
            name="CreateClubEventScreen"
            component={CreateClubEventScreen}
            options={{ title: 'Kulüp Etkinliği Oluştur', headerBackTitle: 'Geri' }}
          />
          <Stack.Screen
            name="CreateClubScreen"
            component={CreateClubScreen}
            options={{ title: 'Kulüp Oluştur', headerBackTitle: 'Geri' }}
          />
          <Stack.Screen
            name="EventDetailScreen"
            component={EventDetailScreen}
            options={{ title: 'Etkinlik Detayı', headerBackTitle: 'Geri' }}
          />
          <Stack.Screen
            name="ClubDetail"
            component={ClubDetailScreen}
            options={{ title: 'Kulüp Detayı', headerBackTitle: 'Geri' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 18,
    marginLeft: 10,
    color: '#1e293b',
  },
});