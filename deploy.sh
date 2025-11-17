#!/bin/bash
set -e

echo "🚀 Konnect 자동 배포 시작..."

cd /var/www/konnect-back

echo "📦 최신 코드 가져오는 중..."
git pull origin main

echo "📦 패키지 설치 중..."
npm ci

echo "🛠️  빌드 중..."
npm run build

echo "♻️  PM2 재시작 중..."
pm2 restart konnect-api || pm2 start dist/main.js --name konnect-api

echo "✅ 배포 완료 ($(date))"

