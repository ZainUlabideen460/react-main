import React, { useState, useEffect } from "react";
import {
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Button,
  TableCaption,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import axios from "axios";
import { toast } from "react-hot-toast";

// Custom components
import Card from "components/card/Card";

export default function CheckTable() {
  const [studentsData, setStudentsData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [studentId, setStudentId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cnic, setCnic] = useState("");
  const [aridno, setAridno] = useState("");
  const [semester, setSemester] = useState("");
  const [shift, setShift] = useState("");
  const [section, setSection] = useState("");

  // Define table columns based on API response
  const columnsData = [
    { Header: "ID" },
    { Header: "Name" },
    { Header: "Email" },
    { Header: "CNIC" },
    { Header: "Arid No" },
    { Header: "Semester" },
    { Header: "Shift" },
    { Header: "Section" },
    { Header: "Actions" },
  ];

  // Fetch students from the /student endpoint
  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:3001/student");
      setStudentsData(response.data);
    } catch (error) {
      toast.error("Failed to fetch students");
    }
  };

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Open modal for updating student
  const openModalForUpdate = (student) => {
    setStudentId(student.id);
    setName(student.name);
    setEmail(student.email);
    setCnic(student.cnic);
    setAridno(student.aridno);
    setSemester(student.semester);
    setShift(student.shift);
    setSection(student.section);
    setIsOpen(true);
  };

  // Handle update submission
  const handleUpdate = async () => {
    try {
      const studentData = {
        name,
        email,
        cnic,
        aridno,
        semester,
        shift,
        section,
      };

      const response = await axios.put(
        `http://localhost:3001/student/${studentId}`,
        studentData
      );

      toast.success("Student updated successfully");

      // Update the studentsData state with the updated student
      setStudentsData((prev) =>
        prev.map((student) =>
          student.id === studentId ? response.data.student : student
        )
      );

      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update student");
    }
  };

  // Reset form fields
  const resetForm = () => {
    setStudentId(null);
    setName("");
    setEmail("");
    setCnic("");
    setAridno("");
    setSemester("");
    setShift("");
    setSection("");
  };

  const textColor = useColorModeValue("secondaryGray.900", "white");

  return (
    <Card
      direction="column"
      w="100%"
      px="0px"
      overflowX={{ sm: "scroll", lg: "hidden" }}
    >
      <Flex px="25px" justify="space-between" mb="20px" align="center">
        <Text
          color={textColor}
          fontSize="22px"
          fontWeight="700"
          lineHeight="100%"
        >
          All Students
        </Text>
      </Flex>
      <TableContainer>
        <Table variant="simple">
          <TableCaption>Table for all the students</TableCaption>
          <Thead>
            <Tr>
              {columnsData.map((items) => (
                <Th key={items.Header}>{items.Header}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {studentsData.map((items) => (
              <Tr key={items.id}>
                <Td>{items.id}</Td>
                <Td>{items.name}</Td>
                <Td>{items.email}</Td>
                <Td>{items.cnic}</Td>
                <Td>{items.aridno}</Td>
                <Td>{items.semester}</Td>
                <Td>{items.shift}</Td>
                <Td>{items.section}</Td>
                <Td>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={() => openModalForUpdate(items)}
                  >
                    Update
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Student</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Email</FormLabel>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>CNIC</FormLabel>
              <Input
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Arid No</FormLabel>
              <Input
                value={aridno}
                onChange={(e) => setAridno(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Semester</FormLabel>
              <Input
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Shift</FormLabel>
              <Input
                value={shift}
                onChange={(e) => setShift(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Section</FormLabel>
              <Input
                value={section}
                onChange={(e) => setSection(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleUpdate}>
              Update
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </ModalFooter>
          </ModalContent>
      </Modal>
    </Card>
  );
}