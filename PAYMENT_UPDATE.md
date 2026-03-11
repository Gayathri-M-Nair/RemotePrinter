# Payment Calculation Update - Token Slip Charge

## Changes Made

### 1. Updated Payment Calculation Logic

The payment now includes a ₹1 token slip charge:

**Old Formula:**
```
totalAmount = sheetsRequired × pricePerSheet
```

**New Formula:**
```
printingCost = sheetsRequired × pricePerSheet
tokenCharge = ₹1
totalAmount = printingCost + tokenCharge
```

### 2. Updated Payment Page UI

The Order Summary now shows:
- **Printing Cost:** ₹6 (for sheets)
- **Token Slip:** ₹1 (for token)
- **Total Amount:** ₹7

### 3. Updated Database Schema

Added new fields to `PrintJob` model:
```prisma
model PrintJob {
  // ... other fields
  printingCost    Float       // Cost for printing sheets only
  tokenCharge     Float       @default(1) // Token slip charge (₹1)
  totalAmount     Float       // printingCost + tokenCharge
  // ... other fields
}
```

### 4. Updated API Route

The `/api/print-jobs/create` endpoint now:
- Receives `totalAmount` (including token charge)
- Calculates `printingCost = totalAmount - 1`
- Stores both `printingCost` and `tokenCharge` separately
- Stores final `totalAmount`

### 5. Updated Token Page

The token slip page now displays:
- Printing Cost (separate)
- Token Slip charge (separate)
- Total Cost (sum of both)

## Migration Required

Run this command to update the database:

```bash
npx prisma migrate dev --name add_token_charge_fields
```

This will add the new `printingCost` and `tokenCharge` fields to the `PrintJob` table.

## Example Calculation

**Scenario:**
- Document: 10 pages
- Pages per sheet: 1
- Duplex: Single sided
- Color: Black & White (₹2/sheet)
- Copies: 1

**Calculation:**
```
Sheets required = ceil(10 / 1) × 1 = 10 sheets
Printing cost = 10 × ₹2 = ₹20
Token charge = ₹1
Total amount = ₹20 + ₹1 = ₹21
```

**Payment Page Display:**
```
Printing Cost: ₹20
Token Slip: ₹1
Total Amount: ₹21
```

## Files Modified

1. ✅ `/app/student/payment/page.tsx` - Added token charge calculation
2. ✅ `/prisma/schema.prisma` - Added printingCost and tokenCharge fields
3. ✅ `/app/api/print-jobs/create/route.ts` - Updated to store separate costs
4. ✅ `/app/dashboard/token/[tokenNumber]/page.tsx` - Display cost breakdown

## Testing

1. **Upload a document**
2. **Configure preferences**
3. **Go to payment page**
4. **Verify the display shows:**
   - Printing Cost: ₹X
   - Token Slip: ₹1
   - Total Amount: ₹(X+1)
5. **Complete payment**
6. **Check token page shows the same breakdown**

## Backward Compatibility

Existing print jobs in the database will need the new fields. The migration will:
- Add `printingCost` field (nullable initially)
- Add `tokenCharge` field with default value 1
- Existing jobs will have `printingCost = totalAmount - 1`

## Notes

- Token charge is fixed at ₹1
- Token slip is always printed (counts as 1 sheet)
- Total amount includes both printing and token costs
- Payment simulation uses the correct total amount
- Queue and token generation logic remains unchanged
