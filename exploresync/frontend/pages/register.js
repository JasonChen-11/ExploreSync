// singup form implementation was inspired by chakra authentication template: https://chakra-templates.dev/forms/authentication

import  React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Link,
  useToast,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react'
import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import { OAuthButtonGroup } from './OAuthButtonGroup'
// import { PasswordField } from './PasswordField'

import { register } from "../api/api.mjs"  
import { showToast } from "../utils/utils.js";

import { getUser, redirectMain } from "../utils/utils.js";

export async function getServerSideProps(context) {
  const propsData = await getUser(context);
  if (propsData) {
    return redirectMain();
  }
  return { props: {} };
}

export default function registerForm() {
  const toast = useToast();
  const router = useRouter();
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const [isSignupInvalid, setIsSignupInvalid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectLogin = () => {
    router.push({
      pathname: '/'
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = usernameRef.current.value;
    const password = passwordRef.current.value;

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setIsSignupInvalid(true);
      return;
    }

    register(username, password).then(res => {
      if (res && res.success) {
        setIsSignupInvalid(false);
        redirectLogin();
        showToast(toast, true, 'User registered successfully');
      } else {
        setIsSignupInvalid(true);
      }
    });
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
              <Heading size='sm'> Create an account </Heading>
              <Text color="fg.muted">
                Already have an account? <Link href="/" fontWeight="bold">Log in</Link>
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
              <FormControl isInvalid={isSignupInvalid}>
                <FormLabel htmlFor="username">Username</FormLabel>
                <Input id="username" type="username" required ref={ usernameRef } mb={5} />
                <FormErrorMessage mt={-3} mb={4}>Invalid Username</FormErrorMessage>
              </FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <InputGroup>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
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
              <Button type="submit" w='full' mt={6}>Sign Up</Button>
            </form>
          </Box>
        </Stack>
      </Container>
    </>
  );
}