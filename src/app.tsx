import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link, useModel } from '@umijs/max';
import React, { useEffect } from 'react';
import {
  AvatarDropdown,
  AvatarName,
  BalanceDisplay,
} from '@/components';
import { currentUser as queryCurrentUser, walletAuth } from '@/services/ant-design-pro/api';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import '@ant-design/v5-patch-for-react-19';

console.log('再次推送')

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

  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

const AppInitWrapper = (props: { children: React.ReactNode }) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  useEffect(() => {
    const init = async () => {
      if (initialState?.currentUser) return;

      // 尝试从 localStorage 恢复模拟用户
      const mockUserStr = localStorage.getItem('mock_user');
      // if (mockUserStr) {
      //   try {
      //     const mockUser = JSON.parse(mockUserStr);
      //     if (mockUser) {
      //        setInitialState((s) => ({
      //          ...s,
      //          currentUser: mockUser,
      //        }));
      //        // 如果是模拟用户，可能不需要再去 fetch 真实接口，或者 fetch 失败也不影响
      //     }
      //   } catch (e) {
      //     console.error('Failed to parse mock user', e);
      //   }
      // }

      if (initialState?.fetchUserInfo) {
        try {
          const currentUser = await initialState.fetchUserInfo();
          if (currentUser) {
            setInitialState((s) => ({
              ...s,
              currentUser,
            }));
            // 如果真实接口获取成功，清除模拟数据（可选，视需求而定，这里保留以防刷新又没了）
          }
        } catch (error) {
          // ignore
        }
      }
    };
    init();
  }, []);
  return <>{props.children}</>;
};

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
    menuRender: false, // 隐藏菜单栏
    childrenRender: (children) => {
      return (
        <AppInitWrapper>
          {children}
        </AppInitWrapper>
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
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:5260' : 'http://13.212.168.127:5260',
  withCredentials: true,
  ...errorConfig,
};
