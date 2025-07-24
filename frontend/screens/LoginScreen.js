import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL } from '../auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Lütfen email ve şifrenizi girin.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const data = response.data;

      setUsername(data.user?.name || '');
      setModalVisible(true);

      await AsyncStorage.setItem('user_id', String(data.user.id));

      setTimeout(() => {
        setModalVisible(false);
        navigation.replace('MainTabs');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.error || 'Giriş başarısız';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#a8dadc', '#fcbf49']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        style={styles.innerContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Ionicons
          name="sparkles-outline"
          size={50}
          color="#ffffffdd"
          style={{ marginBottom: 12 }}
        />
        <Text style={styles.title}>Hoşgeldin 👋</Text>
        <Text style={styles.subtitle}>Giriş yap ve keşfetmeye başla</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#aaa"
          />
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          style={styles.loginButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.registerButton}
        >
          <Text style={styles.registerButtonText}>Hesabın yok mu? Kayıt Ol</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <LinearGradient
          colors={['#fcbf49cc', '#a8dadccc']}
          style={styles.modalContainer}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>🎉 Hoşgeldin {username}!</Text>
          </View>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 34,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 16,
    color: '#fefae0',
    marginBottom: 20,
    fontWeight: '500',
  },
  errorText: {
    color: '#ff4d4f',
    backgroundColor: '#ffffffbb',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginTop: 20,
  },
  input: {
    backgroundColor: '#ffffffee',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#f77f00',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  registerButton: {
    marginTop: 20,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000033',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 18,
    elevation: 5,
  },
  modalText: {
    fontSize: 20,
    color: '#f77f00',
    fontWeight: 'bold',
  },
});
