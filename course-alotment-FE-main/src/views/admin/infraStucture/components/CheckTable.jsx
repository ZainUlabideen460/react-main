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
//   Box,
//   InputGroup,
//   InputLeftElement,
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
//   Switch,
//   Select,
//   Icon,
//   useColorModeValue,
// } from '@chakra-ui/react';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';

// import { FiSearch } from 'react-icons/fi';

// export default function RoomManagement() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [rooms, setRooms] = useState([]);
//   const [roomId, setRoomId] = useState(null);
//   const [name, setName] = useState('');
//   const [type, setType] = useState('Class');
//   const [multimedia, setMultimedia] = useState(false);
//   const [totalSpace, setTotalSpace] = useState('');
//   const [occupiedSpace, setOccupiedSpace] = useState('');
//   const [totalPCs, setTotalPCs] = useState('');
//   const [availablePCs, setAvailablePCs] = useState('');
// const [searchTerm,setsearchTerm]=useState('');
//   useEffect(() => {
//     fetchRooms();
//   }, []);

//   const fetchRooms = async () => {
//     try {
//       const response = await axios.get('http://localhost:3001/rooms');
//       setRooms(response.data);
//     } catch (error) {
//       toast.error('Failed to fetch rooms');
//     }
//   };

//   const handleSubmit = async () => {
//     const roomData = {
//       name,
//       type,
//       multimedia,
//       totalSpace: parseInt(totalSpace),
//       occupiedSpace: parseInt(occupiedSpace),
//       totalPCs: type === 'Lab' ? parseInt(totalPCs) : null,
//       availablePCs: type === 'Lab' ? parseInt(availablePCs) : null,
//     };

//     try {
//       if (roomId) {
//         await axios.put(`http://localhost:3001/rooms/${roomId}`, roomData);
//         toast.success('Room updated successfully');
//       } else {
//         await axios.post('http://localhost:3001/rooms', roomData);
//         toast.success('Room added successfully');
//       }
//       fetchRooms();
//       handleClose();
//     } catch (error) {
//       toast.error('Failed to perform operation');
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`http://localhost:3001/rooms/${id}`);
//       toast.success('Room deleted successfully');
//       fetchRooms();
//     } catch (error) {
//       toast.error('Failed to delete room');
//     }
//   };

//   const handleClose = () => {
//     setIsOpen(false);
//     setRoomId(null);
//     setName('');
//     setType('Class');
//     setMultimedia(false);
//     setTotalSpace('');
//     setOccupiedSpace('');
//     setTotalPCs('');
//     setAvailablePCs('');
//   };

//   return (
//     <Flex direction="column" w="100%" px="0px" overflowX="hidden">
//       <Flex px="25px" justify="space-between" mb="20px" align="center">
//         <Text fontSize="22px" fontWeight="700">Room Management</Text>
      
//         <Button colorScheme="blue" onClick={() => setIsOpen(true)}>+ Add Room</Button>
       
