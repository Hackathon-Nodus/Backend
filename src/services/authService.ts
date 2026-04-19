interface AuthPayload {
    email?: string;
    password?: string;
    name?: string;
}

export const registerAdmin = async (payload: AuthPayload): Promise<AuthPayload> => {
    return {
        name: payload.name,
        email: payload.email
    };
};

export const loginAdmin = async (payload: AuthPayload): Promise<{ token: string }> => {
    if (!payload.email || !payload.password) {
        throw new Error('Email and password are required');
    }

    return { token: 'demo-token' };
};
