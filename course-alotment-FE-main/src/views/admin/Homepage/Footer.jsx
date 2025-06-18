import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Input,
  Text,
  VStack,
  HStack,
  Icon,
  keyframes,
  useColorModeValue,
  Tooltip,
  FormControl,
  FormErrorMessage,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useHistory } from 'react-router-dom';
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Instagram,
  Facebook,
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.4); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0.6; }
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

const starfield = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 0.7; }
  50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 0.7; }
`;

const wave = keyframes`
  0% { transform: translateX(0); }
  50% { transform: translateX(-25%); }
  100% { transform: translateX(0); }
`;

const successPulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

// Convert Chakra components to motion components
const MotionBox = motion(Box);
const MotionVStack = motion(VStack);  
const MotionButton = motion(Button);

// Footer Link Component
function FooterLink({ text, to }) {
  const history = useHistory();
  const textColor = useColorModeValue('gray.300', 'gray.400');
  return (
    <MotionBox whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
      <Text
        color={textColor}
        mb={2}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ color: 'cyan.400', transform: 'translateX(4px)' }}
        onClick={() => history.push(to)}
        _focus={{ outline: '2px solid', outlineColor: 'cyan.400' }}
        aria-label={`Navigate to ${text} page`}
      >
        {text}
      </Text>
    </MotionBox>
  );
}

export const Footer = () => {
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.600, blue.400)',
    'linear(to-br, gray.800, gray.600)'
  );
  const textColor = useColorModeValue('white', 'gray.100');
  const subTextColor = useColorModeValue('whiteAlpha.900', 'gray.200');
  const pulseAnimation = `${pulse} 6s infinite`;
  const gradientAnimation = `${gradientShift} 15s infinite`;
  const noiseAnimation = `${noise} 10s infinite linear`;
  const starfieldAnimation = `${starfield} 8s infinite`;
  const waveAnimation = `${wave} 20s infinite linear`;
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  // Newsletter form state
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isInvalid = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isInvalid && email) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 2000);
    }
  };

  // Memoized social links
  const socialLinks = useMemo(
    () => [
      { icon: Twitter, label: 'Follow us on Twitter/X', url: 'https://x.com' },
      { icon: Linkedin, label: 'Connect on LinkedIn', url: 'https://linkedin.com' },
      { icon: Github, label: 'Check our GitHub', url: 'https://github.com' },
      { icon: Instagram, label: 'Follow us on Instagram', url: 'https://instagram.com' },
      { icon: Facebook, label: 'Like us on Facebook', url: 'https://facebook.com' },
    ],
    []
  );

  return (
    <Box position="relative" bgGradient={bgGradient} color="white" py={16} overflow="hidden" animation={gradientAnimation}>
      {/* Wave Effect at Top */}
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

      {/* Background Animated Elements */}
      <MotionBox
        position="absolute"
        top="10%"
        left="10%"
        w="20px"
        h="20px"
        bg="cyan.400"
        borderRadius="full"
        animation={`${starfieldAnimation} 7s infinite`}
        zIndex={2}
      />
      <MotionBox
        position="absolute"
        bottom="10%"
        right="10%"
        w="15px"
        h="15px"
        bg="cyan.400"
        borderRadius="full"
        animation={`${starfieldAnimation} 9s infinite`}
        zIndex={2}
      />
      <MotionBox
        position="absolute"
        top="20%"
        left="50%"
        w="18px"
        h="18px"
        bg="purple.400"
        borderRadius="full"
        animation={`${starfieldAnimation} 8s infinite`}
        zIndex={1}
      />
      <MotionBox
        position="absolute"
        top="15%"
        right="20%"
        w="16px"
        h="16px"
        bg="cyan.300"
        borderRadius="full"
        animation={`${starfieldAnimation} 10s infinite`}
        zIndex={1}
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

      <Container maxW="7xl" position="relative" zIndex={10} ref={ref}>
        <MotionVStack
          spacing={12}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" w="full" gap={8}>
            {/* Brand Section */}
            <MotionVStack
              align="flex-start"
              spacing={4}
              mb={{ base: 10, md: 0 }}
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <HStack>
                <Icon as={Calendar} boxSize={8} color="cyan.400" animation={pulseAnimation} />
                <Text
                  fontSize="2xl"
                  fontWeight="800"
                  fontFamily="'Inter', sans-serif"
                  bgGradient="linear(to-r, cyan.400, purple.400)"
                  bgClip="text"
                >
                  SmartCoursePlanner
                </Text>
              </HStack>
              <Text color={subTextColor} maxW="sm" fontSize="md">
                Streamlining academic scheduling for students, faculty, and administrators worldwide.
              </Text>
              <HStack spacing={4}>
                {socialLinks.map(({ icon, label, url }, index) => (
                  <Tooltip key={index} label={label} bg="cyan.500" color="white">
                    <MotionBox
                      whileHover={{ scale: 1.2, rotate: 360, boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
                      transition={{ duration: 0.3 }}
                      cursor="pointer"
                      onClick={() => window.open(url, '_blank')}
                      _focus={{ outline: '2px solid', outlineColor: 'cyan.400' }}
                      aria-label={label}
                    >
                      <Icon as={icon} boxSize={6} color={subTextColor} _hover={{ color: 'cyan.400' }} />
                    </MotionBox>
                  </Tooltip>
                ))}
              </HStack>
            </MotionVStack>

            {/* Navigation Links */}
            <Flex gap={{ base: 8, md: 12 }} direction={{ base: 'column', sm: 'row' }}>
              <VStack align="flex-start">
                <Text fontWeight="700" mb={3} color={textColor} fontSize="lg">
                  Product
                </Text>
                <FooterLink text="Features" to="/features" />
                <FooterLink text="Pricing" to="/pricing" />
                <FooterLink text="Support" to="/support" />
                <FooterLink text="Documentation" to="/docs" />
              </VStack>
              <VStack align="flex-start">
                <Text fontWeight="700" mb={3} color={textColor} fontSize="lg">
                  Company
                </Text>
                <FooterLink text="About Us" to="/about" />
                <FooterLink text="Contact" to="/contact" />
                <FooterLink text="Careers" to="/careers" />
                <FooterLink text="Blog" to="/blog" />
              </VStack>
              <VStack align="flex-start">
                <Text fontWeight="700" mb={3} color={textColor} fontSize="lg">
                  Legal
                </Text>
                <FooterLink text="Privacy Policy" to="/privacy" />
                <FooterLink text="Terms of Service" to="/terms" />
                <FooterLink text="Cookie Policy" to="/cookies" />
              </VStack>
              <VStack align="flex-start">
                <Text fontWeight="700" mb={3} color={textColor} fontSize="lg">
                  Quick Access
                </Text>
                <FooterLink text="Login" to="/login" />
                <FooterLink text="Dashboard" to="/dashboard" />
                <FooterLink text="Schedule Demo" to="/demo" />
              </VStack>
            </Flex>
          </Flex>

          {/* Newsletter Signup and Contact Info */}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            w="full"
            gap={8}
            bg={useColorModeValue('whiteAlpha.200', 'blackAlpha.200')}
            backdropFilter="blur(12px)"
            borderRadius="xl"
            p={6}
            border="1px solid"
            borderColor="cyan.400"
          >
            <VStack align="flex-start" spacing={4} w={{ base: 'full', md: '50%' }}>
              <Text fontWeight="700" color={textColor} fontSize="lg">
                Subscribe to Our Newsletter
              </Text>
              <FormControl isInvalid={isInvalid}>
                <HStack w="full">
                  <Input
                    placeholder="Enter your email"
                    bg={useColorModeValue('whiteAlpha.900', 'gray.700')}
                    color={textColor}
                    border="none"
                    borderRadius="md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    _focus={{ borderColor: 'cyan.400', boxShadow: '0 0 8px rgba(0, 255, 255, 0.3)' }}
                    aria-label="Email for newsletter subscription"
                  />
                  <MotionButton
                    bgGradient="linear(to-r, cyan.400, purple.500)"
                    color="white"
                    whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    isDisabled={isInvalid || !email}
                    animation={isSubmitted ? `${successPulse} 1s ease-in-out` : undefined}
                    aria-label="Subscribe to newsletter"
                  >
                    {isSubmitted ? 'Subscribed!' : 'Subscribe'}
                  </MotionButton>
                </HStack>
                <FormErrorMessage color="red.300">Please enter a valid email address.</FormErrorMessage>
              </FormControl>
            </VStack>
            <VStack align="flex-start" spacing={3} w={{ base: 'full', md: '50%' }}>
              <Text fontWeight="700" color={textColor} fontSize="lg">
                Contact Us
              </Text>
              <HStack>
                <Icon as={Mail} boxSize={5} color="cyan.400" />
                <Text color={subTextColor}>support@smartcourseplanner.com</Text>
              </HStack>
              <HStack>
                <Icon as={Phone} boxSize={5} color="cyan.400" />
                <Text color={subTextColor}>+1 (800) 123-4567</Text>
              </HStack>
              <HStack>
                <Icon as={MapPin} boxSize={5} color="cyan.400" />
                <Text color={subTextColor}>123 Academic Ave, Tech City, USA</Text>
              </HStack>
            </VStack>
          </Flex>

          {/* Copyright */}
          <Text color={subTextColor} fontSize="lg" textAlign="center">
            © 2025 Smart Course Planner. All rights reserved.
          </Text>
        </MotionVStack>
      </Container>
    </Box>
  );
};