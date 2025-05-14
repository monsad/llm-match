import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  SimpleGrid,
  Divider,
  Badge,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { authService, modelService } from '../services/api';

const ProfilePage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const cardBg = useColorModeValue('white', 'gray.700');
  const { isOpen, onToggle } = useDisclosure();

  // Fetch saved models
  const { data: savedModels = [], isLoading: isLoadingSavedModels } = useQuery(
    'savedModels',
    () => modelService.getSavedModels().then((res) => res.data)
  );

  // Update password mutation
  const updatePasswordMutation = useMutation(
    ({ currentPassword, newPassword }) =>
      authService.updatePassword(currentPassword, newPassword),
    {
      onSuccess: () => {
        toast({
          title: 'Password updated',
          description: 'Your password has been successfully updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        formik.resetForm();
      },
      onError: (error) => {
        toast({
          title: 'Error updating password',
          description: error.response?.data?.detail || 'Please check your current password and try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  // Remove saved model mutation
  const unsaveModelMutation = useMutation(
    (modelId) => modelService.unsaveModel(modelId),
    {
      onSuccess: () => {
        toast({
          title: 'Model removed',
          description: 'The model has been removed from your saved models.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        queryClient.invalidateQueries('savedModels');
      },
      onError: (error) => {
        toast({
          title: 'Error removing model',
          description: error.response?.data?.detail || 'Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  // Formik setup for password change
  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: (values) => {
      updatePasswordMutation.mutate({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    },
  });

  // Handle removing saved model
  const handleRemoveSavedModel = (modelId) => {
    unsaveModelMutation.mutate(modelId);
  };

  return (
    <Box>
      <Heading mb={6}>Your Profile</Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        {/* User information */}
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Account Information</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="bold">Username</Text>
                <Text>{user?.username}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Email</Text>
                <Text>{user?.email}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Account Type</Text>
                <Badge colorScheme={user?.is_admin ? 'purple' : 'blue'}>
                  {user?.is_admin ? 'Administrator' : 'Standard User'}
                </Badge>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Change password */}
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Change Password</Heading>
          </CardHeader>
          <CardBody>
            <form onSubmit={formik.handleSubmit}>
              <VStack spacing={4} align="stretch">
                <FormControl
                  isInvalid={
                    formik.touched.currentPassword && formik.errors.currentPassword
                  }
                >
                  <FormLabel htmlFor="currentPassword">Current Password</FormLabel>
                  <InputGroup>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type={isOpen ? 'text' : 'password'}
                      {...formik.getFieldProps('currentPassword')}
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
                  <FormErrorMessage>{formik.errors.currentPassword}</FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={
                    formik.touched.newPassword && formik.errors.newPassword
                  }
                >
                  <FormLabel htmlFor="newPassword">New Password</FormLabel>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={isOpen ? 'text' : 'password'}
                    {...formik.getFieldProps('newPassword')}
                  />
                  <FormErrorMessage>{formik.errors.newPassword}</FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={
                    formik.touched.confirmPassword && formik.errors.confirmPassword
                  }
                >
                  <FormLabel htmlFor="confirmPassword">Confirm New Password</FormLabel>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={isOpen ? 'text' : 'password'}
                    {...formik.getFieldProps('confirmPassword')}
                  />
                  <FormErrorMessage>{formik.errors.confirmPassword}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={updatePasswordMutation.isLoading}
                  mt={2}
                >
                  Update Password
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Saved models */}
      <Box mt={8}>
        <Heading size="md" mb={4}>
          Your Saved Models
        </Heading>

        {isLoadingSavedModels ? (
          <Text>Loading saved models...</Text>
        ) : savedModels.length === 0 ? (
          <Card bg={cardBg}>
            <CardBody>
              <Text>You haven't saved any models yet.</Text>
            </CardBody>
          </Card>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {savedModels.map((savedModel) => (
              <Card key={savedModel.id} bg={cardBg}>
                <CardHeader>
                  <Heading size="sm">{savedModel.model.name}</Heading>
                  <Text fontSize="sm" color="gray.500">
                    {savedModel.model.provider}
                    {savedModel.model.version && ` (v${savedModel.model.version})`}
                  </Text>
                </CardHeader>
                <CardBody>
                  <Text noOfLines={3}>{savedModel.model.description}</Text>

                  {savedModel.notes && (
                    <>
                      <Divider my={3} />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm">
                          Your Notes:
                        </Text>
                        <Text fontSize="sm">{savedModel.notes}</Text>
                      </Box>
                    </>
                  )}
                </CardBody>
                <CardFooter>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      onClick={() => {
                        window.location.href = `/models/${savedModel.model.id}`;
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleRemoveSavedModel(savedModel.model.id)}
                      isLoading={unsaveModelMutation.isLoading}
                    >
                      Remove
                    </Button>
                  </HStack>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
};

export default ProfilePage;
