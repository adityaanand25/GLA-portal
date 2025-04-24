import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Student } from '../../types';

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    enrollmentNumber: 'EN2025001',
    department: 'Computer Science',
    semester: 3,
  },
  {
    id: '2',
    name: 'Samantha Williams',
    email: 'samantha.williams@example.com',
    enrollmentNumber: 'EN2025002',
    department: 'Computer Science',
    semester: 3,
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    enrollmentNumber: 'EN2025003',
    department: 'Computer Science',
    semester: 5,
  },
  {
    id: '4',
    name: 'Jessica Davis',
    email: 'jessica.davis@example.com',
    enrollmentNumber: 'EN2025004',
    department: 'Mathematics',
    semester: 3,
  },
  {
    id: '5',
    name: 'David Miller',
    email: 'david.miller@example.com',
    enrollmentNumber: 'EN2025005',
    department: 'Computer Science',
    semester: 1,
  },
  {
    id: '6',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    enrollmentNumber: 'EN2025006',
    department: 'Physics',
    semester: 3,
  },
  {
    id: '7',
    name: 'James Taylor',
    email: 'james.taylor@example.com',
    enrollmentNumber: 'EN2025007',
    department: 'Computer Science',
    semester: 3,
  },
];

type FormData = {
  search: string;
  course: string;
  department: string;
  semester: string;
};

const EnrolledStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    course: '',
    department: '',
    semester: '',
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStudents(mockStudents);
      setFilteredStudents(mockStudents);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    const filtered = students.filter((student) => {
      const searchMatch =
        !filters.search ||
        student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.enrollmentNumber.toLowerCase().includes(filters.search.toLowerCase());

      const departmentMatch = !filters.department || student.department === filters.department;
      const semesterMatch = !filters.semester || student.semester.toString() === filters.semester;

      return searchMatch && departmentMatch && semesterMatch;
    });

    setFilteredStudents(filtered);
  }, [filters, students]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleExportList = () => {
    // In a real app, this would generate a CSV or PDF file
    alert('Exporting student list...');
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
              placeholder="Search by name, email, or enrollment number"
              className="pl-10"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Course"
              name="course"
              value={filters.course}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Courses' },
                { value: 'CS101', label: 'CS101: Introduction to Computer Science' },
                { value: 'CS201', label: 'CS201: Data Structures and Algorithms' },
                { value: 'CS301', label: 'CS301: Database Systems' },
              ]}
            />
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
              label="Semester"
              name="semester"
              value={filters.semester}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Semesters' },
                { value: '1', label: 'Semester 1' },
                { value: '2', label: 'Semester 2' },
                { value: '3', label: 'Semester 3' },
                { value: '4', label: 'Semester 4' },
                { value: '5', label: 'Semester 5' },
                { value: '6', label: 'Semester 6' },
                { value: '7', label: 'Semester 7' },
                { value: '8', label: 'Semester 8' },
              ]}
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
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment No.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-medium">
                          {student.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.enrollmentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.semester}
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
                            <dt className="text-sm font-medium text-gray-500">Full name</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedStudent.name}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedStudent.email}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Enrollment Number</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedStudent.enrollmentNumber}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Department</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedStudent.department}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Semester</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedStudent.semester}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
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