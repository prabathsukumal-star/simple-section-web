import React, { useState, useEffect } from 'react';
import MUITable from '@/components/ui/mui-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, RefreshCw, GraduationCap, Image, Edit, Filter, Search, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl } from '@/contexts/utils/auth.api';
import CreateClassForm from '@/components/forms/CreateClassForm';
import UpdateClassForm from '@/components/forms/UpdateClassForm';
import { AccessControl } from '@/utils/permissions';
import { UserRole } from '@/contexts/types/auth.types';
import { useTableData } from '@/hooks/useTableData';

interface ClassData {
  id: string;
  instituteId: string;
  name: string;
  code: string;
  academicYear: string;
  level: number;
  grade: number;
  specialty: string;
  classType: string;
  capacity: number;
  classTeacherId: string;
  description: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  enrollmentCode: string;
  enrollmentEnabled: boolean;
  requireTeacherVerification: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

interface ApiResponse {
  data: ClassData[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    previousPage: number | null;
    nextPage: number | null;
  };
}

const Classes = () => {
  const { user, selectedInstitute } = useAuth();
  const { toast } = useToast();

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(false);
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50); // Default 50 instead of 25
  const [totalCount, setTotalCount] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');

  // Auto-fetch when pagination changes
  useEffect(() => {
    if (selectedInstitute?.id && classes.length > 0) {
      fetchClasses();
    }
  }, [page, rowsPerPage]);

  // Removed auto-loading useEffect - data now only loads when button is clicked

  const userRole = (user?.role || 'Student') as UserRole;
  const isInstituteAdmin = userRole === 'InstituteAdmin';
  const canEdit = AccessControl.hasPermission(userRole, 'edit-class') && !isInstituteAdmin;
  const canDelete = AccessControl.hasPermission(userRole, 'delete-class') && !isInstituteAdmin;
  const canCreate = userRole === 'InstituteAdmin';
  const canAdd = canCreate;

