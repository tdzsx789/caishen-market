import { PageContainer } from '@ant-design/pro-components';
import { Card, Tabs, Table, Tag, Statistic, Row, Col, Button, Space } from 'antd';
import { history } from '@umijs/max';
import React, { useState } from 'react';
import styles from './index.less';

interface OrderRecord {
  id: number;
  voteTitle: string;
  option: string;
  choice: 'yes' | 'no';
  amount: number;
  odds: string;
  time: string;
  status: 'win' | 'lose' | 'pending';
  profit?: number; // 收益（仅历史记录有）
}

// 模拟数据
const generatePendingOrders = (count: number): OrderRecord[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    voteTitle: `投票项目 ${index + 1}`,
    option: `选项${index % 2 === 0 ? 'A' : 'B'} - ${index + 1}`,
    choice: index % 2 === 0 ? 'yes' : 'no',
    amount: Math.floor(Math.random() * 1000) + 100,
    odds: (Math.random() * 2 + 1).toFixed(2),
    time: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  }));
};

const generateHistoryOrders = (count: number): OrderRecord[] => {
  return Array.from({ length: count }, (_, index) => {
    const amount = Math.floor(Math.random() * 1000) + 100;
    const odds = parseFloat((Math.random() * 2 + 1).toFixed(2));
    const isWin = Math.random() > 0.4;
    const profit = isWin ? amount * odds - amount : -amount;
    
    return {
      id: index + 1,
      voteTitle: `投票项目 ${index + 1}`,
      option: `选项${index % 2 === 0 ? 'A' : 'B'} - ${index + 1}`,
      choice: index % 2 === 0 ? 'yes' : 'no',
      amount,
      odds: odds.toFixed(2),
      time: new Date(Date.now() - (index + 10) * 24 * 60 * 60 * 1000).toISOString(),
      status: isWin ? 'win' : 'lose',
      profit,
    };
  });
};

const MyOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [pendingPage, setPendingPage] = useState<number>(1);
  const [historyPage, setHistoryPage] = useState<number>(1);
  const pageSize = 10;

  // 模拟数据
  const allPendingOrders = generatePendingOrders(25);
  const allHistoryOrders = generateHistoryOrders(35);

  // 计算统计数据
  const totalBetAmount = allPendingOrders.reduce((sum, order) => sum + order.amount, 0) +
    allHistoryOrders.reduce((sum, order) => sum + order.amount, 0);
  
  const totalProfit = allHistoryOrders.reduce((sum, order) => sum + (order.profit || 0), 0);
  
  const winCount = allHistoryOrders.filter(order => order.status === 'win').length;
  const totalCount = allHistoryOrders.length;
  const winRate = totalCount > 0 ? ((winCount / totalCount) * 100).toFixed(2) : '0.00';

  // 待开奖订单列
  const pendingColumns = [
    {
      title: '投票项目',
      dataIndex: 'voteTitle',
      key: 'voteTitle',
    },
    {
      title: '选项',
      dataIndex: 'option',
      key: 'option',
    },
    {
      title: '预测',
      dataIndex: 'choice',
      key: 'choice',
      render: (choice: string) => choice === 'yes' ? '是' : '否',
    },
    {
      title: '投注金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount} USDT`,
    },
    {
      title: '赔率',
      dataIndex: 'odds',
      key: 'odds',
    },
    {
      title: '投注时间',
      dataIndex: 'time',
      key: 'time',
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color="orange">待开奖</Tag>,
    },
  ];

  // 历史记录列
  const historyColumns = [
    {
      title: '投票项目',
      dataIndex: 'voteTitle',
      key: 'voteTitle',
    },
    {
      title: '选项',
      dataIndex: 'option',
      key: 'option',
    },
    {
      title: '预测',
      dataIndex: 'choice',
      key: 'choice',
      render: (choice: string) => choice === 'yes' ? '是' : '否',
    },
    {
      title: '投注金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount} USDT`,
    },
    {
      title: '赔率',
      dataIndex: 'odds',
      key: 'odds',
    },
    {
      title: '收益',
      dataIndex: 'profit',
      key: 'profit',
      render: (profit: number) => (
        <span style={{ color: profit >= 0 ? '#05DF72' : '#FF6467' }}>
          {profit >= 0 ? '+' : ''}{profit.toFixed(2)} USDT
        </span>
      ),
    },
    {
      title: '投注时间',
      dataIndex: 'time',
      key: 'time',
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'win') return <Tag color="green">获胜</Tag>;
        if (status === 'lose') return <Tag color="red">失败</Tag>;
        return <Tag color="orange">待开奖</Tag>;
      },
    },
  ];

  // 分页数据
  const getPendingData = () => {
    const start = (pendingPage - 1) * pageSize;
    const end = start + pageSize;
    return allPendingOrders.slice(start, end);
  };

  const getHistoryData = () => {
    const start = (historyPage - 1) * pageSize;
    const end = start + pageSize;
    return allHistoryOrders.slice(start, end);
  };

  const handleBack = () => {
    history.back();
  };

  const handleGoToExpense = () => {
    history.push('/SportsLotteryHall/expense');
  };

  return (
    <PageContainer
      title="我的投注订单"
      extra={
        <Space>
          <Button onClick={handleGoToExpense}>支出明细</Button>
          <Button onClick={handleBack}>返回</Button>
        </Space>
      }
    >
      <div className={styles.container}>
        {/* 统计信息 */}
        <Row gutter={16} className={styles.statsRow}>
          <Col span={8}>
            <Card className={styles.statCard}>
              <Statistic
                title="总投注金额"
                value={totalBetAmount}
                suffix="USDT"
                valueStyle={{ color: '#FFFFFF' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className={styles.statCard}>
              <Statistic
                title="总收益金额"
                value={totalProfit}
                suffix="USDT"
                valueStyle={{ color: totalProfit >= 0 ? '#05DF72' : '#FF6467' }}
                prefix={totalProfit >= 0 ? '+' : ''}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className={styles.statCard}>
              <Statistic
                title="胜率"
                value={winRate}
                suffix="%"
                valueStyle={{ color: '#51A2FF' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Tab 切换 */}
        <Card className={styles.tabCard}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'pending',
                label: `待开奖订单 (${allPendingOrders.length})`,
                children: (
                  <Table
                    columns={pendingColumns}
                    dataSource={getPendingData()}
                    rowKey="id"
                    pagination={{
                      current: pendingPage,
                      total: allPendingOrders.length,
                      pageSize,
                      onChange: (page) => setPendingPage(page),
                      showSizeChanger: false,
                    }}
                  />
                ),
              },
              {
                key: 'history',
                label: `历史记录 (${allHistoryOrders.length})`,
                children: (
                  <Table
                    columns={historyColumns}
                    dataSource={getHistoryData()}
                    rowKey="id"
                    pagination={{
                      current: historyPage,
                      total: allHistoryOrders.length,
                      pageSize,
                      onChange: (page) => setHistoryPage(page),
                      showSizeChanger: false,
                    }}
                  />
                ),
              },
            ]}
          />
        </Card>
      </div>
    </PageContainer>
  );
};

export default MyOrders;
