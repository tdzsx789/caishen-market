import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Space, message } from 'antd';
import { history, useParams } from '@umijs/max';
import React, { useState } from 'react';
import styles from './index.less';

interface VoteOption {
  text: string;
  odds: string;
}

interface VoteData {
  id: number;
  title: string;
  description: string;
  option1: VoteOption;
  option2: VoteOption;
}

// 模拟获取详情数据（实际应该从接口获取）
const getVoteDetail = (id: string): VoteData | null => {
  const voteId = parseInt(id);
  return {
    id: voteId,
    title: `投票项目 ${voteId}`,
    description: `这是第 ${voteId} 个投票项目的详细描述信息。这里可以展示更详细的内容，包括投票规则、截止时间、参与人数等信息。`,
    option1: {
      text: `选项A - ${voteId}`,
      odds: '1.85',
    },
    option2: {
      text: `选项B - ${voteId}`,
      odds: '1.95',
    },
  };
};

const VoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [option1Yes, setOption1Yes] = useState<boolean | null>(null);
  const [option1No, setOption1No] = useState<boolean | null>(null);
  const [option2Yes, setOption2Yes] = useState<boolean | null>(null);
  const [option2No, setOption2No] = useState<boolean | null>(null);

  const voteData = id ? getVoteDetail(id) : null;

  if (!voteData) {
    return (
      <PageContainer>
        <div className={styles.container}>
          <Card>未找到投票详情</Card>
        </div>
      </PageContainer>
    );
  }

  const handleBet = (option: 'option1' | 'option2', choice: 'yes' | 'no') => {
    const optionData = option === 'option1' ? voteData.option1 : voteData.option2;
    
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

  const handleBack = () => {
    history.back();
  };

  return (
    <PageContainer
      title={voteData.title}
      extra={
        <Button onClick={handleBack}>返回</Button>
      }
    >
      <div className={styles.container}>
        <Card className={styles.detailCard}>
          <div className={styles.description}>{voteData.description}</div>
          <div className={styles.betButtons}>
            <div className={styles.betOption}>
              <div className={styles.optionText}>{voteData.option1.text}</div>
              <div className={styles.optionOdds}>赔率: {voteData.option1.odds}</div>
              <Space className={styles.buttonGroup}>
                <Button
                  type={option1Yes ? 'primary' : 'default'}
                  size="large"
                  onClick={() => handleBet('option1', 'yes')}
                >
                  是
                </Button>
                <Button
                  type={option1No ? 'primary' : 'default'}
                  size="large"
                  onClick={() => handleBet('option1', 'no')}
                >
                  否
                </Button>
              </Space>
            </div>
            <div className={styles.betOption}>
              <div className={styles.optionText}>{voteData.option2.text}</div>
              <div className={styles.optionOdds}>赔率: {voteData.option2.odds}</div>
              <Space className={styles.buttonGroup}>
                <Button
                  type={option2Yes ? 'primary' : 'default'}
                  size="large"
                  onClick={() => handleBet('option2', 'yes')}
                >
                  是
                </Button>
                <Button
                  type={option2No ? 'primary' : 'default'}
                  size="large"
                  onClick={() => handleBet('option2', 'no')}
                >
                  否
                </Button>
              </Space>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default VoteDetail;
