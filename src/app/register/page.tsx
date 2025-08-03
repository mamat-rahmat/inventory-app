'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  Card,
  CardBody,
  Link,
  HStack,
} from '@chakra-ui/react';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
        isValid = false;
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast({
        title: 'Registration successful',
        description: 'Your account has been created. You can now sign in.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <Card>
        <CardBody>
          <VStack spacing={6}>
            <Heading as="h1" size="xl">Create Account</Heading>
            <Text textAlign="center">
              Join our inventory management system
            </Text>
            
            <Box as="form" width="100%" onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl id="name" isRequired isInvalid={!!errors.name}>
                  <FormLabel>Full Name</FormLabel>
                  <Input 
                    name="name"
                    type="text" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Enter your full name"
                  />
                  {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
                </FormControl>
                
                <FormControl id="email" isRequired isInvalid={!!errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    name="email"
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="your@email.com"
                  />
                  {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
                </FormControl>
                
                <FormControl id="password" isRequired isInvalid={!!errors.password}>
                  <FormLabel>Password</FormLabel>
                  <Input 
                    name="password"
                    type="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="Enter your password"
                  />
                  {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
                </FormControl>
                
                <FormControl id="confirmPassword" isRequired isInvalid={!!errors.confirmPassword}>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input 
                    name="confirmPassword"
                    type="password" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>}
                </FormControl>
                
                <Button
                  type="submit"
                  colorScheme="blue"
                  width="100%"
                  mt={4}
                  isLoading={isLoading}
                  loadingText="Creating account..."
                >
                  Create Account
                </Button>
              </VStack>
            </Box>
            
            <HStack spacing={1}>
              <Text fontSize="sm">Already have an account?</Text>
              <Link as={NextLink} href="/login" color="blue.500" fontSize="sm">
                Sign in here
              </Link>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}