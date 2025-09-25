import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, MapPin, Phone, User, DollarSign, Bus } from 'lucide-react';
import { enrollInTransport, TransportEnrollmentRequest } from '@/api/transportEnrollment.api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

interface TransportEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnrollmentSuccess?: () => void;
}

export const TransportEnrollmentDialog: React.FC<TransportEnrollmentDialogProps> = ({
  open,
  onOpenChange,
  onEnrollmentSuccess
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TransportEnrollmentRequest>({
    studentId: user?.id || '',
    studentName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    bookhireId: '',
    startDate: '',
    endDate: '',
    parentContact: '',
    emergencyContact: '',
    pickupLocation: '',
    dropoffLocation: '',
    pickupTime: '',
    dropoffTime: '',
    specialInstructions: '',
    monthlyFee: 0
  });

  const handleInputChange = (field: keyof TransportEnrollmentRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bookhireId || !formData.startDate || !formData.endDate || 
        !formData.parentContact || !formData.emergencyContact || 
        !formData.pickupLocation || !formData.dropoffLocation || 
        !formData.pickupTime || !formData.dropoffTime) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      await enrollInTransport(formData);
      
      toast({
        title: "Enrollment Successful",
        description: "Your transport enrollment request has been submitted successfully.",
      });
      
      onOpenChange(false);
      onEnrollmentSuccess?.();
      
      // Reset form
      setFormData({
        studentId: user?.id || '',
        studentName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
        bookhireId: '',
        startDate: '',
        endDate: '',
        parentContact: '',
        emergencyContact: '',
        pickupLocation: '',
        dropoffLocation: '',
        pickupTime: '',
        dropoffTime: '',
        specialInstructions: '',
        monthlyFee: 0
      });
    } catch (error) {
      toast({
        title: "Enrollment Failed",
        description: error instanceof Error ? error.message : "Failed to submit enrollment request.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bus className="h-5 w-5 text-primary" />
            <span>Enroll in Transport Service</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <span>Student Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID *</Label>
                  <Input
                    id="studentId"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    placeholder="Student ID"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name *</Label>
                  <Input
                    id="studentName"
                    value={formData.studentName}
                    onChange={(e) => handleInputChange('studentName', e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transport Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bus className="h-5 w-5 text-primary" />
                <span>Transport Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bookhireId">Transport ID *</Label>
                <Input
                  id="bookhireId"
                  value={formData.bookhireId}
                  onChange={(e) => handleInputChange('bookhireId', e.target.value)}
                  placeholder="Transport/Bookhire ID"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="flex items-center space-x-1">
                    <CalendarDays className="h-4 w-4" />
                    <span>Start Date *</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="flex items-center space-x-1">
                    <CalendarDays className="h-4 w-4" />
                    <span>End Date *</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-primary" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parentContact">Parent Contact *</Label>
                  <Input
                    id="parentContact"
                    value={formData.parentContact}
                    onChange={(e) => handleInputChange('parentContact', e.target.value)}
                    placeholder="Phone number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Emergency phone number"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Timing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Location & Timing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickupLocation">Pickup Location *</Label>
                  <Input
                    id="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                    placeholder="Pickup address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dropoffLocation">Dropoff Location *</Label>
                  <Input
                    id="dropoffLocation"
                    value={formData.dropoffLocation}
                    onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
                    placeholder="Dropoff address"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickupTime" className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Pickup Time *</span>
                  </Label>
                  <Input
                    id="pickupTime"
                    type="time"
                    value={formData.pickupTime}
                    onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dropoffTime" className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Dropoff Time *</span>
                  </Label>
                  <Input
                    id="dropoffTime"
                    type="time"
                    value={formData.dropoffTime}
                    onChange={(e) => handleInputChange('dropoffTime', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span>Payment & Additional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyFee">Monthly Fee (Rs.)</Label>
                <Input
                  id="monthlyFee"
                  type="number"
                  value={formData.monthlyFee}
                  onChange={(e) => handleInputChange('monthlyFee', Number(e.target.value))}
                  placeholder="Monthly fee amount"
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions || ''}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  placeholder="Any special instructions for the transport service..."
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Enrolling...' : 'Enroll in Transport'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};