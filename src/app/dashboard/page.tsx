'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
} from '@chakra-ui/react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
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

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <StatCard 
          title="Total Items" 
          value="124" 
          change="+5% from last month" 
        />
        <StatCard 
          title="Low Stock Items" 
          value="12" 
          change="-2 from yesterday" 
          isWarning 
        />
        <StatCard 
          title="Recent Orders" 
          value="28" 
          change="+12% from last week" 
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Recent Activity</Heading>
            <Text>No recent activities to display.</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Quick Actions</Heading>
            <SimpleGrid columns={2} spacing={4}>
              <Button variant="outline" onClick={() => router.push('/inventory/add')}>
                Add New Item
              </Button>
              <Button variant="outline">
                Generate Report
              </Button>
              <Button variant="outline">
                Manage Categories
              </Button>
              <Button variant="outline">
                View Orders
              </Button>
            </SimpleGrid>
          </CardBody>
        </Card>
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