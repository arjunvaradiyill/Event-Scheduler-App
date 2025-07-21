import dbConnect from '../db';
import User from '../../models/User';

export interface UserFilters {
  role?: string;
  page?: number;
  limit?: number;
}

export interface UserCreateData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
  phone?: string;
  address?: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
  phone?: string;
  address?: string;
}

export class UserService {
  static async getUsers(filters: UserFilters = {}) {
    await dbConnect();

    const { role, page = 1, limit = 10 } = filters;
    const filter: any = {};
    
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(filter);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserById(id: string) {
    await dbConnect();

    const user = await User.findById(id).select('-password');
    return user;
  }

  static async getUserByEmail(email: string) {
    await dbConnect();

    const user = await User.findOne({ email });
    return user;
  }

  static async createUser(data: UserCreateData) {
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = new User(data);
    await user.save();

    // Return user data without password
    const { password, ...userData } = user.toObject();
    return userData;
  }

  static async updateUser(id: string, data: UserUpdateData) {
    await dbConnect();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      data,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  }

  static async deleteUser(id: string) {
    await dbConnect();

    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await User.findByIdAndDelete(id);
  }

  static async validateUserCredentials(email: string, password: string) {
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    return user;
  }
} 