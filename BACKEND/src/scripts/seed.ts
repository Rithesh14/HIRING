import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@techhire.com' },
    update: {},
    create: {
      email: 'admin@techhire.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      isEmailVerified: true
    }
  });

  // Create recruiter user
  const recruiterPassword = await bcrypt.hash('Recruiter123!', 12);
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@techhire.com' },
    update: {},
    create: {
      email: 'recruiter@techhire.com',
      password: recruiterPassword,
      name: 'Recruiter User',
      role: 'RECRUITER',
      isEmailVerified: true
    }
  });

  // Create sample DSA questions
  const dsaQuestions = [
    {
      type: 'DSA' as const,
      title: 'Two Sum',
      statement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      difficulty: 'EASY' as const,
      tags: ['Array', 'Hash Table'],
      template: {
        javascript: `function twoSum(nums, target) {
    // Your solution here
}`,
        python: `def two_sum(nums, target):
    # Your solution here
    pass`
      },
      testCases: [
        { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
        { input: [[3, 2, 4], 6], expectedOutput: [1, 2] }
      ]
    },
    {
      type: 'DSA' as const,
      title: 'Valid Palindrome',
      statement: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
      difficulty: 'EASY' as const,
      tags: ['String', 'Two Pointers'],
      template: {
        javascript: `function isPalindrome(s) {
    // Your solution here
}`,
        python: `def is_palindrome(s):
    # Your solution here
    pass`
      },
      testCases: [
        { input: ["A man, a plan, a canal: Panama"], expectedOutput: true },
        { input: ["race a car"], expectedOutput: false }
      ]
    }
  ];

  for (const question of dsaQuestions) {
    await prisma.question.upsert({
      where: { id: `dsa-${question.title.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `dsa-${question.title.toLowerCase().replace(/\s+/g, '-')}`,
        ...question
      }
    });
  }

  // Create sample aptitude questions
  const aptitudeQuestions = [
    {
      type: 'APTITUDE' as const,
      title: 'Basic Math',
      statement: 'If 3x + 5 = 20, what is the value of x?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 2, // Index of correct answer (5)
      explanation: '3x + 5 = 20, so 3x = 15, therefore x = 5'
    },
    {
      type: 'APTITUDE' as const,
      title: 'Series Completion',
      statement: 'Complete the series: 2, 6, 12, 20, 30, ?',
      options: ['40', '42', '44', '46'],
      correctAnswer: 1, // Index of correct answer (42)
      explanation: 'The differences are 4, 6, 8, 10, so next difference is 12. 30 + 12 = 42'
    }
  ];

  for (const question of aptitudeQuestions) {
    await prisma.question.upsert({
      where: { id: `apt-${question.title.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `apt-${question.title.toLowerCase().replace(/\s+/g, '-')}`,
        ...question
      }
    });
  }

  // Create sample interview questions
  const interviewQuestions = [
    {
      type: 'INTERVIEW' as const,
      title: 'JavaScript Closures',
      statement: 'Explain the concept of closures in JavaScript and provide a practical example.',
      expectedDuration: 180,
      tips: [
        'Start with a clear definition',
        'Provide a code example',
        'Explain the practical benefits'
      ]
    },
    {
      type: 'INTERVIEW' as const,
      title: 'Challenging Project',
      statement: 'Tell me about a challenging project you worked on and how you overcame the difficulties.',
      expectedDuration: 200,
      tips: [
        'Use the STAR method (Situation, Task, Action, Result)',
        'Be specific about your role',
        'Focus on the learning outcomes'
      ]
    }
  ];

  for (const question of interviewQuestions) {
    await prisma.question.upsert({
      where: { id: `int-${question.title.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `int-${question.title.toLowerCase().replace(/\s+/g, '-')}`,
        ...question
      }
    });
  }

  // Create sample assessment
  const assessment = await prisma.assessment.upsert({
    where: { id: 'full-stack-assessment' },
    update: {},
    create: {
      id: 'full-stack-assessment',
      title: 'Full Stack Developer Assessment',
      description: 'Comprehensive assessment covering DSA, aptitude, and interview skills',
      type: 'FULL',
      duration: 120, // 2 hours
      createdById: recruiter.id
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Admin: admin@techhire.com / Admin123!`);
  console.log(`👤 Recruiter: recruiter@techhire.com / Recruiter123!`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });