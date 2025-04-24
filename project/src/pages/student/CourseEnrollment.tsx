import { useState, useEffect } from 'react';
import { Search, Filter, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Course } from '../../types';

const mockCourses: Course[] = [
  {
    id: '1',
    code: 'CS101',
    name: 'Introduction to Computer Science',
    description: 'An introductory course covering the basic principles of computer science.',
    credits: 3,
    instructor: 'Dr. John Smith',
  },
  {
    id: '2',
    code: 'CS201',
    name: 'Data Structures and Algorithms',
    description: 'Study of fundamental data structures and algorithms used in computer science.',
    credits: 4,
    instructor: 'Dr. Jane Doe',
  },
  {
    id: '3',
    code: 'CS301',
    name: 'Database Systems',
    description: 'Design and implementation of database systems, including relational database theory and SQL.',
    credits: 3,
    instructor: 'Prof. Michael Brown',
  },
  {
    id: '4',
    code: 'CS401',
    name: 'Software Engineering',
    description: 'Principles and practices of software engineering, including project management and software design.',
    credits: 4,
    instructor: 'Dr. Sarah Wilson',
  },
  {
    id: '5',
    code: 'CS501',
    name: 'Artificial Intelligence',
    description: 'Introduction to artificial intelligence concepts, algorithms, and applications.',
    credits: 3,
    instructor: 'Prof. Robert Davis',
  },
];

type FormData = {
  search: string;
  department: string;
  credits: string;
};

const CourseEnrollment = () => {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(mockCourses);

  const { register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      search: '',
      department: '',
      credits: '',
    },
  });

  const watchAllFields = watch();

  useEffect(() => {
    // Simulate loading enrolled courses
    setTimeout(() => {
      setEnrolledCourses(['1', '3']);
    }, 500);
  }, []);

  useEffect(() => {
    // Filter courses based on search input and filters
    const searchTerm = watchAllFields.search.toLowerCase();
    const departmentFilter = watchAllFields.department;
    const creditsFilter = watchAllFields.credits;

    const filtered = courses.filter((course) => {
      const matchesSearch =
        !searchTerm ||
        course.name.toLowerCase().includes(searchTerm) ||
        course.code.toLowerCase().includes(searchTerm) ||
        course.instructor.toLowerCase().includes(searchTerm);

      const matchesDepartment = !departmentFilter || course.code.startsWith(departmentFilter);
      const matchesCredits = !creditsFilter || course.credits.toString() === creditsFilter;

      return matchesSearch && matchesDepartment && matchesCredits;
    });

    setFilteredCourses(filtered);
  }, [watchAllFields, courses]);

  const handleEnroll = (courseId: string) => {
    setIsEnrolling(courseId);
    
    // Simulate API call
    setTimeout(() => {
      if (enrolledCourses.includes(courseId)) {
        setEnrolledCourses(enrolledCourses.filter(id => id !== courseId));
      } else {
        setEnrolledCourses([...enrolledCourses, courseId]);
      }
      setIsEnrolling(null);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Course Enrollment</h1>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">
          {enrolledCourses.length} courses enrolled
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <form onSubmit={handleSubmit(() => {})} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search courses by name, code, or instructor"
              className="pl-10"
              {...register('search')}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select
                label="Department"
                options={[
                  { value: '', label: 'All Departments' },
                  { value: 'CS', label: 'Computer Science (CS)' },
                  { value: 'MATH', label: 'Mathematics (MATH)' },
                  { value: 'PHYS', label: 'Physics (PHYS)' },
                  { value: 'ENG', label: 'English (ENG)' },
                ]}
                {...register('department')}
              />
            </div>
            <div className="flex-1">
              <Select
                label="Credits"
                options={[
                  { value: '', label: 'All Credits' },
                  { value: '1', label: '1 Credit' },
                  { value: '2', label: '2 Credits' },
                  { value: '3', label: '3 Credits' },
                  { value: '4', label: '4 Credits' },
                ]}
                {...register('credits')}
              />
            </div>
          </div>
        </form>
      </Card>

      {/* Course List */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const isEnrolled = enrolledCourses.includes(course.id);
            
            return (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900">{course.name}</h3>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                        {course.code}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{course.description}</p>
                    <div className="mt-2">
                      <span className="text-sm text-gray-600">
                        <strong>Instructor:</strong> {course.instructor}
                      </span>
                      <span className="text-sm text-gray-600 ml-4">
                        <strong>Credits:</strong> {course.credits}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant={isEnrolled ? 'success' : 'primary'}
                      size="sm"
                      onClick={() => handleEnroll(course.id)}
                      isLoading={isEnrolling === course.id}
                      icon={isEnrolled ? <Check className="h-4 w-4" /> : undefined}
                    >
                      {isEnrolled ? 'Enrolled' : 'Enroll'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CourseEnrollment;