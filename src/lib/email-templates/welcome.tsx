import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  userName: string;
  verificationUrl?: string;
  onboardingUrl: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  userName,
  verificationUrl,
  onboardingUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to PowerPulse - Your journey to personal growth starts here!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://powerpulse.ai/logo.png"
              width="150"
              height="50"
              alt="PowerPulse"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={mainContent}>
            <Heading style={h1}>Welcome to PowerPulse, {userName}! 🎉</Heading>
            
            <Text style={welcomeText}>
              You've just taken the first step towards a more motivated, focused, and empowered you.
              We're thrilled to have you join our community of achievers!
            </Text>

            {verificationUrl && (
              <Section style={verificationSection}>
                <Text style={verificationText}>
                  First, let's verify your email address to ensure you receive your daily audio content:
                </Text>
                <Button href={verificationUrl} style={primaryButton}>
                  Verify Email Address
                </Button>
              </Section>
            )}

            <Heading style={h2}>Here's what you can expect:</Heading>

            {/* Features */}
            <Section style={featuresSection}>
              <table width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td style={featureIcon}>🎧</td>
                  <td style={featureContent}>
                    <Text style={featureTitle}>Daily Audio Sessions</Text>
                    <Text style={featureDescription}>
                      Personalized 5-15 minute audio content delivered to your inbox every morning
                    </Text>
                  </td>
                </tr>
                <tr>
                  <td style={featureIcon}>📊</td>
                  <td style={featureContent}>
                    <Text style={featureTitle}>Progress Tracking</Text>
                    <Text style={featureDescription}>
                      Build streaks, earn badges, and watch your personal growth journey unfold
                    </Text>
                  </td>
                </tr>
                <tr>
                  <td style={featureIcon}>🎯</td>
                  <td style={featureContent}>
                    <Text style={featureTitle}>Personalized Content</Text>
                    <Text style={featureDescription}>
                      AI-curated sessions based on your goals, interests, and progress
                    </Text>
                  </td>
                </tr>
                <tr>
                  <td style={featureIcon}>🌟</td>
                  <td style={featureContent}>
                    <Text style={featureTitle}>Multiple Categories</Text>
                    <Text style={featureDescription}>
                      Motivation, meditation, productivity, wellness, and more
                    </Text>
                  </td>
                </tr>
              </table>
            </Section>

            <Button href={onboardingUrl} style={secondaryButton}>
              Complete Your Profile
            </Button>

            <Hr style={hr} />

            {/* Quick Start Guide */}
            <Section style={quickStartSection}>
              <Heading style={h3}>Quick Start Guide</Heading>
              
              <div style={stepContainer}>
                <div style={stepNumber}>1</div>
                <Text style={stepText}>
                  <strong>Set your preferences:</strong> Choose your favorite categories and preferred delivery time
                </Text>
              </div>

              <div style={stepContainer}>
                <div style={stepNumber}>2</div>
                <Text style={stepText}>
                  <strong>Pick your channels:</strong> Get content via email, WhatsApp, Telegram, or push notifications
                </Text>
              </div>

              <div style={stepContainer}>
                <div style={stepNumber}>3</div>
                <Text style={stepText}>
                  <strong>Start listening:</strong> Your first audio session will arrive tomorrow morning!
                </Text>
              </div>
            </Section>

            <Hr style={hr} />

            {/* Support Section */}
            <Section style={supportSection}>
              <Heading style={h3}>Need Help?</Heading>
              <Text style={supportText}>
                Our support team is here to help you get the most out of PowerPulse.
              </Text>
              <table width="100%" style={{ marginTop: '16px' }}>
                <tr>
                  <td width="50%" style={supportLink}>
                    <Link href="https://powerpulse.ai/help" style={link}>
                      📚 Help Center
                    </Link>
                  </td>
                  <td width="50%" style={supportLink}>
                    <Link href="mailto:support@powerpulse.ai" style={link}>
                      ✉️ Contact Support
                    </Link>
                  </td>
                </tr>
              </table>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Follow us for daily inspiration:
            </Text>
            <table align="center" style={{ margin: '16px auto' }}>
              <tr>
                <td style={socialIcon}>
                  <Link href="https://twitter.com/powerpulse">
                    <Img src="https://powerpulse.ai/icons/twitter.png" width="24" height="24" alt="Twitter" />
                  </Link>
                </td>
                <td style={socialIcon}>
                  <Link href="https://instagram.com/powerpulse">
                    <Img src="https://powerpulse.ai/icons/instagram.png" width="24" height="24" alt="Instagram" />
                  </Link>
                </td>
                <td style={socialIcon}>
                  <Link href="https://linkedin.com/company/powerpulse">
                    <Img src="https://powerpulse.ai/icons/linkedin.png" width="24" height="24" alt="LinkedIn" />
                  </Link>
                </td>
              </tr>
            </table>
            <Text style={footerAddress}>
              PowerPulse, Inc. • 123 Motivation Lane • San Francisco, CA 94105
            </Text>
            <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe`} style={unsubscribeLink}>
              Unsubscribe
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  overflow: 'hidden',
};

const header = {
  padding: '48px 32px',
  textAlign: 'center' as const,
  backgroundColor: '#7C3AED',
  background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
};

const logo = {
  margin: '0 auto',
};

const mainContent = {
  padding: '32px',
};

const h1 = {
  fontSize: '32px',
  fontWeight: '700',
  margin: '24px 0',
  color: '#1a1a1a',
  textAlign: 'center' as const,
};

const h2 = {
  fontSize: '24px',
  fontWeight: '600',
  margin: '32px 0 16px',
  color: '#1a1a1a',
  textAlign: 'center' as const,
};

const h3 = {
  fontSize: '20px',
  fontWeight: '600',
  margin: '24px 0 16px',
  color: '#1a1a1a',
  textAlign: 'center' as const,
};

const welcomeText = {
  fontSize: '18px',
  color: '#6b7280',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: '0 0 32px',
};

const verificationSection = {
  backgroundColor: '#FEF3C7',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const verificationText = {
  fontSize: '16px',
  color: '#92400E',
  margin: '0 0 16px',
};

const primaryButton = {
  backgroundColor: '#7C3AED',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  boxShadow: '0 4px 6px rgba(124, 58, 237, 0.25)',
};

const secondaryButton = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  color: '#7C3AED',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 28px',
  margin: '24px auto',
  border: '2px solid #7C3AED',
  maxWidth: '250px',
};

const featuresSection = {
  margin: '32px 0',
};

const featureIcon = {
  width: '48px',
  fontSize: '32px',
  textAlign: 'center' as const,
  verticalAlign: 'top',
  paddingTop: '8px',
};

const featureContent = {
  paddingLeft: '16px',
  paddingBottom: '24px',
};

const featureTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 4px',
};

const featureDescription = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '0',
  lineHeight: '1.5',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '32px 0',
};

const quickStartSection = {
  margin: '32px 0',
};

const stepContainer = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '20px',
};

const stepNumber = {
  backgroundColor: '#7C3AED',
  color: '#ffffff',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '600',
  marginRight: '16px',
  flexShrink: 0,
};

const stepText = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '0',
  lineHeight: '1.5',
  paddingTop: '4px',
};

const supportSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const supportText = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '8px 0',
};

const supportLink = {
  textAlign: 'center' as const,
  padding: '8px',
};

const link = {
  color: '#7C3AED',
  fontSize: '16px',
  fontWeight: '500',
  textDecoration: 'none',
};

const footer = {
  padding: '32px',
  textAlign: 'center' as const,
  backgroundColor: '#F9FAFB',
};

const footerText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const socialIcon = {
  padding: '0 8px',
};

const footerAddress = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '16px 0 8px',
};

const unsubscribeLink = {
  fontSize: '12px',
  color: '#9ca3af',
  textDecoration: 'underline',
};

export default WelcomeEmail;