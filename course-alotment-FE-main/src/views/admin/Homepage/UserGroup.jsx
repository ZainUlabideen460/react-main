import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Stack,
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
  Tooltip,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { School, Briefcase, Award, ChevronRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

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

// UserGroupCard Component
function UserGroupCard({ title, description, imageSrc, icon, index, onOpen, setModalContent }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const bg = useColorModeValue('whiteAlpha.200', 'blackAlpha.200');
  const textColor = useColorModeValue('white', 'gray.100');
  const subTextColor = useColorModeValue('whiteAlpha.900', 'gray.200');
  const pulseAnimation = `${pulse} 4s infinite`;

  return (
    <Tooltip label={`Explore ${title} features`} placement="top" bg="cyan.500" color="white" borderRadius="md">
      <MotionBox
        ref={ref}
        bg={bg}
        borderRadius="xl"
        overflow="hidden"
        boxShadow="0 12px 32px rgba(0, 0, 0, 0.4)"
        border="1px solid"
        borderColor="cyan.400"
        flex={1}
        initial={{ opacity: 0, y: 50, rotateX: -15 }}
        animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.3, type: 'spring', stiffness: 100 }}
        _hover={{ transform: 'perspective(1000px) rotateY(5deg)', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 255, 255, 0.3)' }}
        _active={{ transform: 'scale(0.95)' }}
      >
        <Image src={imageSrc} alt={title} objectFit="cover" w="full" h={48} loading="lazy" />
        <Box p={6}>
          <MotionHStack mb={3} initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5, delay: index * 0.4 }}>
            <Icon as={icon} boxSize={6} color="cyan.500" animation={pulseAnimation} />
            <Text fontWeight="700" fontSize="xl" color={textColor}>
              {title}
            </Text>
          </MotionHStack>
          <Text color={subTextColor} mb={4} fontSize="md">
            {description}
          </Text>
          <Button
            variant="link"
            colorScheme="cyan"
            rightIcon={<ChevronRight size={16} />}
            onClick={() => {
              setModalContent({ title, description: `Learn more about how ${title} benefit from Smart Course Planner.` });
              onOpen();
            }}
          >
            Learn More
          </Button>
        </Box>
      </MotionBox>
    </Tooltip>
  );
}

export const UserGroup = () => {
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
              Built for All
            </Text>
            <Heading
              size="3xl"
              color={textColor}
              fontWeight="800"
              bgGradient="linear(to-r, white, cyan.200)"
              bgClip="text"
            >
              Solutions for Every Role
            </Heading>
            <Text fontSize="xl" color={subTextColor} maxW="3xl">
              From students to administrators, our platform supports the entire academic community.
            </Text>
          </MotionVStack>
          <MotionFlex
            direction={{ base: 'column', lg: 'row' }}
            gap={8}
            w="full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <UserGroupCard
              title="Students"
              description="Plan your courses, avoid conflicts, and stay updated with your personalized schedule."
              imageSrc="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
              icon={School}
              index={0}
              onOpen={onOpen}
              setModalContent={setModalContent}
            />
            <UserGroupCard
              title="Faculty"
              description="Streamline teaching schedules and communicate updates efficiently."
              imageSrc="https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800"
              icon={Briefcase}
              index={1}
              onOpen={onOpen}
              setModalContent={setModalContent}
            />
            <UserGroupCard
              title="Administrators"
              description="Optimize resources and monitor scheduling with powerful analytics."
              imageSrc="https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=800"
              icon={Award}
              index={2}
              onOpen={onOpen}
              setModalContent={setModalContent}
            />
          </MotionFlex>
        </VStack>
      </Container>

      {/* Modal for User Group Details */}
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