import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Calendar, Clock, CheckCircle, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { getStudentTransportAttendance, TransportAttendanceRecord } from '@/api/transportAttendance.api';

const TransportAttendance = () => {
  const { user, selectedInstitute } = useAuth();
  const { navigateToPage } = useAppNavigation();
  const [attendanceData, setAttendanceData] = useState<TransportAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
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
      setTotalItems(response.pagination.totalItems);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Failed to load attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'PRESENT' ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'PRESENT' ? 'default' : 'destructive';
  };

  const presentDays = attendanceData.filter(record => record.status === 'PRESENT').length;
  const absentDays = attendanceData.length - presentDays;
  const attendancePercentage = attendanceData.length > 0 ? Math.round((presentDays / attendanceData.length) * 100) : 0;
  
  if (!hasAccess) {
    return (
      <div className="container mx-auto p-6 space-y-6">
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
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Transport Attendance</h1>
          </div>
          <Button variant="outline" onClick={() => navigateToPage('transport')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transport
          </Button>
        </div>
        
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
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Transport Attendance</h1>
          </div>
          <Button variant="outline" onClick={() => navigateToPage('transport')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transport
          </Button>
        </div>
        
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Truck className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Transport Attendance</h1>
        </div>
        <Button variant="outline" onClick={() => navigateToPage('transport')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Transport
        </Button>
      </div>
      
      {selectedInstitute && (
        <p className="text-muted-foreground">Institute: {selectedInstitute.name}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Transport Attendance Records</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {attendanceData[0]?.bookhireId?.title || 'Transport Service'}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Time</th>
                  <th className="text-left py-3 px-4 font-semibold">Vehicle</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Marked At</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record) => (
                  <tr key={record._id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(record.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{record.time}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium">{record.vehicleNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.status)}
                        <Badge variant={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(record.markedAt).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {attendanceData.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No attendance records found.</p>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} records
              </div>
              <div className="flex items-center space-x-2">
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
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{presentDays}</p>
                <p className="text-muted-foreground text-sm">Days Present</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{absentDays}</p>
                <p className="text-muted-foreground text-sm">Days Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{attendancePercentage}%</p>
                <p className="text-muted-foreground text-sm">Attendance Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransportAttendance;