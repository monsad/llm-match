import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  List,
  ListItem,
  ListIcon,
  Divider,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { FiBookmark, FiCheck, FiX, FiExternalLink } from 'react-icons/fi';
import { modelService } from '../services/api';

const ModelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const cardBg = useColorModeValue('white', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [notes, setNotes] = useState('');
  
  // Fetch model details
  const { data: model, isLoading, error } = useQuery(
    ['model', id],
    () => modelService.getModel(id).then((res) => res.data),
    {
      onError: () => {
        toast({
          title: 'Error',
          description: 'Could not load model details.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/models');
      },
    }
  );
  
  // Fetch saved models to check if this model is saved
  const { data: savedModels = [] } = useQuery(
    'savedModels',
    () => modelService.getSavedModels().then((res) => res.data)
  );
  
  // Check if model is saved
  const isSaved = savedModels.some((saved) => saved.model.id === parseInt(id));
  
  // Save model mutation
  const saveModelMutation = useMutation(
    ({ modelId, notes }) => modelService.saveModel(modelId, notes),
    {
      onSuccess: () => {
        toast({
          title: 'Model saved',
          description: 'The model has been added to your saved models.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        queryClient.invalidateQueries('savedModels');
        onClose();
      },
      onError: (error) => {
        toast({
          title: 'Error saving model',
          description: error.response?.data?.detail || 'Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );
  
  // Unsave model mutation
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
  
  // Handle save model
  const handleSaveModel = () => {
    if (isSaved) {
      unsaveModelMutation.mutate(id);
    } else {
      onOpen();
    }
  };
  
  // Handle submit save with notes
  const handleSubmitSave = () => {
    saveModelMutation.mutate({ modelId: id, notes });
  };
  
  // Format benchmark data for display
  const formatBenchmarks = (benchmarks) => {
    if (!benchmarks) return [];
    
    return Object.entries(benchmarks).map(([key, value]) => ({
      benchmark: key,
      score: value,
    }));
  };
  
  if (isLoading) {
    return (
      <Box>
        <Heading mb={6}>Model Details</Heading>
        <Text>Loading model information...</Text>
      </Box>
    );
  }
  
  if (error || !model) {
    return (
      <Box>
        <Heading mb={6}>Model Details</Heading>
        <Text>Model not found or error loading details.</Text>
        <Button mt={4} onClick={() => navigate('/models')}>
          Back to Models
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header */}
      <Card bg={cardBg} mb={8}>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box>
              <HStack mb={2}>
                <Heading>{model.name}</Heading>
                {model.version && (
                  <Badge colorScheme="blue">v{model.version}</Badge>
                )}
              </HStack>
              <Text fontSize="lg" color="gray.500" mb={4}>
                by {model.provider}
              </Text>
              <Text>{model.description}</Text>
            </Box>
            
            <Box>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                <VStack align="flex-start">
                  <Text fontWeight="bold">Parameters</Text>
                  <Text>{model.parameters ? `${model.parameters} billion` : 'Unknown'}</Text>
                </VStack>
                
                <VStack align="flex-start">
                  <Text fontWeight="bold">License</Text>
                  <Text>{model.license_type || 'Not specified'}</Text>
                </VStack>
                
                <VStack align="flex-start">
                  <Text fontWeight="bold">Training Data</Text>
                  <Text noOfLines={2}>{model.training_data || 'Not specified'}</Text>
                </VStack>
                
                <VStack align="flex-start">
                  <Text fontWeight="bold">Pricing</Text>
                  <Text>{model.pricing_info || 'Not specified'}</Text>
                </VStack>
              </SimpleGrid>
              
              <Button
                leftIcon={<Icon as={isSaved ? FiX : FiBookmark} />}
                mt={6}
                colorScheme={isSaved ? 'red' : 'blue'}
                variant={isSaved ? 'outline' : 'solid'}
                onClick={handleSaveModel}
                isLoading={saveModelMutation.isLoading || unsaveModelMutation.isLoading}
              >
                {isSaved ? 'Remove from Saved Models' : 'Save Model'}
              </Button>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
      
      {/* Detailed information tabs */}
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Performance</Tab>
          <Tab>Technical Details</Tab>
          <Tab>Languages</Tab>
        </TabList>
        
        <TabPanels>
          {/* Overview tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Card bg={cardBg} height="100%">
                <CardHeader>
                  <Heading size="md">Strengths</Heading>
                </CardHeader>
                <CardBody>
                  {model.strengths ? (
                    <List spacing={2}>
                      {model.strengths.split(',').map((strength, i) => (
                        <ListItem key={i} display="flex">
                          <ListIcon as={FiCheck} color="green.500" mt={1} />
                          <Text>{strength.trim()}</Text>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Text>No strengths specified</Text>
                  )}
                </CardBody>
              </Card>
              
              <Card bg={cardBg} height="100%">
                <CardHeader>
                  <Heading size="md">Weaknesses</Heading>
                </CardHeader>
                <CardBody>
                  {model.weaknesses ? (
                    <List spacing={2}>
                      {model.weaknesses.split(',').map((weakness, i) => (
                        <ListItem key={i} display="flex">
                          <ListIcon as={FiX} color="red.500" mt={1} />
                          <Text>{weakness.trim()}</Text>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Text>No weaknesses specified</Text>
                  )}
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          {/* Performance tab */}
          <TabPanel>
            <Card bg={cardBg}>
              <CardHeader>
                <Heading size="md">Benchmark Performance</Heading>
              </CardHeader>
              <CardBody>
                {model.performance_benchmarks ? (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Benchmark</Th>
                        <Th isNumeric>Score</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {formatBenchmarks(model.performance_benchmarks).map((benchmark) => (
                        <Tr key={benchmark.benchmark}>
                          <Td>{benchmark.benchmark}</Td>
                          <Td isNumeric>{benchmark.score}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text>No benchmark data available</Text>
                )}
              </CardBody>
              <CardFooter>
                <Text fontSize="sm" color="gray.500">
                  Benchmark scores may vary based on testing methodology and conditions.
                </Text>
              </CardFooter>
            </Card>
          </TabPanel>
          
          {/* Technical Details tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Card bg={cardBg}>
                <CardHeader>
                  <Heading size="md">Hardware Requirements</Heading>
                </CardHeader>
                <CardBody>
                  <Text>{model.hardware_requirements || 'No hardware requirements specified'}</Text>
                </CardBody>
              </Card>
              
              <Card bg={cardBg}>
                <CardHeader>
                  <Heading size="md">Training Data</Heading>
                </CardHeader>
                <CardBody>
                  <Text>{model.training_data || 'No training data information available'}</Text>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          {/* Languages tab */}
          <TabPanel>
            <Card bg={cardBg}>
              <CardHeader>
                <Heading size="md">Supported Languages</Heading>
              </CardHeader>
              <CardBody>
                {model.supported_languages && model.supported_languages.length > 0 ? (
                  <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={4}>
                    {model.supported_languages.map((language) => (
                      <HStack key={language}>
                        <Icon as={FiCheck} color="green.500" />
                        <Text>{language}</Text>
                      </HStack>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Text>No language information available</Text>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Action buttons */}
      <HStack mt={8} spacing={4}>
        <Button onClick={() => navigate('/models')}>
          Back to Models
        </Button>
        <Button
          colorScheme="blue"
          onClick={() => navigate('/recommendations/new')}
        >
          Get Personalized Recommendations
        </Button>
      </HStack>
      
      {/* Save model modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save Model</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Add optional notes about why you're saving this model or how you plan to use it.
            </Text>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes (optional)"
              resize="vertical"
              rows={4}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmitSave}
              isLoading={saveModelMutation.isLoading}
            >
              Save Model
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ModelDetailPage;
