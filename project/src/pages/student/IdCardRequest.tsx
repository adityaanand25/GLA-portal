import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Check, AlertCircle, CreditCard } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Select from '../../components/ui/Select';
import { useAuth } from '../../hooks/useAuth';

type FormData = {
  reason: string;
  cardType: string;
};

const IdCardRequest = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [hasActiveRequest, setHasActiveRequest] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      reason: '',
      cardType: 'standard',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const token = window.localStorage.getItem('gla_token') || '';
      const res = await fetch('http://127.0.0.1:3000/api/idcards', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`   // Include token
        },
        body: JSON.stringify({
          user_id: user?.id,
          student_name: user?.name,
          reason: data.reason,
        }),
      });
      if (res.ok) {
        setSuccessMessage('Your ID card request has been submitted successfully. You will be notified when it is processed.');
        setHasActiveRequest(true);
      } else {
        console.error('Submission error');
      }
    } catch (error) {
      console.error(error);
    }
    reset();
    setIsSubmitting(false);
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ID Card Request</h1>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-start">
          <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ID Card Request Form */}
        <div className="lg:col-span-2">
          {hasActiveRequest ? (
            <Card title="Active Request">
              <div className="text-center py-8">
                <div className="bg-blue-100 rounded-full p-4 inline-block mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">ID Card Request Pending</h3>
                <p className="mt-2 text-sm text-gray-500">
                  You already have an active ID card request. You will be notified when it is processed.
                </p>
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setHasActiveRequest(false)}
                  >
                    Cancel Request
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card title="Request a New ID Card">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
                      <p className="mt-1 text-sm text-blue-700">
                        There is a fee of $15 for standard ID card replacements. This fee will be added to your student account.
                      </p>
                    </div>
                  </div>
                </div>

                <Input
                  label="Full Name"
                  value={user?.name || ''}
                  disabled
                />

                <Input
                  label="Email Address"
                  value={user?.email || ''}
                  disabled
                />

                <Select
                  label="Card Type"
                  options={[
                    { value: 'standard', label: 'Standard ID Card ($15 fee)' },
                    { value: 'proximity', label: 'Proximity Card ($25 fee)' },
                  ]}
                  {...register('cardType', {
                    required: 'Please select a card type',
                  })}
                  error={errors.cardType?.message}
                />

                <TextArea
                  label="Reason for Replacement"
                  placeholder="Please provide the reason you need a new ID card (e.g., lost, stolen, damaged, etc.)"
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

                <div className="flex items-center mt-4">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I understand and agree to the replacement fee
                  </label>
                </div>

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
          )}
        </div>

        {/* Guidelines */}
        <div>
          <Card title="ID Card Information" className="bg-gray-50">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-800">ID Card Usage</h3>
                <ul className="mt-2 pl-5 text-sm text-gray-700 list-disc space-y-1">
                  <li>Building access and security</li>
                  <li>Library services and book checkout</li>
                  <li>Campus dining and meal plans</li>
                  <li>Event attendance and verification</li>
                  <li>Computer lab and equipment access</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-800">Processing Time</h3>
                <p className="mt-1 text-sm text-gray-700">
                  ID card requests are typically processed within 2-3 business days. You will receive an email notification when your card is ready for pickup.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-800">Pickup Location</h3>
                <p className="mt-1 text-sm text-gray-700">
                  ID cards can be picked up at the Student Services Center in the Administration Building. Please bring a valid government-issued photo ID for verification.
                </p>
              </div>

              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <h3 className="text-sm font-medium text-yellow-800">Lost or Stolen Cards</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  If your ID card is lost or stolen, please report it immediately by calling (555) 123-4567 to prevent unauthorized use.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IdCardRequest;