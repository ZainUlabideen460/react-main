import React, { useState, useEffect} from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Text,
  HStack,
  Icon,
  keyframes,
  useColorMode,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Menu,
  MenuButton,
} from '@chakra-ui/react';
import { motion, useViewportScroll, useTransform } from 'framer-motion';
import { useHistory } from 'react-router-dom';
import SignIn from '../../auth/signIn';
import {
  Calendar,
  LogIn,
  ChevronRight,
  Menu as MenuIcon,
  Search,
  Sun,
  Moon,
  User,
} from 'lucide-react';

// Animation keyframes (unchanged)
const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0.6; }
`;


const starfield = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 0.7; }
  50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 0.7; }
`;

const noise = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 100px 100px; }
`;

const typing = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const blink = keyframes`
  50% { border-color: transparent; }
`;

// Convert Chakra components to motion components
const MotionBox = motion(Box);
const MotionButton = motion(Button);


// Nav Link Component (unchanged)
function NavLink({ text, to, isMobile = false }) {
  const history = useHistory();
  const textColor = useColorModeValue('gray.700', 'gray.200');
  return (
    <MotionButton
      variant="ghost"
      color={textColor}
      fontWeight="500"
      fontFamily="'Inter', sans-serif"
      _hover={{ bg: useColorModeValue('cyan.50', 'gray.700'), color: 'cyan.400' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => history.push(to)}
      fontSize={isMobile ? 'lg' : 'md'}
      w={isMobile ? 'full' : 'auto'}
      justifyContent={isMobile ? 'flex-start' : 'center'}
      aria-label={`Navigate to ${text} page`}
    >
      {text}
    </MotionButton>
  );
}

export const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('whiteAlpha.900', 'blackAlpha.900');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const pulseAnimation = `${pulse} 6s infinite`;

  const noiseAnimation = `${noise} 10s infinite linear`;
  const starfieldAnimation = `${starfield} 8s infinite`;
  const { onOpen: onDrawerOpen } = useDisclosure();
  const { onOpen: onSearchOpen} = useDisclosure();
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure();
  const history = useHistory();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Scroll effects
  const { scrollY } = useViewportScroll();
  const navbarHeight = useTransform(scrollY, [0, 100], [80, 60]);
  const boxShadow = useTransform(
    scrollY,
    [0, 100],
    ['0 0 8px rgba(0, 255, 255, 0)', '0 0 8px rgba(0, 255, 255, 0.3)']
  );
  const borderColor = useTransform(scrollY, [0, 100], ['#00000000', '#90CDF4FF']);
  const scrollProgress = useTransform(scrollY, [0, 1000], [0, 100]);
  // Add paddingTop transformation
  const paddingTop = useTransform(scrollY, [0, 100], ['20px', '10px']);

  // Hide/show navbar on scroll
  useEffect(() => {
    return scrollY.onChange((current) => {
      if (current > lastScrollY && current > 100) {
        setIsVisible(false); // Scroll down
      } else if (current < lastScrollY) {
        setIsVisible(true); // Scroll up
      }
      setLastScrollY(current);
    });
  }, [scrollY, lastScrollY]);

  // Keyboard shortcut for search (Ctrl + /)
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        onSearchOpen();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [onSearchOpen]);



  return (
    <MotionBox
      as="nav"
      bg={bg}
      backdropFilter="blur(12px)"
      position="sticky"
      top={0}
      zIndex={20}
      style={{
        height: navbarHeight,
        boxShadow,
        borderBottom: '1px solid',
        borderColor,
        paddingTop, // Apply dynamic paddingTop
      }}
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
      overflow="hidden"
    >
      {/* Starfield and Noise */}
      <MotionBox
        position="absolute"
        top="10%"
        left="10%"
        w="15px"
        h="15px"
        bg="cyan.400"
        borderRadius="full"
        animation={`${starfieldAnimation} 7s infinite`}
        style={{ y: useTransform(scrollY, [0, 1000], [0, -30]) }}
      />
      <MotionBox
        position="absolute"
        bottom="10%"
        right="10%"
        w="12px"
        h="12px"
        bg="purple.400"
        borderRadius="full"
        animation={`${starfieldAnimation} 9s infinite`}
        style={{ y: useTransform(scrollY, [0, 1000], [0, -20]) }}
      />
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="url('https://www.transparenttextures.com/patterns/noise.png')"
        opacity={0.1}
        animation={noiseAnimation}
      />

      <Container maxW="8xl">
        <Flex justify="space-between" align="center">
          {/* Brand Logo */}
          <HStack
            spacing={3}
            cursor="pointer"
            onClick={() => history.push('/')}
            as={motion.div}
            whileHover={{ scale: 1.1, rotateX: 10, rotateY: 10 }}
            transition={{ duration: 0.3 }}
          >
            <MotionBox
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.3 }}
            >
              <Icon as={Calendar} color="cyan.400" boxSize={8} animation={pulseAnimation} />
            </MotionBox>
            <Box
              overflow="hidden"
              whiteSpace="nowrap"
              borderRight="2px solid"
              borderColor={subTextColor}
              animation={`${typing} 2s steps(20, end), ${blink} 0.75s step-end infinite`}
            >
              <Text
                fontSize="xl"
                fontWeight="800"
                fontFamily="'Inter', sans-serif"
                bgGradient="linear(to-r, cyan.400, purple.400)"
                bgClip="text"
              >
                SmartCoursePlanner
              </Text>
            </Box>
          </HStack>

          {/* Desktop Menu */}
          <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
            <NavLink text="Home" to="/home" />
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                color={textColor}
                fontWeight="500"
                fontFamily="'Inter', sans-serif"
                _hover={{ bg: useColorModeValue('cyan.50', 'gray.700'), color: 'cyan.400' }}
                rightIcon={<ChevronRight />}
              >
                Features
              </MenuButton>
            </Menu>
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                color={textColor}
                fontWeight="500"
                fontFamily="'Inter', sans-serif"
                _hover={{ bg: useColorModeValue('cyan.50', 'gray.700'), color: 'cyan.400' }}
                rightIcon={<ChevronRight />}
              >
                About
              </MenuButton>
            </Menu>
            <NavLink text="Contact" to="/contact" />
            <MotionButton
              leftIcon={<LogIn />}
              bgGradient="linear(to-r, cyan.400, purple.500)"
              color="white"
              fontWeight="600"
              px={6}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLoginOpen}
              position="relative"
              overflow="hidden"
              _after={{
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '0',
                height: '0',
                bg: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 'full',
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.3s',
              }}
              _hover={{
                _after: { width: '200px', height: '200px' },
              }}
              aria-label="Login to Smart Course Planner"
            >
              Get Started
            </MotionButton>
            <MotionButton
              onClick={onSearchOpen}
              variant="ghost"
              color={textColor}
              whileHover={{ scale: 1.2, rotate: 90 }}
              transition={{ duration: 0.3 }}
              aria-label="Open search (Ctrl + /)"
            >
              <Icon as={Search} boxSize={5} />
            </MotionButton>
            <MotionButton
              onClick={toggleColorMode}
              variant="ghost"
              color={textColor}
              whileHover={{ scale: 1.2, rotate: 360 }}
              transition={{ duration: 0.3 }}
              aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            >
              <Icon as={colorMode === 'light' ? Moon : Sun} boxSize={5} />
            </MotionButton>
            <MotionButton
              onClick={() => history.push('/profile')}
              variant="ghost"
              color={textColor}
              whileHover={{ scale: 1.2, rotate: 360 }}
              transition={{ duration: 0.3 }}
              aria-label="View user profile"
            >
              <Icon as={User} boxSize={5} />
            </MotionButton>
          </HStack>

          {/* Mobile Menu Button */}
          <Box display={{ base: 'block', md: 'none' }}>
            <MotionButton
              onClick={onDrawerOpen}
              variant="ghost"
              color={textColor}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Open mobile menu"
            >
              <Icon as={MenuIcon} boxSize={6} />
            </MotionButton>
          </Box>
        </Flex>

        {/* Scroll Progress Bar */}
        <MotionBox
          h="2px"
          bg="cyan.400"
          position="absolute"
          bottom={0}
          left={0}
          style={{ width: scrollProgress }}
          initial={{ width: 0 }}
          transition={{ duration: 0.2 }}
        />
      </Container>

      {/* Login Modal */}
      <Modal isOpen={isLoginOpen} onClose={onLoginClose} isCentered size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Admin Login</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SignIn isModal closeModal={onLoginClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </MotionBox>
  );
};