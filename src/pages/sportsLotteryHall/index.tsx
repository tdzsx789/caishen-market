import { useIsMobile } from '@/hooks/useIsMobile'
import { ArrowUpOutlined } from '@ant-design/icons';
import React, { useState, useRef, useEffect } from 'react';
import VoteCard from './components/VoteCard';
import PaginationWithLoadMore from './components/PaginationWithLoadMore';
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

const tabLabel=(allVoteData?: { [key: string]: any[] })=>{
  const list = {
    all: '/icons/pajamas_earth.svg',
    Bitcoin: '/icons/formkit_bitcoin.svg',
    Ethereum: '/icons/picon_ethereum.svg',
    Solana: '/icons/token_solana.svg',
    XRP: '/icons/Vector.svg',
  }
  const options = Object.keys(list).map((item,index) => {
    // 计算该tab中状态为 'InProgress'（局中）的数量
    const tabKey = String(index + 1);
    const inProgressCount = allVoteData?.[tabKey]?.filter(
      (vote) => vote.status === 'InProgress'
    ).length || 0;
    
    return {
      key: index,
      icon: list[item as keyof typeof list],
      text: item === 'all' ?  '全部' : item,
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
  // 每个tab的数据（这里用模拟数据，实际应该从接口获取）
  const allVoteData = {
    '1': generateVoteData(450), // 450个数据，3页
    '2': generateVoteData(300), // 300个数据，2页
    '3': generateVoteData(600), // 600个数据，4页
    '4': generateVoteData(150), // 150个数据，1页
    '5': generateVoteData(750), // 750个数据，5页
  };
  const isMobile = useIsMobile();
  const [options, setOptions] = useState(tabLabel(allVoteData))
  const tabGroupRef = useRef<HTMLDivElement>(null);
  const tabItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [showBackToTop, setShowBackToTop] = useState(false);


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


  // 回到顶部函数
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 监听滚动，控制回到顶部按钮的显示
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 300); // 滚动超过300px时显示按钮
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

  return (
    <div className={styles.container}>
      <div className={styles.tabCard}>
        <div className={styles.tabGroup} ref={tabGroupRef}>
          {options.map((item,index) => (
            <div 
              className={`${styles.tabItem} ${activeTab === String(index+1) && styles.activeItem}`} 
              key={index} 
              ref={(el) => { tabItemRefs.current[String(index)] = el; }}
              onClick={() => handleTabChange(String(index+1))}
            >
              <img src={item.icon} className={styles.icon} alt={item.text} />
              <div className={styles.text}>{item.text} <span>({item.inProgressCount})</span></div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.title}>{options[Number(activeTab)-1]?.text}</div>
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
                <VoteCard key={item.id} data={item} />
              ))}
            </div>
          )}
        </PaginationWithLoadMore>
      </div>
      {showBackToTop && isMobile && (
        <div className={styles.backToTop} onClick={scrollToTop}>
          <ArrowUpOutlined />
        </div>
      )}
    </div>
  );
};

export default SportsLotteryHall;
