/**
 * 积分竞猜平台 API 接口
 * 根据 API_DOCUMENTATION.md 文档实现
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
 * 
 * @param params 查询参数
 * @returns 分页的投票列表
 */
export async function getVoteList(params?: GetVoteListParams) {
  return request<ApiResponse<PaginatedResponse<VoteData>>>('/api/votes', {
    method: 'GET',
    params: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 8,
      ...params,
    },
  });
}

/**
 * 获取投票详情
 * GET /api/votes/:id
 * 
 * @param id 投票ID
 * @returns 投票详情数据
 */
export async function getVoteDetail(id: number | string) {
  return request<ApiResponse<VoteData>>(`/api/votes/${id}`, {
    method: 'GET',
  });
}

/**
 * 提交投注
 * POST /api/bets
 * 
 * @param data 投注数据
 * @returns 投注结果（包含betId、预计收益等）
 */
export async function submitBet(data: SubmitBetParams) {
  return request<ApiResponse<BetRecord>>('/api/bets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

/**
 * 获取个人投注记录
 * GET /api/bets/my
 * 
 * @param params 查询参数
 * @returns 分页的投注记录列表
 */
export async function getMyBetRecords(params?: GetBetRecordsParams) {
  return request<ApiResponse<PaginatedResponse<BetRecord>>>('/api/bets/my', {
    method: 'GET',
    params: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
      ...params,
    },
  });
}

/**
 * 获取投注统计
 * GET /api/bets/statistics
 * 
 * @returns 投注统计数据（总投注金额、总收益、胜率等）
 */
export async function getBetStatistics() {
  return request<ApiResponse<BetStatistics>>('/api/bets/statistics', {
    method: 'GET',
  });
}
