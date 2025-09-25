import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { studentsApi } from '@/api/students.api';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { toast } from 'sonner';

interface CreateStudentFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const CreateStudentForm: React.FC<CreateStudentFormProps> = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [date, setDate] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // User data
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    nic: '',
    birthCertificateNo: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    province: '',
    postalCode: '',
    country: '',
    imageUrl: '',
    // Parent data
    fatherId: '',
    motherId: '',
    guardianId: '',
    // Student data
    studentId: '',
    emergencyContact: '',
    medicalConditions: '',
    allergies: '',
    bloodGroup: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast.error('Please select a date of birth');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.studentId || !formData.emergencyContact) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const studentData = {
        user: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password || 'student123',
          phone: formData.phone,
          userType: 'STUDENT',
          dateOfBirth: date.toISOString().split('T')[0],
          gender: formData.gender,
          nic: formData.nic || undefined,
          birthCertificateNo: formData.birthCertificateNo || undefined,
          addressLine1: formData.addressLine1 || undefined,
          addressLine2: formData.addressLine2 || undefined,
          city: formData.city || undefined,
          district: formData.district || undefined,
          province: formData.province || undefined,
          postalCode: formData.postalCode || undefined,
          country: formData.country || undefined,
          imageUrl: formData.imageUrl || undefined,
          isActive: true,
          fatherId: formData.fatherId || null,
          motherId: formData.motherId || null,
          guardianId: formData.guardianId || null,
        },
        studentId: formData.studentId,
        emergencyContact: formData.emergencyContact,
        medicalConditions: formData.medicalConditions || undefined,
        allergies: formData.allergies || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        isActive: true
      };

      const result = await studentsApi.create(studentData);
      toast.success('Student created successfully!');
      onSubmit(result);
    } catch (error: any) {
      console.error('Error creating student:', error);
      toast.error(error?.message || 'Failed to create student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-6xl max-h-[98vh] overflow-y-auto p-6 sm:p-8">
        <DialogHeader className="pb-6 border-b">
          <DialogTitle className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Create New Student
          </DialogTitle>
          <p className="text-muted-foreground text-center mt-2">Complete student information and account details</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Personal Information Section */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-lg border">
                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-base font-semibold">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-base font-semibold">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-base font-semibold">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-base font-semibold">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Leave empty for default password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-base font-semibold">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Date of Birth *</Label>
                    <div className="mt-2">
                      <DatePicker 
                        value={date}
                        onChange={setDate}
                        placeholder="Select date of birth"
                        style={{ width: '100%', height: '48px' }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="gender" className="text-base font-semibold">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger className="mt-2 h-12 text-base">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="nic" className="text-base font-semibold">NIC</Label>
                    <Input
                      id="nic"
                      value={formData.nic}
                      onChange={(e) => handleInputChange('nic', e.target.value)}
                      placeholder="e.g., 200512345678"
                      className="mt-2 h-12 text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="bg-gradient-to-r from-secondary/5 to-secondary/10 p-6 rounded-lg border">
                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                    <span className="text-secondary-foreground font-bold">2</span>
                  </div>
                  Address Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="addressLine1" className="text-base font-semibold">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine2" className="text-base font-semibold">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={formData.addressLine2}
                      onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Area, landmark"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-base font-semibold">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="district" className="text-base font-semibold">District</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter district"
                    />
                  </div>
                  <div>
                    <Label htmlFor="province" className="text-base font-semibold">Province</Label>
                    <Input
                      id="province"
                      value={formData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter province"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-base font-semibold">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Sri Lanka"
                    />
                  </div>
                </div>
              </div>

              {/* Student Information Section */}
              <div className="bg-gradient-to-r from-accent/5 to-accent/10 p-6 rounded-lg border">
                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-accent-foreground font-bold">3</span>
                  </div>
                  Student Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="studentId" className="text-base font-semibold">Student ID *</Label>
                    <Input
                      id="studentId"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      required
                      placeholder="e.g., STU2025025"
                      className="mt-2 h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact" className="text-base font-semibold">Emergency Contact *</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      required
                      className="mt-2 h-12 text-base"
                      placeholder="Enter emergency contact number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bloodGroup" className="text-base font-semibold">Blood Group</Label>
                    <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value)}>
                      <SelectTrigger className="mt-2 h-12 text-base">
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="birthCertificateNo" className="text-base font-semibold">Birth Certificate No</Label>
                    <Input
                      id="birthCertificateNo"
                      value={formData.birthCertificateNo}
                      onChange={(e) => handleInputChange('birthCertificateNo', e.target.value)}
                      placeholder="e.g., BC-112233445"
                      className="mt-2 h-12 text-base"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="medicalConditions" className="text-base font-semibold">Medical Conditions</Label>
                    <Textarea
                      id="medicalConditions"
                      value={formData.medicalConditions}
                      onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                      placeholder="Enter any medical conditions..."
                      rows={3}
                      className="mt-2 text-base"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="allergies" className="text-base font-semibold">Allergies</Label>
                    <Textarea
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      placeholder="Enter any allergies..."
                      rows={3}
                      className="mt-2 text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Parent Information Section */}
              <div className="bg-gradient-to-r from-muted/5 to-muted/10 p-6 rounded-lg border">
                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-muted/20 rounded-full flex items-center justify-center">
                    <span className="text-muted-foreground font-bold">4</span>
                  </div>
                  Parent Information (Optional)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="fatherId" className="text-base font-semibold">Father ID</Label>
                    <Input
                      id="fatherId"
                      value={formData.fatherId}
                      onChange={(e) => handleInputChange('fatherId', e.target.value)}
                      placeholder="Father's user ID"
                      className="mt-2 h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="motherId" className="text-base font-semibold">Mother ID</Label>
                    <Input
                      id="motherId"
                      value={formData.motherId}
                      onChange={(e) => handleInputChange('motherId', e.target.value)}
                      placeholder="Mother's user ID"
                      className="mt-2 h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guardianId" className="text-base font-semibold">Guardian ID</Label>
                    <Input
                      id="guardianId"
                      value={formData.guardianId}
                      onChange={(e) => handleInputChange('guardianId', e.target.value)}
                      placeholder="Guardian's user ID"
                      className="mt-2 h-12 text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-6 pt-8 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-8 text-base">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || loading} className="h-12 px-8 text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
              {(submitting || loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Student
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStudentForm;