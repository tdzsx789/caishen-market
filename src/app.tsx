import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import React from 'react';
import {
  AvatarDropdown,
  AvatarName,
  BalanceDisplay,
} from '@/components';
import { currentUser as queryCurrentUser, walletAuth } from '@/services/ant-design-pro/api';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import '@ant-design/v5-patch-for-react-19';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser({
        skipErrorHandler: true,
      });
      return msg.data;
    } catch (_error) {
      // 未登录时不重定向，允许用户浏览公开页面
      // 只有在需要登录的页面才重定向
      return undefined;
    }
  };

  // 处理钱包授权回调
  const handleWalletAuth = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('authToken');
    const avatar = urlParams.get('avatar');
    const nickname = urlParams.get('nickname');
    const balance = urlParams.get('balance');
    const walletAccount = urlParams.get('walletAccount');

    if (authToken || (avatar && nickname && balance)) {
      try {
        // 处理昵称：超过10位时截取前10位
        const processedNickname = nickname && nickname.length > 10 
          ? nickname.substring(0, 10) 
          : nickname;

        const msg = await walletAuth({
          avatar: avatar || undefined,
          nickname: processedNickname || undefined,
          balance: balance ? parseFloat(balance) : undefined,
          walletAccount: walletAccount || undefined,
          token: authToken || undefined,
        });

        if (msg.data) {
          // 清除URL中的授权参数
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('authToken');
          newUrl.searchParams.delete('avatar');
          newUrl.searchParams.delete('nickname');
          newUrl.searchParams.delete('balance');
          newUrl.searchParams.delete('walletAccount');
          window.history.replaceState({}, '', newUrl.toString());

          // 如果是首次授权，显示提示；非首次授权则刷新页面
          if (msg.data.isFirstTime) {
            // 首次授权，创建新账户
            return msg.data;
          } else {
            // 非首次授权，直接登录成功，刷新页面
            window.location.reload();
            return msg.data;
          }
        }
      } catch (error) {
        console.error('钱包授权失败:', error);
      }
    }
    return undefined;
  };

  // 检查是否有钱包授权回调参数
  const walletAuthUser = await handleWalletAuth();
  if (walletAuthUser) {
    return {
      fetchUserInfo,
      currentUser: walletAuthUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }

  // 如果不是登录页面，执行
  const { location } = history;
  if (
    ![loginPath, '/user/register', '/user/register-result'].includes(
      location.pathname,
    )
  ) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  return {
    actionsRender: () => [<BalanceDisplay key="balance" />],
    // 移除 avatarProps，因为 BalanceDisplay 组件已经包含了用户头像
    avatarProps: undefined,
    onPageChange: () => {
      const { location } = history;
      // 定义需要登录才能访问的页面
      const protectedPaths = ['/SportsLotteryHall/myOrders', '/SportsLotteryHall/expense'];
      const isProtectedPath = protectedPaths.some(path => location.pathname.startsWith(path));
      // 只有在访问需要登录的页面且未登录时，才重定向到登录页
      if (!initialState?.currentUser && isProtectedPath && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    menuHeaderRender: undefined,
    menuRender: false, // 隐藏菜单栏
    childrenRender: (children) => {
      return (
        <>
          {children}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  baseURL: 'http://192.168.3.11:8000/',
  ...errorConfig,
};
