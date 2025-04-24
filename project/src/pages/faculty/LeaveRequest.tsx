import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, Check, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Select from '../../components/ui/Select';
import { useAuth } from '../../hooks/useAuth';
import { format, differenceInDays, addDays } from 'date-fns';

type FormData = {
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
};

const LeaveRequest = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [leaveDuration, setLeaveDuration] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      leaveType: '',
      reason: '',
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Calculate leave duration when dates change
  useState(() => {
    if (startDate && endDate) {
      const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
      setLeaveDuration(days > 0 ? days : 0);
    }
  });

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSuccessMessage('Your leave request has been submitted successfully.');
      reset();
      setIsSubmitting(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }, 1000);
  };

  const leaveHistory = [
    {
      id: '1',
      startDate: '2025-03-10',
      endDate: '2025-03-12',
      type: 'Sick Leave',
      status: 'Approved',
      appliedOn: '2025-03-08',
    },
    {
      id: '2',
      startDate: '2025-02-05',
      endDate: '2025-02-10',
      type: 'Vacation',
      status: 'Approved',
      appliedOn: '2025-01-25',
    },
    {
      id: '3',
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      type: 'Personal Leave',
      status: 'Rejected',
      appliedOn: '2025-01-14',
      reason: 'Insufficient notice period',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leave Request</h1>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-start">
          <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Request Form */}
        <div className="lg:col-span-2">
          <Card title="New Leave Request">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  {...register('startDate', {
                    required: 'Start date is required',
                  })}
                  error={errors.startDate?.message}
                />

                <Input
                  label="End Date"
                  type="date"
                  {...register('endDate', {
                    required: 'End date is required',
                    validate: value => new Date(value) >= new Date(startDate) || 'End date must be after start date',
                  })}
                  error={errors.endDate?.message}
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-md flex items-center my-2">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-sm text-blue-700">
                  Duration: <strong>{leaveDuration} day{leaveDuration !== 1 && 's'}</strong>
                </p>
              </div>

              <Select
                label="Leave Type"
                options={[
                  { value: '', label: 'Select leave type' },
                  { value: 'Sick Leave', label: 'Sick Leave' },
                  { value: 'Casual Leave', label: 'Casual Leave' },
                  { value: 'Vacation', label: 'Vacation' },
                  { value: 'Emergency Leave', label: 'Emergency Leave' },
                  { value: 'Study Leave', label: 'Study Leave' },
                  { value: 'Other', label: 'Other' },
                ]}
                {...register('leaveType', {
                  required: 'Please select a leave type',
                })}
                error={errors.leaveType?.message}
              />

              <TextArea
                label="Reason for Leave"
                placeholder="Please provide a detailed reason for your leave request"
                rows={4}
                {...register('reason', {
                  required: 'Reason is required',
                  minLength: {
                    value: 10,
                    message: 'Please provide a more detailed explanation',
                  },
                })}
                error={errors.reason?.message}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                >
                  Submit Request
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Guidelines */}
        <div>
          <Card title="Leave Policy" className="bg-gray-50">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-800">Available Leave Types</h3>
                <ul className="mt-2 pl-5 text-sm text-gray-700 list-disc space-y-1">
                  <li>Sick Leave: 10 days per year</li>
                  <li>Casual Leave: 12 days per year</li>
                  <li>Vacation: 30 days per year</li>
                  <li>Emergency Leave: As needed with approval</li>
                  <li>Study Leave: Subject to approval</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-800">Notice Period</h3>
                <p className="mt-1 text-sm text-gray-700">
                  For planned leave, requests should be submitted at least 7 days in advance. Emergency leave may be granted with shorter notice at the discretion of the administration.
                </p>
              </div>

              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
                <ul className="mt-2 pl-5 text-sm text-yellow-700 list-disc space-y-1">
                  <li>Leave is subject to approval by the department head</li>
                  <li>Substitution arrangements must be made for scheduled classes</li>
                  <li>Unused leave does not carry forward to the next academic year</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Leave History */}
      <Card title="Leave History">
        {leaveHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No leave history available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied On
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveHistory.map((leave) => {
                  const days = differenceInDays(new Date(leave.endDate), new Date(leave.startDate)) + 1;
                  
                  return (
                    <tr key={leave.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <span>
                            {format(new Date(leave.startDate), 'MMM d, yyyy')}
                            {leave.startDate !== leave.endDate && ` to ${format(new Date(leave.endDate), 'MMM d, yyyy')}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leave.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {days} day{days !== 1 && 's'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(leave.appliedOn), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${leave.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                              leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}
                        >
                          {leave.status}
                        </span>
                        {leave.reason && (
                          <div className="mt-1 text-xs text-red-600">{leave.reason}</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LeaveRequest;