// import React, { useState, useEffect } from 'react';
// import {
//   Flex,
//   Table,
//   Tbody,
//   Td,
//   Text,
//   Th,
//   Thead,
//   Tr,
//   Button,
//   TableContainer,
//   FormControl,
//   FormLabel,
//   Input,
//   Box,
//   Stack,
// } from "@chakra-ui/react";
// import {
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   ModalFooter,
// } from '@chakra-ui/react';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';

// export default function SectionManagement() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [sections, setSections] = useState([]);
//   const [sectionId, setSectionId] = useState(null);
//   const [degreeName, setDegreeName] = useState('');
//   const [semester, setSemester] = useState('');
//   const [section, setSection] = useState('');
//   const [shift, setShift] = useState('');
//   const [studentCount, setStudentCount] = useState('');

//   // Search form state
//   const [searchForm, setSearchForm] = useState({
//     searchQuery: '',
//   });

//   useEffect(() => {
//     fetchSections();
//   }, []);

//   const fetchSections = async () => {
//     try {
//       const response = await axios.get('http://localhost:3001/sections');
//       setSections(response.data);
//     } catch (error) {
//       toast.error('Failed to fetch sections');
//     }
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();

//     // Create the search query
//     const { searchQuery } = searchForm;

//     try {
//       const response = await axios.get(`http://localhost:3001/sections/search`, {
//         params: { searchQuery },
//       });
//       setSections(response.data);
//     } catch (error) {
//       if (error.response?.status === 404) {
//         toast.error('No sections found matching the criteria');
//         setSections([]);
//       } else {
//         toast.error('Failed to search sections');
//         setSections([]);
//       }
//     }
//   };

//   const handleSearchInputChange = (e) => {
//     const { name, value } = e.target;
//     setSearchForm(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const clearSearch = () => {
//     setSearchForm({ searchQuery: '' });
//     fetchSections(); // Reset to fetch all sections
//   };

//   const handleSubmit = async () => {
//     const sectionData = {
//       degreeName,
//       semester: parseInt(semester),
//       section,
//       shift,
//       studentCount: parseInt(studentCount),
//     };

//     try {
//       if (sectionId) {
//         await axios.put(`http://localhost:3001/sections/${sectionId}`, sectionData);
//         toast.success('Section updated successfully');
//       } else {
//         await axios.post('http://localhost:3001/sections', sectionData);
//         toast.success('Section added successfully');
//       }
//       fetchSections();
//       handleClose();
//     } catch (error) {
//       toast.error('Failed to perform operation');
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`http://localhost:3001/sections/${id}`);
//       toast.success('Section deleted successfully');
//       fetchSections();
//     } catch (error) {
//       toast.error('Failed to delete section');
//     }
//   };

//   const handleClose = () => {
//     setIsOpen(false);
//     setSectionId(null);
//     setDegreeName('');
//     setSemester('');
//     setSection('');
//     setShift('');
//     setStudentCount('');
//   };

//   return (
//     <Flex direction="column" w="100%" px="0px" overflowX="hidden">
//       <Flex px="25px" justify="space-between" mb="20px" align="center">
//         <Text fontSize="22px" fontWeight="700">Section Management</Text>
//         <Button colorScheme="blue" onClick={() => setIsOpen(true)}>+ Add Section</Button>
//       </Flex>

//       {/* Search Form */}
//       <Box px="25px" mb="20px">
//         <form onSubmit={handleSearch}>
//           <Stack direction={['column', 'row']} spacing="4" mb="4">
//             <FormControl>
//               <FormLabel>Search</FormLabel>
//               <Input
//                 name="searchQuery"
//                 value={searchForm.searchQuery}
//                 onChange={handleSearchInputChange}
//                 placeholder="Search by any field (degree, semester, section, shift)"
//               />
//             </FormControl>
//           </Stack>
//           <Stack direction="row" spacing="4">
//             <Button type="submit" colorScheme="blue">
//               Search
//             </Button>
//             <Button onClick={clearSearch}>
//               Clear Search
//             </Button>
//           </Stack>
//         </form>
//       </Box>