//       </Flex>
//       <TableContainer>
//       <Box maxW="96%" mx="auto" py={1} pb={5}>
//                 {/* Search Input */}
//                 <InputGroup>
//                   <InputLeftElement pointerEvents="none">
//                     <Icon as={FiSearch} color="gray.500"  mt={3}/>
//                   </InputLeftElement>
//                   <Input
//                     type="text"
//                     placeholder="Search documents..."
//                     value={searchTerm}
//                  onChange={(e)=>setsearchTerm(e.target.value)}
//                     borderRadius="md"
//                     bg={useColorModeValue("white", "gray.700")}
//                     shadow="sm"
//                     py={6}
//                   />
//                 </InputGroup>
          
              
//               </Box>
//         <Table variant='simple'>
//           <Thead>
//             <Tr>
//               <Th>ID</Th>
//               <Th>Name</Th>
//               <Th>Type</Th>
//               <Th>Multimedia</Th>
//               <Th>Total Space</Th>
//               <Th>Occupied Space</Th>
//               <Th>Total PCs</Th>
//               <Th>Available PCs</Th>
//               <Th>Actions</Th>
//             </Tr>
//           </Thead>
//           <Tbody>
//             {rooms.filter((item)=>{
//               const search=searchTerm.toLowerCase();
//               return(
//                item.name?.toLowerCase().includes(search) || item.type?.toLowerCase().includes(search) ||   (item.multimedia ? 'yes' : 'no').includes(search)
//               )
//             }).map(room => (
//               <Tr key={room.id}>
//                 <Td>{room.id}</Td>
//                 <Td>{room.name}</Td>
//                 <Td>{room.type}</Td>
//                 <Td>{room.multimedia ? 'Yes' : 'No'}</Td>
//                 <Td>{room.totalSpace}</Td>
//                 <Td>{room.occupiedSpace}</Td>
//                 <Td>{room.totalPCs || '-'}</Td>
//                 <Td>{room.availablePCs || '-'}</Td>
//                 <Td>
//                   <Button colorScheme="blue" size="sm" onClick={() => {
//                     setRoomId(room.id);
//                     setName(room.name);
//                     setType(room.type);
//                     setMultimedia(room.multimedia);
//                     setTotalSpace(room.totalSpace);
//                     setOccupiedSpace(room.occupiedSpace);
//                     setTotalPCs(room.totalPCs || '');
//                     setAvailablePCs(room.availablePCs || '');
//                     setIsOpen(true);
//                   }}>Update</Button>
//                   <Button colorScheme="red" size="sm" onClick={() => handleDelete(room.id)}>Delete</Button>
//                 </Td>
//               </Tr>
//             ))}
//           </Tbody>
//         </Table>
//       </TableContainer>
//       <Modal isOpen={isOpen} onClose={handleClose}>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>{roomId ? 'Update Room' : 'Add Room'}</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <FormControl>
//               <FormLabel>Room Name</FormLabel>
//               <Input value={name} onChange={(e) => setName(e.target.value)} />
//             </FormControl>
//             <FormControl mt={4}>
//               <FormLabel>Room Type</FormLabel>
//               <Select value={type} onChange={(e) => setType(e.target.value)}>
//                 <option value="Class">Class</option>
//                 <option value="Lecture Theater">Lecture Theater</option>
//                 <option value="Lab">Lab</option>
//               </Select>
//             </FormControl>
//             <FormControl mt={4}>
//               <FormLabel>Total Space</FormLabel>
//               <Input type="number" value={totalSpace} onChange={(e) => setTotalSpace(e.target.value)} />
//             </FormControl>
//             <FormControl mt={4}>
//               <FormLabel>Occupied Space</FormLabel>
//               <Input type="number" value={occupiedSpace} onChange={(e) => setOccupiedSpace(e.target.value)} />
//             </FormControl>
//             <FormControl mt={4}>
//               <FormLabel>Multimedia Available</FormLabel>
//               <Switch isChecked={multimedia} onChange={(e) => setMultimedia(e.target.checked)} />
//             </FormControl>
//             {type === "Lab" && (
//               <>
//                 <FormControl mt={4}>
//                   <FormLabel>Total PCs</FormLabel>
//                   <Input type="number" value={totalPCs} onChange={(e) => setTotalPCs(e.target.value)} />
//                 </FormControl>
//                 <FormControl mt={4}>
//                   <FormLabel>Available PCs</FormLabel>
//                   <Input type="number" value={availablePCs} onChange={(e) => setAvailablePCs(e.target.value)} />
//                 </FormControl>
//               </>
//             )}
//           </ModalBody>
//           <ModalFooter>
//             <Button colorScheme="blue" onClick={handleSubmit}>{roomId ? 'Update' : 'Add'}</Button>
//             <Button variant="outline" onClick={handleClose}>Close</Button>
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
  Box,
  InputGroup,
  InputLeftElement,
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
  Switch,
  Select,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { FiSearch } from 'react-icons/fi'
import { FiDownload } from 'react-icons/fi';
import { FiUpload } from 'react-icons/fi';



export default function RoomManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('Class');
  const [multimedia, setMultimedia] = useState(false);
  const [totalSpace, setTotalSpace] = useState('');
  const [occupiedSpace, setOccupiedSpace] = useState('');
  const [totalPCs, setTotalPCs] = useState('');
  const [availablePCs, setAvailablePCs] = useState('');
