// import React, { useState, useEffect } from 'react';
// import { Box, Icon, InputGroup, InputLeftElement } from '@chakra-ui/react';
// import { FaEye, FaPlus, FaUpload } from 'react-icons/fa';
// import {
//   Flex,
//   Table,
//   Tbody,
//   Td,
//   Text,
//   Th,
//   Thead,
//   Tr,
//   useColorModeValue,
//   Button,
//   TableCaption,
//   TableContainer,
// } from "@chakra-ui/react";
// import {
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   ModalFooter,
//   FormControl,
//   FormLabel,
//   Input,
// } from '@chakra-ui/react';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';
// import filetemplate from '../../../../../src/assets/template_file/course.xlsx';
// import { FiDownload, FiSearch } from "react-icons/fi"

// // Custom components
// import Card from "components/card/Card";
// import { ViewIcon } from 'lucide-react';
// // import { saveAs } from 'file-saver';
// export default function CheckTable(props) {
//   const { columnsData } = props;
//   const [isOpen, setIsOpen] = useState(false)
//   const [coursesData, setCoursesData] = useState([]);
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [operationType, setOperationType] = useState('add');
//   const [courseId, setCourseId] = useState(null);
//   const [courseCode, setCourseCode] = useState("");
//   const [preReq, setPrereq] = useState("");
//   const [creditHour, setCreditHour] = useState(0);
//   const [theoryClasses, setTheoryClasses] = useState(0);
//   const [practicalClasses, setPracticalClasses] = useState(0);
//   const [uploadOpen, setUploadOpen] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [templatePop,settemplatePop] = useState(false);
//   const [searchTerm,setsearchTerm]=useState('');
 
  
//   useEffect(() => {
//     fetchCourses();
    
//   }, []);

//  // Fetch courses
// // Fetch courses
// const fetchCourses = async () => {
//   try {
//     const response = await axios.get('http://localhost:3001/courses');
//     setCoursesData(response.data);
//     console.log(response.data)
//   } catch (error) {
//     toast.error('Failed to fetch courses');
//     console.error(error);
//   }
// };

// // Add or update course
// const handleSubmit = async () => {
//   try {
//     const courseData = {
//       name,
//       description,
//       course_code: courseCode,
//       credit_hour: parseInt(creditHour),
//       theory_classes: parseInt(theoryClasses),
//       practical_classes: parseInt(practicalClasses),
//       Pre_Reqs: preReq,

//     };
//     console.log(courseData)

//     if (operationType === 'add') {
//       await axios.post('http://localhost:3001/courses', courseData);
//       toast.success('Course added successfully');
//     } else if (operationType === 'update') {
//       await axios.put(`http://localhost:3001/courses/${courseId}`, courseData);
//       toast.success('Course updated successfully');
//     }
//     fetchCourses();
//     resetForm();
//   } catch (error) {
//     console.error(error);
//     toast.error('Failed to perform operation');
//   }
// };


// // Add or update course
// const handleFileUpload = async () => {
//   if (!selectedFile) return;

//   const formData = new FormData();
//   formData.append('file', selectedFile);

//   try {
//     await axios.post('http://localhost:3001/courses/upload', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     toast.success('File uploaded and courses added successfully');
//     fetchCourses(); // Refresh the courses list
//     setUploadOpen(false);
//     setSelectedFile(null);
//   } catch (error) {
//     console.error(error);
//     toast.error('Failed to upload file');
//   }
// };

  
//   const resetForm = () => {
//     setIsOpen(false);
//     setName("");
//     setCourseCode("");
//     setDescription("");
//     setCreditHour(0);
//     setTheoryClasses(0);
//     setPracticalClasses(0);
//     setPrereq("");
//     setOperationType('add');
//     setCourseId(null);
    
//   };
  
//   const deleteCourse = async (courseId) => {
//     try {
//       await axios.delete(`http://localhost:3001/courses/${courseId}`);
//       toast.success('Course deleted successfully');
//       fetchCourses(); // Refresh the courses list
//     } catch (error) {
//       toast.error('Failed to delete course');
//     }
//   };

//   const openModalForUpdate = (course) => {
//   setOperationType('update');
//   setCourseId(course.id);
//   setName(course.name);
//   setCourseCode(course.course_code);
//   setDescription(course.description);
//   setCreditHour(course.credit_hour);
//   setTheoryClasses(course.theory_classes);
//   setPracticalClasses(course.practical_classes);
//   setPrereq(course.preReq);

//   setIsOpen(true);
// };
// const cr_hrs = (credit_hour, theory_classes, practical_classes) => {
//   return `${credit_hour} (${theory_classes}-${practical_classes})`;
// };

