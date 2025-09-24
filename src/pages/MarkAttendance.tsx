import { BookingLayout } from "@/components/BookingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { QrCode, Camera, Users, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const MarkAttendance = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState("");
  const [recentAttendance, setRecentAttendance] = useState([
    { id: "STU001", name: "Alice Johnson", time: "08:30 AM", status: "present" },
    { id: "STU002", name: "Bob Smith", time: "08:32 AM", status: "present" },
    { id: "STU003", name: "Carol Davis", time: "08:35 AM", status: "late" },
  ]);

  const { toast } = useToast();

  const handleQRScan = () => {
    setIsScanning(true);
    // Simulate QR scan
    setTimeout(() => {
      setIsScanning(false);
      toast({
        title: "Attendance Marked",
        description: "Student attendance recorded successfully",
      });
      // Add to recent attendance
      setRecentAttendance(prev => [
        { id: "STU004", name: "David Wilson", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), status: "present" },
        ...prev
      ]);
    }, 2000);
  };

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualEntry.trim()) {
      toast({
        title: "Attendance Marked",
        description: `Attendance marked for student ID: ${manualEntry}`,
      });
      setRecentAttendance(prev => [
        { id: manualEntry, name: "Manual Entry", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), status: "present" },
        ...prev
      ]);
      setManualEntry("");
    }
  };

  return (
    <BookingLayout
      title="Mark Attendance"
      description="Scan QR codes or manually mark student attendance"
      icon={<QrCode className="h-6 w-6 text-primary" />}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* QR Code Scanner */}
          <Card className="shadow-medium border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code Scanner
              </CardTitle>
              <CardDescription>
                Scan student QR codes for quick attendance marking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                {isScanning ? (
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Scanning...</p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <QrCode className="h-16 w-16 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Camera view will appear here</p>
                  </div>
                )}
              </div>
              <Button 
                onClick={handleQRScan} 
                className="w-full" 
                disabled={isScanning}
                size="lg"
              >
                <Camera className="h-4 w-4 mr-2" />
                {isScanning ? "Scanning..." : "Start QR Scan"}
              </Button>
            </CardContent>
          </Card>

          {/* Manual Entry */}
          <Card className="shadow-medium border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manual Entry
              </CardTitle>
              <CardDescription>
                Manually enter student ID for attendance marking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualEntry} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    placeholder="Enter student ID (e.g., STU001)"
                    value={manualEntry}
                    onChange={(e) => setManualEntry(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Attendance */}
        <Card className="shadow-medium border-0">
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>
              Recently marked attendance entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAttendance.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="font-medium">{entry.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {entry.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={entry.status === "present" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {entry.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{entry.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </BookingLayout>
  );
};

export default MarkAttendance;