const { execSync } = require('child_process');
const fs = require('fs');
const diff = execSync('git diff', { encoding: 'utf-8' });
fs.writeFileSync('diff_output.txt', diff);
