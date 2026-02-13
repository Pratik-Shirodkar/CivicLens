require('dotenv').config();
console.log('ENV CHECK RAW:');
let key = process.env.CDP_API_KEY_PRIVATE_KEY || '';
// Check if it has literal \n characters
if (key.includes('\\n')) {
    console.log('Key contains literal \\n characters. Replacing...');
    key = key.replace(/\\n/g, '\n');
}
console.log(key);
console.log('First line:', key.split('\n')[0]);
