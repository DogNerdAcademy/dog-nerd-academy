// src/utils/seedData.js

// Mock data without Firebase dependencies
const mockCourseData = {
  id: 'dog-training-101',
  title: 'Dog Training 101',
  description: 'Learn the fundamentals of positive reinforcement dog training',
  difficulty: 'Beginner',
  orderIndex: 1,
  status: 'published',
  modules: [
    {
      id: 'getting-started-module',
      title: 'Getting Started with Dog Training',
      description: 'Learn the basics of positive reinforcement training',
      orderIndex: 1,
      status: 'published',
      lessons: [
        {
          id: 'intro-to-clicker-training',
          title: 'Introduction to Clicker Training',
          description: 'Learn how to use a clicker effectively in dog training',
          orderIndex: 1,
          type: 'video',
          status: 'published',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          lastPlaybackTime: 0,
          videoDuration: 0,
          watchedPercentage: 0,
          content: `
            <h2>Introduction to Clicker Training</h2>
            <p>In this lesson, you'll learn:</p>
            <ul>
              <li>What is a clicker and why use it</li>
              <li>Basic clicker timing</li>
              <li>Common mistakes to avoid</li>
            </ul>
            <p>Watch the video above, then practice with your dog!</p>
          `
        }
      ]
    }
  ]
};

export const seedDatabase = async () => {
  return mockCourseData;
};

export const seedVideoLesson = async () => {
  return mockCourseData.modules[0].lessons[0];
};