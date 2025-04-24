import { useState, useEffect } from 'react';
import { Calendar, Search, Download, BarChart3, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

type AttendanceRecord = {
  id: string;
  date: string;
  course: string;
  totalStudents: number;
  present: number;
  absent: number;
  percentage: number;
};

type CourseAttendance = {
  course: string;
  percentage: number;
};

const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    date: '2025-04-15',
    course: 'CS101: Introduction to Computer Science',
    totalStudents: 30,
    present: 27,
    absent: 3,
    percentage: 90,
  },
  {
    id: '2',
    date: '2025-04-14',
    course: 'CS201: Data Structures and Algorithms',
    totalStudents: 25,
    present: 22,
    absent: 3,
    percentage: 88,
  },
  {
    id: '3',
    date: '2025-04-14',
    course: 'CS301: Database Systems',
    totalStudents: 23,
    present: 21,
    absent: 2,
    percentage: 91.3,
  },
  {
    id: '4',
    date: '2025-04-10',
    course: 'CS101: Introduction to Computer Science',
    totalStudents: 30,
    present: 25,
    absent: 5,
    percentage: 83.3,
  },
  {
    id: '5',
    date: '2025-04-09',
    course: 'CS201: Data Structures and Algorithms',
    totalStudents: 25,
    present: 23,
    absent: 2,
    percentage: 92,
  },
  {
    id: '6',
    date: '2025-04-08',
    course: 'CS301: Database Systems',
    totalStudents: 23,
    present: 20,
    absent: 3,
    percentage: 87,
  },
];

const AttendanceReport = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [averageByCourse, setAverageByCourse] = useState<CourseAttendance[]>([]);

  const [filters, setFilters] = useState({
    course: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAttendanceRecords(mockAttendanceRecords);
      setFilteredRecords(mockAttendanceRecords);
      
      // Calculate average attendance by course
      const courses = [...new Set(mockAttendanceRecords.map(record => record.course))];
      const averages = courses.map(course => {
        const courseRecords = mockAttendanceRecords.filter(record => record.course === course);
        const totalPercentage = courseRecords.reduce((sum, record) => sum + record.percentage, 0);
        const averagePercentage = totalPercentage / courseRecords.length;
        
        return {
          course,
          percentage: parseFloat(averagePercentage.toFixed(1)),
        };
      });
      
      setAverageByCourse(averages);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    const filtered = attendanceRecords.filter((record) => {
      const courseMatch = !filters.course || record.course === filters.course;
      const dateFromMatch = !filters.dateFrom || new Date(record.date) >= new Date(filters.dateFrom);
      const dateToMatch = !filters.dateTo || new Date(record.date) <= new Date(filters.dateTo);
      
      return courseMatch && dateFromMatch && dateToMatch;
    });

    setFilteredRecords(filtered);
  }, [filters, attendanceRecords]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const toggleRecordExpand = (recordId: string) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId);
  };

  const getAttendanceColorClass = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const handleExportReport = () => {
    // In a real app, this would generate a CSV or PDF file
    alert('Exporting attendance report...');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Report</h1>
        <Button
          variant="outline"
          icon={<Download className="h-4 w-4" />}
          onClick={handleExportReport}
        >
          Export Report
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Course"
              name="course"
              value={filters.course}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Courses' },
                { value: 'CS101: Introduction to Computer Science', label: 'CS101: Introduction to Computer Science' },
                { value: 'CS201: Data Structures and Algorithms', label: 'CS201: Data Structures and Algorithms' },
                { value: 'CS301: Database Systems', label: 'CS301: Database Systems' },
              ]}
            />
            <Input
              label="Date From"
              name="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={handleFilterChange}
            />
            <Input
              label="Date To"
              name="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </Card>

      {/* Attendance Summary */}
      <Card title="Attendance Summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {averageByCourse.map((item) => (
            <div key={item.course} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">{item.course}</h3>
              <div className="flex items-end gap-2">
                <span className={`text-2xl font-bold ${getAttendanceColorClass(item.percentage)}`}>
                  {item.percentage}%
                </span>
                <span className="text-sm text-gray-500">average attendance</span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    item.percentage >= 90 ? 'bg-green-600' : 
                    item.percentage >= 75 ? 'bg-blue-600' : 
                    item.percentage >= 60 ? 'bg-amber-600' : 
                    'bg-red-600'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Attendance Records */}
      <Card title="Attendance Records">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading attendance records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No attendance records found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filter criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div 
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 cursor-pointer"
                  onClick={() => toggleRecordExpand(record.id)}
                >
                  <div className="flex items-center mb-2 md:mb-0">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {format(new Date(record.date), 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">{record.course}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-8">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Present</div>
                      <div className="text-sm font-medium text-gray-900">{record.present} / {record.totalStudents}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Attendance</div>
                      <div className={`text-sm font-medium ${getAttendanceColorClass(record.percentage)}`}>
                        {record.percentage}%
                      </div>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 text-gray-400 transform transition-transform ${
                        expandedRecord === record.id ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </div>
                
                {expandedRecord === record.id && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Student Attendance Details</h4>
                      <Button size="sm" variant="outline" icon={<Download className="h-4 w-4" />}>
                        Export
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Remarks
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {/* Placeholder student data - In a real app, this would be real data */}
                          {[...Array(5)].map((_, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                Student {index + 1}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  index < 4 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {index < 4 ? 'Present' : 'Absent'}
                                </span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {index < 4 ? '' : 'Medical leave'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AttendanceReport;