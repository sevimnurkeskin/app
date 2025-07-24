import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Image, FlatList, Dimensions
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL, getCurrentUserId } from '../auth';

const screenWidth = Dimensions.get('window').width;

const sampleImages = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1543965176-48e85a6d8c99?auto=format&fit=crop&w=800&q=80',
];

export default function CreateEventScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [place, setPlace] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(sampleImages[0]);

  const handleSubmit = async () => {
    if (!getCurrentUserId()) {
      Alert.alert('Hata', 'Etkinlik oluşturmak için giriş yapmalısınız!');
      return;
    }
    if (!title.trim() || !city.trim() || !district.trim() || !place.trim() || !date.trim() || !time.trim()) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun!');
      return;
    }
    setLoading(true);
    try {
      const eventData = {
        title,
        description,
        city,
        district,
        location: place,
        date,
        time,
        ownerId: getCurrentUserId(),
        image: selectedImage,
      };
      const response = await axios.post(`${API_BASE_URL}/events`, eventData);
      Alert.alert('Başarılı', 'Etkinlik başarıyla oluşturuldu!');
      navigation.goBack();
    } catch (error) {
      console.error('Etkinlik oluşturulurken hata:', error);
      Alert.alert('Hata', 'Etkinlik oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderImageItem = ({ item }) => {
    const isSelected = item === selectedImage;
    return (
      <TouchableOpacity 
        onPress={() => setSelectedImage(item)} 
        activeOpacity={0.8} 
        style={[styles.thumbnailWrapper, isSelected && styles.selectedThumbnailWrapper]}
      >
        <Image source={{ uri: item }} style={styles.thumbnail} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Etkinlik Fotoğrafı Seç</Text>

        <FlatList
          data={sampleImages}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={renderImageItem}
          contentContainerStyle={{ paddingBottom: 15 }}
        />

        <View style={styles.imagePreviewWrapper}>
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Etkinlik Adı <Text style={{color:'#ea4c89'}}>*</Text></Text>
          <TextInput 
            style={styles.input} 
            placeholder="Etkinlik adını girin" 
            placeholderTextColor="#b0b0b0" 
            value={title} 
            onChangeText={setTitle} 
            selectionColor="#ea4c89"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Etkinlik Açıklaması</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Açıklama girin"
            placeholderTextColor="#b0b0b0"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            selectionColor="#ea4c89"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.flex1, { marginRight: 10 }]}>
            <Text style={styles.label}>İl <Text style={{color:'#ea4c89'}}>*</Text></Text>
            <TextInput 
              style={styles.input} 
              placeholder="İl girin" 
              placeholderTextColor="#b0b0b0" 
              value={city} 
              onChangeText={setCity} 
              selectionColor="#ea4c89"
            />
          </View>

          <View style={[styles.inputContainer, styles.flex1, { marginRight: 10 }]}>
            <Text style={styles.label}>İlçe <Text style={{color:'#ea4c89'}}>*</Text></Text>
            <TextInput 
              style={styles.input} 
              placeholder="İlçe girin" 
              placeholderTextColor="#b0b0b0" 
              value={district} 
              onChangeText={setDistrict} 
              selectionColor="#ea4c89"
            />
          </View>

          <View style={[styles.inputContainer, styles.flex1]}>
            <Text style={styles.label}>Yer <Text style={{color:'#ea4c89'}}>*</Text></Text>
            <TextInput 
              style={styles.input} 
              placeholder="Yer girin" 
              placeholderTextColor="#b0b0b0" 
              value={place} 
              onChangeText={setPlace} 
              selectionColor="#ea4c89"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.flex1, { marginRight: 10 }]}>
            <Text style={styles.label}>Tarih <Text style={{color:'#ea4c89'}}>*</Text></Text>
            <TextInput 
              style={styles.input} 
              placeholder="gg.aa.yyyy" 
              placeholderTextColor="#b0b0b0" 
              value={date} 
              onChangeText={setDate} 
              selectionColor="#ea4c89"
            />
          </View>

          <View style={[styles.inputContainer, styles.flex1]}>
            <Text style={styles.label}>Saat <Text style={{color:'#ea4c89'}}>*</Text></Text>
            <TextInput 
              style={styles.input} 
              placeholder="ss:dd" 
              placeholderTextColor="#b0b0b0" 
              value={time} 
              onChangeText={setTime} 
              selectionColor="#ea4c89"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.createButton, loading && { backgroundColor: '#f7a8b8' }]} 
          disabled={loading} 
          activeOpacity={0.8} 
          onPress={handleSubmit}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Oluşturuluyor...' : 'Oluştur'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 10,
  },
  thumbnailWrapper: {
    marginRight: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    shadowColor: '#ea4c89',
    shadowOpacity: 0,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 0,
  },
  selectedThumbnailWrapper: {
    borderColor: '#ea4c89',
    shadowOpacity: 0.4,
    elevation: 5,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 14,
  },
  imagePreviewWrapper: {
    width: screenWidth - 40,
    height: (screenWidth - 40) * 0.55,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 25,
    alignSelf: 'center',
    shadowColor: '#ea4c89',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222',
    shadowColor: '#ea4c89',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  createButton: {
    backgroundColor: '#ea4c89',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#ea4c89',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.8,
  },
});
