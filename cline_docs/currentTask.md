# Current Task: Implement Contact Page with Form and Email Integration

## Objective
Create a contact page with a form that allows users to send messages via email, update contact information across the site, and implement proper validation and error handling.

## Background
- Frontend is running on VPS2 (147.93.62.188:3000)
- Strapi backend is on VPS1 (153.92.223.23:1337)
- Email server is configured on Hostinger (smtp.hostinger.com)
- Email account info@maasiso.nl is set up and working

## Required Changes

### 1. Contact Page (app/contact/page.tsx)
```typescript
// Create a responsive contact page with:
// - Contact information section
// - Contact form
// - Proper metadata
```

### 2. Contact Form Component (src/components/features/ContactForm.tsx)
```typescript
// Create a form component with:
// - Name field
// - Email field
// - Subject dropdown (including Privacy/AVG option)
// - Message textarea
// - Submit button
// - Validation
// - Success/error messages
```

### 3. API Endpoint (app/api/contact/route.ts)
```typescript
// Create an API endpoint that:
// - Validates form data
// - Sends email using nodemailer
// - Returns appropriate response
```

### 4. Update Contact Information
- Remove address information from all pages
- Add formatted phone number (+31 (0)6 2357 8344) to all relevant pages

## Implementation Steps

1. Contact Page:
   - Create page component
   - Add metadata
   - Design layout
   - Add contact information section
   - Integrate contact form

2. Contact Form:
   - Create form component
   - Add form fields
   - Implement validation
   - Add state management
   - Handle form submission
   - Display success/error messages

3. API Endpoint:
   - Create route handler
   - Implement validation
   - Set up nodemailer
   - Configure email sending
   - Handle errors
   - Return appropriate responses

4. Contact Information Updates:
   - Update footer component
   - Update contact page
   - Update cookie policy page
   - Update privacy policy page

5. Testing:
   - Test form validation
   - Test email sending
   - Verify error handling
   - Check responsive design

## Testing Plan

1. Form Validation:
   - Test required fields
   - Test email format validation
   - Test subject selection

2. Email Sending:
   - Test successful email sending
   - Test error handling
   - Verify email content

3. Responsive Design:
   - Test on desktop
   - Test on tablet
   - Test on mobile

## Success Criteria
1. Contact form displays correctly on all devices
2. Form validation works as expected
3. Emails are sent successfully
4. Proper error handling is implemented
5. Success messages are displayed
6. Contact information is updated across the site

## Resources
- Email Password: Niekties@100
- SMTP Server: smtp.hostinger.com
- Email: info@maasiso.nl
- Phone Number: +31 (0)6 2357 8344
- Nodemailer Documentation
- Next.js Documentation
- TypeScript Documentation

## Notes
- Keep error handling comprehensive
- Ensure proper validation on both client and server
- Format phone number consistently
- Implement responsive design
- Document any new issues encountered