import { useState, useEffect } from 'react';
import { Check, X, Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import TextArea from '../../components/ui/TextArea';
import { format, differenceInDays } from 'date-fns';
import { io } from 'socket.io-client';

const API_URL = 'http://127.0.0.1:3000';

type LeaveRequest = {
  id: number;
  faculty_id: number;
  faculty_name: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  reason: string;
  status: string;
  admin_response?: string;
  created_at: string;
};

const LeaveRequests = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminResponse, setAdminResponse] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    const socket = io(API_URL);
    
    // Listen for new leave requests
    socket.on('new_leave_request', (data) => {
      setRequests(prev => [{
        id: data.id,
        faculty_id: data.faculty_id,
        faculty_name: data.faculty_name,
        start_date: data.start_date,
        end_date: data.end_date,
        leave_type: data.leave_type,
        status: 'Pending',
        reason: '',
        created_at: new Date().toISOString(),
      }, ...prev]);
    });

    // Fetch initial requests
    fetchRequests();

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/leave-requests`);
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: number, action: 'approve' | 'reject') => {
    try {
      setProcessingId(requestId);
      const response = await fetch(`${API_URL}/api/admin/leave-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action === 'approve' ? 'Approved' : 'Rejected',
          admin_response: adminResponse,
        }),
      });

      if (!response.ok) throw new Error('Failed to update request');

      setRequests(prev => prev.map(req => 
        req.id === requestId
          ? { 
              ...req, 
              status: action === 'approve' ? 'Approved' : 'Rejected',
              admin_response: adminResponse 
            }
          : req
      ));
      
      setAdminResponse('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Faculty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => {
                const days = differenceInDays(new Date(request.end_date), new Date(request.start_date)) + 1;
                const isPending = request.status === 'Pending';

                return (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.faculty_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        <span>
                          {format(new Date(request.start_date), 'MMM d, yyyy')}
                          {request.start_date !== request.end_date && 
                            ` to ${format(new Date(request.end_date), 'MMM d, yyyy')}`}
                          <span className="text-gray-400 ml-1">
                            ({days} day{days !== 1 && 's'})
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.leave_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {request.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${request.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                            request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}
                      >
                        {request.status}
                      </span>
                      {request.admin_response && (
                        <div className="mt-1 text-xs text-gray-500">{request.admin_response}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-2">
                      {isPending && (
                        <>
                          <TextArea
                            placeholder="Add a response (optional)"
                            rows={2}
                            value={adminResponse}
                            onChange={(e) => setAdminResponse(e.target.value)}
                            className="mb-2"
                          />
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleAction(request.id, 'approve')}
                              variant="success"
                              size="sm"
                              isLoading={processingId === request.id}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleAction(request.id, 'reject')}
                              variant="danger"
                              size="sm"
                              isLoading={processingId === request.id}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default LeaveRequests;