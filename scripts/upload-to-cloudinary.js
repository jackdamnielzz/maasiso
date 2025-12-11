const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dseckqnba',
  api_key: '888487219281111',
  api_secret: 'PhKNfi5R4jnjVF2j5PUPXRSZr3E'
});

// Statistics
let successCount = 0;
let errorCount = 0;
let skippedCount = 0;
const errors = [];

// Supported file extensions for Cloudinary
const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.pdf', '.mp4', '.mov', '.avi', '.webm', '.mp3', '.wav', '.ogg'];

async function uploadFile(filePath, relativePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  // Skip unsupported file types
  if (!supportedExtensions.includes(ext)) {
    console.log(`  ⏭️  Skipped (unsupported): ${relativePath}`);
    skippedCount++;
    return null;
  }

  try {
    // Determine resource type
    let resourceType = 'image';
    if (['.mp4', '.mov', '.avi', '.webm'].includes(ext)) {
      resourceType = 'video';
    } else if (['.mp3', '.wav', '.ogg'].includes(ext)) {
      resourceType = 'video'; // Cloudinary uses 'video' for audio too
    } else if (ext === '.pdf') {
      resourceType = 'raw';
    }

    // Create a folder structure based on file prefix (small_, medium_, large_, thumbnail_)
    let folder = 'strapi-uploads';
    const filename = path.basename(filePath);
    if (filename.startsWith('small_')) folder = 'strapi-uploads/small';
    else if (filename.startsWith('medium_')) folder = 'strapi-uploads/medium';
    else if (filename.startsWith('large_')) folder = 'strapi-uploads/large';
    else if (filename.startsWith('thumbnail_')) folder = 'strapi-uploads/thumbnail';
    else folder = 'strapi-uploads/original';

    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: false,
      overwrite: true
    });

    console.log(`  ✅ Uploaded: ${relativePath} -> ${result.secure_url}`);
    successCount++;
    return result;
  } catch (err) {
    console.error(`  ❌ Error uploading ${relativePath}: ${err.message}`);
    errors.push({ file: relativePath, error: err.message });
    errorCount++;
    return null;
  }
}

async function uploadDirectory(directory, baseDir = directory) {
  const items = fs.readdirSync(directory, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (item.isDirectory()) {
      await uploadDirectory(fullPath, baseDir);
    } else {
      console.log(`Uploading: ${relativePath}`);
      await uploadFile(fullPath, relativePath);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

async function main() {
  const uploadDir = './backups/uploads-extracted/uploads';
  
  console.log('='.repeat(60));
  console.log('CLOUDINARY MEDIA UPLOAD');
  console.log('='.repeat(60));
  console.log(`Source directory: ${uploadDir}`);
  console.log(`Cloud name: dseckqnba`);
  console.log('='.repeat(60));
  console.log('');

  const startTime = Date.now();

  try {
    await uploadDirectory(uploadDir);
  } catch (err) {
    console.error('Fatal error:', err.message);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('');
  console.log('='.repeat(60));
  console.log('UPLOAD COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Successfully uploaded: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`⏭️  Skipped: ${skippedCount}`);
  console.log(`⏱️  Duration: ${duration} seconds`);
  console.log('='.repeat(60));

  if (errors.length > 0) {
    console.log('');
    console.log('ERRORS:');
    errors.forEach(e => {
      console.log(`  - ${e.file}: ${e.error}`);
    });
  }

  // Save results to file
  const results = {
    timestamp: new Date().toISOString(),
    duration: `${duration} seconds`,
    successCount,
    errorCount,
    skippedCount,
    errors
  };

  fs.writeFileSync(
    './backups/cloudinary-upload-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('');
  console.log('Results saved to: ./backups/cloudinary-upload-results.json');
}

main();