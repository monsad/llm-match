import React from 'react';
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

const RegisterPage = () => {
  const { register, isLoading } = useAuth();
  const { isOpen, onToggle } = useDisclosure();

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      username: Yup.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be 20 characters or less')
        .required('Username is required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: (values) => {
      register({
        email: values.email,
        username: values.username,
        password: values.password,
      });
    },
  });

  return (
    <Box>
      <VStack spacing={4} align="flex-start">
        <Heading size="lg">Create Account</Heading>
        <Text>Register to access LLM Model Advisor</Text>
        
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
              isInvalid={formik.touched.username && formik.errors.username}
            >
              <FormLabel htmlFor="username">Username</FormLabel>
              <Input
                id="username"
                name="username"
                placeholder="Choose a username"
                {...formik.getFieldProps('username')}
              />
              <FormErrorMessage>{formik.errors.username}</FormErrorMessage>
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
                  placeholder="Create a password"
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
            
            <FormControl 
              isInvalid={formik.touched.confirmPassword && formik.errors.confirmPassword}
            >
              <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={isOpen ? 'text' : 'password'}
                placeholder="Confirm your password"
                {...formik.getFieldProps('confirmPassword')}
              />
              <FormErrorMessage>{formik.errors.confirmPassword}</FormErrorMessage>
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              mt={4}
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default RegisterPage;