//   const textColor = useColorModeValue("secondaryGray.900", "white");
//   return (
//     <Card
//       direction="column"
//       w="100%"
//       px="0px"
//       overflowX={{ sm: "scroll", lg: "hidden" }}
//     >
//  <Flex px="25px" justify="space-between" align="center" mb="20px">
//   <Text
//     color={textColor}
//     fontSize="22px"
//     fontWeight="700"
//     lineHeight="100%"
//   >
//     All Courses
//   </Text>

//   <Flex flexWrap="wrap" gap={3}>
//     <Button
//       leftIcon={<Icon as={FaPlus} />}
//       colorScheme="blue"
//       size="sm"
//       onClick={() => setIsOpen(true)}
//     >
//       Add Course
//     </Button>

//     <Button
//       leftIcon={<ViewIcon/>}
//       colorScheme="teal"
//       size="sm"
//       onClick={() => settemplatePop(true)}
//     >
//       Show Template
//     </Button>

//     <Button
//       leftIcon={<Icon as={FaUpload} />}
//       colorScheme="green"
//       size="sm"
//       onClick={() => setUploadOpen(true)}
//     >
//       Upload File
//     </Button>
//   </Flex>
    
// </Flex>


//       <TableContainer>
//       <Box maxW="96%" mx="auto" py={1} pb={5}>
//         {/* Search Input */}
//         <InputGroup>
//           <InputLeftElement pointerEvents="none">
//             <Icon as={FiSearch} color="gray.500" />
//           </InputLeftElement>
//           <Input
//             type="text"
//             placeholder="Search documents..."
//             value={searchTerm}
//          onChange={(e)=>setsearchTerm(e.target.value)}
//             borderRadius="md"
//             bg={useColorModeValue("white", "gray.700")}
//             shadow="sm"
//           />
//         </InputGroup>
  
      
//       </Box>
//         <Table variant='simple'>
//           <TableCaption>Table for all the courses</TableCaption>
//           <Thead>
//             <Tr>
//               {
//                 columnsData.map((items) => {
//                   return (
//                     <Th key={items.Header}>{items.Header}</Th>
//                   )
//                 })
//               }
//             </Tr>
//           </Thead>
//           <Tbody>
//             {
//               coursesData.filter((item)=>{
//                 const search=searchTerm.toLowerCase();
//                 return(
//                   item.name?.toLowerCase().includes(search) || item.courseCode?.toLowerCase().includes(search) || item.creditHour?.toLowerCase().includes(search)
//                 )

//               }).map(items => 
           
//               <Tr key={items.name}>
//   <Td>{items.id}</Td>
//   <Td>{items.name}</Td>
//   <Td>{items.course_code}</Td>
//   {/* <Td>{items.description}</Td> */}
//   <Td>{items.credit_hour}</Td>
//   <Td>{items.theory_classes}</Td>
//   <Td>{items.practical_classes}</Td>

//   <Td>{cr_hrs(items.credit_hour, items.theory_classes, items.practical_classes)}</Td>
//   <Td>{items.Pre_Reqs}</Td>
//   <Td>{items.createdAt}</Td>
//   <Td>{items.updatedAt}</Td>
//   <Td>
//     <div style={{ display: 'flex', gap: "10px" }}>
//       <Button colorScheme="blue" size="sm" onClick={() => openModalForUpdate(items)}>Update</Button>
//       <Button colorScheme="red" size="sm" onClick={() => deleteCourse(items.id)}>Delete</Button>
//     </div>
//   </Td>
// </Tr>

//               )
//             }

//           </Tbody>
//         </Table>
//       </TableContainer>

//       {/* file template  */}
//       <Modal isOpen={templatePop} onClose={() => settemplatePop(false)} isCentered size="md">
//   <ModalOverlay />
//   <ModalContent
//     borderRadius="xl"
//     boxShadow="lg"
//     bg={useColorModeValue("white", "gray.800")}
//     px={6}
//   >
//     <ModalHeader
//       fontSize="2xl"
//       fontWeight="bold"
//       borderBottom="1px solid"
//       borderColor={useColorModeValue("gray.200", "gray.700")}
//       pb={3}
//     >
//       Course Template
//     </ModalHeader>
//     <ModalCloseButton />
//     <ModalBody py={6}>
//       {/* <img src={co} alt='coursepic' style={{ width: "100%", borderRadius: "8px", marginBottom: "1rem" }} /> */}

//       <Text fontSize="md" color={useColorModeValue("gray.600", "gray.300")} mb={4}>
//         Click below to download the latest course template file.
//       </Text>

