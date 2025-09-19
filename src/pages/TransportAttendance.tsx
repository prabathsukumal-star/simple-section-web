import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Calendar, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useAppNavigation } from '@/hooks/useAppNavigation';

const TransportAttendance = () => {
  const { selectedInstitute } = useAuth();
  const { navigateToPage } = useAppNavigation();

  // Mock attendance data
  const attendanceRecords = [
    { date: '2025-09-19', pickup: 'Present', dropoff: 'Present', pickupTime: '7:30 AM', dropoffTime: '3:45 PM' },
    { date: '2025-09-18', pickup: 'Present', dropoff: 'Present', pickupTime: '7:30 AM', dropoffTime: '3:45 PM' },
    { date: '2025-09-17', pickup: 'Absent', dropoff: 'Absent', pickupTime: '-', dropoffTime: '-' },
    { date: '2025-09-16', pickup: 'Present', dropoff: 'Present', pickupTime: '7:35 AM', dropoffTime: '3:50 PM' },
    { date: '2025-09-15', pickup: 'Present', dropoff: 'Present', pickupTime: '7:30 AM', dropoffTime: '3:45 PM' },
  ];

  const getStatusIcon = (status: string) => {
    return status === 'Present' ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'Present' ? 'default' : 'destructive';
  };

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
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Recent Transport Attendance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Pickup Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Pickup Time</th>
                  <th className="text-left py-3 px-4 font-semibold">Dropoff Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Dropoff Time</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{record.date}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.pickup)}
                        <Badge variant={getStatusColor(record.pickup)}>
                          {record.pickup}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{record.pickupTime}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.dropoff)}
                        <Badge variant={getStatusColor(record.dropoff)}>
                          {record.dropoff}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{record.dropoffTime}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                <p className="text-2xl font-bold">85%</p>
                <p className="text-muted-foreground text-sm">Attendance Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">7:32</p>
                <p className="text-muted-foreground text-sm">Avg Pickup Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">20</p>
                <p className="text-muted-foreground text-sm">Days This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransportAttendance;