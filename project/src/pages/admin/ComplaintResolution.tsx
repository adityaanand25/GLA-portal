import { useState, useEffect } from 'react';
import { Socket, io } from 'socket.io-client';
import { Search, MessageSquare, Check, Reply } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import TextArea from '../../components/ui/TextArea';
import { Complaint } from '../../types';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

let socket: Socket | null = null;

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
    const fetchComplaints = async () => {
      try {
        const res = await fetch('http://127.0.0.1:3000/api/complaints');
        if (!res.ok) throw new Error('Failed to fetch complaints');
        
        const data = await res.json();
        const mappedComplaints = data.map((c: any) => ({
          id: c.id.toString(),
          userId: c.student_id,
          studentName: c.student_name,
          title: c.title,
          description: c.description,
          category: c.category,
          status: c.status,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          resolvedAt: c.resolved_at,
          response: c.response
        }));
        
        setComplaints(mappedComplaints);
        setFilteredComplaints(mappedComplaints);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load complaints');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();

    // Initialize socket connection
    if (!socket) {
      socket = io('http://localhost:3000', {
        transports: ['websocket'],
        autoConnect: true
      });

      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socket.on('new_complaint', (newComplaint) => {
        setComplaints(prev => [{
          id: newComplaint.id.toString(),
          userId: newComplaint.studentId,
          studentName: newComplaint.studentName,
          title: newComplaint.title,
          description: newComplaint.description,
          category: newComplaint.category,
          status: newComplaint.status,
          createdAt: newComplaint.createdAt,
          response: null,
          resolvedAt: null
        }, ...prev]);
        
        toast.success('New complaint received');
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  useEffect(() => {
    let filtered = [...complaints];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        complaint => 
          complaint.title.toLowerCase().includes(searchTerm) ||
          complaint.description.toLowerCase().includes(searchTerm) ||
          complaint.studentName.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(complaint => complaint.category === filters.category);
    }

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

  const onSubmit = async (data: FormData) => {
    if (!selectedComplaint) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch(`http://127.0.0.1:3000/api/complaints/${selectedComplaint.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response: data.response,
          status: data.status,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update complaint');
      }

      const { updated_at } = await res.json();
      
      setComplaints(prev => prev.map(c => 
        c.id === selectedComplaint.id 
          ? {
              ...c,
              status: data.status as 'Pending' | 'In Progress' | 'Resolved',
              response: data.response,
              updatedAt: updated_at,
              ...(data.status === 'Resolved' ? { resolvedAt: updated_at } : {})
            }
          : c
      ));

      setIsProcessing(false);
      setIsReplyModalOpen(false);
      
      toast.success('Response submitted successfully');
      setSuccessMessage(`Complaint "${selectedComplaint.title}" has been updated successfully.`);
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit response');
    } finally {
      setIsProcessing(false);
    }
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