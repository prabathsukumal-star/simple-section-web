import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import MUITable from '@/components/ui/mui-table';
import { 
  Users, 
  RefreshCw, 
  Search, 
  Plus,
  AlertTriangle,
  User,
  MapPin,
  Phone,
  Briefcase,
  Calendar,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { type UserRole } from '@/contexts/types/auth.types';
import { useToast } from '@/hooks/use-toast';
import { useTableData } from '@/hooks/useTableData';
import CreateParentForm from '@/components/forms/CreateParentForm';

const Parents = () => {
  const { user, selectedInstitute } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const userRole = (user?.role || 'Student') as UserRole;
  const canViewParents = userRole === 'InstituteAdmin';
  const canCreateParents = userRole === 'InstituteAdmin';

  // Use the useTableData hook for better data management and pagination
  const tableData = useTableData({
    endpoint: selectedInstitute ? `/institute-users/institute/${selectedInstitute.id}/users/PARENT` : '',
    autoLoad: false,
    pagination: {
      defaultLimit: 50,
      availableLimits: [25, 50, 100]
    }
  });

  // Table columns configuration
  const columns = [
    {
      id: 'imageUrl',
      label: 'Avatar',
      minWidth: 80,
      align: 'center' as const,
      format: (value: string, row: any) => (
        <Avatar className="h-8 w-8 md:h-10 md:w-10">
          <AvatarImage src={value} alt={row.name} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )
    },
    {
      id: 'userIdByInstitute',
      label: 'Institute ID',
      minWidth: 100,
      format: (value: string) => (
        <div className="font-medium text-sm">
          {value || 'Not assigned'}
        </div>
      )
    },
    {
      id: 'name',
      label: 'Name',
      minWidth: 150,
      format: (value: string) => (
        <div className="font-medium text-sm md:text-base">
          {value}
        </div>
      )
    },
    {
      id: 'phoneNumber',
      label: 'Phone',
      minWidth: 130,
      format: (value: string) => (
        <div className="text-sm flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          {value || 'Not specified'}
        </div>
      )
    },
    {
      id: 'dateOfBirth',
      label: 'Date of Birth',
      minWidth: 120,
      format: (value: string) => (
        <div className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {value ? new Date(value).toLocaleDateString() : 'Not specified'}
        </div>
      )
    },
    {
      id: 'addressLine1',
      label: 'Address',
      minWidth: 200,
      format: (value: string, row: any) => (
        <div className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <div>{value || 'Not specified'}</div>
            {row.addressLine2 && (
              <div className="text-xs text-muted-foreground">{row.addressLine2}</div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'occupation',
      label: 'Occupation',
      minWidth: 130,
      format: (value: string, row: any) => (
        <div className="text-sm">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            {value || 'Not specified'}
          </div>
          {row.workPlace && (
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              <Home className="h-3 w-3" />
              {row.workPlace}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'verifiedBy',
      label: 'Status',
      minWidth: 100,
      align: 'center' as const,
      format: (value: string) => (
        <Badge 
          variant={value ? "default" : "secondary"}
          className="text-xs"
        >
          {value ? 'Verified' : 'Unverified'}
        </Badge>
      )
    }
  ];
  const handleCreateParentSubmit = (data: any) => {
    toast({
      title: "Success",
      description: "Parent created successfully",
    });
    setShowCreateDialog(false);
    tableData.actions.refresh(); // Refresh the list
  };

  // Filter data based on search term
  const filteredData = searchTerm.trim() 
    ? tableData.state.data.filter(parent =>
        parent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.addressLine1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.addressLine2?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.workPlace?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : tableData.state.data;

  // Access control check
  if (!canViewParents) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
        <p className="text-muted-foreground">
          You don't have permission to view parents. Only Institute Admins can access this section.
        </p>
      </div>
    );
  }

  // Selection requirement check
  if (!selectedInstitute) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Users className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Selection Required</h3>
        <p className="text-muted-foreground">
          Please select an institute to view parents.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 md:w-8 md:h-8" />
            Institute Parents
          </h1>
          <div className="text-sm md:text-base text-muted-foreground">
            <p>Institute: <span className="font-medium">{selectedInstitute.name}</span></p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Button
            onClick={() => tableData.actions.refresh()}
            disabled={tableData.state.loading}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${tableData.state.loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {canCreateParents && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Parent
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Parent</DialogTitle>
                  <DialogDescription>
                    Add a new parent to the institute
                  </DialogDescription>
                </DialogHeader>
                <CreateParentForm 
                  onSubmit={handleCreateParentSubmit}
                  onCancel={() => setShowCreateDialog(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Input
          type="text"
          placeholder="Search parents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Parent Statistics</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl md:text-2xl font-bold">{tableData.pagination.totalCount}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Total Parents</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold">{filteredData.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Filtered Results</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold">{tableData.pagination.page + 1}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Current Page</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold">{tableData.pagination.totalPages}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Total Pages</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parents MUI Table */}
      <MUITable
        title="Institute Parents"
        columns={columns}
        data={filteredData}
        page={tableData.pagination.page}
        rowsPerPage={tableData.pagination.limit}
        totalCount={tableData.pagination.totalCount}
        onPageChange={tableData.actions.setPage}
        onRowsPerPageChange={tableData.actions.setLimit}
        rowsPerPageOptions={tableData.availableLimits}
        allowAdd={false}
        allowEdit={false}
        allowDelete={false}
      />
    </div>
  );
};

export default Parents;
