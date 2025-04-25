import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CommonModule } from '../common/common.module';

describe('AuthModule', () => {
  let module: TestingModule;
  let authService: AuthService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async () => ({
            uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/leave-management-test',
          }),
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET') || 'test-secret',
            signOptions: { expiresIn: '1d' },
          }),
          inject: [ConfigService],
        }),
        PassportModule,
        CacheModule.register({
          ttl: 300,
          max: 100,
        }),
        CommonModule,
      ],
      controllers: [AuthController],
      providers: [AuthService, JwtStrategy],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('Auth Flow', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'Test123!',
      name: 'Test User',
    };

    it('should sign up a new user', async () => {
      const result = await authService.signup(testUser);
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('User registered successfully. Please verify your email.');
    });

    it('should not allow duplicate email signup', async () => {
      try {
        await authService.signup(testUser);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('User with this email already exists');
      }
    });

    it('should verify OTP and allow login', async () => {
      // First, get the OTP from the database
      const user = await authService['userModel'].findOne({ email: testUser.email });
      expect(user).toBeDefined();
      expect(user.otp).toBeDefined();

      // Verify OTP
      const verifyResult = await authService.verifyOtp({
        email: testUser.email,
        otp: user.otp,
      });
      expect(verifyResult.message).toBe('Email verified successfully');

      // Try to login
      const loginResult = await authService.login({
        email: testUser.email,
        password: testUser.password,
      });
      expect(loginResult).toHaveProperty('access_token');
      expect(loginResult).toHaveProperty('user');
      expect(loginResult.user.email).toBe(testUser.email);
    });
  });
}); 