import { DollarOutlined, DownOutlined, ReloadOutlined, WalletOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Avatar, Spin,Button } from 'antd';
import styles from './index.less'
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import { AvatarDropdown } from './AvatarDropdown';

export const BalanceDisplay: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [refreshing, setRefreshing] = useState(false);
  const currentUser = initialState?.currentUser;

  // 处理连接钱包（跳转到钱包网站授权）
  const handleConnectWallet = () => {
     history.push('/user/login')
    // const walletAuthUrl = process.env.WALLET_AUTH_URL || 'https://wallet.example.com/auth';
    // const redirectUrl = encodeURIComponent(window.location.href);
    // window.location.href = `${walletAuthUrl}?redirect=${redirectUrl}`;
  };

  // 处理积分刷新（从钱包账户重新获取剩余积分）
  const handleRefresh = async () => {
    if (!currentUser) return;
    
    setRefreshing(true);
    try {
      // 从钱包账户重新获取剩余积分
      const msg = await queryCurrentUser({
        skipErrorHandler: true,
      });
      if (msg.data) {
        flushSync(() => {
          setInitialState((s) => ({
            ...s,
            currentUser: {
              ...s?.currentUser,
              ...msg.data,
            },
          }));
        });
      }
    } catch (error) {
      console.error('刷新积分失败:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 处理点击积分，跳转到积分明细页
  const handleBalanceClick = () => {
    if (!currentUser) return;
    history.push('/SportsLotteryHall/expense');
  };

  // 未登录状态（图三）
  if (!currentUser) {
    return (
      <div className={styles.balanceContainer}>
        <div className={styles.balanceDisplay}>
          <img src='/icons/Icon.svg' alt="" className={styles.userAvatar} />
          <span className={styles.balanceAmount}>0.00</span>
          <div
            className={styles.refreshButton}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <ReloadOutlined className={styles.refreshIcon} />
          </div>
        </div>
        <div className={styles.connectWalletButton} onClick={handleConnectWallet}>
          <img src='/icons/Icon1.svg' alt="" />
          <span>连接钱包</span>
        </div>
      </div>
    );
  }

  // 已登录状态（图二）
  const balance = currentUser.balance || 0;
  const formattedBalance = balance.toFixed(2);

  return (
    <div className={styles.balanceContainer}>
      <div className={styles.balanceDisplay} onClick={handleBalanceClick} style={{ cursor: 'pointer' }}>
        <img src='/icons/Icon.svg' alt="" className={styles.userAvatar} />
        <span className={styles.balanceAmount}>{formattedBalance}</span>
        <div
          className={styles.refreshButton}
          onClick={(e) => {
            if(refreshing) return;
            e.stopPropagation();
            handleRefresh();
          }}
        >
          {refreshing ? (
            <Spin size="small" />
          ) : (
            <ReloadOutlined className={styles.refreshIcon} />
          )}
        </div>
      </div>
      <AvatarDropdown>
        <div className={styles.avatarWrapper}>
          <Avatar
            src={currentUser.avatar}
            size={40}
            className={styles.avatar}
          />
          <img src='/icons/Icon3.png' alt="" className={styles.avatarDropdownIcon} />
        </div>
      </AvatarDropdown>
    </div>
  );
};
