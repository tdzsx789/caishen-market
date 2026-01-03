import React, { useState, useRef, useEffect } from 'react';
import VoteCard from './components/VoteCard';
import VoteCardDouble from './components/VoteCardDouble';
import BackToTop from '@/components/BackToTop'
import PaginationWithLoadMore from './components/PaginationWithLoadMore';
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
      subType: 'multi',
      title: `${coinName} 价格预测 ${String(index).padStart(2, '0')}:00`,
      description: `${coinName}在${timeStr}的价格会达到多少？`,
      activityDescription: `活动说明：这是一个关于${coinName}市场预测的投票活动。参与者可以根据市场趋势选择"是"或"否"，并根据赔率进行下注。活动将在${timeStr}结束，结果将在活动结束后公布。`,
      tradingVolume: parseFloat(tradingVolume),
      endTime: endTime.toISOString(),
      createdAt: now.toISOString(), // 创建时间是现在
      status: status as 'InProgress' | 'isStart' | 'isEnd',
      userBetStatus: Math.random() > 0.8, // 随机用户投注状态
      option1: {
        text: '90000',
        odds: (1.5 + Math.random()).toFixed(2),
      },
      option2: {
        text: '80000',
        odds: (1.5 + Math.random()).toFixed(2),
      },
      result: status === 'isEnd' ? {
        option1: (Math.random() > 0.5 ? 'yes' : 'no') as 'yes' | 'no' | null,
        option2: (Math.random() > 0.5 ? 'yes' : 'no') as 'yes' | 'no' | null,
      } : undefined,
    };
  });
};

