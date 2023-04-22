const exceptionCodes = {
  user: {
    USER_NOT_FOUND: 'U0001',
    MESSAGE_NOT_FOUND: 'U0002',
  },
  auth: {
    login: {
      WRONG_USERNAME_OR_PASSWORD: 'L0001',
    },
    register: {
      USER_ALREADY_EXISTS: 'R0001',
    },
  },
  chat: {
    group: {
      KICK_FORBIDDEN: 'G0001',
      OWNERSHIP_TRANSFER_REQUIRED_BEFORE_LEAVE: 'G0002',
      JOIN_GROUP_REQUEST_NOT_FOUND: 'G0003',
      GROUP_OR_MEMBER_NOT_FOUND: 'G0004',
      KICK_REQUIRES_HIGHER_PERMISSION: 'G0005',
    },
    friend: {
      PENDING_OR_ACCEPTED_FRIEND_REQUEST_ALREADY_EXISTS: 'F0001',
      FRIEND_REQUEST_MUST_BE_ACCEPTED_TO_ADD_USER: 'F0002',
      FRIEND_REQUEST_NOT_FOUND: 'F0003',
    },
  },
  common: {
    FORBIDDEN: 'C0001',
    UNKNOWN: 'C0002',
  },
};

export default exceptionCodes;
