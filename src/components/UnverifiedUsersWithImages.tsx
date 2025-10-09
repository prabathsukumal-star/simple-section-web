import { useState } from 'react';
import { Button } from '@/components/ui/button';
import MUITable from '@/components/ui/mui-table';
import { useAuth } from '@/contexts/AuthContext';
import { useTableData } from '@/hooks/useTableData';
import { Upload, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';

interface UnverifiedUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  userIdByInstitute: string;
  instituteUserImageUrl: string | null;
  isImageVerified: boolean;
  imageVerifiedBy: string | null;
}

interface ImageUploadDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  onUploadSuccess: () => void;
}

const ImageUploadDialog = ({ open, onClose, userId, userName, onUploadSuccess }: ImageUploadDialogProps) => {
  const { selectedInstitute } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedInstitute) {
      toast({
        title: "Error",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await apiClient.post(
        `/institute-users/institute/${selectedInstitute.id}/users/${userId}/upload-image`,
        formData
      );

      toast({
        title: "Success",
        description: response.message || "Image uploaded successfully",
      });

      setSelectedFile(null);
      setPreviewUrl(null);
      onUploadSuccess();
      onClose();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error?.response?.data?.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Institute User Image</DialogTitle>
          <DialogDescription>
            Upload verification image for {userName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border rounded-md"
              disabled={uploading}
            />
          </div>

          {previewUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Preview</label>
              <div className="border rounded-md p-2">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-w-full h-auto max-h-[300px] mx-auto"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const UnverifiedUsersWithImages = () => {
  const { selectedInstitute } = useAuth();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UnverifiedUser | null>(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const tableData = useTableData<UnverifiedUser>({
    endpoint: selectedInstitute 
      ? `/institute-users/institute/${selectedInstitute.id}/users/unverified-with-images`
      : '',
    pagination: {
      defaultLimit: 10,
      availableLimits: [10, 25, 50, 100]
    },
    autoLoad: false
  });

  const { state, actions } = tableData;

  const handleLoadData = () => {
    if (selectedInstitute) {
      actions.loadData(true);
    } else {
      toast({
        title: "No Institute Selected",
        description: "Please select an institute first",
        variant: "destructive",
      });
    }
  };

  const handleUploadClick = (user: UnverifiedUser) => {
    setSelectedUser(user);
    setUploadDialogOpen(true);
  };

  const handleViewImage = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl);
    setImagePreviewOpen(true);
  };

  const handleUploadSuccess = () => {
    actions.refresh();
  };

  const columns = [
    {
      id: 'userIdByInstitute',
      label: 'User ID',
      minWidth: 100,
    },
    {
      id: 'name',
      label: 'Name',
      minWidth: 150,
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 200,
    },
    {
      id: 'phoneNumber',
      label: 'Phone',
      minWidth: 130,
    },
    {
      id: 'dateOfBirth',
      label: 'Date of Birth',
      minWidth: 120,
      format: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      id: 'instituteUserImageUrl',
      label: 'Image Status',
      minWidth: 150,
      format: (value: string | null, row: UnverifiedUser) => {
        if (value) {
          return (
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-medium">Uploaded</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewImage(value)}
                className="h-7 px-2"
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          );
        }
        return <span className="text-orange-600 font-medium">Not Uploaded</span>;
      },
    },
  ];

  const customActions = [
    {
      label: 'Upload',
      icon: <Upload className="h-3 w-3" />,
      action: (row: UnverifiedUser) => handleUploadClick(row),
      variant: 'default' as const,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Unverified Users - Image Verification</h2>
          <p className="text-muted-foreground">Manage institute user image verification</p>
        </div>
        <Button onClick={handleLoadData} disabled={state.loading}>
          {state.loading ? 'Loading...' : 'Load Users'}
        </Button>
      </div>

      {state.error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md">
          {state.error}
        </div>
      )}

      <MUITable
        title="Unverified Users with Images"
        columns={columns}
        data={state.data}
        page={tableData.pagination.page}
        rowsPerPage={tableData.pagination.limit}
        totalCount={tableData.pagination.totalCount}
        onPageChange={tableData.actions.setPage}
        onRowsPerPageChange={tableData.actions.setLimit}
        rowsPerPageOptions={[10, 25, 50, 100]}
        customActions={customActions}
        allowAdd={false}
        allowEdit={false}
        allowDelete={false}
      />

      {selectedUser && (
        <ImageUploadDialog
          open={uploadDialogOpen}
          onClose={() => {
            setUploadDialogOpen(false);
            setSelectedUser(null);
          }}
          userId={selectedUser.id}
          userName={selectedUser.name}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* Image Preview Dialog */}
      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Institute User Image</DialogTitle>
          </DialogHeader>
          {previewImageUrl && (
            <div className="py-4">
              <img 
                src={previewImageUrl} 
                alt="Institute User" 
                className="max-w-full h-auto max-h-[600px] mx-auto rounded-md"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnverifiedUsersWithImages;
