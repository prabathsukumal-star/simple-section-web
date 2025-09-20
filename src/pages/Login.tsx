import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, Mail, Lock, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBackend } from "@/context/BackendContext";
import { useAuth } from "@/context/AuthContext";
import { ApiClient } from "@/lib/api";
import heroTransport from "@/assets/hero-transport.jpg";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [backendUrl, setBackendUrlState] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setBackendUrl } = useBackend();
  const { login } = useAuth();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate inputs
    if (!email || !password || !backendUrl) {
      toast({
        title: "Login Failed",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // Validate backend URL format
    try {
      new URL(backendUrl);
    } catch {
      toast({
        title: "Invalid Backend URL",
        description: "Please enter a valid URL (e.g., https://api.example.com)",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      // Store backend URL first
      setBackendUrl(backendUrl);
      
      // Create API client and attempt login
      const apiClient = new ApiClient(backendUrl);

      const response = await apiClient.post('/api/bookhire-owner-auth/login', {
        email,
        password
      });

      // Handle successful login
      const { owner, token }: any = response;
      login(owner, token);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${owner.ownerName}!`
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials or backend URL",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex">
      {/* Hero Section */}
      

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <Bus className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">SurakshaLMS</h1>
          </div>

          <Card className="shadow-strong border-0">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to access your transport management dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 h-12" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 h-12" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backendUrl">Backend URL</Label>
                  <div className="relative">
                    <Server className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="backendUrl" type="url" placeholder="https://api.example.com" value={backendUrl} onChange={e => setBackendUrlState(e.target.value)} className="pl-10 h-12" required />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="xl" variant="hero" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Enter your backend API URL along with email and password
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default Login;