// src/components/ModuleAccordion.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, CheckCircle } from 'lucide-react';

const ModuleAccordion = ({ modules, currentModule, onModuleSelect, onLessonSelect }) => {
  const [expandedModules, setExpandedModules] = useState(new Set([currentModule?.id]));

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {modules.map((module) => {
        const isExpanded = expandedModules.has(module.id);
        const isActive = currentModule?.id === module.id;
        
        return (
          <div 
            key={module.id}
            className={`border rounded-lg transition-colors duration-200 ${
              isActive ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
            }`}
          >
            {/* Module Header */}
            <button
              onClick={() => {
                toggleModule(module.id);
                onModuleSelect?.(module);
              }}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  isActive ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <BookOpen className={`w-5 h-5 ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {module.description}
                  </p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Lessons List */}
            {isExpanded && module.lessons && (
              <div className="border-t">
                {module.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => onLessonSelect?.(module, lesson)}
                    className="w-full p-4 flex items-center space-x-3 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <div className="flex-shrink-0">
                      {lesson.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      )}
                    </div>
                    <div className="flex-grow text-left">
                      <h4 className="text-sm font-medium text-gray-900">
                        {lesson.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {lesson.duration} min
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ModuleAccordion;