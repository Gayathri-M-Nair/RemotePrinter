# PowerShell script to fix Prisma issues on Windows

Write-Host "=== Fixing Prisma Client Issues ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop any running Node processes
Write-Host "Step 1: Stopping Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Step 2: Delete Prisma client
Write-Host "Step 2: Deleting old Prisma client..." -ForegroundColor Yellow
if (Test-Path "node_modules\.prisma") {
    Remove-Item -Recurse -Force "node_modules\.prisma"
    Write-Host "  ✓ Deleted .prisma folder" -ForegroundColor Green
}

# Step 3: Delete .next cache
Write-Host "Step 3: Deleting Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "  ✓ Deleted .next folder" -ForegroundColor Green
}

# Step 4: Generate Prisma client
Write-Host "Step 4: Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Prisma client generated" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

# Step 5: Run migrations
Write-Host "Step 5: Running database migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name init_print_jobs
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Migrations applied" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to apply migrations" -ForegroundColor Red
    Write-Host "  Trying migrate reset..." -ForegroundColor Yellow
    npx prisma migrate reset --force
    npx prisma migrate dev --name init
}

Write-Host ""
Write-Host "=== Fix Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run dev" -ForegroundColor White
Write-Host "2. Login to your account" -ForegroundColor White
Write-Host "3. Try uploading and creating a print job" -ForegroundColor White
Write-Host ""
