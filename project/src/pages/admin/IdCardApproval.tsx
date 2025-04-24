import { useState, useEffect } from 'react';
import io from 'socket.io-client'; // New import
import { Search, BadgeCheck, X, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { IdCardRequest } from '../../types';

const socket = io('http://127.0.0.1:3000'); // New socket connection

const IdCardApproval = () => {
  const [requests, setRequests] = useState<IdCardRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<IdCardRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<IdCardRequest | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateSort: 'newest',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://127.0.0.1:3000/api/idcards');
        const data = await res.json();
        setRequests(data);
        setFilteredRequests(data.filter((req: IdCardRequest) => req.status === 'Pending'));
        setFilters({ ...filters, status: 'Pending' });
      } catch (error) {
        console.error(error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    socket.on('idcard_update', (update: Partial<IdCardRequest> & { id: number | string }) => {
      setRequests(prev =>
        prev.map(req =>
          req.id === update.id ? { ...req, ...update } : req
        )
      );
      setRequests(prev => {
        if (!prev.find(req => req.id === update.id)) {
          return [update as IdCardRequest, ...prev];
        }
        return prev;
      });
    });
    return () => {
      socket.off('idcard_update');
    };
  }, []);

  useEffect(() => {
    let filtered = [...requests];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        req =>
          req.studentName.toLowerCase().includes(searchTerm) ||
          req.reason.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(req => req.status === filters.status);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return filters.dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredRequests(filtered);
  }, [filters, requests]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleViewRequest = (request: IdCardRequest) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleApproveRequest = async (requestId: string) => {
    setIsProcessing(requestId);
    try {
      const token = window.localStorage.getItem('gla_token') || '';
      const res = await fetch(`http://127.0.0.1:3000/api/idcards/${requestId}/approve`, { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const { updated_at } = await res.json();
        setRequests(prev =>
          prev.map(req =>
            req.id === requestId ? { ...req, status: 'Approved', updatedAt: updated_at } : req
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
    setIsProcessing(null);
    if (isViewModalOpen && selectedRequest?.id === requestId) {
      setIsViewModalOpen(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setIsProcessing(requestId);
    try {
      const token = window.localStorage.getItem('gla_token') || '';
      const res = await fetch(`http://127.0.0.1:3000/api/idcards/${requestId}/reject`, { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const { updated_at } = await res.json();
        setRequests(prev =>
          prev.map(req =>
            req.id === requestId ? { ...req, status: 'Rejected', updatedAt: updated_at } : req
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
    setIsProcessing(null);
    if (isViewModalOpen && selectedRequest?.id === requestId) {
      setIsViewModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">ID Card Approval</h1>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">
          {requests.filter(req => req.status === 'Pending').length} pending requests
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              name="search"
              placeholder="Search by student name or reason"
              className="pl-10"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Rejected', label: 'Rejected' },
              ]}
            />
            <Select
              label="Sort By"
              name="dateSort"
              value={filters.dateSort}
              onChange={handleFilterChange}
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <BadgeCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.status === 'Pending'
                ? "There are no pending ID card requests at this time."
                : "Try adjusting your filters to see more requests."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium">
                          {request.studentName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{request.studentName}</h3>
                          <p className="text-sm text-gray-500">
                            Submitted on {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">{request.reason}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            request.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                            request.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {request.status}
                      </span>
                      <div className="mt-2 flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-300"
                          icon={<Eye className="h-4 w-4" />}
                          onClick={() => handleViewRequest(request)}
                        >
                          View
                        </Button>
                        {request.status === 'Pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-300"
                              isLoading={isProcessing === request.id}
                              disabled={isProcessing !== null}
                              onClick={() => handleApproveRequest(request.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300"
                              isLoading={isProcessing === request.id}
                              disabled={isProcessing !== null}
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsViewModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      ID Card Request Details
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex justify-center mb-4">
                        <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xl font-bold">
                          {selectedRequest.studentName.charAt(0)}
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-4">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Student Name</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedRequest.studentName}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Request Reason</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedRequest.reason}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Submitted Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {new Date(selectedRequest.createdAt).toLocaleDateString()} at {new Date(selectedRequest.createdAt).toLocaleTimeString()}
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1 text-sm">
                              <span 
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${
                                    selectedRequest.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                    selectedRequest.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                    'bg-yellow-100 text-yellow-800'
                                  }`}
                              >
                                {selectedRequest.status}
                              </span>
                            </dd>
                          </div>
                          {selectedRequest.status !== 'Pending' && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Updated Date</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {new Date(selectedRequest.updatedAt).toLocaleDateString()} at {new Date(selectedRequest.updatedAt).toLocaleTimeString()}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedRequest.status === 'Pending' && (
                  <>
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto sm:ml-3 mb-2 sm:mb-0"
                      isLoading={isProcessing === selectedRequest.id}
                      disabled={isProcessing !== null}
                      onClick={() => handleApproveRequest(selectedRequest.id)}
                    >
                      Approve Request
                    </Button>
                    <Button
                      variant="danger"
                      className="w-full sm:w-auto sm:ml-3 mb-2 sm:mb-0"
                      isLoading={isProcessing === selectedRequest.id}
                      disabled={isProcessing !== null}
                      onClick={() => handleRejectRequest(selectedRequest.id)}
                    >
                      Reject Request
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdCardApproval;