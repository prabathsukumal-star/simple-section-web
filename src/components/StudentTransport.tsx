import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Truck, MapPin, Clock, User, Phone, CreditCard, Bell, CheckCircle, AlertCircle } from 'lucide-react';
const StudentTransport = () => {
  const {
    selectedInstitute,
    user
  } = useAuth();
  const [activeTab, setActiveTab] = useState('routes');
  return <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Truck className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Transport Service</h1>
            <p className="text-muted-foreground">
              Institute: {selectedInstitute?.name}
            </p>
          </div>
        </div>
        
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="routes">Available Routes</TabsTrigger>
          <TabsTrigger value="my-route">My Route</TabsTrigger>
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="routes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative flex w-full max-w-sm flex-col rounded-xl bg-card text-card-foreground shadow-md transition-all duration-200 hover:shadow-lg">
              <div className="relative mx-4 -mt-6 h-40 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-border text-white shadow-lg shadow-primary/40 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Truck className="h-12 w-12 text-white/90 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white">Route A - City Center</h3>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Available</Badge>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>7:00 AM → 3:30 PM</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Main Bus Stand → School</span>
                  </div>
                  <div className="text-sm font-medium text-primary">
                    Monthly Fee: Rs. 3,500
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0">
                <Button className="w-full rounded-lg py-3 px-6 text-xs font-bold uppercase shadow-md transition-all hover:shadow-lg">
                  Request Registration
                </Button>
              </div>
            </div>

            <div className="relative flex w-full max-w-sm flex-col rounded-xl bg-card text-card-foreground shadow-md transition-all duration-200 hover:shadow-lg">
              <div className="relative mx-4 -mt-6 h-40 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-border text-white shadow-lg shadow-primary/40 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Truck className="h-12 w-12 text-white/90 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white">Route B - Suburban</h3>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Available</Badge>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>6:45 AM → 3:45 PM</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Suburban Area → School</span>
                  </div>
                  <div className="text-sm font-medium text-primary">
                    Monthly Fee: Rs. 4,000
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0">
                <Button className="w-full rounded-lg py-3 px-6 text-xs font-bold uppercase shadow-md transition-all hover:shadow-lg">
                  Request Registration
                </Button>
              </div>
            </div>

            <div className="relative flex w-full max-w-sm flex-col rounded-xl bg-card text-card-foreground shadow-md transition-all duration-200 hover:shadow-lg">
              <div className="relative mx-4 -mt-6 h-40 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-border text-white shadow-lg shadow-primary/40 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Truck className="h-12 w-12 text-white/90 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white">Route C - Highway</h3>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Limited Seats</Badge>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>6:30 AM → 4:00 PM</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Highway Junction → School</span>
                  </div>
                  <div className="text-sm font-medium text-primary">
                    Monthly Fee: Rs. 4,500
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0">
                <Button className="w-full rounded-lg py-3 px-6 text-xs font-bold uppercase shadow-md transition-all hover:shadow-lg">
                  Join Waiting List
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-route" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Your Registered Route</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Route A - City Center</h3>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Morning Pickup: 7:00 AM</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Evening Drop: 3:30 PM</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Pickup Point: Main Bus Stand</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Driver: Mr. Perera</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>Contact: 078-123-4567</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span>Bus Number: SR-4567</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertTitle>Live Bus Tracking</AlertTitle>
            <AlertDescription>
              Track your bus in real-time. The system updates every 30 seconds.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Bus SR-4567 - Route A</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Current Status:</span>
                  <Badge variant="default">En Route to School</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Current Location:</span>
                    <span>Kandy Road Junction</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Arrival:</span>
                    <span>7:15 AM (5 min delay)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Stop:</span>
                    <span>Main Bus Stand</span>
                  </div>
                </div>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Bus is running 5 minutes late due to traffic. Please be ready at your pickup point.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>September 2025:</span>
                  <Badge variant="default">Paid</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>October 2025:</span>
                  <Badge variant="secondary">Pending</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Amount Due:</span>
                  <span className="font-semibold">Rs. 3,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Due Date:</span>
                  <span className="text-destructive">October 5, 2025</span>
                </div>
                <Button className="w-full mt-4">
                  Pay Now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>September 2025</span>
                    <div className="text-right">
                      <div>Rs. 3,500</div>
                      <div className="text-xs text-muted-foreground">Paid on Sep 1</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>August 2025</span>
                    <div className="text-right">
                      <div>Rs. 3,500</div>
                      <div className="text-xs text-muted-foreground">Paid on Aug 1</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>July 2025</span>
                    <div className="text-right">
                      <div>Rs. 3,500</div>
                      <div className="text-xs text-muted-foreground">Paid on Jul 1</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
};
export default StudentTransport;