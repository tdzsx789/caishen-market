import { PageContainer } from '@ant-design/pro-components';
import { Tabs, Pagination } from 'antd';
import React, { useState } from 'react';
import VoteCard from './components/VoteCard';
import styles from './index.less';

// 模拟投票数据
const generateVoteData = (count: number) => {
  return Array.from({ length: count }, (_, index) => {
    // 随机生成状态：进行中或已结束
    const isTime = Math.random();
    const status = isTime > 0.7 ? 'isEnd' :isTime > 0.5 ? 'isStart' : 'InProgress';
    
    // 生成结束时间（如果是已结束，时间在过去；如果是进行中，时间在未来）
    const now = new Date();
    const endTime = isTime > 0.7  
      ? new Date(now.getTime() -isTime * 7 * 24 * 60 * 60 * 1000) // 过去7天内
      : new Date(now.getTime() +isTime * 7 * 24 * 60 * 60 * 1000); // 未来7天内
    
    // 随机生成交易量（单位：USDT）
    const tradingVolume = (isTime * 1000000 + 10000).toFixed(2);
    return {
      id: index + 1,
      description: `这是第 ${index + 1} 个投票项目的详细描述信息`,
      tradingVolume: parseFloat(tradingVolume), // 交易量
      endTime: endTime.toISOString(), // 结束时间
      status: status as 'InProgress' | 'isEnd', // 状态
      userBetStatus: isTime > 0.5, // 用户投注状态
      option1: {
        text: `选项A - ${index + 1}`,
        odds: '1.85',
      },
      option2: {
        text: `选项B - ${index + 1}`,
        odds: '1.95',
      },
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
    '1': generateVoteData(32), // 32个数据，4页
    '2': generateVoteData(24), // 24个数据，3页
    '3': generateVoteData(40), // 40个数据，5页
    '4': generateVoteData(16), // 16个数据，2页
    '5': generateVoteData(48), // 48个数据，6页
  };

  const pageSize = 8;

  // 获取当前tab的当前页数据
  const getCurrentPageData = () => {
    const allData = allVoteData[activeTab as keyof typeof allVoteData] || [];
    const start = (currentPage[activeTab] - 1) * pageSize;
    const end = start + pageSize;
    return allData.slice(start, end);
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
