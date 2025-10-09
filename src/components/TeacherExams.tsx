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
import { RefreshCw, FileText, Plus, Search, Filter, Calendar, Clock, ExternalLink, MapPin, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CreateExamForm from '@/components/forms/CreateExamForm';
import CreateResultsForm from '@/components/forms/CreateResultsForm';
import { UpdateExamForm } from '@/components/forms/UpdateExamForm';
import { ExamResultsDialog } from '@/components/ExamResultsDialog';
import { useTableData } from '@/hooks/useTableData';

interface TeacherExam {
  id: string;
  instituteId: string;
  classId: string;
  subjectId: string;
  title: string;
  description: string;
  examType: 'online' | 'physical';
  durationMinutes: number;
  totalMarks: string;
  passingMarks: string;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  venue?: string;
  examLink?: string;
  instructions?: string;
  status: 'scheduled' | 'draft' | 'completed' | 'cancelled';
  createdBy: string;
  toWhom: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  institute: {};
  class: {};
  subject: {};
  creator: {};
}

interface Column {
  id: 'title' | 'examType' | 'durationMinutes' | 'totalMarks' | 'scheduleDate' | 'venue' | 'status' | 'actions';
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any, row?: TeacherExam) => React.ReactNode;
}

const TeacherExams = () => {
  const { user, selectedInstitute, selectedClass, selectedSubject } = useAuth();
  const { toast } = useToast();
  
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateResultsDialogOpen, setIsCreateResultsDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<TeacherExam | null>(null);
  const [isExamResultsDialogOpen, setIsExamResultsDialogOpen] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

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
  const tableData = useTableData<TeacherExam>({
    endpoint: '/institute-class-subject-exams',
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

  const { state: { data: exams, loading }, pagination, actions } = tableData;

  const columns: readonly Column[] = [
    {
      id: 'title',
      label: 'Title',
      minWidth: 200,
      format: (value: string, row: TeacherExam) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500 truncate">{row?.description || ''}</div>
        </div>
      )
    },
    {
      id: 'examType',
      label: 'Type',
      minWidth: 120,
      format: (value: 'online' | 'physical') => (
        <Badge variant={value === 'online' ? 'default' : 'secondary'}>
          {value === 'online' ? (
            <>
              <ExternalLink className="h-3 w-3 mr-1" />
              Online
            </>
          ) : (
            <>
              <MapPin className="h-3 w-3 mr-1" />
              Physical
            </>
          )}
        </Badge>
      )
    },
    {
      id: 'durationMinutes',
      label: 'Duration',
      minWidth: 100,
      format: (value: number) => (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {formatDuration(value)}
        </div>
      )
    },
    {
      id: 'totalMarks',
      label: 'Marks',
      minWidth: 100,
      format: (value: string, row: TeacherExam) => `${value}/${row?.passingMarks || '0'}`
    },
    {
      id: 'scheduleDate',
      label: 'Date',
      minWidth: 150,
      format: (value: string) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      id: 'venue',
      label: 'Venue',
      minWidth: 120,
      format: (value: string | undefined) => value || '-'
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (value: string) => (
        <Badge variant={getStatusColor(value)}>
          {value.toUpperCase()}
        </Badge>
      )
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 200,
      align: 'center',
      format: (value: any, row: TeacherExam) => (
        <div className="flex items-center gap-2">
          {row.examLink && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(row.examLink, '_blank')}
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Exam Link
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewExam(row)}
            className="flex items-center gap-1"
          >
            <FileText className="h-3 w-3" />
            View
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => handleEditExam(row)}
            className="flex items-center gap-1"
          >
            <FileText className="h-3 w-3" />
            Edit
          </Button>
        </div>
      )
    }
  ];

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'scheduled':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleCreateResults = () => {
    console.log('Create results clicked');
    setIsCreateResultsDialogOpen(true);
  };

  const handleViewExam = (exam: TeacherExam) => {
    setSelectedExam(exam);
    setIsExamResultsDialogOpen(true);
  };

  const handleEditExam = (exam: TeacherExam) => {
    setSelectedExam(exam);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateExam = () => {
    setIsUpdateDialogOpen(false);
    setSelectedExam(null);
    actions.refresh(); // Refresh the list
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = !searchTerm || 
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam.venue && exam.venue.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchesType = typeFilter === 'all' || exam.examType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
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
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Select Subject
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please select an institute, class, and subject to view your exams.
          </p>
        </div>
      </div>
    );
  }

  if (!exams.length && !loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            My Subject Exams
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Current Selection: {getCurrentSelection()}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click the button below to load your exams for this subject
          </p>
          <Button 
            onClick={() => actions.loadData()} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading My Exams...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Load My Exams
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
            My Subject Exams
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Current Selection: {getCurrentSelection()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {exams.length} My Exams
          </Badge>
          <Button 
            onClick={handleCreateResults}
            variant="outline"
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Create Results
          </Button>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Exam
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
              Filter Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search exams..."
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
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredExams.length === 0 && !loading ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Exams Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No exams match your current filters.' 
                : 'No exams have been created for this subject yet.'}
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
            <Table stickyHeader aria-label="exams table">
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
                {filteredExams.map((row, index) => (
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
                {filteredExams.length === 0 && loading && (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      <div className="py-12 text-center text-gray-500">
                        <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
                        <p className="text-lg">Loading exams...</p>
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

      {/* Create Exam Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
          </DialogHeader>
          <CreateExamForm
            onClose={() => setIsCreateDialogOpen(false)}
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              actions.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Create Results Dialog */}
      <Dialog open={isCreateResultsDialogOpen} onOpenChange={setIsCreateResultsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Exam Results</DialogTitle>
          </DialogHeader>
          <CreateResultsForm
            onClose={() => setIsCreateResultsDialogOpen(false)}
            onSuccess={() => {
              setIsCreateResultsDialogOpen(false);
              actions.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Update Exam Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Exam</DialogTitle>
          </DialogHeader>
          {selectedExam && (
            <UpdateExamForm
              exam={selectedExam}
              onClose={() => setIsUpdateDialogOpen(false)}
              onSuccess={handleUpdateExam}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Exam Results Dialog */}
      <Dialog open={isExamResultsDialogOpen} onOpenChange={setIsExamResultsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Exam Results</DialogTitle>
          </DialogHeader>
          {selectedExam && (
            <ExamResultsDialog
              exam={selectedExam}
              isOpen={isExamResultsDialogOpen}
              onClose={() => setIsExamResultsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default TeacherExams;