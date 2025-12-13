import { PageContainer } from '@ant-design/pro-components';
import { Tabs, Pagination } from 'antd';
import React, { useState } from 'react';
import VoteCard from './components/VoteCard';
import styles from './index.less';

// 模拟投票数据
const generateVoteData = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title: `投票项目 ${index + 1}`,
    description: `这是第 ${index + 1} 个投票项目的详细描述信息`,
    option1: {
      text: `选项A - ${index + 1}`,
      odds: '1.85',
    },
    option2: {
      text: `选项B - ${index + 1}`,
      odds: '1.95',
    },
  }));
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
              <img src={item.icon} alt={item.text} style={{ width: 20, height: 20 }} />
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
