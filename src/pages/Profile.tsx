import { useState } from "react";
import { BookingLayout } from "@/components/BookingLayout";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/useApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, MapPin, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [formData, setFormData] = useState({
    ownerName: "",
    email: "",
    phoneNumber: "",
    businessName: "",
    businessLicense: "",
    isVerified: false,
    isActive: false,
  });
  const [loading, setLoading] = useState(false);
  const { api } = useApi();
  const { toast } = useToast();

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const response = await api.getOwnerProfile() as any;
      setFormData(response);
      toast({
        title: "Success",
        description: "Profile data loaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <BookingLayout
      title="Profile Settings"
      description="Manage your personal information and preferences"
      icon={<User className="h-6 w-6 text-primary" />}
    >
      <div className="max-w-2xl mx-auto">
        {/* Load Data Button */}
        <div className="flex justify-center mb-8">
          <Button 
            onClick={loadProfileData}
            disabled={loading}
            size="lg"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Load Profile Data'}
          </Button>
        </div>

        <Card className="shadow-medium border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your profile information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange("ownerName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange("businessName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessLicense">Business License</Label>
                <Input
                  id="businessLicense"
                  value={formData.businessLicense}
                  onChange={(e) => handleInputChange("businessLicense", e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </BookingLayout>
  );
};

export default Profile;