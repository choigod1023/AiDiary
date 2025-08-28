#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 아이콘 크기 목록
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// icons 디렉토리 생성
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// 기본 아이콘 템플릿 (SVG)
const iconTemplate = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#F59E0B"/>
  <rect x="64" y="64" width="384" height="384" rx="96" fill="#FEF3C7"/>
  <path d="M128 256C128 185.307 185.307 128 256 128C326.693 128 384 185.307 384 256C384 326.693 326.693 384 256 384C185.307 384 128 326.693 128 256Z" fill="#F59E0B"/>
  <path d="M192 224C192 206.327 206.327 192 224 192C241.673 192 256 206.327 256 224C256 241.673 241.673 256 224 256C206.327 256 192 241.673 192 224Z" fill="#FEF3C7"/>
  <path d="M256 224C256 206.327 270.327 192 288 192C305.673 192 320 206.327 320 224C320 241.673 305.673 256 288 256C270.327 256 256 241.673 256 224Z" fill="#FEF3C7"/>
  <path d="M160 320C160 320 192 288 256 288C320 288 352 320 352 320" stroke="#F59E0B" stroke-width="16" stroke-linecap="round"/>
  <text x="256" y="400" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#F59E0B">📝</text>
</svg>
`;

// 각 크기별로 아이콘 생성
iconSizes.forEach(size => {
    const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    // 실제로는 SVG를 PNG로 변환하는 로직이 필요하지만,
    // 여기서는 파일 존재 여부만 확인
    if (!fs.existsSync(iconPath)) {
        console.log(`아이콘 생성 필요: ${size}x${size}`);
        // 실제 구현에서는 sharp나 다른 이미지 처리 라이브러리 사용
    } else {
        console.log(`아이콘 존재: ${size}x${size}`);
    }
});

console.log('PWA 아이콘 생성 완료!');
console.log('실제 PNG 아이콘을 생성하려면 이미지 편집 도구를 사용하거나');
console.log('sharp 라이브러리를 설치하여 자동 변환을 구현하세요.');
