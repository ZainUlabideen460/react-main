// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Grid,
//   GridItem,
//   Text,
//   Alert,
//   AlertIcon,
//   RadioGroup,
//   Radio,
//   Stack,
// } from "@chakra-ui/react";
// import axios from "axios";

// export default function TimetableManagement() {
//   // State variables for timetable data and error messages
//   const [timetable, setTimetable] = useState([]);
//   const [timeSlots, setTimeSlots] = useState([]);
//   const [sections, setSections] = useState([]);
//   const [errorMessage, setErrorMessage] = useState("");

//   // State variable for selected shift
//   const [selectedShift, setSelectedShift] = useState("Morning");

//   // Days of the week
//   const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

//   // Fetch timetable data on component mount and when selectedShift changes
//   useEffect(() => {
//     fetchTimetable(selectedShift);
//   }, [selectedShift]);

//   // Fetch timetable entries and filter based on selected shift
//   const fetchTimetable = async (shift) => {
//     try {
//       const response = await axios.get("http://localhost:3001/timetable");

//       // Determine the suffix based on the selected shift
//       const shiftSuffix = shift === "Morning" ? "(M)" : "(E)";

//       // Filter timetable entries for the selected shift
//       const filteredTimetable = response.data.filter((entry) =>
//         entry.section?.sectionDisplay?.endsWith(shiftSuffix)
//       );

//       // Extract unique time slots and sections
//       const uniqueTimeSlots = [
//         ...new Set(filteredTimetable.map((entry) => entry.startTime)),
//       ].sort();
//       const uniqueSections = [
//         ...new Set(
//           filteredTimetable.map((entry) => entry.section.sectionDisplay)
//         ),
//       ];

//       setTimetable(filteredTimetable);
//       setTimeSlots(uniqueTimeSlots);
//       setSections(uniqueSections);
//     } catch (error) {
//       console.error("Failed to fetch timetable:", error);
//       setErrorMessage("Failed to fetch timetable.");
//     }
//   };

//   // Function to display course info in the timetable grid
//   const getCourseInfo = (day, section, time) => {
//     const entry = timetable.find(
//       (item) =>
//         item.day === day &&
//         item.section.sectionDisplay === section &&
//         item.startTime === time
//     );

//     if (entry) {
//       return (
//         <Box
//           bg="teal.100"
//           p={2}
//           borderRadius="md"
//           _hover={{ bg: "teal.200" }}
//         >
//           <Text fontWeight="bold">
//             {entry.courseOffering?.coursename || "N/A"}
//           </Text>
//           <Text fontSize="sm">Room: {entry.room?.name || "N/A"}</Text>
//           <Text fontSize="sm">Teacher: {entry.teacher || "N/A"}</Text>
//         </Box>
//       );
//     }
//     return null;
//   };

//   return (
//     <Box w="100%" p={4}>
//       <Text fontSize="2xl" fontWeight="bold" mb={4}>
//         University Timetable Management
//       </Text>

//       {/* Display error message */}
//       {errorMessage && (
//         <Alert status="error" mb={4}>
//           <AlertIcon />
//           {errorMessage}
//         </Alert>
//       )}

//       {/* Shift Selector */}
//       <Box mb={4}>
//         <Text fontSize="lg" fontWeight="semibold" mb={2}>
//           Select Shift:
//         </Text>
//         <RadioGroup
//           onChange={setSelectedShift}
//           value={selectedShift}
//           defaultValue="Morning"
//         >
//           <Stack direction="row">
//             <Radio value="Morning">Morning</Radio>
//             <Radio value="Evening">Evening</Radio>
//           </Stack>
//         </RadioGroup>
//       </Box>

//       {/* Timetable Grid */}
//       {timeSlots.length > 0 && sections.length > 0 && (
//         <Grid
//           templateColumns={`150px repeat(${timeSlots.length}, 1fr)`}
//           gap={2}
//         >
//           {/* Header Row */}
//           <GridItem bg="gray.200" p={2} textAlign="center">
//             <Text fontWeight="bold">Day / Section</Text>
//           </GridItem>
//           {timeSlots.map((time) => (
//             <GridItem key={time} bg="gray.200" p={2} textAlign="center">
//               <Text fontWeight="bold">{time}</Text>
//             </GridItem>
//           ))}

