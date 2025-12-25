import { PageContainer } from '@ant-design/pro-components';
import { Tabs, Pagination } from 'antd';
import React, { useState, useEffect } from 'react';
import VoteCard from './components/VoteCard';
import styles from './index.less';

// 模拟投票数据
const generateCoinData = (coinName: string) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // 生成当天24小时的数据
  return Array.from({ length: 24 }, (_, index) => {
    // 设置结束时间为当天的整点（0:00 - 23:00）的下一个小时
    // 例如 index=0 (0点场)，endTime应该是 1:00
    const endTime = new Date(todayStart.getTime() + (index + 1) * 60 * 60 * 1000);
    
    // 状态判断：
    // 基于当前小时段(index)判断
    // 如果 index < 当前小时，为已结束
    // 如果 index == 当前小时，为进行中
    // 如果 index > 当前小时，为即将开始
    let status: 'InProgress' | 'isStart' | 'isEnd';
    const currentHour = now.getHours();
    
    if (index < currentHour) {
      status = 'isEnd';
    } else if (index === currentHour) {
      status = 'InProgress';
    } else {
      status = 'isStart';
    }
    
    // 格式化时间用于描述
    const timeStr = `${endTime.getFullYear()}-${String(endTime.getMonth() + 1).padStart(2, '0')}-${String(endTime.getDate()).padStart(2, '0')} ${String(endTime.getHours()).padStart(2, '0')}:00`;
    
    // 随机生成交易量（单位：USDT）
    const tradingVolume = (Math.random() * 1000000 + 10000).toFixed(2);
    
    return {
      id: `${coinName}-${index}`, // 唯一ID
      title: `${coinName} 价格预测 ${String(index).padStart(2, '0')}:00`,
      description: `${coinName}价格会在${timeStr}之前到达120000美元吗？`,
      activityDescription: `活动说明：这是一个关于${coinName}市场预测的投票活动。参与者可以根据市场趋势选择"是"或"否"，并根据赔率进行下注。活动将在${timeStr}结束，结果将在活动结束后公布。`,
      tradingVolume: parseFloat(tradingVolume),
      endTime: endTime.toISOString(),
      createdAt: now.toISOString(), // 创建时间是现在
      status: status as 'InProgress' | 'isStart' | 'isEnd',
      userBetStatus: Math.random() > 0.8, // 随机用户投注状态
      option1: {
        text: '是',
        odds: (1.5 + Math.random()).toFixed(2),
      },
      option2: {
        text: '否',
        odds: (1.5 + Math.random()).toFixed(2),
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
    Caishen: '/icons/token_solana.svg',
    TBC: '/icons/Vector.svg',
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
  const [options, setOptions] = useState<any[]>([]);

  // 生成各币种数据
  const bitcoinData = generateCoinData('Bitcoin');
  const ethereumData = generateCoinData('Ethereum');
  const caishenData = generateCoinData('Caishen');
  const tbcData = generateCoinData('TBC');
  
  // 汇总所有数据
  const allDataList = [...bitcoinData, ...ethereumData, ...caishenData, ...tbcData];

  // 每个tab的数据
  const allVoteData = {
    '1': allDataList, // 全部
    '2': bitcoinData, // Bitcoin
    '3': ethereumData, // Ethereum
    '4': caishenData, // Caishen
    '5': tbcData,     // TBC
  };

  useEffect(() => {
    const list = {
        all: '/icons/pajamas_earth.svg',
        Bitcoin: '/icons/formkit_bitcoin.svg',
        Ethereum: '/icons/picon_ethereum.svg',
        Caishen: '/icons/token_solana.svg',
        TBC: '/icons/Vector.svg',
      }
      const newOptions = Object.keys(list).map((item,index) => {
        return {
          key: index,
          icon: list[item as keyof typeof list],
          text: item === 'all' ?  '全部' : item,
          count: allVoteData[String(index + 1) as keyof typeof allVoteData]?.length || 0
        }
      }) 
      setOptions(newOptions);
  }, []);

  // 每页数据量
  const pageSize = 20; // 调整每页显示数量，因为数据量变少了（每组24个）

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
              <div className={styles.text}>{item.text} <span>({item.count})</span></div>
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
