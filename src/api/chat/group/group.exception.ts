import { HttpException, HttpStatus } from '@nestjs/common';

export class GroupNotFoundException extends HttpException {
  constructor() {
    super('Group not found.', HttpStatus.NOT_FOUND);
  }
}

export class MemberAlreadyExistsException extends HttpException {
  constructor() {
    super('Member already exists in current group.', HttpStatus.CONFLICT);
  }
}

export class MemberNotFoundException extends HttpException {
  constructor() {
    super('Member not found.', HttpStatus.NOT_FOUND);
  }
}
