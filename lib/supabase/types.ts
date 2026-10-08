export type OrgType = 'college' | 'school' | 'hospital';
export type UserRole = 'student' | 'staff' | 'security' | 'admin';
export type ItemStatus = 'reported' | 'matched' | 'returned';
export type MatchStatus = 'pending' | 'confirmed' | 'rejected';
export type ItemType = 'lost' | 'found';

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  categories: string[];
  created_at: string;
}

export interface User {
  id: string;
  org_id: string;
  full_name: string;
  email: string;
  student_id?: string;
  role: UserRole;
  created_at: string;
  // Institutional Student Profile Fields
  prn?: string; // Permanent Registration Number
  roll_no?: string;
  department?: string;
  academic_year?: string; // First Year (FE), Second Year (SE), Third Year (TE), Final Year (BE)
  division?: string; // Div A, B, C...
  phone?: string;
  address?: string;
  emergency_contact?: string;
  blood_group?: string;
}

export interface LostItem {
  id: string;
  org_id: string;
  reporter_id: string;
  title: string;
  description: string;
  category: string;
  date_lost: string;
  location?: string;
  photo_url?: string;
  embedding?: number[] | string;
  status: ItemStatus;
  created_at: string;
}

export interface FoundItem {
  id: string;
  org_id: string;
  reporter_id: string;
  title: string;
  description: string;
  category: string;
  date_found: string;
  location?: string;
  photo_url?: string;
  embedding?: number[] | string;
  status: ItemStatus;
  created_at: string;
}

export interface Match {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  confidence_score: number;
  category_match: boolean;
  keyword_score: number;
  date_score: number;
  embedding_score: number;
  status: MatchStatus;
  created_at: string;
  confirmed_at?: string | null;
  // Joined relations
  lost_item?: LostItem;
  found_item?: FoundItem;
}

export interface Claim {
  id: string;
  match_id: string;
  claimant_id: string;
  student_id_input: string;
  verified: boolean;
  verified_by?: string | null;
  verified_at?: string | null;
}

export interface StatusEvent {
  id: string;
  item_type: ItemType;
  item_id: string;
  from_status: ItemStatus | 'none';
  to_status: ItemStatus;
  actor_id?: string | null;
  note: string;
  created_at: string;
  actor?: User | null;
}

export interface Notification {
  id: string;
  user_id: string;
  match_id: string;
  channel: 'email' | 'in_app';
  sent_at: string;
  opened_at?: string | null;
}
