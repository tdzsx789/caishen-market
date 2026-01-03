export interface VoteOption {
  text: string;
  odds: string;
}

export interface BetRecord {
  id: number;
  option: string;
  choice: 'yes' | 'no';
  amount: number;
  odds: string;
  time: string;
  status?: 'win' | 'lose' | 'pending';
}

export interface VoteData {
  id: number | string;
  _id?: string;
  subType?: string;
  title: string;
  description: string;
  activityDescription: string; // 活动说明
  option1?: VoteOption;
  option2?: VoteOption;
  options?: any[];
  tradingVolume: number; // 总交易量
  endTime: string; // 截止日期
  status: 'InProgress' | 'isStart' | 'isEnd';
  userBetStatus: boolean;
  result?: {
    option1: 'yes' | 'no' | null;
    option2: 'yes' | 'no' | null;
  };
  userBetRecords?: BetRecord[]; // 个人投注记录
  coinName?: string;
  rise?: number;
  fall?: number;
}

export interface CurrentBet {
  option: 'option1' | 'option2' | null;
  choice: 'yes' | 'no' | null;
  amount: number;
}
