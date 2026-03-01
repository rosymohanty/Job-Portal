// middleware/userValidationMiddleware.js

/**
 * Validate user update data
 */
const validateUserUpdate = (req, res, next) => {
  const updates = req.body;
  const allowedUpdates = [
    'name', 'email', 'phone', 'companyName', 
    'companyWebsite', 'companyLocation', 'bio', 
    'skills', 'isApproved', 'profilePicture', 'location'
  ];
  
  // Check for invalid fields
  const invalidFields = Object.keys(updates).filter(
    field => !allowedUpdates.includes(field)
  );
  
  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid update fields: ${invalidFields.join(', ')}`,
      allowedFields: allowedUpdates
    });
  }
  
  // Name validation
  if (updates.name) {
    if (updates.name.length < 2 || updates.name.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 50 characters"
      });
    }
  }
  
  // Email validation
  if (updates.email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(updates.email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }
  }
  
  // Phone validation
  if (updates.phone) {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(updates.phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format"
      });
    }
  }
  
  // Website validation
  if (updates.companyWebsite) {
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    if (!urlRegex.test(updates.companyWebsite)) {
      return res.status(400).json({
        success: false,
        message: "Invalid website URL format"
      });
    }
  }
  
  // Bio validation
  if (updates.bio && updates.bio.length > 1000) {
    return res.status(400).json({
      success: false,
      message: "Bio must be less than 1000 characters"
    });
  }
  
  next();
};

module.exports = { validateUserUpdate };