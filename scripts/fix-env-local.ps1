# Fix .env.local file formatting
# This script fixes the Stripe webhook secret line

$envFile = ".env.local"
$content = Get-Content $envFile -Raw

# Fix the broken line - split publishable key and webhook secret
$content = $content -replace 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51STsOvAjII6lIBnkp96DvOFlOb1iCgdr8VrCU3CzZU6UIz2AnZzO07AQyvG8s28guSv483qukxKJgeLjEThbxYPP00lBKRq9khSTRIPE_WEBHOOK_SECRET=', "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51STsOvAjII6lIBnkp96DvOFlOb1iCgdr8VrCU3CzZU6UIz2AnZzO07AQyvG8s28guSv483qukxKJgeLjEThbxYPP00lBKRq9kh`nSTRIPE_WEBHOOK_SECRET="

# Write back
$content | Set-Content $envFile -NoNewline

Write-Host "✅ Fixed .env.local formatting"
Write-Host "The webhook secret is now on its own line"

