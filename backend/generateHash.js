// D:\horizon-library\backend\generateHash.js
const bcrypt = require('bcryptjs');

const password = 'librarian123'; // The password you want to hash

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    console.log('Hashed Password for "librarian123":');
    console.log(hash);
});