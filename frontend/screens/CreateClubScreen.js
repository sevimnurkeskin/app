import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  KeyboardAvoidingView, Platform, ScrollView, Image, Switch
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { API_BASE_URL, getCurrentUserId } from '../auth';

const categories = [
  { label: '🌟 Genel', value: 'genel' },
  { label: '🎨 Sanat', value: 'sanat' },
  { label: '💻 Yazılım', value: 'yazilim' },
  { label: '⚽ Spor', value: 'spor' },
  { label: '📚 Kitap', value: 'kitap' },
  { label: '🎮 Oyun', value: 'oyun' },
  { label: '🎵 Müzik', value: 'muzik' },
  { label: '🌱 Doğa', value: 'dogal' },
  { label: '✈️ Seyahat', value: 'seyahat' },
  { label: '🍳 Yemek', value: 'yemek' },
  { label: '🧘 Kişisel Gelişim', value: 'gelisim' },
  { label: '🧪 Bilim', value: 'bilim' },
  { label: '🗣️ Tartışma', value: 'tartisma' },
  { label: '🔗 Diğer', value: 'diger' },
];

export default function CreateClubScreen({ navigation }) {
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [clubRules, setClubRules] = useState('');
  const [location, setLocation] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeriye erişmek için izin vermeniz gerekiyor.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!clubName.trim() || !clubDescription.trim() || !selectedCategory || !imageUri) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    setLoading(true);

    // DÜZELTME: userId'yi await ile al
    const userId = await getCurrentUserId();

    const clubData = {
      name: clubName,
      description: clubDescription,
      city: location,
      category: selectedCategory,
      creator_id: userId, // Artık gerçek UUID!
      cover_image: imageUri,
      is_approval_needed: isPrivate,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/clubs`, clubData);
      const data = response.data;
      Alert.alert('Başarılı', `"${data.name}" kulübü oluşturuldu!`);
      navigation.goBack();
    } catch (error) {
      console.error('İstek hatası:', error);
      Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.imagePlaceholder}>+ Kulüp Resmi Ekle</Text>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Kulüp Adı"
          placeholderTextColor="#777"
          value={clubName}
          onChangeText={setClubName}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Kulüp Açıklaması"
          placeholderTextColor="#777"
          value={clubDescription}
          onChangeText={setClubDescription}
          multiline
        />

        <Text style={styles.sectionLabel}>Kategori Seç</Text>
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryButton,
                selectedCategory === cat.value && styles.categorySelected,
              ]}
              onPress={() => setSelectedCategory(cat.value)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat.value && styles.categoryTextSelected,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Lokasyon (şehir/semt)</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: İstanbul, Kadıköy"
          placeholderTextColor="#777"
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.sectionLabel}>Kulüp Kuralları (isteğe bağlı)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Kurallarınızı buraya yazabilirsiniz..."
          placeholderTextColor="#777"
          value={clubRules}
          onChangeText={setClubRules}
          multiline
        />

        <View style={styles.privacyRow}>
          <Text style={styles.privacyLabel}>
            {isPrivate ? '🔒 Özel Kulüp' : '🌍 Herkese Açık Kulüp'}
          </Text>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            thumbColor={isPrivate ? '#ff6a00' : '#1e90ff'}
            trackColor={{ false: '#d1d5db', true: '#fecaca' }}
          />
        </View>

        <TouchableOpacity
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.9}
          style={styles.buttonWrapper}
        >
          <LinearGradient
            colors={loading ? ['#aaa', '#bbb'] : ['#ff6a00', '#1e90ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Oluşturuluyor...' : 'Kulübü Oluştur'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scrollContainer: { padding: 24, paddingTop: 50 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePicker: {
    backgroundColor: '#e5e7eb',
    height: 180,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    fontSize: 16,
    color: '#6b7280',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10,
  },
  categoryButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categorySelected: {
    backgroundColor: '#1e90ff',
  },
  categoryText: {
    fontSize: 16,
    color: '#374151',
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  buttonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 50,
  },
  button: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});

