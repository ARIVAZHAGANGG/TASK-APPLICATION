const { execSync } = require('child_process');
const files = execSync('git diff --name-only', { encoding: 'utf-8' }).trim().split('\n');
files.forEach(f => console.log(f));
