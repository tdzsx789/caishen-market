import { Card, Button, Space, message } from 'antd';
import { history } from '@umijs/max';
import React, { useState } from 'react';
import styles from './index.less';

interface VoteOption {
  text: string;
  odds: string;
}

interface VoteCardProps {
  data: {
    id: number;
    description: string;
    tradingVolume: number; // 交易量
    endTime: string; // 结束时间
    status: 'InProgress' | 'isStart' | 'isEnd'; // 状态
    userBetStatus: boolean; // 用户投注状态
    option1: VoteOption;
    option2: VoteOption;
  };
}

const VoteCard: React.FC<VoteCardProps> = ({ data }) => {
  const [option1Yes, setOption1Yes] = useState<boolean | null>(null);
  const [option1No, setOption1No] = useState<boolean | null>(null);
  const [option2Yes, setOption2Yes] = useState<boolean | null>(null);
  const [option2No, setOption2No] = useState<boolean | null>(null);
  const handleCardClick = () => {
    history.push(`/SportsLotteryHall/detail/${data.id}`);
  };

  const handleBet = (e: React.MouseEvent, option: 'option1' | 'option2', choice: 'yes' | 'no') => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击
    const optionData = option === 'option1' ? data.option1 : data.option2;
    
    if (option === 'option1') {
      if (choice === 'yes') {
        setOption1Yes(true);
        setOption1No(false);
      } else {
        setOption1Yes(false);
        setOption1No(true);
      }
    } else {
      if (choice === 'yes') {
        setOption2Yes(true);
        setOption2No(false);
      } else {
        setOption2Yes(false);
        setOption2No(true);
      }
    }
    message.success(`已选择 ${optionData.text} - ${choice === 'yes' ? '是' : '否'}`);
  };
  const statusList ={
    InProgress: '进行中',
    isStart: '即将开始',
    isEnd: '已结束'
  }
  return (
    <Card className={styles.voteCard} onClick={handleCardClick}>
      <div className={styles.metaInfo}>
        {data.userBetStatus && <div className={styles.betStatus}>已投注</div>}
        <div className={styles[data.status]}>
          {statusList[data.status]}
        </div>
      </div>
      <div className={styles.description}>{data.description}</div>
      <div className={styles.betButtons}>
        <div className={styles.betOption}>
          <div className={styles.optionText}>{data.option1.text}</div>
          <div className={styles.optionOdds}>赔率: {data.option1.odds}</div>
          <Space className={styles.buttonGroup}>
            <div className={styles.yesButton}>是</div>
            <div className={styles.NoButton}> 否</div>
          </Space>
        </div>
        <div className={styles.betOption}>
          <div className={styles.optionText}>{data.option2.text}</div>
          <div className={styles.optionOdds}>赔率: {data.option2.odds}</div>
          <Space className={styles.buttonGroup}>
            <div className={styles.yesButton}>是</div>
            <div className={styles.NoButton}> 否</div>
          </Space>
        </div>
      </div>
      <div className={styles.line}></div>
      <div className={styles.tradeVolume}>
        <div className={styles.text}><img src="/icons/Icon.png" alt="" />交易量</div>
        <div className={styles.number}>{data.tradingVolume.toLocaleString()}</div>
      </div>
      <div className={styles.tradeVolume}>
        <div className={styles.text}><img src="/icons/Icon1.png" alt="" />结束时间</div>
        <div className={styles.number}>{new Date(data.endTime).toLocaleString('zh-CN')}</div>
      </div>
    </Card>
  );
};

export default VoteCard;