//       <TableContainer>
//         <Table variant='simple'>
//           <Thead>
//             <Tr>
//               <Th>ID</Th>
//               <Th>Degree Name</Th>
//               <Th>Semester</Th>
//               <Th>Section</Th>
//               <Th>Shift</Th>
//               <Th>Student Count</Th>
//               <Th>Actions</Th>
//             </Tr>
//           </Thead>
//           <Tbody>
//             {sections.map(section => (
//               <Tr key={section.id}>
//                 <Td>{section.id}</Td>
//                 <Td>{section.degreeName}</Td>
//                 <Td>{section.semester}</Td>
//                 <Td>{section.section}</Td>
//                 <Td>{section.shift}</Td>
//                 <Td>{section.studentCount}</Td>
//                 <Td>
//                   <Button 
//                     colorScheme="blue" 
//                     size="sm" 
//                     mr="2"
//                     onClick={() => {
//                       setSectionId(section.id);
//                       setDegreeName(section.degreeName);
//                       setSemester(section.semester);
//                       setSection(section.section);
//                       setShift(section.shift);
//                       setStudentCount(section.studentCount);
//                       setIsOpen(true);
//                     }}
//                   >
//                     Update
//                   </Button>
//                   <Button 
//                     colorScheme="red" 
//                     size="sm" 
//                     onClick={() => handleDelete(section.id)}
//                   >
//                     Delete
//                   </Button>
//                 </Td>
//               </Tr>
//             ))}
//           </Tbody>
//         </Table>
//       </TableContainer>

//       <Modal isOpen={isOpen} onClose={handleClose}>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>{sectionId ? 'Update Section' : 'Add Section'}</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <FormControl>
//               <FormLabel>Degree Name</FormLabel>
//               <Input value={degreeName} onChange={(e) => setDegreeName(e.target.value)} />
//             </FormControl>
//             <FormControl mt={4}>
//               <FormLabel>Semester</FormLabel>
//               <Input type="number" value={semester} onChange={(e) => setSemester(e.target.value)} />
//             </FormControl>
//             <FormControl mt={4}>
//               <FormLabel>Section</FormLabel>
//               <Input value={section} onChange={(e) => setSection(e.target.value)} />
//             </FormControl>
//             <FormControl mt={4}>
//               <FormLabel>Shift</FormLabel>
//               <Input value={shift} onChange={(e) => setShift(e.target.value)} />
//             </FormControl>
//             <FormControl mt={4}>
//               <FormLabel>Student Count</FormLabel>
//               <Input type="number" value={studentCount} onChange={(e) => setStudentCount(e.target.value)} />
//             </FormControl>
//           </ModalBody>
//           <ModalFooter>
//             <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
//               {sectionId ? 'Update' : 'Add'}
//             </Button>
//             <Button variant="ghost" onClick={handleClose}>Cancel</Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </Flex>
//   );
// }





import React, { useState, useEffect } from 'react';
import {
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Button,
  TableContainer,
  FormControl,
  FormLabel,
  Input,
  Box,
  Stack,
  useDisclosure
} from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { saveAs } from 'file-saver';

