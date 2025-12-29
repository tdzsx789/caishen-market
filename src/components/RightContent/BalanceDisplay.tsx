import { DollarOutlined, DownOutlined, ReloadOutlined, WalletOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Avatar, Spin,Button } from 'antd';
import styles from './index.less'
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import { AvatarDropdown } from './AvatarDropdown';
import { createAccount } from '@/services/account/api';
import mockUser from '@/mockData/users.json';

export const BalanceDisplay: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [refreshing, setRefreshing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const currentUser = initialState?.currentUser;

  // 处理连接钱包（跳转到钱包网站授权）
  const handleConnectWallet = async () => {
     if (connecting) return;
     setConnecting(true);
     try {
       await createAccount(mockUser);
       setInitialState((s) => ({ 
          ...s, 
          currentUser: {
            ...mockUser,
            id: mockUser.id,
            username: mockUser.name, // Mapping name to username if needed, or just keeping it consistent
            email: '', // Add missing required fields if any
          } 
        }));
     } catch (error) {
       console.error('Failed to create account:', error);
     } finally {
       setConnecting(false);
     }
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
        <div className={`${styles.connectWalletButton} ${connecting ? styles.disabled : ''}`} onClick={handleConnectWallet}>
          {connecting ? <Spin size="small" /> : <img src='/icons/Icon1.svg' alt="" />}
          <span style={{ marginLeft: connecting ? 8 : 0 }}>{connecting ? '连接中...' : '连接钱包'}</span>
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
          <ReloadOutlined className={styles.refreshIcon} />
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
