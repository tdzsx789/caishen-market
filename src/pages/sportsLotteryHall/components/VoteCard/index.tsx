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
    id: number | string;
    type?: string;
    title?: string;
    description: string;
    activityDescription?: string;
    tradingVolume: number; // 交易量
    endTime: string; // 结束时间
    status: 'InProgress' | 'isStart' | 'isEnd'; // 状态
    userBetStatus: boolean; // 用户投注状态
    option1: VoteOption;
    option2: VoteOption;
    result?: {
      option1: 'yes' | 'no' | null;
      option2: 'yes' | 'no' | null;
    };
  };
}

const VoteCard: React.FC<VoteCardProps> = ({ data }) => {
  const handleCardClick = () => {
    // 通过 state 传递数据到详情页
    history.push({
      pathname: `/SportsLotteryHall/detail/${data.id}`,
    }, data);
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
      <div className={styles.infoRow}>
        <div className={styles.infoItem}>
          <img src="/icons/Icon.png" alt="" />
          <div className={styles.number}>{data.tradingVolume.toLocaleString()}</div>
        </div>
        <div className={styles.infoItem}>
          <img src="/icons/Icon1.png" alt="" />
          <div className={styles.number}>{new Date(data.endTime).toLocaleString('zh-CN')}</div>
        </div>
      </div>
    </Card>
  );
};

export default VoteCard;