//           {/* Timetable Rows */}
//           {days.map((day) =>
//             sections.map((section) => (
//               <React.Fragment key={`${day}-${section}`}>
//                 <GridItem bg="gray.100" p={2} textAlign="center">
//                   <Text fontWeight="bold">
//                     {day} - {section}
//                   </Text>
//                 </GridItem>
//                 {timeSlots.map((time) => (
//                   <GridItem
//                     key={`${day}-${section}-${time}`}
//                     p={2}
//                     bg="white"
//                     border="1px solid #ccc"
//                   >
//                     {getCourseInfo(day, section, time)}
//                   </GridItem>
//                 ))}
//               </React.Fragment>
//             ))
//           )}
//         </Grid>
//       )}

//       {/* If no timetable entries are available */}
//       {!errorMessage && (timeSlots.length === 0 || sections.length === 0) && (
//         <Text>No timetable entries available for the selected shift.</Text>
//       )}
//     </Box>
//   );
// }
  

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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import toast from "react-hot-toast";

export default function TimetableManagement() {
  // State variables for timetable data and error messages
  const [timetable, setTimetable] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]); // Rooms state
  const [errorMessage, setErrorMessage] = useState("");

  // State variable for selected shift
  const [selectedShift, setSelectedShift] = useState("Morning");

  // Days of the week
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Modal controls
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editData, setEditData] = useState({
    teacher: "",
    roomId: "",
    day: "",
    startTime: "",
    endTime: "",
  });

  // Fetch timetable data, teachers, rooms, and sections on component mount and when selectedShift changes
  useEffect(() => {
    fetchTimetable(selectedShift);
    fetchTeachers();
    fetchRooms();
    fetchSections();
  }, [selectedShift]);

  // Fetch timetable entries and filter based on selected shift
  const fetchTimetable = async (shift) => {
    try {
      const response = await axios.get("http://localhost:3001/timetable");

      // Determine the suffix based on the selected shift
      const shiftSuffix = shift === "Morning" ? "(M)" : "(E)";

      // Filter timetable entries for the selected shift
      const filteredTimetable = response.data.filter((entry) =>
        entry.section?.sectionDisplay?.endsWith(shiftSuffix)
      );

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
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      setErrorMessage("Failed to fetch rooms.");
    }
  };

  // Fetch sections
  const fetchSections = async () => {
    try {
      const response = await axios.get("http://localhost:3001/sections");
      setSections(response.data.map((section) => section.sectionDisplay));
    } catch (error) {
      console.error("Failed to fetch sections:", error);
      setErrorMessage("Failed to fetch sections.");
    }
  };

  // Function to display course info in the timetable grid
  const getCourseInfo = (day, section, time) => {
    const entry = timetable.find(
      (item) =>
        item.day === day &&
        item.section.sectionDisplay === section &&
        item.startTime === time
    );

    if (entry) {
      return (
        <Box
          bg="teal.100"
          p={2}
          borderRadius="md"
          _hover={{ bg: "teal.200" }}
          cursor="pointer"
          onClick={() => handleEditClick(entry)}
        >
          <Text fontWeight="bold">
            {entry.courseoffering?.coursename || "N/A"}
          </Text>
          <Text fontSize="sm">Room: {entry.room?.name || "N/A"}</Text>
          <Text fontSize="sm">Teacher: {entry.teacher || "N/A"}</Text>
        </Box>
      );
    }
    return null;
  };

  // Handle click on a timetable entry to edit
  const handleEditClick = (entry) => {
    setSelectedEntry(entry);
    setEditData({
      teacher: entry.teacher || "",
      roomId: entry.roomId || "",
      day: entry.day || "",
      startTime: entry.startTime || "",
      endTime: entry.endTime || "",
    });
    onOpen();
  };

  // Handle input changes in the edit modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle saving changes to the timetable entry
  const handleSaveChanges = async () => {
    if (
      !editData.teacher ||
      !editData.roomId ||
      !editData.day ||
      !editData.startTime ||
      !editData.endTime
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:3001/timetable/${selectedEntry.id}`,
        {
          teacher: editData.teacher,
          roomId: parseInt(editData.roomId, 10),
          day: editData.day,
          startTime: editData.startTime,
          endTime: editData.endTime,
        }
      );

      // Update the local timetable state with the updated entry
      const updatedEntry = response.data;
      const updatedTimetable = timetable.map((entry) =>
        entry.id === updatedEntry.id ? updatedEntry : entry
      );

      setTimetable(updatedTimetable);
      toast.success("Timetable entry updated successfully!");
      onClose();
      setErrorMessage("");
    } catch (error) {
      console.error(
        "Failed to update timetable entry:",
        error.response?.data || error.message
      );
      setErrorMessage(
        error.response?.data?.message || "Failed to update timetable entry."
      );
    }
  };

  return (
    <Box w="100%" p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Smart Course Planner
      </Text>

      {/* Display error message */}
      {errorMessage && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {errorMessage}
        </Alert>
      )}

      {/* Shift Selector */}
      <Box mb={4}>
        <Text fontSize="lg" fontWeight="semibold" mb={2}>
          Select Shift:
        </Text>
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
      </Box>
      

      {/* Timetable Grid */}
      {timeSlots.length > 0 && sections.length > 0 ? (
        <Grid
          templateColumns={`150px repeat(${timeSlots.length}, 1fr)`}
          gap={2}
        >
          {/* Header Row */}
          <GridItem bg="gray.200" p={2} textAlign="center">
            <Text fontWeight="bold">Day / Section</Text>
          </GridItem>
          {timeSlots.map((time) => (
            <GridItem key={time} bg="gray.200" p={2} textAlign="center">
              <Text fontWeight="bold">{time}</Text>
            </GridItem>
          ))}

          {/* Timetable Rows */}
          {days.map((day) =>
            sections.map((section) => (
              <React.Fragment key={`${day}-${section}`}>
                <GridItem bg="gray.100" p={2} textAlign="center">
                  <Text fontWeight="bold">
                    {day} - {section}
                  </Text>
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
      ) : (
        <Text>No timetable entries available for the selected shift.</Text>
      )}

      {/* Edit Modal */}
      {selectedEntry && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Timetable Entry</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl mb={3}>
                <FormLabel>Day</FormLabel>
                <Select
                  name="day"
                  value={editData.day}
                  onChange={handleInputChange}
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>Teacher</FormLabel>
                <Select
                  name="teacher"
                  value={editData.teacher}
                  onChange={handleInputChange}
                  placeholder="Select Teacher"
                >
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.name}>
                      {teacher.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>Room</FormLabel>
                <Select
                  name="roomId"
                  value={editData.roomId}
                  onChange={handleInputChange}
                  placeholder="Select Room"
                >
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>Start Time</FormLabel>
                <Input
                  type="time"
                  name="startTime"
                  value={editData.startTime}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>End Time</FormLabel>
                <Input
                  type="time"
                  name="endTime"
                  value={editData.endTime}
                  onChange={handleInputChange}
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="red"
                leftIcon={<DeleteIcon />}
                mr={3}
                onClick={async () => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this timetable entry? This action cannot be undone."
                    )
                  ) {
                    try {
                      await axios.delete(
                        `http://localhost:3001/timetable/${selectedEntry.id}`
                      );
                      // Remove the deleted entry from the local state
                      const updatedTimetable = timetable.filter(
                        (entry) => entry.id !== selectedEntry.id
                      );
                      setTimetable(updatedTimetable);
                      toast.success("Timetable entry deleted successfully!");
                      onClose();
                      setErrorMessage("");
                    } catch (error) {
                      console.error("Failed to delete timetable entry:", error);
                      setErrorMessage("Failed to delete timetable entry.");
                    }
                  }
                }}
              >
                Delete
              </Button>
              <Button
                colorScheme="blue"
                leftIcon={<EditIcon />}
                onClick={handleSaveChanges}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}
