// 2FA implmentation was inspired by this tutorial: https://www.youtube.com/watch?v=fBWwx45_nIo
// login implementation was inspired by chakra authentication template: https://chakra-templates.dev/forms/authentication

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { login } from '../api/api.mjs';
import { getUser, redirectMain } from "../utils/utils.js";

export async function getServerSideProps(context) {
  const propsData = await getUser(context);
  if (propsData) {
    return redirectMain();
  }
  return { props: {} };
}

export default function LoginForm() {
  const router = useRouter();
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const tokenRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginInvalid, setIsLoginInvalid] = useState(false);
  const [isTokenInvalid, setIsTokenInvalid] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const changePage = () => {
    router.push({
      pathname: '/main'
    });
  }

  const submitToken = (e) => {
    e.preventDefault();
    const username = usernameRef.current.value;
    const password = passwordRef.current.value;
    const token = tokenRef.current.value;
    login(username, password, token).then(res => {
      if (res && res.success) {
        setIsTokenInvalid(false);
        changePage();
      } else {
        setIsTokenInvalid(true);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = usernameRef.current.value;
    const password = passwordRef.current.value;

    login(username, password).then(res => {
      if (res) {
        setIsLoginInvalid(false);
        if (res.require2FA) {
          setIsModalOpen(true);
        } else {
          changePage();
        }
      } else {
        setIsLoginInvalid(true);
      }
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsTokenInvalid(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <>
      <Container maxW="lg" py='24' px='8'>
        <Stack spacing="8">
          <Stack spacing="6">
            <Stack spacing='3' textAlign="center">
              <Heading textAlign="center">ExploreSync</Heading>
              <Heading size='sm'>Log in to your account</Heading>
              <Text color="fg.muted">
                Don't have an account? <Link href="register" fontWeight="bold">Sign up</Link>
              </Text>
            </Stack>
          </Stack>
          <Box
            py='8'
            px='10'
            boxShadow='md'
            borderRadius='xl'
          >
            <form onSubmit={handleSubmit}>
              <FormControl isInvalid={isLoginInvalid}>
                <FormLabel htmlFor="username">Username</FormLabel>
                <Input id="username" type="username" required ref={ usernameRef } mb={5} />
                <FormLabel htmlFor="password">Password</FormLabel>
                <InputGroup>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    ref={passwordRef}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      onClick={togglePasswordVisibility}
                      icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                    />
                  </InputRightElement>
                </InputGroup>
                <Button type="submit" w='full' mt={6}>Sign in</Button>
                <FormErrorMessage mt={4}> Incorrect Username or Password </FormErrorMessage>
              </FormControl>
            </form>
          </Box>
        </Stack>
      </Container>
      {/* Modal for 2FA */}
      <Modal isOpen={isModalOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Two-Factor Authentication Required</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={submitToken}>
              <FormControl isInvalid={isTokenInvalid}>
                <FormLabel htmlFor="token">Verification Code</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter token"
                  ref={ tokenRef }
                  required
                />
                <FormErrorMessage mx={1} mt={1}> Invalid token. Please try again. </FormErrorMessage>
              </FormControl>
              <Button type="submit" my={4}>Submit</Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}