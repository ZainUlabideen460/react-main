import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  GridItem,
  Text,
  Alert,
  AlertIcon,
  RadioGroup,
  Radio,
  Stack,
  Button,
  FormControl,
  FormLabel,
  Select,
  Spinner,
  Center,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { DeleteIcon } from "@chakra-ui/icons";

export default function TimetableManagement() {
  // State variables for timetable data and error messages
  const [timetable, setTimetable] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]); // Rooms state
  const [errorMessage, setErrorMessage] = useState("");

  // State variables for filters
  const [selectedShift, setSelectedShift] = useState("Morning");
  const [selectedTeacher, setSelectedTeacher] = useState("All"); // New state for selected teacher
  const [selectedDay, setSelectedDay] = useState("All"); // New state for selected day

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // Days of the week
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const toastChakra = useToast();

  // Fetch timetable data, teachers, and rooms on component mount and when selectedShift, selectedTeacher, or selectedDay changes
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShift, selectedTeacher, selectedDay]);

  // Fetch all necessary data
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchTimetable(), fetchTeachers(), fetchRooms()]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("An error occurred while fetching data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch timetable entries and filter based on selected shift, teacher, and day
  const fetchTimetable = async () => {
    try {
      const response = await axios.get("http://localhost:3001/timetable");

      // Determine the suffix based on the selected shift
      const shiftSuffix = selectedShift === "Morning" ? "(M)" : "(E)";

      // Initial filter based on shift
      let filteredTimetable = response.data.filter((entry) =>
        entry.section?.sectionDisplay?.endsWith(shiftSuffix)
      );

      // Further filter based on selected teacher
      if (selectedTeacher !== "All") {
        filteredTimetable = filteredTimetable.filter(
          (entry) => entry.teacher === selectedTeacher
        );
      }

      // Further filter based on selected day
      if (selectedDay !== "All") {
        filteredTimetable = filteredTimetable.filter(
          (entry) => entry.day === selectedDay
        );
      }

      // Extract unique time slots and sections
      const uniqueTimeSlots = [
        ...new Set(filteredTimetable.map((entry) => entry.startTime)),
      ].sort();

      const uniqueSections = [
        ...new Set(
          filteredTimetable.map((entry) => entry.section.sectionDisplay)
        ),
      ];

      setTimetable(filteredTimetable);
      setTimeSlots(uniqueTimeSlots);
      setSections(uniqueSections);
      setErrorMessage("");
    } catch (error) {
      console.error("Failed to fetch timetable:", error);
      setErrorMessage("Failed to fetch timetable.");
    }
  };

  // Fetch all teachers
  const fetchTeachers = async () => {
    try {
      const response = await axios.get("http://localhost:3001/teachers");
      setTeachers(response.data);
      setErrorMessage("");
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      setErrorMessage("Failed to fetch teachers.");
    }
  };

  // Fetch all rooms
  const fetchRooms = async () => {
    try {
      const response = await axios.get("http://localhost:3001/rooms");
      setRooms(response.data);
      setErrorMessage("");
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      setErrorMessage("Failed to fetch rooms.");
    }
  };

  // Function to display course info in the timetable grid
  const getCourseInfo = (entry) => {
    return (
      <Box
        bg="teal.100"
        p={3}
        borderRadius="md"
        boxShadow="sm"
        _hover={{ boxShadow: "md" }}
      >
        <Text fontWeight="bold" fontSize="md">
          {entry.courseoffering?.coursename || "N/A"}
        </Text>
        <Text fontSize="sm">Room: {entry.room?.name || "N/A"}</Text>
        <Text fontSize="sm">Teacher: {entry.teacher || "N/A"}</Text>
      </Box>
    );
  };

  return (
    <Box w="100%" p={6} bg="gray.50" minH="100vh">
      <Text
        fontSize="3xl"
        fontWeight="bold"
        mb={6}
        textAlign="center"
        color="teal.600"
      >
        Smart Course Planner
      </Text>

      {/* Display error message */}
      {errorMessage && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {errorMessage}
        </Alert>
      )}

      {/* Filters Section */}
      <Box mb={8} bg="white" p={6} borderRadius="md" boxShadow="md">
        <Stack direction={{ base: "column", md: "row" }} spacing={6}>
          {/* Shift Selector */}
          <FormControl>
            <FormLabel fontWeight="semibold">Select Shift:</FormLabel>
            <RadioGroup
              onChange={setSelectedShift}
              value={selectedShift}
              defaultValue="Morning"
            >
              <Stack direction="row">
                <Radio value="Morning">Morning</Radio>
                <Radio value="Evening">Evening</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>

          {/* Teacher Selector */}
          <FormControl>
            <FormLabel fontWeight="semibold">Select Teacher:</FormLabel>
            <Select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              placeholder="All Teachers"
            >
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.name}>
                  {teacher.name}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Day Selector */}
          <FormControl>
            <FormLabel fontWeight="semibold">Select Day:</FormLabel>
            <Select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              placeholder="All Days"
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Loading Indicator */}
      {isLoading ? (
        <Center>
          <Spinner size="xl" color="teal.500" />
        </Center>
      ) : (
        /* Timetable Grid */
        <Box overflowX="auto">
          {timeSlots.length > 0 && sections.length > 0 ? (
            <Grid
              templateColumns={`200px repeat(${timeSlots.length}, 1fr)`}
              gap={2}
              minW="800px"
            >
              {/* Header Row */}
              <GridItem
                bg="gray.200"
                p={4}
                textAlign="center"
                borderRadius="md"
              >
                <Text fontWeight="bold">Day / Section</Text>
              </GridItem>
              {timeSlots.map((time) => (
                <GridItem
                  key={time}
                  bg="gray.200"
                  p={4}
                  textAlign="center"
                  borderRadius="md"
                >
                  <Text fontWeight="bold">{time}</Text>
                </GridItem>
              ))}

              {/* Timetable Rows */}
              {(selectedDay === "All" ? days : [selectedDay]).map((day) =>
                sections.map((section) => (
                  <React.Fragment key={`${day}-${section}`}>
                    {/* Day and Section Label */}
                    <GridItem
                      bg="gray.100"
                      p={4}
                      textAlign="center"
                      borderRadius="md"
                    >
                      <Text fontWeight="bold">
                        {day} - {section}
                      </Text>
                    </GridItem>
                    {/* Time Slots */}
                    {timeSlots.map((time) => {
                      const entry = timetable.find(
                        (item) =>
                          item.day === day &&
                          item.section.sectionDisplay === section &&
                          item.startTime === time
                      );

                      if (entry) {
                        return (
                          <GridItem
                            key={`${day}-${section}-${time}`}
                            p={2}
                            bg="white"
                            border="1px solid #ccc"
                            position="relative"
                            borderRadius="md"
                          >
                            {getCourseInfo(entry)}
                            {/* Optional: Delete Button */}
                            {/* <Button
                              size="sm"
                              colorScheme="red"
                              position="absolute"
                              top="2px"
                              right="2px"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <DeleteIcon />
                            </Button> */}
                          </GridItem>
                        );
                      }

                      return (
                        <GridItem
                          key={`${day}-${section}-${time}`}
                          p={2}
                          bg="white"
                          border="1px solid #ccc"
                          borderRadius="md"
                        >
                          {/* Optionally, you can add a button to add new entries here */}
                          {/* Example: Add Entry Button */}
                          {/* <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleAddEntry(day, section, time)}
                          >
                            Add
                          </Button> */}
                        </GridItem>
                      );
                    })}
                  </React.Fragment>
                ))
              )}
            </Grid>
          ) : (
            <Center>
              <Text fontSize="lg" color="gray.600">
                No timetable entries available for the selected filters.
              </Text>
            </Center>
          )}
        </Box>
      )}
    </Box>
  );
}
