import User from '../models/User';

interface UpdateProfileInput {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    skills?: string[];
}

const PROFILE_SELECT = 'name displayName bio avatarUrl skills role repScore rating completedProblems createdAt updatedAt';

export const getCurrentUserProfile = async (
    userId: string
): Promise<Record<string, unknown> | null> => {
    const user = await User.findById(userId).select(PROFILE_SELECT);
    return user ? (user.toObject() as unknown as Record<string, unknown>) : null;
};

export const updateCurrentUserProfile = async (
    userId: string,
    payload: UpdateProfileInput
): Promise<Record<string, unknown> | null> => {
    const updates: UpdateProfileInput = {};

    if (typeof payload.displayName === 'string') {
        updates.displayName = payload.displayName.trim();
    }

    if (typeof payload.bio === 'string') {
        updates.bio = payload.bio.trim();
    }

    if (typeof payload.avatarUrl === 'string') {
        updates.avatarUrl = payload.avatarUrl.trim();
    }

    if (Array.isArray(payload.skills)) {
        updates.skills = payload.skills.map((skill) => skill.trim()).filter(Boolean);
    }

    const updated = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true
    }).select(PROFILE_SELECT);

    return updated ? (updated.toObject() as unknown as Record<string, unknown>) : null;
};

export const getPublicUserProfile = async (
    userId: string
): Promise<Record<string, unknown> | null> => {
    const user = await User.findById(userId).select(
        'displayName bio avatarUrl skills role repScore rating completedProblems createdAt'
    );

    return user ? (user.toObject() as unknown as Record<string, unknown>) : null;
};