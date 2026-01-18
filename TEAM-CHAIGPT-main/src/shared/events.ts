import { EventEmitter } from 'events';
import prisma from '../config/database';
import { NotificationType } from '@prisma/client';

// Event types
export interface JobMatchEvent {
    userId: string;
    jobId: string;
    jobTitle: string;
    matchScore: number;
    hirerName: string;
}

export interface SkillDerivedEvent {
    userId: string;
    skillName: string;
    source: string;
    confidence: number;
}

export interface ProfileCompleteEvent {
    userId: string;
    profileId: string;
}

// Event emitter singleton
class NotificationEventEmitter extends EventEmitter {
    private static instance: NotificationEventEmitter;

    private constructor() {
        super();
        this.setupListeners();
    }

    static getInstance(): NotificationEventEmitter {
        if (!NotificationEventEmitter.instance) {
            NotificationEventEmitter.instance = new NotificationEventEmitter();
        }
        return NotificationEventEmitter.instance;
    }

    private setupListeners() {
        // Corporate job match notification
        this.on('jobMatch', async (event: JobMatchEvent) => {
            await prisma.notification.create({
                data: {
                    userId: event.userId,
                    type: NotificationType.JOB_MATCH,
                    title: 'New Job Match Found!',
                    message: `You matched ${Math.round(event.matchScore * 100)}% with "${event.jobTitle}"`,
                    metadata: {
                        jobId: event.jobId,
                        matchScore: event.matchScore,
                    },
                },
            });
        });

        // Skill derived notification
        this.on('skillDerived', async (event: SkillDerivedEvent) => {
            await prisma.notification.create({
                data: {
                    userId: event.userId,
                    type: NotificationType.SKILL_DERIVED,
                    title: 'New Skill Derived!',
                    message: `Skill "${event.skillName}" derived from ${event.source} with ${Math.round(event.confidence * 100)}% confidence`,
                    metadata: {
                        skill: event.skillName,
                        source: event.source,
                        confidence: event.confidence,
                    },
                },
            });
        });

        // Profile complete notification
        this.on('profileComplete', async (event: ProfileCompleteEvent) => {
            await prisma.notification.create({
                data: {
                    userId: event.userId,
                    type: NotificationType.PROFILE_COMPLETE,
                    title: 'Profile Complete!',
                    message: 'Your applicant profile is now complete. You can now receive job recommendations.',
                    metadata: { profileId: event.profileId },
                },
            });
        });
    }
}

export const eventEmitter = NotificationEventEmitter.getInstance();
