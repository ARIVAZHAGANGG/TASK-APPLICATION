const { execSync } = require('child_process');
console.log(execSync('git status --porcelain', { encoding: 'utf-8' }));
