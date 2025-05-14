import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';

const NotFoundPage = () => {
  return (
    <Box
      textAlign="center"
      py={24}
      px={6}
    >
      <VStack spacing={8}>
        <Heading
          display="inline-block"
          size="4xl"
          bgGradient="linear(to-r, brand.400, brand.600)"
          backgroundClip="text"
        >
          404
        </Heading>
        <Text fontSize="18px" mt={3} mb={2}>
          Page Not Found
        </Text>
        <Text color={useColorModeValue('gray.500', 'gray.400')}>
          The page you're looking for does not seem to exist.
        </Text>
        <Button
          as={Link}
          to="/dashboard"
          colorScheme="blue"
          bgGradient="linear(to-r, brand.400, brand.500, brand.600)"
          color="white"
          variant="solid"
        >
          Go to Dashboard
        </Button>
      </VStack>
    </Box>
  );
};

export default NotFoundPage;
