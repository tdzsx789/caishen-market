import { Card, Button, Space, message } from 'antd';
import { history } from '@umijs/max';
import React, { useState } from 'react';
import styles from './index.less';

interface VoteOption {
  text: string;
  odds: string;
}

interface MultipleOption {
  name: string;
  tradingVolume?: number;
  chance?: number;
  price?: number;
}

interface VoteCardProps {
  data: {
    id: number | string;
    _id?: string;
    subType?: string;
    type?: string;
    title?: string;
    description: string;
    activityDescription?: string;
    tradingVolume: number; // 交易量
    endTime: string; // 结束时间
    status: 'InProgress' | 'isStart' | 'isEnd'; // 状态
    userBetStatus: boolean; // 用户投注状态
    option1?: VoteOption;
    option2?: VoteOption;
    options?: MultipleOption[];
    result?: {
      option1: 'yes' | 'no' | null;
      option2: 'yes' | 'no' | null;
    };
  };
}

const VoteCard: React.FC<VoteCardProps> = ({ data }) => {
  const handleCardClick = () => {
    // 优先使用 _id (Mongo ObjectId) 作为 URL 参数
    const targetId = data._id || data.id;
    // 通过 state 传递数据到详情页
    history.push({
      pathname: `/SportsLotteryHall/detail/${targetId}`,
    }, data);
  };
  
  const statusList ={
    InProgress: '进行中',
    isStart: '即将开始',
    isEnd: '已结束'
  }

  const renderName = (name: string) => {
    if (name.includes('以上')) return `↑ ${name}`;
    if (name.includes('以下')) return `↓ ${name}`;
    return name;
  };

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
        {data.subType === 'multiple' && data.options ? (
          <>
            {[...data.options]
              .sort((a, b) => (b.tradingVolume || 0) - (a.tradingVolume || 0))
              .slice(0, 2)
              .map((opt, idx) => (
                <div key={idx} className={styles.betOption}>
                  <div className={styles.optionText}>{renderName(opt.name)}</div>
                  <div className={styles.optionOdds}>{opt.price}%</div>
                  <Space className={styles.buttonGroup}>
                    <div className={styles.btnYesDouble}>是</div>
                    <div className={styles.btnNoDouble}>否</div>
                  </Space>
                </div>
              ))}
            {data.options.length > 2 && (
              <div className={styles.moreOptions}>
                +{data.options.length - 2}个选项
              </div>
            )}
          </>
        ) : (
          <>
            <div className={styles.betOption}>
              <div className={styles.optionText}>{data.option1?.text}</div>
              <div className={styles.optionOdds}>赔率: {data.option1?.odds}</div>
              <Space className={styles.buttonGroup}>
                <div className={styles.yesButton}>是</div>
                <div className={styles.NoButton}> 否</div>
              </Space>
            </div>
            <div className={styles.betOption}>
              <div className={styles.optionText}>{data.option2?.text}</div>
              <div className={styles.optionOdds}>赔率: {data.option2?.odds}</div>
              <Space className={styles.buttonGroup}>
                <div className={styles.yesButton}>是</div>
                <div className={styles.NoButton}> 否</div>
              </Space>
            </div>
          </>
        )}
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
