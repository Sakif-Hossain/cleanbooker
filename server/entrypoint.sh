#!/bin/sh

echo "Installing dependencies..."
npm ci

echo "Running Prisma generate..."
npm run db:deploy
npx prisma db push --accept-data-loss

echo "Starting the dev server..."
npm run dev