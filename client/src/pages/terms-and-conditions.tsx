import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import logoImage from "@assets/khalil_investment_logo.jpg";

interface TermsAndConditionsProps {
  onNavigateToHome: () => void;
}

export default function TermsAndConditions({ onNavigateToHome }: TermsAndConditionsProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={onNavigateToHome} className="flex items-center gap-3">
              <img src={logoImage} alt="Aura" className="h-8 rounded-full" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold font-serif text-center">
                Terms and Conditions
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using Aura, you agree to be bound by these Terms and Conditions. 
                  If you disagree with any part of these terms, you may not access the platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Investment Risks</h2>
                <p className="text-muted-foreground mb-2">
                  All investments carry risk. By using this platform, you acknowledge that:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Investment values can go down as well as up</li>
                  <li>Past performance does not guarantee future results</li>
                  <li>You may lose some or all of your invested capital</li>
                  <li>You should only invest what you can afford to lose</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Platform Services</h2>
                <p className="text-muted-foreground mb-2">
                  Aura provides the following services:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Investment portfolio management and tracking</li>
                  <li>Real estate listing and management</li>
                  <li>E-commerce product management</li>
                  <li>Social media content scheduling and management</li>
                  <li>Peer-to-peer transfer services</li>
                  <li>Digital wallet for fund management</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. User Responsibilities</h2>
                <p className="text-muted-foreground mb-2">As a user, you agree to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Provide accurate and truthful information</li>
                  <li>Keep your account credentials secure</li>
                  <li>Not use the platform for illegal activities</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not manipulate or misrepresent investment information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Commissions and Fees</h2>
                <p className="text-muted-foreground">
                  The platform charges commissions and fees as configured by administrators. These include:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Investment commissions (default: 10% of investment amount)</li>
                  <li>Product listing commissions (default: 5% of product price)</li>
                  <li>Property listing fees (default: $10 per listing)</li>
                  <li>Transaction fees for wallet operations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Account Suspension</h2>
                <p className="text-muted-foreground">
                  We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent 
                  activity, or pose a risk to the platform or other users.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Data Privacy</h2>
                <p className="text-muted-foreground">
                  We are committed to protecting your privacy. Your personal and financial data is encrypted and stored 
                  securely. We will never share your information without your consent, except as required by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Referral Program</h2>
                <p className="text-muted-foreground">
                  Users can earn rewards by referring new users to the platform. Rewards are subject to verification and 
                  may be revoked if fraud is detected.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Affiliate Program</h2>
                <p className="text-muted-foreground">
                  Affiliates can earn commissions on sales generated through their unique affiliate codes. Commissions 
                  are calculated based on configured rates and paid according to platform policies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  All content, trademarks, and intellectual property on this platform remain the property of Aura or their respective owners.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  Aura is not liable for any losses resulting from investment decisions, technical 
                  failures, market volatility, or force majeure events. Users invest at their own risk.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. Continued use of the platform after changes 
                  constitutes acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">13. Contact Information</h2>
                <p className="text-muted-foreground">
                  For questions about these Terms and Conditions, please contact our support team through the platform 
                  or via email at support@aura.com.
                </p>
              </section>

              <div className="pt-6 flex justify-center">
                <Button onClick={onNavigateToHome} size="lg" data-testid="button-back-home">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Aura. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
