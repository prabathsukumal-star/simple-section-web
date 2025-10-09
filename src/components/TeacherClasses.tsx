import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, BookOpen, Users, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl } from '@/contexts/utils/auth.api';
import { DataCardView } from '@/components/ui/data-card-view';
import DataTable from '@/components/ui/data-table';
import { useTableData } from '@/hooks/useTableData';
import PaymentSubmissionsPagination from '@/components/PaymentSubmissionsPagination';

interface TeacherClass {
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
}

interface ApiResponse {
  data: TeacherClass[];
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

const TeacherClasses = () => {
  const { user, selectedInstitute, setSelectedClass } = useAuth();
  const { toast } = useToast();
  
  const [dataLoaded, setDataLoaded] = useState(false);

  // Manual state for classes since useTableData might not work with this specific API
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Role check - only teachers can access this component
  if (user?.role !== 'Teacher') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Access denied. This section is only available for teachers.
        </p>
      </div>
    );
  }

  const getApiHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };


  const fetchTeacherClasses = async () => {
    if (!selectedInstitute?.id || !user?.id) {
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
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        instituteId: selectedInstitute.id,
        grade: '11',
        isActive: 'true',
        classTeacherId: user.id
      });

      const response = await fetch(
        `${getBaseUrl()}/institute-classes?${params}`,
        { headers: getApiHeaders() }
      );
      
      if (response.ok) {
        const data: ApiResponse = await response.json();
        setClasses(data.data);
        setTotalItems(data.meta.total);
        setTotalPages(data.meta.totalPages);
        setDataLoaded(true);
        
        toast({
          title: "Classes Loaded",
          description: `Successfully loaded ${data.data.length} classes.`
        });
      } else {
        throw new Error('Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
      toast({
        title: "Error",
        description: "Failed to load your classes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Removed automatic API call - users must click Refresh to load data

  const handleSelectClass = (classData: TeacherClass) => {
    setSelectedClass({
      id: classData.id,
      name: classData.name,
      code: classData.code,
      description: classData.description,
      grade: classData.grade,
      specialty: classData.specialty
    });
    
    toast({
      title: "Class Selected",
      description: `Selected class: ${classData.name}`
    });
  };

  const classColumns = [
    { 
      key: 'name', 
      header: 'Class Name',
      render: (value: string, row: TeacherClass) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.code}</div>
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
      key: 'capacity', 
      header: 'Capacity',
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
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
    }
  ];

  if (!dataLoaded) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <GraduationCap className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your Classes
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {!selectedInstitute 
              ? 'Please select an institute to view your classes.' 
              : 'Click the button below to load your classes'
            }
          </p>
          <Button 
            onClick={fetchTeacherClasses} 
            disabled={loading || !selectedInstitute}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading Classes...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Load My Classes
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Classes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Classes where you are the class teacher at {selectedInstitute?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {classes.length} Classes
          </Badge>
          <Button 
            onClick={fetchTeacherClasses} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Classes Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You are not assigned as a class teacher for any classes in this institute.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <DataTable
              title=""
              data={classes}
              columns={classColumns}
              onView={handleSelectClass}
              searchPlaceholder="Search classes..."
              allowAdd={false}
              allowEdit={false}
              allowDelete={false}
            />
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            <DataCardView
              data={classes}
              columns={classColumns}
              onView={handleSelectClass}
              allowEdit={false}
              allowDelete={false}
            />
          </div>
        </>
      )}

      {/* Pagination Controls - Always show when data is loaded */}
      {dataLoaded && (
        <PaymentSubmissionsPagination
          pagination={{
            currentPage: currentPage,
            totalPages: totalPages,
            totalItems: totalItems,
            itemsPerPage: itemsPerPage,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1
          }}
          onPageChange={(page) => {
            setCurrentPage(page);
            // Auto-refresh when page changes
            setTimeout(() => fetchTeacherClasses(), 100);
          }}
          onLimitChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1); // Reset to first page
            // Auto-refresh when limit changes
            setTimeout(() => fetchTeacherClasses(), 100);
          }}
        />
      )}
    </div>
  );
};

export default TeacherClasses;