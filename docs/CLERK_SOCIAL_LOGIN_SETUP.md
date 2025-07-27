# Clerk Social Login Configuration Guide

## Overview
This guide walks through setting up Google and Facebook OAuth for PowerPulse using Clerk.

## Prerequisites
- Access to Clerk Dashboard (https://dashboard.clerk.com)
- Google Cloud Console account
- Facebook Developer account

## Step 1: Google OAuth Setup

### In Google Cloud Console:
1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   ```
   https://accounts.<your-clerk-frontend-api>.dev/v1/oauth_callback
   ```
7. Copy the Client ID and Client Secret

### In Clerk Dashboard:
1. Go to "User & Authentication" > "Social Connections"
2. Click on Google
3. Toggle "Enable Google as a social connection"
4. Enter your Google Client ID and Client Secret
5. Configure settings:
   - Request user's email: ✓
   - Request user's profile: ✓
   - Use custom OAuth credentials: ✓

## Step 2: Facebook OAuth Setup

### In Facebook Developer Console:
1. Go to https://developers.facebook.com
2. Create a new app or select existing
3. Add "Facebook Login" product
4. Settings > Basic:
   - Add App Domains: `<your-clerk-frontend-api>.dev`
   - Add Privacy Policy URL and Terms of Service URL
5. Facebook Login > Settings:
   - Valid OAuth Redirect URIs:
     ```
     https://accounts.<your-clerk-frontend-api>.dev/v1/oauth_callback
     ```
6. Copy App ID and App Secret

### In Clerk Dashboard:
1. Go to "User & Authentication" > "Social Connections"
2. Click on Facebook
3. Toggle "Enable Facebook as a social connection"
4. Enter your Facebook App ID and App Secret
5. Configure settings:
   - Request user's email: ✓
   - Request user's profile: ✓

## Step 3: Additional Social Providers (Optional)

### GitHub
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Authorization callback URL:
   ```
   https://accounts.<your-clerk-frontend-api>.dev/v1/oauth_callback
   ```

### Twitter/X
1. Go to Twitter Developer Portal
2. Create app with OAuth 2.0 settings
3. Add callback URL

### LinkedIn
1. Go to LinkedIn Developer Portal
2. Create app
3. Add redirect URL

## Step 4: Update Environment Variables

Add to `.env.local`:
```env
# Social Login Features (optional, Clerk handles most of this)
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/quiz
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/quiz
```

## Step 5: Test Social Logins

1. Clear browser cache and cookies
2. Navigate to `/sign-up`
3. Test each social provider:
   - Google Sign In
   - Facebook Sign In
   - Others if configured
4. Verify user is created in Clerk Dashboard
5. Check webhook fires to sync with database

## Step 6: Production Checklist

Before going live:
- [ ] Update OAuth redirect URIs to production domain
- [ ] Set production environment variables
- [ ] Test on multiple devices/browsers
- [ ] Enable MFA for enhanced security
- [ ] Configure session lifetime settings
- [ ] Set up proper error pages

## Troubleshooting

### Common Issues:

1. **"Redirect URI mismatch"**
   - Ensure URLs match exactly (including https://)
   - Check for trailing slashes

2. **"Application not verified"**
   - Complete OAuth consent screen setup
   - Submit for verification if needed

3. **Missing user data**
   - Check OAuth scopes/permissions
   - Ensure profile data is requested

4. **Webhook not firing**
   - Verify webhook endpoint URL
   - Check webhook signing secret

## Security Best Practices

1. **Never commit OAuth credentials**
   - Use environment variables
   - Rotate secrets regularly

2. **Limit OAuth scopes**
   - Only request necessary permissions
   - Follow principle of least privilege

3. **Monitor usage**
   - Set up alerts for unusual activity
   - Review OAuth logs regularly

## Custom Styling

The sign-in/sign-up pages have been styled with:
- Gradient backgrounds matching brand
- Social buttons prominently displayed at top
- Custom button styles with hover effects
- Dark mode support

To modify appearance further, update the `appearance` prop in:
- `/src/app/sign-in/[[...sign-in]]/page.tsx`
- `/src/app/sign-up/[[...sign-up]]/page.tsx`

## Next Steps

After social logins are configured:
1. Test full user journey from signup to quiz
2. Monitor conversion rates
3. A/B test button placement/colors
4. Add social login to mobile apps
5. Implement account linking for existing users