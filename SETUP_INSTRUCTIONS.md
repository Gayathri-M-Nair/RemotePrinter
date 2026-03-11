# Smart Campus Printing System - Setup Instructions

## Razorpay Integration Setup

### 1. Get Razorpay Credentials

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → API Keys
3. Generate Test/Live API Keys
4. Copy the Key ID and Key Secret

### 2. Configure Environment Variables

Update the following files with your Razorpay credentials:

**`.env`** (Server-side):
```env
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

**`.env.local`** (Client-side):
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_razorpay_key_id"
```

### 3. Database Setup

Run the following commands:

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev --name add_print_job_system

# Seed the database with sample printers
npm run seed

# Start the development server
npm run dev
```

## Features Implemented

### Payment System
- Razorpay checkout integration
- Total payment = printing cost + ₹1 token fee
- Secure payment verification using signature validation

### Token System
- Unique token numbers (TOKEN-001, TOKEN-002, etc.)
- Automatic queue position assignment
- Token slip generation with print functionality

### Database Models
- **PrintJob**: Stores all print job details
  - tokenNumber, documentSheets, tokenPage, totalSheets
  - printingCost, tokenFee, totalCost
  - status (QUEUED → PRINTING → COMPLETED)
  - queuePosition, preferences, payment details

- **Printer**: Manages printer information
  - name, location, status

### Routes
- `/student/upload` - Upload documents
- `/student/print-preferences` - Configure print settings
- `/student/payment` - Complete payment via Razorpay
- `/student/token-slip/[id]` - View and print token slip
- `/student/queue` - Track print jobs and queue status

### Token Slip
- Contains: Token Number, Student Name, Printer Name/Location
- Shows: Document Sheets, Total Sheets, Date & Time
- Printable format with print button
- Counts as 1 additional sheet

### Queue System
- Real-time status tracking (QUEUED, PRINTING, COMPLETED)
- Queue position display
- Estimated wait time calculation
- Mobile-friendly interface

## Testing Payment Flow

1. Upload a document at `/student/upload`
2. Configure print preferences at `/student/print-preferences`
3. Proceed to payment at `/student/payment`
4. Use Razorpay test cards:
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date
5. After successful payment, view token slip
6. Check queue status at `/student/queue`

## Notes

- Token slip is automatically counted as 1 additional sheet
- Sheet calculation correctly handles single-sided vs double-sided printing
- All print jobs are tracked in the database
- Queue positions update automatically
