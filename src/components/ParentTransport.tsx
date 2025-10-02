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
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Mock children data - in real app this would come from user.children or API
  const mockChildren = [{
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    grade: '5th Grade'
  }, {
    id: '2',
    firstName: 'Mike',
    lastName: 'Johnson',
    grade: '3rd Grade'
  }, {
    id: '3',
    firstName: 'Emma',
    lastName: 'Johnson',
    grade: '7th Grade'
  }];
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
  const handleTransportSelect = (enrollment: TransportEnrollment) => {
    setSelectedTransport(enrollment);
    // Store both the transport and child info for the selection page
    localStorage.setItem('selectedTransport', JSON.stringify(enrollment));
    localStorage.setItem('selectedChildForTransport', JSON.stringify(selectedChildData));
    navigateToPage('transport-selection');
  };
  return <div className="container mx-auto p-6 space-y-6">
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
              <Button onClick={() => loadTransportEnrollments(selectedChildId)}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>}

      {/* Transport Cards */}
      {!loading && !error && enrollments.length === 0 && selectedChildId && <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Bus className="h-16 w-16 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold">No Transport Services Found</h3>
              <p className="text-muted-foreground">
                {selectedChildData?.firstName} is not enrolled in any transport services yet.
              </p>
            </div>
          </CardContent>
        </Card>}

      {!loading && !error && enrollments.length > 0 && <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {enrollments.map(enrollment => {
            const isExpanded = expandedCards.has(enrollment._id);
            
            const toggleExpanded = () => {
              const newExpanded = new Set(expandedCards);
              if (isExpanded) {
                newExpanded.delete(enrollment._id);
              } else {
                newExpanded.add(enrollment._id);
              }
              setExpandedCards(newExpanded);
            };

            return (
              <div key={enrollment._id} className="relative flex w-80 flex-col rounded-xl bg-card text-card-foreground shadow-md transition-all duration-200 hover:shadow-lg">
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

                    {/* Additional Details - Show/Hide */}
                    {isExpanded && (
                      <div className="space-y-4 border-t pt-4">
                        {/* Status Badge */}
                        <div className="flex justify-center">
                          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                            {enrollment.status}
                          </Badge>
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
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Footer with Buttons */}
                <div className="p-6 pt-0 space-y-2">
                  <Button 
                    variant="outline"
                    className="w-full rounded-lg py-3 px-6 text-xs font-bold uppercase shadow-md transition-all hover:shadow-lg" 
                    onClick={toggleExpanded}
                  >
                    {isExpanded ? 'Show Less' : 'Show More'}
                  </Button>
                  <Button 
                    className="w-full rounded-lg py-3 px-6 text-xs font-bold uppercase shadow-md transition-all hover:shadow-lg" 
                    onClick={() => handleTransportSelect(enrollment)}
                  >
                    Manage Transport
                  </Button>
                </div>
              </div>
            );
          })}
        </div>}
    </div>;
};
export default ParentTransport;