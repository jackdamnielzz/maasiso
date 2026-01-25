const fs = require('fs');
const path = require('path');

const baseDir = process.cwd();

const checks = [
  {
    name: "Existence of 'app/over-niels-maas/page.tsx'",
    test: () => {
      const p = path.join(baseDir, 'app/over-niels-maas/page.tsx');
      return fs.existsSync(p);
    }
  },
  {
    name: "'app/layout.tsx' contains ProfessionalService and correct @id",
    test: () => {
      const p = path.join(baseDir, 'app/layout.tsx');
      if (!fs.existsSync(p)) return false;
      const content = fs.readFileSync(p, 'utf8');
      return content.includes("ProfessionalService") && content.includes('"@id": "https://maasiso.nl/#professionalservice"');
    }
  },
  {
    name: "'app/blog/[slug]/page.tsx' contains author link",
    test: () => {
      const p = path.join(baseDir, 'app/blog/[slug]/page.tsx');
      if (!fs.existsSync(p)) return false;
      const content = fs.readFileSync(p, 'utf8');
      return content.includes("https://maasiso.nl/over-niels-maas#author");
    }
  },
  {
    name: "'src/components/features/OverOnsContent.tsx' links to /over-niels-maas",
    test: () => {
      const p = path.join(baseDir, 'src/components/features/OverOnsContent.tsx');
      if (!fs.existsSync(p)) return false;
      const content = fs.readFileSync(p, 'utf8');
      return content.includes("/over-niels-maas");
    }
  }
];

function scanForWww(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanForWww(fullPath, results);
    } else if (/\.(tsx|ts|js)$/.test(file) && !fullPath.includes('verify-entities.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("www.maasiso.nl")) {
        results.push(path.relative(baseDir, fullPath));
      }
    }
  });
  return results;
}

async function run() {
  console.log("=== Canonical Entities & JSON-LD Verification ===\n");
  let allPassed = true;

  for (const check of checks) {
    const passed = check.test();
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${check.name}`);
    if (!passed) allPassed = false;
  }

  console.log("\nScanning for 'www.maasiso.nl'...");
  const wwwResults = [];
  scanForWww(path.join(baseDir, 'app'), wwwResults);
  scanForWww(path.join(baseDir, 'src'), wwwResults);

  if (wwwResults.length === 0) {
    console.log("✅ PASS: No remaining 'www.maasiso.nl' found in app/ or src/");
  } else {
    console.log("❌ FAIL: 'www.maasiso.nl' found in:");
    wwwResults.forEach(file => console.log(`  - ${file}`));
    allPassed = false;
  }

  console.log(`\nFinal Result: ${allPassed ? 'PASSED' : 'FAILED'}`);
  process.exit(allPassed ? 0 : 1);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
