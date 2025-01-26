import { useParams, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { useCourseDetails } from '../hooks/useCourses';
import { useAuth } from '../contexts/AuthContext';
import ModuleAccordion from '../components/ModuleAccordion';
import LessonViewer from '../components/LessonViewer';
import TestVideoPlayer from '../components/TestVideoPlayer';
import { ChevronRight } from 'lucide-react';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { course, modules, loading, error, updateLessonProgress } = useCourseDetails(courseId);
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Get current module and lesson from URL params
  const currentModuleId = searchParams.get('moduleId');
  const currentLessonId = searchParams.get('lessonId');

  // Find current module and lesson objects
  const currentModule = modules.find(m => m.id === currentModuleId);
  const currentLesson = currentModule?.lessons?.find(l => l.id === currentLessonId);

  const handleModuleSelect = (module) => {
    setSearchParams({ moduleId: module.id });
  };

  const handleLessonSelect = (module, lesson) => {
    setSearchParams({ moduleId: module.id, lessonId: lesson.id });
  };

  const handleLessonComplete = async (moduleId, lessonId) => {
    await updateLessonProgress(moduleId, lessonId, true);
  };

  const handleProgressUpdate = async (moduleId, lessonId, progressData) => {
    console.log('Progress update:', { moduleId, lessonId, progressData });
  };

  const handleQuizAccess = () => {
    navigate('/admin/quiz-testing');
  };

  const findAdjacentLesson = (direction) => {
    const allLessons = modules.flatMap(module => 
      module.lessons.map(lesson => ({
        ...lesson,
        moduleId: module.id,
        moduleTitle: module.title
      }))
    );

    const currentIndex = allLessons.findIndex(lesson => 
      lesson.id === currentLessonId && lesson.moduleId === currentModuleId
    );

    if (direction === 'next' && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      return { moduleId: nextLesson.moduleId, lessonId: nextLesson.id };
    }

    if (direction === 'previous' && currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      return { moduleId: prevLesson.moduleId, lessonId: prevLesson.id };
    }

    return null;
  };

  const handleNextLesson = () => {
    const next = findAdjacentLesson('next');
    if (next) {
      setSearchParams(next);
    }
  };

  const handlePreviousLesson = () => {
    const prev = findAdjacentLesson('previous');
    if (prev) {
      setSearchParams(prev);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !course) {
    return <Navigate to="/dashboard" replace />;
  }

  const isPublished = course.status === 'published';

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {!isPublished && isAdmin && (
          <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This course is in {course.status} mode. Only administrators can view it.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Quiz Management Button */}
        {isAdmin && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleQuizAccess}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Manage Quizzes
            </button>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <span>{course.title}</span>
            </li>
            {currentModule && (
              <>
                <ChevronRight className="w-4 h-4" />
                <li>
                  <span>{currentModule.title}</span>
                </li>
              </>
            )}
            {currentLesson && (
              <>
                <ChevronRight className="w-4 h-4" />
                <li>
                  <span>{currentLesson.title}</span>
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Module Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Course Content</h2>
                {modules.length > 0 ? (
                  <ModuleAccordion
                    modules={modules}
                    currentModule={currentModule}
                    onModuleSelect={handleModuleSelect}
                    onLessonSelect={handleLessonSelect}
                  />
                ) : (
                  <p className="text-gray-600">No modules available yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Lesson Content Area */}
          <div className="lg:col-span-2">
            <LessonViewer
              course={course}
              currentModule={currentModule}
              currentLesson={currentLesson}
              onComplete={handleLessonComplete}
              onNext={handleNextLesson}
              onPrevious={handlePreviousLesson}
              onProgressUpdate={handleProgressUpdate}
            />
          </div>
        </div>
      </div>
      <TestVideoPlayer />
    </>
  );
};

export default CourseDetail;