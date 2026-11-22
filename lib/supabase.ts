import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anonKey);

// 採用フローの段階（順番）
export const STAGES = [
  "応募",
  "架電中",
  "一次面談調整",
  "一次面談確定",
  "面接設置",
  "面接実施",
  "OB面接",
  "クロ面",
  "合格",
  "オリテ",
  "入社前研修",
  "リーダー紹介",
  "社長面談",
  "スタート",
  "退社",
] as const;

export type Stage = (typeof STAGES)[number];

export type Applicant = {
  id: string;
  name_kanji: string;
  name_kana: string | null;
  gender: string | null;
  age: string | null;
  phone: string | null;
  source: string | null;
  job: string | null;
  location: string | null;
  staff: string | null;
  st_raw: string | null;
  phone_date: string | null;
  setup_date: string | null;
  interview_done: string | null;
  meet_type: string | null;
  ob_person: string | null;
  ob_result: string | null;
  close_person: string | null;
  close_result: string | null;
  pass_contact: string | null;
  orientation: string | null;
  pretraining: string | null;
  leader_intro: string | null;
  ceo_meeting: string | null;
  start_available: string | null;
  start: string | null;
  residence: string | null;
  days_per_week: string | null;
  assignment: string | null;
  location_pref: string | null;
  resign: string | null;
  memo: string | null;
  apply_month: string | null;
  apply_id: string | null;
  stage: string;
  active: boolean;
  dropout_reason: string | null;
  sources: string | null;
  created_at: string;
  updated_at: string;
};

export type StatusHistory = {
  id: string;
  applicant_id: string;
  stage: string;
  changed_at: string;
};

// 編集フォームで使う項目のラベル
export const FIELD_LABELS: { key: keyof Applicant; label: string; group: string }[] = [
  { key: "name_kanji", label: "氏名（漢字）", group: "基本" },
  { key: "name_kana", label: "氏名（カナ）", group: "基本" },
  { key: "gender", label: "性別", group: "基本" },
  { key: "age", label: "年齢", group: "基本" },
  { key: "phone", label: "電話番号", group: "基本" },
  { key: "source", label: "媒体", group: "基本" },
  { key: "job", label: "業種/職", group: "基本" },
  { key: "location", label: "エリア", group: "基本" },
  { key: "staff", label: "担当者", group: "基本" },
  { key: "st_raw", label: "架電ST", group: "応募・架電" },
  { key: "phone_date", label: "電話日", group: "応募・架電" },
  { key: "setup_date", label: "設置日", group: "応募・架電" },
  { key: "interview_done", label: "実施/未実施", group: "面接" },
  { key: "meet_type", label: "対面/zoom", group: "面接" },
  { key: "ob_person", label: "OB者", group: "面接" },
  { key: "ob_result", label: "OB結果", group: "面接" },
  { key: "close_person", label: "クロ面者", group: "面接" },
  { key: "close_result", label: "クロ面結果", group: "面接" },
  { key: "pass_contact", label: "合格連絡", group: "面接" },
  { key: "orientation", label: "オリテ", group: "合格後" },
  { key: "pretraining", label: "入社前研修", group: "合格後" },
  { key: "leader_intro", label: "リーダー紹介", group: "合格後" },
  { key: "ceo_meeting", label: "社長面談", group: "合格後" },
  { key: "start_available", label: "開始可能日", group: "合格後" },
  { key: "start", label: "スタート", group: "合格後" },
  { key: "residence", label: "住まい", group: "合格後" },
  { key: "days_per_week", label: "週勤務日数", group: "合格後" },
  { key: "assignment", label: "配属先", group: "合格後" },
  { key: "location_pref", label: "勤務地希望", group: "合格後" },
  { key: "resign", label: "退社", group: "合格後" },
];
