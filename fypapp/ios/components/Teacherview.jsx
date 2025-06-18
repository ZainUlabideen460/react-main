import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const Teacherview = ({ url }) => {
  const [timetable, setTimetable] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedShift, setSelectedShift] = useState('Morning');
  const [selectedDay, setSelectedDay] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredTimetable, setFilteredTimetable] = useState([]);
  const [teacherName, setTeacherName] = useState(null);
  const [cancelledClasses, setCancelledClasses] = useState([]);
  const [rescheduledClasses, setRescheduledClasses] = useState([]);
  const [selectedClassForCancellation, setSelectedClassForCancellation] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelledClassesModal, setShowCancelledClassesModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [submittingCancellation, setSubmittingCancellation] = useState(false);
  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (teacherName) {
      filterTimetableData();
    }
  }, [selectedShift, selectedDay, teacherName, timetable]);

  // useEffect(() => {
  //   // Automatically reactivate classes cancelled more than a day ago
  //   const checkExpiredCancellations = async () => {
  //     const now = new Date();
  //     const oneDayInMs = 24 * 60 * 60 * 1000;

  //     for (const cancellation of cancelledClasses) {
  //       const cancellationDate = new Date(cancellation.createdAt);
  //       if (now - cancellationDate > oneDayInMs) {
  //         try {
  //           const token = await AsyncStorage.getItem('token');
  //           await axios.delete(`${url}/cancel-class/${cancellation.id}`, {
  //             headers: { Authorization: `Bearer ${token}` },
  //           });
  //         } catch (error) {
  //           console.error(`Error auto-reactivating class ${cancellation.id}:`, error);
  //         }
  //       }
  //     }
  //     // Refresh data after checking
  //     await Promise.all([fetchTimetableData(teacherName), fetchCancelledClasses()]);
  //   };

  //   if (teacherName && cancelledClasses.length > 0) {
  //     checkExpiredCancellations();
  //   }
  // }, [cancelledClasses, teacherName, url]);

  useEffect(() => {
  const checkExpiredCancellations = async () => {
    const now = new Date();
    // Adjust for PKT (UTC+5)
    const pktOffset = 5 * 60; // PKT is UTC+5 hours in minutes
    const nowInPKT = new Date(now.getTime() + pktOffset * 60 * 1000);
    
    // Check if current time is after 12 PM
    const isAfter12PM = nowInPKT.getHours() >= 12;

    if (!isAfter12PM) return; // Skip if it's before 12 PM

    for (const cancellation of cancelledClasses) {
      const cancellationDate = new Date(cancellation.createdAt);
      // Ensure valid date
      if (isNaN(cancellationDate.getTime())) {
        console.error(`Invalid cancellation date for class ${cancellation.id}`);
        continue;
      }

      // Adjust cancellation date for PKT
      const cancellationDateInPKT = new Date(cancellationDate.getTime() + pktOffset * 60 * 1000);
      
      // Check if cancellation is from a previous day or earlier today
      const isPreviousDay = 
        cancellationDateInPKT.getFullYear() < nowInPKT.getFullYear() ||
        cancellationDateInPKT.getMonth() < nowInPKT.getMonth() ||
        cancellationDateInPKT.getDate() < nowInPKT.getDate();

      if (isPreviousDay) {
        try {
          const token = await AsyncStorage.getItem('token');
          await axios.delete(`${url}/cancel-class/${cancellation.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Alert.alert('Class Reactivated', `Class ${cancellation.timetableentry.courseoffering?.coursename} has been automatically reactivated.`);
        } catch (error) {
          console.error(`Error auto-reactivating class ${cancellation.id}:`, error);
        }
      }
    }
    // Refresh data after checking
    await Promise.all([fetchTimetableData(teacherName), fetchCancelledClasses()]);
  };

  if (teacherName && cancelledClasses.length > 0) {
    checkExpiredCancellations();
    // Optional: Run periodically (e.g., every hour)
    const interval = setInterval(checkExpiredCancellations, 60 * 60 * 1000); // Every hour
    return () => clearInterval(interval); // Cleanup on unmount
  }
}, [cancelledClasses, teacherName, url]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setErrorMessage('Please log in to view your timetable.');
        setIsLoading(false);
        return;
      }

      const userResponse = await axios.get(`${url}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { teachersNo } = userResponse.data;
      if (!teachersNo) {
        setErrorMessage('Teacher ID not found. Please contact support.');
        setIsLoading(false);
        return;
      }

      const teachersResponse = await axios.get(`${url}/teachers`);
      const teacher = teachersResponse.data.find((t) => t.teacherid === teachersNo.toString());

      if (!teacher) {
        setErrorMessage('Teacher profile not found.');
        setIsLoading(false);
        return;
      }

      setTeacherName(teacher.name);
      setTeachers(teachersResponse.data);
      await Promise.all([
        fetchTimetableData(teacher.name),
        fetchCancelledClasses(),
        fetchRescheduledClasses(),
      ]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setErrorMessage('An error occurred while fetching user data.');
      setIsLoading(false);
    }
  };

  const fetchTimetableData = async (teacherName) => {
    try {
      const [timetableRes, roomsRes] = await Promise.all([
        axios.get(`${url}/timetable-with-cancellations`),
        axios.get(`${url}/rooms`),
      ]);

      const teacherTimetable = timetableRes.data.filter(
        (entry) => entry.teacher === teacherName
      );

      setTimetable(teacherTimetable);
      setRooms(roomsRes.data);
      filterTimetableData(teacherTimetable);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching timetable data:', error);
      setErrorMessage('An error occurred while fetching timetable data.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCancelledClasses = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${url}/my-cancelled-classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCancelledClasses(response.data.cancelledClasses || []);
    } catch (error) {
      console.error('Error fetching cancelled classes:', error);
    }
  };

  const fetchRescheduledClasses = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${url}/my-rescheduled-classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRescheduledClasses(response.data.rescheduledClasses || []);
    } catch (error) {
      console.error('Error fetching rescheduled classes:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUserData(), fetchRescheduledClasses()]);
    setRefreshing(false);
  };

  const filterTimetableData = (data = timetable) => {
    const shiftSuffix = selectedShift === 'Morning' ? '(M)' : '(E)';

    let filtered = data.filter((entry) =>
      entry.section?.sectionDisplay?.endsWith(shiftSuffix)
    );

    if (selectedDay !== 'All') {
      filtered = filtered.filter((entry) => entry.day === selectedDay);
    }

    const uniqueTimeSlots = [...new Set(filtered.map((entry) => entry.startTime))]
      .sort((a, b) => {
        const [hoursA, minutesA] = a.split(':').map(Number);
        const [hoursB, minutesB] = b.split(':').map(Number);
        if (hoursA !== hoursB) {
          return hoursA - hoursB;
        }
        return minutesA - minutesB;
      });

    const uniqueSections = [
      ...new Set(filtered.map((entry) => entry.section.sectionDisplay)),
    ].sort();

    setTimeSlots(uniqueTimeSlots);
    setSections(uniqueSections);
    setFilteredTimetable(filtered);
  };

  const findTimetableEntry = (day, section, time) => {
    return filteredTimetable.find(
      (entry) =>
        entry.day === day &&
        entry.section.sectionDisplay === section &&
        entry.startTime === time
    );
  };

  const handleCancelClass = (entry) => {
    if (entry.isCancelled) {
      Alert.alert('Class Already Cancelled', 'This class is already cancelled.', [
        { text: 'OK' },
      ]);
      return;
    }

    setSelectedClassForCancellation(entry);
    setShowCancellationModal(true);
  };

  const submitCancellation = async () => {
    if (!cancellationReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for cancellation.');
      return;
    }

    setSubmittingCancellation(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${url}/cancel-class`,
        {
          timetableId: selectedClassForCancellation.id,
          reason: cancellationReason.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Class cancelled successfully!');
        setShowCancellationModal(false);
        setCancellationReason('');
        setSelectedClassForCancellation(null);
        await Promise.all([fetchTimetableData(teacherName), fetchCancelledClasses()]);
      }
    } catch (error) {
      console.error('Error cancelling class:', error);
      const errorMessage =
        error.response?.data?.error || 'Failed to cancel class. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmittingCancellation(false);
    }
  };

  const handleReactivateClass = async (cancellationId) => {
    Alert.alert(
      'Reactivate Class',
      'Are you sure you want to reactivate this cancelled class?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reactivate',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await axios.delete(`${url}/cancel-class/${cancellationId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (response.status === 200) {
                Alert.alert('Success', 'Class reactivated successfully!');
                await Promise.all([
                  fetchTimetableData(teacherName),
                  fetchCancelledClasses(),
                  fetchRescheduledClasses(),
                ]);
              }
            } catch (error) {
              console.error('Error reactivating class:', error);
              const errorMessage =
                error.response?.data?.error || 'Failed to reactivate class. Please try again.';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleRescheduleClass = async (cancellation) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${url}/available-slots/${cancellation.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.availableSlots.length === 0) {
        Alert.alert('No Slots Available', 'No available slots found for rescheduling.');
        return;
      }

      setAvailableSlots(response.data.availableSlots);
      setSelectedClassForCancellation(cancellation.timetableentry);
      setShowRescheduleModal(true);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      const errorMessage =
        error.response?.data?.error || 'Failed to fetch available slots. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const submitReschedule = async () => {
    if (!selectedSlot || !selectedRoomId) {
      Alert.alert('Error', 'Please select a time slot and room.');
      return;
    }

    setSubmittingReschedule(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${url}/reschedule-class`,
        {
          cancellationId: selectedClassForCancellation.id,
          newDay: selectedSlot.day,
          newStartTime: selectedSlot.startTime,
          newEndTime: selectedSlot.endTime,
          newRoomId: selectedRoomId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Class rescheduled successfully!');
        setShowRescheduleModal(false);
        setSelectedSlot(null);
        setSelectedRoomId(null);
        setSelectedClassForCancellation(null);
        await Promise.all([
          fetchTimetableData(teacherName),
          fetchCancelledClasses(),
          fetchRescheduledClasses(),
        ]);
      }
    } catch (error) {
      console.error('Error rescheduling class:', error);
      const errorMessage =
        error.response?.data?.error || 'Failed to reschedule class. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const handleCancelReschedule = async (rescheduleId) => {
    Alert.alert(
      'Cancel Reschedule',
      'Are you sure you want to cancel this rescheduled class?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await axios.delete(`${url}/reschedule-class/${rescheduleId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (response.status === 200) {
                Alert.alert('Success', 'Reschedule cancelled successfully!');
                await Promise.all([
                  fetchTimetableData(teacherName),
                  fetchCancelledClasses(),
                  fetchRescheduledClasses(),
                ]);
              }
            } catch (error) {
              console.error('Error cancelling reschedule:', error);
              const errorMessage =
                error.response?.data?.error || 'Failed to cancel reschedule. Please try again.';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const renderCourseInfo = (entry, day, section, time) => {
    if (!entry) {
      return (
        <View style={styles.emptyDataCell}>
          <Text style={styles.emptyCell}>No class</Text>
        </View>
      );
    }

    if (entry.isCancelled) {
      return (
        <View style={styles.cancelledCell}>

          
           <Text style={styles.courseName} numberOfLines={1}>
            {entry.courseoffering?.coursename || 'N/A'}
          </Text>
          <Text style={styles.room}>Room: {entry.room?.name || 'N/A'}</Text>
        <Text style={styles.teacher} numberOfLines={1}>
          {entry.teacher || 'N/A'}
        </Text>
         
          <Text style={styles.cancelledText}>CANCELLED</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.courseInfo}
        onPress={() => handleCancelClass(entry)}
        activeOpacity={0.7}
      >
        <View style={styles.courseHeader}>
          <Text style={styles.courseName} numberOfLines={1}>
            {entry.courseoffering?.coursename || 'N/A'}
          </Text>
          {/* <MaterialIcons name="cancel" size={16} color="#4CAF50" /> */}
        </View>
        <Text style={styles.room}>Room: {entry.room?.name || 'N/A'}</Text>
        <Text style={styles.teacher} numberOfLines={1}>
          {entry.teacher || 'N/A'}
        </Text>
        <Text style={styles.tapToCancel}>Tap to cancel</Text>
      </TouchableOpacity>
    );
  };

  const renderTimetableGrid = () => {
    const dayToDisplay = selectedDay === 'All' ? days : [selectedDay];

    return (
      <ScrollView
        horizontal
        style={styles.tableContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
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
                        {renderCourseInfo(entry, day, section, time)}
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

  const renderCancellationModal = () => (
    <Modal
      visible={showCancellationModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCancellationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cancel Class</Text>
            <TouchableOpacity
              onPress={() => {
                setShowCancellationModal(false);
                setCancellationReason('');
              }}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {selectedClassForCancellation && (
            <View style={styles.classDetails}>
              <Text style={styles.classDetailTitle}>
                {selectedClassForCancellation.courseoffering?.coursename}
              </Text>
              <Text style={styles.classDetailText}>
                {selectedClassForCancellation.day} • {selectedClassForCancellation.startTime} -{' '}
                {selectedClassForCancellation.endTime}
              </Text>
              <Text style={styles.classDetailText}>
                Section: {selectedClassForCancellation.section?.sectionDisplay}
              </Text>
              <Text style={styles.classDetailText}>
                Room: {selectedClassForCancellation.room?.name}
              </Text>
            </View>
          )}

          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>Reason for Cancellation *</Text>
            <TextInput
              style={styles.reasonInput}
              multiline
              numberOfLines={4}
              value={cancellationReason}
              onChangeText={setCancellationReason}
              placeholder="Please provide a reason for cancelling this class..."
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowCancellationModal(false);
                setCancellationReason('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.confirmButton,
                (!cancellationReason.trim() || submittingCancellation) && styles.disabledButton,
              ]}
              onPress={submitCancellation}
              disabled={!cancellationReason.trim() || submittingCancellation}
            >
              {submittingCancellation ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Cancellation</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderRescheduleModal = () => (
    <Modal
      visible={showRescheduleModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowRescheduleModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reschedule Class</Text>
            <TouchableOpacity
              onPress={() => {
                setShowRescheduleModal(false);
                setSelectedSlot(null);
                setSelectedRoomId(null);
              }}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {selectedClassForCancellation && (
            <View style={styles.classDetails}>
              <Text style={styles.classDetailTitle}>
                {selectedClassForCancellation.courseoffering?.coursename}
              </Text>
              <Text style={styles.classDetailText}>
                Original: {selectedClassForCancellation.day} •{' '}
                {selectedClassForCancellation.startTime} -{' '}
                {selectedClassForCancellation.endTime}
              </Text>
              <Text style={styles.classDetailText}>
                Section: {selectedClassForCancellation.section?.sectionDisplay}
              </Text>
            </View>
          )}

          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>Select New Time Slot *</Text>
            <Picker
              selectedValue={selectedSlot?.day + selectedSlot?.startTime}
              onValueChange={(itemValue) => {
                const selected = availableSlots.find(
                  (slot) => slot.day + slot.startTime === itemValue
                );
                setSelectedSlot(selected);
                setSelectedRoomId(null);
              }}
              style={styles.picker}
            >
              <Picker.Item label="Select a slot" value="" />
              {availableSlots.map((slot) => (
                <Picker.Item
                  key={`${slot.day}-${slot.startTime}`}
                  label={`${slot.day} ${slot.startTime} - ${slot.endTime}`}
                  value={`${slot.day}${slot.startTime}`}
                />
              ))}
            </Picker>
          </View>

          {selectedSlot && (
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonLabel}>Select Room *</Text>
              <Picker
                selectedValue={selectedRoomId}
                onValueChange={(itemValue) => setSelectedRoomId(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select a room" value="" />
                {selectedSlot.availableRooms.map((room) => (
                  <Picker.Item
                    key={room.id}
                    label={`${room.roomNumber} (${room.type}, Capacity: ${room.capacity})`}
                    value={room.id}
                  />
                ))}
              </Picker>
            </View>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowRescheduleModal(false);
                setSelectedSlot(null);
                setSelectedRoomId(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.confirmButton,
                (!selectedSlot || !selectedRoomId || submittingReschedule) &&
                  styles.disabledButton,
              ]}
              onPress={submitReschedule}
              disabled={!selectedSlot || !selectedRoomId || submittingReschedule}
            >
              {submittingReschedule ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Reschedule</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCancelledClassesModal = () => (
    <Modal
      visible={showCancelledClassesModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCancelledClassesModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Recent Cancellations</Text>
            <TouchableOpacity
              onPress={() => setShowCancelledClassesModal(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          {cancelledClasses.length === 0 ? (
            <Text style={styles.emptyText}>No cancelled classes found.</Text>
          ) : (
            <ScrollView style={styles.cancelledClassesScroll}>
              {cancelledClasses.map((cancellation) => {
                const isRescheduled = rescheduledClasses.some(
                  (reschedule) => reschedule.id === cancellation.id
                );
                return (
                  <View key={cancellation.id} style={styles.cancelledClassCard}>
                    <Text style={styles.cancelledCardTitle} numberOfLines={1}>
                      {cancellation.timetableentry.courseoffering?.coursename}
                    </Text>
                    <Text style={styles.cancelledCardDetails}>
                      {cancellation.timetableentry.day} •{' '}
                      {cancellation.timetableentry.startTime}
                    </Text>
                    <Text style={styles.cancelledCardReason} numberOfLines={2}>
                      {cancellation.reason}
                    </Text>
                    <View style={styles.cancelledClassButtons}>
                      {!isRescheduled && (
                        <TouchableOpacity
                          style={[styles.reactivateButton, { backgroundColor: '#2196F3' }]}
                          onPress={() => {
                            setShowCancelledClassesModal(false);
                            handleRescheduleClass(cancellation);
                          }}
                        >
                          <Text style={styles.reactivateButtonText}>Reschedule</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.reactivateButton}
                        onPress={() => {
                          setShowCancelledClassesModal(false);
                          handleReactivateClass(cancellation.id);
                        }}
                      >
                        <Text style={styles.reactivateButtonText}>Reactivate</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderCancelledClassesList = () => {
    if (cancelledClasses.length === 0) return null;

    return (
      <View style={styles.cancelledClassesContainer}>
        <TouchableOpacity
          style={styles.viewCancellationsButton}
          onPress={() => setShowCancelledClassesModal(true)}
        >
          <Text style={styles.viewCancellationsButtonText}>View Cancelled Classes</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRescheduledClassesList = () => {
    if (rescheduledClasses.length === 0) return null;

    return (
      <View style={styles.cancelledClassesContainer}>
        <Text style={styles.cancelledClassesTitle}>Rescheduled Classes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {rescheduledClasses.slice(0, 5).map((reschedule) => (
            <View key={reschedule.id} style={styles.cancelledClassCard}>
              <Text style={styles.cancelledCardTitle} numberOfLines={1}>
                {reschedule.newClass.course}
              </Text>
              <Text style={styles.cancelledCardDetails}>
                New: {reschedule.newClass.day} • {reschedule.newClass.startTime} -{' '}
                {reschedule.newClass.endTime}
              </Text>
              <Text style={styles.cancelledCardDetails}>
                Original: {reschedule.originalClass.day} •{' '}
                {reschedule.originalClass.startTime} - {reschedule.originalClass.endTime}
              </Text>
              <Text style={styles.cancelledCardReason} numberOfLines={2}>
                Cancellation Reason: {reschedule.cancellationReason}
              </Text>
              <TouchableOpacity
                style={[styles.reactivateButton, { backgroundColor: '#f44336' }]}
                onPress={() => handleCancelReschedule(reschedule.id)}
              >
                <Text style={styles.reactivateButtonText}>Cancel Reschedule</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.loadingText}>Loading your timetable...</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="event-busy" size={60} color="#9e9e9e" />
      <Text style={styles.emptyText}>
        No timetable entries available for the selected filters.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['rgba(10, 19, 36, 0.95)', 'rgba(25, 47, 89, 0.85)']}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Smart Course Planner</Text>
          <Text style={styles.headerSubtitle}>
            Your Timetable <Text style={styles.headerSubtitle_title}>{teacherName}</Text>
          </Text>
        </View>
      </LinearGradient>

      {errorMessage ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={20} color="#f44336" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
<ScrollView vertical style={styles.tableContainer}>
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
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Day:</Text>
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
        </View>
      </View>

      {renderCancelledClassesList()}
      {renderRescheduledClassesList()}

      <View style={styles.timetableContainer}>
        {isLoading ? (
          renderLoading()
        ) : timeSlots.length > 0 && sections.length > 0 ? (
          renderTimetableGrid()
        ) : (
          renderEmpty()
        )}
      </View>

      {renderCancellationModal()}
      {renderRescheduleModal()}
      {renderCancelledClassesModal()}
      </ScrollView>
    </View>
  );
};

export default Teacherview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop: 30,
  },
  headerContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1565C0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    textAlign: 'center',
    marginTop: 4,
  },
  headerSubtitle_title: {
    color: '#F59E0B',
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

  cancelledClassesContainer: {
    marginLeft:10,
    marginRight:10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  viewCancellationsButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewCancellationsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelledClassesScroll: {
    maxHeight: 300,
  },
  cancelledClassCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  cancelledCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 4,
  },
  cancelledCardDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  cancelledCardReason: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  cancelledClassButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  reactivateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  reactivateButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
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
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyDataCell: {
    backgroundColor: 'rgb(247, 242, 243)',
    borderRadius: 5,
    padding: 8,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelledCell: {
    backgroundColor: '#FFEBEE',
    borderRadius: 5,
    padding: 8,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#f44336',
  },
  cancelledText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  cancelledReason: {
    color: '#666',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  courseName: {
    fontWeight: 'bold',
    color: '#2E7D32',
    fontSize: 12,
  },
  room: {
    fontSize: 11,
    color: '#616161',
  },
  teacher: {
    fontSize: 11,
    color: '#616161',
  },
  tapToCancel: {
    fontSize: 9,
    color: '#4CAF50',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptyCell: {
    color: 'black',
    fontSize: 12,
    textAlign: 'center',
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
  classDetails: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  classDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  classDetailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  reasonContainer: {
    marginBottom: 20,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
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
    backgroundColor: '#f44336',
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