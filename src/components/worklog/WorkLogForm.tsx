import React, { useState, useEffect } from 'react';
import { Trash2, Plus, XCircle } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import { Task, WorkLog } from '../../types';
import { formatTime, calculateTotalTime, generateId } from '../../utils/helpers';
import MarkdownEditor from './MarkdownEditor';

interface WorkLogFormProps {
  initialData?: WorkLog;
  onSubmit: (data: Omit<WorkLog, 'id'> | WorkLog) => Promise<void>;
  isSubmitting: boolean;
}

const WorkLogForm: React.FC<WorkLogFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [blockers, setBlockers] = useState('');
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setMood(initialData.mood);
      setTasks(initialData.tasks);
      setBlockers(initialData.blockers || '');
      setNotes(initialData.notes || '');
    }
  }, [initialData]);
  
  const addTask = () => {
    const newTask: Task = {
      id: generateId(),
      title: '',
      description: '',
      timeSpent: 0,
      tags: [],
      completed: false,
    };
    
    setTasks([...tasks, newTask]);
  };
  
  const updateTask = (index: number, field: keyof Task, value: any) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setTasks(updatedTasks);
  };
  
  const removeTask = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (tasks.length === 0) {
      alert('Please add at least one task');
      return;
    }
    
    if (tasks.some(task => !task.title)) {
      alert('All tasks must have a title');
      return;
    }
    
    // Create log data for submission
    const logData: Omit<WorkLog, 'id'> = {
      userId: initialData?.userId || '', // Should be set on the server or from auth context
      date,
      tasks,
      mood,
      blockers: blockers.trim() || undefined,
      notes: notes.trim() || undefined,
      reviewed: initialData?.reviewed || false,
      reviewedBy: initialData?.reviewedBy,
      reviewNotes: initialData?.reviewNotes,
    };

    //Trigger notification 
const handleSubmit = async () => {
  const response = await submitWorkLog(logData);
  await notifyManagerOnLogSubmission(response.data.id, managerId);
};
    //tg notification
    
    // If editing, include the ID
    const submitData = initialData?.id
      ? { ...logData, id: initialData.id }
      : logData;
    
    await onSubmit(submitData);
  };
  
  const totalTime = calculateTotalTime(tasks);
  
  const renderMoodSelector = () => {
    const moods: { value: 1 | 2 | 3 | 4 | 5; emoji: string; label: string }[] = [
      { value: 1, emoji: '😞', label: 'Very Frustrated' },
      { value: 2, emoji: '😕', label: 'Struggling' },
      { value: 3, emoji: '😐', label: 'Neutral' },
      { value: 4, emoji: '🙂', label: 'Good' },
      { value: 5, emoji: '😀', label: 'Excellent' },
    ];
    
    return (
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How was your day?
        </label>
        <div className="flex space-x-4">
          {moods.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={`
                p-3 flex flex-col items-center justify-center rounded-md transition-all
                ${mood === m.value 
                  ? 'bg-indigo-100 border-2 border-indigo-500 ring-2 ring-indigo-200' 
                  : 'bg-white border border-gray-300 hover:bg-gray-50'}
              `}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs mt-1">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          
          <div>
            <p className="block text-sm font-medium text-gray-700">
              Total Time: <span className="font-semibold">{formatTime(totalTime)}</span>
            </p>
          </div>
        </div>
        
        {renderMoodSelector()}
      </Card>
      
      <Card
        title="Tasks"
        subtitle="What did you work on today?"
        headerAction={
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Plus size={16} />}
            onClick={addTask}
          >
            Add Task
          </Button>
        }
      >
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tasks added yet. Add your first task to start logging your work.</p>
            <Button
              type="button"
              variant="primary"
              className="mt-4"
              icon={<Plus size={16} />}
              onClick={addTask}
            >
              Add Task
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="p-4 border border-gray-200 rounded-md bg-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <Input
                    label="Task Title"
                    value={task.title}
                    onChange={(e) => updateTask(index, 'title', e.target.value)}
                    placeholder="What did you work on?"
                    required
                  />
                  
                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={task.description}
                    onChange={(e) => updateTask(index, 'description', e.target.value)}
                    placeholder="Add details about the task..."
                    rows={2}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    type="number"
                    label="Time Spent (minutes)"
                    value={task.timeSpent}
                    onChange={(e) => updateTask(index, 'timeSpent', parseInt(e.target.value, 10) || 0)}
                    min={0}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={task.tags.join(', ')}
                        onChange={(e) => {
                          const tagsInput = e.target.value;
                          const tagArray = tagsInput
                            .split(',')
                            .map((tag) => tag.trim())
                            .filter((tag) => tag.length > 0);
                          updateTask(index, 'tags', tagArray);
                        }}
                        placeholder="frontend, bugfix, etc."
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    id={`task-completed-${index}`}
                    checked={task.completed}
                    onChange={(e) => updateTask(index, 'completed', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`task-completed-${index}`}
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Task completed
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      <Card title="Blockers" subtitle="Any issues or roadblocks that prevented your progress?">
        <textarea
          value={blockers}
          onChange={(e) => setBlockers(e.target.value)}
          placeholder="Describe any blockers or challenges..."
          rows={3}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        ></textarea>
      </Card>
      
      <Card title="Notes" subtitle="Any additional thoughts or reflections?">
        <MarkdownEditor 
          value={notes} 
          onChange={setNotes} 
        />
      </Card>
      
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {initialData ? 'Update Work Log' : 'Create Work Log'}
        </Button>
      </div>
    </form>
  );
};

export default WorkLogForm;
