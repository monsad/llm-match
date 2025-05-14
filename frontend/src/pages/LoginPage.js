import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  Heading,
  Text,
  InputGroup,
  InputRightElement,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { isOpen, onToggle } = useDisclosure();

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required'),
    }),
    onSubmit: (values) => {
      login(values.email, values.password);
    },
  });

  return (
    <Box>
      <VStack spacing={4} align="flex-start">
        <Heading size="lg">Sign In</Heading>
        <Text>Sign in to your account to continue</Text>
        
        <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4} align="flex-start" width="100%">
            <FormControl 
              isInvalid={formik.touched.email && formik.errors.email}
            >
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                {...formik.getFieldProps('email')}
              />
              <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
            </FormControl>
            
            <FormControl 
              isInvalid={formik.touched.password && formik.errors.password}
            >
              <FormLabel htmlFor="password">Password</FormLabel>
              <InputGroup>
                <Input
                  id="password"
                  name="password"
                  type={isOpen ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...formik.getFieldProps('password')}
                />
                <InputRightElement>
                  <IconButton
                    icon={isOpen ? <ViewOffIcon /> : <ViewIcon />}
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    aria-label={isOpen ? 'Hide password' : 'Show password'}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              mt={4}
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default LoginPage;
