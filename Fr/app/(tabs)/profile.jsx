import React, { useContext, useState, useRef } from "react";
import { Image, ScrollView, StyleSheet, View, useColorScheme, Animated, TouchableOpacity, Dimensions } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyUserContext } from "@/components/userContext";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";

const { width } = Dimensions.get('window');

const Profile = () => {
  const theme = useColorScheme();
  const { user, setUser } = useContext(MyUserContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useFocusEffect(
    React.useCallback(() => {
      const checkToken = async () => {
        setIsLoggedIn(false);
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          router.push("/onBoarding");
        } else {
          setIsLoggedIn(true);
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
              toValue: 0,
              friction: 4,
              useNativeDriver: true,
            }),
          ]).start();
        }
      };
      checkToken();
    }, [])
  );

  const MenuCard = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity onPress={onPress}>
      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={[styles.cardContent, { backgroundColor: theme === 'light' ? '#ffffff' : '#222222' }]}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} color={theme === 'light' ? '#000000' : '#ffffff'} size={24} />
          </View>
          <View style={styles.cardTextContainer}>
            <ThemedText style={styles.cardTitle}>{title}</ThemedText>
            <ThemedText style={styles.cardSubtitle}>{subtitle}</ThemedText>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === "light" ? "#f0f0f0" : "#1a1a1a" }]}>
      {isLoggedIn && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.profileHeader, { backgroundColor: theme === "light" ? "#ffffff" : "#222222" }]}>
            <Animated.View style={[styles.profileContent, { opacity: fadeAnim }]}>
              <Image source={{ uri: user?.profileImage }} style={styles.profileImage} />
              <View style={styles.profileInfo}>
                <ThemedText style={styles.profileName}>{user?.name}</ThemedText>
                <ThemedText style={styles.profileCNIC}>{user?.cnic}</ThemedText>
                <ThemedText style={styles.profileEmail}>{user?.email}</ThemedText>
              </View>
            </Animated.View>
          </View>

          <View style={styles.cardsContainer}>
            <MenuCard 
              icon="card-outline" 
              title="Billing Info" 
              subtitle="Manage your payment methods" 
              onPress={() => router.push("/(pages)/account")} 
            />
            <MenuCard 
              icon="ticket-outline" 
              title="Your Products" 
              subtitle="View and manage your listings" 
              onPress={() => router.push("/sell")} 
            />
            <MenuCard 
              icon="settings-outline" 
              title="Update Profile " 
              subtitle="Update your profile details" 
              onPress={() => router.push("/update-profile")} 
            />
            <MenuCard 
              icon="power-outline" 
              title="Logout" 
              subtitle="Sign out of your account" 
              onPress={() => {
                AsyncStorage.clear();
                router.push("/(auth)/login");
              }} 
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileHeader: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'gray',
  },
  profileInfo: {
    marginLeft: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileCNIC: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  cardsContainer: {
    padding: 20,
  },
  card: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: 'transparent',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'gray',
  },
});

export default Profile;