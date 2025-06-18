import React, { useState } from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  keyframes,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Stat,
  StatNumber,
  StatLabel,
  Divider,
  Tooltip,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Book, Users, User, Award, ChevronRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';

// Import Google Fonts in your project (add to index.html or CSS)
// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet>

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.4); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0.6; }
`;

const wave = keyframes`
  0% { transform: translateX(0); }
  50% { transform: translateX(-25%); }
  100% { transform: translateX(0); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const noise = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 100px 100px; }
`;

// Convert Chakra components to motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionVStack = motion(VStack);
const MotionHStack = motion(HStack);

// StatCard Component
function StatCard({ number, label, index, onOpen, setModalContent }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const bg = useColorModeValue('whiteAlpha.200', 'blackAlpha.200');
  const textColor = useColorModeValue('white', 'gray.100');
  const subTextColor = useColorModeValue('whiteAlpha.900', 'gray.200');

  return (
    <MotionVStack
      ref={ref}
      textAlign="center"
      bg={bg}
      backdropFilter="blur(12px)"
      p={6}
      borderRadius="xl"
      boxShadow="0 12px 32px rgba(0, 0, 0, 0.4)"
      border="1px solid"
      borderColor="cyan.400"
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.3, type: 'spring', stiffness: 100 }}
      _hover={{ transform: 'perspective(1000px) rotateY(5deg)', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 255, 255, 0.3)' }}
      _active={{ transform: 'scale(0.95)' }}
      cursor="pointer"
      onClick={() => {
        setModalContent({ title: label, description: `Details about ${label}: ${number}` });
        onOpen();
      }}
    >
      <Stat>
        <StatNumber fontSize="4xl" fontWeight="800" color={textColor}>
          {inView ? <CountUp end={parseFloat(number.replace(/[^0-9.]/g, ''))} suffix={number.replace(/[0-9.]/g, '')} duration={2} /> : '0'}
        </StatNumber>
        <StatLabel fontSize="lg" fontWeight="600" color={subTextColor}>
          {label}
        </StatLabel>
      </Stat>
    </MotionVStack>
  );
}

// FeatureCard Component
function FeatureCard({ icon, title, description, iconColor, index }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const bg = useColorModeValue('whiteAlpha.200', 'blackAlpha.200');
  const textColor = useColorModeValue('white', 'gray.100');
  const subTextColor = useColorModeValue('whiteAlpha.900', 'gray.200');
  const pulseAnimation = `${pulse} 4s infinite`;

  return (
    <Tooltip label={`Click to explore ${title}`} placement="top" bg={iconColor} color="white" borderRadius="md">
      <MotionVStack
        ref={ref}
        bg={bg}
        p={6}
        borderRadius="xl"
        boxShadow="0 12px 32px rgba(0, 0, 0, 0.4)"
        border="1px solid"
        borderColor="cyan.400"
        flex={1}
        spacing={4}
        align="flex-start"
        initial={{ opacity: 0, y: 50, rotateX: -15 }}
        animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.3, type: 'spring', stiffness: 100 }}
        _hover={{ transform: 'perspective(1000px) rotateY(5deg)', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 255, 255, 0.3)' }}
        _active={{ transform: 'scale(0.95)' }}
        cursor="pointer"
        onClick={() => alert(`Navigate to ${title} section`)}
      >
        <Flex align="center" justify="center" bg={`${iconColor}20`} w={14} h={14} borderRadius="full">
          <Icon as={icon} boxSize={8} color={iconColor} animation={pulseAnimation} />
        </Flex>
        <Heading size="lg" color={textColor} fontWeight="700">
          {title}
        </Heading>
        <Text color={subTextColor} fontSize="md">
          {description}
        </Text>
        <Text color={iconColor} fontSize="sm" fontWeight="600">
          Learn More <ChevronRight size={16} />
        </Text>
      </MotionVStack>
    </Tooltip>
  );
}

export const StarsAndFeature = () => {
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.600, blue.400)',
    'linear(to-br, gray.800, gray.600)'
  );
  const textColor = useColorModeValue('white', 'gray.100');
  const subTextColor = useColorModeValue('whiteAlpha.900', 'gray.200');
  const pulseAnimation = `${pulse} 6s infinite`;
  const waveAnimation = `${wave} 20s infinite linear`;
  const gradientAnimation = `${gradientShift} 15s infinite`;
  const noiseAnimation = `${noise} 10s infinite linear`;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalContent, setModalContent] = useState({ title: '', description: '' });

  return (
    <Box position="relative" bgGradient={bgGradient} overflow="hidden" py={24} animation={gradientAnimation}>
      {/* Background Animated Elements */}
      <MotionBox
        position="absolute"
        top="5%"
        left="5%"
        w="50px"
        h="50px"
        bg="cyan.400"
        borderRadius="full"
        animation={pulseAnimation}
      />
      <MotionBox
        position="absolute"
        bottom="5%"
        right="5%"
        w="50px"
        h="50px"
        bg="cyan.400"
        borderRadius="full"
        animation={pulseAnimation}
      />
      <MotionBox
        position="absolute"
        top="50%"
        left="50%"
        w="30px"
        h="30px"
        bg="purple.400"
        borderRadius="full"
        animation={pulseAnimation}
      />

      {/* Noise Texture Overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="url('https://www.transparenttextures.com/patterns/noise.png')"
        opacity={0.1}
        animation={noiseAnimation}
        zIndex={1}
      />

      {/* Wave Effect at Top and Bottom */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="120px"
        bg="url('https://www.transparenttextures.com/patterns/wavecut.png')"
        opacity={0.4}
        animation={waveAnimation}
        zIndex={1}
      />
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="120px"
        bg="url('https://www.transparenttextures.com/patterns/wavecut.png')"
        opacity={0.4}
        animation={waveAnimation}
        zIndex={1}
      />

      {/* Semi-transparent overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.500"
        zIndex={1}
      />

      <Container maxW="7xl" position="relative" zIndex={10}>
        {/* Stats Section */}
        <MotionFlex
          direction={{ base: 'column', md: 'row' }}
          bg="transparent"
          borderRadius="2xl"
          py={8}
          px={{ base: 6, md: 12 }}
          justify="space-around"
          gap={8}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <StatCard number="12,000+" label="Active Students" index={0} onOpen={onOpen} setModalContent={setModalContent} />
          <StatCard number="60+" label="Partner Universities" index={1} onOpen={onOpen} setModalContent={setModalContent} />
          <StatCard number="99.9%" label="Schedule Accuracy" index={2} onOpen={onOpen} setModalContent={setModalContent} />
        </MotionFlex>

        {/* Decorative Divider with Gradient */}
        <Divider
          my={12}
          borderColor="transparent"
          borderWidth="2px"
          bgGradient="linear(to-r, transparent, cyan.400, transparent)"
          opacity={0.6}
        />

        {/* Features Section */}
        <Box py={20}>
          <VStack spacing={16}>
            <MotionVStack
              spacing={6}
              textAlign="center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Text
                bgGradient="linear(to-r, cyan.400, purple.400)"
                bgClip="text"
                fontWeight="700"
                letterSpacing="wide"
                fontSize="xl"
                textTransform="uppercase"
              >
                Why Choose Us
              </Text>
              <Heading
                size="3xl"
                color={textColor}
                fontWeight="800"
                bgGradient="linear(to-r, white, cyan.200)"
                bgClip="text"
              >
                Smart Tools for Academic Success
              </Heading>
              <Text fontSize="xl" color={subTextColor} maxW="3xl">
                Discover features tailored to simplify course scheduling and enhance productivity.
              </Text>
            </MotionVStack>
            <MotionFlex
              direction={{ base: 'column', md: 'row' }}
              gap={8}
              w="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <FeatureCard
                icon={Book}
                title="Course Management"
                description="Effortlessly create and manage courses with an intelligent conflict-resolution system."
                iconColor="cyan.500"
                index={0}
              />
              <FeatureCard
                icon={User}
                title="Student Portal"
                description="Access personalized schedules and receive real-time updates on your courses."
                iconColor="blue.500"
                index={1}
              />
              <FeatureCard
                icon={Users}
                title="Faculty Tools"
                description="Manage teaching schedules and room assignments with ease."
                iconColor="purple.500"
                index={2}
              />
            </MotionFlex>
          </VStack>
        </Box>
      </Container>

      {/* Modal for Stat Details */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          bg={useColorModeValue('whiteAlpha.900', 'blackAlpha.900')}
          backdropFilter="blur(12px)"
          borderRadius="xl"
          p={6}
        >
          <ModalHeader color={textColor} fontWeight="700">
            {modalContent.title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text color={subTextColor} fontSize="lg">
              {modalContent.description}
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};