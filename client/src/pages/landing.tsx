import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Building2, ShoppingBag, Share2, Shield, Zap, Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import logoImage from "@assets/khalil_investment_logo.jpg";

interface LandingProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToTerms: () => void;
}

export default function Landing({ onNavigateToLogin, onNavigateToRegister, onNavigateToTerms }: LandingProps) {
  const features = [
    {
      icon: TrendingUp,
      title: "Smart Investments",
      description: "Real-time market data from Alpaca, Finnhub, and Polygon.io. Track your portfolio with advanced analytics.",
    },
    {
      icon: Building2,
      title: "Real Estate",
      description: "List and manage properties with Google Maps integration. Admin approval system for quality listings.",
    },
    {
      icon: ShoppingBag,
      title: "E-commerce Hub",
      description: "Connect Shopify and WooCommerce stores. Manage products, inventory, and orders in one place.",
    },
    {
      icon: Share2,
      title: "Social Media",
      description: "Multi-platform posting with AI-powered captions. Schedule posts to all your social accounts.",
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Secure & Trusted",
      description: "Bank-level security with encrypted data and secure authentication.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Real-time updates and instant notifications for all your investments.",
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "24/7 admin support and comprehensive investment guidance.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="Khalil Investment" className="h-8" />
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                onClick={onNavigateToLogin}
                data-testid="button-login"
              >
                Login
              </Button>
              <Button 
                onClick={onNavigateToRegister}
                data-testid="button-register"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold font-serif mb-6">
            <span className="text-accent">KHALIL INVESTMENT COMPANY</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Manage investments, real estate, e-commerce, and social media all in one powerful platform. 
            Built for modern investors who demand excellence.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={onNavigateToRegister}
              data-testid="button-get-started"
            >
              Start Investing Today
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => console.log('Learn more clicked')}
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold font-serif text-center mb-12">
            All Your Investments, One Platform
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="hover-elevate">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="h-14 w-14 mx-auto rounded-full bg-accent flex items-center justify-center">
                    <feature.icon className="h-7 w-7 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold font-serif text-center mb-12">
            Why Choose Khalil Investment?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center space-y-3">
                <div className="h-16 w-16 mx-auto rounded-full bg-primary flex items-center justify-center">
                  <benefit.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-xl">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold font-serif">
            Ready to Transform Your Investment Strategy?
          </h2>
          <p className="text-lg opacity-90">
            Join thousands of investors who trust Khalil Investment Platform
          </p>
          <Button 
            size="lg" 
            variant="outline"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            onClick={onNavigateToRegister}
            data-testid="button-cta-register"
          >
            Create Free Account
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground space-y-2">
          <p>&copy; 2024 Khalil Investment Platform. All rights reserved.</p>
          <p>
            <button
              onClick={onNavigateToTerms}
              className="underline hover-elevate"
              data-testid="link-terms"
            >
              Terms and Conditions
            </button>
          </p>
        </div>
      </footer>
    </div>
  );
}
