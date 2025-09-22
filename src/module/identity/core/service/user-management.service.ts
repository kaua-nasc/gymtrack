import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../persistence/repository/user.repository';
import { User } from '../../persistence/entity/user.entity';
import { hash } from 'bcrypt';
import { UserFollowsRepository } from '../../persistence/repository/user-follows.repository';
import { UserFollows } from '../../persistence/entity/user-follows.entity';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const PASSWORD_HASH_SALT = 10;

@Injectable()
export class UserManagementService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userFollowsRepository: UserFollowsRepository
  ) {}

  async create(user: CreateUserDto) {
    if (await this.userRepository.findOneByEmail(user.email)) {
      throw new ConflictException('email already in use');
    }
    const newUser = new User({
      ...user,
      password: await hash(user.password, PASSWORD_HASH_SALT),
    });

    await this.userRepository.save(newUser);

    return newUser;
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOneById(id);

    if (!user) throw new NotFoundException('user not found');

    return user;
  }

  async getUsers() {
    const users = await this.userRepository.findMany({
      relations: ['following', 'following.following', 'followers', 'followers.follower'],
    });

    if (!users) return [];
    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      following: user.following.map((f) => f.following),
      followers: user.followers.map((f) => f.follower),
    }));
  }

  async exists(userId: string) {
    const user = await this.userRepository.findOneById(userId);
    return user ? true : false;
  }

  async followUser(userId: string, followedId: string) {
    const user = await this.userRepository.findOneById(userId);
    const followedUser = await this.userRepository.findOneById(followedId);
    if (user === null || followedUser === null) {
      throw new NotFoundException('user(s) not exists');
    }

    const userFollows = await this.userFollowsRepository.find({
      where: { followerId: user.id, followingId: followedUser.id },
    });

    if (userFollows) {
      throw new BadRequestException('user already follow this user');
    }

    const following = new UserFollows({ followerId: userId, followingId: followedId });
    await this.userFollowsRepository.save(following);
  }

  async unfollowUser(userId: string, followedId: string) {
    if (userId === followedId) {
      throw new BadRequestException('userId and followedId cannot be equal');
    }
    const user = await this.userRepository.findOneById(userId);
    const followedUser = await this.userRepository.findOneById(followedId);
    if (user === null || followedUser === null) {
      throw new NotFoundException('user(s) not exists');
    }

    const userFollows = await this.userFollowsRepository.find({
      where: { followerId: user.id },
    });

    if (!userFollows) {
      throw new BadRequestException('user not follow this user');
    }

    await this.userFollowsRepository.delete({
      followerId: user.id,
      followingId: followedUser.id,
    });
  }

  async countFollowing(userId: string): Promise<number> {
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      throw new NotFoundException('user not exists');
    }

    return await this.userFollowsRepository.count({
      followerId: user.id,
    });
  }

  async countFollowers(userId: string): Promise<number> {
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      throw new NotFoundException('user not exists');
    }

    return await this.userFollowsRepository.count({
      followingId: user.id,
    });
  }

  async getFollowing(userId: string) {
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      throw new NotFoundException('user not exists');
    }

    const users = await this.userRepository.findMany({
      where: { followers: { id: user.id } },
    });

    return users ?? [];
  }

  async getFollowers(userId: string) {
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      throw new NotFoundException('user not exists');
    }

    const users = await this.userRepository.findMany({
      where: { following: { id: user.id } },
    });

    return users ?? [];
  }
}
