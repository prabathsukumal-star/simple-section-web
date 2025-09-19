import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, MapPin, CheckCircle, XCircle, Calendar, Truck } from 'lucide-react';
import { TransportEnrollment } from '@/api/studentTransport.api';

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
  const [selectedMonth, setSelectedMonth] = useState('2025-01');

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

  const presentDays = mockAttendanceData.filter(day => day.pickupStatus === 'PRESENT').length;
  const totalDays = mockAttendanceData.length;
  const attendancePercentage = Math.round((presentDays / totalDays) * 100);

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
            {mockAttendanceData.map((record) => (
              <div key={record.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
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
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pickup Status */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.pickupStatus)}
                      <span className="text-sm font-medium">Pickup</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(record.pickupStatus)}
                      {record.pickupStatus === 'PRESENT' && (
                        <span className="text-xs text-muted-foreground">{record.pickupTime}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Dropoff Status */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.dropoffStatus)}
                      <span className="text-sm font-medium">Dropoff</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(record.dropoffStatus)}
                      {record.dropoffStatus === 'PRESENT' && (
                        <span className="text-xs text-muted-foreground">{record.dropoffTime}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {record.notes && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                    <strong>Note:</strong> {record.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {mockAttendanceData.length === 0 && (
            <div className="text-center py-8">
              <CalendarCheck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No attendance records found for this month.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}