import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Image, FlatList, Dimensions, Modal, ActivityIndicator, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { API_BASE_URL, getCurrentUserId } from '../auth';

const screenWidth = Dimensions.get('window').width;

const CATEGORY_COLORS = [
  '#ea4c89', '#5f6caf', '#f7b731', '#20bf6b', '#8854d0', '#fd9644', '#26de81', '#2d98da', '#eb3b5a', '#45aaf2'
];



// Alt kategoriler
const SUBCATEGORIES = {
  genel: ['Duyuru', 'Toplantı', 'Sosyal Buluşma', 'Yardımlaşma', 'Tanışma', 'Diğer'],
  sanat: ['Resim', 'Heykel', 'Fotoğraf', 'Tiyatro', 'Sinema', 'Edebiyat', 'El Sanatları', 'Sergi', 'Workshop', 'Diğer'],
  yazilim: ['Frontend', 'Backend', 'Mobil Geliştirme', 'Oyun Programlama', 'Yapay Zeka', 'Veri Bilimi', 'Web Geliştirme', 'Siber Güvenlik', 'Diğer'],
  spor: ['Futbol', 'Basketbol', 'Voleybol', 'Tenis', 'Yüzme', 'Koşu', 'Fitness', 'Yoga', 'Doğa Sporları', 'E-Spor', 'Diğer'],
  kitap: ['Roman', 'Şiir', 'Kişisel Gelişim', 'Felsefe', 'Bilim Kurgu', 'Tartışma', 'Okuma Grubu', 'Yazar Buluşması', 'Diğer'],
  oyun: ['Bilgisayar Oyunları', 'Konsol Oyunları', 'Masaüstü Oyunlar', 'Mobil Oyunlar', 'Turnuva', 'Satranç', 'Zeka Oyunları', 'Diğer'],
  muzik: ['Rock', 'Pop', 'Caz', 'Klasik', 'Rap', 'Elektronik', 'Türk Halk', 'Enstrümantal', 'Konser', 'Jam Session', 'Diğer'],
  dogal: ['Kamp', 'Doğa Yürüyüşü', 'Çevre Temizliği', 'Bahçe', 'Ekoloji', 'Hayvanlar', 'Gönüllülük', 'Diğer'],
  seyahat: ['Kültür Turu', 'Doğa Gezisi', 'Yurtdışı', 'Şehir Turu', 'Kamp', 'Gezi Planlama', 'Diğer'],
  yemek: ['Dünya Mutfağı', 'Tatlı', 'Vegan', 'Deniz Ürünleri', 'Hamur İşi', 'Mutfak Atölyesi', 'Yemek Yarışması', 'Diğer'],
  gelisim: ['Motivasyon', 'Psikoloji', 'Kariyer', 'Sağlık', 'Zihin Haritalama', 'Meditasyon', 'Workshop', 'Diğer'],
  bilim: ['Fizik', 'Kimya', 'Biyoloji', 'Matematik', 'Teknoloji', 'Astronomi', 'Bilim Sohbeti', 'Deney', 'Diğer'],
  tartisma: ['Güncel', 'Felsefe', 'Politika', 'Tarih', 'Toplumsal', 'Forum', 'Panel', 'Diğer'],
  diger: ['Diğer'],
};