export default function SectionManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState(null);
  const [degreeName, setDegreeName] = useState('');
  const [semester, setSemester] = useState('');
  const [section, setSection] = useState('');
  const [shift, setShift] = useState('');
  const [studentCount, setStudentCount] = useState('');
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
const [selectedFile, setSelectedFile] = useState(null);
const [isUploading, setIsUploading] = useState(false);

  // Search form state
  const [searchForm, setSearchForm] = useState({
    searchQuery: '',
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await axios.get('http://localhost:3001/sections');
      setSections(response.data);
    } catch (error) {
      toast.error('Failed to fetch sections');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    // Create the search query
    const { searchQuery } = searchForm;

    try {
      const response = await axios.get(`http://localhost:3001/sections/search`, {
        params: { searchQuery },
      });
      setSections(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('No sections found matching the criteria');
        setSections([]);
      } else {
        toast.error('Failed to search sections');
        setSections([]);
      }
    }
  };

  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearSearch = () => {
    setSearchForm({ searchQuery: '' });
    fetchSections(); // Reset to fetch all sections
  };

  const handleSubmit = async () => {
    const sectionData = {
      degreeName,
      semester: parseInt(semester),
      section,
      shift,
      studentCount: parseInt(studentCount),
    };

    try {
      if (sectionId) {
        await axios.put(`http://localhost:3001/sections/${sectionId}`, sectionData);
        toast.success('Section updated successfully');
      } else {
        await axios.post('http://localhost:3001/sections', sectionData);
        toast.success('Section added successfully');
      }
      fetchSections();
      handleClose();
    } catch (error) {
      toast.error('Failed to perform operation');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/sections/${id}`);
      toast.success('Section deleted successfully');
      fetchSections();
    } catch (error) {
      toast.error('Failed to delete section');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSectionId(null);
    setDegreeName('');
    setSemester('');
    setSection('');
    setShift('');
    setStudentCount('');
  };
  // Add this function inside your SectionManagement component, before the return statement
const handleExportToExcel = async () => {
  try {
    const response = await axios.get('http://localhost:3001/sections/export', {
      responseType: 'blob', // Important for handling binary data
    });
    
    // Create a blob from the response
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Trigger download
    saveAs(blob, 'sections.xlsx');
    
    toast.success('Sections exported successfully');
  } catch (error) {
    console.error('Error exporting sections:', error);
    toast.error('Failed to export sections');
  }
};

const handleFileChange = (e) => {
  if (e.target.files && e.target.files[0]) {
    setSelectedFile(e.target.files[0]);
  }
};

const handleUpload = async () => {
  if (!selectedFile) {
    toast.error('Please select a file');
    return;
  }

  const formData = new FormData();
  formData.append('file', selectedFile);

  setIsUploading(true);
  try {
    const response = await axios.post('http://localhost:3001/sections/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    toast.success(`Successfully uploaded ${response.data.count} sections`);
    fetchSections(); // Refresh the sections list
    onUploadClose();
    setSelectedFile(null);
  } catch (error) {
    console.error('Error uploading file:', error);
    toast.error(error.response?.data?.message || 'Error uploading file');
  } finally {
    setIsUploading(false);
  }
};
  return (
    <Flex direction="column" w="100%" px="0px" overflowX="hidden">
    <Flex px="25px" justify="space-between" mb="20px" align="center">
  {/* Left side - Title */}
  <Text fontSize="22px" fontWeight="700">
    Section Management
  </Text>

  {/* Right side - Buttons */}
  <Flex gap="10px">
    <Button colorScheme="blue" onClick={() => setIsOpen(true)}>
      + Add Section
    </Button>
    <Button colorScheme="green" onClick={handleExportToExcel}>
      Export to Excel
    </Button>
    <Button colorScheme="green" onClick={onUploadOpen}>
      Upload Sections
    </Button>
  </Flex>
</Flex>


      {/* Search Form */}
      <Box px="25px" mb="20px">
        <form onSubmit={handleSearch}>
          <Stack direction={['column', 'row']} spacing="4" mb="4">
            <FormControl>
              <FormLabel>Search</FormLabel>
              <Input
                name="searchQuery"
                value={searchForm.searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search by any field (degree, semester, section, shift)"
              />
            </FormControl>
          </Stack>
          <Stack direction="row" spacing="4">
            <Button type="submit" colorScheme="blue">
              Search
            </Button>
            <Button onClick={clearSearch}>
              Clear Search
            </Button>
          </Stack>
        </form>
      </Box>

      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Degree Name</Th>
              <Th>Semester</Th>
              <Th>Section</Th>
              <Th>Shift</Th>
              <Th>Student Count</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sections.map(section => (
              <Tr key={section.id}>
                <Td>{section.id}</Td>
                <Td>{section.degreeName}</Td>
                <Td>{section.semester}</Td>
                <Td>{section.section}</Td>
                <Td>{section.shift}</Td>
                <Td>{section.studentCount}</Td>
                <Td>
                  <Button 
                    colorScheme="blue" 
                    size="sm" 
                    mr="2"
                    onClick={() => {
                      setSectionId(section.id);
                      setDegreeName(section.degreeName);
                      setSemester(section.semester);
                      setSection(section.section);
                      setShift(section.shift);
                      setStudentCount(section.studentCount);
                      setIsOpen(true);
                    }}
                  >
                    Update
                  </Button>
                  <Button 
                    colorScheme="red" 
                    size="sm" 
                    onClick={() => handleDelete(section.id)}
                  >
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{sectionId ? 'Update Section' : 'Add Section'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Degree Name</FormLabel>
              <Input value={degreeName} onChange={(e) => setDegreeName(e.target.value)} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Semester</FormLabel>
              <Input type="number" value={semester} onChange={(e) => setSemester(e.target.value)} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Section</FormLabel>
              <Input value={section} onChange={(e) => setSection(e.target.value)} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Shift</FormLabel>
              <Input value={shift} onChange={(e) => setShift(e.target.value)} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Student Count</FormLabel>
              <Input type="number" value={studentCount} onChange={(e) => setStudentCount(e.target.value)} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
              {sectionId ? 'Update' : 'Add'}
            </Button>
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Add this modal for file upload */}
<Modal isOpen={isUploadOpen} onClose={onUploadClose}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Upload Sections</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <FormControl>
        <FormLabel>Select Excel File</FormLabel>
        <Input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
        />
        <Text fontSize="sm" mt={2} color="gray.500">
          File should have these columns: DEGREE NAME, SEMESTER, SECTION, SHIFT, STUDENT COUNT
        </Text>
      </FormControl>
    </ModalBody>
    <ModalFooter>
      <Button 
        colorScheme="blue" 
        mr={3} 
        onClick={handleUpload}
        isLoading={isUploading}
        loadingText="Uploading..."
      >
        Upload
      </Button>
      <Button onClick={onUploadClose}>Cancel</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
    </Flex>
  );
}
