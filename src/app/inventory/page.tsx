'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Flex,
  Select,
  useToast,
} from '@chakra-ui/react';

// Interface for inventory items
interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: number;
}

export default function InventoryPage() {
  const { status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Fetch inventory items from API
  const fetchInventoryItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory');
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory items');
      }
      
      const data = await response.json();
      setInventoryItems(data);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load inventory items',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchInventoryItems();
    }
  }, [status, fetchInventoryItems]);

  if (status === 'loading' || loading) {
    return (
      <Container centerContent py={10}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(inventoryItems.map(item => item.category))];

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      setInventoryItems(items => items.filter(item => item.id !== id));
      toast({
        title: 'Item deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'green';
      case 'Low Stock':
        return 'orange';
      case 'Out of Stock':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading as="h1" size="xl">Inventory</Heading>
          <Text mt={2}>Manage your inventory items</Text>
        </Box>
        <Button colorScheme="blue" onClick={() => router.push('/inventory/add')}>
          Add New Item
        </Button>
      </Flex>

      <Flex mb={6} gap={4} direction={{ base: 'column', md: 'row' }}>
        <InputGroup maxW={{ base: '100%', md: '300px' }}>
          <InputLeftElement pointerEvents="none">
            {/* Search icon */}
            <span>🔍</span>
          </InputLeftElement>
          <Input 
            placeholder="Search by name or SKU" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </InputGroup>
        
        <Select 
          placeholder="Filter by category" 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          maxW={{ base: '100%', md: '200px' }}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </Select>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>SKU</Th>
              <Th>Category</Th>
              <Th isNumeric>Quantity</Th>
              <Th isNumeric>Price</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <Tr key={item.id}>
                  <Td>{item.name}</Td>
                  <Td>{item.sku}</Td>
                  <Td>{item.category}</Td>
                  <Td isNumeric>{item.quantity}</Td>
                  <Td isNumeric>${Number(item.price).toFixed(2)}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button size="sm" onClick={() => router.push(`/inventory/edit/${item.id}`)}>
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        colorScheme="red" 
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={7} textAlign="center" py={4}>
                  No items found
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Container>
  );
}