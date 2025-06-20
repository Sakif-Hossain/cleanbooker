#!/bin/sh

echo "Installing dependencies..."
npm ci

echo "Running Prisma generate..."
npm run db:deploy

echo "Starting the dev server..."
npm run dev