import { useState, useEffect } from 'react';
import { Search, MessageSquare, Check, X, Reply } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import TextArea from '../../components/ui/TextArea';
import { Complaint } from '../../types';
import { useForm } from 'react-hook-form';

const mockComplaints: Complaint[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Wi-Fi connectivity issues in Library',
    description: 'The Wi-Fi in the main library has been unstable for the past week. It keeps disconnecting every few minutes making it difficult to complete research work.',
    category: 'IT',
    status: 'Pending',
    createdAt: '2025-04-15T14:30:00Z',
  },
  {
    id: '2',
    userId: 'user2',
    title: 'Cafeteria food quality concern',
    description: 'The quality of food in the main cafeteria has noticeably deteriorated over the past month. Items are often cold and portion sizes have decreased.',
    category: 'Service',
    status: 'In Progress',
    createdAt: '2025-04-14T10:45:00Z',
    response: 'We are investigating this with our catering service provider. Thank you for bringing this to our attention.',
  },
  {
    id: '3',
    userId: 'user3',
    title: 'Classroom projector malfunction',
    description: 'The projector in Room 305 is not working properly. The colors are distorted and sometimes it shuts off in the middle of presentations.',
    category: 'IT',
    status: 'Resolved',
    createdAt: '2025-04-10T09:15:00Z',
    resolvedAt: '2025-04-12T11:30:00Z',
    response: 'The projector has been replaced with a new unit. Please let us know if you experience any further issues.',
  },
  {
    id: '4',
    userId: 'user4',
    title: 'Library noise level',
    description: 'The quiet study area in the library is consistently noisy due to a group of students who gather there to discuss group projects.',
    category: 'Other',
    status: 'Pending',
    createdAt: '2025-04-13T16:20:00Z',
  },
  {
    id: '5',
    userId: 'user5',
    title: 'Course registration system error',
    description: 'I keep getting an error message when trying to register for MATH301. The system shows the course is available but won\'t allow me to add it.',
    category: 'IT',
    status: 'In Progress',
    createdAt: '2025-04-09T11:45:00Z',
    response: 'Our IT team is looking into this issue. We\'ll update you within 24 hours.',
  },
];

type FormData = {
  response: string;
  status: string;
};

const ComplaintResolution = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setComplaints(mockComplaints);
      setFilteredComplaints(mockComplaints);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = [...complaints];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        complaint => 
          complaint.title.toLowerCase().includes(searchTerm) ||
          complaint.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(complaint => complaint.category === filters.category);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(complaint => complaint.status === filters.status);
    }

    setFilteredComplaints(filtered);
  }, [filters, complaints]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleReplyToComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsReplyModalOpen(true);
    reset({
      response: complaint.response || '',
      status: complaint.status,
    });
  };

  const onSubmit = (data: FormData) => {
    if (!selectedComplaint) return;
    
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      const now = new Date().toISOString();
      const updatedComplaint: Complaint = {
        ...selectedComplaint,
        status: data.status as 'Pending' | 'In Progress' | 'Resolved',
        response: data.response,
        ...(data.status === 'Resolved' ? { resolvedAt: now } : {}),
      };
      
      setComplaints(complaints.map(c => c.id === selectedComplaint.id ? updatedComplaint : c));
      setIsProcessing(false);
      setIsReplyModalOpen(false);
      
      setSuccessMessage(`Complaint "${selectedComplaint.title}" has been updated successfully.`);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }, 1000);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'IT':
        return 'bg-blue-100 text-blue-800';
      case 'Service':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-indigo-100 text-indigo-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Complaint Resolution</h1>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">
          {complaints.filter(c => c.status !== 'Resolved').length} open complaints
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-start">
          <div className="flex-shrink-0">
            <Check className="h-5 w-5 text-green-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              name="search"
              placeholder="Search complaints by title or description"
              className="pl-10"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Categories' },
                { value: 'IT', label: 'IT' },
                { value: 'Service', label: 'Service' },
                { value: 'Other', label: 'Other' },
              ]}
            />
            <Select
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'Pending', label: 'Pending' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Resolved', label: 'Resolved' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Complaints List */}
      <Card>
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No complaints found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <div key={complaint.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900">{complaint.title}</h3>
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeClass(complaint.category)}`}
                        >
                          {complaint.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Submitted on {new Date(complaint.createdAt).toLocaleDateString()} at {new Date(complaint.createdAt).toLocaleTimeString()}
                      </p>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">{complaint.description}</p>
                      </div>
                      
                      {complaint.response && (
                        <div className="mt-4 bg-gray-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-gray-800">Response:</h4>
                          <p className="mt-1 text-sm text-gray-600">{complaint.response}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(complaint.status)}`}
                      >
                        {complaint.status}
                      </span>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-300"
                          icon={<Reply className="h-4 w-4" />}
                          onClick={() => handleReplyToComplaint(complaint)}
                        >
                          {complaint.response ? 'Update Response' : 'Respond'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Reply Modal */}
      {isReplyModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsReplyModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Respond to Complaint
                    </h3>
                    <div className="mt-4">
                      <div className="mb-4">
                        <h4 className="text-base font-medium text-gray-800">{selectedComplaint.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeClass(selectedComplaint.category)}`}
                          >
                            {selectedComplaint.category}
                          </span>
                          <span className="text-sm text-gray-500">
                            Submitted on {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{selectedComplaint.description}</p>
                      </div>
                      
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <TextArea
                          label="Your Response"
                          rows={4}
                          placeholder="Type your response to this complaint..."
                          {...register('response', {
                            required: 'A response is required',
                            minLength: {
                              value: 10,
                              message: 'Response should be at least 10 characters',
                            },
                          })}
                          error={errors.response?.message}
                        />
                        
                        <div className="mt-4">
                          <Select
                            label="Update Status"
                            {...register('status')}
                            options={[
                              { value: 'Pending', label: 'Pending' },
                              { value: 'In Progress', label: 'In Progress' },
                              { value: 'Resolved', label: 'Resolved' },
                            ]}
                          />
                        </div>
                        
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <Button
                            type="submit"
                            variant="primary"
                            className="w-full sm:w-auto sm:ml-3"
                            isLoading={isProcessing}
                          >
                            Submit Response
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-3 sm:mt-0 sm:w-auto"
                            onClick={() => setIsReplyModalOpen(false)}
                            disabled={isProcessing}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintResolution;