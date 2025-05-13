import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Download, Calendar, Clock, Tag, CheckSquare } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { WorkLog, User } from '../../types';
import { formatTime, calculateTotalTime, getMoodEmoji } from '../../utils/helpers';
import MarkdownRender from './MarkdownRender';

interface WorkLogDetailProps {
  workLog: WorkLog;
  user?: User;
  isManager?: boolean;
  onReview?: (reviewed: boolean, notes?: string) => Promise<void>;
  onExport?: (format: 'pdf' | 'csv') => Promise<void>;
}

const WorkLogDetail: React.FC<WorkLogDetailProps> = ({
  workLog,
  user,
  isManager = false,
  onReview,
  onExport,
}) => {
  const [reviewNotes, setReviewNotes] = React.useState(workLog.reviewNotes || '');
  const [isReviewing, setIsReviewing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  
  const totalTime = calculateTotalTime(workLog.tasks);
  
  const handleReview = async () => {
    if (onReview) {
      setIsSaving(true);
      try {
        await onReview(true, reviewNotes);
        setIsReviewing(false);
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  const handleExport = async (format: 'pdf' | 'csv') => {
    if (onExport) {
      await onExport(format);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Work Log: {new Date(workLog.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h1>
          {user && (
            <p className="text-gray-500 mt-1">
              {user.name} · {formatTime(totalTime)} logged
            </p>
          )}
        </div>
        
        <div className="flex space-x-3">
          {onExport && (
            <div className="relative inline-block text-left">
              <Button
                variant="outline"
                icon={<Download size={16} />}
                onClick={() => handleExport('pdf')}
              >
                Export PDF
              </Button>
            </div>
          )}
          
          {!isManager && (
            <Link to={`/logs/edit/${workLog.id}`}>
              <Button variant="primary" icon={<Edit size={16} />}>
                Edit
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-100 text-indigo-700 rounded-full h-14 w-14 flex items-center justify-center text-xl">
              {getMoodEmoji(workLog.mood)}
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">Daily Mood</h2>
              <p className="text-gray-500">
                {workLog.mood === 1 && 'Very Frustrated'}
                {workLog.mood === 2 && 'Struggling'}
                {workLog.mood === 3 && 'Neutral'}
                {workLog.mood === 4 && 'Good'}
                {workLog.mood === 5 && 'Excellent'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-md">
              <Calendar size={20} className="mx-auto text-gray-500 mb-1" />
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">
                {new Date(workLog.date).toLocaleDateString()}
              </p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-md">
              <Clock size={20} className="mx-auto text-gray-500 mb-1" />
              <p className="text-sm text-gray-500">Time Logged</p>
              <p className="font-medium">{formatTime(totalTime)}</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-md">
              <CheckSquare size={20} className="mx-auto text-gray-500 mb-1" />
              <p className="text-sm text-gray-500">Tasks</p>
              <p className="font-medium">{workLog.tasks.length}</p>
            </div>
          </div>
          
          {workLog.blockers && (
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-2">Blockers</h3>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-md text-amber-800">
                {workLog.blockers}
              </div>
            </div>
          )}
          
          {workLog.notes && (
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">Notes</h3>
              <div className="prose max-w-none">
                <MarkdownRender content={workLog.notes} />
              </div>
            </div>
          )}
        </Card>
        
        <div className="space-y-6">
          {isManager && !isReviewing && (
            <Card className={`border-l-4 ${workLog.reviewed ? 'border-green-500' : 'border-amber-500'}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-md font-medium text-gray-900">Review Status</h3>
                {!workLog.reviewed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReviewing(true)}
                  >
                    Add Review
                  </Button>
                )}
              </div>
              
              {workLog.reviewed ? (
                <div>
                  <p className="text-green-600 font-medium">Reviewed ✓</p>
                  {workLog.reviewNotes && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                      {workLog.reviewNotes}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-amber-600">Not yet reviewed</p>
              )}
            </Card>
          )}
          
          {isManager && isReviewing && (
            <Card title="Add Review">
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add feedback or notes..."
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              ></textarea>
              
              <div className="mt-4 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReviewing(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  variant="primary"
                  loading={isSaving}
                  onClick={handleReview}
                >
                  Submit Review
                </Button>
              </div>
            </Card>
          )}
          
          <Card title="Tasks">
            <div className="space-y-4">
              {workLog.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 border rounded-md ${task.completed ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      {task.description && (
                        <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                      )}
                    </div>
                    
                    <div className="ml-4 flex flex-col items-end">
                      <span className="text-sm font-medium text-gray-900">
                        {formatTime(task.timeSpent)}
                      </span>
                      <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${task.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {task.completed ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                  
                  {task.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {task.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          <Tag size={12} className="mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkLogDetail;