import crypto from 'crypto';
import User from '../models/User';
import { generateUserToken } from '../utils/tokenUtils';

interface AuthPayload {
    email?: string;
    password?: string;
    name?: string;
}

interface AuthResult {
    user: Record<string, unknown>;
    token: string;
}

const SCRYPT_KEYLEN = 64;

const scryptAsync = (password: string, salt: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, SCRYPT_KEYLEN, (error, derivedKey) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(derivedKey as Buffer);
        });
    });
};

const hashPassword = async (plainTextPassword: string): Promise<string> => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hashBuffer = await scryptAsync(plainTextPassword, salt);
    return `${salt}:${hashBuffer.toString('hex')}`;
};

const verifyPassword = async (plainTextPassword: string, storedHash: string): Promise<boolean> => {
    const [salt, hashedValue] = storedHash.split(':');
    if (!salt || !hashedValue) {
        return false;
    }

    const hashBuffer = await scryptAsync(plainTextPassword, salt);
    const storedBuffer = Buffer.from(hashedValue, 'hex');

    if (storedBuffer.length !== hashBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(storedBuffer, hashBuffer);
};

const normalizeAuthPayload = (payload: AuthPayload): Required<AuthPayload> => {
    const name = payload.name?.trim() || '';
    const email = payload.email?.trim().toLowerCase() || '';
    const password = payload.password || '';

    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    return { name, email, password };
};

const toSafeUserObject = (user: any): Record<string, unknown> => {
    const plainObject = user.toObject() as Record<string, unknown>;
    delete plainObject.password;
    delete plainObject.__v;
    return plainObject;
};

export const registerAdmin = async (payload: AuthPayload): Promise<AuthResult> => {
    const { name, email, password } = normalizeAuthPayload(payload);

    if (!name) {
        throw new Error('Name is required');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email already exists');
    }

    const passwordHash = await hashPassword(password);
    const createdUser = await User.create({
        name,
        displayName: name,
        email,
        password: passwordHash,
        role: 'user'
    });

    const token = generateUserToken(
        String(createdUser._id),
        createdUser.email,
        createdUser.role
    );

    return {
        user: toSafeUserObject(createdUser),
        token
    };
};

export const loginAdmin = async (payload: AuthPayload): Promise<AuthResult> => {
    const { email, password } = normalizeAuthPayload(payload);

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const validPassword = await verifyPassword(password, user.password);
    if (!validPassword) {
        throw new Error('Invalid email or password');
    }

    const token = generateUserToken(String(user._id), user.email, user.role);

    return {
        user: toSafeUserObject(user),
        token
    };
};