export default function CreateIndividualEventScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [place, setPlace] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([
    { name: ' Genel', icon: '🌟' },
    { name: ' Sanat', icon: '🎨' },
    { name: ' Yazılım', icon: '💻' },
    { name: ' Spor', icon: '⚽' },
    { name: ' Kitap', icon: '📚' },
    { name: ' Oyun', icon: '🎮' },
    { name: ' Müzik', icon: '🎵' },
    { name: ' Doğa', icon: '��' },
    { name: ' Seyahat', icon: '✈️' },
    { name: ' Yemek', icon: '🍳' },
    { name: ' Kişisel Gelişim', icon: '🧘' },
    { name: ' Bilim', icon: '🧪' },
    { name: ' Tartışma', icon: '🗣️' },
    { name: ' Diğer', icon: '🔗' },
  ]);
  const [cities, setCities] = useState([]);
  const [districtsByCity, setDistrictsByCity] = useState({});
  const [createdEvents, setCreatedEvents] = useState([]);
  const [userId, setUserId] = useState('');
  const [clubModalVisible, setClubModalVisible] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  useEffect(() => {
    const loadCitiesAndDistricts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/locations`);
        setCities(response.data.cities);
        setDistrictsByCity(response.data.districtsByCity);
      } catch (error) {
        setCities([ "Adana","Adıyaman","Afyonkarahisar","Ağrı","Aksaray","Amasya","Ankara","Antalya","Ardahan",
          "Artvin","Aydın","Balıkesir","Bartın","Batman","Bayburt","Bilecik","Bingöl","Bitlis",
          "Bolu","Burdur","Bursa","Çanakkale","Çankırı","Çorum","Denizli","Diyarbakır","Düzce",
          "Edirne","Elazığ","Erzincan","Erzurum","Eskişehir","Gaziantep","Giresun","Gümüşhane",
          "Hakkari","Hatay","Iğdır","Isparta","İstanbul","İzmir","Kahramanmaraş","Karabük",
          "Karaman","Kars","Kastamonu","Kayseri","Kırıkkale","Kırklareli","Kırşehir","Kilis",
          "Kocaeli","Konya","Kütahya","Malatya","Manisa","Mardin","Mersin","Muğla","Muş",
          "Nevşehir","Niğde","Ordu","Osmaniye","Rize","Sakarya","Samsun","Siirt","Sinop",
          "Sivas","Şanlıurfa","Şırnak","Tekirdağ","Tokat","Trabzon","Tunceli","Uşak",
          "Van","Yalova","Yozgat","Zonguldak"
        ]);
        setDistrictsByCity({
          "Adana": ["Aladağ","Ceyhan","Çukurova","Feke","İmamoğlu","Karaisalı","Saimbeyli","Sarıçam","Seyhan","Tufanbeyli","Yumurtalık","Yüreğir"].sort(),
  "Adıyaman": ["Besni","Çelikhan","Gerger","Gölbaşı","Kahta","Samsat","Sincik","Tut"].sort(),
  "Afyonkarahisar": ["Başmakçı","Bayat","Bolvadin","Çay","Çobanlar","Dazkırı","Dinar","Emirdağ","Evciler","Hocalar","İhsaniye","İscehisar","Kızılören","Sandıklı","Sinanpaşa","Sultandağı","Şuhut"].sort(),
  "Ağrı": ["Diyadin","Doğubayazıt","Eleşkirt","Hamur","Patnos","Taşlıçay","Tutak"].sort(),
  "Aksaray": ["Ağaçören","Eskil","Gülağaç","Güzelyurt","Ortaköy","Sarıyahşi"].sort(),
  "Amasya": ["Göynücek","Gümüşhacıköy","Hamamözü","Merzifon","Suluova","Taşova"].sort(),
  "Ankara": ["Akyurt","Altındağ","Ayaş","Bala","Çamlıdere","Çankaya","Çubuk","Elmadağ","Etimesgut","Gölbaşı","Güdül","Haymana","Kazan","Kalecik","Keçiören","Kızılcahamam","Mamak","Nallıhan","Polatlı","Sincan","Şereflikoçhisar","Yenimahalle"].sort(),
  "Antalya": ["Akseki","Alanya","Döşemealtı","Elmalı","Finike","Gazipaşa","Gündoğmuş","İbradı","Kaş","Kemer","Konyaaltı","Korkuteli","Kumluca","Manavgat","Serik"].sort(),
  "Ardahan": ["Çıldır","Damal","Göle","Hanak","Posof"].sort(),
  "Artvin": ["Ardanuç","Arhavi","Borçka","Hopa","Murgul","Şavşat","Yusufeli"].sort(),
  "Aydın": ["Bozdoğan","Buharkent","Çine","Didim","Efeler","Germencik","İncirliova","Karacasu","Karpuzlu","Koçarlı","Kuşadası","Kuyucak","Nazilli","Söke","Sultanhisar","Yenipazar"].sort(),
  "Balıkesir": ["Altıeylül","Ayvalık","Balya","Bandırma","Bigadiç","Burhaniye","Dursunbey","Edremit","Erdek","Gömeç","Gönen","Havran","İvrindi","Karesi","Kepsut","Manyas","Marmara","Savaştepe","Sındırgı"].sort(),
  "Bartın": ["Amasra","Kurucaşile","Ulus"].sort(),
  "Batman": ["Beşiri","Gercüş","Hasankeyf","Kozluk","Sason"].sort(),
  "Bayburt": ["Aydıntepe","Demirözü"].sort(),
  "Bilecik": ["Bozüyük","Gölpazarı","Osmaneli","Pazaryeri","Söğüt","Yenipazar"].sort(),
  "Bingöl": ["Adaklı","Genç","Karlıova","Kiğı","Solhan","Yayladere","Yedisu"].sort(),
  "Bitlis": ["Adilcevaz","Ahlat","Güroymak","Hizan","Mutki","Tatvan"].sort(),
  "Bolu": ["Dörtdivan","Gerede","Göynük","Kıbrıscık","Mengen","Mudurnu","Seben","Yeniçağa"].sort(),
  "Burdur": ["Ağlasun","Bucak","Çavdır","Çeltikçi","Gölhisar","Karamanlı","Kemer","Tefenni","Yeşilova"].sort(),
  "Bursa": ["Gemlik","İnegöl","İznik","Karacabey","Keles","Mudanya","Mustafakemalpaşa","Nilüfer","Orhaneli","Orhangazi","Osmangazi","Yenişehir","Yıldırım"].sort(),
  "Çanakkale": ["Ayvacık","Bayramiç","Biga","Bozcaada","Çan","Eceabat","Ezine","Gelibolu","Gökçeada","Lapseki","Yenice"].sort(),
  "Çankırı": ["Atkaracalar","Bayramören","Çerkeş","Eldivan","Ilgaz","Kızılırmak","Korgun","Kurşunlu","Orta","Şabanözü","Yapraklı"].sort(),
  "Çorum": ["Alaca","Bayat","Boğazkale","Dodurga","İskilip","Kargı","Laçin","Mecitözü","Ortaköy","Osmancık","Sungurlu","Uğurludağ"].sort(),
  "Denizli": ["Acıpayam","Babadağ","Baklan","Bekilli","Buldan","Çal","Çameli","Çardak","Çivril","Güney","Honaz","Kale","Sarayköy","Serinhisar","Tavas"].sort(),
  "Diyarbakır": ["Bağlar","Bismil","Çermik","Çınar","Çüngüş","Dicle","Eğil","Ergani","Hani","Hazro","Kulp","Lice","Silvan","Sur"].sort(),
  "Düzce": ["Akçakoca","Cumayeri","Çilimli","Gölyaka","Gümüşova","Kaynaşlı","Yığılca"].sort(),
  "Edirne": ["Enez","Havsa","İpsala","Lalapaşa","Meriç","Süloğlu","Uzunköprü"].sort(),
  "Elazığ": ["Ağın","Alacakaya","Arıcak","Baskil","Karakoçan","Keban","Maden","Palu","Sivrice"].sort(),
  "Erzincan": ["Çayırlı","İliç","Kemah","Kemaliye","Refahiye","Tercan","Üzümlü"].sort(),
  "Erzurum": ["Aşkale","Aziziye","Çat","Hınıs","Horasan","İspir","Karayazı","Karaçoban","Narman","Olur","Pasinler","Şenkaya","Tekman","Tortum","Uzundere"].sort(),
  "Eskişehir": ["Alpu","Beylikova","Çifteler","Günyüzü","Han","İnönü","Mahmudiye","Mihalgazi","Mihalıççık","Odunpazarı","Sarıcakaya","Tepebaşı"].sort(),
  "Gaziantep": ["Araban","İslahiye","Nizip","Oğuzeli","Yavuzeli"].sort(),
  "Giresun": ["Alucra","Bulancak","Çamoluk","Çanakçı","Dereli","Doğankent","Espiye","Eynesil","Görele","Güce","Keşap","Piraziz","Şebinkarahisar","Tirebolu","Yağlıdere"].sort(),
  "Gümüşhane": ["Kelkit","Köse","Şiran","Torul"].sort(),
  "Hakkari": ["Çukurca","Şemdinli","Yüksekova"].sort(),
  "Hatay": ["Altınözü","Arsuz","Defne","Dörtyol","Erzin","Hassa","İskenderun","Kırıkhan","Payas","Reyhanlı","Samandağ","Yayladağı"].sort(),
  "Iğdır": ["Aralık","Karakoyunlu","Tuzluca"].sort(),
  "Isparta": ["Aksu","Atabey","Eğirdir","Gelendost","Gönen","Senirkent","Sütçüler","Şarkikaraağaç","Uluborlu","Yalvaç","Yenişarbademli"].sort(),
  "İstanbul": ["Adalar","Arnavutköy","Ataşehir","Avcılar","Bağcılar","Bahçelievler","Bakırköy","Başakşehir","Bayrampaşa","Beşiktaş","Beykoz","Beylikdüzü","Beyoğlu","Büyükçekmece","Çatalca","Çekmeköy","Esenler","Esenyurt","Eyüpsultan","Fatih","Gaziosmanpaşa","Güngören","Kadıköy","Kağıthane","Kartal","Küçükçekmece","Maltepe","Pendik","Sancaktepe","Sarıyer","Silivri","Sultanbeyli","Sultangazi","Şile","Şişli","Tuzla","Ümraniye","Üsküdar","Zeytinburnu"].sort(),
  "İzmir": ["Aliağa","Balçova","Bayındır","Bayraklı","Bergama","Beydağ","Bornova","Buca","Çeşme","Çiğli","Dikili","Foça","Gaziemir","Güzelbahçe","Karabağlar","Karşıyaka","Kınık","Kiraz","Konak","Menderes","Menemen","Narlıdere","Ödemiş","Seferihisar","Selçuk","Tire","Torbalı","Urla"].sort(),
  "Kahramanmaraş": ["Afşin","Andırın","Çağlayancerit","Dulkadiroğlu","Ekinözü","Elbistan","Göksun","Onikişubat","Pazarcık","Türkoğlu"].sort(),
  "Karabük": ["Eflani","Eskipazar","Ovacık","Safranbolu","Yenice"].sort(),
  "Karaman": ["Ayrancı","Başyayla","Ermenek","Kazımkarabekir"].sort(),
  "Kars": ["Akyaka","Arpaçay","Digor","Kağızman","Sarıkamış","Selim","Susuz"].sort(),
  "Kastamonu": ["Abana","Ağlı","Araç","Azdavay","Bozkurt","Cide","Çatalzeytin","Daday","Devrekani","Doğanyurt","Hanönü","İnebolu","İhsangazi","Küre","Pınarbaşı","Şenpazar","Taşköprü","Tosya"].sort(),
  "Kayseri": ["Akkışla","Bünyan","Develi","Felahiye","İncesu","Kocasinan","Melikgazi","Özvatan","Sarıoğlan","Sarız","Talas","Tomarza","Yahyalı","Yeşilhisar"].sort(),
  "Kırıkkale": ["Bahşili","Balışeyh","Çelebi","Delice","Karakeçili","Sulakyurt","Yahşihan"].sort(),
  "Kırklareli": ["Babaeski","Demirköy","Kofçaz","Lüleburgaz","Pehlivanköy","Pınarhisar","Vize"].sort(),
  "Kırşehir": ["Akçakent","Akpınar","Boztepe","Çiçekdağı","Kaman","Mucur"].sort(),
  "Kilis": ["Elbeyli","Musabeyli","Polateli"].sort(),
  "Kocaeli": ["Başiskele","Çayırova","Darıca","Derince","Dilovası","Gebze","Gölcük","Kandıra","Kartepe","Körfez"].sort(),
  "Konya": ["Akşehir","Beyşehir","Bozkır","Cihanbeyli","Çumra","Derbent","Derebucak","Doğanhisar","Emirgazi","Ereğli","Güneysınır","Hadim","Ilgın","Kadınhanı","Karatay","Kulu","Meram","Sarayönü","Selçuklu","Seydişehir","Taşkent","Yalıhüyük","Yunak"].sort(),
  "Kütahya": ["Altıntaş","Aslanapa","Çavdarhisar","Domaniç","Emet","Gediz","Hisarcık","Pazarlar","Şaphane","Simav","Tavşanlı"].sort(),
  "Malatya": ["Akçadağ","Arapgir","Arguvan","Battalgazi","Darende","Doğanşehir","Hekimhan","Kale","Kuluncak","Pütürge","Yazıhan","Yeşilyurt"].sort(),
  "Manisa": ["Ahmetli","Akhisar","Alaşehir","Demirci","Gördes","Kırkağaç","Kula","Salihli","Sarıgöl","Saruhanlı","Selendi","Soma","Turgutlu","Yunusemre"].sort(),
  "Mardin": ["Dargeçit","Derik","Kızıltepe","Mazıdağı","Midyat","Nusaybin","Ömerli","Savur"].sort(),
  "Mersin": ["Akdeniz","Anamur","Aydıncık","Bozyazı","Çamlıyayla","Erdemli","Gülnar","Mezitli","Mut","Silifke","Tarsus","Toroslar","Yenişehir"].sort(),
  "Muğla": ["Bodrum","Dalaman","Datça","Fethiye","Kavaklıdere","Marmaris","Menteşe","Ortaca","Ula","Yatağan"].sort(),
  "Muş": ["Bulanık","Hasköy","Korkut","Malazgirt","Varto"].sort(),
  "Nevşehir": ["Acıgöl","Avanos","Derinkuyu","Gülşehir","Hacıbektaş","Kozaklı","Nevşehir"].sort(),
  "Niğde": ["Altunhisar","Bor","Çamardı","Niğde"].sort(),
  "Ordu": ["Akkuş","Altınordu","Aybastı","Fatsa","Gölköy","Gülyalı","Gürgentepe","İkizce","Kabadüz","Kabataş","Korgan","Kumru","Mesudiye","Perşembe","Ulubey","Ünye"].sort(),
  "Osmaniye": ["Bahçe","Düziçi","Hasanbeyli","Kadirli","Sumbas","Toprakkale"].sort(),
  "Rize": ["Ardeşen","Çamlıhemşin","Çayeli","Derepazarı","Fındıklı","Güneysu","İkizdere","Kalkandere","Pazar"].sort(),
  "Sakarya": ["Adapazarı","Akyazı","Arifiye","Erenler","Ferizli","Geyve","Hendek","Karapürçek","Karasu","Kaynarca","Kocaali","Pamukova","Sapanca","Serdivan","Söğütlü","Taraklı"].sort(),
  "Samsun": ["Alaçam","Asarcık","Atakum","Ayvacık","Bafra","Çarşamba","Havza","Kavak","Ladik","Ondokuzmayıs","Salıpazarı","Tekkeköy","Terme","Vezirköprü","Yakakent"].sort(),
  "Siirt": ["Baykan","Eruh","Kurtalan","Pervari","Şirvan"].sort(),
  "Sinop": ["Ayancık","Boyabat","Dikmen","Durağan","Erfelek","Gerze","Saraydüzü"].sort(),
  "Sivas": ["Akıncılar","Altınyayla","Divriği","Doğanşar","Gölova","Gürün","Hafik","İmranlı","Kangal","Koyulhisar","Suşehri","Şarkışla","Ulaş","Yıldızeli","Zara"].sort(),
  "Şanlıurfa": ["Akçakale","Birecik","Bozova","Ceylanpınar","Halfeti","Haliliye","Harran","Hilvan","Siverek","Suruç","Viranşehir"].sort(),
  "Şırnak": ["Beytüşşebap","Cizre","Güçlükonak","İdil","Silopi","Uludere"].sort(),
  "Tekirdağ": ["Çerkezköy","Çorlu","Hayrabolu","Malkara","Marmaraereğlisi","Muratlı","Saray","Şarköy"].sort(),
  "Tokat": ["Almus","Artova","Başçiftlik","Erbaa","Niksar","Pazar","Reşadiye","Sulusaray","Turhal","Yeşilyurt","Zile"].sort(),
  "Trabzon": ["Akçaabat","Araklı","Arsin","Çarşıbaşı","Çaykara","Dernekpazarı","Düzköy","Hayrat","Köprübaşı","Maçka","Of","Ortahisar","Şalpazarı","Sürmene","Tonya","Vakfıkebir","Yomra"].sort(),
  "Tunceli": ["Çemişgezek","Hozat","Mazgirt","Nazımiye","Ovacık","Pertek","Pülümür"].sort(),
  "Uşak": ["Banaz","Eşme","Karahallı","Sivaslı","Ulubey"].sort(),
  "Van": ["Başkale","Çaldıran","Çatak","Edremit","Erciş","Gevaş","Gürpınar","İpekyolu","Muradiye","Özalp","Tuşba"].sort(),
  "Yalova": ["Altınova","Armutlu","Çınarcık","Çiftlikköy","Termal"].sort(),
  "Yozgat": ["Akdağmadeni","Aydıncık","Boğazlıyan","Çandır","Çayıralan","Çekerek","Sarıkaya","Saraykent","Sorgun","Şefaatli","Yerköy"].sort(),
  "Zonguldak": ["Alaplı","Çaycuma","Devrek","Ereğli","Gökçebey"].sort(),

        });
      }
    };
    loadCitiesAndDistricts();
  }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getCurrentUserId();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      // const userId = await getCurrentUserId();
      const response = await axios.get(`${API_BASE_URL}/events`);
      // const myCreatedEvents = response.data.filter(
      //   event => String(event.creator_id) === String(userId)
      // );
      // setCreatedEvents(myCreatedEvents);
      setCreatedEvents(response.data); // Tüm etkinlikleri göster
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    // Kurucusu olunan kulüpleri çek
    const loadClubs = async () => {
      try {
        const userId = await getCurrentUserId();
        const res = await axios.get(`${API_BASE_URL}/clubs`);
        // Sadece creator_id eşleşenler
        setClubs(res.data.filter(club => String(club.creator_id) === String(userId)));
      } catch (e) {
        setClubs([]);
      }
    };
    loadClubs();
  }, []);

  // Kategori seçilince görsel seçimi modalını aç
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleSubmit = async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      Alert.alert('Hata', 'Etkinlik oluşturmak için giriş yapmalısınız!');
      return;
    }
    if (!title.trim() || !city.trim() || !district.trim() || !place.trim() || !date || !time || !selectedCategory || !selectedSubcategory || !selectedClub) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun ve kategori ile kulüp seçin!');
      return;
    }
    setLoading(true);
    try {
      const eventData = {
        title,
        description,
        date: date.toISOString().slice(0, 10),
        time: time.toISOString().slice(11, 16),
        location_name: place,
        location_map: null,
        quota: 1,
        city,
        district,
        category: selectedCategory.name,
        subcategory: selectedSubcategory,
        image_url: image || '', // image artık asset path olabilir
        creator_id: userId,
        club_id: selectedClub.id,
      };
      await axios.post(`${API_BASE_URL}/events`, eventData);
      Alert.alert('Başarılı', 'Etkinlik başarıyla oluşturuldu!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Hata', 'Etkinlik oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const districts = city ? districtsByCity[city] || [] : [];

  // --- UI ---
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Görsel seçimi */}
      <View style={styles.imageUploadButton}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <TouchableOpacity onPress={async () => {
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
              setImage(result.assets[0].uri);
            }
          }} style={{ alignItems: 'center' }}>
            <MaterialIcons name="image" size={40} color="#ea4c89" />
            <Text style={styles.uploadText}>Fotoğraf seç</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Başlık */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Etkinlik Başlığı *</Text>
        <TextInput
          style={styles.input}
          placeholder="Başlık girin"
          value={title}
          onChangeText={setTitle}
          maxLength={50}
        />
      </View>
      {/* Açıklama */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Açıklama</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Etkinlik hakkında bilgi verin"
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={300}
        />
      </View>
      {/* Şehir ve İlçe */}
      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.flex1, { marginRight: 8 }]}> 
          <Text style={styles.label}>Şehir *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={city}
              onValueChange={setCity}
              style={styles.picker}
            >
              <Picker.Item label="Şehir seçin" value="" />
              {cities.map((c) => (
                <Picker.Item key={c} label={c} value={c} />
              ))}
            </Picker>
          </View>
        </View>
        <View style={[styles.inputContainer, styles.flex1, { marginLeft: 8 }]}> 
          <Text style={styles.label}>İlçe *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={district}
              onValueChange={setDistrict}
              style={styles.picker}
              enabled={!!city}
            >
              <Picker.Item label="İlçe seçin" value="" />
              {districts.map((d) => (
                <Picker.Item key={d} label={d} value={d} />
              ))}
            </Picker>
          </View>
        </View>
      </View>
      {/* Mekan */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mekan *</Text>
        <TextInput
          style={styles.input}
          placeholder="Mekan adı"
          value={place}
          onChangeText={setPlace}
        />
      </View>
      {/* Tarih ve Saat */}
      <View style={styles.row}>
        <TouchableOpacity style={[styles.inputContainer, styles.flex1, styles.dateTimeButton, { marginRight: 8 }]} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.label}>Tarih *</Text>
          <View style={styles.dateTimeValueRow}>
            <MaterialCommunityIcons name="calendar" size={20} color="#ea4c89" />
            <Text style={styles.dateTimeValue}>{date.toLocaleDateString()}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.inputContainer, styles.flex1, styles.dateTimeButton, { marginLeft: 8 }]} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.label}>Saat *</Text>
          <View style={styles.dateTimeValueRow}>
            <Ionicons name="time-outline" size={20} color="#ea4c89" />
            <Text style={styles.dateTimeValue}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
      {/* Kategori seçimi */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Kategori Seç *</Text>
        <View style={styles.categoryContainer}>
          {categories.map((cat, idx) => (
            <TouchableOpacity
              key={cat.id || cat.name || idx}
              style={[
                styles.categoryButton,
                selectedCategory?.name === cat.name && styles.categorySelected,
              ]}
              onPress={() => handleCategorySelect(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory?.name === cat.name && styles.categoryTextSelected,
                ]}
              >
                {cat.icon} {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {selectedCategory && SUBCATEGORIES[selectedCategory.name.toLowerCase().replace(/[^a-z0-9]/gi, '')] && (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.label}>Alt Kategori Seç *</Text>
          <View style={styles.categoryContainer}>
            {SUBCATEGORIES[selectedCategory.name.toLowerCase().replace(/[^a-z0-9]/gi, '')].map((sub, idx) => (
              <TouchableOpacity
                key={sub}
                style={[
                  styles.categoryButton,
                  selectedSubcategory === sub && styles.categorySelected,
                ]}
                onPress={() => setSelectedSubcategory(sub)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedSubcategory === sub && styles.categoryTextSelected,
                  ]}
                >
                  {sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      {/* Görsel Seçim Modalı */}
      <Modal
        visible={imageModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Görsel Seç ({selectedCategory?.name})</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              
            </View>
            <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: '#ea4c89' }]} onPress={() => setImageModalVisible(false)}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Kulüp seçimi butonu */}
      <TouchableOpacity style={styles.selectButton} onPress={() => setClubModalVisible(true)}>
        {selectedClub ? (
          <Text style={{ color: '#222', fontWeight: '600' }}>
            🏛️  {selectedClub.name}
          </Text>
        ) : (
          <Text style={{ color: '#888', fontWeight: '600', flexDirection: 'row', alignItems: 'center' }}>
            Kulüp seçin <Text style={{ color: '#888' }}> *</Text>
          </Text>
        )}
      </TouchableOpacity>
      {/* Kulüp Modal */}
      <Modal
        visible={clubModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setClubModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Kurucusu Olduğunuz Kulüpler</Text>
            {clubs.length === 0 ? (
              <Text style={{ color: '#888', textAlign: 'center', marginVertical: 10 }}>Kurucusu olduğunuz kulüp yok.</Text>
            ) : (
              <FlatList
                data={clubs}
                keyExtractor={item => item.id?.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.modalItem, { backgroundColor: '#f2f2f2', borderRadius: 8, marginBottom: 8 }]}
                    onPress={() => {
                      setSelectedClub(item);
                      setClubModalVisible(false);
                    }}
                  >
                    <Text style={{ fontSize: 22, marginRight: 12 }}>🏛️</Text>
                    <Text style={{ color: '#222', fontWeight: '700', fontSize: 16 }}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
            <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: '#ea4c89' }]} onPress={() => setClubModalVisible(false)}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Kayıt butonu */}
      <TouchableOpacity style={styles.createButton} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createButtonText}>Etkinliği Oluştur</Text>
        )}
      </TouchableOpacity>
      {/* Kullanıcının oluşturduğu etkinlikler */}
      <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Oluşturduğunuz Etkinlikler</Text>
      {createdEvents.length === 0 ? (
        <Text style={{ color: '#888', textAlign: 'center', marginVertical: 10 }}>Henüz etkinlik oluşturmadınız.</Text>
      ) : (
        <FlatList
          data={createdEvents}
          keyExtractor={item => item.id?.toString()}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.eventImage} />
              ) : (
                <View style={styles.eventImagePlaceholder}>
                  <MaterialIcons name="event" size={32} color="#ea4c89" />
                </View>
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventMeta}>{item.city} / {item.district}</Text>
                <Text style={styles.eventMeta}>{item.date} {item.time}</Text>
                <Text style={styles.eventCategory}>{item.category}</Text>
              </View>
            </View>
          )}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 10 }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 22, paddingBottom: 40 },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ea4c89',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10, color: '#333' },
  imageUploadButton: {
    backgroundColor: '#f2f2f2',
    borderRadius: 16,
    height: screenWidth * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 16,
  },
  uploadPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: '#888',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
  inputContainer: { marginBottom: 15 },
  label: { fontWeight: '600', marginBottom: 6, color: '#444', fontSize: 15 },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#eee',
  },
  multilineInput: { minHeight: 80, textAlignVertical: 'top' },
  pickerWrapper: { backgroundColor: '#f2f2f2', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  picker: { color: '#222', width: '100%' },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  createButton: {
    backgroundColor: '#ea4c89',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#ea4c89',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 17,
    textAlign: 'center',
  },
  selectButton: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  dateTimeButton: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 15,
    justifyContent: 'center',
  },
  dateTimeValueRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dateTimeValue: { marginLeft: 8, fontSize: 15, color: '#222', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '70%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    color: '#ea4c89',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  modalCloseButton: {
    marginTop: 15,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
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
    backgroundColor: '#ea4c89',
  },
  categoryText: {
    fontSize: 16,
    color: '#374151',
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    padding: 12,
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 260,
    maxWidth: 320,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  eventImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  eventMeta: {
    fontSize: 13,
    color: '#888',
    marginBottom: 1,
  },
  eventCategory: {
    fontSize: 13,
    color: '#ea4c89',
    fontWeight: '700',
    marginTop: 2,
  },
});
