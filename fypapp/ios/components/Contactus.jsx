import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

const Contactus = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const scrollViewRef = useRef(null);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    // Placeholder: Log form data (replace with API call)
    console.log('Form submitted:', formData);
    // Example API call (uncomment and configure with your backend):
    /*
    axios.post('http://192.168.18.28:3001/contact', formData)
      .then(response => {
        console.log('Message sent:', response.data);
        // Show success toast
      })
      .catch(error => {
        console.error('Error sending message:', error);
        // Show error toast
      });
    */
    setFormData({ name: '', email: '', message: '' }); // Reset form
  };

  // Optional: Scroll to focused input
  const handleInputFocus = (yPosition) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: yPosition, animated: true });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <ScrollView
        style={styles.scrollContainer}
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: scale(20) }}
      >
        {/* Header */}
          <LinearGradient
                    colors={['rgba(10, 19, 36, 0.95)', 'rgba(25, 47, 89, 0.85)']}
                   
                  >
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Contact Us</Text>
          <Text style={styles.headerSubtitle}>Get in touch with our team</Text>
        </View>
        </LinearGradient>

        {/* Contact Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Reach Out</Text>
          <View style={styles.contactCard}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => Linking.openURL('mailto:contact@smartcourse.com')}
            >
              <MaterialIcons name="email" size={24} color="#4CAF50" />
              <Text style={styles.contactText}>contact@smartcourse.com</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => Linking.openURL('tel:+1234567890')}
            >
              <MaterialIcons name="phone" size={24} color="#4CAF50" />
              <Text style={styles.contactText}>+92(319)5028804</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => Linking.openURL('https://twitter.com/smartcourseapp')}
            >
              <FontAwesome5 name="twitter" size={24} color="#4CAF50" />
              <Text style={styles.contactText}>@SmartCourseApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => Linking.openURL('https://www.linkedin.com/company/smartcourseapp')}
            >
              <FontAwesome5 name="linkedin" size={24} color="#4CAF50" />
              <Text style={styles.contactText}>Smart Course App</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Send Us a Message</Text>
          <View style={styles.formCard}>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholderTextColor="#BDBDBD"
              onFocus={() => handleInputFocus(300)} // Adjust yPosition as needed
            />
            <TextInput
              style={styles.input}
              placeholder="Your Email"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
              placeholderTextColor="#BDBDBD"
              onFocus={() => handleInputFocus(350)} // Adjust yPosition as needed
            />
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Your Message"
              value={formData.message}
              onChangeText={(text) => handleInputChange('message', text)}
              multiline
              numberOfLines={5}
              placeholderTextColor="#BDBDBD"
              onFocus={() => handleInputFocus(400)} // Adjust yPosition as needed
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    // backgroundColor: '#1976D2',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1565C0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    paddingTop:40
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#F59E0B',
    textAlign: 'center',
    marginTop: 4,
  },
  sectionContainer: {
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  contactCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#616161',
    marginLeft: 10,
  },
  formCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default Contactus;