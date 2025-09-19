import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Simple & Clean
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A minimal approach to web design. Clean, functional, and focused on what matters most.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button variant="default" size="lg" className="px-8 py-3 text-lg">
            Get Started
          </Button>
          <p className="text-sm text-muted-foreground">
            No complexity. Just simplicity.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Index;
