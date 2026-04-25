import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { UserType } from '../../core/enum/user-type.enum';
import { TrainerStudentRelationship } from '../../persistence/entity/trainer-student-relationship.entity';
import { User } from '../../persistence/entity/user.entity';
import { TrainerStudentRelationshipRepository } from '../../persistence/repository/trainer-student-relationship.repository';
import { UserRepository } from '../../persistence/repository/user.repository';
import { UserPrivacySettingsRepository } from '../../persistence/repository/user-privacy-settings.repository';
import { UserNotFoundException } from '../exception/user-not-found.exception';
import { DomainException } from '@src/module/shared/core/exception/domain.exception';
import { UserFollowsService } from './user-follows.service';

@Injectable()
export class TrainerRelationshipService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly trainerStudentRelationshipRepository: TrainerStudentRelationshipRepository,
    private readonly userPrivacySettingsRepository: UserPrivacySettingsRepository,
    private readonly userFollowsService: UserFollowsService,
    private readonly logger: AppLogger,
    @Inject(REQUEST) private readonly request: { user: { id: string; type: UserType } }
  ) {}

  async updateTrainerInviteCode(inviteCode: string): Promise<void> {
    const { id: userId, type } = this.request.user;

    if (type !== UserType.personalTrainer) {
      throw new DomainException('only personal trainers can have invite codes');
    }

    this.logger.log(`Updating invite code for trainer ${userId} to ${inviteCode}`);

    const existing = await this.userRepository.findByInviteCode(inviteCode);
    if (existing && existing.id !== userId) {
      throw new DomainException('invite code already in use');
    }

    await this.userRepository.update({ id: userId }, { trainerInviteCode: inviteCode });
  }

  async getTrainerInviteCode(): Promise<string | undefined> {
    const { id: userId, type } = this.request.user;

    if (type !== UserType.personalTrainer) {
      throw new DomainException('only personal trainers have invite codes');
    }

    const user = await this.userRepository.findOneById(userId);
    return user?.trainerInviteCode;
  }

  async linkTrainer(inviteCode: string): Promise<void> {
    const { id: studentId } = this.request.user;
    this.logger.log(`Student ${studentId} attempting to link with code ${inviteCode}`);

    const trainer = await this.userRepository.findByInviteCode(inviteCode);
    if (!trainer || trainer.type !== UserType.personalTrainer) {
      throw new UserNotFoundException(inviteCode);
    }

    const existingRelationship =
      await this.trainerStudentRelationshipRepository.findByStudentId(studentId);
    if (existingRelationship) {
      throw new DomainException('student already has a linked trainer');
    }

    const relationship = new TrainerStudentRelationship({
      trainerId: trainer.id,
      studentId,
    });

    await this.trainerStudentRelationshipRepository.save(relationship);
    this.logger.log(`Successfully linked student ${studentId} to trainer ${trainer.id}`);

    // Auto-follow side effect
    try {
      await this.userFollowsService.followUser(trainer.id);
    } catch (e) {
      this.logger.warn(`Auto-follow failed during linking: ${(e as Error).message}`);
    }
  }

  async unlinkTrainer(): Promise<void> {
    const { id: userId, type } = this.request.user;
    this.logger.log(`Attempting to unlink relationship for user ${userId}`);

    if (type === UserType.personalTrainer) {
      throw new DomainException(
        'trainer must specify studentId to unlink (not implemented yet)'
      );
    }

    const relationship =
      await this.trainerStudentRelationshipRepository.findByStudentId(userId);
    if (!relationship) {
      throw new DomainException('no relationship found to unlink');
    }

    await this.trainerStudentRelationshipRepository.deleteRelationship(
      relationship.trainerId,
      userId
    );
    this.logger.log(
      `Successfully unlinked student ${userId} from trainer ${relationship.trainerId}`
    );
  }

  async unlinkStudent(studentId: string): Promise<void> {
    const { id: trainerId, type } = this.request.user;
    if (type !== UserType.personalTrainer) {
      throw new DomainException('only trainers can unlink students this way');
    }

    await this.trainerStudentRelationshipRepository.deleteRelationship(
      trainerId,
      studentId
    );
    this.logger.log(
      `Successfully unlinked student ${studentId} from trainer ${trainerId}`
    );
  }

  async getStudents(): Promise<User[]> {
    const { id: trainerId, type } = this.request.user;

    if (type !== UserType.personalTrainer) {
      throw new DomainException('only personal trainers can list students');
    }

    const relationships =
      await this.trainerStudentRelationshipRepository.findByTrainerId(trainerId);
    return relationships.map((r) => r.student);
  }

  async getTrainer(): Promise<User | null> {
    const { id: studentId } = this.request.user;
    return await this.getTrainerOfStudent(studentId);
  }

  async getTrainerOfStudent(studentId: string): Promise<User | null> {
    const relationship =
      await this.trainerStudentRelationshipRepository.findByStudentId(studentId);
    if (!relationship) return null;

    return await this.userRepository.findOneById(relationship.trainerId);
  }

  async getTrainerIdByStudentId(studentId: string): Promise<string | null> {
    const trainer = await this.getTrainerOfStudent(studentId);
    return trainer?.id ?? null;
  }

  async validateTrainerAccess(studentId: string): Promise<{ minDate?: Date }> {
    const { id: trainerId, type } = this.request.user;

    if (type !== UserType.personalTrainer) {
      throw new DomainException('only personal trainers can access student metrics');
    }

    const relationship = await this.trainerStudentRelationshipRepository.find({
      where: { trainerId, studentId },
    });

    if (!relationship) {
      this.logger.warn(
        `Trainer ${trainerId} attempted to access unauthorized student ${studentId}`
      );
      throw new DomainException('this user is not your student');
    }

    const privacy = await this.userPrivacySettingsRepository.findOneByUserId(studentId);

    if (!privacy?.sharePastDataWithTrainer) {
      return { minDate: relationship.linkedAt };
    }

    return {};
  }
}
