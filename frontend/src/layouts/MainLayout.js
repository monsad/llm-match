import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Avatar,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons';
import { FiHome, FiCompass, FiList, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

// NavItem component
const NavItem = ({ icon, children, to, onClick, active }) => {
  return (
    <NavLink to={to} style={{ width: '100%' }} onClick={onClick}>
      {({ isActive }) => (
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          bg={isActive || active ? 'brand.500' : 'transparent'}
          color={isActive || active ? 'white' : 'inherit'}
          _hover={{
            bg: 'brand.400',
            color: 'white',
          }}
        >
          {icon && (
            <Box mr="4" fontSize="16">
              {icon}
            </Box>
          )}
          {children}
        </Flex>
      )}
    </NavLink>
  );
};

const MainLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Navigation items
  const navItems = [
    { name: 'Dashboard', icon: <FiHome />, path: '/dashboard' },
    { name: 'Get Recommendations', icon: <FiCompass />, path: '/recommendations/new' },
    { name: 'My Recommendations', icon: <FiList />, path: '/recommendations/history' },
    { name: 'Model Database', icon: <FiList />, path: '/models' },
  ];

  // Admin navigation items
  const adminNavItems = [
    { name: 'Manage Models', icon: <FiSettings />, path: '/admin/models' },
    { name: 'Manage Users', icon: <FiUser />, path: '/admin/users' },
  ];

  // Sidebar content
  const SidebarContent = ({ onClose }) => (
    <Box
      borderRight="1px"
      borderRightColor={borderColor}
      bg={sidebarBg}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          LLM Advisor
        </Text>
        <CloseIcon display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      <VStack spacing={1} align="stretch" mt={6}>
        {navItems.map((item) => (
          <NavItem
            key={item.name}
            icon={item.icon}
            to={item.path}
            onClick={onClose}
          >
            {item.name}
          </NavItem>
        ))}
        
        {isAdmin && (
          <>
            <Box px="4" mt="6" mb="2">
              <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase">
                Admin
              </Text>
            </Box>
            {adminNavItems.map((item) => (
              <NavItem
                key={item.name}
                icon={item.icon}
                to={item.path}
                onClick={onClose}
              >
                {item.name}
              </NavItem>
            ))}
          </>
        )}
      </VStack>
    </Box>
  );

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Sidebar for desktop */}
      <SidebarContent onClose={() => onClose} display={{ base: 'none', md: 'block' }} />
      
      {/* Drawer for mobile */}
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>LLM Model Advisor</DrawerHeader>
          <DrawerBody p={0}>
            <SidebarContent onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      
      {/* Header */}
      <Flex
        ml={{ base: 0, md: 60 }}
        px={{ base: 4, md: 6 }}
        height="20"
        alignItems="center"
        bg={useColorModeValue('white', 'gray.800')}
        borderBottomWidth="1px"
        borderBottomColor={borderColor}
        justifyContent="space-between"
      >
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
          variant="outline"
          aria-label="open menu"
          icon={<HamburgerIcon />}
        />
        
        <Text
          display={{ base: 'flex', md: 'none' }}
          fontSize="2xl"
          fontWeight="bold"
        >
          LLM Advisor
        </Text>
        
        <HStack spacing={3}>
          <Menu>
            <MenuButton
              as={Button}
              rounded="full"
              variant="link"
              cursor="pointer"
              minW={0}
            >
              <HStack>
                <Avatar size="sm" name={user?.username || 'User'} />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm">{user?.username || 'User'}</Text>
                  <Text fontSize="xs" color="gray.600">
                    {isAdmin ? 'Admin' : 'User'}
                  </Text>
                </VStack>
                <Box display={{ base: 'none', md: 'flex' }}>
                  <ChevronDownIcon />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiUser />} onClick={() => navigate('/profile')}>
                Profile
              </MenuItem>
              <MenuItem icon={<FiLogOut />} onClick={logout}>
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
      
      {/* Main content */}
      <Box ml={{ base: 0, md: 60 }} p={4}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
