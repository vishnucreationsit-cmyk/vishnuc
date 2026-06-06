const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function fixJSXInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixJSXInDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Match properties like href=`, src=`, etc.
      const propRegex = /(\w+)=`(\$\{import\.meta\.env\.VITE_API_URL \|\| "http:\/\/localhost:5000"\}[^`]+)`/g;
      if (propRegex.test(content)) {
        content = content.replace(propRegex, '$1={`$2`}');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed JSX in ${fullPath}`);
      }
    }
  }
}

fixJSXInDir(srcDir);
