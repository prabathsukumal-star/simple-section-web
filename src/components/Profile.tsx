import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { AccessControl } from '@/utils/permissions';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import { apiClient } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit, Save, X } from 'lucide-react';
interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: string;
  dateOfBirth: string;
  gender: string;
  imageUrl: string;
}
const Profile = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '123 Main Street, City, State 12345',
    bio: 'Experienced educator with a passion for student success.',
    joinDate: '',
    dateOfBirth: '',
    gender: ''
  });
  const userPermissions = AccessControl.getPermissions((user?.role || 'Student') as UserRole);

  // Remove automatic loading - set default values instead
  const loadUserData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      console.log('Fetching user data for ID:', user.id);
      const response = await apiClient.get<UserData>(`/users/${user.id}`);
      console.log('User data response:', response);
      setUserData(response);

      // Update form data with API response
      setFormData({
        name: `${response.firstName} ${response.lastName}`,
        email: response.email,
        phone: response.phone,
        address: '123 Main Street, City, State 12345',
        bio: 'Experienced educator with a passion for student success.',
        joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2023-01-15',
        dateOfBirth: response.dateOfBirth,
        gender: response.gender
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize with default values
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: `${user.firstName || ''} ${user.lastName || ''}`,
        email: user.email || '',
        phone: user.phone || '',
        address: '123 Main Street, City, State 12345',
        bio: 'Experienced educator with a passion for student success.',
        joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2023-01-15',
        dateOfBirth: '',
        gender: ''
      });
    }
    setLoading(false);
  }, [user]);
  const handleSave = () => {
    // Save logic would go here
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };
  const handleCancel = () => {
    if (userData) {
      setFormData({
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        phone: userData.phone,
        address: '123 Main Street, City, State 12345',
        bio: 'Experienced educator with a passion for student success.',
        joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2023-01-15',
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender
      });
    }
    setIsEditing(false);
  };
  const handleImageUpdate = (newImageUrl: string) => {
    if (userData) {
      setUserData({
        ...userData,
        imageUrl: newImageUrl
      });
    }
    console.log('Profile image updated:', newImageUrl);
  };

  // Use the imageUrl from API response
  const currentImageUrl = userData?.imageUrl || '';
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background to-background/80 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <ProfileImageUpload currentImageUrl={currentImageUrl} onImageUpdate={handleImageUpdate} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
              {formData.name || "Welcome"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {user?.role || "User"} • Member since {formData.joinDate}
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="text-sm">
              <Shield className="h-3 w-3 mr-1" />
              {user?.role}
            </Badge>
            <div className="flex gap-2">
              {!isEditing ? <>
                  <Button variant="outline" size="sm" onClick={loadUserData} disabled={loading}>
                    Load Data
                  </Button>
                  
                </> : <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </Button>
                </>}
            </div>
          </div>
        </div>

        {/* Main Content - Centered */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Personal Information - Centered */}
          <div className="lg:col-start-3 lg:col-span-8 space-y-6">
            {/* Basic Information Card */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Your fundamental personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    {isEditing ? <Input id="name" value={formData.name} onChange={e => setFormData({
                    ...formData,
                    name: e.target.value
                  })} className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" /> : <div className="p-3 rounded-md bg-muted/50 border">
                        <p className="font-medium">{formData.name}</p>
                      </div>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    {isEditing ? <Input id="email" type="email" value={formData.email} onChange={e => setFormData({
                    ...formData,
                    email: e.target.value
                  })} className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" /> : <div className="p-3 rounded-md bg-muted/50 border flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{formData.email}</p>
                      </div>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                     {isEditing ? <Input id="phone" value={formData.phone} onChange={e => setFormData({
                    ...formData,
                    phone: e.target.value
                  })} placeholder="+1 (555) 123-4567" className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" /> : <div className="p-3 rounded-md bg-muted/50 border flex items-center gap-2">
                         <Phone className="h-4 w-4 text-muted-foreground" />
                         <p className="font-medium">{formData.phone || 'No phone number added'}</p>
                       </div>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                    {isEditing ? <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={e => setFormData({
                    ...formData,
                    dateOfBirth: e.target.value
                  })} className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" /> : <div className="p-3 rounded-md bg-muted/50 border flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{formData.dateOfBirth}</p>
                      </div>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                    {isEditing ? <Input id="gender" value={formData.gender} onChange={e => setFormData({
                    ...formData,
                    gender: e.target.value
                  })} className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" /> : <div className="p-3 rounded-md bg-muted/50 border">
                        <p className="font-medium">{formData.gender}</p>
                      </div>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Join Date</Label>
                    <div className="p-3 rounded-md bg-muted/50 border flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{formData.joinDate}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                  {isEditing ? <Input id="address" value={formData.address} onChange={e => setFormData({
                  ...formData,
                  address: e.target.value
                })} className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" /> : <div className="p-3 rounded-md bg-muted/50 border flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{formData.address}</p>
                    </div>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">Biography</Label>
                  {isEditing ? <Textarea id="bio" rows={4} value={formData.bio} onChange={e => setFormData({
                  ...formData,
                  bio: e.target.value
                })} className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" placeholder="Tell us about yourself..." /> : <div className="p-4 rounded-md bg-muted/50 border">
                      <p className="text-sm leading-relaxed">{formData.bio}</p>
                    </div>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default Profile;