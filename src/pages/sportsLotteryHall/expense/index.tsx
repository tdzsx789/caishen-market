import { Table } from 'antd';
import PageBack from '@/components/PageBack'
import React, { useState } from 'react';
import styles from './index.less';

interface ExpenseRecord {
  id: number;
  time: string;
  type: 'bet' | 'win' | 'notWin' ;
  name: string;
  income: number; // 收入
  expense: number; // 支出
}

// 模拟数据
const generateExpenseRecords = (count: number): ExpenseRecord[] => {
  const types: ExpenseRecord['type'][] = ['bet', 'win', 'notWin'];

  return Array.from({ length: count }, (_, index) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const isIncome = type === 'win';
    const amount = Math.floor(Math.random() * 5000) + 100;

    return {
      id: index + 1,
      time: new Date(Date.now() - index * 2 * 60 * 60 * 1000).toISOString(),
      type: type,
      name: '比特币(BTC)价格会在2025年1月31日前突破12万美元吗?',
      income: isIncome ? amount : 0,
      expense: !isIncome ? amount : 0,
    };
  });
};

const Expense: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;
  const allRecords = generateExpenseRecords(25);

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
          bet: { text: '投注',class: 'betClass' },
          win: { text: '中奖',class: 'winClass' },
          notWin: { text: '未中奖',class: 'notWinClass' },
        };
        const config = typeConfig[type as keyof typeof typeConfig];
        return <div className={`${styles.tag} ${styles[config.class]}`}>{config.text}</div>;
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => {
        return <span style={{ color: '#FFFFFF' }}>{name}</span>;
      }
    },
    {
      title: '收入',
      dataIndex: 'income',
      key: 'income',
      render: (income: number) => (
        <div className={styles.income} style={{ color: income > 0 ? '#00C950' : '#4A5565' }}>
          {income > 0 ? `+$${income.toFixed(2)}` : '-'}
        </div>
      ),
    },
    {
      title: '支出',
      dataIndex: 'expense',
      key: 'expense',
      render: (expense: number) => (
        <div className={styles.expense} style={{ color: expense > 0 ? '#AA0F0A' : '#4A5565' }}>
          {expense > 0 ? `-$${expense.toFixed(2)}` : '-'}
        </div>
      ),
    },
  ];

  // 分页数据
  const getCurrentData = () => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return allRecords.slice(start, end);
  };

  return (
    <div className={styles.container}>
      <PageBack title={'返回首页平台'} />
      <div className={styles.title}>明细记录</div>
      {/* 明细表格 */}
      <div className={styles.tableCard}>
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
      </div>
    </div>
  );
};

export default Expense;
