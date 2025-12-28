import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Building2, ShoppingBag, Share2 } from "lucide-react";
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
      description: "Multi-platform posting. Schedule and manage posts to all your social accounts.",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="Aura Investment" className="h-8 rounded-full" />
              <span className="font-serif font-bold tracking-wider hidden sm:block">AURA</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                onClick={onNavigateToLogin}
                className="hover:text-primary transition-colors"
                data-testid="button-login"
              >
                Login
              </Button>
              <Button 
                onClick={onNavigateToRegister}
                className="shadow-lg shadow-primary/20"
                data-testid="button-register"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="py-32 px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={ { opacity: 0, y: 30 } }
            animate={ { opacity: 1, y: 0 } }
            transition={ { duration: 1 } }
            className="max-w-7xl mx-auto text-center"
          >
            <h1 className="text-6xl sm:text-8xl font-black font-serif mb-8 tracking-tighter">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x">
                AURA
              </span>
            </h1>
            <p className="text-2xl text-foreground/70 max-w-3xl mx-auto mb-12 leading-relaxed">
              Experience the future of wealth management in a 3D immersive environment.
              Invest in Aura, live in Excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg" 
                onClick={onNavigateToRegister}
                className="h-14 px-10 text-lg rounded-full shadow-2xl shadow-primary/40 hover:scale-105 transition-transform"
                data-testid="button-get-started"
              >
                Join the Future
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-14 px-10 text-lg rounded-full backdrop-blur-md border-white/20 hover:bg-white/10 transition-all"
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                data-testid="button-learn-more"
              >
                Discover More
              </Button>
            </div>
          </motion.div>
        </section>

        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold font-serif text-center mb-16 tracking-tight">
              Multidimensional Ecosystem
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={ { opacity: 0, scale: 0.9 } }
                  whileInView={ { opacity: 1, scale: 1 } }
                  transition={ { delay: idx * 0.1 } }
                  viewport={ { once: true } }
                >
                  <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 group">
                    <CardContent className="p-8 text-center space-y-6">
                      <div className="h-20 w-20 mx-auto rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                        <feature.icon className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="font-bold text-xl tracking-tight">{feature.title}</h3>
                      <p className="text-foreground/60 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/20 py-12 px-4 sm:px-6 lg:px-8 relative z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <p className="text-foreground/40 font-medium">&copy; 2025 Aura Investment Company. All rights reserved.</p>
          <button
            onClick={onNavigateToTerms}
            className="text-primary hover:text-accent underline underline-offset-4 decoration-2 transition-all"
            data-testid="link-terms"
          >
            Terms of Existence
          </button>
        </div>
      </footer>
    </div>
  );
}
