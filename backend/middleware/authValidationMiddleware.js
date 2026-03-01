const validateRegistration = (req, res, next) => {
  const { name, email, password, companyName } = req.body;

  // Name validation
  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Name is required"
    });
  }
  
  if (name.length < 2 || name.length > 50) {
    return res.status(400).json({
      success: false,
      message: "Name must be between 2 and 50 characters"
    });
  }

  // Email validation
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address"
    });
  }

  // Password validation
  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required"
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long"
    });
  }

  // Check password complexity
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const missingRequirements = [];
  if (!hasUpperCase) missingRequirements.push("uppercase letter");
  if (!hasLowerCase) missingRequirements.push("lowercase letter");
  if (!hasNumbers) missingRequirements.push("number");
  if (!hasSpecialChar) missingRequirements.push("special character");

  if (missingRequirements.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Password must contain at least one ${missingRequirements.join(", ")}`
    });
  }

  // Employer specific validation
  if (req.path.includes('employer') && !companyName) {
    return res.status(400).json({
      success: false,
      message: "Company name is required for employer registration"
    });
  }

  next();
};

/**
 * Validate login data
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password"
    });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address"
    });
  }

  next();
};

/**
 * Validate password change
 */
const validatePasswordChange = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide both old and new password"
    });
  }

  if (oldPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password must be different from old password"
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 8 characters long"
    });
  }

  // Check new password complexity
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumbers = /\d/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const missingRequirements = [];
  if (!hasUpperCase) missingRequirements.push("uppercase letter");
  if (!hasLowerCase) missingRequirements.push("lowercase letter");
  if (!hasNumbers) missingRequirements.push("number");
  if (!hasSpecialChar) missingRequirements.push("special character");

  if (missingRequirements.length > 0) {
    return res.status(400).json({
      success: false,
      message: `New password must contain at least one ${missingRequirements.join(", ")}`
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordChange
};
