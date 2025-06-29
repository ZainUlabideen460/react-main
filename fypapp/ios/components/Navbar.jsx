import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Get initial window dimensions
const { width } = Dimensions.get('window');

// Function to scale sizes based on screen width
const scale = (size, baseWidth = 375) => {
  return (size * width) / baseWidth;
};

// Function to scale font sizes
const scaleFont = (size) => {
  return Math.round((size * Math.min(width, Dimensions.get('window').height)) / 375);
};

const Navbar = ({ currentRoute, unreadCount = 0 }) => {
  const navigation = useNavigation();
  
  // Don't show navbar on login, signup, and welcomepage
  if (currentRoute === 'login' || currentRoute === 'signup' || currentRoute === 'welcomepage') {
    return null;
  }

  // Define routes and their corresponding icons and labels
  const navItems = [
    { route: 'chat', icon: 'chat', label: 'Chat' },
    { route: 'timetable', icon: 'event', label: 'Timetable' },
    { route: 'aboutus', icon: 'info', label: 'About' },
    { route: 'contactus', icon: 'contact-support', label: 'Contact' },
  ];

  return (
    <LinearGradient
      colors={['rgba(10, 19, 36, 0.95)', 'rgba(25, 47, 89, 0.85)']}
      style={styles.bottomHeaderContainer}
    >
      <View style={styles.headerContent}>
        {/* Left Icons */}
        <View style={styles.iconGroup}>
          {navItems.slice(0, 2).map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.iconButton}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={item.icon}
                size={scale(24)}
                color={currentRoute === item.route ? '#F59E0B' : '#FFFFFF'}
              />
              <Text
                style={[
                  styles.iconText,
                  { color: currentRoute === item.route ? '#F59E0B' : '#FFFFFF' },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <FontAwesome5 name="graduation-cap" size={scale(28)} color="#F59E0B" />
          <Text style={styles.logoText}>Smart Course</Text>
        </View>

        {/* Right Icons */}
        <View style={styles.iconGroup}>
          {navItems.slice(2).map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.iconButton}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={item.icon}
                size={scale(24)}
                color={currentRoute === item.route ? '#F59E0B' : '#FFFFFF'}
              />
              <Text
                style={[
                  styles.iconText,
                  { color: currentRoute === item.route ? '#F59E0B' : '#FFFFFF' },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  bottomHeaderContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: scale(80),
    paddingVertical: scale(10),
    paddingHorizontal: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(-3) },
    shadowOpacity: 0.2,
    shadowRadius: scale(6),
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  iconGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '33%',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(5),
  },
  iconText: {
    fontSize: scaleFont(10),
    marginTop: scale(2),
    fontWeight: '500',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '33%',
  },
  badge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: scaleFont(8),
    fontWeight: '700',
  },
  logoText: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: '#F59E0B',
    marginTop: scale(2),
  },
});

export default Navbar;