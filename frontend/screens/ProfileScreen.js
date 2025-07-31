import React, { useState, useEffect } from "react";
import { SafeAreaView, View, ScrollView, Image, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL, getCurrentUserId } from '../auth';
import axios from 'axios';

export default function ProfileScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;
        const res = await axios.get(`${API_BASE_URL}/users/${userId}`);
        setCurrentUser(res.data);
      } catch (e) {
        setCurrentUser(null);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#8FA0D8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <View style={{ alignItems: "flex-end", marginTop: 66, marginBottom: 3 }}>
          <Image
            source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/vWIRdWhLXn/n5dkaiqs_expires_30_days.png" }}
            resizeMode="stretch"
            style={{ width: 27, height: 29, marginRight: 15 }}
          />
        </View>
        <View style={{ alignItems: "center", marginBottom: 9 }}>
          <Image
            source={{ uri: currentUser?.avatar_url || "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/vWIRdWhLXn/vkbi7edy_expires_30_days.png" }}
            resizeMode="stretch"
            style={{ width: 99, height: 99, borderRadius: 50, backgroundColor: "#eee" }}
          />
        </View>
        <View style={{ alignItems: "flex-end", marginBottom: 15 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginRight: 98 }}>
            <Text style={{ color: "#000", fontSize: 18, marginRight: 15 }}>
              {currentUser?.username ? `@${currentUser.username}` : "@kullanici"}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#8FA0D8",
                borderRadius: 26,
                paddingVertical: 7,
                paddingHorizontal: 17,
              }}
              onPress={() => navigation && navigation.navigate('EditProfileScreen')}
            >
              <Ionicons name="pencil" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ alignItems: "center", marginBottom: 21 }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ alignItems: "center", marginRight: 69 }}>
              <Text style={{ color: "#000", fontSize: 18 }}>{currentUser?.followingCount ?? "0"}</Text>
              <Text style={{ color: "#000", fontSize: 14 }}>Takipte</Text>
            </View>
            <View style={{ alignItems: "center", marginRight: 63 }}>
              <Text style={{ color: "#000", fontSize: 18 }}>{currentUser?.followerCount ?? "0"}</Text>
              <Text style={{ color: "#000", fontSize: 14 }}>Takipçi</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#000", fontSize: 18 }}>{currentUser?.eventCount ?? "0"}</Text>
              <Text style={{ color: "#000", fontSize: 14 }}>Etkinlik</Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems: "center", marginBottom: 26 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#8FA0D8",
              borderRadius: 26,
              paddingVertical: 4,
              paddingHorizontal: 9,
            }}
            onPress={() => navigation && navigation.navigate('EditProfileScreen')}
          >
            <Text style={{ color: "#000", fontSize: 14, fontWeight: "bold" }}>
              {currentUser?.bio ? currentUser.bio : "+ Biyografi ekle"}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: "center", marginBottom: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 12, height: 20, marginRight: 6 }} />
            <View style={{ width: 2, height: 2, backgroundColor: "#0C0829", marginRight: 1 }} />
            <View style={{ width: 3, height: 2, backgroundColor: "#0C0829", marginRight: 153 }} />
            <Image
              source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/vWIRdWhLXn/zhppfbcy_expires_30_days.png" }}
              resizeMode="stretch"
              style={{ width: 17, height: 23 }}
            />
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: "#707070", marginBottom: 316 }} />
        <View style={{ alignItems: "center", marginBottom: 63 }}>
          <View style={{ alignItems: "center" }}>
            <Image
              source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/vWIRdWhLXn/f27qr9io_expires_30_days.png" }}
              resizeMode="stretch"
              style={{ width: 64, height: 64 }}
            />
            <View
              style={{
                position: "absolute",
                bottom: -28,
                left: -148,
                width: 360,
                alignItems: "center",
                backgroundColor: "#0C0829",
                borderRadius: 69,
                paddingHorizontal: 25,
              }}
            >
              <View style={{ width: 16, height: 4, backgroundColor: "#FF8502", marginTop: 3, marginBottom: 12 }} />
              <View style={{ alignSelf: "stretch", flexDirection: "row", alignItems: "center", marginBottom: 9 }}>
                <Image
                  source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/vWIRdWhLXn/3r04ip90_expires_30_days.png" }}
                  resizeMode="stretch"
                  style={{ width: 20, height: 21, marginRight: 47 }}
                />
                <Image
                  source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/vWIRdWhLXn/yo0vg7pz_expires_30_days.png" }}
                  resizeMode="stretch"
                  style={{ width: 31, height: 19 }}
                />
                <View style={{ flex: 1, alignSelf: "stretch" }} />
                <View style={{ alignItems: "center", marginRight: 46 }}>
                  <View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Image
                        source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/vWIRdWhLXn/mobyod7m_expires_30_days.png" }}
                        resizeMode="stretch"
                        style={{ width: 5, height: 5, marginRight: 1 }}
                      />
                    </View>
                    <Image
                      source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/vWIRdWhLXn/gmlxkwvh_expires_30_days.png" }}
                      resizeMode="stretch"
                      style={{ width: 19, height: 22 }}
                    />
                  </View>
                </View>
                <Image
                  source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/vWIRdWhLXn/pod0gsm4_expires_30_days.png" }}
                  resizeMode="stretch"
                  style={{ width: 30, height: 34 }}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}