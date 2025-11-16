#!/bin/bash

# Fix update-issue route
sed -i '' 's/const updateData: any = {}/const updateData: Record<string, unknown> = {}/g' src/app/api/admin/update-issue/route.ts

# Fix SettingsForm.tsx
sed -i '' 's/catch (error: any)/catch (error)/g' src/app/settings/SettingsForm.tsx
sed -i '' 's/error.message || /error instanceof Error ? error.message : /g' src/app/settings/SettingsForm.tsx

# Fix AdminIssueActions quotes
sed -i '' 's/"DELETE"/\&quot;DELETE\&quot;/g' src/components/admin/AdminIssueActions.tsx
sed -i '' 's/"\.\.\."/\&quot;...\&quot;/g' src/components/admin/AdminIssueActions.tsx

# Fix AdminSearchFilter quotes  
sed -i '' 's/"CLEAR"/\&quot;CLEAR\&quot;/g' src/components/admin/AdminSearchFilter.tsx

echo "✅ Errors fixed!"