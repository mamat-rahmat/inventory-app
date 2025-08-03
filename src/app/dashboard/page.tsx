'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Flex,
  Button,
  useToast,
} from '@chakra-ui/react';

// Interface for dashboard statistics
interface DashboardStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  categories: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard statistics
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory?stats=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchStats();
    }
  }, [status, router, fetchStats]);

  if (status === 'loading' || loading) {
    return (
      <Container centerContent py={10}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!session) {
    return null; // Will redirect in the useEffect
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={8}>
        <Box>
          <Heading as="h1" size="xl">Dashboard</Heading>
          <Text mt={2}>Welcome back, {session.user?.name || 'User'}</Text>
        </Box>
        <Button colorScheme="blue" onClick={() => router.push('/inventory')}>
          Manage Inventory
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <StatCard 
          title="Total Items" 
          value={stats?.totalItems.toString() || '0'} 
          change={`${stats?.categories || 0} categories`} 
        />
        <StatCard 
          title="Total Value" 
          value={`$${stats?.totalValue.toFixed(2) || '0.00'}`} 
          change="Inventory value" 
        />
        <StatCard 
          title="Low Stock Items" 
          value={stats?.lowStockItems.toString() || '0'} 
          change="Items below 10 units" 
          isWarning={stats ? stats.lowStockItems > 0 : false} 
        />
        <StatCard 
          title="Categories" 
          value={stats?.categories.toString() || '0'} 
          change="Product categories" 
        />
      </SimpleGrid>


    </Container>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isWarning?: boolean;
}

function StatCard({ title, value, change, isWarning = false }: StatCardProps) {
  return (
    <Card>
      <CardBody>
        <Stat>
          <StatLabel>{title}</StatLabel>
          <StatNumber>{value}</StatNumber>
          <StatHelpText color={isWarning ? 'orange.500' : undefined}>
            {change}
          </StatHelpText>
        </Stat>
      </CardBody>
    </Card>
  );
}