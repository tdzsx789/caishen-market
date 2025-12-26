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