//       <Box textAlign="center">
//         <a href={filetemplate} download>
//           <Button
//             leftIcon={<FiDownload />}
//             colorScheme="blue"
//             size="md"
//             borderRadius="md"
//             px={6}
//             fontWeight="medium"
//           >
//             Download Courses Template
//           </Button>
//         </a>
//       </Box>
//     </ModalBody>
//     <ModalFooter
//       borderTop="1px solid"
//       borderColor={useColorModeValue("gray.200", "gray.700")}
//       pt={4}
//     >
//       <Button variant="ghost" onClick={() => settemplatePop(false)} borderRadius="md">
//         Close
//       </Button>
//     </ModalFooter>
//   </ModalContent>
// </Modal>

//       <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>{operationType === 'add' ? 'Add Course' : 'Update Course'}</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <FormControl>
//               <FormLabel>Name</FormLabel>
//               <Input value={name} onChange={(e) => setName(e.target.value)} />
//             </FormControl>

//             <FormControl>
//               <FormLabel>Course Code</FormLabel>
//               <Input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
//             </FormControl>

        


//             {/* <FormControl mt={4}>
//               <FormLabel>Description</FormLabel>
//               <Input value={description} onChange={(e) => setDescription(e.target.value)} />
//             </FormControl> */}
//             <FormControl>
//   <FormLabel>Credit Hour</FormLabel>
//   <Input
//     type="number"
//     value={creditHour}
//     onChange={(e) => setCreditHour(e.target.value)}
//   />
// </FormControl>

// <FormControl>
//   <FormLabel>Theory Classes</FormLabel>
//   <Input   type="number" value={theoryClasses} onChange={(e) => setTheoryClasses(e.target.value)} />
// </FormControl>

// <FormControl>
//   <FormLabel>Practical Classes</FormLabel>
//   <Input   type="number" value={practicalClasses} onChange={(e) => setPracticalClasses(e.target.value)} />
// </FormControl>
// <FormControl>
//   <FormLabel>Prerequisite</FormLabel>
//   <Input value={preReq} onChange={(e) => setPrereq(e.target.value)} />
// </FormControl>
// {/* <FormControl >
//   <FormLabel>Cr Hrs</FormLabel>
//   <Input   type="number" value={CrHrs} onChange={(e) => setCrHrs(e.target.value)} />
// </FormControl> */}
//           </ModalBody>

//           <ModalFooter>
//             <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
//               {operationType === 'add' ? 'Add' : 'Update'}
//             </Button>
//             <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//       {/* Upload File Modal */}
// <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)}>
//   <ModalOverlay />
//   <ModalContent>
//     <ModalHeader>Upload Courses from Excel</ModalHeader>
//     <ModalCloseButton />
//     <ModalBody>
//       <FormControl>
//         <FormLabel>Select Excel File</FormLabel>
//         <Input
//           type="file"
//           accept=".xlsx, .xls"
//           onChange={(e) => setSelectedFile(e.target.files[0])}
//         />
//       </FormControl>
//     </ModalBody>
//     <ModalFooter>
//       <Button
//         colorScheme="green"
//         mr={3}
//         onClick={handleFileUpload}
//         disabled={!selectedFile}
//       >
//         Upload
//       </Button>
//       <Button variant="outline" onClick={() => setUploadOpen(false)}>
//         Cancel
//       </Button>
//     </ModalFooter>
//   </ModalContent>
// </Modal>

//     </Card>
//   );
// }


import React, { useState, useEffect } from 'react';
import { Box, Icon, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { FaEye, FaPlus, FaUpload } from 'react-icons/fa';
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
} from '@chakra-ui/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import filetemplate from '../../../../../src/assets/template_file/course.xlsx';
import { FiDownload, FiSearch } from "react-icons/fi"


