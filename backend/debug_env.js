require('dotenv').config();

const biteKey = process.env.BITE_PRIVATE_KEY;
const privKey = process.env.PRIVATE_KEY;

console.log("--- ENV CHECK ---");
console.log(`BITE_PRIVATE_KEY length: ${biteKey ? biteKey.length : 'undefined'}`);
console.log(`BITE_PRIVATE_KEY ends with space: ${biteKey ? biteKey.endsWith(' ') : 'false'}`);
console.log(`PRIVATE_KEY: ${privKey}`);
console.log(`PRIVATE_KEY is placeholder: ${privKey === 'your_private_key_here'}`);
