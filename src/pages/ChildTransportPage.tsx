import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bus, RefreshCw, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { transportApi, type TransportEnrollment } from '@/api/transport.api';

const ChildTransportPage = () => {
  const navigate = useNavigate();
  const { selectedChild, setSelectedTransport } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [enrollments, setEnrollments] = useState<TransportEnrollment[]>([]);

  const loadEnrollments = async () => {
    if (!selectedChild?.id) {
      toast({
        title: "No Child Selected",
        description: "Please select a child to view transport",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await transportApi.getStudentEnrollments(selectedChild.id, {
        page: 1,
        limit: 10
      });
      
      setEnrollments(response.data.enrollments);
      toast({
        title: "Success",
        description: `Loaded ${response.data.enrollments.length} enrollments`,
      });
    } catch (error) {
      console.error('Error loading enrollments:', error);
      toast({
        title: "Error",
        description: "Failed to load transport enrollments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'inactive':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleSelectTransport = (enrollment: TransportEnrollment) => {
    setSelectedTransport({
      id: enrollment.id,
      vehicleNumber: enrollment.vehicleNumber,
      bookhireId: enrollment.bookhireId
    });
    navigate('/transport-attendance');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5" />
              Transport Information
            </CardTitle>
            <Button onClick={loadEnrollments} disabled={loading} size="sm">
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Load Enrollments
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="overflow-hidden">
                  {enrollment.imageUrl && (
                    <div className="h-48 overflow-hidden bg-muted">
                      <img
                        src={enrollment.imageUrl}
                        alt={enrollment.bookhireTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{enrollment.bookhireTitle}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs">{enrollment.vehicleNumber}</Badge>
                      <Badge variant="outline" className={getStatusColor(enrollment.status)}>
                        {enrollment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Pickup</div>
                        <div className="text-muted-foreground">{enrollment.pickupLocation || 'Not specified'}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Dropoff</div>
                        <div className="text-muted-foreground">{enrollment.dropoffLocation || 'Not specified'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">Enrolled: </span>
                        {enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Monthly Fee</span>
                        <span className="text-lg font-bold text-primary">
                          Rs. {enrollment.monthlyFee.toLocaleString()}
                        </span>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => handleSelectTransport(enrollment)}
                      >
                        Select Transport
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Click "Load Enrollments" to view transport information
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildTransportPage;
