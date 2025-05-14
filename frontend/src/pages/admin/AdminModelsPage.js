import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Button,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  Switch,
  FormHelperText,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { modelService } from '../../services/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const AdminModelsPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [editingModel, setEditingModel] = useState(null);
  const [deletingModel, setDeletingModel] = useState(null);
  const cancelRef = React.useRef();
  
  // Fetch models
  const { data: models = [], isLoading } = useQuery(
    'adminModels',
    () => modelService.getModels().then((res) => res.data)
  );
  
  // Create model mutation
  const createModelMutation = useMutation(
    (modelData) => modelService.createModel(modelData),
    {
      onSuccess: () => {
        toast({
          title: 'Model created',
          description: 'The LLM model has been successfully created.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        queryClient.invalidateQueries('adminModels');
        onModalClose();
      },
      onError: (error) => {
        toast({
          title: 'Error creating model',
          description: error.response?.data?.detail || 'Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );
  
  // Update model mutation
  const updateModelMutation = useMutation(
    ({ id, data }) => modelService.updateModel(id, data),
    {
      onSuccess: () => {
        toast({
          title: 'Model updated',
          description: 'The LLM model has been successfully updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        queryClient.invalidateQueries('adminModels');
        onModalClose();
      },
      onError: (error) => {
        toast({
          title: 'Error updating model',
          description: error.response?.data?.detail || 'Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );
  
  // Delete model mutation
  const deleteModelMutation = useMutation(
    (id) => modelService.deleteModel(id),
    {
      onSuccess: () => {
        toast({
          title: 'Model deleted',
          description: 'The LLM model has been successfully deleted.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        queryClient.invalidateQueries('adminModels');
        onDeleteClose();
      },
      onError: (error) => {
        toast({
          title: 'Error deleting model',
          description: error.response?.data?.detail || 'Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );
  
  // Formik setup for model form
  const formik = useFormik({
    initialValues: {
      name: '',
      provider: '',
      version: '',
      parameters: '',
      description: '',
      training_data: '',
      hardware_requirements: '',
      pricing_info: '',
      strengths: '',
      weaknesses: '',
      license_type: '',
      supported_languages: [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      provider: Yup.string().required('Provider is required'),
      version: Yup.string(),
      parameters: Yup.number().positive('Parameters must be positive'),
      description: Yup.string(),
      license_type: Yup.string(),
    }),
    onSubmit: (values) => {
      // Format supported languages as array
      const formattedValues = {
        ...values,
        parameters: values.parameters ? parseFloat(values.parameters) : null,
        supported_languages: values.supported_languages
          ? values.supported_languages.split(',').map(lang => lang.trim())
          : [],
        performance_benchmarks: {},
      };
      
      if (editingModel) {
        updateModelMutation.mutate({
          id: editingModel.id,
          data: formattedValues,
        });
      } else {
        createModelMutation.mutate(formattedValues);
      }
    },
  });
  
  // Handle add new model
  const handleAddModel = () => {
    setEditingModel(null);
    formik.resetForm();
    onModalOpen();
  };
  
  // Handle edit model
  const handleEditModel = (model) => {
    setEditingModel(model);
    
    // Format supported languages as comma-separated string
    const supportedLanguagesString = model.supported_languages
      ? model.supported_languages.join(', ')
      : '';
    
    formik.setValues({
      name: model.name || '',
      provider: model.provider || '',
      version: model.version || '',
      parameters: model.parameters || '',
      description: model.description || '',
      training_data: model.training_data || '',
      hardware_requirements: model.hardware_requirements || '',
      pricing_info: model.pricing_info || '',
      strengths: model.strengths || '',
      weaknesses: model.weaknesses || '',
      license_type: model.license_type || '',
      supported_languages: supportedLanguagesString,
    });
    
    onModalOpen();
  };
  
  // Handle delete model
  const handleDeleteModel = (model) => {
    setDeletingModel(model);
    onDeleteOpen();
  };
  
  // Confirm delete
  const confirmDelete = () => {
    if (deletingModel) {
      deleteModelMutation.mutate(deletingModel.id);
    }
  };
  
  return (
    <Box>
      <Heading mb={6}>Manage LLM Models</Heading>
      
      <HStack mb={6} justify="space-between">
        <Text fontSize="lg">
          Total Models: {models.length}
        </Text>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleAddModel}
        >
          Add New Model
        </Button>
      </HStack>
      
      {isLoading ? (
        <Text>Loading models...</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Provider</Th>
                <Th>Version</Th>
                <Th>Parameters (B)</Th>
                <Th>License</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {models.map((model) => (
                <Tr key={model.id}>
                  <Td fontWeight="medium">{model.name}</Td>
                  <Td>{model.provider}</Td>
                  <Td>{model.version}</Td>
                  <Td>{model.parameters}</Td>
                  <Td>
                    {model.license_type && (
                      <Badge colorScheme={
                        model.license_type === 'open_source' ? 'green' : 
                        model.license_type === 'commercial' ? 'blue' : 
                        'purple'
                      }>
                        {model.license_type}
                      </Badge>
                    )}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<EditIcon />}
                        aria-label="Edit model"
                        size="sm"
                        onClick={() => handleEditModel(model)}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label="Delete model"
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteModel(model)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* Add/Edit Model Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={formik.handleSubmit}>
            <ModalHeader>
              {editingModel ? 'Edit Model' : 'Add New Model'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                {/* Basic Information */}
                <Heading size="sm" alignSelf="flex-start">
                  Basic Information
                </Heading>
                
                <FormControl isRequired>
                  <FormLabel>Model Name</FormLabel>
                  <Input
                    name="name"
                    placeholder="e.g., GPT-4"
                    {...formik.getFieldProps('name')}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Provider</FormLabel>
                  <Input
                    name="provider"
                    placeholder="e.g., OpenAI"
                    {...formik.getFieldProps('provider')}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Version</FormLabel>
                  <Input
                    name="version"
                    placeholder="e.g., 4-turbo"
                    {...formik.getFieldProps('version')}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Parameters (billions)</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField
                      name="parameters"
                      placeholder="e.g., 175"
                      {...formik.getFieldProps('parameters')}
                    />
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel>License Type</FormLabel>
                  <Select
                    name="license_type"
                    placeholder="Select license type"
                    {...formik.getFieldProps('license_type')}
                  >
                    <option value="open_source">Open Source</option>
                    <option value="commercial">Commercial</option>
                    <option value="research">Research Only</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="description"
                    placeholder="Brief description of the model"
                    rows={3}
                    {...formik.getFieldProps('description')}
                  />
                </FormControl>
                
                {/* Additional Details */}
                <Heading size="sm" alignSelf="flex-start" mt={4}>
                  Additional Details
                </Heading>
                
                <FormControl>
                  <FormLabel>Training Data</FormLabel>
                  <Textarea
                    name="training_data"
                    placeholder="Information about training data sources"
                    rows={2}
                    {...formik.getFieldProps('training_data')}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Hardware Requirements</FormLabel>
                  <Textarea
                    name="hardware_requirements"
                    placeholder="Hardware needed for deployment or API access information"
                    rows={2}
                    {...formik.getFieldProps('hardware_requirements')}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Pricing Information</FormLabel>
                  <Textarea
                    name="pricing_info"
                    placeholder="Pricing model and costs"
                    rows={2}
                    {...formik.getFieldProps('pricing_info')}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Strengths</FormLabel>
                  <Textarea
                    name="strengths"
                    placeholder="Comma-separated list of strengths"
                    rows={2}
                    {...formik.getFieldProps('strengths')}
                  />
                  <FormHelperText>
                    Enter strengths separated by commas (e.g., "Fast inference, Good at coding, Natural language")
                  </FormHelperText>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Weaknesses</FormLabel>
                  <Textarea
                    name="weaknesses"
                    placeholder="Comma-separated list of weaknesses"
                    rows={2}
                    {...formik.getFieldProps('weaknesses')}
                  />
                  <FormHelperText>
                    Enter weaknesses separated by commas
                  </FormHelperText>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Supported Languages</FormLabel>
                  <Textarea
                    name="supported_languages"
                    placeholder="Comma-separated list of languages"
                    rows={2}
                    {...formik.getFieldProps('supported_languages')}
                  />
                  <FormHelperText>
                    Enter languages separated by commas (e.g., "English, Spanish, French")
                  </FormHelperText>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onModalClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={createModelMutation.isLoading || updateModelMutation.isLoading}
              >
                {editingModel ? 'Update Model' : 'Create Model'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Model
            </AlertDialogHeader>
            
            <AlertDialogBody>
              Are you sure you want to delete {deletingModel?.name}? This action cannot be undone.
            </AlertDialogBody>
            
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDelete}
                ml={3}
                isLoading={deleteModelMutation.isLoading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default AdminModelsPage;
