// Middleware to check if user is admin
export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Middleware to check if user is moderator or admin
export const authorizeModerator = (req, res, next) => {
  if (req.user && (req.user.role === 'moderator' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Moderator privileges required.' });
  }
};

// Middleware to check if user owns the resource or is admin
export const authorizeOwnerOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    if (
      req.user && (
        req.user._id.toString() === resourceUserId.toString() ||
        req.user.role === 'admin'
      )
    ) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Owner privileges required.' });
    }
  };
};

// Middleware to check user permissions based on roles and actions
export const checkPermission = (requiredPermissions) => {
  const permissionMap = {
    admin: ['create', 'read', 'update', 'delete', 'manage'],
    moderator: ['create', 'read', 'update'],
    user: ['create', 'read', 'update']
  };

  return (req, res, next) => {
    const userRole = req.user?.role || 'user';
    const userPermissions = permissionMap[userRole] || [];

    const hasPermission = requiredPermissions.every(
      permission => userPermissions.includes(permission)
    );

    if (hasPermission) {
      next();
    } else {
      res.status(403).json({ 
        message: \`Access denied. Required permissions: \${requiredPermissions.join(', ')}\` 
      });
    }
  };
};
