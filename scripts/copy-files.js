// scripts/copy-files.js

const fs = require('fs-extra');
const path = require('path');

async function copyFiles() {
  try {
    // Static dosyalarını kopyala
    await fs.copy(
      path.join('.next', 'static'),
      path.join('.next', 'standalone', '.next', 'static')
    );

    // Public klasörünü kopyala
    await fs.copy(
      path.join('public'),
      path.join('.next', 'standalone', 'public')
    );

    // .env dosyasını kopyala (varsa)
    try {
      await fs.copy(
        '.env',
        path.join('.next', 'standalone', '.env')
      );
    } catch (err) {
      console.log('.env dosyası bulunamadı, bu adım atlanıyor.');
    }

    console.log('Tüm dosyalar başarıyla kopyalandı!');
  } catch (err) {
    console.error('Hata:', err);
    process.exit(1);
  }
}

copyFiles();
