import React, { useState, useEffect, useRef } from "react";
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  HStack,
} from "@chakra-ui/react";
import {
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
import Select from "react-select";
import { FiDownload } from "react-icons/fi"

// Custom components
import Card from "components/card/Card";
import filetemplate from '../../../../../src/assets/template_file/testteacher.xlsx';
import { AddIcon } from "@chakra-ui/icons";
import { ArrowUpIcon, UploadIcon, ViewIcon } from "lucide-react";
export default function CheckTable(props) {
  const { columnsData } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [teachersData, setTeachersData] = useState([]);
  const [name, setName] = useState("");
  const [cnic, setCnic] = useState("");
  const [teacherid, setTeacherid] = useState("");
  const [qualification, setQualification] = useState("");
  const [gender, setGender] = useState("");
  const [operationType, setOperationType] = useState("add");
  const [teacherId, setTeacherId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
const [templatePop,settemplatePop] = useState(false);

  // Key for the file input to force re-render
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const fileInputRef = useRef(null);
 // search
 const [searchTerm, setSearchTerm] = useState('');
 const [searchField, setSearchField] = useState('none');
  useEffect(() => {
    fetchTeachers();
    fetchCourses();
  }, []);
   // Search logic
   const filteredTeacher = teachersData.filter((teacherData) => {
    if (searchField === 'none' || searchField === '') {
      return Object.keys(teacherData).some((key) =>
        String(teacherData[key]).toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      // Search in the specified field
      const fieldValue = teacherData[searchField];
      if (fieldValue) {
        return String(fieldValue).toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    }
  });
  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:3001/courses");
      setCourses(response.data);
    } catch (error) {
      toast.error("Failed to fetch courses");
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get("http://localhost:3001/teachers");
      setTeachersData(response.data);
    } catch (error) {
      toast.error("Failed to fetch teachers");
    }
  };

  const handleSubmit = async () => {
    try {
      const teacherData = {
        name,
        cnic: cnic.toString(),
        teacherid,
        qualification,
        gender: gender.value,
        courses: selectedCourses.map((option) => option.value),
      };
      if (operationType === "add") {
        await axios.post("http://localhost:3001/teachers", teacherData);
        toast.success("Teacher added successfully");
      } else if (operationType === "update") {
        await axios.put(
          `http://localhost:3001/teachers/${teacherId}`,
          teacherData
        );
        toast.success("Teacher updated successfully");
      }
      fetchTeachers();
      setIsOpen(false);
      setName("");
      setCnic("");
      setTeacherid("");
      setQualification("");
      setGender("");
      setOperationType("add");
      setTeacherId(null);
      setSelectedCourses([]);
    } catch (error) {
      toast.error("Failed to perform operation");
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (event) => {
    console.log("handleFileUpload triggered");
    const file = event.target.files[0];
    console.log("File selected:", file);
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          "http://localhost:3001/teachers/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Upload successful:", response.data);
        toast.success("File uploaded successfully");
        fetchTeachers();
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload file");
      } finally {
        // Reset the file input value
        event.target.value = "";
      }
    } else {
      console.error("No file selected");
    }
  };

  const deleteTeacher = async (teacherId) => {
    try {
      await axios.delete(`http://localhost:3001/teachers/${teacherId}`);
      toast.success("Teacher deleted successfully");
      fetchTeachers();

      // Update the file input key to force re-render
      setFileInputKey(Date.now());
    } catch (error) {
      toast.error("Failed to delete teacher");
    }
  };

  const openModalForUpdate = (teacher) => {
    setOperationType("update");
    setTeacherId(teacher.id);
    setName(teacher.name);
    setCnic(teacher.cnic);
    setTeacherid(teacher.teacherid);
    setQualification(teacher.qualification);
    setGender({
      label: teacher.gender,
      value: teacher.gender,
    });
    const selectedCourseObjects = teacher.courses.map((item) => {
      return {
        value: item,
        label: item,
      };
    });
    setSelectedCourses(selectedCourseObjects);

    setIsOpen(true);
  };
 
  const [passwordModal, setPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const openModalForPasswordUpdate = (teacher) => {
    const { id } = teacher;

    if (id) {
      setTeacherId(id);
      setPasswordModal(true);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      if (newPassword === "") {
        toast.warning("Please type your new password!");
        return;
      }

      await axios.put(
        `http://localhost:3001/teachers/password/${teacherId}`,
        {
          password: newPassword,
        }
      );
      toast.success("Password updated successfully");

      fetchTeachers();
      setPasswordModal(false);
      setTeacherId(null);
      setNewPassword("");
    } catch (error) {
      toast.error("Failed to perform operation");
    }
  };

  const textColor = useColorModeValue("secondaryGray.900", "white");
  return (
    
    <Card
      direction="column"
      w="100%"
      px="0px"
      overflowX={{ sm: "scroll", lg: "hidden" }}
    >
      <Flex align="center" gap={4} mb={4}>



</Flex>
<Flex px="25px" justify="space-between" mb="20px" align="center">
  <Text
    color={textColor}
    fontSize="22px"
    fontWeight="700"
    lineHeight="100%"
  >
    All Teachers
  </Text>

  <HStack spacing={3}>
    <Button
      leftIcon={<AddIcon />}
      colorScheme="blue"
      size="sm"
      onClick={() => setIsOpen(true)}
    >
      Add Courses
    </Button>

    <Button
      leftIcon={<ViewIcon />}
      colorScheme="blue"
      size="sm"
      onClick={() => settemplatePop(true)}
    >
      Show Template
    </Button>

    <Button
      leftIcon={<UploadIcon />}
      colorScheme="green"
      size="sm"
      onClick={handleUploadClick}
    >
      Upload Course
    </Button>
  </HStack>
</Flex>
      <Flex px="25px" mb="20px" align="center" justify="space-between">
  {/* Search By Dropdown */}
  <FormControl maxW="200px" mr={4}>
    <FormLabel>Search By</FormLabel>
    <select
      value={searchField}
      onChange={(e) => setSearchField(e.target.value)}
      style={{ width: "100%", padding: "8px" }}
    >
      <option value="none">Select Field</option>
      <option value="name">Name</option>
      <option value="cnic">CNIC</option>
      <option value="qualification">Qualification</option>
      <option value="gender">Gender</option>
    </select>
  </FormControl>

  {/* Search Term Input */}
  <FormControl maxW="700px">
    <FormLabel>Search Term</FormLabel>
    <Input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      background="white.600"
    />
  </FormControl>
</Flex>

      {/* Hidden file input */}
      <input
        type="file"
        accept=".xlsx, .xls"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileUpload}
        key={fileInputKey}
      />

      <TableContainer>
        <Table variant="simple">
          <TableCaption>Table for all the teachers</TableCaption>
          <Thead>
            <Tr>
              {columnsData.map((items) => {
                return <Th key={items.Header}>{items.Header}</Th>;
              })}
            </Tr>
          </Thead>
          <Tbody>
            {filteredTeacher.map((items) => (
              <Tr key={items.id}>
                <Td>{items.id}</Td>
                <Td>{items.name}</Td>
                <Td>{items.password}</Td>
                <Td>{items.cnic}</Td>
                <Td>{items.teacherid}</Td>
                <Td>{items.qualification}</Td>
                <Td>{items.gender}</Td>
                {/* <Td>
                  {items.courses.map((course, index) => (
                    <span
                      key={index}
                      style={{ display: "block", marginBottom: "5px" }}
                    >
                      • {course}
                    </span>
                  ))}
                </Td> */}
                <Td>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => openModalForUpdate(items)}
                    >
                      Update
                    </Button>
                    {/* <Button
                      colorScheme="green"
                      size="sm"
                      onClick={() => openModalForPasswordUpdate(items)}
                    >
                      Change Password
                    </Button> */}
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => deleteTeacher(items.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Modal for Adding/Updating Teachers */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {operationType === "add" ? "Add Teacher" : "Update Teacher"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>CNIC</FormLabel>
              <NumberInput
                value={cnic}
                onChange={(valueString) => {
                  const filteredValue = valueString.replace(/[-+]/g, "");
                  setCnic(filteredValue);
                }}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Teacher ID</FormLabel>
              <Input
                value={teacherid}
                onChange={(e) => setTeacherid(e.target.value)}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Qualification</FormLabel>
              <Input
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Gender</FormLabel>
              <Select
                value={gender}
                name="gender"
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                ]}
                isSearchable={false}
                onChange={(e) => setGender(e)}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Course Code</FormLabel>
              <Select
                value={selectedCourses}
                name="course_code"
                options={courses.map((items) => ({
                  value: items.course_code,
                  label: items.course_code,
                }))}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(e) => setSelectedCourses(e)}
                isMulti
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
              {operationType === "add" ? "Add" : "Update"}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for Changing Password */}
      <Modal isOpen={passwordModal} onClose={() => setPasswordModal(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>New Password</FormLabel>
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handlePasswordUpdate}>
              Save
            </Button>
            <Button variant="outline" onClick={() => setPasswordModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* template file modal  */}
      <Modal isOpen={templatePop} onClose={() => settemplatePop(false)} isCentered size="md">
  <ModalOverlay />
  <ModalContent
    borderRadius="xl"
    boxShadow="xl"
    bg={useColorModeValue("white", "gray.800")}
    px={6}
  >
    <ModalHeader
      fontSize="2xl"
      fontWeight="bold"
      borderBottom="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      pb={3}
    >
      Teacher Template
    </ModalHeader>
    <ModalCloseButton />
    <ModalBody py={6}>
      {/* Optional image */}
      {/* <img src={co} alt='coursepic' style={{ width: "100%", borderRadius: "10px", marginBottom: "1rem" }} /> */}

      <Text fontSize="md" color={useColorModeValue("gray.600", "gray.300")} mb={4}>
        Click the button below to download the teacher course template.
      </Text>

      <Box textAlign="center">
        <a href={filetemplate} download>
          <Button
            colorScheme="purple"
            leftIcon={<FiDownload />}
            size="md"
            borderRadius="md"
            px={6}
          >
            Download Teacher Template
          </Button>
        </a>
      </Box>
    </ModalBody>

    <ModalFooter
      borderTop="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      pt={4}
    >
      <Button variant="ghost" onClick={() => settemplatePop(false)} borderRadius="md">
        Close
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
    </Card>
  );
}