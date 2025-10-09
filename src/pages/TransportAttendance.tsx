import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { transportApi, TransportEnrollment } from '@/api/transport.api';
import { toast } from 'sonner';
import CurrentSelection from '@/components/ui/current-selection';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TransportSidebar } from '@/components/layout/TransportSidebar';

const TransportAttendance: React.FC = () => {
  const { transportId } = useParams<{ transportId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [transport, setTransport] = useState<TransportEnrollment | null>(
    location.state?.transport || null
  );
  const [loading, setLoading] = useState(!location.state?.transport);

  useEffect(() => {
    if (!location.state?.transport) {
      // If no transport in state, redirect back to transport list
      navigate('/transport');
    }
  }, [location.state, navigate]);

  const handleBack = () => {
    navigate('/transport');
  };

  if (loading || !transport) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <TransportSidebar transportId={transportId} />
        <div className="flex-1">
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger />
          </header>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Transport Attendance</h1>
                <p className="text-muted-foreground">Track your transport usage</p>
              </div>
            </div>

            <CurrentSelection
              transport={{
                id: transport.id,
                vehicleModel: `Bookhire ${transport.bookhireId}`
              }}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Attendance Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Attendance tracking will be available soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default TransportAttendance;
