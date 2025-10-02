import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Truck, MapPin, Clock, User, Phone, Calendar, DollarSign, Bus, AlertCircle, X, Plus } from 'lucide-react';
import { getStudentTransportEnrollments, TransportEnrollment } from '@/api/studentTransport.api';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { TransportEnrollmentDialog } from '@/components/forms/TransportEnrollmentDialog';
const Transport = () => {
  const {
    selectedInstitute,
    user
  } = useAuth();
  const {
    navigateToPage
  } = useAppNavigation();
  const [enrollments, setEnrollments] = useState<TransportEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<TransportEnrollment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTransport, setDialogTransport] = useState<TransportEnrollment | null>(null);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  useEffect(() => {
    // For demo purposes, use hardcoded studentId = "3"
    // In real app, use user?.id when user?.userType === 'STUDENT'
    loadTransportEnrollments();
  }, []);
  const loadTransportEnrollments = async () => {
    setLoading(true);
    setError(null);
    try {
      // Using hardcoded studentId "3" for demo
      const response = await getStudentTransportEnrollments("3", {
        page: 1,
        limit: 10
      });
      setEnrollments(response.enrollments);

      // Set first active enrollment as selected by default
      const activeEnrollment = response.enrollments.find(e => e.status === 'ACTIVE');
      if (activeEnrollment) {
        setSelectedTransport(activeEnrollment);
      }
    } catch (error) {
      console.error('Error loading transport enrollments:', error);
      setError('Failed to load transport enrollments. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'INACTIVE':
        return 'outline';
      default:
        return 'outline';
    }
  };
  return <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Truck className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Transport Services</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={() => setEnrollmentDialogOpen(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Enroll Transport</span>
          </Button>
          {selectedInstitute && <p className="text-muted-foreground">Institute: {selectedInstitute.name}</p>}
        </div>
      </div>

      {/* Transport Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {enrollments.map(enrollment => {
        const openDialog = () => {
          setDialogTransport(enrollment);
          setDialogOpen(true);
        };
        return <div key={enrollment._id} className="relative flex w-80 flex-col rounded-xl bg-card text-card-foreground shadow-md transition-all duration-200 hover:shadow-lg">
              {/* Gradient Header */}
              <div className="relative mx-4 -mt-6 h-40 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-border text-white shadow-lg shadow-primary/40">
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Basic Info - Always Visible */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-center text-lg font-semibold">
                      {enrollment.bookhireId.vehicleNumber}
                    </div>
                    <div className="text-center text-muted-foreground">
                      ({enrollment.bookhireId.year})
                    </div>
                    <div className="text-center font-medium">
                      {enrollment.bookhireId.route}
                    </div>
                    <div className="text-center">
                      {enrollment.ownerId.ownerName}
                    </div>
                    <div className="text-center text-muted-foreground">
                      {enrollment.ownerId.phoneNumber}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer with Buttons */}
              <div className="p-6 pt-0 space-y-2">
                <Button variant="outline" className="w-full rounded-lg py-3 px-6 text-xs font-bold uppercase shadow-md transition-all hover:shadow-lg" onClick={openDialog}>
                  Show More
                </Button>
                <Button className="w-full rounded-lg py-3 px-6 text-xs font-bold uppercase shadow-md transition-all hover:shadow-lg" onClick={() => {
              setSelectedTransport(enrollment);
              localStorage.setItem('selectedTransport', JSON.stringify(enrollment));
              navigateToPage('transport-selection');
            }}>
                  Select Transport
                </Button>
              </div>
            </div>;
      })}
      </div>

      {/* Transport Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-primary" />
              <span>Transport Details - {dialogTransport?.bookhireId.vehicleNumber}</span>
            </DialogTitle>
            
          </DialogHeader>
          
          {dialogTransport && <div className="space-y-6">
              {/* Vehicle Information */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Bus className="h-5 w-5 mr-2 text-primary" />
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Vehicle Number:</span>
                    <p className="font-medium">{dialogTransport.bookhireId.vehicleNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Year:</span>
                    <p className="font-medium">{dialogTransport.bookhireId.year}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Route:</span>
                    <p className="font-medium">{dialogTransport.bookhireId.route}</p>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Owner Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Owner Name:</span>
                    <p className="font-medium">{dialogTransport.ownerId.ownerName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone Number:</span>
                    <p className="font-medium flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {dialogTransport.ownerId.phoneNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-center">
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
                  {dialogTransport.status}
                </Badge>
              </div>

              {/* Timing Information */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Schedule
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Pickup Time:</span>
                    <p className="font-medium">{dialogTransport.pickupTime}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dropoff Time:</span>
                    <p className="font-medium">{dialogTransport.dropoffTime}</p>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Locations
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Pickup Location:</span>
                    <p className="font-medium">{dialogTransport.pickupLocation}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dropoff Location:</span>
                    <p className="font-medium">{dialogTransport.dropoffLocation}</p>
                  </div>
                </div>
              </div>

              {/* Fee Information */}
              <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  
                  Payment Information
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Monthly Fee:</span>
                  <span className="text-2xl font-bold text-primary">Rs. {dialogTransport.monthlyFee.toLocaleString()}</span>
                </div>
              </div>

              {/* Special Instructions */}
              {dialogTransport.specialInstructions && <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2 flex items-center text-amber-700">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Special Instructions
                  </h3>
                  <p className="text-amber-600">{dialogTransport.specialInstructions}</p>
                </div>}

              {/* Action Button */}
              <div className="pt-4">
                <Button className="w-full py-3 text-sm font-semibold" onClick={() => {
              setSelectedTransport(dialogTransport);
              localStorage.setItem('selectedTransport', JSON.stringify(dialogTransport));
              setDialogOpen(false);
              navigateToPage('transport-selection');
            }}>
                  Select This Transport
                </Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>

      {/* Transport Enrollment Dialog */}
      <TransportEnrollmentDialog open={enrollmentDialogOpen} onOpenChange={setEnrollmentDialogOpen} onEnrollmentSuccess={() => {
      // Reload transport enrollments after successful enrollment
      loadTransportEnrollments();
    }} />
    </div>;
};
export default Transport;