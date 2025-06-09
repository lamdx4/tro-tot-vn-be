import { Account } from '@/domains/entities/account.entity';
import { Express } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: Account;
    }
  }
}

export {}