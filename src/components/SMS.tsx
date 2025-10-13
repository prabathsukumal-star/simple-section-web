import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInstituteRole } from '@/hooks/useInstituteRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Users, User, RefreshCw } from 'lucide-react';
import { apiClient } from '@/api/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface SenderMask {
  maskId: string;
  isActive: boolean;
  displayName: string;
  phoneNumber: string;
}

interface SMSCredentials {
  verificationStage: string;
  availableCredits: number;
  totalCreditsGranted: number;
  totalCreditsUsed: number;
  maskIds: string[];
  senderMasks: SenderMask[];
  isActive: boolean;
}

const SMS = () => {
  const { currentInstituteId } = useAuth();
  const instituteRole = useInstituteRole();
  const { toast } = useToast();

  // SMS Credentials state
  const [credentials, setCredentials] = useState<SMSCredentials | null>(null);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [selectedMaskId, setSelectedMaskId] = useState<string>('');

  // Bulk SMS state
  const [bulkMessage, setBulkMessage] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>([]);
  const [bulkScheduledAt, setBulkScheduledAt] = useState('');
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [isBulkNow, setIsBulkNow] = useState(true);

  // Specific Users SMS state
  const [specificMessage, setSpecificMessage] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [specificScheduledAt, setSpecificScheduledAt] = useState('');
  const [isSpecificSending, setIsSpecificSending] = useState(false);
  const [isSpecificNow, setIsSpecificNow] = useState(true);

  // Custom SMS state
  const [customMessage, setCustomMessage] = useState('');
  const [customPhone, setCustomPhone] = useState('');

  // Input states for adding IDs
  const [newClassId, setNewClassId] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newUserId, setNewUserId] = useState('');

  // Auto-set scheduled time when component mounts (Sri Lanka timezone)
  useEffect(() => {
    const getSriLankaTime = () => {
      const now = new Date();
      // Convert to Sri Lanka time (UTC+5:30)
      const sriLankaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      return sriLankaTime.toISOString().slice(0, 16);
    };
    const sriLankaTime = getSriLankaTime();
    setBulkScheduledAt(sriLankaTime);
    setSpecificScheduledAt(sriLankaTime);
  }, []);

  // Fetch SMS credentials on mount and when institute changes
  useEffect(() => {
    if (currentInstituteId) {
      fetchCredentials();
    }
  }, [currentInstituteId]);

  const fetchCredentials = async () => {
    if (!currentInstituteId) {
      console.log('❌ No currentInstituteId, skipping fetch');
      return;
    }
    
    console.log('🔄 Fetching SMS credentials for institute:', currentInstituteId);
    setLoadingCredentials(true);
    try {
      const response = await apiClient.get(`/enhanced-sms/credentials/${currentInstituteId}`);
      console.log('✅ SMS credentials response:', response);
      setCredentials(response as SMSCredentials);
      console.log('✅ Credentials set successfully:', response);
    } catch (error) {
      console.error('❌ Failed to fetch SMS credentials:', error);
      toast({
        title: 'Warning',
        description: 'Could not load SMS credits information',
        variant: 'destructive',
      });
    } finally {
      setLoadingCredentials(false);
    }
  };

  // Check if user has permission
  const allowedRoles = new Set(['InstituteAdmin', 'INSTITUTE_ADMIN']);
  if (!allowedRoles.has(String(instituteRole))) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Only Institute Admins can access SMS features.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentInstituteId) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Institute Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please select an institute to send SMS.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBulkSMS = async () => {
    if (!bulkMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedMaskId) {
      toast({
        title: 'Error',
        description: 'Please select a mask ID',
        variant: 'destructive',
      });
      return;
    }

    setIsBulkSending(true);
    try {
      const response = await apiClient.post(
        `/enhanced-sms/send-bulk/${currentInstituteId}`,
        {
          messageTemplate: bulkMessage,
          recipientType: 'CUSTOM',
          classIds: selectedClasses,
          subjectIds: selectedSubjects,
          userTypes: selectedUserTypes,
          maskId: selectedMaskId,
          isNow: isBulkNow,
          scheduledAt: isBulkNow ? new Date().toISOString() : bulkScheduledAt,
        }
      );

      toast({
        title: 'Success',
        description: `SMS scheduled successfully. ${response.totalRecipients} recipients. Credits used: ${response.creditsUsed}. Remaining: ${response.remainingBalance}`,
      });

      // Reset form
      setBulkMessage('');
      setSelectedClasses([]);
      setSelectedSubjects([]);
      setSelectedUserTypes([]);
      setBulkScheduledAt('');
      setIsBulkNow(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send bulk SMS',
        variant: 'destructive',
      });
    } finally {
      setIsBulkSending(false);
    }
  };

  const handleSpecificUsersSMS = async () => {
    if (!specificMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    if (selectedUserIds.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one user',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedMaskId) {
      toast({
        title: 'Error',
        description: 'Please select a mask ID',
        variant: 'destructive',
      });
      return;
    }

    setIsSpecificSending(true);
    try {
      const response = await apiClient.post(
        `/enhanced-sms/send-to-users/${currentInstituteId}`,
        {
          messageTemplate: specificMessage,
          userIds: selectedUserIds,
          maskId: selectedMaskId,
          isNow: isSpecificNow,
          scheduledAt: isSpecificNow ? new Date().toISOString() : specificScheduledAt,
        }
      );

      toast({
        title: 'Success',
        description: `SMS scheduled successfully. ${response.totalRecipients} recipients. Credits used: ${response.creditsUsed}. Remaining: ${response.remainingBalance}`,
      });

      // Reset form
      setSpecificMessage('');
      setSelectedUserIds([]);
      setSpecificScheduledAt('');
      setIsSpecificNow(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send SMS to users',
        variant: 'destructive',
      });
    } finally {
      setIsSpecificSending(false);
    }
  };

  const toggleUserType = (userType: string) => {
    setSelectedUserTypes((prev) =>
      prev.includes(userType) ? prev.filter((t) => t !== userType) : [...prev, userType]
    );
  };

  const addClassId = () => {
    if (newClassId.trim() && !selectedClasses.includes(newClassId.trim())) {
      setSelectedClasses([...selectedClasses, newClassId.trim()]);
      setNewClassId('');
    }
  };

  const removeClassId = (id: string) => {
    setSelectedClasses(selectedClasses.filter(c => c !== id));
  };

  const addSubjectId = () => {
    if (newSubjectId.trim() && !selectedSubjects.includes(newSubjectId.trim())) {
      setSelectedSubjects([...selectedSubjects, newSubjectId.trim()]);
      setNewSubjectId('');
    }
  };

  const removeSubjectId = (id: string) => {
    setSelectedSubjects(selectedSubjects.filter(s => s !== id));
  };

  const addUserId = () => {
    if (newUserId.trim() && !selectedUserIds.includes(newUserId.trim())) {
      setSelectedUserIds([...selectedUserIds, newUserId.trim()]);
      setNewUserId('');
    }
  };

  const removeUserId = (id: string) => {
    setSelectedUserIds(selectedUserIds.filter(u => u !== id));
  };

  console.log('🎨 Rendering SMS component, credentials:', credentials);
  console.log('🏢 Current Institute ID:', currentInstituteId);
  
  const [activeTab, setActiveTab] = useState('bulk');

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* SMS Credits Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Credits Information
            </CardTitle>
            <div className="flex items-center gap-2">
              {credentials && (
                <Badge variant={credentials.isActive ? 'default' : 'destructive'}>
                  {credentials.isActive ? 'Active' : 'Inactive'}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={fetchCredentials} disabled={loadingCredentials}>
                <RefreshCw className={`h-4 w-4 ${loadingCredentials ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingCredentials ? (
            <p className="text-muted-foreground">Loading SMS credentials...</p>
          ) : credentials ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Available Credits</p>
                <p className="text-2xl font-bold text-primary">{Math.floor(Number(credentials.availableCredits))}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credits Used</p>
                <p className="text-2xl font-bold">{Number(credentials.totalCreditsUsed)}</p>
              </div>
              <div>
                <Label htmlFor="mask-id">Mask Name</Label>
                <Select value={selectedMaskId} onValueChange={setSelectedMaskId}>
                  <SelectTrigger id="mask-id" className="mt-1">
                    <SelectValue placeholder="Select a mask" />
                  </SelectTrigger>
                  <SelectContent>
                    {credentials.senderMasks && credentials.senderMasks.map((mask) => (
                      <SelectItem key={mask.maskId} value={mask.maskId}>
                        <div className="flex flex-col">
                          <span className="font-medium">{mask.displayName}</span>
                          <span className="text-xs text-muted-foreground">{mask.phoneNumber}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No credentials data available</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bulk" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
                <Users className="h-4 w-4 shrink-0" />
                <span className={activeTab === "bulk" ? "" : "hidden sm:inline"}>
                  Bulk SMS
                </span>
              </TabsTrigger>
              <TabsTrigger value="specific" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
                <User className="h-4 w-4 shrink-0" />
                <span className={activeTab === "specific" ? "" : "hidden sm:inline"}>
                  Specific Users SMS
                </span>
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className={activeTab === "custom" ? "" : "hidden sm:inline"}>
                  Custom SMS
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Bulk SMS Tab */}
            <TabsContent value="bulk" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulk-message">Message Template</Label>
                  <Textarea
                    id="bulk-message"
                    placeholder="Dear {{firstName}}, your class schedule has been updated..."
                    value={bulkMessage}
                    onChange={(e) => setBulkMessage(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Use {`{{firstName}}`} and {`{{lastName}}`} as placeholders
                  </p>
                </div>

                <div>
                  <Label>User Types</Label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {['STUDENT', 'TEACHER', 'PARENT', 'ATTENDANCE_MARKER'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`usertype-${type}`}
                          checked={selectedUserTypes.includes(type)}
                          onCheckedChange={() => toggleUserType(type)}
                        />
                        <label htmlFor={`usertype-${type}`} className="text-sm cursor-pointer">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="class-ids">Class IDs</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="class-ids"
                      placeholder="Enter class ID"
                      value={newClassId}
                      onChange={(e) => setNewClassId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addClassId()}
                    />
                    <Button type="button" onClick={addClassId} size="icon" variant="outline">
                      +
                    </Button>
                  </div>
                  {selectedClasses.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedClasses.map((id) => (
                        <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => removeClassId(id)}>
                          {id} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="subject-ids">Subject IDs</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="subject-ids"
                      placeholder="Enter subject ID"
                      value={newSubjectId}
                      onChange={(e) => setNewSubjectId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSubjectId()}
                    />
                    <Button type="button" onClick={addSubjectId} size="icon" variant="outline">
                      +
                    </Button>
                  </div>
                  {selectedSubjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedSubjects.map((id) => (
                        <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => removeSubjectId(id)}>
                          {id} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="bulk-scheduled">Scheduled At</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bulk-is-now"
                        checked={isBulkNow}
                        onCheckedChange={(checked) => {
                          setIsBulkNow(checked as boolean);
                          const now = new Date();
                          const sriLankaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
                          setBulkScheduledAt(sriLankaTime.toISOString().slice(0, 16));
                        }}
                      />
                      <label htmlFor="bulk-is-now" className="text-sm cursor-pointer">
                        Send Now
                      </label>
                    </div>
                  </div>
                  <Input
                    id="bulk-scheduled"
                    type="datetime-local"
                    value={bulkScheduledAt}
                    onChange={(e) => setBulkScheduledAt(e.target.value)}
                    disabled={isBulkNow}
                    className="mt-2"
                  />
                </div>

                <Button onClick={handleBulkSMS} disabled={isBulkSending} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {isBulkSending ? 'Sending...' : 'Send Bulk SMS'}
                </Button>
              </div>
            </TabsContent>

            {/* Specific Users SMS Tab */}
            <TabsContent value="specific" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="specific-message">Message Template</Label>
                  <Textarea
                    id="specific-message"
                    placeholder="Hi {{firstName}} {{lastName}}, this is a personal message..."
                    value={specificMessage}
                    onChange={(e) => setSpecificMessage(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Use {`{{firstName}}`} and {`{{lastName}}`} as placeholders
                  </p>
                </div>

                <div>
                  <Label htmlFor="user-ids">User IDs</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="user-ids"
                      placeholder="Enter user ID"
                      value={newUserId}
                      onChange={(e) => setNewUserId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addUserId()}
                    />
                    <Button type="button" onClick={addUserId} size="icon" variant="outline">
                      +
                    </Button>
                  </div>
                  {selectedUserIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedUserIds.map((id) => (
                        <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => removeUserId(id)}>
                          {id} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="specific-scheduled">Scheduled At</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="specific-is-now"
                        checked={isSpecificNow}
                        onCheckedChange={(checked) => {
                          setIsSpecificNow(checked as boolean);
                          const now = new Date();
                          const sriLankaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
                          setSpecificScheduledAt(sriLankaTime.toISOString().slice(0, 16));
                        }}
                      />
                      <label htmlFor="specific-is-now" className="text-sm cursor-pointer">
                        Send Now
                      </label>
                    </div>
                  </div>
                  <Input
                    id="specific-scheduled"
                    type="datetime-local"
                    value={specificScheduledAt}
                    onChange={(e) => setSpecificScheduledAt(e.target.value)}
                    disabled={isSpecificNow}
                    className="mt-2"
                  />
                </div>

                <Button onClick={handleSpecificUsersSMS} disabled={isSpecificSending} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {isSpecificSending ? 'Sending...' : 'Send to Specific Users'}
                </Button>
              </div>
            </TabsContent>

            {/* Custom SMS Tab */}
            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-phone">Phone Number</Label>
                  <Input
                    id="custom-phone"
                    placeholder="+94771234567"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="custom-message">Message</Label>
                  <Textarea
                    id="custom-message"
                    placeholder="Enter your custom message..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <Button className="w-full" disabled>
                  <Send className="h-4 w-4 mr-2" />
                  Send Custom SMS (Coming Soon)
                </Button>
              </div>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMS;
