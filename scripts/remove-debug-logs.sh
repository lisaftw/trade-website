#!/bin/bash

echo "Removing all [v0] debug logs from codebase..."

# Find all TypeScript/JavaScript files and remove console.log/console.error lines containing [v0]
find app components lib scripts discord-bot bot -type f $$ -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" $$ -exec sed -i '/console\.$$log\|error$$.*\[v0\]/d' {} \;

echo "Debug logs removed successfully!"
echo ""
echo "Modified files:"
git status --short
