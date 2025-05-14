import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  HStack,
  IconButton,
  Switch,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { adminService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AdminUsersPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userToDeactivate, setUserToDeactivate] = React.useState(null);
  const cancelRef = React.useRef();
  
  // Fetch users
  const { data: users = [], isLoading } = useQuery(
    'adminUsers',
    () => adminService.getUsers().then((res) => res.data)
  );
  
  // Activate user mutation
  const activateUserMutation = useMutation(
    (userId) => adminService.activateUser(userId),
    {
      onSuccess: () => {
        toast({
          title: 'User activated',
          description: 'The user has been successfully activated.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        queryClient.invalidateQueries('adminUsers');
      },
      onError: (error) => {
        toast({
          title: 'Error activating user',
          description: error.response?.data?.detail || 'Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );
  
  // Deactivate user mutation
  const deactivateUserMutation = useMutation(
    (userId) => adminService.deactivateUser(userId),
    {
      onSuccess: () => {
        toast({
          title: 'User deactivated',
          description: 'The user has been successfully deactivated.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        queryClient.invalidateQueries('adminUsers');
        onClose();
      },
      onError: (error) => {
        toast({
          title: 'Error deactivating user',
          description: error.response?.data?.detail || 'Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        onClose();
      },
    }
  );
  
  // Handle toggle user status
  const handleToggleStatus = (user) => {
    if (user.is_active) {
      // Confirm before deactivating
      setUserToDeactivate(user);
      onOpen();
    } else {
      // Activate immediately
      activateUserMutation.mutate(user.id);
    }
  };
  
  // Confirm deactivate
  const confirmDeactivate = () => {
    if (userToDeactivate) {
      deactivateUserMutation.mutate(userToDeactivate.id);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <Box>
      <Heading mb={6}>Manage Users</Heading>
      
      <Text fontSize="lg" mb={6}>
        Total Users: {users.length}
      </Text>
      
      {isLoading ? (
        <Text>Loading users...</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Username</Th>
                <Th>Email</Th>
                <Th>Status</Th>
                <Th>Role</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td>{user.id}</Td>
                  <Td fontWeight="medium">{user.username}</Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <Badge
                      colorScheme={user.is_active ? 'green' : 'red'}
                      variant="solid"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={user.is_admin ? 'purple' : 'blue'}
                      variant="outline"
                    >
                      {user.is_admin ? 'Admin' : 'User'}
                    </Badge>
                  </Td>
                  <Td>{formatDate(user.created_at)}</Td>
                  <Td>
                    <Switch
                      colorScheme="green"
                      isChecked={user.is_active}
                      onChange={() => handleToggleStatus(user)}
                      // Disable toggle for current user and for the main admin account
                      isDisabled={user.id === currentUser?.id || user.id === 1}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* Deactivate Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Deactivate User
            </AlertDialogHeader>
            
            <AlertDialogBody>
              Are you sure you want to deactivate {userToDeactivate?.username}? 
              They will no longer be able to log in to the system.
            </AlertDialogBody>
            
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDeactivate}
                ml={3}
                isLoading={deactivateUserMutation.isLoading}
              >
                Deactivate
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default AdminUsersPage;
