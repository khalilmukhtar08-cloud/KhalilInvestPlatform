import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import logoImage from "@assets/khalil_investment_logo.jpg";

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onNavigateToRegister: () => void;
  onNavigateToHome: () => void;
  onForgotPassword: () => void;
}

export default function Login({ onLogin, onNavigateToRegister, onNavigateToHome, onForgotPassword }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <header className="border-b border-border/50 backdrop-blur-md relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={onNavigateToHome} className="flex items-center gap-3">
              <img src={logoImage} alt="Khalil Aura" className="h-8 rounded-full" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <motion.div
          initial={ { opacity: 0, y: 20, rotateY: -15, scale: 0.9 } }
          animate={ { opacity: 1, y: 0, rotateY: 0, scale: 1 } }
          transition={ { 
            duration: 1.2, 
            ease: [0.22, 1, 0.36, 1],
            rotateY: { duration: 1.5, ease: "easeOut" }
          } }
          whileHover={ { 
            scale: 1.05,
            rotateY: 10,
            rotateX: -5,
            transition: { duration: 0.4, ease: "easeOut" }
          } }
          className="w-full max-w-md perspective-2000"
        >
          <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden hover-elevate transition-shadow duration-500 hover:shadow-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
            <CardHeader className="text-center relative z-10">
              <CardTitle className="text-3xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-foreground/60">Sign in to your 3D dashboard</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="relative z-10">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="khalilmukhtar08@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background/50 border-white/10 focus:border-primary/50 transition-all duration-300"
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-sm text-primary hover:text-accent transition-colors"
                      onClick={onForgotPassword}
                      data-testid="button-forgot-password"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background/50 border-white/10 focus:border-primary/50 transition-all duration-300"
                    data-testid="input-password"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" data-testid="button-submit">
                  Sign In
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-primary hover:text-accent font-medium transition-colors"
                    onClick={onNavigateToRegister}
                    data-testid="button-navigate-register"
                  >
                    Create one now
                  </button>
                </p>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
