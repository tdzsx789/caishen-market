/**
 * 积分竞猜平台 API 接口
 */
import { request } from '@umijs/max';
import type {
  ApiResponse,
  VoteData,
  BetRecord,
  BetStatistics,
  PaginatedResponse,
  GetVoteListParams,
  SubmitBetParams,
  GetBetRecordsParams,
} from './typings';

/**
 * 获取投票列表
 * GET /api/votes
 */
export async function getVoteList(params?: GetVoteListParams) {
  return request<ApiResponse<PaginatedResponse<VoteData>>>('/api/votes', {
    method: 'GET',
    params,
  });
}

/**
 * 获取投票详情
 * GET /api/votes/:id
 */
export async function getVoteDetail(id: number | string) {
  return request<ApiResponse<VoteData>>(`/api/votes/${id}`, {
    method: 'GET',
  });
}

/**
 * 提交投注
 * POST /api/bets
 */
export async function submitBet(data: SubmitBetParams) {
  return request<ApiResponse<BetRecord>>('/api/bets', {
    method: 'POST',
    data,
  });
}

/**
 * 获取个人投注记录
 * GET /api/bets/my
 */
export async function getMyBetRecords(params?: GetBetRecordsParams) {
  return request<ApiResponse<PaginatedResponse<BetRecord>>>('/api/bets/my', {
    method: 'GET',
    params,
  });
}

/**
 * 获取投注统计
 * GET /api/bets/statistics
 */
export async function getBetStatistics() {
  return request<ApiResponse<BetStatistics>>('/api/bets/statistics', {
    method: 'GET',
  });
}
