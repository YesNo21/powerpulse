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

interface ComebackEmailProps {
  userName: string;
  daysAway: number;
  lastSessionDate: Date;
  motivationalMessage: string;
  quickStartUrl: string;
}

export const ComebackEmail: React.FC<ComebackEmailProps> = ({
  userName,
  daysAway,
  lastSessionDate,
  motivationalMessage,
  quickStartUrl,
}) => {
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getPersonalizedGreeting = (days: number): string => {
    if (days <= 3) {
      return "Hey there! We noticed you haven't checked in for a few days.";
    } else if (days <= 7) {
      return "It's been a week! We've been thinking about you.";
    } else if (days <= 14) {
      return "Two weeks have passed, and we miss having you around!";
    } else if (days <= 30) {
      return "It's been a month, but it's never too late to restart!";
    } else {
      return "Welcome back! No matter how long it's been, today is perfect for a fresh start.";
    }
  };

  return (
    <Html>
      <Head />
      <Preview>{userName}, we miss you! Your daily motivation is waiting 🌟</Preview>
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
            <Heading style={h1}>Hi {userName} 👋</Heading>
            
            <Text style={greetingText}>
              {getPersonalizedGreeting(daysAway)}
            </Text>

            <Section style={statsBox}>
              <Text style={statsText}>
                Your last session was on <strong>{formatDate(lastSessionDate)}</strong>
              </Text>
              <Text style={statsSubtext}>
                That's {daysAway} days ago
              </Text>
            </Section>

            <Text style={motivationalQuote}>
              "{motivationalMessage}"
            </Text>

            <Button href={quickStartUrl} style={primaryButton}>
              Start Today's Session
            </Button>

            <Hr style={hr} />

            {/* What You've Missed */}
            <Section style={missedSection}>
              <Heading style={h2}>While You Were Away...</Heading>
              
              <div style={missedItem}>
                <span style={missedIcon}>🎯</span>
                <div style={missedContent}>
                  <Text style={missedTitle}>New Personalized Content</Text>
                  <Text style={missedDescription}>
                    We've added {daysAway * 2} new sessions tailored to your interests
                  </Text>
                </div>
              </div>

              <div style={missedItem}>
                <span style={missedIcon}>🏆</span>
                <div style={missedContent}>
                  <Text style={missedTitle}>Community Achievements</Text>
                  <Text style={missedDescription}>
                    Join thousands who've maintained their streaks this month
                  </Text>
                </div>
              </div>

              <div style={missedItem}>
                <span style={missedIcon}>✨</span>
                <div style={missedContent}>
                  <Text style={missedTitle}>Feature Updates</Text>
                  <Text style={missedDescription}>
                    New meditation series and productivity boosters launched
                  </Text>
                </div>
              </div>
            </Section>

            <Hr style={hr} />

            {/* Easy Restart Section */}
            <Section style={restartSection}>
              <Heading style={h3}>Ready to Jump Back In?</Heading>
              <Text style={restartText}>
                Starting again is easier than you think. Here's how:
              </Text>

              <table width="100%" style={{ marginTop: '24px' }}>
                <tr>
                  <td style={optionCard}>
                    <Text style={optionEmoji}>⚡</Text>
                    <Text style={optionTitle}>Quick 5-Min Session</Text>
                    <Text style={optionDescription}>
                      Perfect for easing back into your routine
                    </Text>
                    <Link href={`${quickStartUrl}?duration=5`} style={optionLink}>
                      Start Quick Session
                    </Link>
                  </td>
                  <td width="20"></td>
                  <td style={optionCard}>
                    <Text style={optionEmoji}>🎧</Text>
                    <Text style={optionTitle}>Pick Up Where You Left Off</Text>
                    <Text style={optionDescription}>
                      Continue with your personalized program
                    </Text>
                    <Link href={`${quickStartUrl}?continue=true`} style={optionLink}>
                      Continue Journey
                    </Link>
                  </td>
                </tr>
              </table>
            </Section>

            <Hr style={hr} />

            {/* Testimonial */}
            <Section style={testimonialSection}>
              <Text style={testimonialQuote}>
                "I took a break for 3 weeks and was worried about starting again. 
                PowerPulse made it so easy to jump back in. Now I'm on a 45-day streak!"
              </Text>
              <Text style={testimonialAuthor}>
                - Sarah K., PowerPulse Member
              </Text>
            </Section>

            {/* Special Offer */}
            {daysAway >= 14 && (
              <Section style={offerSection}>
                <Text style={offerTitle}>🎁 Welcome Back Gift</Text>
                <Text style={offerText}>
                  As a welcome back, enjoy 7 days of premium content free! 
                  No credit card required.
                </Text>
                <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/premium-trial`} style={offerLink}>
                  Claim Your Gift
                </Link>
              </Section>
            )}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Remember, every expert was once a beginner who didn't give up.
            </Text>
            <Text style={footerSubtext}>
              We believe in you, {userName}! 💪
            </Text>
            <table align="center" style={{ margin: '20px auto' }}>
              <tr>
                <td style={footerLink}>
                  <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications`}>
                    Notification Settings
                  </Link>
                </td>
                <td style={footerDivider}>•</td>
                <td style={footerLink}>
                  <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/help`}>
                    Get Help
                  </Link>
                </td>
                <td style={footerDivider}>•</td>
                <td style={footerLink}>
                  <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe`}>
                    Unsubscribe
                  </Link>
                </td>
              </tr>
            </table>
            <Text style={footerAddress}>
              PowerPulse, Inc. • 123 Motivation Lane • San Francisco, CA 94105
            </Text>
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
  padding: '32px',
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
  margin: '24px 0 16px',
  color: '#1a1a1a',
  textAlign: 'center' as const,
};

const h2 = {
  fontSize: '24px',
  fontWeight: '600',
  margin: '24px 0 16px',
  color: '#1a1a1a',
  textAlign: 'center' as const,
};

const h3 = {
  fontSize: '20px',
  fontWeight: '600',
  margin: '24px 0 12px',
  color: '#1a1a1a',
  textAlign: 'center' as const,
};

const greetingText = {
  fontSize: '18px',
  color: '#6b7280',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const statsBox = {
  backgroundColor: '#F3F4F6',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const statsText = {
  fontSize: '16px',
  color: '#374151',
  margin: '0',
};

const statsSubtext = {
  fontSize: '14px',
  color: '#9CA3AF',
  margin: '8px 0 0',
};

const motivationalQuote = {
  fontSize: '20px',
  fontStyle: 'italic',
  color: '#7C3AED',
  textAlign: 'center' as const,
  margin: '32px 0',
  padding: '0 20px',
  lineHeight: '1.6',
};

const primaryButton = {
  backgroundColor: '#7C3AED',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '18px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '16px 32px',
  margin: '32px auto',
  maxWidth: '300px',
  boxShadow: '0 4px 6px rgba(124, 58, 237, 0.25)',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '40px 0',
};

const missedSection = {
  margin: '32px 0',
};

const missedItem = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '24px',
};

const missedIcon = {
  fontSize: '28px',
  marginRight: '16px',
  flexShrink: 0,
};

const missedContent = {
  flex: 1,
};

const missedTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 4px',
};

const missedDescription = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
  lineHeight: '1.4',
};

