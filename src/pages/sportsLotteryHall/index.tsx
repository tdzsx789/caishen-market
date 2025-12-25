import { PageContainer } from '@ant-design/pro-components';
import { Tabs, Pagination } from 'antd';
import React, { useState } from 'react';
import VoteCard from './components/VoteCard';
import styles from './index.less';

// 模拟投票数据
const generateVoteData = (count: number) => {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    // 随机生成状态：进行中或已结束
    const isTime = Math.random();
    const status = isTime > 0.7 ? 'isEnd' :isTime > 0.5 ? 'isStart' : 'InProgress';
    
    // 生成结束时间（如果是已结束，时间在过去；如果是进行中，时间在未来）
    const endTime = isTime > 0.7  
      ? new Date(now.getTime() -isTime * 7 * 24 * 60 * 60 * 1000) // 过去7天内
      : new Date(now.getTime() +isTime * 7 * 24 * 60 * 60 * 1000); // 未来7天内
    
    // 生成创建时间（用于排序）
    const createdAt = new Date(now.getTime() - (count - index) * 24 * 60 * 60 * 1000);
    
    // 随机生成交易量（单位：USDT）
    const tradingVolume = (isTime * 1000000 + 10000).toFixed(2);
    return {
      id: index + 1,
      title: `投票项目 ${index + 1}`,
      description: `这是第 ${index + 1} 个投票项目的详细描述信息`,
      activityDescription: `活动说明：这是一个关于加密货币市场预测的投票活动。参与者可以根据市场趋势选择"是"或"否"，并根据赔率进行下注。活动将在截止日期前结束，结果将在活动结束后公布。`,
      tradingVolume: parseFloat(tradingVolume), // 交易量
      endTime: endTime.toISOString(), // 结束时间
      createdAt: createdAt.toISOString(), // 创建时间
      status: status as 'InProgress' | 'isStart' | 'isEnd', // 状态
      userBetStatus: isTime > 0.5, // 用户投注状态
      option1: {
        text: `选项A - ${index + 1}`,
        odds: '1.85',
      },
      option2: {
        text: `选项B - ${index + 1}`,
        odds: '1.95',
      },
      result: status === 'isEnd' ? {
        option1: (Math.random() > 0.5 ? 'yes' : 'no') as 'yes' | 'no' | null,
        option2: (Math.random() > 0.5 ? 'yes' : 'no') as 'yes' | 'no' | null,
      } : undefined,
    };
  });
};

const tabLabel=()=>{
  const list = {
    all: '/icons/pajamas_earth.svg',
    Bitcoin: '/icons/formkit_bitcoin.svg',
    Ethereum: '/icons/picon_ethereum.svg',
    Solana: '/icons/token_solana.svg',
    XRP: '/icons/Vector.svg',
  }
  const options = Object.keys(list).map((item,index) => {
    return {
      key: index,
      icon: list[item as keyof typeof list],
      text: item === 'all' ?  '全部' : item,
      random: Math.floor(Math.random() * 100)
    }
  }) 
  return options
}

const SportsLotteryHall: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('1');
  const [currentPage, setCurrentPage] = useState<{ [key: string]: number }>({
    '1': 1,
    '2': 1,
    '3': 1,
    '4': 1,
    '5': 1,
  });
  const [options, setOptions] = useState(tabLabel())
  // 每个tab的数据（这里用模拟数据，实际应该从接口获取）
  const allVoteData = {
    '1': generateVoteData(450), // 450个数据，3页
    '2': generateVoteData(300), // 300个数据，2页
    '3': generateVoteData(600), // 600个数据，4页
    '4': generateVoteData(150), // 150个数据，1页
    '5': generateVoteData(750), // 750个数据，5页
  };

  // 每页3个*50行 = 150个
  const pageSize = 150;

  // 排序函数：进行中 > 未开始 > 已结束；同状态下按创建时间降序
  const sortVoteData = (data: typeof allVoteData['1']) => {
    const statusOrder = { InProgress: 1, isStart: 2, isEnd: 3 };
    return [...data].sort((a, b) => {
      // 先按状态排序
      const statusDiff = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
      if (statusDiff !== 0) {
        return statusDiff;
      }
      // 同状态下按创建时间降序（最新的在前）
      const aTime = new Date(a.createdAt || a.endTime).getTime();
      const bTime = new Date(b.createdAt || b.endTime).getTime();
      return bTime - aTime;
    });
  };

  // 获取当前tab的当前页数据
  const getCurrentPageData = () => {
    const allData = allVoteData[activeTab as keyof typeof allVoteData] || [];
    // 先排序
    const sortedData = sortVoteData(allData);
    // 再分页
    const start = (currentPage[activeTab] - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  };
  // 获取当前tab的总数据量
  const getTotalCount = () => {
    return allVoteData[activeTab as keyof typeof allVoteData]?.length || 0;
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage({
      ...currentPage,
      [activeTab]: page,
    });
  };

  const currentData = getCurrentPageData();
  const total = getTotalCount();

  return (
    <div className={styles.container}>
      <div className={styles.tabCard}>
        <div className={styles.tabGroup}>
          {options.map((item,index) => (
            <div className={`${styles.tabItem} ${activeTab === String(index+1) && styles.activeItem}`} key={index} onClick={() => handleTabChange(String(index+1))}>
              <img src={item.icon} className={styles.icon} alt={item.text} />
              <div className={styles.text}>{item.text} <span>({item.random})</span></div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.title}>{options[Number(activeTab)-1]?.text}</div>
      <div className={styles.content}>
        <div className={styles.cardList}>
          {currentData.map((item) => (
            <VoteCard key={item.id} data={item} />
          ))}
        </div>
        <div className={styles.pagination}>
          <Pagination
            current={currentPage[activeTab]}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
};

export default SportsLotteryHall;
