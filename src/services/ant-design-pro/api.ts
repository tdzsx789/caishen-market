// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 
 * 获取当前的用户 
 * GET /api/currentUser
 * 根据 API_DOCUMENTATION.md 文档实现
 */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: {
      id: number;
      username: string;
      email: string;
      avatar: string;
      balance: number;  // 账户余额
      access: string;
    };
  }>('/api/currentUser', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 
 * 登录接口 
 * POST /api/login/account
 * 根据 API_DOCUMENTATION.md 文档实现
 */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<{
    status: string;
    type: string;
    currentAuthority: string;
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      avatar: string;
    };
  }>('/api/login/account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}

/**
 * 钱包授权登录接口
 * POST /api/wallet/auth
 * 在钱包网站确认授权后，回传账户信息(头像、昵称、剩余积分)
 */
export async function walletAuth(body: {
  avatar?: string;
  nickname?: string;
  balance?: number;
  walletAccount?: string;
  token?: string;
}, options?: { [key: string]: any }) {
  return request<{
    data: {
      id: number;
      username: string;
      email: string;
      avatar: string;
      balance: number;
      access: string;
      isFirstTime: boolean; // 是否首次授权
    };
  }>('/api/wallet/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
