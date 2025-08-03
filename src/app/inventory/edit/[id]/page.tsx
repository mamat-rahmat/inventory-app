'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Heading,
  Box,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  VStack,
  useToast,
  Text,
} from '@chakra-ui/react';
import { Category } from '@/types';

interface FormData {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  description: string;
}

interface FormErrors {
  name?: string;
  sku?: string;
  category?: string;
  quantity?: string;
  price?: string;
}

export default function EditInventoryPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    price: 0,
    description: ''
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingCategories(false);
    }
  }, [toast]);

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/inventory/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch item');
      }
      
      const item = await response.json();
      setFormData({
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        price: Number(item.price),
        description: item.description || ''
      });
    } catch (error) {
      console.error('Error fetching item:', error);
      toast({
        title: 'Error',
        description: 'Failed to load item details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      router.push('/inventory');
    } finally {
      setLoading(false);
    }
  }, [params.id, toast, router]);

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      fetchCategories();
      fetchItem();
    }
  }, [status, params.id, fetchItem, fetchCategories]);

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
      isValid = false;
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
      isValid = false;
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
      isValid = false;
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
      isValid = false;
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than zero';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (name: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/inventory/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          quantity: formData.quantity,
          price: formData.price,
          description: formData.description,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update item');
      }
      
      await response.json();
      
      toast({
        title: 'Item updated',
        description: `${formData.name} has been updated successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      router.push('/inventory');
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update item. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Heading as="h1" size="xl" mb={6}>Edit Inventory Item</Heading>
      
      <Card>
        <CardBody>
          <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel>Item Name</FormLabel>
                <Input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Enter item name"
                />
                {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
              </FormControl>
              
              <FormControl isRequired isInvalid={!!errors.sku}>
                <FormLabel>SKU</FormLabel>
                <Input 
                  name="sku" 
                  value={formData.sku} 
                  onChange={handleChange} 
                  placeholder="Enter SKU"
                />
                {errors.sku && <FormErrorMessage>{errors.sku}</FormErrorMessage>}
              </FormControl>
              
              <FormControl isRequired isInvalid={!!errors.category}>
                <FormLabel>Category</FormLabel>
                <Select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange}
                  placeholder={loadingCategories ? "Loading categories..." : "Select category"}
                  disabled={loadingCategories}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </Select>
                {errors.category && <FormErrorMessage>{errors.category}</FormErrorMessage>}
              </FormControl>
              
              <FormControl isRequired isInvalid={!!errors.quantity}>
                <FormLabel>Quantity</FormLabel>
                <NumberInput 
                  min={0} 
                  value={formData.quantity} 
                  onChange={(value) => handleNumberChange('quantity', parseInt(value))}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                {errors.quantity && <FormErrorMessage>{errors.quantity}</FormErrorMessage>}
              </FormControl>
              
              <FormControl isRequired isInvalid={!!errors.price}>
                <FormLabel>Price ($)</FormLabel>
                <NumberInput 
                  min={0.01} 
                  step={0.01} 
                  precision={2}
                  value={formData.price} 
                  onChange={(value) => handleNumberChange('price', parseFloat(value))}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                {errors.price && <FormErrorMessage>{errors.price}</FormErrorMessage>}
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="Enter item description"
                />
              </FormControl>
              
              <Box pt={4}>
                <Button 
                  type="submit" 
                  colorScheme="blue" 
                  isLoading={isSubmitting}
                  mr={3}
                >
                  Update Item
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/inventory')}
                >
                  Cancel
                </Button>
              </Box>
            </VStack>
          </Box>
        </CardBody>
      </Card>
    </Container>
  );
}