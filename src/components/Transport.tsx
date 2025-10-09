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
    // Use the logged-in user's ID for loading transport enrollments
    if (user?.id) {
      loadTransportEnrollments(user.id);
    }
  }, [user?.id]);
  const loadTransportEnrollments = async (studentId?: string) => {
    const id = studentId || user?.id;
    if (!id) {
      setError('No user ID available');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getStudentTransportEnrollments(id, {
        page: 1,
        limit: 10
      });
      setEnrollments(response.enrollments);

      // Set first active/approved enrollment as selected by default
      const activeEnrollment = response.enrollments.find(e => e.status === 'ACTIVE' || e.status === 'APPROVED');
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
      case 'APPROVED':
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

      <p className="text-muted-foreground">
        Manage your transportation services and view enrollment details
      </p>

      {/* Loading/Error States */}
      {loading && <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading transport services...</p>
            </div>
          </CardContent>
        </Card>}

      {error && <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <h3 className="text-lg font-semibold">Error Loading Transport</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => loadTransportEnrollments()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>}

      {/* No Transport Message */}
      {!loading && !error && enrollments.length === 0 && <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Bus className="h-16 w-16 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold">No Transport Services Found</h3>
              <p className="text-muted-foreground">
                You are not enrolled in any transport services yet.
              </p>
            </div>
          </CardContent>
        </Card>}

      {/* Transport Cards */}
      {!loading && !error && enrollments.length > 0 && <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {enrollments.map(enrollment => {
        const openDialog = () => {
          setDialogTransport(enrollment);
          setDialogOpen(true);
        };
        return <div key={enrollment._id} className="relative flex w-full max-w-sm mx-auto flex-col rounded-xl bg-card text-card-foreground shadow-md transition-all duration-200 hover:shadow-lg mb-8">
                {/* Image/Gradient Header */}
                <div className="relative mx-4 -mt-6 h-40 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-border text-white shadow-lg shadow-primary/40">
                  {enrollment.bookhireId.imageUrl ? <>
                      <img src={enrollment.bookhireId.imageUrl} alt={enrollment.bookhireId.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    </> : <div className="w-full h-full bg-gradient-to-r from-primary to-primary/80"></div>}
                  
                  {/* Status Badge Overlay */}
                  <div className="absolute top-3 right-3">
                    <Badge variant={getStatusColor(enrollment.status)} className="bg-white/20 backdrop-blur-sm border-white/30">
                      {enrollment.status}
                    </Badge>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="space-y-2 text-center">
                      <h3 className="text-lg font-semibold text-foreground">
                        {enrollment.bookhireId.title}
                      </h3>
                      <div className="text-base font-medium text-primary">
                        {enrollment.bookhireId.vehicleNumber}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {enrollment.bookhireId.year} • Capacity: {enrollment.bookhireId.capacity}
                      </div>
                      <div className="text-sm font-medium">
                        {enrollment.bookhireId.route}
                      </div>
                    </div>

                    {/* Owner Info */}
                    <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                      <div className="text-sm font-medium">{enrollment.ownerId.ownerName}</div>
                      
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {enrollment.ownerId.phoneNumber}
                      </div>
                    </div>

                    {/* Quick Info */}
                    
                  </div>
                </div>
                
                {/* Footer with Buttons */}
                <div className="p-6 pt-0 space-y-2">
                  <Button variant="outline" className="w-full rounded-lg py-3 px-6 text-xs font-bold uppercase shadow-md transition-all hover:shadow-lg" onClick={openDialog}>
                    View Details
                  </Button>
                  <Button className="w-full rounded-lg py-3 px-6 text-xs font-bold uppercase shadow-md transition-all hover:shadow-lg" onClick={() => {
              setSelectedTransport(enrollment);
              localStorage.setItem('selectedTransport', JSON.stringify(enrollment));
              navigateToPage('transport-selection');
            }}>
                    Manage Transport
                  </Button>
                </div>
              </div>;
      })}
        </div>}

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