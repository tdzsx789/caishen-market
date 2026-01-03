import { PageContainer } from '@ant-design/pro-components';
import { Card } from 'antd';
import { useParams, useLocation } from '@umijs/max';
import PageBack from '@/components/PageBack'
import React, { useState } from 'react';
import styles from './index.less';
import { VoteData, BetRecord } from './types';
import GuessDetail from './components/GuessDetail';
import MultipleDetail from './components/MultipleDetail';

// 模拟获取详情数据（实际应该从接口获取）
const getVoteDetail = (id: string): VoteData | null => {
  const voteId = id;
  const isTime = 0.4;
  const status = isTime > 0.7 ? 'isEnd' : isTime > 0.5 ? 'isStart' : 'InProgress';
  
  const now = new Date();
  const endTime = isTime > 0.7  
    ? new Date(now.getTime() - isTime * 7 * 24 * 60 * 60 * 1000)
    : new Date(now.getTime() + isTime * 7 * 24 * 60 * 60 * 1000);
  
  const tradingVolume = (isTime * 1000000 + 10000).toFixed(2);
  
  // 模拟个人投注记录
  const userBetRecords: BetRecord[] = [
    {
      id: 1,
      option: `选项A - ${voteId}`,
      choice: 'yes',
      amount: 100,
      odds: '1.85',
      time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: status === 'isEnd' ? (Math.random() > 0.5 ? 'win' : 'lose') : 'pending',
    },
    {
      id: 2,
      option: `选项B - ${voteId}`,
      choice: 'no',
      amount: 200,
      odds: '1.95',
      time: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: status === 'isEnd' ? (Math.random() > 0.5 ? 'win' : 'lose') : 'pending',
    },
  ];
  
  return {
    id: voteId,
    title: `投票项目 ${voteId}`,
    description: `这是第 ${voteId} 个投票项目的详细描述信息`,
    activityDescription: `预测比特币价格是否会在2025年1月31日前突破12万美元大关。`,
    tradingVolume: parseFloat(tradingVolume),
    endTime: endTime.toISOString(),
    status: status as 'InProgress' | 'isStart' | 'isEnd',
    userBetStatus: isTime > 0.5,
    option1: {
      text: `是`,
      odds: '1.85',
    },
    option2: {
      text: `否`,
      odds: '1.95',
    },
    result: status === 'isEnd' ? {
      option1: Math.random() > 0.5 ? 'yes' : 'no',
      option2: Math.random() > 0.5 ? 'yes' : 'no',
    } : undefined,
    userBetRecords: userBetRecords.length > 0 ? userBetRecords : undefined,
  };
};

import { getCardData } from '@/services/ant-design-pro/api';

const VoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const [voteData, setVoteData] = useState<VoteData | null>((state as VoteData) || null);

  React.useEffect(() => {
    if (!voteData && id) {
      getCardData({ id }).then((res) => {
        if (res) {
          const item = res;
          const now = new Date();
          const endTime = new Date(item.endTime);
          const startTime = new Date(item.startTime || item.createdAt);
          const currentTime = now.getTime();
          const endTimeMs = endTime.getTime();
          const startTimeMs = startTime.getTime();
          
          let status: 'InProgress' | 'isStart' | 'isEnd';
          if (currentTime >= endTimeMs) {
            status = 'isEnd';
          } else if (currentTime >= startTimeMs && currentTime < endTimeMs) {
            status = 'InProgress';
          } else {
            status = 'isStart';
          }

          const mappedData: VoteData = {
            id: item.id,
            _id: item._id,
            subType: item.subType || 'guess',
            title: item.title,
            description: item.description,
            activityDescription: item.activityDescription,
            tradingVolume: item.tradingVolume,
            endTime: item.endTime,
            status,
            userBetStatus: false,
            coinName: item.category === 'BitBitcoin' ? 'Bitcoin' : item.category,
            rise: item.rise,
            fall: item.fall,
            option1: {
              text: '涨',
              odds: (item.rise || 0).toString()
            },
            option2: {
              text: '跌',
              odds: (item.fall || 0).toString()
            },
            options: item.subType === 'multiple' ? (item.options || []) : undefined
          };
          setVoteData(mappedData);
        } else {
          // Fallback to mock if API returns empty
          const mock = getVoteDetail(id);
          if (mock) setVoteData(mock);
        }
      }).catch((err) => {
        console.error('Failed to fetch card data:', err);
        // Fallback to mock on error
        const mock = getVoteDetail(id);
        if (mock) setVoteData(mock);
      });
    }
  }, [id, voteData]);

  if (!voteData) {
    return (
      <PageContainer>
        <div className={styles.container}>
          <Card>暂无数据</Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <div className={styles.container}>
      <PageBack title={'返回首页平台'} />
      {voteData.subType === 'multiple' ? (
        <MultipleDetail voteData={voteData} />
      ) : (
        <GuessDetail voteData={voteData} />
      )}
    </div>
  );
};

export default VoteDetail;
