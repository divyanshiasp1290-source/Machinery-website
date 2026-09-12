const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join(__dirname, 'public', 'brands');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const logos = [
  {
    name: 'aon3d',
    url: 'https://evo3d.co.uk/cdn/shop/files/AON3D_Logo_Black_Blue-2.webp?v=1698422508&width=500',
    ext: '.webp'
  },
  {
    name: 'creatbot',
    url: 'https://evo3d.co.uk/cdn/shop/files/CreatBot_new_LOGO.jpg?v=1691590285&width=500',
    ext: '.jpg'
  },
  {
    name: 'fiberlogy',
    url: 'https://evo3d.co.uk/cdn/shop/files/84eb003e-c90b-4eb8-ae42-5da241616895.svg?v=1768394321&width=500',
    ext: '.svg'
  },
  {
    name: 'formlabs',
    url: 'https://evo3d.co.uk/cdn/shop/files/PPR0000326_1Formlabs_Logo_2014-grey_preferred_1.png?v=1774599862&width=500',
    ext: '.png'
  },
  {
    name: 'iemai',
    url: 'https://evo3d.co.uk/cdn/shop/files/20180827153503_2abbfb9d-0e60-4f32-bbb0-165b8e83a9dc.png?v=1751030690&width=500',
    ext: '.png'
  },
  {
    name: 'sinterit',
    url: 'https://evo3d.co.uk/cdn/shop/files/images.png?v=1752497149&width=500',
    ext: '.png'
  },
  {
    name: 'shining3d',
    url: 'https://evo3d.co.uk/cdn/shop/files/Screenshot_2021-02-22_at_9-49-01_am.png?v=1751030807&width=500',
    ext: '.png'
  },
  {
    name: 'modix',
    url: 'https://evo3d.co.uk/cdn/shop/files/modix_ef238b05-40af-4d5b-89e7-578c193a7fb6.png?v=1636645684&width=500',
    ext: '.png'
  },
  {
    name: 'mingda',
    url: 'https://evo3d.co.uk/cdn/shop/files/MINGDA-logo1.webp?v=1785485831&width=500',
    ext: '.webp'
  },
  {
    name: 'rapidfusion',
    url: 'https://evo3d.co.uk/cdn/shop/files/Rapid_Fusion_Logo-01.png?v=1690293840&width=500',
    ext: '.png'
  },
  {
    name: 'sharebot',
    url: 'https://evo3d.co.uk/cdn/shop/files/logoSharebot.webp?v=1757058232&width=500',
    ext: '.webp'
  }
];

function download(item) {
  return new Promise((resolve) => {
    const filePath = path.join(targetDir, item.name + item.ext);
    const file = fs.createWriteStream(filePath);
    https.get(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
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
  for (const item of logos) {
    await download(item);
  }
  console.log('All downloads finished!');
}

run();
