import { useState } from "react";
import { BookingLayout } from "@/components/BookingLayout";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Search, Filter, Download, Users, RefreshCw } from "lucide-react";

const attendanceData = [
  {
    id: "ST001",
    name: "Aditya Sharma",
    phone: "+91 98765 43210",
    address: "123 MG Road, Central Area",
    date: "2024-03-20",
    status: "Present",
    time: "8:15 AM",
    route: "Morning Route",
  },
  {
    id: "ST002",
    name: "Priya Patel", 
    phone: "+91 98765 43211",
    address: "456 Park Street, North Zone",
    date: "2024-03-20",
    status: "Present",
    time: "8:20 AM",
    route: "Morning Route",
  },
  {
    id: "ST003",
    name: "Rahul Kumar",
    phone: "+91 98765 43212", 
    address: "789 Lake View, South Area",
    date: "2024-03-20",
    status: "Absent",
    time: "-",
    route: "Morning Route",
  },
  {
    id: "ST004",
    name: "Sneha Reddy",
    phone: "+91 98765 43213",
    address: "321 Hill Road, East Side",
    date: "2024-03-20",
    status: "Late",
    time: "8:45 AM",
    route: "Morning Route",
  },
  {
    id: "ST005",
    name: "Arjun Singh",
    phone: "+91 98765 43214",
    address: "654 Valley Street, West Zone", 
    date: "2024-03-20",
    status: "Present",
    time: "8:10 AM",
    route: "Morning Route",
  },
];

const BookingAttendance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { api } = useApi();
  const { toast } = useToast();

  const bookingId = searchParams.get("bookingId");

  const loadAttendanceData = async () => {
    if (!bookingId) {
      toast({
        title: "Error",
        description: "No booking ID found. Please select a booking first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.getVehicleAttendance(bookingId, 1, 10) as any;
      if (response.success) {
        setAttendanceData(response.data);
        toast({
          title: "Success",
          description: "Attendance data loaded successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = attendanceData.filter(record => {
    const matchesSearch = 
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vehicleNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || record.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return "success" as const;
      case "absent":
        return "destructive" as const;
      case "late":
        return "warning" as const;
      default:
        return "secondary" as const;
    }
  };

  const attendanceStats = {
    present: attendanceData.filter(r => r.status === "PRESENT").length,
    absent: attendanceData.filter(r => r.status === "ABSENT").length,
    late: attendanceData.filter(r => r.status === "LATE").length,
    total: attendanceData.length,
  };

  return (
    <BookingLayout
      title="Book Hire Attendance"
      description="Track student attendance records"
      icon={<Calendar className="h-6 w-6 text-primary" />}
    >
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Load Data Button */}
          <div className="flex justify-center">
            <Button 
              onClick={loadAttendanceData}
              disabled={loading}
              size="lg"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Load Attendance Data'}
            </Button>
          </div>

          {attendanceData.length > 0 && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="shadow-soft border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{attendanceStats.total}</div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-soft border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">{attendanceStats.present}</div>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((attendanceStats.present / attendanceStats.total) * 100)}%
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-soft border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">{attendanceStats.absent}</div>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((attendanceStats.absent / attendanceStats.total) * 100)}%
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-soft border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Late</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-warning">{attendanceStats.late}</div>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((attendanceStats.late / attendanceStats.total) * 100)}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, ID, phone, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Attendance Table */}
              <div className="bg-card rounded-lg shadow-medium border-0 overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">Attendance Records</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredAttendance.length} record{filteredAttendance.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Route</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.map((record, index) => (
                      <TableRow key={`${record._id}-${index}`}>
                        <TableCell className="font-medium">{record.studentId}</TableCell>
                        <TableCell>{record.studentName}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell className="max-w-xs truncate">-</TableCell>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.time}</TableCell>
                        <TableCell>{record.bookhireId?.title || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredAttendance.length === 0 && (
                  <div className="p-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No attendance records found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? "Try adjusting your search criteria" : "No attendance data available"}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
    </BookingLayout>
  );
};

export default BookingAttendance;