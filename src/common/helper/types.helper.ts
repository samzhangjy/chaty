import { User } from '@/api/user/user.entity';
import { Request as ExpressRequest } from 'express';

export type ChatyRequest = ExpressRequest & { user?: User };
