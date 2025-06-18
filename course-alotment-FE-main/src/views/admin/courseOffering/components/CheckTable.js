import React, { useState, useEffect } from "react";
import {
  Flex,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  TableCaption,
  Spinner,
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
  Box,
  useColorModeValue,
  InputGroup,
  Icon,
  InputLeftElement,
  // useColorModeValue,
  VStack,
  HStack,
} from "@chakra-ui/react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Select from "react-select";
import filetemplate from '../../../../../src/assets/template_file/courseOfferingtemplate.xlsx';
import { FiDownload } from "react-icons/fi";
import { FiSearch } from "react-icons/fi";
import { AddIcon } from "@chakra-ui/icons";
import { DeleteIcon, UploadIcon, ViewIcon } from "lucide-react";
const Card = ({ children, ...props }) => (
  <Box borderWidth="1px" borderRadius="lg" p="6" {...props}>
    {children}
  </Box>
);

export default function CheckTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courseOfferingId, setCourseOfferingId] = useState(null);
  // Removed coursename state
  const [crHrs, setCrHrs] = useState("");
  const [contact, setContact] = useState("");
  const [teachers, setTeachersData] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [status, setStatus] = useState("Visiting");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [templatePop,settemplatePop] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


  // New state variables for upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const textColor = useColorModeValue("gray.700", "white");

  useEffect(() => {
    fetchCourseOfferings();
    fetchTeachers();
    fetchCourses();
    fetchSections();
  }, []);

  const fetchCourseOfferings = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/courseoffering");
      const data = response.data;

      const processedData = data.map((item) => ({
        ...item,
        teachers: Array.isArray(item.teachers)
          ? item.teachers
          : JSON.parse(item.teachers || "[]"),
        courses:
          typeof item.courses === "string"
            ? JSON.parse(item.courses)
            : item.courses,
        sectionData:
          typeof item.sectionData === "string"
            ? JSON.parse(item.sectionData)
            : item.sectionData,
      }));

      setCourseOfferings(processedData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch course offerings");
    } finally {
      setLoading(false);
    }
  };



  const fetchTeachers = async () => {
    try {
      const response = await axios.get("http://localhost:3001/teachers");
      setTeachersData(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch teachers");
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:3001/courses");
      setCourses(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch courses");
    }
  };

  const fetchSections = async () => {
    try {
      const response = await axios.get("http://localhost:3001/sections");
      setSections(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch sections");
    }
  };

  const handleSubmit = async () => {
    if (
      !selectedCourse ||
      !crHrs ||
      !contact ||
      selectedTeachers.length === 0 ||
      !selectedSection
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const crHrsRegex = /^(\d+)\((\d+)-(\d+)\)$/;
    const match = crHrs.match(crHrsRegex);
    if (!match) {
      toast.error('Invalid cr-hrs format. Use format "3(2-4)"');
      return;
    }

    const contactInt = parseInt(contact, 10);
    if (isNaN(contactInt)) {
      toast.error("Invalid contact number provided. Must be a number.");
      return;
    }

    const courseOfferingData = {
      coursename: selectedCourse.name, // Derived from selectedCourse
      cr_hrs: crHrs,
      contact: contactInt,
      courses: {
        course_code: selectedCourse.course_code,
        name: selectedCourse.name,
      },
      teachers: selectedTeachers.map((teacher) => ({
        id: teacher.value,
        name: teacher.label,
      })),
      section: selectedSection,
      status,
    };

    try {
      if (courseOfferingId) {
        await axios.put(
          `http://localhost:3001/courseoffering/${courseOfferingId}`,
          courseOfferingData
        );
        toast.success("Course offering updated successfully");
      } else {
        await axios.post(
          "http://localhost:3001/courseoffering",
          courseOfferingData
        );
        toast.success("Course offering added successfully");
      }

      fetchCourseOfferings();
      closeModal();
    } catch (error) {
      console.error("Error Response:", error.response?.data);
      toast.error("Failed to submit course offering");
    }
  };

  const deleteCourseOffering = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/courseoffering/${id}`);
      toast.success("Course offering deleted successfully");
      fetchCourseOfferings();
    } catch (error) {
      console.error("Failed to delete course offering", error);
      toast.error("Failed to delete course offering");
    }
  };
  const handeldelete=async ()=>{
    try{
await axios.delete('http://localhost:3001/courseOfferingsdelete');
toast.success("course Offerings deleted successfully");

    }catch (error) {
      console.error("Failed to delete",error);

    }
  }

  const openModalForAdd = () => {
    setIsOpen(true);
    setCourseOfferingId(null);
    // Removed setCoursename
    setCrHrs("");
    setContact("");
    setSelectedTeachers([]);
    setStatus("Visiting");
    setSelectedCourse(null);
    setSelectedSection(null);
  };

  const openModalForUpdate = (courseOffering) => {
    setIsOpen(true);
    setCourseOfferingId(courseOffering.id);
    // Removed setCoursename
    setCrHrs(
      `${courseOffering.total_cr_hrs}(${courseOffering.theory_classes}-${courseOffering.lab_classes})`
    );
    setContact(courseOffering.contact.toString());
    setSelectedTeachers(
      courseOffering.teachers.map((teacher) => ({
        value: teacher.id,
        label: teacher.name,
      }))
    );
    setStatus(courseOffering.status);
    setSelectedCourse(courseOffering.courses);
    setSelectedSection(courseOffering.sectionData);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Removed setCoursename
    setCrHrs("");
    setContact("");
    setSelectedSection(null);
    setSelectedTeachers([]);
    setStatus("Visiting");
    setSelectedCourse(null);
    setCourseOfferingId(null);
  };

  // New functions for upload modal
  const openUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post("http://localhost:3001/coursesoffering/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Courses uploaded successfully");
      closeUploadModal();
      fetchCourseOfferings();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload courses");
    }
  };

  return (
    <Card
      direction="column"
      w="100%"
      px="0px"
      py="20px"
      overflowX={{ sm: "scroll", lg: "hidden" }}
    >
     <Flex px="25px" justify="space-between" mb="20px" align="center">
  <Text
    color={textColor}
    fontSize="22px"
    fontWeight="700"
    lineHeight="100%"
  >
    All Course Offerings
  </Text>

  <HStack spacing={3}>
    <Button
      leftIcon={<AddIcon />}
      colorScheme="blue"
      size="sm"
      onClick={openModalForAdd}
    >
      Add
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
      leftIcon={<UploadIcon />} // Replace with a valid icon or custom SVG
      colorScheme="green"
      size="sm"
      onClick={openUploadModal}
    >
      Upload Courses
    </Button>

    <Button
      leftIcon={<DeleteIcon />}
      colorScheme="red"
      size="sm"
      onClick={handeldelete}
    >
      Delete All
    </Button>
  </HStack>
</Flex>

      <Box maxW="96%" mx="auto" py={1} pb={5}>
      {/* Search Input */}
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <Icon as={FiSearch} color="gray.500" />
        </InputLeftElement>
        <Input
          type="text"
          placeholder="Search documents ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          borderRadius="md"
          bg={useColorModeValue("white", "gray.700")}
          shadow="sm"
        />
      </InputGroup>

    
    </Box>
      {loading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <TableContainer>
          <Table variant="simple">
            <TableCaption>Table for all the course offerings</TableCaption>
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>COURSE NAME</Th>
                <Th>CR-HRS</Th>
                <Th>CONTACT</Th>
                <Th>SECTION</Th>
                <Th>COURSE Code</Th>
                <Th>TEACHERS</Th>
                <Th>STATUS</Th>
                <Th>ACTION</Th>
              </Tr>
            </Thead>
            <Tbody>
              {
                courseOfferings.filter((item)=>{
                  const search=searchTerm.toLowerCase();
                  return(
                    item.coursename.toLowerCase().includes(search) ||item.courses?.course_code.toLowerCase().includes(search)||
                    
                    item.teachers?.some((teacher)=>
                    teacher.name.toLowerCase().includes(search)
                    )
                  )
                }).map((item) => (
                <Tr key={item.id}>
                  <Td>{item.id}</Td>
                  <Td>{item.coursename}</Td>
                  <Td>{`${item.total_cr_hrs}(${item.theory_classes}-${item.lab_classes})`}</Td>
                  <Td>{item.contact}</Td>
                  <Td>
                    {item.sectionData ? item.sectionData.sectionDisplay : ""}
                  </Td>
                  <Td>{item.courses ? item.courses.course_code : ""}</Td>
                  <Td>
                    {item.teachers && Array.isArray(item.teachers)
                      ? item.teachers.map((teacher) => teacher.name).join(", ")
                      : ""}
                  </Td>
                  <Td>{item.status}</Td>
                  <Td>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => openModalForUpdate(item)}
                      mr={2}
                    >
                      Update
                    </Button>
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => deleteCourseOffering(item.id)}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {/* Modal for Add/Update Course Offering */}
      <Modal isOpen={isOpen} onClose={closeModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {courseOfferingId
              ? "Update Course Offering"
              : "Add Course Offering"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Conditional Rendering for Course Name */}
            <FormControl isRequired>
              <FormLabel>Course Name</FormLabel>
              {courseOfferingId ? (
                <Select
                  value={
                    selectedCourse
                      ? {
                          value: selectedCourse,
                          label: selectedCourse.name,
                        }
                      : null
                  }
                  onChange={(option) => setSelectedCourse(option ? option.value : null)}
                  options={courses.map((course) => ({
                    value: course,
                    label: course.name,
                  }))}
                  placeholder="Select course name"
                />
              ) : (
                <Input
                  value={selectedCourse ? selectedCourse.name : ""}
                  onChange={(e) =>
                    setSelectedCourse(
                      courses.find(
                        (course) => course.name === e.target.value
                      ) || { name: e.target.value }
                    )
                  }
                  placeholder="Enter course name"
                />
              )}
            </FormControl>

            <FormControl isRequired mt={4}>
              <FormLabel>Credit Hours (Format: 3(2-4))</FormLabel>
              <Input
                value={crHrs}
                onChange={(e) => setCrHrs(e.target.value)}
                placeholder="Enter in format 3(2-4)"
              />
            </FormControl>

            <FormControl isRequired mt={4}>
              <FormLabel>Contact</FormLabel>
              <Input
                type="number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Enter contact number"
              />
            </FormControl>

            <FormControl isRequired mt={4}>
              <FormLabel>Section</FormLabel>
              <Select
                value={
                  selectedSection
                    ? {
                        value: selectedSection,
                        label: selectedSection.sectionDisplay,
                      }
                    : null
                }
                onChange={(option) =>
                  setSelectedSection(option ? option.value : null)
                }
                options={sections.map((sec) => ({
                  value: sec,
                  label: sec.sectionDisplay,
                }))}
                placeholder="Select a section"
              />
            </FormControl>

            {/* Removed Course Select since Course Name is now handled */}
            {/* If you still need to select a course, you can keep this section */}
            
            <FormControl isRequired mt={4}>
              <FormLabel>Course</FormLabel>
              <Select
                value={
                  selectedCourse
                    ? {
                        value: selectedCourse,
                        label: `${selectedCourse.course_code} - ${selectedCourse.name}`,
                      }
                    : null
                }
                onChange={(option) =>
                  setSelectedCourse(option ? option.value : null)
                }
                options={courses.map((course) => ({
                  value: course,
                  label: `${course.course_code} - ${course.name}`,
                }))}
                placeholder="Select a course"
              />
            </FormControl>
           

            <FormControl isRequired mt={4}>
              <FormLabel>Teachers</FormLabel>
              <Select
                isMulti
                value={selectedTeachers}
                onChange={(selected) => setSelectedTeachers(selected)}
                options={teachers.map((teacher) => ({
                  value: teacher.id,
                  label: teacher.name,
                }))}
                placeholder="Select teachers"
              />
            </FormControl>

            <FormControl isRequired mt={4}>
              <FormLabel>Status</FormLabel>
              <Select
                value={{ value: status, label: status }}
                onChange={(option) => setStatus(option ? option.value : "")}
                options={[
                  { value: "Visiting", label: "Visiting" },
                  { value: "Load", label: "Load" },
                ]}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
              {courseOfferingId ? "Update" : "Add"}
            </Button>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for Uploading Courses */}
      <Modal isOpen={isUploadModalOpen} onClose={closeUploadModal} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Courses</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Select Excel File</FormLabel>
              <Input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleFileUpload}>
              Upload
            </Button>
            <Button variant="ghost" onClick={closeUploadModal}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* courseOfferning template file and modals? */}
      <Modal isOpen={templatePop} onClose={() => settemplatePop(false)} isCentered size="md">
  <ModalOverlay />
  <ModalContent
    borderRadius="xl"
    boxShadow="2xl"
    bg={useColorModeValue("white", "gray.800")}
    px={6}
  >
    <ModalHeader
      fontSize="2xl"
      fontWeight="semibold"
      borderBottom="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      pb={3}
    >
      📄 Course Template Download
    </ModalHeader>
    <ModalCloseButton />
    <ModalBody py={6}>
      <Text fontSize="md" color={useColorModeValue("gray.600", "gray.300")} mb={5}>
        Please use the button below to download the latest course offering template.
      </Text>
      <Box textAlign="center">
        <a href={filetemplate} download>
          <Button
            colorScheme="teal"
            size="lg"
            borderRadius="md"
            leftIcon={<FiDownload />}
            px={8}
            fontWeight="medium"
          >
            Download Template
          </Button>
        </a>
      </Box>
    </ModalBody>
    <ModalFooter
      borderTop="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      pt={4}
    >
      <Button variant="outline" onClick={() => settemplatePop(false)} borderRadius="md">
        Close
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

    </Card>
  );
}
