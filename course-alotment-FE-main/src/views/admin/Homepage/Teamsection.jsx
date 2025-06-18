import React, { useState, useRef, useMemo } from 'react';
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
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

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

const starfield = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 0.7; }
  50% { transform: translateY(-30px) scale(1.2); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 0.7; }
`;

const typing = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const blink = keyframes`
  50% { border-color: transparent; }
`;

const glowTrail = keyframes`
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
`;

const shake = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(2deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-2deg); }
  100% { transform: rotate(0deg); }
`;

// Convert Chakra components to motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionVStack = motion(VStack);
const MotionHStack = motion(HStack);
const MotionButton = motion(Button);
const MotionModalContent = motion(ModalContent);

// Testimonial data
const testimonials = [
  {
    quote: 'Smart Course Planner has transformed our scheduling process, saving us countless hours and ensuring error-free timetables.',
    name: 'Dr. Emily Carter',
    title: 'Academic Director, Harvard University',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    quote: 'The platform’s intuitive design makes course planning a breeze for our students and faculty.',
    name: 'Prof. James Lee',
    title: 'Dean, Stanford University',
    image: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    quote: 'A game-changer for resource optimization and analytics in academic administration.',
    name: 'Sarah Thompson',
    title: 'Registrar, MIT',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export const Teamsection = () => {
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.600, blue.400)',
    'linear(to-br, gray.800, gray.600)'
  );
  const textColor = useColorModeValue('white', 'gray.100');
  const subTextColor = useColorModeValue('whiteAlpha.900', 'gray.200');
  const cardBg = useColorModeValue('whiteAlpha.200', 'blackAlpha.200');
  const modalBg = useColorModeValue(
    'linear(to-br, cyan.400, purple.500)',
    'linear(to-br, gray.800, gray.600)'
  );
  const pulseAnimation = `${pulse} 6s infinite`;
  const waveAnimation = `${wave} 20s infinite linear`;
  const gradientAnimation = `${gradientShift} 15s infinite`;
  const noiseAnimation = `${noise} 10s infinite linear`;
  const starfieldAnimation = `${starfield} 8s infinite`;
  const shakeAnimation = `${shake} 0.5s ease-in-out`;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalContent, setModalContent] = useState({ title: '', description: '' });

  const { ref: testimonialRef, inView: testimonialInView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const { ref: ctaRef, inView: ctaInView } = useInView({ triggerOnce: true, threshold: 0.3 });

  // Parallax effect for images
  const imageRef = useRef();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const handleMouseMove = (event) => {
    const rect = imageRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Memoized slider settings
  const sliderSettings = useMemo(
    () => ({
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 5000,
      arrows: false,
      accessibility: true,
      fade: true,
      pauseOnHover: true,
      pauseOnDotsHover: true,
    }),
    []
  );

  return (
    <Box position="relative" overflow="hidden">
      {/* Testimonial Section */}
      <Box py={24} bgGradient={bgGradient} animation={gradientAnimation}>
        {/* Background Animated Elements */}
        <MotionBox
          position="absolute"
          top="10%"
          left="10%"
          w="25px"
          h="25px"
          bg="cyan.400"
          borderRadius="full"
          animation={`${starfieldAnimation} 7s infinite`}
          zIndex={2}
        />
        <MotionBox
          position="absolute"
          bottom="10%"
          right="10%"
          w="20px"
          h="20px"
          bg="cyan.400"
          borderRadius="full"
          animation={`${starfieldAnimation} 9s infinite`}
          zIndex={2}
        />
        <MotionBox
          position="absolute"
          top="30%"
          left="50%"
          w="15px"
          h="15px"
          bg="purple.400"
          borderRadius="full"
          animation={`${starfieldAnimation} 8s infinite`}
          zIndex={2}
        />
        <MotionBox
          position="absolute"
          top="20%"
          right="20%"
          w="18px"
          h="18px"
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

        <Container maxW="5xl" position="relative" zIndex={10}>
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
                What Users Say
              </Text>
              <Heading
                size="3xl"
                color={textColor}
                fontWeight="800"
                bgGradient="linear(to-r, white, cyan.200)"
                bgClip="text"
              >
                Trusted by Top Institutions
              </Heading>
            </MotionVStack>
            <Box ref={testimonialRef} w="full">
              <Slider {...sliderSettings}>
                {testimonials.map((testimonial, index) => (
                  <Tooltip
                    key={index}
                    label={`Click to read more from ${testimonial.name}`}
                    placement="top"
                    bg="cyan.500"
                    color="white"
                    borderRadius="md"
                  >
                    <MotionBox
                      bg={cardBg}
                      backdropFilter="blur(12px)"
                      borderRadius="xl"
                      p={8}
                      boxShadow="0 12px 32px rgba(0, 0, 0, 0.4)"
                      border="1px solid"
                      borderColor="cyan.400"
                      initial={{ opacity: 0, y: 50, rotateX: -15 }}
                      animate={testimonialInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                      transition={{ duration: 0.6, delay: index * 0.2, type: 'spring', stiffness: 100 }}
                      _hover={{
                        transform: 'perspective(1000px) rotateY(5deg)',
                        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 255, 255, 0.3)',
                        animation: shakeAnimation,
                      }}
                      cursor="pointer"
                      onClick={() => {
                        setModalContent({
                          title: testimonial.name,
                          description: testimonial.quote,
                        });
                        onOpen();
                      }}
                    >
                      <Box overflow="hidden" whiteSpace="nowrap" borderRight="2px solid" borderColor={subTextColor} animation={`${typing} 3s steps(40, end), ${blink} 0.75s step-end infinite`}>
                        <Text fontSize="lg" color={subTextColor} fontStyle="italic" mb={6}>
                          "{testimonial.quote}"
                        </Text>
                      </Box>
                      <Flex align="center">
                        <MotionBox
                          ref={imageRef}
                          style={{ rotateX, rotateY }}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={handleMouseLeave}
                          whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}
                          transition={{ duration: 0.3 }}
                        >
                          <Image
                            src={testimonial.image}
                            alt={testimonial.name}
                            boxSize={12}
                            borderRadius="full"
                            objectFit="cover"
                            mr={4}
                            loading="lazy"
                          />
                        </MotionBox>
                        <Box>
                          <Text fontWeight="700" color={textColor}>
                            {testimonial.name}
                          </Text>
                          <Text color={subTextColor}>{testimonial.title}</Text>
                        </Box>
                      </Flex>
                    </MotionBox>
                  </Tooltip>
                ))}
              </Slider>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={24} bgGradient={bgGradient} animation={gradientAnimation}>
        {/* Wave Effect at Bottom */}
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
          <MotionFlex
            ref={ctaRef}
            direction={{ base: 'column', md: 'row' }}
            align="center"
            justify="space-between"
            gap={8}
            initial={{ opacity: 0, y: 50 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4}>
              <Heading
                size="2xl"
                color={textColor}
                fontWeight="800"
                bgGradient="linear(to-r, white, cyan.200)"
                bgClip="text"
              >
                Ready to Simplify Your Scheduling?
              </Heading>
              <Text fontSize="lg" color={subTextColor} opacity={0.9}>
                Join thousands of users who trust Smart Course Planner for seamless academic planning.
              </Text>
            </VStack>
            {/* <MotionButton
              size="lg"
              bgGradient="linear(to-r, cyan.400, purple.500)"
              color="white"
              px={10}
              fontWeight="600"
              rightIcon={<ChevronRight />}
              // whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(0, 255, 255, 0.5), 0 8px 16px rgba(0, 0, 0, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '0',
                height: '0',
                bg: 'rgba(255, 255, 255, 0.4)',
                borderRadius: 'full',
                transform: 'translate(-50%, -50%)',
                animation: `${glowTrail} 1.5s ease-out infinite`,
                pointerEvents: 'none',
              }}
              _hover={{
                _before: {
                  width: '300px',
                  height: '300px',
                },
              }}
              onClick={() => alert('Navigate to signup page')}
              aria-label="Get started with Smart Course Planner"
            >
              Get Started Today
            </MotionButton> */}
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
                           Get Started Today
                          </MotionButton>
          </MotionFlex>
        </Container>
      </Box>

      {/* Modal for Testimonial Details */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <MotionModalContent
          bgGradient={modalBg}
          backdropFilter="blur(16px)"
          borderRadius="xl"
          p={6}
          border="2px solid"
          borderColor="cyan.400"
          // boxShadow="0 0 20px rgba(33, 188, 188, 0.3)"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
        >
          <ModalHeader color={textColor} fontWeight="700">
            {modalContent.title}
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody>
            <Text color={subTextColor} fontSize="lg">
              {modalContent.description}
            </Text>
          </ModalBody>
        </MotionModalContent>
      </Modal>
    </Box>
  );
};