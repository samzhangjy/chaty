import { User } from '@/api/user/user.entity';
import { FriendPreferences } from './friendPreferences.entity';

export interface Friend {
  target: User;
  preferences: FriendPreferences;
}
