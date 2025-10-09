import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, MapPin, CheckCircle, XCircle, Calendar, Truck, Loader2 } from 'lucide-react';
import { TransportEnrollment } from '@/api/studentTransport.api';
import { getBookhireAttendance, BookhireAttendanceRecord } from '@/api/bookhireAttendance.api';
import { useAuth } from '@/contexts/AuthContext';
import MUITable from '@/components/ui/mui-table';

interface TransportAttendanceProps {
  selectedTransport: TransportEnrollment;
}


export function TransportAttendance({ selectedTransport }: TransportAttendanceProps) {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<BookhireAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedChildForTransport, setSelectedChildForTransport] = useState<any>(null);
  
  // Check if user has access (Student or Parent only)
  const hasAccess = user?.role === 'Student' || user?.role === 'Parent';
  
  // Get the student ID to use for API calls
  const getStudentId = () => {
    if (user?.role === 'Student') {
      return user.id;
    } else if (user?.role === 'Parent') {
      // For parents, use selected child ID from localStorage or selectedChild
      const storedChild = localStorage.getItem('selectedChildForTransport');
      if (storedChild) {
        const childData = JSON.parse(storedChild);
        return childData.id;
      }
      return null;
    }
    return null;
  };
  
  useEffect(() => {
    if (!hasAccess) {
      setError('Access denied. This feature is only available for Students and Parents.');
      setLoading(false);
      return;
    }
    
    // Load selected child data for parents
    if (user?.role === 'Parent') {
      const storedChild = localStorage.getItem('selectedChildForTransport');
      if (storedChild) {
        setSelectedChildForTransport(JSON.parse(storedChild));
      }
    }
    
    const studentId = getStudentId();
    if (!studentId) {
      setError('No student selected. Please select a child first.');
      setLoading(false);
      return;
    }
  }, [hasAccess, user?.role]);

  const handleLoadAttendance = () => {
    const studentId = getStudentId();
    if (!studentId) {
      setError('No student selected. Please select a child first.');
      return;
    }
    fetchAttendanceData();
  };
  
  const fetchAttendanceData = async () => {
    const studentId = getStudentId();
    if (!studentId || !selectedTransport?.bookhireId?._id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getBookhireAttendance(
        selectedTransport.bookhireId._id,
        studentId, // Use the correct student ID (child ID for parents)
        currentPage,
        rowsPerPage
      );
      
      if (response && response.data) {
        setAttendanceData(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.totalItems || 0);
      } else {
        setAttendanceData([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setAttendanceData([]);
      setTotalPages(1);
      setTotalItems(0);
      setError('Failed to load attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'PRESENT') {
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">Present</Badge>;
    }
    return <Badge variant="destructive">Absent</Badge>;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'PRESENT') {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const presentDays = (attendanceData || []).filter(record => record.status === 'PRESENT').length;
  const totalDays = (attendanceData || []).length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage + 1); // MUI uses 0-based indexing
    handleLoadAttendance();
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    handleLoadAttendance();
  };

  const columns = [
    {
      id: 'date',
      label: 'Date',
      minWidth: 120,
      format: (value: string) => new Date(value).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      })
    },
    {
      id: 'time',
      label: 'Time',
      minWidth: 100
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (value: string) => (
        <Badge 
          variant={value === 'PRESENT' ? 'default' : 'destructive'}
          className={value === 'PRESENT' ? 'bg-green-100 text-green-800 border-green-300' : ''}
        >
          {value}
        </Badge>
      )
    },
    {
      id: 'vehicleNumber',
      label: 'Vehicle',
      minWidth: 120
    },
    {
      id: 'markedAt',
      label: 'Marked At',
      minWidth: 140,
      format: (value: string) => new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  ];
  
  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 mx-auto text-red-600 mb-3" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h3>
            <p className="text-red-700">This feature is only available for Students and Parents.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-3" />
            <p className="text-muted-foreground">Loading attendance data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 mx-auto text-red-600 mb-3" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
            <Button 
              onClick={fetchAttendanceData} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Management Hub</h1>
        <p className="text-sm text-muted-foreground">Module: Transport System</p>
        {user?.role === 'Parent' && selectedChildForTransport && (
          <p className="text-sm text-primary font-medium">
            Viewing: {selectedChildForTransport.firstName} {selectedChildForTransport.lastName}'s Transport Attendance
          </p>
        )}
      </div>

      {/* Transport Info Header */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-primary" />
            <span>Transport Management - {selectedTransport.bookhireId.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{selectedTransport.bookhireId.route}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Pickup: {selectedTransport.pickupTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Dropoff: {selectedTransport.dropoffTime}</span>
            </div>
          </div>
          <Button 
            onClick={handleLoadAttendance}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading Attendance...
              </>
            ) : (
              'Load Attendance Records'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Attendance Summary - Only show when data is loaded */}
      {totalItems > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">{presentDays}</div>
                <p className="text-sm text-muted-foreground">Days Present</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-red-600">{totalDays - presentDays}</div>
                <p className="text-sm text-muted-foreground">Days Absent</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary">{attendancePercentage}%</div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Table */}
          <MUITable
            title="Transport Attendance Records"
            columns={columns}
            data={attendanceData}
            page={currentPage - 1} // MUI uses 0-based indexing
            rowsPerPage={rowsPerPage}
            totalCount={totalItems}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[10, 25, 50]}
            allowAdd={false}
            allowEdit={false}
            allowDelete={false}
          />
        </>
      )}
    </div>
  );
}