import { useState, useEffect } from 'react';
import { Search, Users2, Save, X, Plus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

const API_URL = 'http://127.0.0.1:3000';

type FacultyMember = {
  id: string;
  name: string;
  email: string;
  department: string;
};

type Course = {
  id: string;
  code: string;
  name: string;
  department: string;
  credits: number;
  assigned_faculty_id: string | null;
  faculty_name?: string;
};

type FormData = {
  courseId: string;
  facultyId: string;
};

type NewCourseData = {
  code: string;
  name: string;
  description: string;
  credits: number;
  department: string;
};

const FacultyAssignment = () => {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    department: '',
    assignmentStatus: '',
  });

  const {
    register: registerAssign,
    handleSubmit: handleSubmitAssign,
    reset: resetAssign,
    formState: { errors: assignErrors },
  } = useForm<FormData>();

  const {
    register: registerNewCourse,
    handleSubmit: handleSubmitNewCourse,
    reset: resetNewCourse,
    formState: { errors: newCourseErrors },
  } = useForm<NewCourseData>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/faculty-assignments`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setCourses(data.courses);
      setFilteredCourses(data.courses);
      setFaculty(data.faculty);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...courses];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        course =>
          course.name.toLowerCase().includes(searchTerm) ||
          course.code.toLowerCase().includes(searchTerm)
      );
    }

    // Apply department filter
    if (filters.department) {
      filtered = filtered.filter(course => course.department === filters.department);
    }

    // Apply assignment status filter
    if (filters.assignmentStatus) {
      if (filters.assignmentStatus === 'assigned') {
        filtered = filtered.filter(course => course.assigned_faculty_id !== null);
      } else if (filters.assignmentStatus === 'unassigned') {
        filtered = filtered.filter(course => course.assigned_faculty_id === null);
      }
    }

    setFilteredCourses(filtered);
  }, [filters, courses]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleAssignFaculty = (course: Course) => {
    setSelectedCourse(course);
    setIsAssignModalOpen(true);
    resetAssign({
      courseId: course.id,
      facultyId: course.assigned_faculty_id || '',
    });
  };

  const onSubmitAssign = async (data: FormData) => {
    try {
      setIsProcessing(true);

      const response = await fetch(`${API_URL}/api/faculty-assignments/${data.courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facultyId: data.facultyId || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign faculty');
      }

      // Refresh data
      await fetchData();

      setIsProcessing(false);
      setIsAssignModalOpen(false);

      const courseName = selectedCourse?.name || '';
      const facultyName = data.facultyId ? faculty.find(f => f.id === data.facultyId)?.name : 'No faculty';

      setSuccessMessage(`${courseName} has been assigned to ${facultyName}.`);
      toast.success('Faculty assigned successfully');

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to assign faculty');
      setIsProcessing(false);
    }
  };

  const onSubmitNewCourse = async (data: NewCourseData) => {
    try {
      setIsProcessing(true);

      const response = await fetch(`${API_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      // Refresh data
      await fetchData();

      setIsProcessing(false);
      setIsNewCourseModalOpen(false);
      resetNewCourse();

      setSuccessMessage(`${data.name} has been created successfully.`);
      toast.success('Course created successfully');

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create course');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Faculty Assignment</h1>
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setIsNewCourseModalOpen(true)}
        >
          Add New Course
        </Button>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-start">
          <div className="flex-shrink-0">
            <Save className="h-5 w-5 text-green-500" />
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
              placeholder="Search by course name or code"
              className="pl-10"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Department"
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Departments' },
                { value: 'Computer Science', label: 'Computer Science' },
                { value: 'Mathematics', label: 'Mathematics' },
                { value: 'Physics', label: 'Physics' },
              ]}
            />
            <Select
              label="Assignment Status"
              name="assignmentStatus"
              value={filters.assignmentStatus}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Courses' },
                { value: 'assigned', label: 'Assigned Courses' },
                { value: 'unassigned', label: 'Unassigned Courses' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Courses List */}
      <Card title="Courses">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-8">
            <Users2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Faculty
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{course.name}</div>
                          <div className="text-sm text-gray-500">{course.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.credits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {course.assigned_faculty_id ? (
                        <span className="text-green-600">{course.faculty_name || 'Unknown'}</span>
                      ) : (
                        <span className="text-red-600">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssignFaculty(course)}
                      >
                        {course.assigned_faculty_id ? 'Change' : 'Assign'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* New Course Modal */}
      {isNewCourseModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsNewCourseModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Add New Course
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleSubmitNewCourse(onSubmitNewCourse)}>
                        <div className="space-y-4">
                          <Input
                            label="Course Code"
                            {...registerNewCourse('code', {
                              required: 'Course code is required',
                              pattern: {
                                value: /^[A-Z]{2,4}\d{3}$/,
                                message: 'Invalid course code format (e.g., CS101)',
                              },
                            })}
                            error={newCourseErrors.code?.message}
                          />

                          <Input
                            label="Course Name"
                            {...registerNewCourse('name', {
                              required: 'Course name is required',
                            })}
                            error={newCourseErrors.name?.message}
                          />

                          <Input
                            label="Description"
                            {...registerNewCourse('description', {
                              required: 'Description is required',
                            })}
                            error={newCourseErrors.description?.message}
                          />

                          <Input
                            type="number"
                            label="Credits"
                            {...registerNewCourse('credits', {
                              required: 'Credits are required',
                              min: {
                                value: 1,
                                message: 'Credits must be at least 1',
                              },
                              max: {
                                value: 6,
                                message: 'Credits cannot exceed 6',
                              },
                            })}
                            error={newCourseErrors.credits?.message}
                          />

                          <Select
                            label="Department"
                            {...registerNewCourse('department', {
                              required: 'Department is required',
                            })}
                            error={newCourseErrors.department?.message}
                            options={[
                              { value: '', label: '-- Select Department --' },
                              { value: 'Computer Science', label: 'Computer Science' },
                              { value: 'Mathematics', label: 'Mathematics' },
                              { value: 'Physics', label: 'Physics' },
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
                            Create Course
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-3 sm:mt-0 sm:w-auto"
                            onClick={() => setIsNewCourseModalOpen(false)}
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

      {/* Assign Faculty Modal */}
      {isAssignModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsAssignModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Assign Faculty to Course
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleSubmitAssign(onSubmitAssign)}>
                        <input type="hidden" {...registerAssign('courseId')} value={selectedCourse.id} />

                        <div className="mb-4">
                          <h4 className="text-base font-medium text-gray-800">{selectedCourse.name}</h4>
                          <p className="text-sm text-gray-500">{selectedCourse.code} • {selectedCourse.department}</p>
                        </div>

                        <div className="mb-4">
                          <Select
                            label="Select Faculty Member"
                            {...registerAssign('facultyId', {
                              required: 'Please select a faculty member',
                            })}
                            error={assignErrors.facultyId?.message}
                            options={[
                              { value: '', label: '-- Select Faculty --' },
                              ...faculty.map(f => ({
                                value: f.id,
                                label: `${f.name} (${f.department})`,
                              })),
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
                            Save Assignment
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-3 sm:mt-0 sm:w-auto"
                            onClick={() => setIsAssignModalOpen(false)}
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

export default FacultyAssignment;