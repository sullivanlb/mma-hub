import { FightType } from './enums';

export type FightResult = 'W' | 'L' | 'D' | 'NC';

export interface Fighter {
  id: string;
  created_at: string;
  name?: string;
  nickname: string;
  date_of_birth: string;
  height: string;
  weight_class?: string;
  last_weight_in?: string;
  born?: string;
  head_coach?: number;
  pro_mma_record?: string;
  current_mma_streak?: string;
  affiliation?: string;
  other_coaches?: string;
  last_fight_date?: string;
  total_fights?: string;
  age?: string;
  tapology_url?: string;
  profile_img_url?: string;
  small_img_url?: string;
}

export interface FighterRecords {
  id: number;
  from: string;
  to: string;
  promotion?: string;
  win: number;
  loss: number;
  draw: number;
  no_contest: string;
  win_ko: number;
  win_sub: number;
  win_decision: number;
  win_dq: number;
  loss_ko: number;
  loss_sub: number;
  loss_decision: number;
  loss_dq: number;
  id_fighter: number;
}

export interface Fight {
  id: string;
  id_fighter_1: string;
  id_fighter_2: string;
  result_fighter_1?: FightResult;
  result_fighter_2?: FightResult;
  finish_by: string;
  details: string;
  year: number;
  month_day: string;
  id_event: string;
  current_fighter_role: string;
  fight_type: FightType;
  fighter1: Fighter;
  fighter2: Fighter;
}

export interface Event {
  fights: any;
  id: string;
  name: string;
  datetime: string;
  venue: string;
  location: string;
  promotion: string;
  mma_bouts: string;
  img_url: string;
  broadcast: string;
}