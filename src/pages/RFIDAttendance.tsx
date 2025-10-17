import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wifi, ArrowLeft, MapPin, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { childAttendanceApi, MarkAttendanceByCardRequest } from '@/api/childAttendance.api';
import AppLayout from '@/components/layout/AppLayout';

interface LastAttendance {
  studentCardId: string;
  studentName: string;
  attendanceId: string;
  status: 'present' | 'absent' | 'late';
  timestamp: number;
}

const RFIDAttendance = () => {
  const { selectedInstitute, selectedClass, selectedSubject, currentInstituteId, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [rfidCardId, setRfidCardId] = useState('');
  const [status, setStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannerStatus, setScannerStatus] = useState('Ready to Scan');
  const [location, setLocation] = useState<{ address: string } | null>(null);
  const [lastAttendance, setLastAttendance] = useState<LastAttendance | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get user location
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();
              setLocation({ address: data.display_name || 'Unknown Location' });
            } catch (error) {
              console.error('Error fetching address:', error);
              setLocation({ address: 'Location detected' });
            }
          },
          (error) => {
            console.error('Error getting location:', error);
            setLocation({ address: 'Gate Scanner - Main Entrance' });
          }
        );
      } else {
        setLocation({ address: 'Gate Scanner - Main Entrance' });
      }
    };

    getLocation();
  }, []);

  // Clear last attendance after 1 minute
  useEffect(() => {
    if (lastAttendance) {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
      clearTimeoutRef.current = setTimeout(() => {
        setLastAttendance(null);
      }, 60000); // 1 minute
    }
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, [lastAttendance]);

  const handleMarkAttendance = async () => {
    if (!rfidCardId.trim()) {
      toast({
        title: "Error",
        description: "Please enter or scan an RFID card ID",
        variant: "destructive"
      });
      return;
    }

    if (!currentInstituteId || !selectedInstitute?.name) {
      toast({
        title: "Error",
        description: "Please select an institute first",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate
    if (lastAttendance && lastAttendance.studentCardId === rfidCardId.trim()) {
      toast({
        title: "Duplicate Detected",
        description: `Attendance already marked for ${lastAttendance.studentName}`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setScannerStatus('Processing...');

    try {
      const request: any = {
        studentCardId: rfidCardId.trim(),
        instituteId: currentInstituteId,
        instituteName: selectedInstitute.name,
        address: location?.address || 'Gate Scanner - Main Entrance',
        markingMethod: 'rfid/nfc',
        status: status
      };

      // Include class data if selected
      if (selectedClass) {
        request.classId = selectedClass.id;
        request.className = selectedClass.name;
      }

      // Include subject data if selected
      if (selectedSubject) {
        request.subjectId = selectedSubject.id;
        request.subjectName = selectedSubject.name;
      }

      const result = await childAttendanceApi.markAttendanceByCard(request);

      if (result.success) {
        const studentName = (result as any).studentName || 'Student';
        const attendanceId = (result as any).attendanceId || '';
        
        // Store last attendance
        setLastAttendance({
          studentCardId: rfidCardId.trim(),
          studentName: studentName,
          attendanceId: attendanceId,
          status: status,
          timestamp: Date.now()
        });

        toast({
          title: "✓ Attendance Marked Successfully",
          description: (
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{studentName}</p>
              <p>Card ID: {rfidCardId.trim()}</p>
              <p>Status: {status.toUpperCase()}</p>
              <p>Attendance ID: {attendanceId}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {selectedInstitute?.name}
                {selectedClass && ` • ${selectedClass.name}`}
                {selectedSubject && ` • ${selectedSubject.name}`}
              </p>
            </div>
          ),
          duration: 5000,
        });
        setRfidCardId('');
        setScannerStatus('Attendance Marked Successfully');
        inputRef.current?.focus();
      } else {
        throw new Error(result.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Attendance marking error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to mark attendance',
        variant: "destructive"
      });
      setScannerStatus('Error - Try Again');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setScannerStatus('Ready to Scan'), 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleMarkAttendance();
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/qr-attendance')} 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex-1 space-y-1">
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Wifi className="h-6 w-6" />
                RFID Scanner
              </h1>
              <p className="text-sm text-muted-foreground">
                Tap your RFID card or enter the ID manually to mark attendance
              </p>
            </div>
          </div>

          {/* Current Selection */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Selection</h3>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Institute:</span> {selectedInstitute?.name || 'Not selected'}
                </p>
                {selectedClass && (
                  <p className="text-sm">
                    <span className="font-medium">Class:</span> {selectedClass.name}
                  </p>
                )}
                {selectedSubject && (
                  <p className="text-sm">
                    <span className="font-medium">Subject:</span> {selectedSubject.name}
                  </p>
                )}
                {location && (
                  <p className="text-sm flex items-start gap-1">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">{location.address}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scanner Status Card */}
          <Card className="border-muted">
            <CardContent className="p-12 sm:p-16">
              <div className="flex flex-col items-center justify-center space-y-6">
                {/* WiFi Icon with Animation */}
                <div className="relative">
                  <div className={`rounded-full p-12 ${lastAttendance ? 'bg-green-100 dark:bg-green-950/30' : 'bg-blue-100 dark:bg-blue-950/30'}`}>
                    {lastAttendance ? (
                      <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" strokeWidth={2.5} />
                    ) : (
                      <Wifi className="h-16 w-16 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                    )}
                  </div>
                </div>

                {/* Status Text */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold text-foreground">
                    {scannerStatus}
                  </h2>
                  {lastAttendance ? (
                    <div className="space-y-1">
                      <p className="text-lg font-medium text-green-600 dark:text-green-400">
                        {lastAttendance.studentName}
                      </p>
                      <p className={`text-base font-semibold ${
                        lastAttendance.status === 'present' 
                          ? 'text-green-600 dark:text-green-400' 
                          : lastAttendance.status === 'absent'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        Status: {lastAttendance.status.toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Card ID: {lastAttendance.studentCardId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Attendance ID: {lastAttendance.attendanceId}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Place your RFID card near the scanner or enter ID below
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Input Section */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* RFID Card ID Input */}
            <div className="space-y-2">
              <Label htmlFor="rfid-input" className="text-sm font-medium text-foreground">
                RFID Card ID
              </Label>
              <Input
                id="rfid-input"
                ref={inputRef}
                type="text"
                placeholder="Scan or enter RFID card ID..."
                value={rfidCardId}
                onChange={(e) => setRfidCardId(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isProcessing}
                className="h-12 text-base border-2 border-blue-500 focus:border-blue-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            </div>

            {/* Status Selector */}
            <div className="space-y-2">
              <Label htmlFor="status-select" className="text-sm font-medium text-foreground">
                Status
              </Label>
              <Select 
                value={status} 
                onValueChange={(value: 'present' | 'absent' | 'late') => setStatus(value)}
                disabled={isProcessing}
              >
                <SelectTrigger id="status-select" className="h-12 text-base border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mark Attendance Button */}
          <Button
            onClick={handleMarkAttendance}
            disabled={isProcessing || !rfidCardId.trim()}
            className="w-full h-14 text-lg font-medium bg-blue-500 hover:bg-blue-600 text-white"
            size="lg"
          >
            {isProcessing ? 'Processing...' : 'Mark Attendance'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default RFIDAttendance;