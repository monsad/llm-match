import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Image,
  VStack,
  Button,
  Container,
  useColorModeValue,
} from '@chakra-ui/react';

const AuthLayout = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const boxBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Flex minH="100vh" bg={bgColor}>
      {/* Left side - Image and branding */}
      <Box
        display={{ base: 'none', md: 'flex' }}
        flex="1"
        bg="brand.700"
        p={8}
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        <VStack spacing={8} align="flex-start" color="white" maxW="600px" zIndex={2}>
          <Text fontSize="5xl" fontWeight="bold" lineHeight="shorter">
            Find the Perfect LLM Model for Your Needs
          </Text>
          <Text fontSize="xl">
            LLM Model Advisor helps you discover and compare large language models tailored to your specific requirements.
          </Text>
          <Box>
            <Text mb={4} fontWeight="semibold">
              Comprehensive Database
            </Text>
            <Text mb={4} fontWeight="semibold">
              Smart Recommendations
            </Text>
            <Text mb={4} fontWeight="semibold">
              Detailed Comparisons
            </Text>
          </Box>
        </VStack>
        
        {/* Background overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-r, brand.900, brand.800)"
          opacity={0.9}
          zIndex={1}
        />
      </Box>

      {/* Right side - Auth forms */}
      <Flex
        flex="1"
        direction="column"
        align="center"
        justify="center"
        p={8}
      >
        <Container maxW="md">
          <VStack spacing={8} align="stretch">
            {/* Logo and app name */}
            <VStack spacing={2} mb={6}>
              <Text fontSize="3xl" fontWeight="bold" textAlign="center">
                LLM Model Advisor
              </Text>
              <Text fontSize="md" color="gray.500" textAlign="center">
                Your guide to the best language models
              </Text>
            </VStack>

            {/* Auth form container */}
            <Box
              bg={boxBgColor}
              boxShadow="md"
              borderRadius="xl"
              p={8}
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Outlet />
            </Box>

            {/* Switch between login and register */}
            <Flex justify="center" mt={4}>
              <Button
                variant="link"
                onClick={() => navigate(
                  window.location.pathname === '/login'
                    ? '/register'
                    : '/login'
                )}
              >
                {window.location.pathname === '/login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </Button>
            </Flex>
          </VStack>
        </Container>
      </Flex>
    </Flex>
  );
};

export default AuthLayout;
