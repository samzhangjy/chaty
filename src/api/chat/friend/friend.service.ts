import { User } from '@/api/user/user.entity';
import { UserService } from '@/api/user/user.service';
import { ChatyConfig } from '@/common/helper/config.helper';
import { ServiceException } from '@/common/helper/exception.helper';
import { paginateResponse } from '@/common/helper/pagination.helper';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {
  AddFriendDto,
  SendFriendRequestDto,
  UpdateFriendRequestDto,
} from './friend.dto';
import { Friend } from './friend.entity';
import {
  FriendPermission,
  FriendPreferences,
} from './friendPreferences.entity';
import { FriendRequest, FriendRequestStatus } from './friendRequest.entity';

export type FriendRequestFilter =
  | 'HANDLED'
  | 'UNHANDLED'
  | 'ACCEPTED'
  | 'UNACCEPTED'
  | 'ALL';

@Injectable()
export class FriendService {
  @InjectRepository(Friend)
  private readonly friendRepository: Repository<Friend>;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(FriendRequest)
  private readonly friendRequestRepository: Repository<FriendRequest>;

  @InjectRepository(FriendPreferences)
  private readonly friendPreferencesRepository: Repository<FriendPreferences>;

  @InjectDataSource()
  private readonly dataSource: DataSource;

  @Inject(UserService)
  private readonly userService: UserService;

  @Inject(ConfigService)
  private readonly configService: ConfigService<ChatyConfig, true>;

  public async getFriendRequest(
    requestId: string,
    relations: boolean | string[] = true,
    user?: User,
  ) {
    const request = await this.friendRequestRepository.findOne({
      where: { id: requestId },
      relations: relations
        ? typeof relations === 'boolean'
          ? ['target', 'sender', 'target.friends', 'sender.friends']
          : relations
        : undefined,
    });
    if (!request) {
      throw new ServiceException(
        'Friend request with given id not found.',
        HttpStatus.NOT_FOUND,
      );
    }
    if (
      user &&
      request.sender.id !== user.id &&
      request.target.id !== user.id
    ) {
      throw new ServiceException('Forbidden.', HttpStatus.FORBIDDEN);
    }
    return request;
  }

  /**
   * Add a friend by an accepted friend request.
   * @param payload Payload object with `requestId`.
   */
  public async addFriend({ requestId }: AddFriendDto) {
    // TODO: figure out why it is not saving relations correctly
    const request = await this.getFriendRequest(requestId, true);
    if (request.status !== FriendRequestStatus.ACCEPTED) {
      throw new ServiceException(
        'Friend request must be accepted to add the target user.',
        HttpStatus.FORBIDDEN,
      );
    }
    const senderToReceiverPreferences =
      await this.friendPreferencesRepository.save({
        nickname: request.senderSetNickname,
        permission: request.senderSetPermission,
      });
    const senderToReceiver = await this.friendRepository.save({
      preferences: senderToReceiverPreferences,
      target: request.target,
    });
    const t = await this.friendRepository.findOne({
      where: { id: senderToReceiver.id },
      relations: ['target'],
    });
    console.log(t);
    const receiverToSenderPreferences =
      await this.friendPreferencesRepository.save({
        nickname: request.targetSetNickname,
        permission: request.targetSetPermission,
      });
    const receiverToSender = await this.friendRepository.save({
      preferences: receiverToSenderPreferences,
      target: request.sender,
    });
    await this.dataSource
      .createQueryBuilder()
      .relation(User, 'friends')
      .of(request.sender)
      .add(senderToReceiver.id);
    const sender = await this.userRepository.findOne({
      where: { id: request.sender.id },
      relations: ['friends', 'friends.target'],
    });
    console.log(sender.friends);
    const ta = await this.friendRepository.findOne({
      where: { id: senderToReceiver.id },
      relations: ['target'],
    });
    console.log(ta);
    const receiver = await this.userRepository.findOne({
      where: { id: request.target.id },
      relations: ['friends'],
    });
    receiver.friends.push(receiverToSender);
    await this.userRepository.save(receiver);
  }

  /**
   * Send a friend request created by current user.
   * @param payload Payload object containing required information.
   * @returns The sent friend request.
   */
  public async sendFriendRequest({
    friendId,
    user,
    nickname,
    permission = FriendPermission.NORMAL,
    message,
  }: SendFriendRequestDto & { friendId: number }) {
    const target = await this.userService.getUser(friendId, false);
    const previousRequests = await this.friendRequestRepository.find({
      where: {
        sender: {
          id: user.id,
        },
        target: {
          id: friendId,
        },
        status: FriendRequestStatus.WAITING,
      },
    });

    if (previousRequests.length) {
      throw new ServiceException(
        'A pending friend request for the same target user already exists.',
        HttpStatus.CONFLICT,
      );
    }

    const request = await this.friendRequestRepository.save({
      message,
      target,
      sender: user,
      senderSetNickname: nickname,
      senderSetPermission: permission,
    });
    return request;
  }

  /**
   * Updates a friend request with given id, should be operated
   * by request target user.
   * @param payload Payload object.
   */
  public async updateFriendRequest({
    requestId,
    user,
    nickname,
    permission = FriendPermission.NORMAL,
    status,
  }: UpdateFriendRequestDto & {
    requestId: string;
  }) {
    const request = await this.getFriendRequest(requestId, ['target']);
    if (request.target.id !== user.id) {
      throw new ServiceException('Forbidden.', HttpStatus.FORBIDDEN);
    }
    await this.friendRequestRepository.update(request.id, {
      status,
      targetSetNickname: nickname,
      targetSetPermission: permission,
    });
  }

  public async getFriendRequests({
    user,
    filter = 'ALL',
    take: userTake,
    page: userPage,
    mode,
  }: {
    user: User;
    filter: FriendRequestFilter;
    take: number;
    page: number;
    mode: 'sent' | 'received';
  }) {
    const take = Math.min(
      userTake || 10,
      this.configService.get('query.limit', { infer: true }),
    );
    const page = userPage || 1;
    const skip = (page - 1) * take;

    const requests = await this.friendRequestRepository.findAndCount({
      where: {
        [mode === 'sent' ? 'sender' : 'target']: {
          id: user.id,
        },
        status:
          filter === 'ACCEPTED'
            ? FriendRequestStatus.ACCEPTED
            : filter === 'UNACCEPTED'
            ? FriendRequestStatus.UNACCEPTED
            : filter === 'UNHANDLED'
            ? FriendRequestStatus.WAITING
            : filter === 'HANDLED'
            ? In([FriendRequestStatus.ACCEPTED, FriendRequestStatus.UNACCEPTED])
            : undefined,
      },
      relations: ['sender', 'target'],
      order: {
        createdAt: 'desc',
      },
      take,
      skip,
    });

    return paginateResponse(requests, page, take);
  }
}
