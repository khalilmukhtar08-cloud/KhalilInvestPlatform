import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import logoImage from "@assets/khalil_investment_logo.jpg";

interface RegisterProps {
  onRegister: (name: string, email: string, password: string) => void;
  onNavigateToLogin: () => void;
  onNavigateToHome: () => void;
}

export default function Register({ onRegister, onNavigateToLogin, onNavigateToHome }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;
    onRegister(name, email, password);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <header className="border-b border-border/50 backdrop-blur-md relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={onNavigateToHome} className="flex items-center gap-3">
              <img src={logoImage} alt="Khalil Investment" className="h-8 rounded-full" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <motion.div
          initial={ { opacity: 0, scale: 0.9, rotateY: 10 } }
          animate={ { opacity: 1, scale: 1, rotateY: 0 } }
          transition={ { duration: 0.8, ease: "easeOut" } }
          className="w-full max-w-md"
        >
          <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden hover-elevate">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-primary/10 pointer-events-none" />
            <CardHeader className="text-center relative z-10">
              <CardTitle className="text-3xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Join Aura
              </CardTitle>
              <CardDescription className="text-foreground/60">Start your immersive investment journey</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="relative z-10">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-background/50 border-white/10 focus:border-primary/50"
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background/50 border-white/10 focus:border-primary/50"
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background/50 border-white/10 focus:border-primary/50"
                    data-testid="input-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-background/50 border-white/10 focus:border-primary/50"
                    data-testid="input-confirm-password"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" data-testid="button-submit">
                  Create Account
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-primary hover:text-accent font-medium transition-colors"
                    onClick={onNavigateToLogin}
                    data-testid="button-navigate-login"
                  >
                    Sign in
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
