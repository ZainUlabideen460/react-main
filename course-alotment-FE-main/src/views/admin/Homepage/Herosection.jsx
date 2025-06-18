import React, { useEffect } from 'react';
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
  keyframes,
  useColorMode,
  useColorModeValue,
  IconButton,
  Badge,
  Stat,
  StatNumber,
  StatLabel,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ChevronRight, Moon, Sun } from 'lucide-react';

// Import Google Fonts in your project (add to index.html or CSS)
// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet>

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.3); opacity: 0.4; }
  100% { transform: scale(1); opacity: 0.2; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
  100% { transform: translateY(0px); }
`;

const wave = keyframes`
  0% { transform: translateX(0); }
  50% { transform: translateX(-25%); }
  100% { transform: translateX(0); }
`;

// Convert Chakra components to motion components
const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionImage = motion(Image);
const MotionBadge = motion(Badge);

export const Herosection = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.600, blue.400)',
    'linear(to-br, gray.800, gray.600)'
  );
  const cardBg = useColorModeValue('whiteAlpha.200', 'blackAlpha.200');
  const textColor = useColorModeValue('white', 'gray.100');
  const subTextColor = useColorModeValue('whiteAlpha.900', 'gray.200');

  useEffect(() => {
    // Optional: Add any initialization logic here
  }, []);

  const pulseAnimation = `${pulse} 6s infinite`;
  const floatAnimation = `${float} 3s infinite ease-in-out`;
  const waveAnimation = `${wave} 20s infinite linear`;

  // Scroll to features section
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      minH="100vh"
      bgGradient={bgGradient}
      position="relative"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontFamily="'Inter', sans-serif"
    >
      {/* Background Animated Elements */}
      <MotionBox
        position="absolute"
        top="-100px"
        left="-100px"
        w="250px"
        h="250px"
        bg="whiteAlpha.300"
        borderRadius="full"
        animation={pulseAnimation}
      />
      <MotionBox
        position="absolute"
        bottom="-100px"
        right="-100px"
        w="250px"
        h="250px"
        bg="whiteAlpha.300"
        borderRadius="full"
        animation={pulseAnimation}
      />
      <MotionBox
        position="absolute"
        top="15%"
        right="15%"
        w="30px"
        h="30px"
        bg="cyan.300"
        borderRadius="full"
        animation={floatAnimation}
      />
      <MotionBox
        position="absolute"
        bottom="15%"
        left="15%"
        w="30px"
        h="30px"
        bg="cyan.300"
        borderRadius="full"
        animation={floatAnimation}
      />

      {/* Semi-transparent overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.400"
        zIndex={1}
      />

      {/* Wave Effect at Bottom */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="100px"
        bg="url('https://www.transparenttextures.com/patterns/wavecut.png')"
        opacity={0.3}
        animation={waveAnimation}
        zIndex={2}
      />

      <Container maxW="container.xl" py={{ base: 8, md: 12 }} position="relative" zIndex={10}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="center"
          justify="space-between"
          minH={{ base: 'auto', md: '80vh' }}
        >
          {/* Text Content */}
          <MotionBox
            maxW={{ base: '100%', md: '50%' }}
            textAlign={{ base: 'center', md: 'left' }}
            bg={cardBg}
            backdropFilter="blur(12px)"
            p={{ base: 6, md: 8 }}
            borderRadius="xl"
            boxShadow="0 12px 32px rgba(0, 0, 0, 0.3)"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <MotionBadge
              colorScheme="cyan"
              fontSize="lg"
              px={4}
              py={1}
              mb={4}
              borderRadius="full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              _hover={{ cursor: 'pointer', bg: 'cyan.600' }}
              onClick={() => alert('Learn more about Smart Course Planner!')}
            >
              Your Academic Ally
            </MotionBadge>
            <Heading
              as="h1"
              size={{ base: '3xl', md: '4xl' }}
              color={textColor}
              mb={4}
              fontWeight="extrabold"
              textShadow="0 2px 4px rgba(0, 0, 0, 0.3)"
            >
              Smart Course Planner
            </Heading>
            <Heading
              as="h2"
              size={{ base: 'xl', md: '2xl' }}
              color={subTextColor}
              mb={6}
              textShadow="0 2px 4px rgba(0, 0, 0, 0.3)"
            >
              Plan Your Academic Journey with Ease
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color={subTextColor}
              mb={8}
              maxW="500px"
              mx={{ base: 'auto', md: 0 }}
              textShadow="0 1px 2px rgba(0, 0, 0, 0.2)"
            >
              Smart Course Planner empowers students, faculty, and administrators to create seamless, conflict-free schedules for a better academic experience.
            </Text>
            <HStack
              spacing={4}
              justify={{ base: 'center', md: 'flex-start' }}
            >
              <MotionButton
                size="lg"
                bgGradient="linear(to-r, cyan.400, purple.500)"
                color="white"
                rightIcon={<ChevronRight />}
                _hover={{ bgGradient: 'linear(to-r, cyan.500, purple.600)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Start Scheduling Now
              </MotionButton>
              <MotionButton
                size="lg"
                variant="outline"
                borderColor={textColor}
                color={textColor}
                _hover={{ bg: textColor, color: 'purple.600' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                onClick={scrollToFeatures}
              >
                Explore Features
              </MotionButton>
            </HStack>
            {/* Stats Section */}
            <HStack
              mt={8}
              spacing={{ base: 4, md: 8 }}
              justify={{ base: 'center', md: 'flex-start' }}
            >
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Stat>
                  <StatNumber color={textColor} fontSize="2xl">10K+</StatNumber>
                  <StatLabel color={subTextColor}>Users</StatLabel>
                </Stat>
              </MotionBox>
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <Stat>
                  <StatNumber color={textColor} fontSize="2xl">50K+</StatNumber>
                  <StatLabel color={subTextColor}>Schedules</StatLabel>
                </Stat>
              </MotionBox>
            </HStack>
          </MotionBox>

          {/* Hero Image */}
          <MotionBox
            maxW={{ base: '100%', md: '50%' }}
            mt={{ base: 8, md: 0 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            whileHover={{ rotate: 5 }}
          >
            <Image
              src="https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Academic planner and laptop"
              maxW={{ base: '300px', md: '500px' }}
              mx="auto"
              borderRadius="lg"
              boxShadow="0 12px 32px rgba(0, 0, 0, 0.4)"
              animation={floatAnimation}
            />
          </MotionBox>
        </Flex>
      </Container>

      {/* Theme Toggle Button */}
      {/* <IconButton
        aria-label="Toggle theme"
        icon={colorMode === 'light' ? <Moon /> : <Sun />}
        onClick={toggleColorMode}
        position="fixed"
        top={4}
        right={4}
        size="lg"
        bg={cardBg}
        backdropFilter="blur(12px)"
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
        zIndex={20}
        _hover={{ bg: 'cyan.500', color: 'white' }}
      /> */}
    </Box>
  );
};