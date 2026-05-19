const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const downloadsDir = 'c:\\Users\\Marcos\\Downloads';
const subDir = 'c:\\Users\\Marcos\\Downloads\\DIVERSOS - Dowloads';

console.log('Scanning zip files...');

try {
  const zipFiles = [];
  
  if (fs.existsSync(downloadsDir)) {
    fs.readdirSync(downloadsDir).filter(f => f.toLowerCase().endsWith('.zip')).forEach(f => {
      zipFiles.push(path.join(downloadsDir, f));
    });
  }
  
  if (fs.existsSync(subDir)) {
    fs.readdirSync(subDir).filter(f => f.toLowerCase().endsWith('.zip')).forEach(f => {
      zipFiles.push(path.join(subDir, f));
    });
  }

  for (const fullPath of zipFiles) {
    const zipFile = path.basename(fullPath);
    console.log(`\n--- Zip: ${zipFile} ---`);
    try {
      // Use powershell Get-ArchiveEntry or tar to list the contents
      const cmd = `tar -tf "${fullPath}"`;
      const stdout = execSync(cmd, { encoding: 'utf8' });
      const lines = stdout.split('\n').filter(Boolean);
      console.log(`Total files: ${lines.length}`);
      
      const matches = lines.filter(line => line.includes('Simulator') || line.includes('young-finance') || line.includes('useSimulation'));
      if (matches.length > 0) {
        console.log('MATCHES FOUND:');
        matches.forEach(m => console.log('  ' + m));
      } else {
        console.log('No matches (Simulator/young-finance). First 5 files:');
        lines.slice(0, 5).forEach(l => console.log('  ' + l));
      }
    } catch (err) {
      console.log(`Failed to list ${zipFile}: ${err.message}`);
    }
  }
} catch (err) {
  console.error('Error scanning:', err.message);
}
