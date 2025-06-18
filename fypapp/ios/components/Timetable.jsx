import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions, // Added Dimensions import
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
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

export default function TimetableManagement({url}) {
  // State variables
  const [timetable, setTimetable] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedShift, setSelectedShift] = useState('Morning');
  const [isLoading, setIsLoading] = useState(false);
  // const url='http://192.168.18.107:3001';
  // Days of the week
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Fetch data on mount and when selectedShift changes
  useEffect(() => {
    fetchData();
  }, [selectedShift]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchTimetable(selectedShift),
        fetchTeachers(),
        fetchRooms(),
        fetchSections(),
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setErrorMessage('Failed to fetch data.');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch timetable entries
  const fetchTimetable = async (shift) => {
    try {
      const response = await axios.get(`${url}/timetable`);
      const shiftSuffix = shift === 'Morning' ? '(M)' : '(E)';
      const filteredTimetable = response.data.filter((entry) =>
        entry.section?.sectionDisplay?.endsWith(shiftSuffix)
      );

      const uniqueTimeSlots = [...new Set(filteredTimetable.map((entry) => entry.startTime))].sort(
        (a, b) => {
          const [hoursA, minutesA] = a.split(':').map(Number);
          const [hoursB, minutesB] = b.split(':').map(Number);
          if (hoursA !== hoursB) {
            return hoursA - hoursB;
          }
          return minutesA - minutesB;
        }
      );
      const uniqueSections = [...new Set(filteredTimetable.map((entry) => entry.section.sectionDisplay))].sort();

      setTimetable(filteredTimetable);
      setTimeSlots(uniqueTimeSlots);
      setSections(uniqueSections);
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
      throw error;
    }
  };

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      const response = await axios.get(`${url}/teachers`);
      setTeachers(response.data);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      throw error;
    }
  };

  // Fetch rooms
  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${url}/rooms`);
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      throw error;
    }
  };

  // Fetch sections
  const fetchSections = async () => {
    try {
      const response = await axios.get(`${url}/sections`);
      setSections(response.data.map((section) => section.sectionDisplay));
    } catch (error) {
      console.error('Failed to fetch sections:', error);
      throw error;
    }
  };

  // Function to display course info
  const renderCourseInfo = (entry) => {
    if (!entry) {
      return (
        <View style={styles.emptyDataCell}>
          <Text style={styles.emptyCell}>No class</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.courseInfo}
        onPress={() => console.log('Edit entry:', entry)}
        activeOpacity={0.7}
      >
        <Text style={styles.courseName} numberOfLines={1}>
          {entry.courseoffering?.coursename || 'N/A'}
        </Text>
        <Text style={styles.room}>Room: {entry.room?.name || 'N/A'}</Text>
        <Text style={styles.teacher} numberOfLines={1}>
          Teacher: {entry.teacher || 'N/A'}
        </Text>
      </TouchableOpacity>
    );
  };

  // Find timetable entry
  const findTimetableEntry = (day, section, time) => {
    return timetable.find(
      (entry) =>
        entry.day === day &&
        entry.section.sectionDisplay === section &&
        entry.startTime === time
    );
  };

  // Render timetable grid
  const renderTimetableGrid = () => {
    return (
      <ScrollView horizontal style={styles.tableContainer}>
        <View>
          <View style={styles.headerRow}>
            <View style={styles.headerCell}>
              <Text style={styles.headerText}>Day/Section</Text>
            </View>
            {timeSlots.map((time) => (
              <View key={`time-${time}`} style={styles.headerCell}>
                <Text style={styles.headerText}>{time}</Text>
              </View>
            ))}
          </View>

          <ScrollView>
            {days.map((day) =>
              sections.map((section) => (
                <View key={`${day}-${section}`} style={styles.dataRow}>
                  <View style={styles.sectionCell}>
                    <Text style={styles.dayText}>{day}</Text>
                    <Text style={styles.sectionText}>{section}</Text>
                  </View>
                  {timeSlots.map((time) => {
                    const entry = findTimetableEntry(day, section, time);
                    return (
                      <View
                        key={`${day}-${section}-${time}`}
                        style={styles.dataCell}
                      >
                        {renderCourseInfo(entry)}
                      </View>
                    );
                  })}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>
    );
  };

  // Render loading state
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.loadingText}>Loading timetable...</Text>
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="event-busy" size={60} color="#9e9e9e" />
      <Text style={styles.emptyText}>
        No timetable entries available for the selected shift.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
        <LinearGradient
                  colors={['rgba(10, 19, 36, 0.95)', 'rgba(25, 47, 89, 0.85)']}
                 
                >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Smart Course Planner</Text>
        <Text style={styles.headerSubtitle}>Full View Timetable</Text>
      </View>
      </LinearGradient>

      {/* Error Message */}
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={20} color="#f44336" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Shift Selector */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Shift:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedShift}
                onValueChange={(itemValue) => setSelectedShift(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Morning" value="Morning" />
                <Picker.Item label="Evening" value="Evening" />
              </Picker>
            </View>
          </View>
        </View>
      </View>

      {/* Timetable Grid */}
      <View style={styles.timetableContainer}>
        {isLoading ? (
          renderLoading()
        ) : timeSlots.length > 0 && sections.length > 0 ? (
          renderTimetableGrid()
        ) : (
          renderEmpty()
        )}
      </View>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    color:'#F59E0B',
    textAlign: 'center',
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
  },
  filterContainer: {
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
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 5,
    minWidth: 120,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#616161',
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 5,
    backgroundColor: '#F5F5F5',
    height: 40,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    // height: 40,
  },
  timetableContainer: {
    flex: 1,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tableContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderBottomWidth: 1,
    borderBottomColor: '#BBDEFB',
  },
  headerCell: {
    width: 120,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#BBDEFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#1976D2',
    fontSize: 14,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionCell: {
    width: 120,
    padding: 10,
    borderWidth: 1,
    borderColor: '#bbdefb',
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
  },
  dayText: {
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 4,
  },
  sectionText: {
    color: '#757575',
    fontSize: 12,
  },
  dataCell: {
    width: 120,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    height: 100,
  },
  courseInfo: {
    backgroundColor: '#E8F5E9',
    borderRadius: 5,
    padding: 8,
    height: '100%',
    justifyContent: 'space-between',
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  courseName: {
    fontWeight: 'bold',
    color: '#2E7D32',
    fontSize: 14,
  },
  room: {
    fontSize: 12,
    color: '#616161',
  },
  teacher: {
    fontSize: 12,
    color: '#616161',
  },
  emptyDataCell: {
    backgroundColor: 'rgb(247, 242, 243)',
    borderRadius: 5,
    padding: 8,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCell: {
    color: 'black',
    fontSize: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#757575',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    color: '#757575',
    fontSize: 16,
    textAlign: 'center',
  },
});