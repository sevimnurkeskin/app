import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL } from '../auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    district: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) newErrors.username = 'Kullanıcı adı gereklidir';
    if (!formData.email.trim()) newErrors.email = 'Email gereklidir';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Geçerli bir email adresi girin';
    if (!formData.password) newErrors.password = 'Şifre gereklidir';
    else if (formData.password.length < 6) newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    if (!formData.city.trim()) newErrors.city = 'Şehir gereklidir';
    if (!formData.district.trim()) newErrors.district = 'İlçe gereklidir';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: formData.username,
        email: formData.email,
        password: formData.password,
        city: formData.city,
        district: formData.district
      });
      const data = response.data;

      // EKLE!
      await AsyncStorage.setItem('user_id', data.user.id);

      Alert.alert(
        'Başarılı',
        'Kayıt işlemi tamamlandı. Giriş yapabilirsiniz.',
        [
          { 
            text: 'Tamam', 
            onPress: () => navigation.replace('LoginScreen') 
          }
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Hata',
        error.response?.data?.error || 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#aee1f9', '#fdd9a0']} style={styles.gradient}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Ionicons name="person-add" size={40} color="#3a86ff" />
            <Text style={styles.title}>Yeni Hesap Oluştur</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.username && styles.errorInput]}
              placeholder="Kullanıcı Adı"
              value={formData.username}
              onChangeText={(text) => handleInputChange('username', text)}
              autoCapitalize="none"
            />
            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

            <TextInput
              style={[styles.input, errors.email && styles.errorInput]}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <TextInput
              style={[styles.input, errors.password && styles.errorInput]}
              placeholder="Şifre"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              secureTextEntry
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <TextInput
              style={[styles.input, errors.confirmPassword && styles.errorInput]}
              placeholder="Şifreyi Tekrar Girin"
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              secureTextEntry
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            <TextInput
              style={[styles.input, errors.city && styles.errorInput]}
              placeholder="Şehir"
              value={formData.city}
              onChangeText={(text) => handleInputChange('city', text)}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

            <TextInput
              style={[styles.input, errors.district && styles.errorInput]}
              placeholder="İlçe"
              value={formData.district}
              onChangeText={(text) => handleInputChange('district', text)}
            />
            {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}
          </View>

          <TouchableOpacity 
            onPress={handleSignUp} 
            style={styles.button}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('LoginScreen')}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>
              Zaten hesabınız var mı? <Text style={styles.loginLinkText}>Giriş Yap</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  inner: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
    marginBottom: 30,
    fontFamily: 'System',
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  button: {
    marginTop: 30,
    backgroundColor: '#ffa75d',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#333',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
