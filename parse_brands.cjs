const fs = require('fs');
const data = fs.readFileSync('evo_home.html', 'utf8');

const brandIdx = data.toLowerCase().indexOf('shop by brand');
if (brandIdx !== -1) {
  const chunk = data.substring(brandIdx, brandIdx + 45000);
  // Match each slide or item
  const slides = chunk.split(/<li[^>]*class=[\"'][^\"']*slider__slide[^\"']*[\"'][^>]*>/i);
  console.log('Slides found:', slides.length - 1);
  slides.slice(1).forEach((s, idx) => {
    const srcMatch = s.match(/src=[\"']([^\"']+)[\"']/i);
    const linkMatch = s.match(/href=[\"']([^\"']+)[\"']/i);
    console.log(`Brand ${idx + 1}:`, {
      link: linkMatch ? linkMatch[1] : '',
      img: srcMatch ? srcMatch[1].replace(/&amp;/g, '&') : ''
    });
  });
}
