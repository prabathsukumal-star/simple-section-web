import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, MapPin, Clock, User, Phone, Calendar, DollarSign, Bus, AlertCircle, Users } from 'lucide-react';
import { getStudentTransportEnrollments, TransportEnrollment } from '@/api/studentTransport.api';
import { useAppNavigation } from '@/hooks/useAppNavigation';

const ParentTransport = () => {
  const {
    selectedChild,
    selectedInstitute,
    user
  } = useAuth();
  const {
    navigateToPage
  } = useAppNavigation();
  const [selectedChildId, setSelectedChildId] = useState<string>(selectedChild?.id || '');
  const [enrollments, setEnrollments] = useState<TransportEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<TransportEnrollment | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock children data - in real app this would come from user.children or API
  const mockChildren = [
    { id: '1', firstName: 'Sarah', lastName: 'Johnson', grade: '5th Grade' },
    { id: '2', firstName: 'Mike', lastName: 'Johnson', grade: '3rd Grade' },
    { id: '3', firstName: 'Emma', lastName: 'Johnson', grade: '7th Grade' }
  ];

  const selectedChildData = mockChildren.find(child => child.id === selectedChildId) || mockChildren[0];

  useEffect(() => {
    if (selectedChildId) {
      loadTransportEnrollments(selectedChildId);
    }
  }, [selectedChildId]);

  const loadTransportEnrollments = async (childId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Using the child ID for fetching enrollments
      const response = await getStudentTransportEnrollments(childId, {
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
      case 'ACTIVE': return 'default';
      case 'PENDING': return 'secondary';
      case 'INACTIVE': return 'outline';
      default: return 'outline';
    }
  };

  const handleTransportSelect = (enrollment: TransportEnrollment) => {
    setSelectedTransport(enrollment);
    // Store both the transport and child info for the selection page
    localStorage.setItem('selectedTransport', JSON.stringify(enrollment));
    localStorage.setItem('selectedChildForTransport', JSON.stringify(selectedChildData));
    navigateToPage('transport-selection');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Truck className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Parent Transport</h1>
        </div>
        {selectedInstitute && <p className="text-muted-foreground">Institute: {selectedInstitute.name}</p>}
      </div>

      <p className="text-muted-foreground">
        Manage transportation services for your children
      </p>

      {/* Child Selection */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Select Child</h3>
                <p className="text-sm text-muted-foreground">Choose which child's transport to manage</p>
              </div>
            </div>
            <div className="w-full md:w-auto md:min-w-[200px]">
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {mockChildren.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.firstName} {child.lastName} - {child.grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedChildData && (
            <div className="mt-4 p-3 bg-background rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Managing transport for:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedChildData.firstName} {selectedChildData.lastName} - {selectedChildData.grade}
                  </p>
                </div>
                <Badge variant="default">Selected</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading/Error States */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading transport services...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <h3 className="text-lg font-semibold">Error Loading Transport</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => loadTransportEnrollments(selectedChildId)}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transport Cards */}
      {!loading && !error && enrollments.length === 0 && selectedChildId && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Bus className="h-16 w-16 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold">No Transport Services Found</h3>
              <p className="text-muted-foreground">
                {selectedChildData?.firstName} is not enrolled in any transport services yet.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && enrollments.length > 0 && (
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
                  onClick={() => handleTransportSelect(enrollment)}
                >
                  Manage Transport
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ParentTransport;