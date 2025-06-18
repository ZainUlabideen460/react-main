import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { RadioButton, Avatar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

// Get initial window dimensions
const { width, height } = Dimensions.get('window');

// Function to scale sizes based on screen width
const scale = (size: number, baseWidth: number = 375) => {
  return (size * width) / baseWidth;
};

// Function to scale font sizes
const scaleFont = (size: number) => {
  return Math.round((size * Math.min(width, height)) / 375);
};

const WelcomePage = ({ navigation }) => {
  const [value, setValue] = useState('');

  const handleContinue = () => {
    if (value) {
      navigation.navigate('login', { role: value });
    }
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' }}
        style={styles.backgroundImage}
        blurRadius={3}
      >
        <LinearGradient
          colors={['rgba(25, 47, 89, 0.7)', 'rgba(10, 19, 36, 0.92)']}
          style={styles.overlay}
        >
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <View style={styles.logoContainer}>
                <Avatar.Icon
                  icon="book-education"
                  size={scale(70)}
                  style={styles.logo}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.title}>Smart Course Planner</Text>
              <Text style={styles.subtitle}>Choose Your Role</Text>
            </View>

            <View style={styles.card}>
              <LinearGradient
                colors={['#4C78DB', '#3D5FBE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardHeader}
              />
              <Text style={styles.heading}>Welcome</Text>
              <Text style={styles.subheading}>
                Select your role to continue as a{' '}
                <Text style={styles.roletext}>{value === 'student' ? 'Student' : 'Teacher'}</Text>
              </Text>

              <RadioButton.Group value={value} onValueChange={setValue}>
                <TouchableOpacity
                  style={[styles.roleCard, value === 'teacher' && styles.selectedCard]}
                  onPress={() => setValue('teacher')}
                  activeOpacity={0.7}
                >
                  <View style={styles.roleCardContent}>
                    <Avatar.Icon
                      icon="human-male-board"
                      size={scale(40)}
                      style={styles.roleIcon}
                      color={value === 'teacher' ? '#F59E0B' : '#3B82F6'}
                    />
                    <Text
                      style={[styles.roleLabel, value === 'teacher' && styles.selectedLabel]}
                    >
                      Teacher
                    </Text>
                    <RadioButton
                      value="teacher"
                      color="#F59E0B"
                      uncheckedColor="#9CA3AF"
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleCard, value === 'student' && styles.selectedCard]}
                  onPress={() => setValue('student')}
                  activeOpacity={0.7}
                >
                  <View style={styles.roleCardContent}>
                    <Avatar.Icon
                      icon="school"
                      size={scale(40)}
                      style={styles.roleIcon}
                      color={value === 'student' ? '#F59E0B' : '#3B82F6'}
                    />
                    <Text
                      style={[styles.roleLabel, value === 'student' && styles.selectedLabel]}
                    >
                      Student
                    </Text>
                    <RadioButton
                      value="student"
                      color="#F59E0B"
                      uncheckedColor="#9CA3AF"
                    />
                  </View>
                </TouchableOpacity>
              </RadioButton.Group>

              <TouchableOpacity
                style={[styles.continueBtn, !value && styles.continueBtnDisabled]}
                onPress={handleContinue}
                disabled={!value}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#3B82F6', '#1D4ED8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueBtnGradient}
                >
                  <Text style={styles.continueBtnText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>© 2025 Smart Course Planner</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    height: height * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    marginTop: Platform.OS === 'ios' ? scale(40) : scale(20),
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: scale(20),
  },
  logoContainer: {
    padding: scale(10),
    borderRadius: scale(50),
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    borderWidth: scale(2),
    borderColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(6) },
    shadowOpacity: 0.4,
    shadowRadius: scale(10),
    elevation: 10,
  },
  logo: {
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: scaleFont(32),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: scale(10),
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: scale(5),
  },
  subtitle: {
    fontSize: scaleFont(16),
    color: '#E5E7EB',
    marginTop: scale(6),
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  card: {
    padding: scale(20),
    width: '100%',
    maxWidth: Math.min(width * 0.9, 420),
    backgroundColor: 'transparent',
    borderRadius: scale(24),
    alignItems: 'center',
  },
  cardHeader: {
    width: '100%',
    height: scale(8),
    borderRadius: scale(4),
    marginBottom: scale(24),
  },
  heading: {
    fontSize: scaleFont(26),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: scale(12),
  },
  subheading: {
    fontSize: scaleFont(14),
    color: '#E5E7EB',
    marginBottom: scale(20),
    textAlign: 'center',
    paddingHorizontal: scale(10),
  },
  roletext: {
    color: '#F59E0B',
  },
  roleCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: scale(15),
    marginBottom: scale(15),
    borderWidth: scale(1.5),
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(3) },
    shadowOpacity: 0.1,
    shadowRadius: scale(6),
    elevation: 2,
  },
  selectedCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#F0F7FF',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  roleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(15),
  },
  roleIcon: {
    backgroundColor: 'transparent',
  },
  roleLabel: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginLeft: scale(10),
  },
  selectedLabel: {
    color: '#111827',
  },
  continueBtn: {
    width: '100%',
    height: scale(50),
    borderRadius: scale(25),
    marginTop: scale(10),
    marginBottom: scale(15),
    overflow: 'hidden',
  },
  continueBtnGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtnDisabled: {
    opacity: 0.6,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: scale(4),
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: scaleFont(10),
  },
});

export default WelcomePage;