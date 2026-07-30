import dotenv from 'dotenv';
import User from '../models/User.js';
import { connectDatabase } from '../config/database.js';

dotenv.config();
await connectDatabase();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');

const passwordHash = await User.hashPassword(password);
await User.findOneAndUpdate({ email }, { name: 'SecureGuard Admin', email, passwordHash, role: 'admin' }, { upsert: true });
console.log(`Admin ready: ${email}`);
process.exit(0);
