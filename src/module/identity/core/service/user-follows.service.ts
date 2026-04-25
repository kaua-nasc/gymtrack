import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { UserType } from '../../core/enum/user-type.enum';
import { UserFollows } from '../../persistence/entity/user-follows.entity';
import { UserFollowsRepository } from '../../persistence/repository/user-follows.repository';
import { UserRepository } from '../../persistence/repository/user.repository';
import { DomainException } from '@src/module/shared/core/exception/domain.exception';
import { UserNotFoundException } from '../exception/user-not-found.exception';

@Injectable()
export class UserFollowsService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userFollowsRepository: UserFollowsRepository,
    private readonly logger: AppLogger,
    @Inject(REQUEST) private readonly request: { user: { id: string; type: UserType } }
  ) {}

  async followUser(followingId: string): Promise<void> {
    const followerId = this.request.user.id;
    this.logger.log(`User ${followerId} attempting to follow user ${followingId}`);

    if (followerId === followingId) {
      throw new DomainException('You cannot follow yourself');
    }

    const followingUser = await this.userRepository.findOneById(followingId);
    if (!followingUser) {
      throw new UserNotFoundException(followingId);
    }

    const existingFollow = await this.userFollowsRepository.find({
      where: { followerId, followingId },
    });

    if (existingFollow) {
      this.logger.warn(`User ${followerId} already follows user ${followingId}`);
      return; // Idempotent - do nothing if already following
    }

    const follow = new UserFollows({
      followerId,
      followingId,
    });

    await this.userFollowsRepository.save(follow);
    this.logger.log(`User ${followerId} successfully followed user ${followingId}`);
  }

  async unfollowUser(followingId: string): Promise<void> {
    const followerId = this.request.user.id;
    this.logger.log(`User ${followerId} attempting to unfollow user ${followingId}`);

    if (followerId === followingId) {
      throw new DomainException('You cannot unfollow yourself');
    }

    const followingUser = await this.userRepository.findOneById(followingId);
    if (!followingUser) {
      throw new UserNotFoundException(followingId);
    }

    await this.userFollowsRepository.delete({
      followerId,
      followingId,
    });

    this.logger.log(`User ${followerId} successfully unfollowed user ${followingId}`);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.userFollowsRepository.find({
      where: { followerId, followingId },
    });
    return !!follow;
  }

  async countFollowing(userId: string): Promise<number> {
    return await this.userFollowsRepository.count({ where: { followerId: userId } });
  }

  async countFollowers(userId: string): Promise<number> {
    return await this.userFollowsRepository.count({ where: { followingId: userId } });
  }

  async getFollowing(userId: string) {
    const follows = await this.userFollowsRepository.findMany({
      where: { followerId: userId },
      relations: ['following'],
    });
    return follows.map((f) => f.following);
  }

  async getFollowers(userId: string) {
    const follows = await this.userFollowsRepository.findMany({
      where: { followingId: userId },
      relations: ['follower'],
    });
    return follows.map((f) => f.follower);
  }
}
