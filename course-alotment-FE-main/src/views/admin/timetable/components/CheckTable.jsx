
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Input,
  Alert,
  AlertIcon,
  useDisclosure,
  Stack,
} from "@chakra-ui/react";
import axios from 'axios';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import toast from 'react-hot-toast';

export default function TimetableManagement() {
  // State variables for user inputs
  const [shift, setShift] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [classDuration, setClassDuration] = useState('');
  const [includeBreak, setIncludeBreak] = useState(false);
  const [breakDuration, setBreakDuration] = useState('');

  // State variables for fetched data
  const [timetable, setTimetable] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [sections, setSections] = useState([]);

  // State for modal and selected entry
  const [selectedEntry, setSelectedEntry] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newEntry, setNewEntry] = useState({
    courseId: '',
    teacher: '',
    roomId: '',
    classType: 'theory'
  });
  // State for dynamically generated time slots
  const [timeSlots, setTimeSlots] = useState([]);

  // State for error messages
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Days of the week
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Function to extract shift from sectionDisplay
  const getShiftFromSection = (sectionDisplay) => {
    const match = sectionDisplay.match(/\((M|E)\)$/);
    if (match) return match[1];
    return null;
  };

  // Define filteredSections based on shift
  const filteredSections = sections.filter(section => {
    const sectionShift = getShiftFromSection(section);
    if (shift === 'Morning') return sectionShift === 'M';
    if (shift === 'Evening') return sectionShift === 'E';
    return true; // If no shift is selected, include all
  });

  // Fetch data from backend when component mounts
  useEffect(() => {
    fetchTimetable();
    fetchTeachers();
    fetchRooms();
    fetchSections();
  }, []);

  // Fetch timetable entries
  const fetchTimetable = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:3001/timetable');
      
      // The backend sends startTime and endTime as "HH:MM"
      const enrichedTimetable = response.data.map(entry => ({
        ...entry,
      }));

      console.log("Fetched Timetable Entries:", JSON.stringify(enrichedTimetable, null, 2)); // Debug log
      setTimetable(enrichedTimetable);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch timetable:", error);
      setErrorMessage("Failed to fetch timetable.");
      setIsLoading(false);
    }
  };

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      setErrorMessage("Failed to fetch teachers.");
    }
  };

  // Fetch rooms
  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:3001/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      setErrorMessage("Failed to fetch rooms.");
    }
  };

  // Fetch sections
  const fetchSections = async () => {
    try {
      const response = await axios.get('http://localhost:3001/sections');
      setSections(response.data.map((section) => section.sectionDisplay));
    } catch (error) {
      console.error("Failed to fetch sections:", error);
      setErrorMessage("Failed to fetch sections.");
    }
  };

  // Generate time slots based on user inputs
  useEffect(() => {
    if (startTime && endTime && classDuration) {
      const generateTimeSlots = () => {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const start = startHour * 60 + startMinute;
        const end = endHour * 60 + endMinute;
        const duration = parseInt(classDuration, 10);
        const breakDur = includeBreak ? parseInt(breakDuration, 10) : 0;

        const slots = [];
        let current = start;

        while (current + duration <= end) {
          const hour = Math.floor(current / 60).toString().padStart(2, '0');
          const minute = (current % 60).toString().padStart(2, '0');
          slots.push(`${hour}:${minute}`);
          current += duration + breakDur;
        }

        setTimeSlots(slots);
      };

      generateTimeSlots();
    } else {
      setTimeSlots([]);
    }
  }, [startTime, endTime, classDuration, includeBreak, breakDuration]);

  // Class limit checking
  const checkClassLimit = async (courseId, sectionId, classType) => {
    try {
      const response = await axios.get('http://localhost:3001/class-count', {
        params: { courseId, sectionId, classType }
      });
      
      const { scheduledClasses, maxClasses } = response.data;
      
      if (scheduledClasses >= maxClasses) {
        return {
          canAdd: false,
          message: `Cannot add more ${classType} classes. Maximum limit (${maxClasses}) reached.`
        };
      }
      
      return { canAdd: true, message: '' };
    } catch (error) {
      console.error("Failed to check class limit:", error);
      return {
        canAdd: false,
        message: 'Failed to verify class limits. Please try again.'
      };
    }
  };




  // Time slot generation
  useEffect(() => {
    if (startTime && endTime && classDuration) {
      generateTimeSlots();
    }
  }, [startTime, endTime, classDuration, includeBreak, breakDuration]);

  const generateTimeSlots = () => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
    const duration = parseInt(classDuration, 10);
    const breakDur = includeBreak ? parseInt(breakDuration, 10) : 0;

    const slots = [];
    let current = start;

    while (current + duration <= end) {
      const hour = Math.floor(current / 60).toString().padStart(2, '0');
      const minute = (current % 60).toString().padStart(2, '0');
      slots.push(`${hour}:${minute}`);
      current += duration + breakDur;
    }

    setTimeSlots(slots);
  };
  // const [timeSlots, setTimeSlots] = useState([]);

  // Modal states
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  // const [selectedEntry, setSelectedEntry] = useState(null);                    
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Handle empty cell click
  const handleEmptyCellClick = (day, section, time) => {
    setSelectedSlot({
      day,
      section,
      startTime: time,
      endTime: calculateEndTime(time, parseInt(classDuration))
    });
    setNewEntry({
      courseId: '',
      teacher: '',
      roomId: '',
      classType: 'theory'
    });
    onAddOpen();
  };

  // Calculate end time
  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  };

  // Handle adding new entry
  const handleAddEntry = async () => {
    try {
      if (!selectedSlot || !newEntry.courseId || !newEntry.teacher || !newEntry.roomId) {
        setErrorMessage("Please fill in all required fields.");
        return;
      }

      const classLimitCheck = await checkClassLimit(
        newEntry.courseId,
        selectedSlot.section,
        newEntry.classType
      );

      if (!classLimitCheck.canAdd) {
        setErrorMessage(classLimitCheck.message);
        return;
      }

      const response = await axios.post('http://localhost:3001/timetable', {
        ...newEntry,
        day: selectedSlot.day,
        section: selectedSlot.section,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime
      });

      setTimetable([...timetable, response.data]);
      onAddClose();
      toast({
        title: "Success",
        description: "New class added successfully",
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error("Failed to add entry:", error);
      setErrorMessage(error.response?.data?.message || "Failed to add entry");
    }
  };

  // Handle timetable generation
  const handleGenerateTimetable = async () => {
    if (!shift || !startTime || !endTime || !classDuration) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (includeBreak && !breakDuration) {
      setErrorMessage("Please specify the break duration.");
      return;
    }

    try {
      console.log("Generating timetable with the following parameters:");
      console.log({ shift, startTime, endTime, classDuration, includeBreak, breakDuration });

      await axios.post('http://localhost:3001/generate-timetable', {
        shift,
        startTime,
        endTime,
        classDuration: parseInt(classDuration, 10),
        includeBreak,
        breakDuration: includeBreak ? parseInt(breakDuration, 10) : 0,
      });
      setErrorMessage('');
      fetchTimetable();
      alert('Timetable generated successfully.');
    } catch (error) {
      console.error("Failed to generate timetable:", error);
      setErrorMessage("Failed to generate timetable.");
    }
  };

  // Handle deletion of all timetable entries
  const handleDeleteAll = async () => {
    if (window.confirm("Are you sure you want to delete all timetable entries? This action cannot be undone.")) {
      try {
        await axios.delete('http://localhost:3001/timetable');
        alert('All timetable entries have been deleted.');
        setTimetable([]);
      } catch (error) {
        console.error("Failed to delete all timetable entries:", error);
        setErrorMessage("Failed to delete all timetable entries.");
      }
    }
  };

  // Open modal to edit or delete a timetable entry
  const openEditModal = (entry) => {
    setSelectedEntry({
      ...entry,
      startTime: entry.startTime, // "HH:MM"
      endTime: entry.endTime,     // "HH:MM"
    });
    onOpen();
  };

  // Close the edit modal
  const closeEditModal = () => {
    setSelectedEntry(null);
    onClose();
  };

  // Save changes to the timetable entry
  const handleSaveChanges = async () => {
    if (!selectedEntry.day || !selectedEntry.teacher || !selectedEntry.roomId || !selectedEntry.startTime || !selectedEntry.endTime) {
      setErrorMessage("Please fill in all required fields in the edit modal.");
      return;
    }

    try {
      // Prepare the payload with correctly formatted times
      const updatePayload = {
        teacher: selectedEntry.teacher,
        roomId: parseInt(selectedEntry.roomId, 10),
        day: selectedEntry.day,
        startTime: selectedEntry.startTime, // "HH:MM"
        endTime: selectedEntry.endTime,     // "HH:MM"
      };

      console.log("Sending to backend:", updatePayload); // Debug log

      // Make the API call
      const response = await axios.put(`http://localhost:3001/timetable/${selectedEntry.id}`, updatePayload);

      // Update the local timetable state with the updated entry
      const updatedEntry = response.data;

      const updatedTimetable = timetable.map(entry => 
        entry.id === updatedEntry.id 
          ? {
              ...entry, 
              teacher: updatedEntry.teacher,
              roomId: updatedEntry.roomId,
              day: updatedEntry.day,
              startTime: updatedEntry.startTime,
              endTime: updatedEntry.endTime,
              room: updatedEntry.room, // Assuming room data is included
              courseoffering: updatedEntry.courseoffering, // Assuming courseOffering data is included
              section: updatedEntry.section, // Assuming section data is included
            }
          : entry
      );

      // Update the timetable state
      setTimetable(updatedTimetable);

      // Close the modal and reset error message
      setErrorMessage('');
      closeEditModal();
      alert('Timetable entry updated successfully.');
    } catch (error) {
      console.error("Failed to update timetable entry:", error.response?.data || error.message);
      setErrorMessage(error.response?.data?.message || "Failed to update timetable entry.");
    }
  };

  // Handle deletion of a single timetable entry
  const handleDeleteEntry = async () => {
    if (window.confirm("Are you sure you want to delete this timetable entry? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:3001/timetable/${selectedEntry.id}`);
        alert('Timetable entry deleted successfully.');
        // Remove the deleted entry from the local state
        const updatedTimetable = timetable.filter(entry => entry.id !== selectedEntry.id);
        setTimetable(updatedTimetable);
        closeEditModal();
      } catch (error) {
        console.error("Failed to delete timetable entry:", error);
        setErrorMessage("Failed to delete timetable entry.");
      }
    }
  };

  // Function to display course info in the timetable grid
  const getCourseInfo = (day, section, time) => {
    const entry = timetable.find((item) =>
      item.day === day &&
      item.section?.sectionDisplay === section &&
      item.startTime === time // Direct comparison as both are "HH:MM"
    );

    if (entry) {
      return (
        <Box
          bg="teal.100"
          p={2}
          borderRadius="md"
          cursor="pointer"
          onClick={() => openEditModal(entry)}
          _hover={{ bg: "teal.200" }}
        >
          <Text fontWeight="bold">{entry.courseoffering?.coursename || 'N/A'}</Text>
          <Text fontSize="sm">Room: {entry.room?.name || 'N/A'}</Text>
          <Text fontSize="sm">Teacher: {entry.teacher || 'N/A'}</Text>
        </Box>
      );
    }
    return null;
  };
  // Render cell content
  const getCellContent = (day, section, time) => {
    const entry = timetable.find(item =>
      item.day === day &&
      item.section?.sectionDisplay === section &&
      item.startTime === time
    );

    if (entry) {
      return (
        <Box
          bg="teal.100"
          p={2}
          borderRadius="md"
          cursor="pointer"
          onClick={() => {
            setSelectedEntry(entry);
            onEditOpen();
          }}
          _hover={{ bg: "teal.200" }}
        >
          <Text fontWeight="bold">{entry.courseoffering?.coursename || 'N/A'}</Text>
          <Text fontSize="sm">Room: {entry.room?.name || 'N/A'}</Text>
          <Text fontSize="sm">Teacher: {entry.teacher || 'N/A'}</Text>
          <Text fontSize="xs">Type: {entry.classType}</Text>
        </Box>
      );
    }

    return (
      <Box
        h="100%"
        w="100%"
        cursor="pointer"
        onClick={() => handleEmptyCellClick(day, section, time)}
        _hover={{ bg: "gray.100" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <AddIcon color="gray.400" />
      </Box>
    );
  };

  return (
    <Box w="100%" p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>University Timetable Management</Text>

      {/* Display error message */}
      {errorMessage && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {errorMessage}
        </Alert>
      )}

      {/* Inputs for generating timetable */}
      <Flex direction="column" gap={4} mb={4}>
        <FormControl>
          <FormLabel>Select Shift</FormLabel>
          <Select placeholder="Select Shift" value={shift} onChange={(e) => setShift(e.target.value)}>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Start Time</FormLabel>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>End Time</FormLabel>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Class Duration (Minutes)</FormLabel>
          <Select value={classDuration} onChange={(e) => setClassDuration(e.target.value)}>
            <option value="30">30 Minutes</option>
            <option value="40">40 Minutes</option>
            <option value="50">50 Minutes</option>
            <option value="60">60 Minutes</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Include Breaks?</FormLabel>
          <Select value={includeBreak ? "yes" : "no"} onChange={(e) => setIncludeBreak(e.target.value === "yes")}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </Select>
        </FormControl>
        {includeBreak && (
          <FormControl>
            <FormLabel>Break Duration (Minutes)</FormLabel>
            <Select value={breakDuration} onChange={(e) => setBreakDuration(e.target.value)}>
              <option value="5">5 Minutes</option>
              <option value="10">10 Minutes</option>
              <option value="15">15 Minutes</option>
              <option value="20">20 Minutes</option>
            </Select>
          </FormControl>
        )}
      </Flex>

      <Stack direction="row" spacing={4} mb={4}>
        <Button colorScheme="blue" onClick={handleGenerateTimetable}>Generate Timetable</Button>
        <Button colorScheme="red" onClick={handleDeleteAll}>Delete All Timetable Entries</Button>
      </Stack>

      {/* Timetable Grid */}
      {timeSlots.length > 0 && filteredSections.length > 0 && (
        <Grid templateColumns={`150px repeat(${timeSlots.length}, 1fr)`} gap={2}>
          <GridItem bg="gray.200" p={2} textAlign="center">
            <Text fontWeight="bold">Day / Section</Text>
          </GridItem>
          {timeSlots.map((time) => (
            <GridItem key={time} bg="gray.200" p={2} textAlign="center">
              <Text fontWeight="bold">{time}</Text>
            </GridItem>
          ))}
          {days.map((day) =>
            filteredSections.map((section) => (
              <React.Fragment key={`${day}-${section}`}>
                <GridItem bg="gray.100" p={2} textAlign="center">
                  <Text fontWeight="bold">{day} - {section}</Text>
                </GridItem>
                {timeSlots.map((time) => (
                  <GridItem key={`${day}-${section}-${time}`} p={2} bg="white" border="1px solid #ccc">
                    {getCourseInfo(day, section, time)}
                  </GridItem>
                ))}
              </React.Fragment>
            ))
          )}
        </Grid>
      )}

      {/* Modal for Update/Delete */}
      {selectedEntry && (
        <Modal isOpen={isOpen} onClose={closeEditModal}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Manage Timetable Entry</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex direction="column" gap={4}>
                <FormControl>
                  <FormLabel>Day</FormLabel>
                  <Select
                    value={selectedEntry.day}
                    onChange={(e) => setSelectedEntry({ ...selectedEntry, day: e.target.value })}
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Section</FormLabel>
                  <Select
                    value={selectedEntry.section?.sectionDisplay || ''}
                    isDisabled
                  >
                    <option value={selectedEntry.section?.sectionDisplay || ''}>
                      {selectedEntry.section?.sectionDisplay || 'N/A'}
                    </option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Course Name</FormLabel>
                  <Input
                    value={selectedEntry.courseoffering?.coursename || ''}
                    isDisabled
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Teacher</FormLabel>
                  <Select
                    value={selectedEntry.teacher}
                    onChange={(e) => setSelectedEntry({ ...selectedEntry, teacher: e.target.value })}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Room</FormLabel>
                  <Select
                    value={selectedEntry.roomId}
                    onChange={(e) => setSelectedEntry({ ...selectedEntry, roomId: e.target.value })}
                  >
                    <option value="">Select Room</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Start Time</FormLabel>
                  <Input
                    type="time"
                    value={selectedEntry.startTime}
                    onChange={(e) => setSelectedEntry({ ...selectedEntry, startTime: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>End Time</FormLabel>
                  <Input
                    type="time"
                    value={selectedEntry.endTime}
                    onChange={(e) => setSelectedEntry({ ...selectedEntry, endTime: e.target.value })}
                  />
                </FormControl>
              </Flex>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="red" mr={3} leftIcon={<DeleteIcon />} onClick={handleDeleteEntry}>
                Delete
              </Button>
              <Button colorScheme="blue" leftIcon={<EditIcon />} onClick={handleSaveChanges}>
                Update
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}


