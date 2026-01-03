// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 创建账户接口 POST /api/accounts */
export async function createAccount(
  body: {
    name: string;
    avatar: string;
    id: string;
    balance: number;
    total_bets: number;
    total_income: number;
    win_rate: number;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/api/accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新账户接口 PATCH /api/accounts/:id */
export async function updateAccount(
  id: string,
  body: {
    balance?: number;
    total_bets?: number;
    total_income?: number;
    win_rate?: number;
  },
  options?: { [key: string]: any },
) {
  return request<any>(`/api/accounts/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
