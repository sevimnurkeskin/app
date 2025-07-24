// frontend/auth.js

import AsyncStorage from '@react-native-async-storage/async-storage';

export const getCurrentUserId = async () => {
  return await AsyncStorage.getItem('user_id');
};

export const getCurrentUserToken = () => {
  return 'mocked_token'; // Token gerekiyorsa burada JWT veya başka token olabilir
};

// API base URL (tüm isteklerde kullanılacak)
export const API_BASE_URL = "http://192.168.1.78:3000";
export const AUTH_API_URL = 'http://192.168.1.78:3000/api/auth';