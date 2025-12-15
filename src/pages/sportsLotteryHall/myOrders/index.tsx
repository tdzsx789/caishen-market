import { Card, Tabs, Tag, Statistic, Row, Col, Pagination } from 'antd';
import PageBack from '@/components/PageBack'
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

  // 渲染订单卡片
  const renderOrderCard = (order: OrderRecord) => {
    const odds = parseFloat(order.odds);
    const potentialReturn = order.amount * odds; // 潜在收益
    const potentialProfit = potentialReturn - order.amount; // 潜在利润
    
    // 状态显示
    const getStatusTag = () => {
      if (order.status === 'pending') {
        return <Tag color="orange">投注中</Tag>;
      } else if (order.status === 'win') {
        return <Tag color="green">中奖</Tag>;
      } else {
        return <Tag color="red">未中奖</Tag>;
      }
    };

    return (
      <Card key={order.id} className={styles.orderCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>{order.voteTitle}</div>
          {getStatusTag()}
        </div>
        <div className={styles.cardContent}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div className={styles.cardItem}>
                <span className={styles.label}>投注概率:</span>
                <span className={styles.value}>{order.odds}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.cardItem}>
                <span className={styles.label}>投注价格:</span>
                <span className={styles.value}>{order.amount} USDT</span>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.cardItem}>
                <span className={styles.label}>投注本金:</span>
                <span className={styles.value}>{order.amount} USDT</span>
              </div>
            </Col>
            {order.status === 'pending' ? (
              <>
                <Col span={12}>
                  <div className={styles.cardItem}>
                    <span className={styles.label}>潜在收益:</span>
                    <span className={styles.value} style={{ color: '#05DF72' }}>
                      {potentialReturn.toFixed(2)} USDT
                    </span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.cardItem}>
                    <span className={styles.label}>潜在利润:</span>
                    <span className={styles.value} style={{ color: '#05DF72' }}>
                      +{potentialProfit.toFixed(2)} USDT
                    </span>
                  </div>
                </Col>
              </>
            ) : (
              <Col span={12}>
                <div className={styles.cardItem}>
                  <span className={styles.label}>实际收益:</span>
                  <span 
                    className={styles.value} 
                    style={{ color: (order.profit || 0) >= 0 ? '#05DF72' : '#FF6467' }}
                  >
                    {(order.profit || 0) >= 0 ? '+' : ''}{(order.profit || 0).toFixed(2)} USDT
                  </span>
                </div>
              </Col>
            )}
            <Col span={24}>
              <div className={styles.cardItem}>
                <span className={styles.label}>投注时间:</span>
                <span className={styles.value}>{new Date(order.time).toLocaleString('zh-CN')}</span>
              </div>
            </Col>
          </Row>
        </div>
      </Card>
    );
  };

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

  return (
    <div className={styles.container}>
      <PageBack title={'返回首页平台'} />
      <div className={styles.title}>我的投注订单</div>
      {/* 统计信息 */}
      <Row gutter={16} className={styles.statsRow}>
        <Col span={8}>
          <Card className={styles.statCard}>
            <Statistic
              title="总投注金额"
              value={totalBetAmount}
              valueStyle={{ color: '#FFFFFF' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className={styles.statCard}>
            <Statistic
              title="总收益金额"
              value={totalProfit}
              valueStyle={{ color: totalProfit >= 0 ? '#05DF72' : '#FF6467' }}
              prefix={'$'}
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
                <div>
                  <div className={styles.cardList}>
                    {getPendingData().map(order => renderOrderCard(order))}
                  </div>
                  <div className={styles.paginationWrapper}>
                    <Pagination
                      current={pendingPage}
                      total={allPendingOrders.length}
                      pageSize={pageSize}
                      onChange={(page) => setPendingPage(page)}
                      showSizeChanger={false}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: 'history',
              label: `历史记录 (${allHistoryOrders.length})`,
              children: (
                <div>
                  <div className={styles.cardList}>
                    {getHistoryData().map(order => renderOrderCard(order))}
                  </div>
                  <div className={styles.paginationWrapper}>
                    <Pagination
                      current={historyPage}
                      total={allHistoryOrders.length}
                      pageSize={pageSize}
                      onChange={(page) => setHistoryPage(page)}
                      showSizeChanger={false}
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default MyOrders;
