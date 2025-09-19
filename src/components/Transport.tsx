import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, Clock, User, Phone, Calendar, DollarSign, Bus, AlertCircle } from 'lucide-react';
import { getStudentTransportEnrollments, TransportEnrollment } from '@/api/studentTransport.api';
import { useAppNavigation } from '@/hooks/useAppNavigation';
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
        {selectedInstitute && <p className="text-muted-foreground">Institute: {selectedInstitute.name}</p>}
      </div>

      {/* Transport Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {enrollments.map(enrollment => 
          <Card key={enrollment._id} className="hover:shadow-lg transition-all duration-200 hover:border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <Bus className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="truncate">{enrollment.bookhireId.title}</span>
                </div>
                <Badge variant={getStatusColor(enrollment.status)} className="ml-2 flex-shrink-0">
                  {enrollment.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Vehicle & Route Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium">{enrollment.bookhireId.vehicleNumber}</span>
                  <span className="text-muted-foreground">({enrollment.bookhireId.year})</span>
                </div>
                
                <div className="flex items-start space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="break-words">{enrollment.bookhireId.route}</span>
                </div>
              </div>

              {/* Timing Info */}
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pickup:</span>
                  <span className="font-medium">{enrollment.pickupTime}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Dropoff:</span>
                  <span className="font-medium">{enrollment.dropoffTime}</span>
                </div>
              </div>

              {/* Location Info */}
              <div className="space-y-1 text-xs text-muted-foreground">
                <div><strong>Pickup:</strong> {enrollment.pickupLocation}</div>
                <div><strong>Dropoff:</strong> {enrollment.dropoffLocation}</div>
              </div>

              {/* Owner & Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{enrollment.ownerId.ownerName}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{enrollment.ownerId.phoneNumber}</span>
                </div>
              </div>

              {/* Fee */}
              <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium">Monthly Fee:</span>
                <span className="text-lg font-bold text-primary">Rs. {enrollment.monthlyFee.toLocaleString()}</span>
              </div>

              {/* Special Instructions */}
              {enrollment.specialInstructions && 
                <div className="text-xs bg-amber-50 border border-amber-200 p-2 rounded-lg">
                  <strong className="text-amber-700">Special Instructions:</strong>
                  <p className="text-amber-600 mt-1">{enrollment.specialInstructions}</p>
                </div>
              }
              
              {/* Select Button */}
              <Button 
                className="w-full" 
                onClick={() => {
                  setSelectedTransport(enrollment);
                  localStorage.setItem('selectedTransport', JSON.stringify(enrollment));
                  navigateToPage('transport-selection');
                }}
              >
                Select Transport
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>;
};
export default Transport;