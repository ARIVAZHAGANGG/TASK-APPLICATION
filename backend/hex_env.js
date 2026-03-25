const fs = require('fs');
const content = fs.readFileSync('.env', 'utf8');
console.log("File content length: " + content.length);
for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const hex = char.charCodeAt(0).toString(16).padStart(2, '0');
    console.log(`${i}: '${char}' [0x${hex}]`);
}
