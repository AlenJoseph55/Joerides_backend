import {catchAsync,AppError} from '../utils/errorHandler.js';
import { prisma } from '../utils/utils.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const register = catchAsync(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        throw new AppError(400,'Name, Email and password are required');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: email.includes('admin') ? 'ADMIN' : 'USER',
            emailVerified: false
        }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ token, user: { ...user, password: undefined } });
})

const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new AppError(400,'Email and password are required');
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !await bcrypt.compare(password, user.password)) {
        throw new AppError('Invalid credentials');
    }
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    res.json({ token, user: { ...user, password: undefined } });
})

export {
    register,
    login
}