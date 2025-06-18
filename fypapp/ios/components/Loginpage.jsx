import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Avatar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

// Get initial window dimensions
const { width, height } = Dimensions.get('window');

// Function to scale sizes based on screen width
const scale = (size) => {
  return (size * width) / 375;
};

// Function to scale font sizes
const scaleFont = (size) => {
  return Math.round((size * Math.min(width, height)) / 375);
};

// Function to show toast message using react-native-toast-message
const showToast = (message, type = 'error') => {
  Toast.show({
    type: type,
    text1: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

const Loginpage = ({ navigation, route,url }) => {
  // const url = 'http://192.168.18.107:3001';
  // console.log(url);
  const [form, setForm] = useState({
    email: '',
    cnic: '',
  });
  const [focusedInput, setFocusedInput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { role } = route.params || {};

  // Show toast message function
  const displayToast = (message, type = 'error') => {
    showToast(message, type);
  };

  const handleSubmit = async () => {
    if (!form.email) {
      displayToast('Please enter your email address');
      return;
    }
    if (!form.cnic) {
      displayToast('Please enter your Password');
      return;
    }
    
   

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      displayToast('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${url}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        displayToast('Login successful!', 'success');
        setTimeout(() => {
          navigation.navigate(role === 'student' ? 'viewstudent' : 'viewteacher', {
            user: data.user,
            token: data.token,
          });
        }, 1000);
      } else {
        displayToast(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      displayToast('Connection error. Please check your internet connection.');
    } finally {
      setIsLoading(false);
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
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <View style={styles.headerContainer}>
              <View style={styles.logoContainer}>
                <Avatar.Icon
                  icon="school"
                  size={scale(70)}
                  style={styles.logo}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.title}>Smart Course Planner</Text>
              <Text style={styles.subtitle}>University Institute Of Information Technology</Text>
            </View>

            <View style={styles.card}>
              <LinearGradient
                colors={['#4C78DB', '#3D5FBE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardHeader}
              />
              <Text style={styles.heading}>Welcome Back</Text>
              <Text style={styles.subheading}>
                Sign in as <Text style={styles.roletext}>{role === 'student' ? 'Student' : 'Teacher'}</Text> to access your personalized schedule
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
                  keyboardType="email-address"
                  value={form.email}
                  onChangeText={(text) => setForm({ ...form, email: text })}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  placeholder="Enter your CNIC"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input, focusedInput === 'cnic' && styles.inputFocused]}
                  keyboardType="numeric"
                  value={form.cnic}
                  secureTextEntry={true}
                  onChangeText={(text) => setForm({ ...form, cnic: text })}
                  onFocus={() => setFocusedInput('cnic')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.loginBtn,
                  (!form.email || !form.cnic) && styles.loginBtnDisabled,
                  isLoading && styles.loginBtnLoading,
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#3B82F6', '#1D4ED8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginBtnGradient}
                >
                  <Text style={styles.loginBtnText}>
                    {isLoading ? 'Logging in...' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('signup', { role })}>
                <Text style={styles.signupText}>
                  Don't have an account? <Text style={styles.signupTextBold}>Sign up</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>© 2025 Smart Course Planner</Text>
            </View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
      
      {/* Toast Component */}
      <Toast />
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
    marginTop: 60,
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
    color: '#F59E0B'
  },
  inputContainer: {
    width: '100%',
    marginBottom: scale(15),
  },
  inputLabel: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: scale(8),
    marginLeft: scale(4),
  },
  input: {
    width: '100%',
    height: scale(50),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: scale(25),
    paddingHorizontal: scale(15),
    fontSize: scaleFont(16),
    color: '#111827',
    borderWidth: scale(1.5),
    borderColor: '#E5E7EB',
  },
  inputFocused: {
    borderColor: '#3B82F6',
    backgroundColor: '#F0F7FF',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: scale(3) },
    shadowOpacity: 0.2,
    shadowRadius: scale(6),
    elevation: 4,
  },
  loginBtn: {
    width: '100%',
    height: scale(50),
    borderRadius: scale(25),
    marginTop: scale(10),
    marginBottom: scale(15),
    overflow: 'hidden',
  },
  loginBtnGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnLoading: {
    opacity: 0.8,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  signupText: {
    color: '#E5E7EB',
    fontSize: scaleFont(14),
    marginBottom: scale(10),
  },
  signupTextBold: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: scale(20),
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: scaleFont(10),
  },
  // No additional toast styles needed as we're using the library
});

export default Loginpage;