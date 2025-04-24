import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Check, AlertCircle, Send } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Select from '../../components/ui/Select';
import { Complaint } from '../../types';

type FormData = {
  title: string;
  category: string;
  description: string;
};

const ComplaintSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: '1',
      userId: 'user1',
      title: 'Wi-Fi connectivity issues in Library',
      description: 'The Wi-Fi in the main library has been unstable for the past week.',
      category: 'IT',
      status: 'Pending',
      createdAt: '2025-04-10T14:30:00Z',
    },
  ]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      category: '',
      description: '',
    },
  });

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newComplaint: Complaint = {
        id: Math.random().toString(36).substring(2, 9),
        userId: 'user1',
        title: data.title,
        description: data.description,
        category: data.category as 'IT' | 'Service' | 'Other',
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      
      setComplaints([newComplaint, ...complaints]);
      setSuccessMessage('Your complaint has been submitted successfully.');
      reset();
      setIsSubmitting(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Submit a Complaint</h1>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-start">
          <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Complaint Form */}
        <div className="lg:col-span-2">
          <Card title="New Complaint">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Title"
                placeholder="Brief title of your complaint"
                {...register('title', {
                  required: 'Title is required',
                  minLength: {
                    value: 5,
                    message: 'Title should be at least 5 characters long',
                  },
                })}
                error={errors.title?.message}
              />

              <Select
                label="Category"
                options={[
                  { value: '', label: 'Select a category' },
                  { value: 'IT', label: 'IT Services' },
                  { value: 'Service', label: 'General Services' },
                  { value: 'Other', label: 'Other' },
                ]}
                {...register('category', {
                  required: 'Please select a category',
                })}
                error={errors.category?.message}
              />

              <TextArea
                label="Description"
                placeholder="Please provide detailed information about your complaint"
                rows={5}
                {...register('description', {
                  required: 'Description is required',
                  minLength: {
                    value: 20,
                    message: 'Description should be at least 20 characters long',
                  },
                })}
                error={errors.description?.message}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  icon={<Send className="h-4 w-4" />}
                >
                  Submit Complaint
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Guidelines */}
        <div>
          <Card title="Guidelines" className="bg-blue-50 border-blue-100">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-blue-800">Submission Tips</h3>
                <ul className="mt-2 pl-5 text-sm text-blue-700 list-disc space-y-1">
                  <li>Be specific and factual in your description</li>
                  <li>Include location, date, and time of incident</li>
                  <li>Avoid using offensive or inappropriate language</li>
                  <li>Provide any relevant reference numbers or IDs</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-blue-800">Processing Time</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Complaints are typically processed within 2-3 business days. Urgent matters may be addressed sooner.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-blue-800">Need Immediate Assistance?</h3>
                <p className="mt-1 text-sm text-blue-700">
                  For urgent matters requiring immediate attention, please contact the help desk at 555-123-4567.
                </p>
              </div>

              <div className="bg-blue-100 p-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <p className="text-sm text-blue-700">
                  All complaints are handled with confidentiality and in accordance with university policies.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Complaints */}
      <Card title="Your Recent Complaints">
        {complaints.length === 0 ? (
          <p className="text-gray-500 text-center py-4">You haven't submitted any complaints yet.</p>
        ) : (
          <div className="divide-y divide-gray-200">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-gray-900">{complaint.title}</h3>
                  <span 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                        complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}
                  >
                    {complaint.status}
                  </span>
                </div>
                <div className="mt-1 flex flex-col sm:flex-row sm:justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Category:</span> {complaint.category}
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Submitted:</span> {new Date(complaint.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{complaint.description}</p>
                {complaint.response && (
                  <div className="mt-2 bg-gray-50 p-2 rounded-md">
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">Response:</span> {complaint.response}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ComplaintSubmission;