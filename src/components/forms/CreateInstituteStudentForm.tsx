import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { studentsApi, StudentCreateData } from '@/api/students.api';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
interface CreateInstituteStudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
const CreateInstituteStudentForm: React.FC<CreateInstituteStudentFormProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    // User data
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    birthCertificateNo: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    province: '',
    postalCode: '',
    country: '',
    imageUrl: '',
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
      toast({
        title: "Error",
        description: "Please select a date of birth",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const studentData: StudentCreateData = {
        user: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          userType: 'STUDENT',
          dateOfBirth: date ? date.toISOString().split('T')[0] : '',
          gender: formData.gender,
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
          fatherId: null,
          motherId: null,
          guardianId: null
        },
        studentId: formData.studentId,
        emergencyContact: formData.emergencyContact,
        medicalConditions: formData.medicalConditions || undefined,
        allergies: formData.allergies || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        isActive: true
      };
      await studentsApi.create(studentData);
      toast({
        title: "Success",
        description: "Student created successfully!"
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        gender: '',
        birthCertificateNo: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        district: '',
        province: '',
        postalCode: '',
        country: '',
        imageUrl: '',
        studentId: '',
        emergencyContact: '',
        medicalConditions: '',
        allergies: '',
        bloodGroup: ''
      });
      setDate(undefined);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating student:', error);
      toast({
        title: "Error",
        description: "Failed to create student. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Student</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" value={formData.firstName} onChange={e => handleInputChange('firstName', e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" value={formData.lastName} onChange={e => handleInputChange('lastName', e.target.value)} required />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input id="password" type="password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} required />
              </div>

              <div>
                <Label>Date of Birth *</Label>
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
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={value => handleInputChange('gender', value)}>
                  <SelectTrigger>
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
                <Label htmlFor="birthCertificateNo">Birth Certificate No</Label>
                <Input id="birthCertificateNo" value={formData.birthCertificateNo} onChange={e => handleInputChange('birthCertificateNo', e.target.value)} />
              </div>
            </div>

            {/* Address & Student Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address Information</h3>
              
              <div>
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input id="addressLine1" value={formData.addressLine1} onChange={e => handleInputChange('addressLine1', e.target.value)} />
              </div>

              <div>
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input id="addressLine2" value={formData.addressLine2} onChange={e => handleInputChange('addressLine2', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input id="district" value={formData.district} onChange={e => handleInputChange('district', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="province">Province</Label>
                  <Input id="province" value={formData.province} onChange={e => handleInputChange('province', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" value={formData.postalCode} onChange={e => handleInputChange('postalCode', e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={formData.country} onChange={e => handleInputChange('country', e.target.value)} />
              </div>

              <div>
                <Label htmlFor="imageUrl">Profile Image URL</Label>
                <Input id="imageUrl" value={formData.imageUrl} onChange={e => handleInputChange('imageUrl', e.target.value)} />
              </div>

              <h3 className="text-lg font-semibold mt-6">Student Information</h3>
              
              <div>
                <Label htmlFor="studentId">Student ID *</Label>
                <Input id="studentId" value={formData.studentId} onChange={e => handleInputChange('studentId', e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                <Input id="emergencyContact" value={formData.emergencyContact} onChange={e => handleInputChange('emergencyContact', e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select value={formData.bloodGroup} onValueChange={value => handleInputChange('bloodGroup', value)}>
                  <SelectTrigger>
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
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea id="medicalConditions" value={formData.medicalConditions} onChange={e => handleInputChange('medicalConditions', e.target.value)} placeholder="Enter any medical conditions..." />
              </div>

              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea id="allergies" value={formData.allergies} onChange={e => handleInputChange('allergies', e.target.value)} placeholder="Enter any allergies..." />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Student
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
};
export default CreateInstituteStudentForm;