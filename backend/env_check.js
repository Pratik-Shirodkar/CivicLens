require('dotenv').config();
console.log('ENV CHECK:');
const name = process.env.CDP_API_KEY_NAME || '';
// Handle potentially quoted multiline key
let key = process.env.CDP_API_KEY_PRIVATE_KEY || '';
if (key.startsWith('"') && key.endsWith('"')) {
    key = key.slice(1, -1);
}
// Replace escaped newlines if present (for single line env var)
key = key.replace(/\\n/g, '\n');

console.log(`CDP_API_KEY_NAME: ${name}`);
console.log(`CDP_API_KEY_PRIVATE_KEY length: ${key.length}`);
console.log(`CDP_API_KEY_PRIVATE_KEY first line: ${key.split('\n')[0]}`);
console.log(`CDP_API_KEY_PRIVATE_KEY last line: ${key.split('\n').filter(l => l.trim().length > 0).pop()}`);
