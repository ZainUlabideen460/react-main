import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  IconButton,
  VStack,
  HStack,
  useToast,
  Divider,
  Spacer,
  Avatar,
  Badge,
  useColorModeValue,
  chakra,
} from '@chakra-ui/react';
import { ArrowForwardIcon, ChatIcon } from '@chakra-ui/icons';
import io from 'socket.io-client';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function ChatPage() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);
  const toast = useToast();
  const bottomDiv = useRef(null);

  // Color mode values for light/dark theme
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const chatBg = useColorModeValue('gray.50', 'gray.700');
  const messageBgSelf = useColorModeValue('blue.500', 'blue.600');
  const messageBgOther = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.100', 'gray.600');

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (!stored) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in as an admin to access the chat.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setToken(stored);
    axios
      .get(`${API_URL}/user`, { headers: { Authorization: `Bearer ${stored}` } })
      .then((res) => {
        setUser(res.data);
        initSocket(res.data.id);
        fetchTeachers(stored);
      })
      .catch(() => {
        toast({
          title: 'Authentication Error',
          description: 'Failed to verify user. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initSocket = (uid) => {
    socketRef.current = io(API_URL, { transports: ['websocket'], withCredentials: true });
    socketRef.current.on('connect', () => {
      socketRef.current.emit('authenticate', uid);
    });
    socketRef.current.on('newMessage', (msg) => {
      if (selected && msg.senderId === selected.id) {
        setMessages((prev) => [...prev, msg]);
        scrollBottom();
      }
    });
  };

  const fetchTeachers = async (tok) => {
    try {
      const res = await axios.get(`${API_URL}/api/chat/users/teacher`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      setTeachers(res.data);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load teachers list.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openConversation = async (t) => {
    setSelected(t);
    try {
      const res = await axios.get(`${API_URL}/api/chat/messages/${t.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
      scrollBottom();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load conversation.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const sendMsg = async () => {
    const text = input.trim();
    if (!text || !selected) return;
    setInput('');
    try {
      const res = await axios.post(
        `${API_URL}/api/chat/send`,
        { receiverId: selected.id, message: text },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages((prev) => [...prev, res.data]);
      scrollBottom();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const scrollBottom = () => {
    setTimeout(() => {
      bottomDiv.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (!token) {
    return (
      <Flex h="100vh" align="center" justify="center" bg={chatBg}>
        <VStack spacing={4}>
          <ChatIcon boxSize={10} color="blue.500" />
          <Text fontSize="xl" color={textColor}>
            Please log in as an admin to use the chat.
          </Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Flex w="100%" h="100vh" bg={chatBg} p={6} mt={20} gap={6}>
      {/* Sidebar */}
      <VStack
        w="300px"
        bg={sidebarBg}
        p={4}
        borderRadius="lg"
        boxShadow="md"
        overflowY="auto"
        spacing={3}
      >
        <HStack w="100%" justify="space-between">
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            Teachers
          </Text>
          <Badge colorScheme="blue">{teachers.length} Online</Badge>
        </HStack>
        <Divider borderColor="gray.300" />
        {teachers.map((t) => (
          <HStack
            key={t.id}
            w="100%"
            p={3}
            bg={selected?.id === t.id ? 'blue.50' : 'transparent'}
            borderRadius="md"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ bg: hoverBg }}
            onClick={() => openConversation(t)}
          >
            <Avatar size="sm" name={t.name} />
            <Text fontSize="md" color={textColor}>
              {t.name}
            </Text>
          </HStack>
        ))}
      </VStack>

      {/* Chat Area */}
      <Flex flex={1} direction="column" bg={sidebarBg} borderRadius="lg"  boxShadow="md" p={6}>
        <HStack mb={4}>
          <Text fontSize="xl" fontWeight="bold" color={textColor}>
            {selected ? `Chat with ${selected.name}` : 'Select a Teacher to Start Chatting'}
          </Text>
          <Spacer />
          {selected && (
            <Avatar size="sm" name={selected.name} />
          )}
        </HStack>
        <Divider borderColor="gray.300" />
        <VStack flex={1} overflowY="auto" spacing={4} py={4}>
          {messages.map((m, idx) => (
            <HStack
              key={idx}
              alignSelf={m.senderId === user?.id ? 'flex-end' : 'flex-start'}
              maxW="70%"
              spacing={2}
            >
              {m.senderId !== user?.id && <Avatar size="xs" name={selected?.name} />}
              <Box
                bg={m.senderId === user?.id ? messageBgSelf : messageBgOther}
                color={m.senderId === user?.id ? 'white' : textColor}
                borderRadius="lg"
                px={4}
                py={2}
                boxShadow="sm"
                transition="all 0.2s"
              >
                <Text fontSize="md">{m.message}</Text>
                <Text fontSize="xs" opacity={0.7} mt={1}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </Box>
              {m.senderId === user?.id && <Avatar size="xs" name={user?.name} />}
            </HStack>
          ))}
          <div ref={bottomDiv} />
        </VStack>
        {selected && (
          <HStack mt={4} as={chakra.form} onSubmit={(e) => { e.preventDefault(); sendMsg(); }}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              bg={chatBg}
              borderRadius="md"
              size="lg"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
            />
            <IconButton
              icon={<ArrowForwardIcon />}
              onClick={sendMsg}
              colorScheme="blue"
              size="lg"
              borderRadius="md"
              _hover={{ bg: 'blue.600' }}
              isDisabled={!input.trim()}
            />
          </HStack>
        )}
      </Flex>
    </Flex>
  );
}

export default ChatPage;