import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Student } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

const EnrolledStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: '',
    rollNumber: '',
  });

  // Fetch courses when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.name) return;

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all courses
        const coursesRes = await fetch('http://127.0.0.1:3000/api/courses');
        if (!coursesRes.ok) {
          throw new Error('Failed to fetch courses');
        }
        const coursesData = await coursesRes.json();
        
        // Filter courses where instructor matches the faculty name
        const facultyCourses = coursesData.filter((course: any) => 
          course.instructor && course.instructor.toLowerCase() === user.name.toLowerCase()
        );

        if (facultyCourses.length === 0) {
          setError('No courses assigned to you');
          setIsLoading(false);
          return;
        }

        setCourses(facultyCourses);
        
        // Select the first course by default
        const firstCourse = facultyCourses[0];
        setSelectedCourse(firstCourse.id.toString());
        
        // Fetch students for the first course
        const studentsRes = await fetch(`http://127.0.0.1:3000/api/courses/${firstCourse.id}/students`);
        if (!studentsRes.ok) {
          throw new Error('Failed to fetch students');
        }
        const data = await studentsRes.json();
        setStudents(data.students || []);
        setFilteredStudents(data.students || []);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load courses and students');
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.name]);

  // Fetch students when roll number or course changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourse) return;
      
      try {
        setIsLoading(true);
        setError(null);
        let url = `http://127.0.0.1:3000/api/courses/${selectedCourse}/students`;
        
        // Add roll number to query if provided
        if (filters.rollNumber) {
          url += `?roll_number=${filters.rollNumber}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const data = await response.json();
        setStudents(data.students || []);
        setFilteredStudents(data.students || []);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Failed to fetch students');
        toast.error('Failed to fetch students');
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if there's a selected course
    if (selectedCourse) {
      fetchStudents();
    }
  }, [selectedCourse, filters.rollNumber]);

  // Filter students based on search input (for name/email)
  useEffect(() => {
    if (!filters.search) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter((student) => {
      const searchMatch =
        student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.email.toLowerCase().includes(filters.search.toLowerCase());
      return searchMatch;
    });

    setFilteredStudents(filtered);
  }, [filters.search, students]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'course') {
      setSelectedCourse(value);
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleExportList = () => {
    // Convert the filtered students to CSV
    const headers = ['Name', 'Email', 'Roll Number', 'Enrollment Date'];
    const csvData = [
      headers.join(','),
      ...filteredStudents.map(student => 
        [
          student.name,
          student.email,
          student.roll_number || 'N/A',
          new Date(student.enrollment_date || '').toLocaleDateString()
        ].join(',')
      )
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrolled-students-${selectedCourse}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Enrolled Students</h1>
        <Button
          variant="outline"
          icon={<Download className="h-4 w-4" />}
          onClick={handleExportList}
        >
          Export List
        </Button>
      </div>

      {/* Course Selection */}
      <Card>
        <div className="space-y-4">
          <Select
            label="Select Course"
            name="course"
            value={selectedCourse}
            onChange={handleFilterChange}
            options={[
              ...courses.map(course => ({
                value: course.id.toString(),
                label: `${course.code}: ${course.name}`
              }))
            ]}
          />
        </div>
      </Card>

      {/* Search Filters */}
      <Card>
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              name="rollNumber"
              placeholder="Search by Roll Number"
              className="pl-10"
              value={filters.rollNumber}
              onChange={handleFilterChange}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              name="search"
              placeholder="Search by name or email"
              className="pl-10"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </Card>

      {/* Students Table */}
      <Card>
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading students...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900">{error}</h3>
            <p className="mt-1 text-sm text-gray-500">Please try again later</p>
          </div>
        ) : !selectedCourse ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900">Please select a course</h3>
            <p className="mt-1 text-sm text-gray-500">Choose a course to view enrolled students</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No students found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      {student.roll_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-medium">
                          {student.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Eye className="h-4 w-4" />}
                        onClick={() => handleViewStudent(student)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* View Student Modal */}
      {isViewModalOpen && selectedStudent && (
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
                      Student Details
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex justify-center mb-4">
                        <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold">
                          {selectedStudent.name.charAt(0)}
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-4">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Roll Number</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedStudent.roll_number || 'N/A'}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Full name</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedStudent.name}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedStudent.email}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Enrollment Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {new Date(selectedStudent.enrollment_date || '').toLocaleDateString()}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
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

export default EnrolledStudents;