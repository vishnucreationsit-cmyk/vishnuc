const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('http://localhost:5000')) {
        // Find single quotes
        content = content.replace(/'http:\/\/localhost:5000([^']+)'/g, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}$1`');
        // Find double quotes
        content = content.replace(/"http:\/\/localhost:5000([^"]+)"/g, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}$1`');
        // Find template literals
        content = content.replace(/`http:\/\/localhost:5000([^`]+)`/g, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}$1`');
        
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceInDir(srcDir);
