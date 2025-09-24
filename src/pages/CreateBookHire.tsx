import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bus, MapPin, Clock, Users, ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";

const CreateBookHire = () => {
  const [formData, setFormData] = useState({
    title: "",
    year: new Date().getFullYear(),
    vehicleNumber: "",
    description: "",
    capacity: "",
    route: "",
    imageUrl: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D"
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { api, isConfigured } = useApi();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isConfigured) {
        // Make API call to create book hire
        const bookHireData = {
          title: formData.title,
          year: parseInt(formData.year.toString()),
          vehicleNumber: formData.vehicleNumber,
          description: formData.description,
          capacity: parseInt(formData.capacity),
          route: formData.route,
          imageUrl: formData.imageUrl
        };
        
        await api.createBookHire(bookHireData);
      }
      
      toast({
        title: "Book Hire Created",
        description: "New transport service has been created successfully"
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create book hire. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card flex items-center px-6 shadow-soft">
            <SidebarTrigger className="mr-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <Bus className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Create Book Hire</h1>
                <p className="text-sm text-muted-foreground">Set up a new transport service</p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle className="text-2xl">New Transport Service</CardTitle>
                  <CardDescription>
                    Fill in the details to create a new book hire service
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Service Title *</Label>
                          <Input
                            id="title"
                            placeholder="e.g., Luxury Bus Hire"
                            value={formData.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                          <Input
                            id="vehicleNumber"
                            placeholder="e.g., WP-BC-3321"
                            value={formData.vehicleNumber}
                            onChange={(e) => handleInputChange("vehicleNumber", e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="year">Year *</Label>
                          <Input
                            id="year"
                            type="number"
                            placeholder="2024"
                            value={formData.year}
                            onChange={(e) => handleInputChange("year", e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="capacity">Capacity *</Label>
                          <div className="relative">
                            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="capacity"
                              type="number"
                              placeholder="50"
                              value={formData.capacity}
                              onChange={(e) => handleInputChange("capacity", e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="description">Description *</Label>
                          <Textarea
                            id="description"
                            placeholder="A modern luxury bus with air conditioning and comfortable seating."
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            rows={3}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="route">Route *</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="route"
                              placeholder="e.g., Colombo to Kandy"
                              value={formData.route}
                              onChange={(e) => handleInputChange("route", e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="imageUrl">Image URL</Label>
                          <Input
                            id="imageUrl"
                            type="url"
                            placeholder="https://example.com/bus-image.jpg"
                            value={formData.imageUrl}
                            onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>


                    {/* Submit Button */}
                    <div className="flex gap-4 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/dashboard")}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1"
                        size="lg"
                      >
                        {loading ? "Creating..." : "Create Book Hire"}
                        <Save className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CreateBookHire;