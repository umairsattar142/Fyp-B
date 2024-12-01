// User roles
const USER_ROLES = {
  ADMIN: "admin",
  SELLER: "seller",
  BUYER: "buyer",
};

// Auction statuses
const AUCTION_STATUSES = {
  UPCOMING: "upcoming",
  LIVE: "live",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Error messages
const ERROR_MESSAGES = {
  INVALID_INPUT: "Invalid input data",
  UNAUTHORIZED: "You are not authorized to perform this action",
  NOT_FOUND: "Resource not found",
  SERVER_ERROR: "An error occurred on the server",
  INVALID_CREDENTIALS: "Invalid credentials provided",
  AUCTION_ENDED: "This auction has already ended",
  BID_TOO_LOW: "Bid amount is too low",
  PAYMENT_FAILED: "Payment processing failed",
};

// Notification types
const NOTIFICATION_TYPES = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  SUCCESS: "success",
};

// Payment statuses
const PAYMENT_STATUSES = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  DISPUTED: "disputed",
};

// Smart contract events
const CONTRACT_EVENTS = {
  NEW_BID: "NewBid",
  AUCTION_ENDED: "AuctionEnded",
};

const VERIFICATION_EMAIL_TEMPLATE = `Hi!,

Thank you for creating an account at Rare Finds. To complete your registration, please verify your email by providing the below token:

[Token]

If you did not create this account, please disregard this email.

Best regards,
The Rare Finds Team`;

const FORGET_EMAIL_TEMPLATE = `Hi!,

We received a request to reset the password for your account at Rare Finds. If you made this request, use the token below to reset your password:

[Token]

If you did not request a password reset, you can safely ignore this email.

Best regards,
The Rare Finds Team
`;
const RESEND_EMAIL_TOKEN_TEMPLATE = `Hi!,

You requested to resend the email verification token for your account at Rare Finds. Please use the following token to verify your email:

[Token]

If you did not make this request, please ignore this email.

Best regards,
The Rare Finds Team
`;

const DEFAULT_PROFILE =
  "https://media.istockphoto.com/id/1327592506/vector/default-avatar-photo-placeholder-icon-grey-profile-picture-business-man.jpg?s=612x612&w=0&k=20&c=BpR0FVaEa5F24GIw7K8nMWiiGmbb8qmhfkpXcp1dhQg=";
module.exports = {
  USER_ROLES,
  AUCTION_STATUSES,
  ERROR_MESSAGES,
  NOTIFICATION_TYPES,
  PAYMENT_STATUSES,
  CONTRACT_EVENTS,
  DEFAULT_PROFILE,
  VERIFICATION_EMAIL_TEMPLATE,
  FORGET_EMAIL_TEMPLATE,
  RESEND_EMAIL_TOKEN_TEMPLATE,
};
