import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/components/ThemeProvider";
import { Palette, Monitor, Sun, Moon } from "lucide-react";

const Appearance = () => {
  const { theme, setTheme } = useTheme();

  return (
    <DashboardLayout
      title="Appearance"
      description="Customize the look and feel of your application"
      icon={<Palette className="h-6 w-6 text-primary" />}
    >
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Appearance Settings</h2>
          <p className="text-muted-foreground mt-2">Choose how SurakshaLMS looks to you</p>
        </div>

        <Card className="shadow-medium border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme Preferences
            </CardTitle>
            <CardDescription>
              Select your preferred theme for the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Choose your theme</Label>
              <RadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value as any)}
                className="grid grid-cols-1 gap-4"
              >
                <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-smooth">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Sun className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="font-medium">Light</div>
                      <div className="text-sm text-muted-foreground">
                        A clean, bright interface perfect for daytime use
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-smooth">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Moon className="h-5 w-5 text-blue-400" />
                    <div>
                      <div className="font-medium">Dark</div>
                      <div className="text-sm text-muted-foreground">
                        A sleek, dark interface that's easier on the eyes
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-smooth">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">System</div>
                      <div className="text-sm text-muted-foreground">
                        Automatically match your system's theme preference
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Appearance;