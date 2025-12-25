/**
 * 积分竞猜平台 API 类型定义
 */

// 投票选项
export interface VoteOption {
  text: string;
  odds: string;
  yesAmount?: number;
  noAmount?: number;
}

// 投票结果
export interface VoteResult {
  option1: 'yes' | 'no' | null;
  option2: 'yes' | 'no' | null;
}

// 投票数据
export interface VoteData {
  id: number;
  title: string;
  description: string;
  activityDescription: string;
  tradingVolume: number;
  endTime: string;
  status: 'InProgress' | 'isStart' | 'isEnd';
  userBetStatus: boolean;
  option1: VoteOption;
  option2: VoteOption;
  result?: VoteResult;
  userBetRecords?: BetRecord[];
}

// 投注记录
export interface BetRecord {
  id: number;
  betId?: number;  // 提交投注时返回的betId
  voteId: number;
  voteTitle?: string;
  option: string;
  choice: 'yes' | 'no';
  amount: number;
  odds: string;
  potentialWinnings?: number;
  time: string;
  status: 'pending' | 'win' | 'lose';
  voteStatus?: 'InProgress' | 'isStart' | 'isEnd';
}

// 用户信息
export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  balance: number;
  access: string;
}

// 投注统计
export interface BetStatistics {
  totalBetAmount: number;
  totalWinnings: number;
  winRate: number;
  totalBets: number;
  winBets: number;
  pendingBets: number;
}

// API 响应基础结构
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 获取投票列表请求参数
export interface GetVoteListParams {
  category?: 'all' | 'Bitcoin' | 'Ethereum' | 'Caishen' | 'TBC';
  page?: number;
  pageSize?: number;
  status?: 'InProgress' | 'isStart' | 'isEnd';
}

// 提交投注请求参数
export interface SubmitBetParams {
  voteId: number;
  option: 'option1' | 'option2';
  choice: 'yes' | 'no';
  amount: number;
}

// 获取投注记录请求参数
export interface GetBetRecordsParams {
  status?: 'pending' | 'win' | 'lose';
  page?: number;
  pageSize?: number;
}

// 登录请求参数
export interface LoginParams {
  username: string;
  password: string;
  type?: string;
}

// 登录响应
export interface LoginResult {
  status: string;
  type: string;
  currentAuthority: string;
  token: string;
  user: User;
}
