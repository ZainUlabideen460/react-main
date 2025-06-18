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

export default function SectionManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState(null);
  const [degreeName, setDegreeName] = useState('');
  const [semester, setSemester] = useState('');
  const [section, setSection] = useState('');
  const [shift, setShift] = useState('');
  const [studentCount, setStudentCount] = useState('');

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

  return (
    <Flex direction="column" w="100%" px="0px" overflowX="hidden">
      <Flex px="25px" justify="space-between" mb="20px" align="center">
        <Text fontSize="22px" fontWeight="700">Section Management</Text>
        <Button colorScheme="blue" onClick={() => setIsOpen(true)}>+ Add Section</Button>
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
    </Flex>
  );
}
