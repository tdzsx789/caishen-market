import { PageContainer } from '@ant-design/pro-components';
import { Card, Table, Button, Tag } from 'antd';
import { history } from '@umijs/max';
import React, { useState } from 'react';
import styles from './index.less';

interface ExpenseRecord {
  id: number;
  time: string;
  type: 'bet' | 'win' | 'withdraw' | 'deposit';
  name: string;
  income: number; // 收入
  expense: number; // 支出
}

// 模拟数据
const generateExpenseRecords = (count: number): ExpenseRecord[] => {
  const types: ExpenseRecord['type'][] = ['bet', 'win', 'withdraw', 'deposit'];
  const typeNames = {
    bet: '投注',
    win: '获胜奖励',
    withdraw: '提现',
    deposit: '充值',
  };

  return Array.from({ length: count }, (_, index) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const isIncome = type === 'win' || type === 'deposit';
    const amount = Math.floor(Math.random() * 5000) + 100;

    return {
      id: index + 1,
      time: new Date(Date.now() - index * 2 * 60 * 60 * 1000).toISOString(),
      type,
      name: typeNames[type],
      income: isIncome ? amount : 0,
      expense: !isIncome ? amount : 0,
    };
  });
};

const Expense: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const allRecords = generateExpenseRecords(45);

  // 计算总计
  const totalIncome = allRecords.reduce((sum, record) => sum + record.income, 0);
  const totalExpense = allRecords.reduce((sum, record) => sum + record.expense, 0);
  const netAmount = totalIncome - totalExpense;

  // 表格列
  const columns = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeConfig = {
          bet: { text: '投注', color: 'orange' },
          win: { text: '获胜奖励', color: 'green' },
          withdraw: { text: '提现', color: 'blue' },
          deposit: { text: '充值', color: 'purple' },
        };
        const config = typeConfig[type as keyof typeof typeConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '收入',
      dataIndex: 'income',
      key: 'income',
      render: (income: number) => (
        <span style={{ color: income > 0 ? '#05DF72' : '#99A1AF' }}>
          {income > 0 ? `+${income.toFixed(2)}` : '-'} USDT
        </span>
      ),
    },
    {
      title: '支出',
      dataIndex: 'expense',
      key: 'expense',
      render: (expense: number) => (
        <span style={{ color: expense > 0 ? '#FF6467' : '#99A1AF' }}>
          {expense > 0 ? `-${expense.toFixed(2)}` : '-'} USDT
        </span>
      ),
    },
  ];

  // 分页数据
  const getCurrentData = () => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return allRecords.slice(start, end);
  };

  const handleBack = () => {
    history.back();
  };

  return (
    <PageContainer
      title="支出明细记录"
      extra={<Button onClick={handleBack}>返回</Button>}
    >
      <div className={styles.container}>
        {/* 统计信息 */}
        <Card className={styles.summaryCard}>
          <div className={styles.summaryRow}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryLabel}>总收入</div>
              <div className={styles.summaryValue} style={{ color: '#05DF72' }}>
                +{totalIncome.toFixed(2)} USDT
              </div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryLabel}>总支出</div>
              <div className={styles.summaryValue} style={{ color: '#FF6467' }}>
                -{totalExpense.toFixed(2)} USDT
              </div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryLabel}>净收益</div>
              <div className={styles.summaryValue} style={{ color: netAmount >= 0 ? '#05DF72' : '#FF6467' }}>
                {netAmount >= 0 ? '+' : ''}{netAmount.toFixed(2)} USDT
              </div>
            </div>
          </div>
        </Card>

        {/* 明细表格 */}
        <Card className={styles.tableCard}>
          <Table
            columns={columns}
            dataSource={getCurrentData()}
            rowKey="id"
            pagination={{
              current: currentPage,
              total: allRecords.length,
              pageSize,
              onChange: (page) => setCurrentPage(page),
              showSizeChanger: false,
            }}
          />
        </Card>
      </div>
    </PageContainer>
  );
};

export default Expense;
