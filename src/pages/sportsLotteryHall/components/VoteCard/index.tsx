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
    title: string;
    description: string;
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

  return (
    <Card className={styles.voteCard} title={data.title} onClick={handleCardClick}>
      <div className={styles.description}>{data.description}</div>
      <div className={styles.betButtons}>
        <div className={styles.betOption}>
          <div className={styles.optionText}>{data.option1.text}</div>
          <div className={styles.optionOdds}>赔率: {data.option1.odds}</div>
          <Space className={styles.buttonGroup}>
            <Button
              type={option1Yes ? 'primary' : 'default'}
              onClick={(e) => handleBet(e, 'option1', 'yes')}
            >
              是
            </Button>
            <Button
              type={option1No ? 'primary' : 'default'}
              onClick={(e) => handleBet(e, 'option1', 'no')}
            >
              否
            </Button>
          </Space>
        </div>
        <div className={styles.betOption}>
          <div className={styles.optionText}>{data.option2.text}</div>
          <div className={styles.optionOdds}>赔率: {data.option2.odds}</div>
          <Space className={styles.buttonGroup}>
            <Button
              type={option2Yes ? 'primary' : 'default'}
              onClick={(e) => handleBet(e, 'option2', 'yes')}
            >
              是
            </Button>
            <Button
              type={option2No ? 'primary' : 'default'}
              onClick={(e) => handleBet(e, 'option2', 'no')}
            >
              否
            </Button>
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default VoteCard;