const [searchTerm,setsearchTerm]=useState('');
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:3001/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    }
  };

  const handleSubmit = async () => {
    const roomData = {
      name,
      type,
      multimedia,
      totalSpace: parseInt(totalSpace),
      occupiedSpace: parseInt(occupiedSpace),
      totalPCs: type === 'Lab' ? parseInt(totalPCs) : null,
      availablePCs: type === 'Lab' ? parseInt(availablePCs) : null,
    };

    try {
      if (roomId) {
        await axios.put(`http://localhost:3001/rooms/${roomId}`, roomData);
        toast.success('Room updated successfully');
      } else {
        await axios.post('http://localhost:3001/rooms', roomData);
        toast.success('Room added successfully');
      }
      fetchRooms();
      handleClose();
    } catch (error) {
      toast.error('Failed to perform operation');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/rooms/${id}`);
      toast.success('Room deleted successfully');
      fetchRooms();
    } catch (error) {
      toast.error('Failed to delete room');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setRoomId(null);
    setName('');
    setType('Class');
    setMultimedia(false);
    setTotalSpace('');
    setOccupiedSpace('');
    setTotalPCs('');
    setAvailablePCs('');
  };

  

  const exportToExcel = async () => {
    try {
      const toastId = toast.loading('Preparing export...');
      const response = await axios.get('http://localhost:3001/api/room/export', {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
  
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        
        link.href = url;
        link.setAttribute('download', `infrastructure_export_${timestamp}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('Export completed successfully!', { id: toastId });
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Export failed: ${error.message}`);
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const toastId = toast.loading('Importing rooms...');
      
      const response = await axios.post('http://localhost:3001/api/room/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      if (response.data.success) {
        const successCount = response.data.results.filter(r => r.success).length;
        const errorCount = response.data.results.length - successCount;
        
        toast.success(
          `Import complete: ${successCount} successful, ${errorCount} failed`, 
          { 
            id: toastId, 
            duration: 5000 
          }
        );
        
        // Refresh the room list
        fetchRooms();
      } else {
        toast.error('Import failed', { id: toastId });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Import failed: ${error.response?.data?.message || error.message}`);
    } finally {
      // Reset the file input
      event.target.value = '';
    }
  };
  return (
    <Flex direction="column" w="100%" px="0px" overflowX="hidden">
      <Flex px="25px" justify="space-between" mb="20px" align="center">
  {/* Left side: Heading */}
  <Text fontSize="22px" fontWeight="700">
    Room Management
  </Text>

  {/* Right side: Buttons */}
  <Flex gap="10px" flexWrap="wrap" align="center">
    <Button
      colorScheme="blue"
      bg="blue.500"
      color="white"
      onClick={() => setIsOpen(true)}
    >
      + Add Room
    </Button>

    <Button
      colorScheme="teal"
      bg="teal.500"
      color="white"
      variant="solid"
      paddingY={5}
      size="sm"
      onClick={exportToExcel}
      leftIcon={<FiDownload />}
    >
      Export to Excel
    </Button>

    <Button
      as="label"
      htmlFor="import-excel"
      leftIcon={<FiUpload />}
      colorScheme="blue"
      bg="blue.400"
       paddingY={5}
      color="white"
      variant="solid"
      size="sm"
      cursor="pointer"
    >
      Import Excel
      <input
        id="import-excel"
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileImport}
        style={{ display: "none" }}
      />
    </Button>
  </Flex>
</Flex>
      <TableContainer>
      <Box maxW="96%" mx="auto" py={1} pb={5}>
                {/* Search Input */}
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.500"  mt={3}/>
                  </InputLeftElement>
                  <Input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                 onChange={(e)=>setsearchTerm(e.target.value)}
                    borderRadius="md"
                    bg={useColorModeValue("white", "gray.700")}
                    shadow="sm"
                    py={6}
                  />
                </InputGroup>
          
              
              </Box>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Multimedia</Th>
              <Th>Total Space</Th>
              <Th>Occupied Space</Th>
              <Th>Total PCs</Th>
              <Th>Available PCs</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rooms.filter((item)=>{
              const search=searchTerm.toLowerCase();
              return(
               item.name?.toLowerCase().includes(search) || item.type?.toLowerCase().includes(search) ||   (item.multimedia ? 'yes' : 'no').includes(search)
              )
            }).map(room => (
              <Tr key={room.id}>
                <Td>{room.id}</Td>
                <Td>{room.name}</Td>
                <Td>{room.type}</Td>
                <Td>{room.multimedia ? 'Yes' : 'No'}</Td>
                <Td>{room.totalSpace}</Td>
                <Td>{room.occupiedSpace}</Td>
                <Td>{room.totalPCs || '-'}</Td>
                <Td>{room.availablePCs || '-'}</Td>
                <Td>
                  <Button colorScheme="blue" size="sm" onClick={() => {
                    setRoomId(room.id);
                    setName(room.name);
                    setType(room.type);
                    setMultimedia(room.multimedia);
                    setTotalSpace(room.totalSpace);
                    setOccupiedSpace(room.occupiedSpace);
                    setTotalPCs(room.totalPCs || '');
                    setAvailablePCs(room.availablePCs || '');
                    setIsOpen(true);
                  }}>Update</Button>
                  <Button colorScheme="red" size="sm" onClick={() => handleDelete(room.id)}>Delete</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{roomId ? 'Update Room' : 'Add Room'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Room Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Room Type</FormLabel>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Class">Class</option>
                <option value="Lecture Theater">Lecture Theater</option>
                <option value="Lab">Lab</option>
              </Select>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Total Space</FormLabel>
              <Input type="number" value={totalSpace} onChange={(e) => setTotalSpace(e.target.value)} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Occupied Space</FormLabel>
              <Input type="number" value={occupiedSpace} onChange={(e) => setOccupiedSpace(e.target.value)} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Multimedia Available</FormLabel>
              <Switch isChecked={multimedia} onChange={(e) => setMultimedia(e.target.checked)} />
            </FormControl>
            {type === "Lab" && (
              <>
                <FormControl mt={4}>
                  <FormLabel>Total PCs</FormLabel>
                  <Input type="number" value={totalPCs} onChange={(e) => setTotalPCs(e.target.value)} />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Available PCs</FormLabel>
                  <Input type="number" value={availablePCs} onChange={(e) => setAvailablePCs(e.target.value)} />
                </FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSubmit}>{roomId ? 'Update' : 'Add'}</Button>
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
