import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL, getCurrentUserId } from '../auth';

export default function EditProfileScreen({ navigation }) {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [city, setCity] = useState("");
  const [interests, setInterests] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userId = await getCurrentUserId();
        const res = await axios.get(`${API_BASE_URL}/users/${userId}`);
        setNickname(res.data.nickname || "");
        setEmail(res.data.email || '');
        setCity(res.data.city || "");
        setInterests(res.data.interests || "");
      } catch (err) {
        Alert.alert('Hata', 'Profil bilgileri alınamadı.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const userId = await getCurrentUserId();
      await axios.put(`${API_BASE_URL}/users/${userId}`, {
        nickname: nickname.trim(),
        name: nickname.trim(),
        email,
        city: city || "",
        interests: interests || "",
      });
      Alert.alert('Başarılı', 'Profilin güncellendi!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', 'Profil güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !newPasswordRepeat) {
      Alert.alert("Eksik Bilgi", "Lütfen tüm alanları doldurun.");
      return;
    }
    if (newPassword !== newPasswordRepeat) {
      Alert.alert("Hata", "Yeni şifreler eşleşmiyor.");
      return;
    }
    setChangingPassword(true);
    try {
      const userId = await getCurrentUserId();
      await axios.post(`${API_BASE_URL}/users/${userId}/change-password`, {
        currentPassword,
        newPassword,
      });
      Alert.alert("Başarılı", "Şifreniz başarıyla değiştirildi.");
      setShowPasswordFields(false);
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordRepeat("");
    } catch (err) {
      Alert.alert("Hata", err.response?.data?.message || "Şifre değiştirilemedi.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#6a82fb" />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#fcb045", "#f8fafc", "#6a82fb"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inputCard}>
          <Text style={styles.label}>Kullanıcı Adı</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="Kullanıcı Adı"
            placeholderTextColor="#aaa"
            autoCapitalize="none"
          />
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#f1f3f5', color: '#888' }]}
            value={email}
            editable={false}
            selectTextOnFocus={false}
            placeholder="E-posta"
            placeholderTextColor="#aaa"
          />
          {/* Şehir ve ilgi alanları inputlarını kaldırıyorum, sadece state'te tutulacak, ekranda gösterilmeyecek. */}
          <TouchableOpacity
            style={[styles.saveButton, styles.secondaryButton, { backgroundColor: '#fff', borderWidth: 2, borderColor: '#6a82fb', marginTop: 14, paddingVertical: 10, borderRadius: 14 }]}
            onPress={() => setShowPasswordFields((prev) => !prev)}
          >
            <Text style={[styles.saveButtonText, { color: '#6a82fb', fontWeight: '700', fontSize: 15 }]}>Şifre Değiştir</Text>
          </TouchableOpacity>
          {showPasswordFields && (
            <View style={{ marginTop: 14 }}>
              <Text style={[styles.label, { fontSize: 16, marginBottom: 6 }]}>Şifre Değiştirin</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Mevcut Şifre"
                placeholderTextColor="#aaa"
                secureTextEntry
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Yeni Şifre"
                placeholderTextColor="#aaa"
                secureTextEntry
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                value={newPasswordRepeat}
                onChangeText={setNewPasswordRepeat}
                placeholder="Yeni Şifre (Tekrar)"
                placeholderTextColor="#aaa"
                secureTextEntry
                autoCapitalize="none"
              />
              <TouchableOpacity style={[styles.saveButton, { marginTop: 8, paddingVertical: 10, borderRadius: 14 }]} onPress={handleChangePassword} disabled={changingPassword}>
                <Text style={[styles.saveButtonText, { fontSize: 15 }]}>{changingPassword ? "Kaydediliyor..." : "Onayla"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Kaydet</Text>}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 24, paddingTop: 40, alignItems: 'center' },
  inputCard: { backgroundColor: '#fff', borderRadius: 18, padding: 18, width: '100%', marginBottom: 24, shadowColor: '#6a82fb', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  label: { fontWeight: '700', color: '#6a82fb', marginBottom: 6, fontSize: 15 },
  input: { backgroundColor: '#f8fafc', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: '#222', borderWidth: 1, borderColor: '#eee', marginBottom: 16 },
  inputBio: { minHeight: 60, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#6a82fb', borderRadius: 18, paddingVertical: 16, alignItems: 'center', marginTop: 10, width: '100%', shadowColor: '#6a82fb', shadowOpacity: 0.18, shadowRadius: 8, elevation: 2 },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  inputDescription: { fontSize: 13, color: '#6a82fb', marginBottom: 4, marginTop: -2 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    alignItems: 'center',
  },
  secondaryButton: { paddingVertical: 10, borderRadius: 14, minWidth: 120 },
});