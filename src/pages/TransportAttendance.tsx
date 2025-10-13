import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, RefreshCw, UserCheck, UserX, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/AppLayout';
import PageContainer from '@/components/layout/PageContainer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  checkIn?: string;
  checkOut?: string;
  location?: string;
  markedBy?: string;
}

const TransportAttendance: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { selectedTransport, setSelectedTransport } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    // Mock data for demonstration
    {
      id: '1',
      date: '2025-10-11',
      status: 'present',
      checkIn: '07:30 AM',
      checkOut: '03:45 PM',
      location: 'Main Gate',
      markedBy: 'System'
    },
    {
      id: '2',
      date: '2025-10-10',
      status: 'present',
      checkIn: '07:28 AM',
      checkOut: '03:50 PM',
      location: 'Main Gate',
      markedBy: 'System'
    },
    {
      id: '3',
      date: '2025-10-09',
      status: 'late',
      checkIn: '08:15 AM',
      checkOut: '03:45 PM',
      location: 'Side Entrance',
      markedBy: 'Guard'
    },
    {
      id: '4',
      date: '2025-10-08',
      status: 'absent',
      location: 'N/A',
      markedBy: 'System'
    },
    {
      id: '5',
      date: '2025-10-07',
      status: 'present',
      checkIn: '07:35 AM',
      checkOut: '03:40 PM',
      location: 'Main Gate',
      markedBy: 'System'
    }
  ]);

  useEffect(() => {
    // Set transport from location state if available
    if (location.state?.transport && !selectedTransport) {
      setSelectedTransport(location.state.transport);
    } else if (!location.state?.transport && !selectedTransport) {
      // If no transport in state or context, redirect back
      navigate('/transport');
    }
  }, [location.state, selectedTransport, setSelectedTransport, navigate]);

  const handleBack = () => {
    setSelectedTransport(null);
    navigate(-1);
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Success",
        description: "Attendance records loaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load attendance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return <UserCheck className="h-4 w-4" />;
      case 'absent':
        return <UserX className="h-4 w-4" />;
      case 'late':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!selectedTransport) {
    return (
      <AppLayout currentPage="transport-attendance">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPage="transport-attendance">
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Transport Attendance</h1>
              <p className="text-muted-foreground">Track your transport usage</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Attendance Records
                </CardTitle>
                <Button onClick={loadAttendance} disabled={loading} size="sm">
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading attendance...</span>
                </div>
              ) : attendanceRecords.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Marked By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {formatDate(record.date)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(record.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(record.status)}
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {record.checkIn || '-'}
                          </TableCell>
                          <TableCell>
                            {record.checkOut || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {record.location || '-'}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {record.markedBy || 'System'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No attendance records found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </AppLayout>
  );
};

export default TransportAttendance;
