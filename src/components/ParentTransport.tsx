import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import StudentTransport from '@/components/StudentTransport';
const ParentTransport = () => {
  const {
    selectedChild,
    user
  } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(selectedChild?.id || null);

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
  return <div className="container mx-auto p-6 space-y-6">
      {/* Header with Child Selection */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Truck className="h-8 w-8 text-primary" />
            Parent Transport
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage transportation services for your children
          </p>
        </div>
        
        
      </div>

      {/* Current Selection Display */}
      {selectedChildData && <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Managing Transport for:</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedChildData.firstName} {selectedChildData.lastName} - {selectedChildData.grade}
                  </p>
                </div>
              </div>
              <Badge variant="default">Selected</Badge>
            </div>
          </CardContent>
        </Card>}

      {/* Student Transport Component */}
      <div className="mt-6">
        <StudentTransport />
      </div>
    </div>;
};
export default ParentTransport;