import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { subjectsApi, Subject, SubjectStats } from '@/api/subjects.api';
import { getImageUrl } from '@/utils/imageUrlHelper';
import CreateSubjectForm from '@/components/forms/CreateSubjectForm';
import ImagePreviewModal from '@/components/ImagePreviewModal';
import { 
  Plus, 
  RefreshCw, 
  Search, 
  Edit, 
  EyeOff,
  BookOpen,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

const InstituteSubjects = () => {
  const { toast } = useToast();
  const { currentInstituteId, selectedInstitute } = useAuth();
  
  // State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState<SubjectStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  
  // Image preview
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Fetch subjects
  const fetchSubjects = useCallback(async (forceRefresh = false) => {
    if (!currentInstituteId) {
      toast({
        title: "Error",
        description: "Please select an institute first.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const params: any = {};
      
      if (statusFilter === 'active') {
        params.isActive = true;
      } else if (statusFilter === 'inactive') {
        params.isActive = false;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }

      const [subjectsData, statsData] = await Promise.all([
        subjectsApi.getAll(currentInstituteId, params, forceRefresh),
        subjectsApi.getStats(currentInstituteId, forceRefresh)
      ]);
      
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setStats(statsData);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load subjects",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentInstituteId, statusFilter, searchTerm, categoryFilter, toast]);

  useEffect(() => {
    if (currentInstituteId) {
      fetchSubjects();
    }
  }, [currentInstituteId, fetchSubjects]);

  // Handle create subject success
  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchSubjects(true);
    toast({
      title: "Success",
      description: "Subject created successfully"
    });
  };

  // Handle edit subject
  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsEditDialogOpen(true);
  };

  // Handle update success
  const handleUpdateSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedSubject(null);
    fetchSubjects(true);
    toast({
      title: "Success",
      description: "Subject updated successfully"
    });
  };

  // Handle deactivate subject
  const handleDeactivateSubject = async (subject: Subject) => {
    setSubjectToDelete(subject);
    setIsDeleteDialogOpen(true);
  };

  // Confirm deactivate
  const confirmDeactivate = async () => {
    if (!subjectToDelete) return;
    
    setIsDeactivating(true);
    try {
      await subjectsApi.deactivate(subjectToDelete.id);
      toast({
        title: "Success",
        description: `Subject "${subjectToDelete.name}" has been deactivated`
      });
      setIsDeleteDialogOpen(false);
      setSubjectToDelete(null);
      fetchSubjects(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate subject",
        variant: "destructive"
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  // Get unique categories for filter
  const categories = [...new Set(subjects.map(s => s.category).filter(Boolean))];

  // Filter subjects locally based on search term
  const filteredSubjects = subjects.filter(subject => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        subject.code?.toLowerCase().includes(search) ||
        subject.name?.toLowerCase().includes(search) ||
        subject.description?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Institute Subjects
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage subjects for {selectedInstitute?.name || 'your institute'}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Subject
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold text-green-600">{stats.active}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold text-muted-foreground">{stats.inactive}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by code, name, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(v: 'all' | 'active' | 'inactive') => setStatusFilter(v)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => fetchSubjects(true)}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading subjects...</span>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No subjects found</h3>
              <p className="text-muted-foreground mt-1">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first subject to get started'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Credits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <div 
                          className="w-12 h-12 rounded-lg overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                          onClick={() => {
                            if (subject.imgUrl) {
                              setPreviewImage({ 
                                url: getImageUrl(subject.imgUrl), 
                                title: `${subject.name} - Subject Image` 
                              });
                            }
                          }}
                        >
                          <img
                            src={subject.imgUrl ? getImageUrl(subject.imgUrl) : '/placeholder.svg'}
                            alt={subject.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm font-medium">{subject.code}</TableCell>
                      <TableCell className="font-medium">{subject.name || <span className="text-muted-foreground italic">No name</span>}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{subject.category || 'Uncategorized'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{subject.subjectType || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{subject.creditHours ?? 'N/A'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={subject.isActive ? 'default' : 'secondary'} 
                          className={subject.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}
                        >
                          {subject.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSubject(subject)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          {subject.isActive && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeactivateSubject(subject)}
                            >
                              <EyeOff className="h-3 w-3 mr-1" />
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Subject Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>
              Add a new subject to {selectedInstitute?.name || 'your institute'}
            </DialogDescription>
          </DialogHeader>
          <CreateSubjectForm
            onSubmit={handleCreateSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>
              Update subject information
            </DialogDescription>
          </DialogHeader>
          {selectedSubject && (
            <CreateSubjectForm
              onSubmit={handleUpdateSuccess}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedSubject(null);
              }}
              initialData={selectedSubject}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate "{subjectToDelete?.name}"? 
              This subject will no longer appear in active lists but can be reactivated later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeactivate} 
              disabled={isDeactivating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeactivating ? 'Deactivating...' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage.url}
          title={previewImage.title}
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};

export default InstituteSubjects;
