import React, { useState } from 'react';
import axios from 'axios';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { API_BASE_URL, getCurrentUserId } from '../auth';

export default function CreateClubEventScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [group, setGroup] = useState('');
  const icon = 'users'; // Sabit icon
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [place, setPlace] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !group || !city || !district || !place || !date || !time) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/club-events`, {
        title,
        group,
        icon,
        city,
        district,
        place,
        date,
        time,
        user_id: getCurrentUserId(),
      });

      console.log('Sunucudan gelen cevap:', response.data);
      Alert.alert('Başarılı', 'Kulüp etkinliği başarıyla oluşturuldu!');
      navigation.goBack();
    } catch (error) {
      console.error('Hata:', error);
      Alert.alert('Hata', 'Etkinlik oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Etkinlik Başlığı</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Etkinlik başlığı girin"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Grup</Text>
          <TextInput
            style={styles.input}
            value={group}
            onChangeText={setGroup}
            placeholder="Kulüp/grup adı"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Şehir</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Şehir"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>İlçe</Text>
          <TextInput
            style={styles.input}
            value={district}
            onChangeText={setDistrict}
            placeholder="İlçe"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Yer</Text>
          <TextInput
            style={styles.input}
            value={place}
            onChangeText={setPlace}
            placeholder="Mekan / konum"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Tarih</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-AA-GG"
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1 }]}>
            <Text style={styles.label}>Saat</Text>
            <TextInput
              style={styles.input}
              value={time}
              onChangeText={setTime}
              placeholder="SS:dd"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Oluşturuluyor...' : 'Etkinliği Oluştur'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  createButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
