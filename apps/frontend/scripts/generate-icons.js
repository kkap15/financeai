const sharp = require('sharp')

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#080C14"/>
  <text x="256" y="320" font-family="Arial" font-weight="bold" font-size="200" 
    fill="url(#grad)" text-anchor="middle">Fi.Ai</text>
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6"/>
      <stop offset="100%" style="stop-color:#8B5CF6"/>
    </linearGradient>
  </defs>
</svg>`

const svgBuffer = Buffer.from(svg)

sharp(svgBuffer).resize(192, 192).png().toFile('public/icon-192.png', () => console.log('192 done'))
sharp(svgBuffer).resize(512, 512).png().toFile('public/icon-512.png', () => console.log('512 done'))