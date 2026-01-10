import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import { userProfileApi, validateProfileData } from '@/api/userProfile.api';
import { 
  UserProfileResponse, 
  UpdateProfileRequest,
  UserType,
  Gender,
  Province,
  District,
  PreferredLanguage,
  BloodGroup,
  PROVINCE_DISTRICTS
} from '@/types/userProfile.types';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Mail, Phone, MapPin, Calendar, Shield, Edit, Save, X, Lock, 
  CreditCard, Eye, EyeOff, Camera, RefreshCw, AlertCircle, Building,
  Heart, Briefcase, GraduationCap, Globe
} from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for editable fields
  const [formData, setFormData] = useState<UpdateProfileRequest>({});
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false
  });
  
  const [activeProfileTab, setActiveProfileTab] = useState('details');

  // Load profile data
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await userProfileApi.getProfile();
      setProfile(data);
      
      // Initialize form with existing data
      setFormData({
        nic: data.nic || '',
        birthCertificateNo: data.birthCertificateNo || '',
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender,
        addressLine1: data.addressLine1 || '',
        addressLine2: data.addressLine2 || '',
        city: data.city || '',
        district: data.district,
        province: data.province,
        postalCode: data.postalCode || '',
        country: data.country || 'SRI_LANKA',
        preferredLanguage: data.preferredLanguage || PreferredLanguage.ENGLISH,
        emergencyContact: data.emergencyContact || '',
        bloodGroup: data.bloodGroup || '',
        occupation: data.occupation || '',
        workplace: data.workplace || '',
        educationLevel: data.educationLevel || ''
      });
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load profile');
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Auto-load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Handle form field changes
  const handleChange = (field: keyof UpdateProfileRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle save
  const handleSave = async () => {
    // Validate data
    const errors = validateProfileData(formData);
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const updatedProfile = await userProfileApi.updateProfile(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update profile.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    if (profile) {
      setFormData({
        nic: profile.nic || '',
        birthCertificateNo: profile.birthCertificateNo || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender,
        addressLine1: profile.addressLine1 || '',
        addressLine2: profile.addressLine2 || '',
        city: profile.city || '',
        district: profile.district,
        province: profile.province,
        postalCode: profile.postalCode || '',
        country: profile.country || 'SRI_LANKA',
        preferredLanguage: profile.preferredLanguage || PreferredLanguage.ENGLISH,
        emergencyContact: profile.emergencyContact || '',
        bloodGroup: profile.bloodGroup || '',
        occupation: profile.occupation || '',
        workplace: profile.workplace || '',
        educationLevel: profile.educationLevel || ''
      });
    }
    setIsEditing(false);
  };

  // Handle image update
  const handleImageUpdate = (newImageUrl: string) => {
    if (profile) {
      setProfile({ ...profile, imageUrl: newImageUrl });
    }
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    if (password.length < 8 || password.length > 20) return false;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    return hasLowercase && hasUppercase && hasNumber && hasSpecial;
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      toast({
        title: "Error",
        description: "All password fields are required.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast({
        title: "Error", 
        description: "New passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    if (!validatePassword(passwordData.newPassword)) {
      toast({
        title: "Error",
        description: "Password must be 8-20 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        variant: "destructive"
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_LMS_BASE_URL || 'https://lmsapi.suraksha.lk';
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast({
          title: "Error",
          description: "Please login again to change your password.",
          variant: "destructive"
        });
        await logout();
        return;
      }

      let response = await fetch(`${baseUrl}/v2/auth/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmNewPassword: passwordData.confirmNewPassword
        })
      });

      if (response.status === 404) {
        response = await fetch(`${baseUrl}/auth/change-password`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
            confirmNewPassword: passwordData.confirmNewPassword
          })
        });
      }

      const data = await response.json();

      if (response.ok && (data.success !== false || data.isSuccess || data.message === "Password changed successfully")) {
        toast({
          title: "Success",
          description: "✅ Your Password Changed Successfully! You will be logged out now.",
        });
        
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
        
        setTimeout(async () => {
          await logout();
        }, 2000);
      } else if (response.status === 401) {
        const errorMessage = data.details?.message || data.message || "Invalid current password or session expired.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        const errorMessage = data.message || data.details?.message || "Failed to change password.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (profile?.nameWithInitials) {
      const parts = profile.nameWithInitials.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return profile.nameWithInitials.substring(0, 2).toUpperCase();
    }
    if (user?.name) {
      const parts = user.name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Get available districts based on selected province
  const getAvailableDistricts = (): District[] => {
    if (formData.province && formData.province in PROVINCE_DISTRICTS) {
      return PROVINCE_DISTRICTS[formData.province as Province];
    }
    return Object.values(District);
  };

  // Check if user is student
  const isStudent = profile?.userType === UserType.STUDENT;
  
  // Check if user is parent
  const isParent = profile?.userType === UserType.PARENT;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl -z-10" />
          
          <div className="relative bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
            
            <div className="relative p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Profile Image */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-background shadow-xl">
                      <AvatarImage src={profile?.imageUrl || ''} alt="Profile" />
                      <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute bottom-2 right-2 h-10 w-10 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300"
                      onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="change-photo"]')?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="hidden">
                    <ProfileImageUpload 
                      currentImageUrl={profile?.imageUrl} 
                      onImageUpdate={handleImageUpdate} 
                    />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text mb-2">
                      {profile?.nameWithInitials || user?.name || "Welcome"}
                    </h1>
                    <p className="text-muted-foreground text-base md:text-lg flex items-center justify-center md:justify-start gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-sm">
                        <Shield className="h-3 w-3 mr-1" />
                        {profile?.userType || user?.userType || 'USER'}
                      </Badge>
                      {profile?.studentId && (
                        <>
                          <span>•</span>
                          <span className="text-sm">ID: {profile.studentId}</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                    {profile?.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                        <Mail className="h-4 w-4" />
                        <span className="hidden sm:inline">{profile.email}</span>
                        <span className="text-xs text-amber-600">(masked)</span>
                      </div>
                    )}
                    {profile?.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                        <Phone className="h-4 w-4" />
                        <span>{profile.phoneNumber}</span>
                        <span className="text-xs text-amber-600">(masked)</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 justify-center md:justify-start">
                    <Button variant="outline" size="sm" onClick={loadProfile} disabled={loading}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    {!isEditing ? (
                      <Button size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={handleCancel} className="gap-2">
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
                          <Save className="h-4 w-4" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Main Content Tabs */}
        <div className="space-y-6">
          <Tabs value={activeProfileTab} onValueChange={setActiveProfileTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1.5 bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm rounded-xl border border-border/50">
              <TabsTrigger 
                value="details" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary py-3 px-4 text-sm font-medium transition-all rounded-lg"
              >
                <User className="h-4 w-4 mr-2 inline" />
                <span className="hidden sm:inline">Details</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger 
                value="change-password" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary py-3 px-4 text-sm font-medium transition-all rounded-lg"
              >
                <Lock className="h-4 w-4 mr-2 inline" />
                <span className="hidden sm:inline">Security</span>
                <span className="sm:hidden">Sec</span>
              </TabsTrigger>
              <TabsTrigger 
                value="user-id" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary py-3 px-4 text-sm font-medium transition-all rounded-lg"
              >
                <CreditCard className="h-4 w-4 mr-2 inline" />
                <span className="hidden sm:inline">ID Card</span>
                <span className="sm:hidden">ID</span>
              </TabsTrigger>
            </TabsList>
              
            <TabsContent value="details" className="space-y-6">
              {/* Account Information - Read Only */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Account Information</CardTitle>
                      <CardDescription>
                        These details cannot be changed directly. Contact admin for updates.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-muted-foreground">Name</Label>
                      <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center">
                        <p className="font-medium">{profile?.nameWithInitials || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-muted-foreground">Email</Label>
                      <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{profile?.email || '-'}</p>
                        <Badge variant="outline" className="text-xs ml-auto">Masked</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-muted-foreground">Phone</Label>
                      <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{profile?.phoneNumber || '-'}</p>
                        <Badge variant="outline" className="text-xs ml-auto">Masked</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-muted-foreground">User Type</Label>
                      <div className="h-12 px-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <p className="font-semibold text-primary">{profile?.userType || '-'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information - Editable */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nic" className="text-sm font-semibold">NIC (Optional)</Label>
                      {isEditing ? (
                        <Input 
                          id="nic" 
                          value={formData.nic || ''} 
                          onChange={e => handleChange('nic', e.target.value)} 
                          maxLength={12}
                          placeholder="123456789V or 200012345678"
                          className="h-12"
                        />
                      ) : (
                        <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center">
                          <p className="font-medium">{profile?.nic || 'Not set'}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-sm font-semibold">Date of Birth</Label>
                      {isEditing ? (
                        <Input 
                          id="dateOfBirth" 
                          type="date"
                          value={formData.dateOfBirth || ''} 
                          onChange={e => handleChange('dateOfBirth', e.target.value)} 
                          className="h-12"
                        />
                      ) : (
                        <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{profile?.dateOfBirth || 'Not set'}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-semibold">Gender</Label>
                      {isEditing ? (
                        <Select value={formData.gender || ''} onValueChange={(value) => handleChange('gender', value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={Gender.MALE}>Male</SelectItem>
                            <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                            <SelectItem value={Gender.OTHER}>Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center">
                          <p className="font-medium">{profile?.gender || 'Not set'}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredLanguage" className="text-sm font-semibold">Preferred Language</Label>
                      {isEditing ? (
                        <Select value={formData.preferredLanguage || ''} onValueChange={(value) => handleChange('preferredLanguage', value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={PreferredLanguage.ENGLISH}>English</SelectItem>
                            <SelectItem value={PreferredLanguage.SINHALA}>Sinhala</SelectItem>
                            <SelectItem value={PreferredLanguage.TAMIL}>Tamil</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{profile?.preferredLanguage || 'English'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Address Information</CardTitle>
                      <CardDescription>
                        Update your address details
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="addressLine1" className="text-sm font-semibold">Address Line 1</Label>
                      {isEditing ? (
                        <Input 
                          id="addressLine1" 
                          value={formData.addressLine1 || ''} 
                          onChange={e => handleChange('addressLine1', e.target.value)} 
                          maxLength={200}
                          placeholder="Street address"
                          className="h-12"
                        />
                      ) : (
                        <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center">
                          <p className="font-medium">{profile?.addressLine1 || 'Not set'}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="addressLine2" className="text-sm font-semibold">Address Line 2 (Optional)</Label>
                      {isEditing ? (
                        <Input 
                          id="addressLine2" 
                          value={formData.addressLine2 || ''} 
                          onChange={e => handleChange('addressLine2', e.target.value)} 
                          maxLength={200}
                          placeholder="Apartment, suite, etc."
                          className="h-12"
                        />
                      ) : (
                        <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center">
                          <p className="font-medium">{profile?.addressLine2 || '-'}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-semibold">City</Label>
                      {isEditing ? (
                        <Input 
                          id="city" 
                          value={formData.city || ''} 
                          onChange={e => handleChange('city', e.target.value)} 
                          maxLength={50}
                          placeholder="City"
                          className="h-12"
                        />
                      ) : (
                        <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center">
                          <p className="font-medium">{profile?.city || 'Not set'}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="province" className="text-sm font-semibold">Province</Label>
                      {isEditing ? (
                        <Select value={formData.province || ''} onValueChange={(value) => handleChange('province', value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(Province).map(province => (
                              <SelectItem key={province} value={province}>
                                {province.replace(/_/g, ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center">
                          <p className="font-medium">{profile?.province?.replace(/_/g, ' ') || 'Not set'}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="district" className="text-sm font-semibold">District</Label>
                      {isEditing ? (
                        <Select value={formData.district || ''} onValueChange={(value) => handleChange('district', value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableDistricts().map(district => (
                              <SelectItem key={district} value={district}>
                                {district.replace(/_/g, ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center">
                          <p className="font-medium">{profile?.district?.replace(/_/g, ' ') || 'Not set'}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-sm font-semibold">Postal Code</Label>
                      {isEditing ? (
                        <Input 
                          id="postalCode" 
                          value={formData.postalCode || ''} 
                          onChange={e => handleChange('postalCode', e.target.value)} 
                          maxLength={6}
                          placeholder="10100"
                          className="h-12"
                        />
                      ) : (
                        <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center">
                          <p className="font-medium">{profile?.postalCode || 'Not set'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Information - Only for students */}
              {isStudent && (
                <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Student Information</CardTitle>
                        <CardDescription>
                          Additional details for students
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile?.studentId && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-muted-foreground">Student ID</Label>
                          <div className="h-12 px-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 flex items-center">
                            <p className="font-semibold text-primary">{profile.studentId}</p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="emergencyContact" className="text-sm font-semibold">Emergency Contact</Label>
                        {isEditing ? (
                          <Input 
                            id="emergencyContact" 
                            value={formData.emergencyContact || ''} 
                            onChange={e => handleChange('emergencyContact', e.target.value)} 
                            maxLength={15}
                            placeholder="+94771234567"
                            className="h-12"
                          />
                        ) : (
                          <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{profile?.emergencyContact || 'Not set'}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bloodGroup" className="text-sm font-semibold">Blood Group</Label>
                        {isEditing ? (
                          <Select value={formData.bloodGroup || ''} onValueChange={(value) => handleChange('bloodGroup', value)}>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select blood group" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(BloodGroup).map(group => (
                                <SelectItem key={group} value={group}>{group}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center gap-2">
                            <Heart className="h-4 w-4 text-destructive" />
                            <p className="font-medium">{profile?.bloodGroup || 'Not set'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Parent Information - Only for parents */}
              {isParent && (
                <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Parent Information</CardTitle>
                        <CardDescription>
                          Additional details for parents
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="occupation" className="text-sm font-semibold">Occupation</Label>
                        {isEditing ? (
                          <Input 
                            id="occupation" 
                            value={formData.occupation || ''} 
                            onChange={e => handleChange('occupation', e.target.value)} 
                            maxLength={100}
                            placeholder="Your occupation"
                            className="h-12"
                          />
                        ) : (
                          <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center">
                            <p className="font-medium">{profile?.occupation || 'Not set'}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="workplace" className="text-sm font-semibold">Workplace</Label>
                        {isEditing ? (
                          <Input 
                            id="workplace" 
                            value={formData.workplace || ''} 
                            onChange={e => handleChange('workplace', e.target.value)} 
                            maxLength={100}
                            placeholder="Your workplace"
                            className="h-12"
                          />
                        ) : (
                          <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{profile?.workplace || 'Not set'}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="educationLevel" className="text-sm font-semibold">Education Level</Label>
                        {isEditing ? (
                          <Input 
                            id="educationLevel" 
                            value={formData.educationLevel || ''} 
                            onChange={e => handleChange('educationLevel', e.target.value)} 
                            maxLength={50}
                            placeholder="Your education level"
                            className="h-12"
                          />
                        ) : (
                          <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border/50 flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{profile?.educationLevel || 'Not set'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
              
            <TabsContent value="change-password" className="space-y-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-md">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-semibold">Change Password</CardTitle>
                      <CardDescription className="text-base mt-1">
                        Update your account password to keep your account secure
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-6">
                    <div className="relative">
                      <Label htmlFor="currentPassword" className="text-sm font-semibold text-foreground/80">
                        Current Password
                      </Label>
                      <div className="mt-2 relative">
                        <Input 
                          id="currentPassword" 
                          type={passwordVisibility.currentPassword ? "text" : "password"} 
                          placeholder="Enter your current password" 
                          value={passwordData.currentPassword} 
                          onChange={e => setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value
                          })} 
                          className="pr-10 h-12 bg-background/50 border-2 border-border/50 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-lg" 
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisibility({
                            ...passwordVisibility,
                            currentPassword: !passwordVisibility.currentPassword
                          })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                        >
                          {passwordVisibility.currentPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Label htmlFor="newPassword" className="text-sm font-semibold text-foreground/80">
                        New Password
                      </Label>
                      <div className="mt-2 relative">
                        <Input 
                          id="newPassword" 
                          type={passwordVisibility.newPassword ? "text" : "password"} 
                          placeholder="Enter your new password" 
                          value={passwordData.newPassword} 
                          onChange={e => setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value
                          })} 
                          className="pr-10 h-12 bg-background/50 border-2 border-border/50 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-lg" 
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisibility({
                            ...passwordVisibility,
                            newPassword: !passwordVisibility.newPassword
                          })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                        >
                          {passwordVisibility.newPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Password must be 8-20 characters with uppercase, lowercase, number and special character
                      </p>
                    </div>
                    
                    <div className="relative">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground/80">
                        Confirm New Password
                      </Label>
                      <div className="mt-2 relative">
                        <Input 
                          id="confirmPassword" 
                          type={passwordVisibility.confirmNewPassword ? "text" : "password"} 
                          placeholder="Confirm your new password" 
                          value={passwordData.confirmNewPassword} 
                          onChange={e => setPasswordData({
                            ...passwordData,
                            confirmNewPassword: e.target.value
                          })}
                          className="pr-10 h-12 bg-background/50 border-2 border-border/50 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-lg" 
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisibility({
                            ...passwordVisibility,
                            confirmNewPassword: !passwordVisibility.confirmNewPassword
                          })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                        >
                          {passwordVisibility.confirmNewPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        onClick={handlePasswordChange}
                        disabled={passwordLoading}
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        {passwordLoading ? "Updating..." : "Update Password"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
              
            <TabsContent value="user-id" className="space-y-6">
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">User ID Management</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        Manage identification documents and digital credentials
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-12 text-muted-foreground">
                    <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">ID Card Feature Coming Soon</p>
                    <p className="text-sm mt-2">Digital ID card and document management will be available soon.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
