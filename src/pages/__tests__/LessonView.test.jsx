// src/pages/__tests__/LessonView.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { doc, getDoc } from 'firebase/firestore';
import LessonView from '../LessonView';
import { AuthContext } from '../../contexts/AuthContext';
import useContentProgress from '../../hooks/useContentProgress';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn()
}));

// Mock UI components
/* vi.mock('../../components/ui/alert', () => ({
  Alert: ({ children, className }) => (
    <div data-testid="alert" className={className}>
      {children}
    </div>
  ),
  AlertDescription: ({ children }) => (
    <div data-testid="alert-description">{children}</div>
  )
}));

vi.mock('../../components/ui/card', () => ({
  Card: ({ children }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children, className }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  )
})); */

// Mock custom hooks
vi.mock('../../hooks/useContentProgress');

// Mock content components
vi.mock('../../components/content/VideoPlayer', () => ({
  default: ({ onProgress }) => (
    <div data-testid="video-player">
      <button 
        onClick={() => onProgress({ watchedPercentage: 95 })}
        data-testid="complete-video"
      >
        Complete Video
      </button>
    </div>
  )
}));

vi.mock('../../components/content/QuizComponent', () => ({
  default: ({ onComplete }) => (
    <div data-testid="quiz-component">
      <button 
        onClick={() => onComplete({ score: 85 })}
        data-testid="complete-quiz"
      >
        Complete Quiz
      </button>
    </div>
  )
}));

vi.mock('../../components/content/ContentProgressTracker', () => ({
  default: ({ onProgressUpdate }) => (
    <div data-testid="progress-tracker">
      Progress Tracker
    </div>
  )
}));

// Test data
const mockLesson = {
  id: 'lesson1',
  title: 'Test Lesson',
  description: 'Test Description',
  moduleId: 'module1',
  videoUrl: 'https://example.com/video',
  type: 'video'
};

const mockModule = {
  id: 'module1',
  title: 'Test Module',
  nextLessonId: 'lesson2'
};

const mockProgress = {
  type: 'video',
  watchedPercentage: 0,
  lastPlaybackTime: 0,
  completed: false,
  score: null
};

// Test setup helper
const renderLessonView = () => {
  const mockUser = { uid: 'user1' };

  return {
    ...render(
      <MemoryRouter initialEntries={['/lessons/lesson1']}>
        <AuthContext.Provider value={{ currentUser: mockUser }}>
          <Routes>
            <Route path="/lessons/:lessonId" element={<LessonView />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    )
  };
};

describe('LessonView', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    getDoc.mockImplementation(async (docRef) => ({
      exists: () => true,
      data: () => {
        if (docRef.id === 'lesson1') return mockLesson;
        if (docRef.id === 'module1') return mockModule;
        return null;
      }
    }));

    useContentProgress.mockReturnValue({
      progress: mockProgress,
      loading: false,
      error: null,
      updateVideoProgress: vi.fn(),
      updateQuizProgress: vi.fn(),
      resetError: vi.fn()
    });
  });

  test('renders lesson content correctly', async () => {
    renderLessonView();

    await waitFor(() => {
      expect(screen.getByText('Test Lesson')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
      expect(screen.getByTestId('progress-tracker')).toBeInTheDocument();
    });
  });

  test('handles video completion and switches to quiz', async () => {
    renderLessonView();

    await waitFor(() => {
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
    });

    const completeVideoButton = screen.getByTestId('complete-video');
    fireEvent.click(completeVideoButton);

    await waitFor(() => {
      expect(screen.getByTestId('quiz-component')).toBeInTheDocument();
    });
  });

  test('completes full lesson flow', async () => {
    const updateVideoProgress = vi.fn();
    const updateQuizProgress = vi.fn();
    
    useContentProgress.mockReturnValue({
      progress: mockProgress,
      loading: false,
      error: null,
      updateVideoProgress,
      updateQuizProgress,
      resetError: vi.fn()
    });

    renderLessonView();

    // Wait for video player
    await waitFor(() => {
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
    });

    // Complete video
    const completeVideoButton = screen.getByTestId('complete-video');
    fireEvent.click(completeVideoButton);

    // Verify video progress update
    expect(updateVideoProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        watchedPercentage: 95
      })
    );

    // Wait for quiz to appear
    await waitFor(() => {
      expect(screen.getByTestId('quiz-component')).toBeInTheDocument();
    });

    // Complete quiz
    const completeQuizButton = screen.getByTestId('complete-quiz');
    fireEvent.click(completeQuizButton);

    // Verify quiz progress update
    expect(updateQuizProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        completed: true,
        score: 85
      })
    );
  });

  test('handles errors gracefully', async () => {
    getDoc.mockRejectedValueOnce(new Error('Failed to load lesson'));
    
    renderLessonView();

    await waitFor(() => {
      expect(screen.getByText('Failed to load lesson')).toBeInTheDocument();
    });
  });

  test('can dismiss error message', async () => {
    getDoc.mockRejectedValueOnce(new Error('Failed to load lesson'));
    
    renderLessonView();

    await waitFor(() => {
      expect(screen.getByText('Failed to load lesson')).toBeInTheDocument();
    });

    const dismissButton = screen.getByText('Dismiss');
    fireEvent.click(dismissButton);

    expect(screen.queryByText('Failed to load lesson')).not.toBeInTheDocument();
  });

  test('shows loading state', async () => {
    useContentProgress.mockReturnValueOnce({
      ...useContentProgress(),
      loading: true
    });

    renderLessonView();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('handles non-existent lesson', async () => {
    getDoc.mockImplementationOnce(async () => ({
      exists: () => false,
      data: () => null
    }));

    renderLessonView();

    await waitFor(() => {
      expect(screen.getByText('Lesson not found')).toBeInTheDocument();
    });
  });
});