const tabLabel = (allVoteData?: { [key: string]: any[] }) => {
  const list = {
    all: '/icons/pajamas_earth.svg',
    Bitcoin: '/icons/formkit_bitcoin.svg',
    Ethereum: '/icons/picon_ethereum.svg',
    Caishen: '/icons/token_solana.svg',
    TBC: '/icons/Vector.svg',
  }
  const options = Object.keys(list).map((item, index) => {
    // 计算该tab中状态为 'InProgress'（局中）的数量
    const tabKey = String(index + 1);
    const inProgressCount = allVoteData?.[tabKey]?.filter(
      (vote) => vote.status === 'InProgress'
    ).length || 0;

    return {
      key: index,
      icon: list[item as keyof typeof list],
      text: item === 'all' ? '全部' : item,
      inProgressCount: inProgressCount
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
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [allCards, setAllCards] = useState<any[]>([]);

  const timeOptions = [
    { label: '全部', value: 'all' },
    { label: '小时', value: 'hour' },
    { label: '天', value: 'day' },
    { label: '月', value: 'month' },
    { label: '年', value: 'year' },
  ];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await fetch(`http://localhost:5260/api/cards?periodType=${timeFilter}`);
        if (response.ok) {
          const data = await response.json();
          const mappedData = data.map((item: any) => {
            const now = new Date();
            const endTime = new Date(item.endTime);
            let status: 'InProgress' | 'isStart' | 'isEnd';
            
            const startTime = new Date(item.startTime);
            const currentTime = now.getTime();
            const startTimeMs = startTime.getTime();
            const endTimeMs = endTime.getTime();

            if (currentTime >= endTimeMs) {
                status = 'isEnd';
            } else if (currentTime >= startTimeMs && currentTime < endTimeMs) {
                status = 'InProgress';
            } else {
                status = 'isStart';
            }

            let coinName = item.category;
            if (coinName === 'BitBitcoin') coinName = 'Bitcoin';

            // Base object
            const baseObj = {
              id: item.id,
              _id: item._id, // Pass _id from backend
              subType: item.subType || 'guess', // Default to guess if missing
              title: item.title,
              description: item.description,
              activityDescription: item.activityDescription,
              tradingVolume: item.tradingVolume,
              endTime: item.endTime,
              createdAt: item.startTime,
              status: status,
              userBetStatus: Math.random() > 0.8,
              coinName: coinName
            };

            if (item.subType === 'multiple') {
              return {
                ...baseObj,
                options: item.options || [],
              };
            } else {
              // guess type logic
              const rise = item.rise || 0;
              const fall = item.fall || 0;
              
              return {
                ...baseObj,
                rise,
                fall,
                option1: {
                  text: '涨',
                  odds: rise.toString(),
                },
                option2: {
                  text: '跌',
                  odds: fall.toString(),
                },
                result: status === 'isEnd' ? {
                  option1: (Math.random() > 0.5 ? 'yes' : 'no') as 'yes' | 'no' | null,
                  option2: (Math.random() > 0.5 ? 'yes' : 'no') as 'yes' | 'no' | null,
                } : undefined,
              };
            }
          });
          setAllCards(mappedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAllData();
  }, [timeFilter]);

  // Filter data for specific tabs
  const bitcoinData = allCards.filter(d => d.coinName === 'Bitcoin');
  const ethereumData = allCards.filter(d => d.coinName === 'Ethereum');
  const caishenData = allCards.filter(d => d.coinName === 'Caishen');
  const tbcData = allCards.filter(d => d.coinName === 'TBC');

  // 每个tab的数据
  const allVoteData = {
    '1': allCards, // 全部
    '2': bitcoinData, // Bitcoin
    '3': ethereumData, // Ethereum
    '4': caishenData, // Caishen
    '5': tbcData,     // TBC
  };
  const tabGroupRef = useRef<HTMLDivElement>(null);
  const tabItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 排序函数：进行中 > 未开始 > 已结束；同状态下按创建时间降序
  const sortVoteData = (data: any[]) => {
    const statusOrder: { [key: string]: number } = { InProgress: 1, isStart: 2, isEnd: 3 };
    const coinRank: { [key: string]: number } = { Bitcoin: 1, Ethereum: 2, default: 3 };

    return [...data].sort((a, b) => {
      // 先按状态排序
      const statusDiff = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
      if (statusDiff !== 0) {
        return statusDiff;
      }

      // 如果都是进行中状态，优先展示 Bitcoin 和 Ethereum
      if (a.status === 'InProgress' && b.status === 'InProgress') {
        const aCoinRank = coinRank[a.coinName as keyof typeof coinRank] || coinRank.default;
        const bCoinRank = coinRank[b.coinName as keyof typeof coinRank] || coinRank.default;
        if (aCoinRank !== bCoinRank) {
          return aCoinRank - bCoinRank;
        }
      }

      // 同状态下按创建时间降序（最新的在前）
      const aTime = new Date(a.createdAt || a.endTime).getTime();
      const bTime = new Date(b.createdAt || b.endTime).getTime();
      return bTime - aTime;
    });
  };

  // 获取当前tab的排序后数据
  const getSortedData = () => {
    const allData = allVoteData[activeTab as keyof typeof allVoteData] || [];
    return sortVoteData(allData);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // 滚动到选中的tab，使其居中显示
    const tabIndex = Number(key) - 1;
    const tabItem = tabItemRefs.current[String(tabIndex)];
    const tabGroup = tabGroupRef.current;

    if (tabItem && tabGroup) {
      const itemOffsetLeft = tabItem.offsetLeft;
      const itemWidth = tabItem.offsetWidth;
      const containerWidth = tabGroup.offsetWidth;

      // 计算目标滚动位置：选中项的中心点对齐容器的中心点
      const targetScrollLeft = itemOffsetLeft - (containerWidth / 2) + (itemWidth / 2);

      tabGroup.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }

  };

  // 初始加载时，确保选中的tab居中显示
  useEffect(() => {
    const tabIndex = Number(activeTab) - 1;
    const tabItem = tabItemRefs.current[String(tabIndex)];
    const tabGroup = tabGroupRef.current;

    if (tabItem && tabGroup) {
      const itemOffsetLeft = tabItem.offsetLeft;
      const itemWidth = tabItem.offsetWidth;
      const containerWidth = tabGroup.offsetWidth;

      // 计算目标滚动位置：选中项的中心点对齐容器的中心点
      const targetScrollLeft = itemOffsetLeft - (containerWidth / 2) + (itemWidth / 2);

      tabGroup.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }
  }, []); // 只在组件挂载时执行一次

  useEffect(() => {
    const list = {
      all: '/icons/pajamas_earth.svg',
      Bitcoin: '/icons/formkit_bitcoin.svg',
      Ethereum: '/icons/picon_ethereum.svg',
      Caishen: '/icons/token_solana.svg',
      TBC: '/icons/Vector.svg',
    }
    const newOptions = Object.keys(list).map((item, index) => {
      return {
        key: index,
        icon: list[item as keyof typeof list],
        text: item === 'all' ? '全部' : item,
        count: allVoteData[String(index + 1) as keyof typeof allVoteData]?.length || 0
      }
    })
    setOptions(newOptions);
  }, [allCards]); // Update options when allCards changes

  return (
    <div className={styles.container}>
      <div className={styles.tabCard}>
        <div className={styles.tabGroup} ref={tabGroupRef}>
          {options.map((item, index) => (
            <div
              className={`${styles.tabItem} ${activeTab === String(index + 1) && styles.activeItem}`}
              key={index}
              ref={(el) => { tabItemRefs.current[String(index)] = el; }}
              onClick={() => handleTabChange(String(index + 1))}
            >
              <img src={item.icon} className={styles.icon} alt={item.text} />
              <div className={styles.text}>{item.text} <span>({item.count})</span></div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.title}>
        <div className={styles.titleLeft}>
          <img src={options[Number(activeTab)-1]?.icon} className={styles.icon} alt={options[Number(activeTab)-1]?.text} />
          {options[Number(activeTab)-1]?.text}
        </div>
        <div className={styles.timeFilter}>
          {timeOptions.map((option) => (
            <div
              key={option.value}
              className={`${styles.filterItem} ${timeFilter === option.value ? styles.activeFilter : ''}`}
              onClick={() => setTimeFilter(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.content}>
        <PaginationWithLoadMore
          dataSource={getSortedData()}
          pageSize={50}
          mobilePageSize={20}
          currentPage={currentPage[activeTab]}
          onPageChange={(page) => {
            setCurrentPage({
              ...currentPage,
              [activeTab]: page,
            });
          }}
        >
          {(data) => (
            <div className={styles.cardList}>
              {data.map((item) => (
                item.subType === 'guess' ? (
                  <VoteCardDouble key={item.id} data={item} />
                ) : (
                  <VoteCard key={item.id} data={item} />
                )
              ))}
            </div>
          )}
        </PaginationWithLoadMore>
      </div>
      <BackToTop />
    </div>
  );
};

export default SportsLotteryHall;
