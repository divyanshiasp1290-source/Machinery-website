const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join(__dirname, 'public', 'brands');

const extraLogos = [
  {
    name: 'raise3d',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Raise3D_logo.png/500px-Raise3D_logo.png',
    ext: '.png'
  },
  {
    name: 'bambulab',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Bambu_Lab_Logo.svg/500px-Bambu_Lab_Logo.svg.png',
    ext: '.png'
  },
  {
    name: 'ultimaker',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ultimaker_logo.svg/500px-Ultimaker_logo.svg.png',
    ext: '.png'
  },
  {
    name: 'intamsys',
    url: 'https://cdn.brandfetch.io/id_C_YJdFk/w/400/h/150/theme/dark/logo.png',
    ext: '.png'
  }
];

function download(item) {
  return new Promise((resolve) => {
    const filePath = path.join(targetDir, item.name + item.ext);
    const file = fs.createWriteStream(filePath);
    https.get(item.url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
          res2.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log('Downloaded redirected:', item.name + item.ext, 'size:', fs.statSync(filePath).size);
            resolve();
          });
        });
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Downloaded:', item.name + item.ext, 'size:', fs.statSync(filePath).size);
        resolve();
      });
    }).on('error', (err) => {
      console.error('Error downloading', item.name, err.message);
      resolve();
    });
  });
}

async function run() {
  for (const item of extraLogos) {
    await download(item);
  }
  console.log('Extra downloads finished!');
}

run();
