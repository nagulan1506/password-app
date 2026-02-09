const mongoose = require('mongoose');
const { createUser, getUserByEmail, createResetToken } = require('./db');
require('dotenv').config();

async function generateLink() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/password_app');
        console.log('Connected to DB');

        const email = 'manual_test@example.com';
        let user = await getUserByEmail(email);
        if (!user) {
            user = await createUser(email, 'Password123!');
            console.log('Created test user:', email);
        }

        const { token } = await createResetToken(user._id?.toString?.() || user.id);
        const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${appUrl}/reset/${token}`;

        const fs = require('fs');
        fs.writeFileSync('reset_link_only.txt', resetUrl);
        console.log('Link written to reset_link_only.txt');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

generateLink();
