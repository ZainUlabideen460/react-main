import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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

const Aboutus = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
       <LinearGradient
            colors={['rgba(10, 19, 36, 0.95)', 'rgba(25, 47, 89, 0.85)']}
           
          >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>About Smart Course Planner</Text>
        <Text style={styles.headerSubtitle}>Learn about our app and team</Text>
      </View>
      </LinearGradient>

      {/* App Details */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>About the App</Text>
        <Text style={styles.sectionText}>
          Smart Course Planner is a mobile application designed to streamline timetable management for students, teachers, and administrators. It allows users to view and manage class schedules, filter by shift (Morning/Evening) or day, and access course details seamlessly. Built with React Native, the app offers a user-friendly interface, real-time data fetching, and robust error handling to ensure a smooth experience.
        </Text>
        <Text style={styles.sectionText}>
          Key features include:
          {'\n'}• View personalized timetables for teachers and students.
          {'\n'}• Filter schedules by shift or day.
          {'\n'}• Display course, room, and teacher information.
          {'\n'}• Responsive design for all device sizes.
        </Text>
      </View>

      {/* Team Details */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Developed By</Text>

        {/* Team Member 1 (You) */}
        <View style={styles.memberCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' }}
            style={styles.memberImage}
          />
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>M Zain UL Abideen</Text>
            <Text style={styles.memberRole}>Mern Stack Developer</Text>
            <Text style={styles.memberDetails}>
            M Zain UL Abideen the development of the frontend and backend integration, ensuring seamless API communication and a responsive UI. He designed the timetable grid and navigation system.
            </Text>
          </View>
        </View>

        {/* Team Member 2 */}
        <View style={styles.memberCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' }}
            style={styles.memberImage}
          />
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>Saad Ahmad</Text>
            <Text style={styles.memberRole}>Mern Stack Developer</Text>
            <Text style={styles.memberDetails}>
            Saad Ahmad the development of the frontend and backend integration, ensuring seamless API communication and a responsive UI. He designed the timetable grid and navigation system.
            </Text>
          </View>
        </View>

        {/* Team Member 3 */}
        <View style={styles.memberCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' }}
            style={styles.memberImage}
          />
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>Syed M Fasih Shah </Text>
            <Text style={styles.memberRole}>Full Stack Developer</Text>
            <Text style={styles.memberDetails}>
            Syed M Fasih Shah the app’s intuitive interface, focusing on user experience and visual consistency. She designed the color scheme and layout for all screens.
            </Text>
          </View>
        </View>
      </View>

      {/* Supervisor Details */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Our Supervisor</Text>
        <View style={styles.memberCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' }}
            style={styles.memberImage}
          />
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>Muhammad Azhar</Text>
            <Text style={styles.memberRole}>Project Supervisor</Text>
            <Text style={styles.memberDetails}>
            Muhammad Azhar is a professor in the UIIT Department. He guided the team throughout the project, providing insights on system design and project management.
            </Text>
          </View>
        </View>
      </View>

      {/* University Details */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Our University</Text>
        <View style={styles.universityCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c' }}
            style={styles.universityImage}
          />
          <Text style={styles.universityName}>PMAS-Arid Agriculture University </Text>
          <Text style={styles.universityDetails}>
            Located in [Rawalpindi, Pakistan], PMAS-Arid Agriculture University is a leading institution known for its excellence in education and research. The UIIT Department fosters innovation and supports projects like Smart Course Planner.
          </Text>
          <Text
            style={styles.universityLink}
            onPress={() => Linking.openURL('https://www.uaar.edu.pk/index.php')}
          >
            Visit our website
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
   
  },
  headerContainer: {
    // backgroundColor: '#1D9ED8',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1565C0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    paddingTop:40,
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
  sectionText: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
    marginBottom: 10,
  },
  memberCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  memberImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },
  memberInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  memberRole: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 5,
  },
  memberDetails: {
    fontSize: 12,
    color: '#616161',
  },
  universityCard: {
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  universityImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  universityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  universityDetails: {
    fontSize: 14,
    color: '#616161',
    textAlign: 'center',
    marginBottom: 10,
  },
  universityLink: {
    fontSize: 14,
    color: '#1D9ED8',
    textDecorationLine: 'underline',
  },
});

export default Aboutus;