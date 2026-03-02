import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { OtpModel } from '../models/otp.model';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import { generateOtp, getOtpExpiry } from '../utils/otp';
import { sendSuccess, sendError } from '../utils/response';

export class AuthController {
  /**
   * POST /api/auth/signup
   */
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        sendError(res, 'An account with this email already exists.', 409);
        return;
      }

      // Hash password and create user
      const hashedPassword = await AuthService.hashPassword(password);
      const user = await UserModel.create(name, email, hashedPassword);

      sendSuccess(res, 'Account created successfully.', AuthService.toUserResponse(user), 201);
    } catch (error) {
      console.error('Signup error:', error);
      sendError(res, 'Failed to create account.', 500);
    }
  }

  /**
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        sendError(res, 'Invalid credentials. Account not found.', 401);
        return;
      }

      // Check if user has password (might be Google-only user)
      if (!user.password) {
        sendError(res, 'This account uses Google Sign-In. Please log in with Google.', 401);
        return;
      }

      // Compare passwords
      const isMatch = await AuthService.comparePassword(password, user.password);
      if (!isMatch) {
        sendError(res, 'Invalid credentials. Wrong password.', 401);
        return;
      }

      // Generate JWT token
      const token = AuthService.generateToken({ userId: user.id, email: user.email });

      sendSuccess(res, 'Login successful.', {
        token,
        user: AuthService.toUserResponse(user),
      });
    } catch (error) {
      console.error('Login error:', error);
      sendError(res, 'Login failed.', 500);
    }
  }

    /**
   * POST /api/auth/google
   * Mobile Google Sign-In: decode idToken payload locally (no network call needed).
   * The Android Google Sign-In SDK already validates the token on the device.
   */
  static async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        sendError(res, 'Missing required field: idToken.', 400);
        return;
      }

      // Decode JWT payload (second segment is base64url-encoded JSON)
      const parts = (idToken as string).split('.');
      if (parts.length !== 3) {
        sendError(res, 'Invalid Google ID token format.', 400);
        return;
      }

      let payload: Record<string, string>;
      try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = Buffer.from(base64, 'base64').toString('utf8');
        payload = JSON.parse(json);
      } catch {
        sendError(res, 'Failed to decode Google ID token.', 400);
        return;
      }

      const google_id = payload.sub;
      const email = payload.email;
      const name = payload.name ?? (payload.email ? payload.email.split('@')[0] : 'User');

      if (!google_id || !email) {
        sendError(res, 'Google token is missing required fields (sub/email).', 400);
        return;
      }

      // Check if user exists by google_id
      let user = await UserModel.findByGoogleId(google_id);

      if (!user) {
        // Check if user exists by email (might have registered with email/password)
        user = await UserModel.findByEmail(email);

        if (user) {
          // Link Google account to existing user
          user = await UserModel.linkGoogleAccount(user.id, google_id);
        } else {
          // Create new user with Google
          user = await UserModel.createGoogleUser(name, email, google_id);
        }
      }

      // Generate JWT token
      const token = AuthService.generateToken({ userId: user.id, email: user.email });

      sendSuccess(res, 'Google login successful.', {
        token,
        user: AuthService.toUserResponse(user),
      });
    } catch (error) {
      console.error('Google login error:', error);
      sendError(res, 'Google login failed.', 500);
    }
  }

  /**
   * POST /api/auth/forgot-password
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        sendError(res, 'Account not found with this email.', 404);
        return;
      }

      // Invalidate existing OTPs and generate new one
      await OtpModel.invalidateAllForUser(user.id);
      const otp = generateOtp();
      const expiresAt = getOtpExpiry();
      await OtpModel.create(user.id, otp, expiresAt);

      // Send OTP via email
      await EmailService.sendOtp(user.email, otp, user.name);

      sendSuccess(res, 'OTP has been sent to your email.');
    } catch (error) {
      console.error('Forgot password error:', error);
      sendError(res, 'Failed to process forgot password request.', 500);
    }
  }

  /**
   * POST /api/auth/reset-password
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, newPassword } = req.body;

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        sendError(res, 'Account not found.', 404);
        return;
      }

      // Verify OTP
      const validOtp = await OtpModel.findValidOtp(user.id, otp);
      if (!validOtp) {
        sendError(res, 'Invalid or expired OTP.', 400);
        return;
      }

      // Update password
      const hashedPassword = await AuthService.hashPassword(newPassword);
      await UserModel.updatePassword(user.id, hashedPassword);

      // Mark OTP as used
      await OtpModel.markUsed(validOtp.id);

      sendSuccess(res, 'Password has been reset successfully.');
    } catch (error) {
      console.error('Reset password error:', error);
      sendError(res, 'Failed to reset password.', 500);
    }
  }
}
