import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  SimpleGrid,
  IconButton,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Alert,
  AlertIcon,
  useColorModeValue,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { FiTrash2, FiEye } from 'react-icons/fi';
import { recommendationService } from '../services/api';

const RecommendationHistoryPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const cardBg = useColorModeValue('white', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [recommendationToDelete, setRecommendationToDelete] = React.useState(null);
  const cancelRef = React.useRef();

  // Fetch recommendations
  const { data: recommendations = [], isLoading } = useQuery(
    'recommendations',
    () => recommendationService.getRecommendations().then((res) => res.data)
  );

  // Delete recommendation mutation
  const deleteRecommendationMutation = useMutation(
    (id) => recommendationService.deleteRecommendation(id),
    {
      onSuccess: () => {
        toast({
          title: 'Recommendation deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        queryClient.invalidateQueries('recommendations');
        onClose();
      },
      onError: (error) => {
        toast({
          title: 'Error deleting recommendation',
          description: error.response?.data?.detail || 'Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        onClose();
      },
    }
  );

  // Format requirements for display
  const formatRequirement = (requirements) => {
    if (!requirements) return 'Unknown requirements';
    
    const taskType = requirements.task_type;
    if (!taskType) return 'General purpose';
    
    const taskMapping = {
      text_generation: 'Text Generation',
      code_generation: 'Code Generation',
      translation: 'Translation',
      summarization: 'Summarization',
      qa: 'Question Answering',
      chat: 'Conversational AI',
    };
    
    return taskMapping[taskType] || taskType;
  };

  // Handle delete recommendation
  const handleDeleteRecommendation = (recommendation) => {
    setRecommendationToDelete(recommendation);
    onOpen();
  };

  // Confirm delete
  const confirmDelete = () => {
    if (recommendationToDelete) {
      deleteRecommendationMutation.mutate(recommendationToDelete.id);
    }
  };

  // View recommendation details
  const handleViewRecommendation = (id) => {
    navigate(`/recommendations/${id}`);
  };

  return (
    <Box>
      <Heading mb={6}>Your Recommendation History</Heading>
      <Text fontSize="lg" mb={8}>
        View and manage your previous LLM model recommendations.
      </Text>

      {/* Empty state */}
      {!isLoading && recommendations.length === 0 && (
        <Alert status="info" borderRadius="md" mb={6}>
          <AlertIcon />
          You don't have any recommendation history yet. Get your first recommendation now!
        </Alert>
      )}

      {/* Action buttons */}
      <Flex justify="flex-end" mb={6}>
        <Button
          colorScheme="blue"
          onClick={() => navigate('/recommendations/new')}
        >
          Get New Recommendations
        </Button>
      </Flex>

      {/* Recommendations list */}
      {isLoading ? (
        <Text>Loading recommendations...</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {recommendations.map((recommendation) => (
            <Card key={recommendation.id} bg={cardBg}>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">
                    Recommendation from {new Date(recommendation.created_at).toLocaleDateString()}
                  </Heading>
                  <HStack>
                    <IconButton
                      icon={<FiEye />}
                      aria-label="View recommendation"
                      onClick={() => handleViewRecommendation(recommendation.id)}
                      variant="ghost"
                    />
                    <IconButton
                      icon={<FiTrash2 />}
                      aria-label="Delete recommendation"
                      onClick={() => handleDeleteRecommendation(recommendation)}
                      variant="ghost"
                      colorScheme="red"
                    />
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody>
                <Flex direction={{ base: 'column', md: 'row' }} justify="space-between">
                  <Box mb={{ base: 4, md: 0 }}>
                    <Text fontWeight="bold">Requirements:</Text>
                    <Text>Task type: {formatRequirement(recommendation.requirements)}</Text>
                    {recommendation.requirements.size_preference && (
                      <Text>
                        Size preference: {
                          {
                            'small': 'Small (1-5B parameters)',
                            'medium': 'Medium (5-20B parameters)',
                            'large': 'Large (20-100B parameters)',
                            'xlarge': 'Extra Large (100B+ parameters)'
                          }[recommendation.requirements.size_preference] || recommendation.requirements.size_preference
                        }
                      </Text>
                    )}
                    {recommendation.requirements.license_preference && (
                      <Text>
                        License: {
                          {
                            'commercial': 'Commercial',
                            'open_source': 'Open Source',
                            'research': 'Research Only',
                            'any': 'Any'
                          }[recommendation.requirements.license_preference] || recommendation.requirements.license_preference
                        }
                      </Text>
                    )}
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Top recommendations:</Text>
                    {recommendation.items.length > 0 ? (
                      <VStack align="stretch">
                        {recommendation.items
                          .sort((a, b) => b.score - a.score)
                          .slice(0, 3)
                          .map((item) => (
                            <HStack key={item.id}>
                              <Badge colorScheme="blue">{Math.round(item.score)}%</Badge>
                              <Text>{item.model.name} ({item.model.provider})</Text>
                            </HStack>
                          ))}
                      </VStack>
                    ) : (
                      <Text>No recommendations found</Text>
                    )}
                  </Box>
                </Flex>
              </CardBody>
              <CardFooter>
                <Button
                  size="sm"
                  onClick={() => handleViewRecommendation(recommendation.id)}
                >
                  View Full Results
                </Button>
              </CardFooter>
            </Card>
          ))}
        </VStack>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Recommendation
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this recommendation? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDelete}
                ml={3}
                isLoading={deleteRecommendationMutation.isLoading}
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

export default RecommendationHistoryPage;
