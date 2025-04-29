import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { useAuth } from '../../hooks/useAuth';

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
};

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
    },
  });

  const password = watch('password');
  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setRegisterError('');

    try {
      // Validate admin email domain
      if (data.role === 'admin' && !data.email.endsWith('@gla.ac.in')) {
        throw new Error('Admin email must be from @gla.ac.in domain');
      }

      await registerUser(data.name, data.email, data.password, data.role);

      // Navigate based on role after successful registration
      switch (data.role) {
        case 'student':
          navigate('/student');
          break;
        case 'faculty':
          navigate('/faculty');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      if (error instanceof Error) {
        setRegisterError(error.message);
      } else {
        setRegisterError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Create an account</h2>
        <p className="mt-2 text-sm text-gray-600">
          or{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      {registerError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-4 text-sm">
          {registerError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Select
          label="Register as"
          options={[
            { value: 'student', label: 'Student' },
            { value: 'faculty', label: 'Faculty' },
            { value: 'admin', label: 'Administrator' },
          ]}
          {...register('role', { required: 'Role is required' })}
          error={errors.role?.message}
        />

        <Input
          label="Full name"
          type="text"
          autoComplete="name"
          {...register('name', {
            required: 'Name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters',
            },
          })}
          error={errors.name?.message}
        />

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
            validate: (value) => {
              if (selectedRole === 'admin' && !value.endsWith('@gla.ac.in')) {
                return 'Admin email must be from @gla.ac.in domain';
              }
              return true;
            }
          })}
          error={errors.email?.message}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
          error={errors.password?.message}
        />

        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match',
          })}
          error={errors.confirmPassword?.message}
        />

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
            I agree to the{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
        >
          Create account
        </Button>
      </form>
    </div>
  );
};

export default RegisterPage;