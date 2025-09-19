import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Truck, MapPin, Clock, User, Phone, Calendar, ArrowLeft, Bus, DollarSign, Users } from 'lucide-react';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { TransportEnrollment } from '@/api/studentTransport.api';
import { TransportSidebar } from '@/components/TransportSidebar';
import { TransportAttendance } from '@/components/TransportAttendance';
import { useLocation } from 'react-router-dom';

const TransportSelection = () => {
  const { selectedInstitute, user } = useAuth();
  const { navigateToPage } = useAppNavigation();
  const location = useLocation();
  const [selectedTransport, setSelectedTransport] = useState<TransportEnrollment | null>(null);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [activeView, setActiveView] = useState('attendance');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Set active view based on current route
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === '/transport-attendance') {
      setActiveView('attendance');
    } else if (pathname === '/transport-info') {
      setActiveView('details');
    } else {
      setActiveView('attendance'); // default
    }
  }, [location.pathname]);

  useEffect(() => {
    // Load selected transport and child data from localStorage
    const savedTransport = localStorage.getItem('selectedTransport');
    const savedChild = localStorage.getItem('selectedChildForTransport');
    
    if (savedTransport) {
      try {
        setSelectedTransport(JSON.parse(savedTransport));
      } catch (error) {
        console.error('Error loading selected transport:', error);
      }
    }
    
    if (savedChild) {
      try {
        setSelectedChild(JSON.parse(savedChild));
      } catch (error) {
        console.error('Error loading selected child:', error);
      }
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'PENDING': return 'secondary';
      case 'INACTIVE': return 'outline';
      default: return 'outline';
    }
  };

  const renderContent = () => {
    if (!selectedTransport) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Bus className="h-16 w-16 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold">No Transport Selected</h3>
              <p className="text-muted-foreground">
                Please go back to the transport page and select a transport service{selectedChild ? ` for ${selectedChild.firstName}` : ''}.
              </p>
              <Button onClick={() => navigateToPage(user?.role === 'Parent' ? 'parent-transport' : 'transport')}>
                <Bus className="h-4 w-4 mr-2" />
                Select Transport
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    switch (activeView) {
      case 'attendance':
        return <TransportAttendance selectedTransport={selectedTransport} />;
      case 'details':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bus className="h-5 w-5 text-primary" />
                  <span>Transport Details</span>
                </div>
                <Badge variant={getStatusColor(selectedTransport.status)}>
                  {selectedTransport.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Transport Title */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    {selectedTransport.bookhireId.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedTransport.ownerId.businessName}
                  </p>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Vehicle Info */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Vehicle Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{selectedTransport.bookhireId.vehicleNumber}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Year: {selectedTransport.bookhireId.year}</p>
                      <p className="text-sm text-muted-foreground">Capacity: {selectedTransport.bookhireId.capacity} passengers</p>
                    </div>
                  </div>

                  {/* Route Info */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Route Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{selectedTransport.bookhireId.route}</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <p><strong>Pickup:</strong> {selectedTransport.pickupLocation}</p>
                        <p><strong>Dropoff:</strong> {selectedTransport.dropoffLocation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timing Info */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Schedule</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Pickup:</span>
                        <span className="font-medium">{selectedTransport.pickupTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Dropoff:</span>
                        <span className="font-medium">{selectedTransport.dropoffTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact & Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Owner Contact</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedTransport.ownerId.ownerName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedTransport.ownerId.phoneNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Payment Details</h4>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span className="text-xl font-bold text-primary">
                        Rs. {selectedTransport.monthlyFee.toLocaleString()}/month
                      </span>
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                {selectedTransport.specialInstructions && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-amber-700 mb-2">Special Instructions</h4>
                    <p className="text-amber-600 text-sm">{selectedTransport.specialInstructions}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      default:
        return <TransportAttendance selectedTransport={selectedTransport} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TransportSidebar 
          activeView={activeView} 
          setActiveView={setActiveView}
          onBackToTransport={() => navigateToPage(user?.role === 'Parent' ? 'parent-transport' : 'transport')}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1">
          <header className="h-12 flex items-center border-b bg-background">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
              className="ml-2 md:hidden"
            >
              <Bus className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-between w-full px-4">
              <div className="flex items-center space-x-2">
                <Bus className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">
                  {user?.role === 'Parent' ? 'Parent Transport Management' : 'Transport Management'}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                {selectedChild && user?.role === 'Parent' && (
                  <div className="flex items-center space-x-2 bg-muted px-3 py-1 rounded-full">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{selectedChild.firstName} {selectedChild.lastName}</span>
                  </div>
                )}
                {selectedInstitute && (
                  <p className="text-sm text-muted-foreground">Institute: {selectedInstitute.name}</p>
                )}
              </div>
            </div>
          </header>
          
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default TransportSelection;