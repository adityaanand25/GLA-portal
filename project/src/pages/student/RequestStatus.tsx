import { useState, useEffect } from 'react';
import { Clock, Check, X, ArrowRight, FileText, CreditCard } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { useAuth } from '../../hooks/useAuth';

type Request = {
  id: string;
  type: 'complaint' | 'idcard' | 'course';
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
  response?: string;
};

const RequestStatus = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Simulate API call
    const loadRequests = async () => {
      setIsLoading(true);
      
      // Mock data
      setTimeout(() => {
        const mockRequests: Request[] = [
          {
            id: '1',
            type: 'complaint',
            title: 'Wi-Fi connectivity issues in Library',
            description: 'The Wi-Fi in the main library has been unstable for the past week.',
            status: 'In Progress',
            createdAt: '2025-04-10T14:30:00Z',
            updatedAt: '2025-04-12T09:15:00Z',
            response: 'Our IT team is investigating the issue. We have identified a potential hardware problem with one of the routers.',
          },
          {
            id: '2',
            type: 'idcard',
            title: 'ID Card Replacement',
            description: 'Lost my student ID card and need a replacement.',
            status: 'Pending',
            createdAt: '2025-04-14T10:45:00Z',
            updatedAt: '2025-04-14T10:45:00Z',
          },
          {
            id: '3',
            type: 'course',
            title: 'Course Enrollment - Data Structures',
            description: 'Enrollment in CS201: Data Structures and Algorithms',
            status: 'Resolved',
            createdAt: '2025-04-05T08:20:00Z',
            updatedAt: '2025-04-06T11:30:00Z',
            response: 'Your enrollment has been confirmed. The course will appear in your schedule within 24 hours.',
          },
          {
            id: '4',
            type: 'complaint',
            title: 'Cafeteria Food Quality',
            description: 'The quality of food in the main cafeteria has deteriorated over the past month.',
            status: 'Rejected',
            createdAt: '2025-04-02T16:10:00Z',
            updatedAt: '2025-04-04T13:25:00Z',
            response: 'After investigation, we found that the food quality meets all university standards. However, we have shared your feedback with the catering service.',
          },
        ];
        
        setRequests(mockRequests);
        setIsLoading(false);
      }, 1000);
    };

    loadRequests();
  }, []);

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    if (filter === 'pending') return request.status === 'Pending' || request.status === 'In Progress';
    if (filter === 'resolved') return request.status === 'Resolved';
    if (filter === 'rejected') return request.status === 'Rejected';
    return request.type === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'In Progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'Resolved':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'Rejected':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'complaint':
        return <FileText className="h-5 w-5 text-gray-500" />;
      case 'idcard':
        return <CreditCard className="h-5 w-5 text-gray-500" />;
      case 'course':
        return <ArrowRight className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Request Status</h1>
        <Select
          className="w-full md:w-48"
          options={[
            { value: 'all', label: 'All Requests' },
            { value: 'pending', label: 'Pending' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'complaint', label: 'Complaints' },
            { value: 'idcard', label: 'ID Cards' },
            { value: 'course', label: 'Course Enrollment' },
          ]}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Card>
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading your requests...</p>
          </div>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? "You don't have any requests yet." 
                : `You don't have any ${filter} requests.`}
            </p>
            {filter !== 'all' && (
              <Button className="mt-4" variant="outline" onClick={() => setFilter('all')}>
                View all requests
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id}>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  {getTypeIcon(request.type)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{request.status}</span>
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Submitted on {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{request.description}</p>
                  
                  {request.response && (
                    <div className="mt-4 bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-gray-800">Response:</h4>
                      <p className="mt-1 text-sm text-gray-600">{request.response}</p>
                      <div className="mt-1 text-xs text-gray-500">
                        Updated on {new Date(request.updatedAt).toLocaleDateString()} at {new Date(request.updatedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                  
                  {request.status === 'Pending' && (
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">Cancel Request</Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestStatus;