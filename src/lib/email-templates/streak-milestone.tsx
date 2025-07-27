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

interface StreakMilestoneEmailProps {
  userName: string;
  streakCount: number;
  milestone: number;
  nextMilestone: number;
  badgeImageUrl?: string;
}

export const StreakMilestoneEmail: React.FC<StreakMilestoneEmailProps> = ({
  userName,
  streakCount,
  milestone,
  nextMilestone,
  badgeImageUrl = 'https://powerpulse.ai/badges/default.png',
}) => {
  const getMilestoneMessage = (milestone: number): string => {
    switch (milestone) {
      case 3:
        return "You're officially on a roll! The hardest part is behind you.";
      case 7:
        return "One full week! You've proven you have what it takes.";
      case 14:
        return "Two weeks strong! This is becoming a powerful habit.";
      case 21:
        return "Three weeks! Science says you've built a habit. Congratulations!";
      case 30:
        return "One month! You're unstoppable. This is just the beginning.";
      case 50:
        return "50 days! You're in the top 5% of PowerPulse users!";
      case 75:
        return "75 days of dedication! You're an inspiration to others.";
      case 100:
        return "CENTURY! 100 days of pure commitment. You're a legend!";
      case 365:
        return "ONE FULL YEAR! You've achieved what less than 1% accomplish!";
      default:
        return `${milestone} days! Every day is a victory worth celebrating.`;
    }
  };

  return (
    <Html>
      <Head />
      <Preview>🏆 Incredible! You've hit a {milestone}-day streak on PowerPulse!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Celebration Header */}
          <Section style={celebrationHeader}>
            <Text style={celebrationEmoji}>🎉</Text>
            <Heading style={h1}>Congratulations, {userName}!</Heading>
            <Text style={milestoneText}>
              You've achieved a {milestone}-day streak!
            </Text>
          </Section>

          {/* Badge Section */}
          <Section style={badgeSection}>
            <Img
              src={badgeImageUrl}
              width="200"
              height="200"
              alt={`${milestone}-day streak badge`}
              style={badge}
            />
            <Text style={badgeLabel}>
              {milestone}-Day Achiever
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={mainContent}>
            <Text style={achievementMessage}>
              {getMilestoneMessage(milestone)}
            </Text>

            {/* Stats */}
            <Section style={statsSection}>
              <table width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td style={statCell}>
                    <Text style={statNumber}>{streakCount}</Text>
                    <Text style={statLabel}>Current Streak</Text>
                  </td>
                  <td style={statDivider}>|</td>
                  <td style={statCell}>
                    <Text style={statNumber}>{milestone}</Text>
                    <Text style={statLabel}>Days Achieved</Text>
                  </td>
                  <td style={statDivider}>|</td>
                  <td style={statCell}>
                    <Text style={statNumber}>{nextMilestone - milestone}</Text>
                    <Text style={statLabel}>Days to Next</Text>
                  </td>
                </tr>
              </table>
            </Section>

            <Button href={`${process.env.NEXT_PUBLIC_APP_URL}/achievements`} style={primaryButton}>
              View All Achievements
            </Button>

            <Hr style={hr} />

            {/* Motivational Section */}
            <Section style={motivationalSection}>
              <Heading style={h2}>What's Next?</Heading>
              <Text style={motivationalText}>
                Your next milestone is just {nextMilestone - milestone} days away! 
                Keep up the incredible momentum and unlock your {nextMilestone}-day badge.
              </Text>
              
              <div style={tipBox}>
                <Text style={tipTitle}>💡 Pro Tip for Sustained Success:</Text>
                <Text style={tipContent}>
                  Schedule your PowerPulse sessions at the same time each day. 
                  Consistency in timing strengthens the habit loop and makes it easier to maintain your streak.
                </Text>
              </div>
            </Section>

            <Hr style={hr} />

            {/* Share Section */}
            <Section style={shareSection}>
              <Heading style={h3}>Share Your Achievement!</Heading>
              <Text style={shareText}>
                Inspire others with your dedication. Share your milestone:
              </Text>
              <table align="center" style={{ margin: '20px auto' }}>
                <tr>
                  <td style={shareButton}>
                    <Link 
                      href={`https://twitter.com/intent/tweet?text=Just hit a ${milestone}-day streak on @PowerPulse! 🎯 Building better habits one day at a time. %23PowerPulse %23${milestone}DayStreak`}
                      style={socialShareLink}
                    >
                      Share on Twitter
                    </Link>
                  </td>
                  <td width="20"></td>
                  <td style={shareButton}>
                    <Link 
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${process.env.NEXT_PUBLIC_APP_URL}`}
                      style={socialShareLink}
                    >
                      Share on LinkedIn
                    </Link>
                  </td>
                </tr>
              </table>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Keep going, {userName}! We're proud of your commitment to personal growth.
            </Text>
            <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications`} style={footerLink}>
              Notification Settings
            </Link>
            {' • '}
            <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/help`} style={footerLink}>
              Help Center
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
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  overflow: 'hidden',
};

const celebrationHeader = {
  textAlign: 'center' as const,
  padding: '48px 32px 32px',
  background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
};

const celebrationEmoji = {
  fontSize: '64px',
  margin: '0',
};

const h1 = {
  fontSize: '36px',
  fontWeight: '700',
  margin: '16px 0',
  color: '#1a1a1a',
};

const milestoneText = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#92400E',
  margin: '0',
};

const badgeSection = {
  textAlign: 'center' as const,
  padding: '32px',
  backgroundColor: '#F9FAFB',
};

const badge = {
  margin: '0 auto',
  display: 'block',
};

const badgeLabel = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#7C3AED',
  marginTop: '16px',
};

const mainContent = {
  padding: '32px',
};

const achievementMessage = {
  fontSize: '20px',
  color: '#374151',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: '0 0 32px',
};

const statsSection = {
  backgroundColor: '#F3E8FF',
  borderRadius: '12px',
  padding: '24px',
  margin: '32px 0',
};

const statCell = {
  textAlign: 'center' as const,
  padding: '0 16px',
};

const statDivider = {
  color: '#E9D5FF',
  fontSize: '24px',
  padding: '0 8px',
};

const statNumber = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#7C3AED',
  margin: '0',
  display: 'block',
};

const statLabel = {
  fontSize: '14px',
  color: '#6B21A8',
  margin: '4px 0 0',
  display: 'block',
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

const motivationalSection = {
  textAlign: 'center' as const,
};

const h2 = {
  fontSize: '28px',
  fontWeight: '600',
  margin: '0 0 16px',
  color: '#1a1a1a',
};

const motivationalText = {
  fontSize: '18px',
  color: '#6b7280',
  lineHeight: '1.6',
  margin: '0 0 24px',
};

const tipBox = {
  backgroundColor: '#EFF6FF',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  borderLeft: '4px solid #3B82F6',
  textAlign: 'left' as const,
};

const tipTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1E40AF',
  margin: '0 0 8px',
};

const tipContent = {
  fontSize: '16px',
  color: '#3730A3',
  lineHeight: '1.5',
  margin: '0',
};

const shareSection = {
  textAlign: 'center' as const,
};

const h3 = {
  fontSize: '24px',
  fontWeight: '600',
  margin: '0 0 12px',
  color: '#1a1a1a',
};

const shareText = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '0 0 20px',
};

const shareButton = {
  display: 'inline-block',
};

const socialShareLink = {
  backgroundColor: '#1DA1F2',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: '500',
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
  margin: '0 0 16px',
};

const footerLink = {
  fontSize: '14px',
  color: '#7C3AED',
  textDecoration: 'none',
};

const footerAddress = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '16px 0 0',
};

export default StreakMilestoneEmail;