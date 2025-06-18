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
import toast from "react-hot-toast";

export default function TimetableManagement() {
  // State variables for timetable data and error messages
  const [timetable, setTimetable] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [sections, setSections] = useState([]);
  const [rooms, setRooms] = useState([]); // Rooms state
  const [errorMessage, setErrorMessage] = useState("");

  // State variables for filters
  const [selectedShift, setSelectedShift] = useState("Morning");
  const [selectedDay, setSelectedDay] = useState("All"); // New state for selected day
  const [selectedSection, setSelectedSection] = useState("All"); // New state for selected section

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Days of the week
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const toastChakra = useToast();

  // Cache keys
  const TIMETABLE_CACHE_KEY = "timetableData";
  const SECTIONS_CACHE_KEY = "sectionsData";
  const CACHE_TIMESTAMP_KEY = "cacheTimestamp";
  const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

  // Fetch timetable data and rooms on component mount and when filters change
  useEffect(() => {
    fetchTimetable();
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShift, selectedDay, selectedSection]);

  // Function to check if cache is valid
  const isCacheValid = () => {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;
    const currentTime = new Date().getTime();
    return currentTime - parseInt(timestamp, 10) < CACHE_DURATION;
  };

  // Fetch timetable entries and filter based on selected shift, day, and section
  const fetchTimetable = async () => {
    setIsLoading(true);
    try {
      let data;

      // Check if data is in Local Storage and cache is valid
      if (isCacheValid()) {
        const cachedData = localStorage.getItem(TIMETABLE_CACHE_KEY);
        data = cachedData ? JSON.parse(cachedData) : [];
        console.log("Using cached timetable data");
      } else {
        // Fetch data from API
        const response = await axios.get("http://localhost:3001/timetable");
        data = response.data;

        // Store fetched data in Local Storage
        localStorage.setItem(TIMETABLE_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().getTime().toString());
        console.log("Fetched timetable data from API and cached it");
      }

      // Determine the suffix based on the selected shift
      const shiftSuffix = selectedShift === "Morning" ? "(M)" : "(E)";

      // Initial filter based on shift
      let filteredTimetable = data.filter((entry) =>
        entry.section?.sectionDisplay?.endsWith(shiftSuffix)
      );

      // Further filter based on selected day
      if (selectedDay !== "All") {
        filteredTimetable = filteredTimetable.filter(
          (entry) => entry.day === selectedDay
        );
      }

      // Further filter based on selected section
      if (selectedSection !== "All") {
        filteredTimetable = filteredTimetable.filter(
          (entry) => entry.section.sectionDisplay === selectedSection
        );
      }

      // Extract unique time slots and sections from the filtered timetable
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
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all rooms
  const fetchRooms = async () => {
    try {
      let data;

      // Check if rooms data is in Local Storage
      const cachedRooms = localStorage.getItem("roomsData");
      if (cachedRooms) {
        data = JSON.parse(cachedRooms);
        console.log("Using cached rooms data");
      } else {
        // Fetch data from API
        const response = await axios.get("http://localhost:3001/rooms");
        data = response.data;

        // Store fetched data in Local Storage
        localStorage.setItem("roomsData", JSON.stringify(data));
        console.log("Fetched rooms data from API and cached it");
      }

      setRooms(data);
      setErrorMessage("");
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      setErrorMessage("Failed to fetch rooms.");
    }
  };

  // Fetch all sections (dependent on selected shift)
  // Since sections are derived from the filtered timetable, we don't need to fetch them separately
  // Therefore, the fetchSections function is removed

  // Function to display course info in the timetable grid
  // const getCourseInfo = (day, section, time) => {
  //   const entry = timetable.find(
  //     (item) =>
  //       item.day === day &&
  //       item.section.sectionDisplay === section &&
  //       item.startTime === time
  //   );

  //   if (entry) {
  //     return (
  //       <Box
  //         bg="teal.100"
  //         p={3}
  //         borderRadius="md"
  //         boxShadow="sm"
  //         _hover={{ boxShadow: "md" }}
  //         cursor="default"
  //       >
  //         <Text fontWeight="bold" fontSize="md">
  //           {entry.courseOffering?.coursename || "N/A"}
  //         </Text>
  //         <Text fontSize="sm">Room: {entry.room?.name || "N/A"}</Text>
  //         <Text fontSize="sm">Teacher: {entry.teacher || "N/A"}</Text>
  //       </Box>
  //     );
  //   }
  //   return null;
  // };



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
        <Stack
          direction={{ base: "column", md: "row" }}
          spacing={6}
          align="flex-start"
        >
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

          {/* Day Selector */}
          <FormControl>
            <FormLabel fontWeight="semibold">Select Day:</FormLabel>
            <Select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              placeholder="All Days"
            >
              <option value="All">All Days</option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Section Selector */}
          <FormControl>
            <FormLabel fontWeight="semibold">Select Section:</FormLabel>
            <Select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              placeholder="All Sections"
            >
              <option value="All">All Sections</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
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
                fontWeight="bold"
              >
                Day / Section
              </GridItem>
              {timeSlots.map((time) => (
                <GridItem
                  key={time}
                  bg="gray.200"
                  p={4}
                  textAlign="center"
                  borderRadius="md"
                  fontWeight="bold"
                >
                  {time}
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
                      fontWeight="bold"
                    >
                      {day} - {section}
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
                            {/* Delete Button */}
                          
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
                          {/* <Button size="sm" colorScheme="green" onClick={() => handleAddEntry(day, section, time)}>
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
