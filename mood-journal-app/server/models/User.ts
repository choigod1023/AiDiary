import mongoose, { Document, Schema } from "mongoose";

export interface IUser {
  email: string;
  name: string;
  avatar?: string;
  provider: "google";
  providerId: string;
  createdAt: Date;
  lastLoginAt: Date;
}

// Document와 결합된 인터페이스
export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  provider: {
    type: String,
    required: true,
    enum: ["google"],
  },
  providerId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
});

// 복합 인덱스: provider + providerId로 빠른 검색
UserSchema.index({ provider: 1, providerId: 1 }, { unique: true });

// 이메일로 사용자 검색
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// 소셜 로그인으로 사용자 검색
UserSchema.statics.findByProvider = function (
  provider: string,
  providerId: string
) {
  return this.findOne({ provider, providerId });
};

export default mongoose.model<IUserDocument>("User", UserSchema);
