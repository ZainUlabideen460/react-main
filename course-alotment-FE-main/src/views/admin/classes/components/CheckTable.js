import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  GridItem,
  Text,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import axios from "axios";

export default function TimetableManagement() {
  const [timetable, setTimetable] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [sections, setSections] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await axios.get("http://localhost:3001/timetable");

      // Filter timetable entries for sections ending with "(M)"
      const morningTimetable = response.data.filter((entry) =>
        entry.section?.sectionDisplay?.match(/\(M\)$/)
      );

      // Extract all unique time slots (including breaks)
      const uniqueTimeSlots = [
        ...new Set(
          morningTimetable.map(
            (entry) => `${entry.startTime} - ${entry.endTime}`
          )
        ),
      ]
        .sort((a, b) => new Date(`1970/01/01 ${a.split(" - ")[0]}`) - new Date(`1970/01/01 ${b.split(" - ")[0]}`)); // Sort by start time

      const uniqueSections = [
        ...new Set(
          morningTimetable.map((entry) => entry.section.sectionDisplay)
        ),
      ];

      setTimetable(morningTimetable);
      setTimeSlots(uniqueTimeSlots);
      setSections(uniqueSections);
    } catch (error) {
      console.error("Failed to fetch timetable:", error);
      setErrorMessage("Failed to fetch timetable.");
    }
  };

  const formatTimeSlot = (startTime, endTime) => {
    // Adjust to the desired format, e.g., 8:00-8:50
    const start = startTime.split(":");
    const end = endTime.split(":");
    return `${start[0]}:${start[1]}-${end[0]}:${end[1]}`;
  };

  const getCourseInfo = (day, section, time) => {
    const [startTime, endTime] = time.split(" - "); // Extract only the startTime and endTime for comparison
    const entry = timetable.find(
      (item) =>
        item.day === day &&
        item.section.sectionDisplay === section &&
        item.startTime === startTime
    );

    if (entry) {
      return (
        <Box
          bg={entry.courseOffering ? "teal.100" : "gray.200"}
          p={2}
          borderRadius="md"
          _hover={{ bg: entry.courseOffering ? "teal.200" : "gray.300" }}
        >
          {entry.courseOffering ? (
            <>
              <Text fontWeight="bold">
                {entry.courseOffering.coursename || "N/A"}
              </Text>
              <Text fontSize="sm">Room: {entry.room?.name || "N/A"}</Text>
              <Text fontSize="sm">Teacher: {entry.teacher || "N/A"}</Text>
            </>
          ) : (
            <Text fontWeight="bold">Break</Text>
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box w="100%" p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        University Timetable Management 
      </Text>

      {errorMessage && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {errorMessage}
        </Alert>
      )}

      {timeSlots.length > 0 && sections.length > 0 && (
        <Grid templateColumns={`150px repeat(${timeSlots.length}, 1fr)`} gap={2}>
          <GridItem bg="gray.200" p={2} textAlign="center">
            <Text fontWeight="bold">Day / Section</Text>
          </GridItem>
          {timeSlots.map((time) => (
            <GridItem key={time} bg="gray.200" p={2} textAlign="center">
              <Text fontWeight="bold">{formatTimeSlot(time.split(" - ")[0], time.split(" - ")[1])}</Text>
            </GridItem>
          ))}

          {days.map((day) =>
            sections.map((section) => (
              <React.Fragment key={`${day}-${section}`}>
                <GridItem bg="gray.100" p={2} textAlign="center">
                  <Text fontWeight="bold">{day} - {section}</Text>
                </GridItem>
                {timeSlots.map((time) => (
                  <GridItem
                    key={`${day}-${section}-${time}`}
                    p={2}
                    bg="white"
                    border="1px solid #ccc"
                  >
                    {getCourseInfo(day, section, time)}
                  </GridItem>
                ))}
              </React.Fragment>
            ))
          )}
        </Grid>
      )}
    </Box>
  );
}
