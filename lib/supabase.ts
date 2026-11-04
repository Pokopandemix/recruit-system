import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anonKey);

export const STATUSES = [
  "応募",
  "書類選考",
  "面接",
  "内定",
  "入社",
  "退職",
] as const;

export type Status = (typeof STATUSES)[number];

export type Applicant = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: Status;
  applied_at: string;
  joined_at: string | null;
  memo: string | null;
  created_at: string;
};

export type StatusHistory = {
  id: string;
  applicant_id: string;
  status: string;
  changed_at: string;
};
