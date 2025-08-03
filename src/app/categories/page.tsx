'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  Container,
  Heading,
  Box,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  VStack,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Flex,
  Badge,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { Category } from '@/types';
import { useRef } from 'react';

interface FormData {
  name: string;
  description: string;
}

interface FormErrors {
  name?: string;
}

export default function CategoriesPage() {
  const { status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: ''
  });
  
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCategories();
    }
  }, [status, fetchCategories]);

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
      newErrors.name = 'Category name is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setErrors({});
    setEditingCategory(null);
  };

  const handleCreate = () => {
    resetForm();
    onCreateOpen();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setErrors({});
    onEditOpen();
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
    onDeleteOpen();
  };

  const handleSubmit = async (isEdit: boolean = false) => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEdit ? `/api/categories/${editingCategory?.id}` : '/api/categories';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEdit ? 'update' : 'create'} category`);
      }

      await response.json();
      
      toast({
        title: `Category ${isEdit ? 'updated' : 'created'}`,
        description: `${formData.name} has been ${isEdit ? 'updated' : 'created'} successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      await fetchCategories();
      if (isEdit) {
        onEditClose();
      } else {
        onCreateClose();
      }
      resetForm();
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} category:`, error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${isEdit ? 'update' : 'create'} category`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      toast({
        title: 'Category deleted',
        description: `${deletingCategory.name} has been deleted successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      await fetchCategories();
      onDeleteClose();
      setDeletingCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete category',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <Navbar />
      <Container maxW="container.xl" py={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading as="h1" size="xl">Categories</Heading>
          <Text mt={2}>Manage product categories</Text>
        </Box>
        <Button colorScheme="blue" onClick={handleCreate}>
          Add New Category
        </Button>
      </Flex>

      <Card>
        <CardBody>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Description</Th>
                  <Th>Created</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Tr key={category.id}>
                      <Td>
                        <Badge colorScheme="blue" variant="subtle">
                          {category.name}
                        </Badge>
                      </Td>
                      <Td>{category.description || 'No description'}</Td>
                      <Td>{new Date(category.created_at).toLocaleDateString()}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button size="sm" onClick={() => handleEdit(category)}>
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            colorScheme="red" 
                            variant="outline"
                            onClick={() => handleDelete(category)}
                          >
                            Delete
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={4} textAlign="center" py={4}>
                      No categories found
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>

      {/* Create Category Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Category</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel>Category Name</FormLabel>
                <Input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Enter category name"
                />
                {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="Enter category description (optional)"
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={() => handleSubmit(false)}
              isLoading={isSubmitting}
            >
              Create Category
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Category Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Category</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel>Category Name</FormLabel>
                <Input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Enter category name"
                />
                {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="Enter category description (optional)"
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={() => handleSubmit(true)}
              isLoading={isSubmitting}
            >
              Update Category
            </Button>
          </ModalFooter>
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
              Delete Category
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the category &quot;{deletingCategory?.name}&quot;? 
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={confirmDelete} 
                ml={3}
                isLoading={isSubmitting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
    </>
  );
}