const restartSection = {
  textAlign: 'center' as const,
};

const restartText = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '0',
};

const optionCard = {
  backgroundColor: '#F9FAFB',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  verticalAlign: 'top',
};

const optionEmoji = {
  fontSize: '36px',
  margin: '0 0 12px',
  display: 'block',
};

const optionTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 8px',
  display: 'block',
};

const optionDescription = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 16px',
  display: 'block',
  lineHeight: '1.4',
};

const optionLink = {
  color: '#7C3AED',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
};

const testimonialSection = {
  backgroundColor: '#F3E8FF',
  borderRadius: '12px',
  padding: '24px',
  margin: '32px 0',
  textAlign: 'center' as const,
};

const testimonialQuote = {
  fontSize: '16px',
  color: '#374151',
  fontStyle: 'italic',
  lineHeight: '1.6',
  margin: '0 0 12px',
};

const testimonialAuthor = {
  fontSize: '14px',
  color: '#6B21A8',
  fontWeight: '500',
  margin: '0',
};

const offerSection = {
  backgroundColor: '#FEF3C7',
  borderRadius: '12px',
  padding: '24px',
  margin: '32px 0',
  textAlign: 'center' as const,
  border: '2px solid #FDE68A',
};

const offerTitle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#92400E',
  margin: '0 0 8px',
};

const offerText = {
  fontSize: '16px',
  color: '#78350F',
  margin: '0 0 16px',
  lineHeight: '1.5',
};

const offerLink = {
  backgroundColor: '#F59E0B',
  color: '#ffffff',
  padding: '12px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: '600',
  display: 'inline-block',
};

const footer = {
  padding: '32px',
  textAlign: 'center' as const,
  backgroundColor: '#F9FAFB',
};

const footerText = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '0',
};

const footerSubtext = {
  fontSize: '16px',
  color: '#7C3AED',
  fontWeight: '500',
  margin: '8px 0 0',
};

const footerLink = {
  padding: '0 8px',
};

const footerDivider = {
  color: '#D1D5DB',
  padding: '0 4px',
};

const footerAddress = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '16px 0 0',
};

export default ComebackEmail;