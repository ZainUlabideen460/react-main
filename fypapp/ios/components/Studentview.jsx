import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function TimetableManagement({ url }) {
  const [timetable, setTimetable] = useState([]);
  const [canceledClasses, setCanceledClasses] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedDay, setSelectedDay] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredTimetable, setFilteredTimetable] = useState([]);
  const [studentSection, setStudentSection] = useState(null);
  const [showCancelledOnly, setShowCancelledOnly] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [studentData, setStudentData] = useState({
    id: null,
    name: '',
    email: '',
    cnic: '',
    aridno: '',
    semester: '',
    shift: '',
    section: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const shifts = ['Morning', 'Evening'];
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (studentSection) {
      filterTimetableData();
    }
  }, [selectedDay, timetable, studentSection, showCancelledOnly]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setErrorMessage('Please log in to view your timetable.');
        setIsLoading(false);
        return;
      }

      const [userResponse, timetableRes, teachersRes, roomsRes, canceledClassesRes] = await Promise.all([
        axios.get(`${url}/user`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${url}/timetable`),
        axios.get(`${url}/teachers`),
        axios.get(`${url}/rooms`),
        axios.get(`${url}/cancelled-classes`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const { id, name, email, cnic, aridno, semester, shift, section } = userResponse.data;
      if (!section) {
        setErrorMessage('Student section not found. Please contact support.');
        setIsLoading(false);
        return;
      }

      setStudentData({
        id: id || null,
        name: name || '',
        email: email || '',
        cnic: cnic || '',
        aridno: aridno || '',
        semester: semester || '',
        shift: shift || '',
        section: section || '',
      });

      setStudentSection(section);
      setTimetable(timetableRes.data);
      setTeachers(teachersRes.data);
      setRooms(roomsRes.data);
      setCanceledClasses(canceledClassesRes.data.cancelledClasses || []);
      filterTimetableData(timetableRes.data);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('An error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const filterTimetableData = (data = timetable) => {
    if (!studentSection) {
      setErrorMessage('Student section not found. Please contact support.');
      setFilteredTimetable([]);
      setTimeSlots([]);
      setSections([]);
      return;
    }

    let filtered = data.filter((entry) => entry.section?.sectionDisplay === studentSection);

    const cancelledMap = new Map(
      canceledClasses.map((c) => [
        `${c.classDetails.day}-${c.classDetails.startTime}-${c.classDetails.section}`,
        c,
      ])
    );

    filtered = filtered.map((entry) => {
      const key = `${entry.day}-${entry.startTime}-${entry.section.sectionDisplay}`;
      const cancellation = cancelledMap.get(key);
      return {
        ...entry,
        isCancelled: !!cancellation,
        cancellationInfo: cancellation
          ? {
              reason: cancellation.reason,
              cancelledBy: cancellation.cancelledBy,
              cancelledAt: cancellation.cancelledAt,
            }
          : null,
      };
    });

    if (selectedDay !== 'All') {
      filtered = filtered.filter((entry) => entry.day === selectedDay);
    }

    if (showCancelledOnly) {
      filtered = filtered.filter((entry) => entry.isCancelled);
    }

    const uniqueTimeSlots = [...new Set(filtered.map((entry) => entry.startTime))].sort(
      (a, b) => {
        const timeA = parseInt(a.split(':')[0]);
        const timeB = parseInt(b.split(':')[0]);
        return timeA - timeB;
      }
    );

    const uniqueSections = [studentSection];

    setTimeSlots(uniqueTimeSlots);
    setSections(uniqueSections);
    setFilteredTimetable(filtered);
  };

  const findTimetableEntry = (day, section, time) => {
    return filteredTimetable.find(
      (entry) => entry.day === day && entry.section.sectionDisplay === section && entry.startTime === time
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUpdateStudent = async () => {
    if (
      !studentData.name ||
      !studentData.email ||
      !studentData.cnic ||
      !studentData.aridno ||
      !studentData.semester ||
      !studentData.shift ||
      !studentData.section
    ) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(
        `${url}/student/${studentData.id}`,
        {
          name: studentData.name,
          email: studentData.email,
          cnic: studentData.cnic,
          aridno: studentData.aridno,
          semester: studentData.semester,
          shift: studentData.shift,
          section: studentData.section,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Profile updated successfully!');
        setStudentSection(studentData.section);
        setShowUpdateModal(false);
        await fetchAllData();
      }
    } catch (error) {
      console.error('Error updating student:', error);
      const errorMessage =
        error.response?.data?.error || 'Failed to update profile. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderCourseInfo = (entry) => {
    if (!entry) return <Text style={styles.emptyCell}>No class</Text>;

    const isCancelled = entry.isCancelled;

    return (
      <TouchableOpacity
        style={[styles.courseInfo, isCancelled ? styles.cancelledClassCard : styles.activeClassCard]}
        onPress={() => {
          if (isCancelled && entry.cancellationInfo) {
            Alert.alert(
              'Class Cancelled',
              `Reason: ${entry.cancellationInfo.reason}\n\nCancelled by: ${entry.cancellationInfo.cancelledBy}\n\nCancelled at: ${formatDate(
                entry.cancellationInfo.cancelledAt
              )}`,
              [{ text: 'OK' }]
            );
          }
        }}
      >
        <View style={styles.classCardHeader}>
          <Text
            style={[styles.courseName, isCancelled && styles.cancelledCourseName]}
            numberOfLines={1}
          >
            {entry.courseoffering?.coursename || 'N/A'}
          </Text>
          {isCancelled && (
            <View style={styles.cancelledBadge}>
              <MaterialIcons name="cancel" size={16} color="#fff" />
              <Text style={styles.cancelledBadgeText}>CANCELLED</Text>
            </View>
          )}
        </View>
        <Text style={styles.room}>Room: {entry.room?.name || 'N/A'}</Text>
        <Text style={styles.teacher} numberOfLines={1}>
          {entry.teacher || 'N/A'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRecentCancellations = () => {
    if (canceledClasses.length === 0) return null;

    return (
      <View style={styles.recentCancellationsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {canceledClasses.slice(0, 5).map((cancellation) => (
            <TouchableOpacity
              key={cancellation.id}
              style={styles.cancellationCard}
              onPress={() =>
                Alert.alert(
                  'Class Cancelled',
                  `Course: ${cancellation.classDetails.course}\n\nReason: ${
                    cancellation.reason
                  }\n\nCancelled by: ${cancellation.cancelledBy}\n\nCancelled at: ${formatDate(
                    cancellation.cancelledAt
                  )}`,
                  [{ text: 'OK' }]
                )
              }
            >
              <Text style={styles.cancellationCardTitle} numberOfLines={1}>
                {cancellation.classDetails.course}
              </Text>
              <Text style={styles.cancellationCardDetails}>
                {cancellation.classDetails.day} • {cancellation.classDetails.startTime}
              </Text>
              <Text style={styles.cancellationCardRoom}>
               Cancelled by : {cancellation.cancelledBy}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderUpdateModal = () => (
    <Modal
      visible={showUpdateModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowUpdateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Profile</Text>
            <TouchableOpacity
              onPress={() => setShowUpdateModal(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formLabel}>Name *</Text>
            <TextInput
              style={styles.formInput}
              value={studentData.name}
              onChangeText={(text) => setStudentData({ ...studentData, name: text })}
              placeholder="Enter your name"
              placeholderTextColor="#999"
            />

            <Text style={styles.formLabel}>Email *</Text>
            <TextInput
              style={styles.formInput}
              value={studentData.email}
              onChangeText={(text) => setStudentData({ ...studentData, email: text })}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
            />

            <Text style={styles.formLabel}>CNIC *</Text>
            <TextInput
              style={styles.formInput}
              value={studentData.cnic}
              onChangeText={(text) => setStudentData({ ...studentData, cnic: text })}
              placeholder="Enter your CNIC"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />

            <Text style={styles.formLabel}>Arid No *</Text>
            <TextInput
              style={styles.formInput}
              value={studentData.aridno}
              onChangeText={(text) => setStudentData({ ...studentData, aridno: text })}
              placeholder="Enter your Arid No"
              placeholderTextColor="#999"
            />

            <Text style={styles.formLabel}>Semester *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={studentData.semester}
                onValueChange={(value) => setStudentData({ ...studentData, semester: value })}
                style={styles.picker}
              >
                <Picker.Item label="Select Semester" value="" />
                {semesters.map((sem) => (
                  <Picker.Item key={sem} label={sem} value={sem} />
                ))}
              </Picker>
            </View>

            <Text style={styles.formLabel}>Shift *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={studentData.shift}
                onValueChange={(value) => setStudentData({ ...studentData, shift: value })}
                style={styles.picker}
              >
                <Picker.Item label="Select Shift" value="" />
                {shifts.map((shift) => (
                  <Picker.Item key={shift} label={shift} value={shift} />
                ))}
              </Picker>
            </View>

            <Text style={styles.formLabel}>Section *</Text>
            <TextInput
              style={styles.formInput}
              value={studentData.section}
              onChangeText={(text) => setStudentData({ ...studentData, section: text })}
              placeholder="Enter your section"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowUpdateModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.confirmButton,
                submitting && styles.disabledButton,
              ]}
              onPress={handleUpdateStudent}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Update Profile</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderTimetableGrid = () => {
    const dayToDisplay = selectedDay === 'All' ? days : [selectedDay];

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
            {dayToDisplay.map((day) =>
              sections.map((section) => (
                <View key={`${day}-${section}`} style={styles.dataRow}>
                  <View style={styles.sectionCell}>
                    <Text style={styles.dayText}>{day}</Text>
                    <Text style={styles.sectionText}>{section}</Text>
                  </View>
                  {timeSlots.map((time) => {
                    const entry = findTimetableEntry(day, section, time);
                    return (
                      <View key={`${day}-${section}-${time}`} style={styles.dataCell}>
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

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.loadingText}>Loading timetable data...</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons
        name={showCancelledOnly ? 'event-busy' : 'event-note'}
        size={60}
        color="#9e9e9e"
      />
      <Text style={styles.emptyText}>
        {showCancelledOnly
          ? 'No cancelled classes found for your section.'
          : 'No timetable entries available for your section.'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['rgba(10, 19, 36, 0.95)', 'rgba(25, 47, 89, 0.85)']}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Smart Course Planner</Text>
          <View style={styles.headerRow}>
            <Text></Text>
            <Text style={styles.headerSubtitle}>Section ({studentSection || 'Unknown Section'})</Text>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => setShowUpdateModal(true)}
            >
              <MaterialIcons name="person" size={35} color="rgba(25, 47, 89, 0.85)" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {errorMessage ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={20} color="#f44336" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.mainScrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedDay}
                  onValueChange={(itemValue) => setSelectedDay(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="All Days" value="All" />
                  {days.map((day) => (
                    <Picker.Item key={day} label={day} value={day} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.filterItem}>
              <TouchableOpacity
                style={[styles.toggleButton, showCancelledOnly && styles.toggleButtonActive]}
                onPress={() => setShowCancelledOnly(!showCancelledOnly)}
              >
                <MaterialIcons
                  name={showCancelledOnly ? 'visibility' : 'visibility-off'}
                  size={18}
                  color={showCancelledOnly ? '#fff' : '#666'}
                />
                <Text
                  style={[styles.toggleButtonText, showCancelledOnly && styles.toggleButtonTextActive]}
                >
                  {showCancelledOnly ? 'Show All' : 'Cancelled Only'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {!showCancelledOnly && renderRecentCancellations()}

        <View style={styles.timetableContainer}>
         
          {isLoading
            ? renderLoading()
            : timeSlots.length > 0 && sections.length > 0
            ? renderTimetableGrid()
            : renderEmpty()}
        </View>
      </ScrollView>

      {renderUpdateModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mainScrollContainer: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#F59E0B',
    marginLeft:35,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  errorText: {
    color: '#f44336',
    marginLeft: 5,
  },
  filterContainer: {
    padding: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toggleButtonActive: {
    backgroundColor: '#f44336',
    borderColor: '#f44336',
  },
  toggleButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  timetableContainer: {
    flex: 1,
    padding: 10,
  },
  tableContainer: {
    flex: 1,
  },
  headerCell: {
    width: 120,
    padding: 10,
    borderWidth: 1,
    borderColor: '#bbdefb',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#0d47a1',
  },
  dataRow: {
    flexDirection: 'row',
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
    color: '#0d47a1',
  },
  sectionText: {
    fontSize: 12,
    color: '#1565c0',
  },
  dataCell: {
    width: 120,
    height: 100,
    padding: 5,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  courseInfo: {
    flex: 1,
    borderRadius: 5,
    padding: 8,
    height: '100%',
    justifyContent: 'space-between',
  },
  activeClassCard: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  cancelledClassCard: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 3,
    borderLeftColor: '#f44336',
  },
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  courseName: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 12,
    flex: 1,
  },
  cancelledCourseName: {
    color: '#d32f2f',
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cancelledBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  room: {
    fontSize: 10,
    color: '#666',
  },
  teacher: {
    fontSize: 10,
    color: '#666',
  },
  emptyCell: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  recentCancellationsContainer: {
    marginHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recentCancellationsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 3,
    marginLeft: 5,
  },
  cancellationCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    width: 200,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  cancellationCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 4,
  },
  cancellationCardDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  cancellationCardRoom: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  formContainer: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#2196F3',
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 14,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});