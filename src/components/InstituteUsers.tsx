
import React, { useState } from 'react';
import * as MUI from '@mui/material';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, RefreshCw, GraduationCap, Users, UserCheck, Plus, UserPlus, UserCog, Filter, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { instituteApi } from '@/api/institute.api';
import { studentsApi } from '@/api/students.api';
import { useApiRequest } from '@/hooks/useApiRequest';
import { useTableData } from '@/hooks/useTableData';
import CreateUserForm from '@/components/forms/CreateUserForm';
import AssignUserForm from '@/components/forms/AssignUserForm';
import AssignParentForm from '@/components/forms/AssignParentForm';
import AssignParentByPhoneForm from '@/components/forms/AssignParentByPhoneForm';
import CreateStudentForm from '@/components/forms/CreateStudentForm';
import AssignUserMethodsDialog from '@/components/forms/AssignUserMethodsDialog';

interface InstituteUserData {
  id: string;
  name: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  phoneNumber?: string;
  imageUrl?: string;
  dateOfBirth?: string;
  userIdByInstitute?: string | null;
  verifiedBy?: string | null;
  fatherId?: string;
  motherId?: string;
  guardianId?: string;
}

interface InstituteUsersResponse {
  data: InstituteUserData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type UserType = 'STUDENT' | 'TEACHER' | 'ATTENDANCE_MARKER';

const InstituteUsers = () => {
  const { toast } = useToast();
  const { user, currentInstituteId } = useAuth();
  
  const [selectedUser, setSelectedUser] = useState<InstituteUserData | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showAssignUserDialog, setShowAssignUserDialog] = useState(false);
  const [showAssignMethodsDialog, setShowAssignMethodsDialog] = useState(false);
  const [showAssignParentDialog, setShowAssignParentDialog] = useState(false);
  const [showCreateStudentDialog, setShowCreateStudentDialog] = useState(false);
  const [selectedStudentForParent, setSelectedStudentForParent] = useState<InstituteUserData | null>(null);
  const [assignInitialUserId, setAssignInitialUserId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<UserType>('STUDENT');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  // Table data management for each user type
  const studentsTable = useTableData<InstituteUserData>({
    endpoint: `/institute-users/institute/${currentInstituteId}/users/STUDENT`,
    dependencies: [], // Remove dependencies to prevent auto-reloading
    pagination: { defaultLimit: 50, availableLimits: [25, 50, 100] },
    autoLoad: false
  });

  const teachersTable = useTableData<InstituteUserData>({
    endpoint: `/institute-users/institute/${currentInstituteId}/users/TEACHER`,
    dependencies: [], // Remove dependencies to prevent auto-reloading
    pagination: { defaultLimit: 50, availableLimits: [25, 50, 100] },
    autoLoad: false
  });

  const attendanceMarkersTable = useTableData<InstituteUserData>({
    endpoint: `/institute-users/institute/${currentInstituteId}/users/ATTENDANCE_MARKER`,
    dependencies: [], // Remove dependencies to prevent auto-reloading
    pagination: { defaultLimit: 50, availableLimits: [25, 50, 100] },
    autoLoad: false
  });

  // Use API request hook for creating users with duplicate prevention
  const createUserRequest = useApiRequest(
    async (userData: any) => {
      console.log('Creating user with data:', userData);
      // This would need to be implemented based on your API structure
      const response = await fetch(`/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return response.json();
    },
    { preventDuplicates: true, showLoading: false }
  );

  // Use API request hook for creating students
  const createStudentRequest = useApiRequest(
    async (studentData: any) => {
      return await studentsApi.create(studentData);
    },
    { preventDuplicates: true, showLoading: false }
  );

  const handleViewUser = (user: InstituteUserData) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleCreateUser = async (userData: any) => {
    console.log('User created successfully:', userData);
    setShowCreateUserDialog(false);
    
    // If API returned assignment-related shape, auto-open Assign dialog with prefilled userId
    if (userData && typeof userData.success === 'boolean' && userData.user?.id) {
      setAssignInitialUserId(userData.user.id);
      setShowAssignUserDialog(true);
    }
    
    toast({
      title: "User Created",
      description: "User has been created successfully.",
    });
  };

  const handleAssignUser = async (assignData: any) => {
    console.log('User assigned successfully:', assignData);
    setShowAssignUserDialog(false);
    
    toast({
      title: "User Assigned",
      description: "User has been assigned to institute successfully.",
    });
    
    // Refresh the current tab data
    getCurrentTable().actions.refresh();
  };

  const handleAssignParent = (student: InstituteUserData) => {
    setSelectedStudentForParent(student);
    setShowAssignParentDialog(true);
  };

  const handleParentAssignment = async (data: any) => {
    // The API call is handled by the form component
    // This function just handles the success response
    setShowAssignParentDialog(false);
    setSelectedStudentForParent(null);
    
    // Refresh students data
    studentsTable.actions.refresh();
  };

  const handleCreateStudent = async (studentData: any) => {
    try {
      const response = await createStudentRequest.execute(studentData);
      
      toast({
        title: "Student Created",
        description: "Student has been created successfully.",
      });
      
      setShowCreateStudentDialog(false);
      
      // Refresh students data
      studentsTable.actions.refresh();
    } catch (error) {
      console.error('Error creating student:', error);
      toast({
        title: "Error",
        description: "Failed to create student.",
        variant: "destructive"
      });
    }
  };

  const getCurrentTable = () => {
    switch (activeTab) {
      case 'STUDENT':
        return studentsTable;
      case 'TEACHER':
        return teachersTable;
      case 'ATTENDANCE_MARKER':
        return attendanceMarkersTable;
      default:
        return studentsTable;
    }
  };

  // Prevent unnecessary API calls on repeated clicks.
  const safeLoad = (table: any) => {
    if (!table || table.state?.loading) return;
    // If already loaded once and no explicit refresh requested, skip
    if (table.state?.lastRefresh && (table.state?.data?.length || 0) > 0) return;
    table.actions?.loadData?.(false);
  };

  const getCurrentUsers = () => {
    return getCurrentTable().state.data;
  };

  const getUserTypeLabel = (type: UserType) => {
    switch (type) {
      case 'STUDENT':
        return 'Students';
      case 'TEACHER':
        return 'Teachers';
      case 'ATTENDANCE_MARKER':
        return 'Attendance Markers';
      default:
        return '';
    }
  };

  const getUserTypeIcon = (type: UserType) => {
    switch (type) {
      case 'STUDENT':
        return GraduationCap;
      case 'TEACHER':
        return Users;
      case 'ATTENDANCE_MARKER':
        return UserCheck;
      default:
        return Users;
    }
  };

  if (!user || user.role !== 'InstituteAdmin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Access denied. InstituteAdmin role required.</p>
      </div>
    );
  }

  if (!currentInstituteId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Please select an institute first.</p>
      </div>
    );
  }

  const currentTable = getCurrentTable();
  const currentUsers = getCurrentUsers();
  const filteredUsers = currentUsers.filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesTerm = !term || [u.name, u.id, u.email, u.phoneNumber]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(term));
    const matchesStatus =
      statusFilter === 'all' || (statusFilter === 'verified' ? !!u.verifiedBy : !u.verifiedBy);
    return matchesTerm && matchesStatus;
  });
  const currentLoading = currentTable.state.loading;
  const IconComponent = getUserTypeIcon(activeTab);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Institute Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage users in your institute
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button 
            onClick={() => setShowAssignMethodsDialog(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Assign User
          </Button>
          <Button 
            onClick={() => setShowCreateUserDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>

      {/* Tabs for different user types */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="STUDENT" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="TEACHER" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teachers
          </TabsTrigger>
          <TabsTrigger value="ATTENDANCE_MARKER" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Attendance Markers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="STUDENT" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                {studentsTable.pagination.totalCount} Students
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setShowCreateStudentDialog(true)}
                className="flex items-center gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Create Student
              </Button>
              <Button 
                onClick={() => studentsTable.actions.refresh()} 
                disabled={studentsTable.state.loading}
                variant="outline"
                size="sm"
              >
                {studentsTable.state.loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load Students
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="TEACHER" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {teachersTable.pagination.totalCount} Teachers
              </Badge>
            </div>
            <Button 
              onClick={() => teachersTable.actions.refresh()} 
              disabled={teachersTable.state.loading}
              variant="outline"
              size="sm"
            >
              {teachersTable.state.loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load Teachers
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="ATTENDANCE_MARKER" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                {attendanceMarkersTable.pagination.totalCount} Attendance Markers
              </Badge>
            </div>
            <Button 
              onClick={() => attendanceMarkersTable.actions.refresh()} 
              disabled={attendanceMarkersTable.state.loading}
              variant="outline"
              size="sm"
            >
              {attendanceMarkersTable.state.loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load Attendance Markers
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Filter Controls */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filter {getUserTypeLabel(activeTab)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Search ${activeTab.toLowerCase()}s...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select 
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as 'all' | 'verified' | 'unverified')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={currentTable.pagination.limit.toString()} 
                onValueChange={(value) => currentTable.actions.setLimit(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  {currentTable.availableLimits.map((limit) => (
                    <SelectItem key={limit} value={limit.toString()}>
                      {limit} per page
                    </SelectItem>
                  ))}
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

      {/* Users MUI Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ height: 'calc(100vh - 280px)' }}>
          <Table stickyHeader aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(currentTable.pagination.page * currentTable.pagination.limit, 
                       currentTable.pagination.page * currentTable.pagination.limit + currentTable.pagination.limit)
                .map((userData) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={userData.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userData.imageUrl || ''} alt={userData.name} />
                      <AvatarFallback>
                        {userData.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{userData.id}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{userData.name}</div>
                      <div className="text-sm text-gray-500">
                        {userData.userIdByInstitute ? `Institute ID: ${userData.userIdByInstitute}` : 'No Institute ID'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{userData.email || 'Not provided'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{userData.phoneNumber || 'Not provided'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={userData.verifiedBy ? "default" : "secondary"}>
                      {userData.verifiedBy ? 'Verified' : 'Unverified'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewUser(userData)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {activeTab === 'STUDENT' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssignParent(userData)}
                        >
                          <UserCog className="h-4 w-4 mr-1" />
                          Parent
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <div className="py-12 text-center text-gray-500">
                      <IconComponent className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No {getUserTypeLabel(activeTab).toLowerCase()}</p>
                      <p className="text-sm">No users found for the current selection</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={currentTable.availableLimits}
          component="div"
          count={currentTable.pagination.totalCount}
          rowsPerPage={currentTable.pagination.limit}
          page={currentTable.pagination.page}
          onPageChange={(event: unknown, newPage: number) => currentTable.actions.setPage(newPage)}
          onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            currentTable.actions.setLimit(parseInt(event.target.value, 10));
            currentTable.actions.setPage(0);
          }}
        />
      </Paper>

      {/* Pagination */}
      {currentTable.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((currentTable.pagination.page) * currentTable.pagination.limit) + 1} to {Math.min((currentTable.pagination.page + 1) * currentTable.pagination.limit, currentTable.pagination.totalCount)} of {currentTable.pagination.totalCount} {activeTab.toLowerCase()}s
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => currentTable.actions.prevPage()}
              disabled={currentTable.pagination.page === 0 || currentTable.state.loading}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentTable.pagination.page + 1} of {currentTable.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => currentTable.actions.nextPage()}
              disabled={currentTable.pagination.page === currentTable.pagination.totalPages - 1 || currentTable.state.loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {currentUsers.length === 0 && !currentLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <IconComponent className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No {getUserTypeLabel(activeTab)} Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No {activeTab.toLowerCase().replace('_', ' ')}s found in this institute. Click the button above to load data.
            </p>
          </CardContent>
        </Card>
      )}

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getUserTypeLabel(activeTab).slice(0, -1)} Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.imageUrl || ''} alt={selectedUser.name} />
                  <AvatarFallback className="text-lg">
                    {selectedUser.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email || 'N/A'}</p>
                  <Badge variant="outline">{activeTab.replace('_', ' ')}</Badge>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">User ID</label>
                  <p className="text-sm">{selectedUser.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-sm">{selectedUser.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-sm">{selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Institute User ID</label>
                  <p className="text-sm">{selectedUser.userIdByInstitute || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Verified By</label>
                  <p className="text-sm">{selectedUser.verifiedBy || 'N/A'}</p>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-lg font-medium mb-3">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address Line 1</label>
                    <p className="text-sm">{selectedUser.addressLine1 || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address Line 2</label>
                    <p className="text-sm">{selectedUser.addressLine2 || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Family Information (Students only) */}
              {activeTab === 'STUDENT' && (selectedUser.fatherId || selectedUser.motherId || selectedUser.guardianId) && (
                <div>
                  <h4 className="text-lg font-medium mb-3">Family Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedUser.fatherId && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Father ID</label>
                        <p className="text-sm">{selectedUser.fatherId}</p>
                      </div>
                    )}
                    {selectedUser.motherId && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Mother ID</label>
                        <p className="text-sm">{selectedUser.motherId}</p>
                      </div>
                    )}
                    {selectedUser.guardianId && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Guardian ID</label>
                        <p className="text-sm">{selectedUser.guardianId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <CreateUserForm
            onSubmit={handleCreateUser}
            onCancel={() => setShowCreateUserDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Assign User Dialog */}
      <Dialog open={showAssignUserDialog} onOpenChange={setShowAssignUserDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign User to Institute</DialogTitle>
          </DialogHeader>
          <AssignUserForm
            instituteId={currentInstituteId!}
            onSubmit={handleAssignUser}
            onCancel={() => setShowAssignUserDialog(false)}
            initialUserId={assignInitialUserId}
          />
        </DialogContent>
      </Dialog>

      {/* Assign Parent Dialog */}
      <Dialog open={showAssignParentDialog} onOpenChange={setShowAssignParentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Parent to Student</DialogTitle>
          </DialogHeader>
          {selectedStudentForParent && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Assigning parent to:</p>
              <p className="font-medium">{selectedStudentForParent.name}</p>
              <p className="text-sm text-muted-foreground">ID: {selectedStudentForParent.id}</p>
            </div>
          )}
          <AssignParentByPhoneForm
            studentId={selectedStudentForParent?.id || ''}
            onSubmit={handleParentAssignment}
            onCancel={() => {
              setShowAssignParentDialog(false);
              setSelectedStudentForParent(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Create Student Dialog */}
      {showCreateStudentDialog && (
        <CreateStudentForm
          onSubmit={handleCreateStudent}
          onCancel={() => setShowCreateStudentDialog(false)}
          loading={createStudentRequest.loading}
        />
      )}

      {/* Assign User Methods Dialog */}
      <AssignUserMethodsDialog
        open={showAssignMethodsDialog}
        onClose={() => setShowAssignMethodsDialog(false)}
        instituteId={currentInstituteId}
        onSuccess={() => {
          // Refresh the current tab data
          getCurrentTable().actions.refresh();
        }}
      />
    </div>
  );
};

export default InstituteUsers;
