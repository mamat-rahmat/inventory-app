'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Box, Button, Container, Flex, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import Navbar from '@/components/Navbar';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <>
      <Navbar />
      <Container maxW="container.xl" py={12}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
          <VStack spacing={6} align="flex-start">
            <Heading as="h1" size="2xl" fontWeight="bold">
              Inventory Management Made Simple
            </Heading>
            <Text fontSize="xl" color="gray.600">
              Track, manage, and optimize your inventory with our powerful and easy-to-use platform.
            </Text>
            <Flex gap={4} pt={4}>
              {session ? (
                <Button 
                  colorScheme="blue" 
                  size="lg"
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    colorScheme="blue" 
                    size="lg"
                    onClick={() => router.push('/login')}
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                  >
                    Learn More
                  </Button>
                </>
              )}
            </Flex>
          </VStack>
          <Box display="flex" justifyContent="center">
            <Image
              src="/inventory-illustration.svg"
              alt="Inventory Management Illustration"
              width={500}
              height={400}
              priority
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Box>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mt={20}>
          <FeatureCard 
            title="Real-time Tracking" 
            description="Monitor your inventory levels in real-time and get alerts when stock is running low."
          />
          <FeatureCard 
            title="Easy Management" 
            description="Add, edit, and organize your inventory items with our intuitive interface."
          />
          <FeatureCard 
            title="Powerful Analytics" 
            description="Gain insights into your inventory performance with detailed reports and analytics."
          />
        </SimpleGrid>
      </Container>
      <Box as="footer" bg="gray.50" py={10} mt={20}>
        <Container maxW="container.xl">
          <Text textAlign="center" color="gray.500">
            © {new Date().getFullYear()} Inventory Management App. All rights reserved.
          </Text>
        </Container>
      </Box>
    </>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <VStack 
      p={8} 
      bg="white" 
      boxShadow="md" 
      borderRadius="lg" 
      spacing={4} 
      align="flex-start"
      transition="transform 0.3s"
      _hover={{ transform: 'translateY(-5px)' }}
    >
      <Heading as="h3" size="md">{title}</Heading>
       <Text color="gray.600">{description}</Text>
     </VStack>
   );
}
