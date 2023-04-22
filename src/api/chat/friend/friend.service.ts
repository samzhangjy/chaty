import { User } from '@/api/user/user.entity';
import { UserService } from '@/api/user/user.service';
import { ChatyConfig } from '@/common/helper/config.helper';
import exceptionCodes from '@/common/helper/exception-codes.helper';
import { ServiceException } from '@/common/helper/exception.helper';
import { paginateResponse } from '@/common/helper/pagination.helper';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { SendFriendRequestDto, UpdateFriendRequestDto } from './friend.dto';
import {
  FriendPermission,
  FriendPreferences,
} from './friendPreferences.entity';
import { FriendRequest, FriendRequestStatus } from './friendRequest.entity';
import { Friend } from './friend.type';

export type FriendRequestFilter =
  | 'HANDLED'
  | 'UNHANDLED'
  | 'ACCEPTED'
  | 'UNACCEPTED'
  | 'ALL';

@Injectable()
export class FriendService {
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
        exceptionCodes.chat.friend.FRIEND_REQUEST_NOT_FOUND,
      );
    }
    if (
      user &&
      request.sender.id !== user.id &&
      request.target.id !== user.id
    ) {
      throw new ServiceException(
        'Forbidden.',
        HttpStatus.FORBIDDEN,
        exceptionCodes.common.FORBIDDEN,
      );
    }
    return request;
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
      where: [
        {
          sender: {
            id: user.id,
          },
          target: {
            id: friendId,
          },
          status: FriendRequestStatus.WAITING,
        },
        {
          sender: {
            id: user.id,
          },
          target: {
            id: friendId,
          },
          status: FriendRequestStatus.ACCEPTED,
        },
      ],
    });

    if (previousRequests.length) {
      throw new ServiceException(
        'A pending or accepted friend request for the same target user already exists.',
        HttpStatus.CONFLICT,
        exceptionCodes.chat.friend.PENDING_OR_ACCEPTED_FRIEND_REQUEST_ALREADY_EXISTS,
      );
    }

    const preferences = await this.friendPreferencesRepository.save({
      nickname,
      permission,
    });

    const request = await this.friendRequestRepository.save({
      message,
      target,
      sender: user,
      senderSetPreferences: preferences,
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
      throw new ServiceException(
        'Forbidden.',
        HttpStatus.FORBIDDEN,
        exceptionCodes.common.FORBIDDEN,
      );
    }
    const preferences = await this.friendPreferencesRepository.save({
      nickname,
      permission,
    });
    await this.friendRequestRepository.update(request.id, {
      status,
      targetSetPreferences: preferences,
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

  public async getFriends(user: User) {
    const friends: Friend[] = [];
    const sentAcceptedRequests = await this.friendRequestRepository.find({
      where: {
        sender: {
          id: user.id,
        },
        status: FriendRequestStatus.ACCEPTED,
      },
      relations: ['target', 'senderSetPreferences'],
    });
    for (const request of sentAcceptedRequests) {
      friends.push({
        target: request.target,
        preferences: request.senderSetPreferences,
      });
    }
    const receivedAcceptedRequests = await this.friendRequestRepository.find({
      where: {
        target: {
          id: user.id,
        },
        status: FriendRequestStatus.ACCEPTED,
      },
      relations: ['sender', 'targetSetPreferences'],
    });
    for (const request of receivedAcceptedRequests) {
      friends.push({
        target: request.sender,
        preferences: request.targetSetPreferences,
      });
    }
    return friends;
  }
}
