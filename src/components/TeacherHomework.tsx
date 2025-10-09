import * as React from 'react';
import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, BookOpen, Plus, Search, Filter, Calendar, Clock, FileText, Edit, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CreateHomeworkForm from '@/components/forms/CreateHomeworkForm';
import UpdateHomeworkForm from '@/components/forms/UpdateHomeworkForm';
import { useNavigate } from 'react-router-dom';
import { useTableData } from '@/hooks/useTableData';

interface TeacherHomework {
  id: string;
  instituteId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  referenceLink?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  institute: {
    id: string;
    name: string;
  };
  class: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
    email: string;
  };
}

interface Column {
  id: 'title' | 'startDate' | 'endDate' | 'referenceLink' | 'isActive' | 'actions';
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any, row?: TeacherHomework) => React.ReactNode;
}

const TeacherHomework = () => {
  const navigate = useNavigate();
  const { user, selectedInstitute, selectedClass, selectedSubject } = useAuth();
  const { toast } = useToast();
  
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<TeacherHomework | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Table data hook with pagination
  const tableData = useTableData<TeacherHomework>({
    endpoint: '/institute-class-subject-homeworks',
    defaultParams: {
      instituteId: selectedInstitute?.id,
      classId: selectedClass?.id,
      subjectId: selectedSubject?.id,
      teacherId: user?.id
    },
    dependencies: [], // Remove dependencies to prevent auto-reloading on context changes
    pagination: { defaultLimit: 50, availableLimits: [25, 50, 100] },
    autoLoad: false // Keep disabled
  });

  const { state: { data: homework, loading }, pagination, actions } = tableData;

  const columns: readonly Column[] = [
    {
      id: 'title',
      label: 'Title',
      minWidth: 200,
      format: (value: string, row: TeacherHomework) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500 truncate">{row?.description || ''}</div>
        </div>
      )
    },
    {
      id: 'startDate',
      label: 'Start Date',
      minWidth: 150,
      format: (value: string) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      id: 'endDate',
      label: 'Due Date',
      minWidth: 150,
      format: (value: string | undefined) => value ? (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {new Date(value).toLocaleDateString()}
        </div>
      ) : '-'
    },
    {
      id: 'referenceLink',
      label: 'Reference',
      minWidth: 120,
      format: (value: string | undefined) => value ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          View Link
        </a>
      ) : '-'
    },
    {
      id: 'isActive',
      label: 'Status',
      minWidth: 100,
      format: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 200,
      align: 'center',
      format: (value: any, row: TeacherHomework) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewSubmissions(row)}
            className="flex items-center justify-center p-2"
            title="View Submissions"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => handleEditHomework(row)}
            className="flex items-center justify-center p-2"
            title="Edit Homework"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const handleEditHomework = (homework: TeacherHomework) => {
    setSelectedHomework(homework);
    setIsUpdateDialogOpen(true);
  };

  const handleViewSubmissions = (homework: TeacherHomework) => {
    navigate(`/homework/${homework.id}/submissions`);
  };

  const handleUpdateHomework = () => {
    setIsUpdateDialogOpen(false);
    setSelectedHomework(null);
    actions.refresh(); // Refresh the list
  };

  const filteredHomework = homework.filter(hw => {
    const matchesSearch = !searchTerm || 
      hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hw.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && hw.isActive) || 
      (statusFilter === 'inactive' && !hw.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const getCurrentSelection = () => {
    const parts = [];
    if (selectedInstitute) parts.push(`Institute: ${selectedInstitute.name}`);
    if (selectedClass) parts.push(`Class: ${selectedClass.name}`);
    if (selectedSubject) parts.push(`Subject: ${selectedSubject.name}`);
    return parts.join(' → ');
  };

  if (!selectedInstitute || !selectedClass || !selectedSubject) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Select Subject
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please select an institute, class, and subject to view homework.
          </p>
        </div>
      </div>
    );
  }

  if (!homework.length && !loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            My Subject Homework
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Current Selection: {getCurrentSelection()}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click the button below to load your homework
          </p>
          <Button 
            onClick={() => actions.loadData()} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading Homework...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Load My Homework
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
            My Subject Homework
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Current Selection: {getCurrentSelection()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {homework.length} Homework
          </Badge>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Homework
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button 
            onClick={() => actions.refresh()} 
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

      {/* Filter Controls */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filter Homework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search homework..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredHomework.length === 0 && !loading ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Homework Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'No homework matches your current filters.' 
                : 'No homework has been created for this subject yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Paper sx={{ 
          width: '100%', 
          height: 'calc(100vh - 250px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <TableContainer sx={{ 
            height: 'calc(100% - 52px)', 
            flexGrow: 1 
          }}>
            <Table stickyHeader aria-label="homework table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                      sx={{
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHomework.map((row, index) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id || index}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format ? column.format(value, row) : value || '-'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
                {filteredHomework.length === 0 && loading && (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      <div className="py-12 text-center text-gray-500">
                        <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
                        <p className="text-lg">Loading homework...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[25, 50, 100]}
            component="div"
            count={pagination.totalCount}
            rowsPerPage={pagination.limit}
            page={pagination.page}
            onPageChange={(event, newPage) => actions.setPage(newPage)}
            onRowsPerPageChange={(event) => {
              actions.setLimit(parseInt(event.target.value, 10));
              actions.setPage(0);
            }}
          />
        </Paper>
      )}

      {/* Create Homework Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Homework</DialogTitle>
          </DialogHeader>
          <CreateHomeworkForm
            onClose={() => setIsCreateDialogOpen(false)}
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              actions.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Update Homework Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Homework</DialogTitle>
          </DialogHeader>
          {selectedHomework && (
            <UpdateHomeworkForm
              homework={selectedHomework}
              onClose={() => setIsUpdateDialogOpen(false)}
              onSuccess={handleUpdateHomework}
            />
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default TeacherHomework;