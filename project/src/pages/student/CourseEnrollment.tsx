import { useState, useEffect } from 'react';
import { Search, Filter, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Course } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

const CourseEnrollment = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  const { register, handleSubmit, watch } = useForm<{
    search: string;
    department: string;
    credits: string;
  }>({
    defaultValues: {
      search: '',
      department: '',
      credits: '',
    },
  });

  const watchAllFields = watch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all courses
        const coursesRes = await fetch('http://127.0.0.1:3000/api/courses');
        if (!coursesRes.ok) throw new Error('Failed to fetch courses');
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
        setFilteredCourses(coursesData);

        // Fetch enrolled courses for the current student
        if (user?.id) {
          const enrolledRes = await fetch(`http://127.0.0.1:3000/api/courses/enrolled/${user.id}`);
          if (!enrolledRes.ok) throw new Error('Failed to fetch enrolled courses');
          const enrolledData = await enrolledRes.json();
          setEnrolledCourses(enrolledData.map((course: any) => course.id.toString()));
        }
      } catch (error) {
        console.error('Error loading courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

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

  const handleEnroll = async (courseId: string) => {
    if (!user?.id) {
      toast.error('Please log in to enroll in courses');
      return;
    }

    setIsEnrolling(courseId);
    
    try {
      const res = await fetch('http://127.0.0.1:3000/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: user.id,
          course_id: courseId,
        }),
      });

      if (!res.ok) throw new Error('Failed to process enrollment');
      
      const data = await res.json();
      
      if (data.enrolled) {
        setEnrolledCourses([...enrolledCourses, courseId]);
        toast.success('Successfully enrolled in course');
      } else {
        setEnrolledCourses(enrolledCourses.filter(id => id !== courseId));
        toast.success('Successfully unenrolled from course');
      }
    } catch (error) {
      console.error('Error processing enrollment:', error);
      toast.error('Failed to process enrollment');
    } finally {
      setIsEnrolling(null);
    }
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