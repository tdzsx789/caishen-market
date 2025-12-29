import {
  DollarOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import type { MenuProps } from 'antd';
import { Avatar, Spin } from 'antd';
import styles from './index.less'
import React from 'react';
import { flushSync } from 'react-dom';
import { outLogin } from '@/services/ant-design-pro/api';
import HeaderDropdown from '../HeaderDropdown';

export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

export const AvatarName = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  return <span className="anticon">{currentUser?.name}</span>;
};

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({
  menu,
  children,
}) => {
  /**
   * 退出登录，并且将当前的 url 保存
   */
  const loginOut = async () => {
    await outLogin();
    // 退出登录后不跳转，直接刷新状态
    // const { search, pathname } = window.location;
    // const urlParams = new URL(window.location.href).searchParams;
    // const searchParams = new URLSearchParams({
    //   redirect: pathname + search,
    // });
    // /** 此方法会跳转到 redirect 参数所在的位置 */
    // const redirect = urlParams.get('redirect');
    // // Note: There may be security issues, please note
    // if (window.location.pathname !== '/user/login' && !redirect) {
    //   history.replace({
    //     pathname: '/user/login',
    //     search: searchParams.toString(),
    //   });
    // }
  };

  const { initialState, setInitialState } = useModel('@@initialState');

  const onMenuClick: MenuProps['onClick'] = (event) => {
    const { key } = event;
    if (key === 'logout') {
      flushSync(() => {
        setInitialState((s) => ({ ...s, currentUser: undefined }));
      });
      loginOut();
      return;
    }
    if (key === 'myOrders') {
      history.push('/SportsLotteryHall/myOrders');
      return;
    }
    history.push(`/account/${key}`);
  };

  const loading = (
    <span className={styles.action}>
      <Spin
        size="small"
        className={styles.spinWrapper}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser) {
    return loading;
  }

  const menuItems = [
    {
      key: 'myOrders',
      icon: <DollarOutlined />,
      label: '我的投注订单',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
    },
  ];

  // 获取用户名，如果昵称超过10个字符则截取前10个
  const displayName = currentUser.name || currentUser.username || '用户';
  const processedName = displayName.length > 10 ? displayName.substring(0, 10) : displayName;

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
      overlayClassName={styles.dropdownOverlay}
      dropdownRender={(menu) => (
        <div className={styles.dropdownContent}>
          <div className={styles.dropdownHeader}>
            <Avatar
              src={currentUser.avatar}
              size={32}
              icon={<UserOutlined />}
            />
            <div className={styles.userInfo}>
              <div className={styles.userName}>{processedName}</div>
              <div className={styles.userRole}>用户</div>
            </div>
          </div>
          {menu}
        </div>
      )}
    >
      {children}
    </HeaderDropdown>
  );
};