// Custom components
import Card from "components/card/Card";
import { ViewIcon } from 'lucide-react';
// import { saveAs } from 'file-saver';
export default function CheckTable(props) {
  const { columnsData } = props;
  const [isOpen, setIsOpen] = useState(false)
  const [coursesData, setCoursesData] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [operationType, setOperationType] = useState('add');
  const [courseId, setCourseId] = useState(null);
  const [courseCode, setCourseCode] = useState("");
  const [preReq, setPrereq] = useState("");
  const [creditHour, setCreditHour] = useState(0);
  const [theoryClasses, setTheoryClasses] = useState(0);
  const [practicalClasses, setPracticalClasses] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [templatePop,settemplatePop] = useState(false);
  const [searchTerm,setsearchTerm]=useState('');
 
  
  useEffect(() => {
    fetchCourses();
    
  }, []);

 // Fetch courses
// Fetch courses
const fetchCourses = async () => {
  try {
    const response = await axios.get('http://localhost:3001/courses');
    setCoursesData(response.data);
    console.log(response.data)
  } catch (error) {
    toast.error('Failed to fetch courses');
    console.error(error);
  }
};

// Add or update course
const handleSubmit = async () => {
  try {
    const courseData = {
      name,
      description,
      course_code: courseCode,
      credit_hour: parseInt(creditHour),
      theory_classes: parseInt(theoryClasses),
      practical_classes: parseInt(practicalClasses),
      Pre_Reqs: preReq,

    };
    console.log(courseData)

    if (operationType === 'add') {
      await axios.post('http://localhost:3001/courses', courseData);
      toast.success('Course added successfully');
    } else if (operationType === 'update') {
      await axios.put(`http://localhost:3001/courses/${courseId}`, courseData);
      toast.success('Course updated successfully');
    }
    fetchCourses();
    resetForm();
  } catch (error) {
    console.error(error);
    toast.error('Failed to perform operation');
  }
};


// Add or update course
const handleFileUpload = async () => {
  if (!selectedFile) return;

  const formData = new FormData();
  formData.append('file', selectedFile);

  try {
    await axios.post('http://localhost:3001/courses/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    toast.success('File uploaded and courses added successfully');
    fetchCourses(); // Refresh the courses list
    setUploadOpen(false);
    setSelectedFile(null);
  } catch (error) {
    console.error(error);
    toast.error('Failed to upload file');
  }
};

  
  const resetForm = () => {
    setIsOpen(false);
    setName("");
    setCourseCode("");
    setDescription("");
    setCreditHour(0);
    setTheoryClasses(0);
    setPracticalClasses(0);
    setPrereq("");
    setOperationType('add');
    setCourseId(null);
    
  };
  
  const deleteCourse = async (courseId) => {
    try {
      await axios.delete(`http://localhost:3001/courses/${courseId}`);
      toast.success('Course deleted successfully');
      fetchCourses(); // Refresh the courses list
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const openModalForUpdate = (course) => {
  setOperationType('update');
  setCourseId(course.id);
  setName(course.name);
  setCourseCode(course.course_code);
  setDescription(course.description);
  setCreditHour(course.credit_hour);
  setTheoryClasses(course.theory_classes);
  setPracticalClasses(course.practical_classes);
  setPrereq(course.preReq);

  setIsOpen(true);
};
const cr_hrs = (credit_hour, theory_classes, practical_classes) => {
  return `${credit_hour} (${theory_classes}-${practical_classes})`;
};

const exportToExcel = async () => {
  try {
    console.log('Starting export...');
    
    // Show loading state
    const toastId = toast.loading('Preparing export...');
    
    const response = await axios.get('http://localhost:3001/api/courses/export', {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });

    console.log('Response status:', response.status);
    
    if (response.status === 200) {
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `courses_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Update toast to success
      toast.success('Courses exported successfully!', {
        id: toastId,
        duration: 3000
      });
      return;
    }

    // Handle non-200 responses
    const errorText = await new Response(response.data).text();
    let errorMessage = 'Export failed';
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);

  } catch (error) {
    console.error('Export failed:', error);
    
    // Show error toast
    toast.error(error.message || 'Failed to export courses. Please try again.', {
      duration: 5000
    });
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
 <Flex px="25px" justify="space-between" align="center" mb="20px">
  <Text
    color={textColor}
    fontSize="22px"
    fontWeight="700"
    lineHeight="100%"
  >
    All Courses
  </Text>

  <Flex flexWrap="wrap" gap={3}>
    <Button
      leftIcon={<Icon as={FaPlus} />}
      colorScheme="blue"
      size="sm"
      onClick={() => setIsOpen(true)}
    >
      Add Course
    </Button>

    <Button
      leftIcon={<ViewIcon/>}
      colorScheme="teal"
      size="sm"
      onClick={() => settemplatePop(true)}
    >
      Show Template
    </Button>

    <Button
      leftIcon={<Icon as={FaUpload} />}
      colorScheme="green"
      size="sm"
      onClick={() => setUploadOpen(true)}
    >
      Upload File
    </Button>
    <Button
  leftIcon={<FiDownload />}
  colorScheme="teal"
  variant="outline"
  size="sm"
  onClick={exportToExcel}
  ml={2}
  // isLoading={isExporting} // Optional: Add a loading state
>
  Export to Excel
</Button>
  </Flex>
    
</Flex>


      <TableContainer>
      <Box maxW="96%" mx="auto" py={1} pb={5}>
        {/* Search Input */}
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.500" />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
         onChange={(e)=>setsearchTerm(e.target.value)}
            borderRadius="md"
            bg={useColorModeValue("white", "gray.700")}
            shadow="sm"
          />
        </InputGroup>
  
      
      </Box>
        <Table variant='simple'>
          <TableCaption>Table for all the courses</TableCaption>
          <Thead>
            <Tr>
              {
                columnsData.map((items) => {
                  return (
                    <Th key={items.Header}>{items.Header}</Th>
                  )
                })
              }
            </Tr>
          </Thead>
          <Tbody>
            {
              coursesData.filter((item)=>{
                const search=searchTerm.toLowerCase();
                return(
                  item.name?.toLowerCase().includes(search) || item.courseCode?.toLowerCase().includes(search) || item.creditHour?.toLowerCase().includes(search)
                )

              }).map(items => 
           
              <Tr key={items.name}>
  <Td>{items.id}</Td>
  <Td>{items.name}</Td>
  <Td>{items.course_code}</Td>
  {/* <Td>{items.description}</Td> */}
  <Td>{items.credit_hour}</Td>
  <Td>{items.theory_classes}</Td>
  <Td>{items.practical_classes}</Td>

  <Td>{cr_hrs(items.credit_hour, items.theory_classes, items.practical_classes)}</Td>
  <Td>{items.Pre_Reqs}</Td>
  <Td>{items.createdAt}</Td>
  <Td>{items.updatedAt}</Td>
  <Td>
    <div style={{ display: 'flex', gap: "10px" }}>
      <Button colorScheme="blue" size="sm" onClick={() => openModalForUpdate(items)}>Update</Button>
      <Button colorScheme="red" size="sm" onClick={() => deleteCourse(items.id)}>Delete</Button>
    </div>
  </Td>
</Tr>

              )
            }

          </Tbody>
        </Table>
      </TableContainer>

      {/* file template  */}
      <Modal isOpen={templatePop} onClose={() => settemplatePop(false)} isCentered size="md">
  <ModalOverlay />
  <ModalContent
    borderRadius="xl"
    boxShadow="lg"
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
      Course Template
    </ModalHeader>
    <ModalCloseButton />
    <ModalBody py={6}>
      {/* <img src={co} alt='coursepic' style={{ width: "100%", borderRadius: "8px", marginBottom: "1rem" }} /> */}

      <Text fontSize="md" color={useColorModeValue("gray.600", "gray.300")} mb={4}>
        Click below to download the latest course template file.
      </Text>

      <Box textAlign="center">
        <a href={filetemplate} download>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="blue"
            size="md"
            borderRadius="md"
            px={6}
            fontWeight="medium"
          >
            Download Courses Template
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{operationType === 'add' ? 'Add Course' : 'Update Course'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel>Course Code</FormLabel>
              <Input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
            </FormControl>

        


            {/* <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormControl> */}
            <FormControl>
  <FormLabel>Credit Hour</FormLabel>
  <Input
    type="number"
    value={creditHour}
    onChange={(e) => setCreditHour(e.target.value)}
  />
</FormControl>

<FormControl>
  <FormLabel>Theory Classes</FormLabel>
  <Input   type="number" value={theoryClasses} onChange={(e) => setTheoryClasses(e.target.value)} />
</FormControl>

<FormControl>
  <FormLabel>Practical Classes</FormLabel>
  <Input   type="number" value={practicalClasses} onChange={(e) => setPracticalClasses(e.target.value)} />
</FormControl>
<FormControl>
  <FormLabel>Prerequisite</FormLabel>
  <Input value={preReq} onChange={(e) => setPrereq(e.target.value)} />
</FormControl>
{/* <FormControl >
  <FormLabel>Cr Hrs</FormLabel>
  <Input   type="number" value={CrHrs} onChange={(e) => setCrHrs(e.target.value)} />
</FormControl> */}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
              {operationType === 'add' ? 'Add' : 'Update'}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Upload File Modal */}
<Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Upload Courses from Excel</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <FormControl>
        <FormLabel>Select Excel File</FormLabel>
        <Input
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
      </FormControl>
    </ModalBody>
    <ModalFooter>
      <Button
        colorScheme="green"
        mr={3}
        onClick={handleFileUpload}
        disabled={!selectedFile}
      >
        Upload
      </Button>
      <Button variant="outline" onClick={() => setUploadOpen(false)}>
        Cancel
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

    </Card>
  );
}
