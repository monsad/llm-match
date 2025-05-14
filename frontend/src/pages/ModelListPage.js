import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Input,
  Select,
  FormControl,
  FormLabel,
  Flex,
  InputGroup,
  InputLeftElement,
  NumberInput,
  NumberInputField,
  Icon,
  IconButton,
  Divider,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FiBookmark, FiStar } from 'react-icons/fi';
import { modelService } from '../services/api';

const ModelListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // State for filters
  const [filters, setFilters] = useState({
    search: '',
    provider: '',
    minParameters: '',
    maxParameters: '',
    licenseType: '',
  });
  
  // Fetch models with filters
  const { data: models = [], isLoading } = useQuery(
    ['models', filters],
    () => {
      const params = {};
      if (filters.provider) params.provider = filters.provider;
      if (filters.minParameters) params.min_parameters = parseFloat(filters.minParameters);
      if (filters.maxParameters) params.max_parameters = parseFloat(filters.maxParameters);
      if (filters.licenseType) params.license_type = filters.licenseType;
      
      return modelService.getModels(params).then((res) => res.data);
    }
  );
  
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
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle number input change
  const handleNumberChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      provider: '',
      minParameters: '',
      maxParameters: '',
      licenseType: '',
    });
  };
  
  // Filter models by search term
  const filteredModels = models.filter((model) => {
    if (!filters.search) return true;
    
    const searchTerm = filters.search.toLowerCase();
    return (
      model.name.toLowerCase().includes(searchTerm) ||
      model.provider.toLowerCase().includes(searchTerm) ||
      (model.description && model.description.toLowerCase().includes(searchTerm))
    );
  });
  
  // Handle save model
  const handleSaveModel = (modelId) => {
    saveModelMutation.mutate({ modelId, notes: '' });
  };
  
  // View model details
  const handleViewModelDetails = (modelId) => {
    navigate(`/models/${modelId}`);
  };
  
  // Unique providers for filter dropdown
  const providers = [...new Set(models.map((model) => model.provider))].sort();
  
  // Unique license types for filter dropdown
  const licenseTypes = [...new Set(models.map((model) => model.license_type))].filter(Boolean).sort();
  
  return (
    <Box>
      <Heading mb={6}>LLM Model Database</Heading>
      <Text fontSize="lg" mb={8}>
        Explore our comprehensive database of LLM models with detailed specifications.
      </Text>
      
      {/* Filters */}
      <Card bg={cardBg} mb={8}>
        <CardHeader>
          <Heading size="md">Filter Models</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={6}>
            {/* Search */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search by name, provider, or description"
                name="search"
                value={filters.search}
                onChange={handleInputChange}
              />
            </InputGroup>
            
            {/* Filter grid */}
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} width="100%">
              {/* Provider filter */}
              <FormControl>
                <FormLabel>Provider</FormLabel>
                <Select
                  placeholder="All Providers"
                  name="provider"
                  value={filters.provider}
                  onChange={handleInputChange}
                >
                  {providers.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              {/* Parameters range */}
              <FormControl>
                <FormLabel>Min Parameters (B)</FormLabel>
                <NumberInput min={0} value={filters.minParameters} onChange={(value) => handleNumberChange('minParameters', value)}>
                  <NumberInputField placeholder="Min" />
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>Max Parameters (B)</FormLabel>
                <NumberInput min={0} value={filters.maxParameters} onChange={(value) => handleNumberChange('maxParameters', value)}>
                  <NumberInputField placeholder="Max" />
                </NumberInput>
              </FormControl>
              
              {/* License type */}
              <FormControl>
                <FormLabel>License Type</FormLabel>
                <Select
                  placeholder="All Licenses"
                  name="licenseType"
                  value={filters.licenseType}
                  onChange={handleInputChange}
                >
                  {licenseTypes.map((license) => (
                    <option key={license} value={license}>
                      {license}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </SimpleGrid>
            
            {/* Reset filters */}
            <Flex justify="flex-end" width="100%">
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
      
      {/* Models list */}
      {isLoading ? (
        <Text>Loading models...</Text>
      ) : (
        <>
          <Flex justify="space-between" align="center" mb={4}>
            <Text>
              {filteredModels.length} {filteredModels.length === 1 ? 'model' : 'models'} found
            </Text>
            <Button
              colorScheme="blue"
              onClick={() => navigate('/recommendations/new')}
            >
              Get Personalized Recommendations
            </Button>
          </Flex>
          
          {filteredModels.length === 0 ? (
            <Text>No models match your filters. Try adjusting your criteria.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredModels.map((model) => (
                <Card key={model.id} bg={cardBg} height="100%">
                  <CardHeader>
                    <VStack align="flex-start" spacing={1}>
                      <HStack>
                        <Heading size="md">{model.name}</Heading>
                        {model.version && (
                          <Badge colorScheme="blue">v{model.version}</Badge>
                        )}
                      </HStack>
                      <Text color="gray.500">{model.provider}</Text>
                    </VStack>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Text noOfLines={3}>{model.description}</Text>
                      
                      <HStack>
                        <Badge colorScheme="purple">
                          {model.parameters ? `${model.parameters}B params` : 'Unknown size'}
                        </Badge>
                        {model.license_type && (
                          <Badge colorScheme="green">
                            {model.license_type}
                          </Badge>
                        )}
                      </HStack>
                      
                      {model.strengths && (
                        <Box>
                          <Text fontWeight="bold" fontSize="sm">Key Strengths:</Text>
                          <Text fontSize="sm" noOfLines={2}>{model.strengths}</Text>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                  <CardFooter>
                    <Flex width="100%" justify="space-between">
                      <Button
                        leftIcon={<Icon as={FiStar} />}
                        onClick={() => handleViewModelDetails(model.id)}
                        size="sm"
                      >
                        Details
                      </Button>
                      <Button
                        leftIcon={<Icon as={FiBookmark} />}
                        onClick={() => handleSaveModel(model.id)}
                        size="sm"
                        variant="outline"
                      >
                        Save
                      </Button>
                    </Flex>
                  </CardFooter>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </>
      )}
    </Box>
  );
};

export default ModelListPage;
