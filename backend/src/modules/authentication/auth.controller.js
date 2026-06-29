const authService = require('./auth.service');
const { UserDTO, AuthResponseDTO } = require('./auth.dto');

const setRefreshCookie = (res, token) => {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure;' : '';
  const sameSite = process.env.NODE_ENV === 'production' ? 'SameSite=None;' : 'SameSite=Lax;';
  // 7 days cookie
  res.setHeader(
    'Set-Cookie',
    `philixmate_refresh=${token}; Path=/; HttpOnly; ${secure} ${sameSite} Max-Age=${7 * 24 * 60 * 60};`
  );
};

const clearRefreshCookie = (res) => {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure;' : '';
  const sameSite = process.env.NODE_ENV === 'production' ? 'SameSite=None;' : 'SameSite=Lax;';
  res.setHeader(
    'Set-Cookie',
    `philixmate_refresh=; Path=/; HttpOnly; ${secure} ${sameSite} Max-Age=0;`
  );
};

class AuthController {
  signup = async (req, res, next) => {
    try {
      const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || '';
      
      const { user, accessToken, refreshToken } = await authService.signup(req.body, ip, userAgent);
      
      setRefreshCookie(res, refreshToken);
      const response = AuthResponseDTO.from(user, accessToken);
      res.statusCode = 201;
      return res.success(response, 'User signed up successfully');
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || '';
      
      const { user, accessToken, refreshToken } = await authService.login(
        req.body.email,
        req.body.password,
        ip,
        userAgent
      );
      
      setRefreshCookie(res, refreshToken);
      const response = AuthResponseDTO.from(user, accessToken);
      return res.success(response, 'User logged in successfully');
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const cookies = req.headers.cookie || '';
      const match = cookies.match(/philixmate_refresh=([^;]+)/);
      const oldRefreshToken = match ? match[1] : null;
      
      const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || '';

      const { accessToken, refreshToken: newRefreshToken } = await authService.rotateRefreshToken(
        oldRefreshToken,
        ip,
        userAgent
      );

      setRefreshCookie(res, newRefreshToken);
      return res.success({ token: accessToken }, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      const cookies = req.headers.cookie || '';
      const match = cookies.match(/philixmate_refresh=([^;]+)/);
      const refreshToken = match ? match[1] : null;
      
      const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || '';

      await authService.logout(refreshToken, ip, userAgent);
      clearRefreshCookie(res);
      
      return res.success(null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  };

  getSessions = async (req, res, next) => {
    try {
      const cookies = req.headers.cookie || '';
      const match = cookies.match(/philixmate_refresh=([^;]+)/);
      const currentToken = match ? match[1] : null;
      
      const sessions = await authService.getActiveSessions(req.user._id, currentToken);
      return res.success({ sessions }, 'Active sessions list loaded');
    } catch (error) {
      next(error);
    }
  };

  revokeSession = async (req, res, next) => {
    try {
      await authService.revokeSession(req.user._id, req.params.sessionId);
      return res.success(null, 'Device session terminated successfully');
    } catch (error) {
      next(error);
    }
  };

  revokeAllOtherSessions = async (req, res, next) => {
    try {
      const cookies = req.headers.cookie || '';
      const match = cookies.match(/philixmate_refresh=([^;]+)/);
      const currentToken = match ? match[1] : null;
      
      await authService.revokeAllSessions(req.user._id, currentToken);
      return res.success(null, 'All other device sessions terminated');
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req, res, next) => {
    try {
      const response = UserDTO.fromUser(req.user);
      return res.success({ user: response }, 'Current user profile fetched');
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      await authService.forgotPassword(req.body.email);
      return res.success(null, 'If an account with that email exists, a reset link has been sent.');
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      const { user, accessToken, refreshToken } = await authService.resetPassword(
        req.params.token,
        req.body.password
      );
      
      setRefreshCookie(res, refreshToken);
      const response = AuthResponseDTO.from(user, accessToken);
      return res.success(response, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AuthController();
