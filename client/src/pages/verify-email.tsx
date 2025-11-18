import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import logoImage from "@assets/khalil_investment_logo.jpg";

interface VerifyEmailProps {
  onNavigateToLogin: () => void;
  onNavigateToHome: () => void;
}

export default function VerifyEmail({ onNavigateToLogin, onNavigateToHome }: VerifyEmailProps) {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing');
        return;
      }

      try {
        const response = await apiRequest('GET', `/api/auth/verify-email?token=${token}`);
        
        const data = await response.json();
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Email verification failed. The link may have expired.');
      }
    };

    verifyToken();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={onNavigateToHome} className="flex items-center gap-3">
              <img src={logoImage} alt="Khalil Investment" className="h-8" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {status === 'verifying' && <Loader2 className="h-16 w-16 text-primary animate-spin" />}
              {status === 'success' && <CheckCircle className="h-16 w-16 text-green-600" />}
              {status === 'error' && <XCircle className="h-16 w-16 text-destructive" />}
            </div>
            <CardTitle className="text-2xl font-bold font-serif">
              {status === 'verifying' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
            <CardDescription>
              {status === 'verifying' && 'Please wait while we verify your email address'}
              {status === 'success' && message}
              {status === 'error' && message}
            </CardDescription>
          </CardHeader>
          
          {status !== 'verifying' && (
            <CardFooter className="flex flex-col space-y-4">
              {status === 'success' && (
                <Button 
                  onClick={onNavigateToLogin} 
                  className="w-full"
                  data-testid="button-navigate-login"
                >
                  Sign In Now
                </Button>
              )}
              {status === 'error' && (
                <div className="w-full space-y-2">
                  <Button 
                    onClick={onNavigateToHome} 
                    className="w-full"
                    data-testid="button-navigate-home"
                  >
                    Back to Home
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Need help?{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => console.log("Contact support")}
                      data-testid="button-contact-support"
                    >
                      Contact Support
                    </button>
                  </p>
                </div>
              )}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
