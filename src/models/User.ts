import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  skills?: string[];
  email: string;
  password: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  dateOfBirth?: Date;
  height?: number;
  weight?: number;
  fitnessGoal?: 'weight-loss' | 'muscle-gain' | 'endurance' | 'flexibility' | 'general-fitness';
  role: 'user' | 'admin' | 'client' | 'solver';
  repScore: number;
  rating: {
    avg: number;
    count: number;
  };
  completedProblems: number;
  portfolio: Array<{
    title?: string;
    description?: string;
    link?: string;
  }>;
  earnings: number;
  badges: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [50, 'Display name cannot exceed 50 characters']
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [300, 'Bio cannot exceed 300 characters']
    },
    avatarUrl: {
      type: String,
      trim: true
    },
    skills: {
      type: [String],
      default: []
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    dateOfBirth: {
      type: Date
    },
    height: {
      type: Number,
      min: [50, 'Height must be at least 50cm'],
      max: [300, 'Height cannot exceed 300cm']
    },
    weight: {
      type: Number,
      min: [10, 'Weight must be at least 10kg'],
      max: [500, 'Weight cannot exceed 500kg']
    },
    fitnessGoal: {
      type: String,
      enum: ['weight-loss', 'muscle-gain', 'endurance', 'flexibility', 'general-fitness']
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'client', 'solver'],
      default: 'user'
    },
    repScore: {
      type: Number,
      default: 0
    },
    rating: {
      avg: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    },
    completedProblems: {
      type: Number,
      default: 0
    },
    portfolio: {
      type: [
        {
          title: String,
          description: String,
          link: String
        }
      ],
      default: []
    },
    earnings: {
      type: Number,
      default: 0
    },
    badges: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', function (next) {
  if (!this.displayName) {
    this.displayName = this.name;
  }
  next();
});

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function (): Partial<IUser> {
  const user = this.toObject() as Record<string, unknown>;
  delete user.password;
  delete user.__v;
  return user as Partial<IUser>;
};

// Index for faster queries
userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
export default User;