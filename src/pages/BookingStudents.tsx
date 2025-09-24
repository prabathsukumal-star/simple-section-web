import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BookingSidebar } from "@/components/BookingSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Search, Filter, Plus, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const studentsData = [
  {
    id: "ST001",
    name: "Aditya Sharma",
    grade: "Class 10A",
    phone: "+91 98765 43210",
    address: "123 MG Road, Central Area",
    status: "Active",
    joinDate: "2024-01-15",
  },
  {
    id: "ST002", 
    name: "Priya Patel",
    grade: "Class 9B",
    phone: "+91 98765 43211",
    address: "456 Park Street, North Zone",
    status: "Active",
    joinDate: "2024-01-20",
  },
  {
    id: "ST003",
    name: "Rahul Kumar",
    grade: "Class 11C",
    phone: "+91 98765 43212",
    address: "789 Lake View, South Area", 
    status: "Inactive",
    joinDate: "2024-02-01",
  },
  {
    id: "ST004",
    name: "Sneha Reddy",
    grade: "Class 8A",
    phone: "+91 98765 43213",
    address: "321 Hill Road, East Side",
    status: "Active",
    joinDate: "2024-02-10",
  },
  {
    id: "ST005",
    name: "Arjun Singh",
    grade: "Class 12B",
    phone: "+91 98765 43214",
    address: "654 Valley Street, West Zone",
    status: "Active",
    joinDate: "2024-02-15",
  },
];

const BookingStudents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking] = useSearchParams();
  const navigate = useNavigate();

  const filteredStudents = studentsData.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm) ||
    student.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bookingId = selectedBooking.get("bookingId");
  const bookingTitle = bookingId === "1" ? "Morning Route - Central Campus" : 
                      bookingId === "2" ? "Evening Route - North Campus" : 
                      "Weekend Special Service";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <BookingSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card flex items-center px-6 shadow-soft">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Book Hire Students</h1>
                  <p className="text-sm text-muted-foreground">{bookingTitle}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, ID, phone, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="default">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </div>
              </div>

              {/* Students Table */}
              <div className="bg-card rounded-lg shadow-medium border-0 overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">Enrolled Students</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.id}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.grade}</TableCell>
                        <TableCell>{student.phone}</TableCell>
                        <TableCell className="max-w-xs truncate">{student.address}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={student.status === "Active" ? "default" : "secondary"}
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{student.joinDate}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredStudents.length === 0 && (
                  <div className="p-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No students found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? "Try adjusting your search criteria" : "No students enrolled yet"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BookingStudents;