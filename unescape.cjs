const fs = require('fs');
const file = 'c:/Users/USER/Desktop/Miceday/components/Layout/Header.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace \` with `
content = content.replace(/\\`/g, '`');
// Replace \$ with $
content = content.replace(/\\\$/g, '$');

fs.writeFileSync(file, content);
console.log('Done unescaping!');
