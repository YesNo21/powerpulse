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

interface DailyAudioEmailProps {
  userName: string;
  audioTitle: string;
  audioDuration: number;
  audioUrl: string;
  streakCount: number;
  category: string;
  previewText?: string;
  motivationalQuote?: string;
}

export const DailyAudioEmail: React.FC<DailyAudioEmailProps> = ({
  userName,
  audioTitle,
  audioDuration,
  audioUrl,
  streakCount,
  category,
  previewText = "Your daily dose of motivation is here!",
  motivationalQuote = "Every day is a new opportunity to become a better version of yourself.",
}) => {
  const durationMinutes = Math.ceil(audioDuration / 60);

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
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

          {/* Greeting */}
          <Heading style={h1}>Good morning, {userName}! 🌟</Heading>
          
          {/* Streak Badge */}
          {streakCount > 0 && (
            <Section style={streakSection}>
              <Text style={streakText}>
                🔥 {streakCount} day streak! Keep it up!
              </Text>
            </Section>
          )}

          {/* Main Content */}
          <Section style={mainContent}>
            <Text style={categoryBadge}>{category.toUpperCase()}</Text>
            <Heading style={h2}>{audioTitle}</Heading>
            <Text style={duration}>Duration: {durationMinutes} minutes</Text>
            
            <Section style={quoteSection}>
              <Text style={quote}>"{motivationalQuote}"</Text>
            </Section>

            <Button
              href={audioUrl}
              style={primaryButton}
            >
              🎧 Listen Now
            </Button>
          </Section>

          {/* Additional Actions */}
          <Section style={actionsSection}>
            <table width="100%">
              <tr>
                <td width="50%" style={actionCell}>
                  <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/progress`} style={secondaryLink}>
                    📊 View Progress
                  </Link>
                </td>
                <td width="50%" style={actionCell}>
                  <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/library`} style={secondaryLink}>
                    📚 Browse Library
                  </Link>
                </td>
              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          {/* Tips Section */}
          <Section style={tipsSection}>
            <Heading style={h3}>💡 Today's Power Tip</Heading>
            <Text style={tipText}>
              Find a quiet space, put on your headphones, and give yourself these {durationMinutes} minutes
              of undivided attention. Your future self will thank you.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you're subscribed to daily audio content from PowerPulse.
            </Text>
            <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications`} style={footerLink}>
              Manage preferences
            </Link>
            {' • '}
            <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe`} style={footerLink}>
              Unsubscribe
            </Link>
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
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

const header = {
  padding: '32px 32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#7C3AED',
  borderRadius: '8px 8px 0 0',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  fontSize: '28px',
  fontWeight: '700',
  margin: '16px 32px',
  color: '#1a1a1a',
  textAlign: 'center' as const,
};

const h2 = {
  fontSize: '24px',
  fontWeight: '600',
  margin: '16px 0',
  color: '#1a1a1a',
};

const h3 = {
  fontSize: '20px',
  fontWeight: '600',
  margin: '16px 0',
  color: '#1a1a1a',
};

const streakSection = {
  textAlign: 'center' as const,
  margin: '0 32px 24px',
};

const streakText = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#DC2626',
  backgroundColor: '#FEF2F2',
  padding: '12px 24px',
  borderRadius: '24px',
  display: 'inline-block',
};

const mainContent = {
  padding: '0 32px',
  textAlign: 'center' as const,
};

const categoryBadge = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#7C3AED',
  backgroundColor: '#F3E8FF',
  padding: '4px 12px',
  borderRadius: '12px',
  display: 'inline-block',
  marginBottom: '12px',
  letterSpacing: '0.5px',
};

const duration = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '8px 0 24px',
};

const quoteSection = {
  margin: '24px 0',
  padding: '24px',
  backgroundColor: '#F9FAFB',
  borderRadius: '8px',
  borderLeft: '4px solid #7C3AED',
};

const quote = {
  fontSize: '18px',
  fontStyle: 'italic',
  color: '#374151',
  margin: '0',
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
  display: 'inline-block',
  padding: '16px 32px',
  margin: '24px 0',
  boxShadow: '0 4px 6px rgba(124, 58, 237, 0.25)',
};

const actionsSection = {
  padding: '0 32px',
  margin: '24px 0',
};

const actionCell = {
  textAlign: 'center' as const,
  padding: '8px',
};

const secondaryLink = {
  color: '#7C3AED',
  fontSize: '16px',
  fontWeight: '500',
  textDecoration: 'none',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '32px 32px',
};

const tipsSection = {
  padding: '0 32px',
  textAlign: 'center' as const,
};

const tipText = {
  fontSize: '16px',
  color: '#6b7280',
  lineHeight: '1.6',
  margin: '12px 0',
};

const footer = {
  padding: '0 32px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '14px',
  color: '#9ca3af',
  margin: '8px 0',
};

const footerLink = {
  fontSize: '14px',
  color: '#7C3AED',
  textDecoration: 'none',
};

const footerAddress = {
  fontSize: '12px',
  color: '#d1d5db',
  margin: '16px 0 0',
};

export default DailyAudioEmail;