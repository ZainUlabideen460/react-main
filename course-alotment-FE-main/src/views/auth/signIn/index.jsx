import React, { useState } from "react";
import axios from "axios";
// Chakra imports
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
// Assets
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { useHistory } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL  || 'http://localhost:3001';
// || 'http://192.168.170.58:3001'
function SignIn({ isModal = false, closeModal }) {
  const history = useHistory();
  // Chakra color mode
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const brandStars = useColorModeValue("brand.500", "brand.400");
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [loading, setLoading] = useState(false);
  const handleClick = () => setShow(!show);
  return (
    <Flex
      w={isModal ? '100%' : '100vw'}
      h={isModal ? 'auto' : '100vh'}
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      p={isModal ? 0 : 4}
    >
      {!isModal && (
      <Box>
        <Heading
          color={textColor}
          fontSize="36px"
          mb="10px"
          textAlign={"center"}
        >
          Sign In
        </Heading>
        <Text
          mb="36px"
          ms="4px"
          color={textColorSecondary}
          fontWeight="400"
          fontSize="md"
        >
          Enter your email and password to sign in!
        </Text>
      </Box>
      )}
      <Flex
        zIndex="2"
        direction="column"
        background="transparent"
        w={{ base: "100%", md: "420px" }}
        borderRadius="15px"
      >
        <FormControl>
          <FormLabel
            display="flex"
            ms="4px"
            fontSize="sm"
            fontWeight="500"
            color={textColor}
            mb="8px"
          >
            Email<Text color={brandStars}>*</Text>
          </FormLabel>
          <Input
            isRequired
            value={email}
            onChange={e=>setEmail(e.target.value)}
            variant="auth"
            fontSize="sm"
            type="email"
            placeholder="admin@example.com"
            mb="24px"
            fontWeight="500"
            size="lg"
          />
          <FormLabel
            ms="4px"
            fontSize="sm"
            fontWeight="500"
            color={textColor}
            display="flex"
          >
            Password<Text color={brandStars}>*</Text>
          </FormLabel>
          <InputGroup size="md">
            <Input
              isRequired
              value={cnic}
              onChange={e=>setCnic(e.target.value)}
              fontSize="sm"
              placeholder="CNIC"
              mb="24px"
              size="lg"
              type={show ? "text" : "password"}
              variant="auth"
            />
            <InputRightElement display="flex" alignItems="center" mt="4px">
              <Icon
                color={textColorSecondary}
                _hover={{ cursor: "pointer" }}
                as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                onClick={handleClick}
              />
            </InputRightElement>
          </InputGroup>

          <Button
            fontSize="sm"
            variant="brand"
            fontWeight="500"
            w="100%"
            h="50"
            mb="24px"
            onClick={async ()=>{
              if(!email||!cnic) return alert('Enter credentials');
              setLoading(true);
              try{
                const res = await axios.post(`${API_URL}/login`,{email,cnic});
                localStorage.setItem('token',res.data.token);
                if(closeModal) closeModal();
                history.push('/admin/dashboard');
              }catch(err){
                alert(err.response?.data?.error || 'Login failed');
              }finally{
                setLoading(false);
              }
            }}
            isLoading={loading}
          >
            Sign In
          </Button>
        </FormControl>
      </Flex>
    </Flex>
  );
}

export default SignIn;
