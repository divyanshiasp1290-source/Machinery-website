const https = require('https');
const fs = require('fs');

https.get('https://evo3d.co.uk', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('evo_home.html', data);
    console.log('Downloaded HTML, size:', data.length);
    const brandIdx = data.toLowerCase().indexOf('shop by brand');
    console.log('Brand index:', brandIdx);
    if (brandIdx !== -1) {
      const chunk = data.substring(brandIdx - 500, brandIdx + 20000);
      const urls = chunk.match(/(\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|svg|webp)[^\s"'<>]*)/gi) || [];
      console.log('Found URLs in section:', urls.length);
      urls.forEach(u => console.log(u));
    }
  });
}).on('error', err => console.log('Error:', err));