  const getApiHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    };
  };

  const fetchClasses = async () => {
    if (!selectedInstitute?.id) {
      toast({
        title: "Missing Information",
        description: "Please select an institute first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(), // API expects 1-based pagination
        limit: rowsPerPage.toString(),
        instituteId: selectedInstitute.id,
      });

      const response = await fetch(
        `${getBaseUrl()}/institute-classes?${params}`,
        { headers: getApiHeaders() }
      );

      if (response.ok) {
        const data = await response.json();
        let classesArray = [];
        let totalCount = 0;
        
        // Handle different response structures
        if (Array.isArray(data)) {
          // Direct array response
          classesArray = data;
          totalCount = data.length;
        } else if (data.data && Array.isArray(data.data)) {
          // Paginated response with meta
          classesArray = data.data;
          totalCount = data.meta?.total || data.data.length;
        } else {
          // Fallback
          classesArray = [];
          totalCount = 0;
        }
        
        setClasses(classesArray);
        setTotalCount(totalCount);
        
        toast({
          title: "Classes Loaded",
          description: `Successfully loaded ${classesArray.length} classes.`
        });
      } else {
        throw new Error('Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (responseData: any) => {
    console.log('Class created successfully:', responseData);
    setIsCreateDialogOpen(false);
    // Show success toast with the message from the response
    if (responseData?.message) {
      toast({
        title: "Success",
        description: responseData.message
      });
    }
    fetchClasses(); // Refresh data
  };

  const handleCancelCreate = () => {
    setIsCreateDialogOpen(false);
  };

  const handleEditClass = (classData: ClassData) => {
    setSelectedClass(classData);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateClass = async (responseData: any) => {
    console.log('Class updated successfully:', responseData);
    setIsUpdateDialogOpen(false);
    setSelectedClass(null);
    fetchClasses(); // Refresh data
  };

  const handleCancelUpdate = () => {
    setIsUpdateDialogOpen(false);
    setSelectedClass(null);
  };

  const handleDeleteClass = async (classId: string) => {
    // Simulate API call
    console.log('Deleting class with ID:', classId);
    toast({
      title: "Class Deleted",
      description: `Successfully deleted class with ID: ${classId}`
    });
    fetchClasses(); // Refresh data
  };

  const handleLoadData = () => {
    fetchClasses();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedGrade('');
    setPage(0);
  };

  // Frontend filtering
  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch = !searchTerm.trim() || 
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = !selectedGrade || classItem.grade.toString() === selectedGrade;
    
    return matchesSearch && matchesGrade;
  });

  // Apply pagination to filtered results
  const paginatedClasses = filteredClasses.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  const columns = [
    {
      key: 'imageUrl',
      header: 'Image',
      render: (value: string, row: any) => (
        <Avatar className="h-12 w-12">
          <AvatarImage 
            src={value} 
            alt={row.name}
            className="object-cover"
          />
          <AvatarFallback className="bg-blue-100 text-blue-600">
            <Image className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
      )
    },
    {
      key: 'name',
      header: 'Class Name',
      render: (value: string, row: any) => (
        <div className="min-w-0">
          <div className="font-medium truncate">{value}</div>
          <div className="text-sm text-muted-foreground truncate">{row.code}</div>
        </div>
      )
    },
    {
      key: 'grade',
      header: 'Grade',
      render: (value: number) => `Grade ${value}`
    },
    {
      key: 'specialty',
      header: 'Specialty'
    },
    {
      key: 'classType',
      header: 'Type',
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <GraduationCap className="h-4 w-4" />
          {value}
        </div>
      )
    },
    {
      key: 'academicYear',
      header: 'Academic Year'
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    ...(userRole === 'InstituteAdmin' ? [{
      key: 'actions',
      header: 'Actions',
      render: (value: any, row: ClassData) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditClass(row)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    }] : [])
  ];

  const dataLoaded = classes.length > 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {!dataLoaded ? (
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Classes</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Manage institute classes and their details
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click the button below to load classes data
          </p>
          <Button 
            onClick={handleLoadData} 
            disabled={loading || !selectedInstitute?.id}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading Data...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Data
              </>
            )}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Classes</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage institute classes and their details
              </p>
            </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowFilters(!showFilters)} 
            variant="outline" 
            size="sm"
            className={showFilters ? "bg-primary/10" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Button onClick={handleLoadData} disabled={loading} variant="outline" size="sm">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
          
          {canCreate && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Class
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                </DialogHeader>
                <CreateClassForm onSubmit={handleCreateClass} onCancel={handleCancelCreate} />
              </DialogContent>
            </Dialog>
          )}

          {/* Update Class Dialog */}
          <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Class</DialogTitle>
              </DialogHeader>
              {selectedClass && (
                <UpdateClassForm 
                  classData={selectedClass}
                  onSubmit={handleUpdateClass} 
                  onCancel={handleCancelUpdate} 
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Options
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Class Name, Grade, Specialty..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(0); // Reset to first page when searching
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Grade Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Grade</label>
                <Select 
                  value={selectedGrade} 
                  onValueChange={(value) => {
                    setSelectedGrade(value);
                    setPage(0); // Reset to first page when grade filter changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((grade) => (
                      <SelectItem key={grade} value={grade.toString()}>
                        Grade {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Actions */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <div className="flex gap-2">
                  <Button onClick={handleClearFilters} variant="outline" size="sm" className="flex-1">
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <MUITable
        title="Classes"
        data={paginatedClasses}
        columns={columns.map(col => ({
          id: col.key,
          label: col.header,
          minWidth: col.key === 'actions' ? 200 : 170,
          format: col.render
        }))}
        onAdd={canAdd ? () => setIsCreateDialogOpen(true) : undefined}
        onEdit={!isInstituteAdmin && canEdit ? handleEditClass : undefined}
        onDelete={!isInstituteAdmin && canDelete ? handleDeleteClass : undefined}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredClasses.length} // Use filtered total count
        onPageChange={(newPage: number) => {
          setPage(newPage);
        }}
        onRowsPerPageChange={(newRowsPerPage: number) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0); // Reset to first page
        }}
        sectionType="classes"
        allowAdd={canAdd}
        allowEdit={!isInstituteAdmin && canEdit}
        allowDelete={!isInstituteAdmin && canDelete}
      />
        </>
      )}
    </div>
  );
};

export default Classes;
