/**
 * NEUROWELL - Authentication Module
 * Handles user registration, login, logout, and session management
 * Uses localStorage for frontend simulation - ready for backend integration
 */

const AuthManager = {
  /**
   * Register new user with validation
   * @param {object} userData - { email, password, confirmPassword, fullName }
   * @returns {object} { success, message, user }
   */
  register: (userData) => {
    // Validation
    const validation = AuthManager.validateRegisterInput(userData);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    // Check if user already exists
    const existingUser = AuthManager.getUserByEmail(userData.email);
    if (existingUser) {
      return { success: false, message: 'Email already registered. Please login or use a different email.' };
    }

    // Hash password (simple SHA256 simulation - would use backend in production)
    const hashedPassword = AuthManager.hashPassword(userData.password);

    // Create user object
    const user = {
      id: AuthManager.generateId(),
      email: userData.email,
      fullName: userData.fullName,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store user in localStorage
    try {
      const users = AuthManager.getAllUsers() || [];
      users.push(user);
      localStorage.setItem(CONSTANTS.STORAGE.USERS, JSON.stringify(users));

      // Log user in automatically after registration
      AuthManager.setSession({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt
      });

      console.log('✅ User registered successfully');
      return {
        success: true,
        message: 'Registration successful! Welcome to NeuroWell.',
        user: { email: user.email, fullName: user.fullName }
      };
    } catch (error) {
      console.error('❌ Error registering user:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  },

  /**
   * Login user with credentials
   * @param {object} credentials - { email, password }
   * @returns {object} { success, message, user }
   */
  login: (credentials) => {
    /* 
    // --- ORIGINAL VALIDATION (Commented out for bypass) ---
    // Validation
    const validation = AuthManager.validateLoginInput(credentials);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    // Find user
    const user = AuthManager.getUserByEmail(credentials.email);
    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    // Verify password
    const hashedInput = AuthManager.hashPassword(credentials.password);
    if (hashedInput !== user.password) {
      return { success: false, message: 'Invalid email or password.' };
    }

    // Set session
    AuthManager.setSession({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt
    });

    console.log('✅ User logged in successfully');
    return {
      success: true,
      message: `Welcome back, ${user.fullName}!`,
      user: { email: user.email, fullName: user.fullName }
    };
    */

    // --- BYPASS LOGIC ---
    AuthManager.setSession({
      id: 'bypass_user_' + Date.now(),
      email: credentials.email || 'guest@example.com',
      fullName: 'Demo User',
      createdAt: new Date().toISOString()
    });

    console.log('✅ User logged in successfully (Bypass)');
    return {
      success: true,
      message: 'Welcome back!',
      user: { email: credentials.email || 'guest@example.com', fullName: 'Demo User' }
    };
  },

  /**
   * Logout current user
   * @returns {boolean} Success status
   */
  logout: () => {
    try {
      localStorage.removeItem(CONSTANTS.STORAGE.SESSION);
      console.log('✅ User logged out');
      return true;
    } catch (error) {
      console.error('❌ Error logging out:', error);
      return false;
    }
  },

  /**
   * Set session data
   * @param {object} sessionData - User session info
   */
  setSession: (sessionData) => {
    try {
      const session = {
        ...sessionData,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(CONSTANTS.STORAGE.SESSION, JSON.stringify(session));
      console.log('✅ Session set');
    } catch (error) {
      console.error('❌ Error setting session:', error);
    }
  },

  /**
   * Get current session
   * @returns {object|null} Session data or null if not logged in
   */
  getSession: () => {
    try {
      const session = localStorage.getItem(CONSTANTS.STORAGE.SESSION);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('❌ Error retrieving session:', error);
      return null;
    }
  },

  /**
   * Check if user is logged in
   * @returns {boolean} Login status
   */
  isLoggedIn: () => {
    return AuthManager.getSession() !== null;
  },

  /**
   * Get current user info
   * @returns {object|null} Current user or null
   */
  getCurrentUser: () => {
    return AuthManager.getSession();
  },

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {object|null} User object or null
   */
  getUserByEmail: (email) => {
    try {
      const users = AuthManager.getAllUsers() || [];
      return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
      console.error('❌ Error finding user:', error);
      return null;
    }
  },

  /**
   * Get all users (for testing purposes)
   * @returns {array} Array of all users
   */
  getAllUsers: () => {
    try {
      const users = localStorage.getItem(CONSTANTS.STORAGE.USERS);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('❌ Error retrieving users:', error);
      return [];
    }
  },

  /**
   * Validate register input
   * @param {object} data - Input data
   * @returns {object} { valid, message }
   */
  validateRegisterInput: (data) => {
    if (!data.fullName || data.fullName.trim().length < 2) {
      return { valid: false, message: 'Full name must be at least 2 characters.' };
    }

    if (!data.email || !AuthManager.isValidEmail(data.email)) {
      return { valid: false, message: 'Please enter a valid email address.' };
    }

    if (!data.password || data.password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters.' };
    }

    if (data.password !== data.confirmPassword) {
      return { valid: false, message: 'Passwords do not match.' };
    }

    return { valid: true };
  },

  /**
   * Validate login input
   * @param {object} data - Input data
   * @returns {object} { valid, message }
   */
  validateLoginInput: (data) => {
    if (!data.email || !AuthManager.isValidEmail(data.email)) {
      return { valid: false, message: 'Please enter a valid email address.' };
    }

    if (!data.password || data.password.length === 0) {
      return { valid: false, message: 'Please enter your password.' };
    }

    return { valid: true };
  },

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Valid or not
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Simple password hashing (SHA256 simulation)
   * In production, this would be done on the backend
   * @param {string} password - Password to hash
   * @returns {string} Hashed password
   */
  hashPassword: (password) => {
    // Simple hash for frontend simulation
    let hash = 0;
    if (password.length === 0) return hash.toString();
    
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(16);
  },

  /**
   * Generate unique user ID
   * @returns {string} Generated ID
   */
  generateId: () => {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Clear all auth data (for testing)
   */
  clearAllData: () => {
    localStorage.removeItem(CONSTANTS.STORAGE.SESSION);
    localStorage.removeItem(CONSTANTS.STORAGE.USERS);
    console.log('✅ All auth data cleared');
  }
};
