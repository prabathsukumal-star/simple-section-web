import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, MapPin, CheckCircle, XCircle, Calendar, Truck, Loader2 } from 'lucide-react';
import { TransportEnrollment } from '@/api/studentTransport.api';
import { getStudentTransportAttendance, TransportAttendanceRecord } from '@/api/transportAttendance.api';
import { useAuth } from '@/contexts/AuthContext';

interface TransportAttendanceProps {
  selectedTransport: TransportEnrollment;
}

// Mock attendance data
const mockAttendanceData = [
  {
    id: '1',
    date: '2025-01-15',
    pickupStatus: 'PRESENT',
    pickupTime: '07:30',
    dropoffStatus: 'PRESENT', 
    dropoffTime: '15:30',
    notes: ''
  },
  {
    id: '2',
    date: '2025-01-14',
    pickupStatus: 'PRESENT',
    pickupTime: '07:32',
    dropoffStatus: 'PRESENT',
    dropoffTime: '15:28',
    notes: ''
  },
  {
    id: '3',
    date: '2025-01-13',
    pickupStatus: 'ABSENT',
    pickupTime: '-',
    dropoffStatus: 'ABSENT',
    dropoffTime: '-',
    notes: 'Student was sick'
  },
  {
    id: '4',
    date: '2025-01-12',
    pickupStatus: 'PRESENT',
    pickupTime: '07:29',
    dropoffStatus: 'PRESENT',
    dropoffTime: '15:35',
    notes: 'Slight delay due to traffic'
  },
  {
    id: '5',
    date: '2025-01-11',
    pickupStatus: 'PRESENT',
    pickupTime: '07:31',
    dropoffStatus: 'PRESENT',
    dropoffTime: '15:30',
    notes: ''
  }
];

export function TransportAttendance({ selectedTransport }: TransportAttendanceProps) {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('2025-01');
  const [attendanceData, setAttendanceData] = useState<TransportAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Check if user has access (Student or Parent only)
  const hasAccess = user?.role === 'Student' || user?.role === 'Parent';
  
  useEffect(() => {
    if (!hasAccess || !user?.id) {
      setError('Access denied. This feature is only available for Students and Parents.');
      setLoading(false);
      return;
    }
    
    fetchAttendanceData();
  }, [user?.id, currentPage, hasAccess]);
  
  const fetchAttendanceData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getStudentTransportAttendance(user.id, currentPage, 10);
      setAttendanceData(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
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

  const presentDays = attendanceData.filter(record => record.status === 'PRESENT').length;
  const totalDays = attendanceData.length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
  
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
      {/* Header with Transport Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-primary" />
            <span>Transport Attendance - {selectedTransport.bookhireId.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </CardContent>
      </Card>

      {/* Attendance Summary */}
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

      {/* Month Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              <span>Attendance Records</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-sm border rounded px-2 py-1 bg-background"
              >
                <option value="2025-01">January 2025</option>
                <option value="2024-12">December 2024</option>
                <option value="2024-11">November 2024</option>
              </select>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {attendanceData.map((record) => (
              <div key={record._id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium">
                      {new Date(record.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {record.bookhireId.vehicleNumber}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(record.status)}
                    <span className="text-sm font-medium">{record.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(record.status)}
                    <span className="text-xs text-muted-foreground">
                      Marked: {new Date(record.markedAt).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {attendanceData.length === 0 && (
            <div className="text-center py-8">
              <CalendarCheck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No attendance records found.</p>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}