import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Space, message, Input, InputNumber, Table, Tag } from 'antd';
import { history, useParams, useModel, useLocation } from '@umijs/max';
import PageBack from '@/components/PageBack'
import React, { useState } from 'react';
import styles from './index.less';

interface VoteOption {
  text: string;
  odds: string;
}

interface BetRecord {
  id: number;
  option: string;
  choice: 'yes' | 'no';
  amount: number;
  odds: string;
  time: string;
  status?: 'win' | 'lose' | 'pending';
}

interface VoteData {
  id: number;
  title: string;
  description: string;
  activityDescription: string; // 活动说明
  option1: VoteOption;
  option2: VoteOption;
  tradingVolume: number; // 总交易量
  endTime: string; // 截止日期
  status: 'InProgress' | 'isStart' | 'isEnd';
  userBetStatus: boolean;
  result?: {
    option1: 'yes' | 'no' | null;
    option2: 'yes' | 'no' | null;
  };
  userBetRecords?: BetRecord[]; // 个人投注记录
}

// 模拟获取详情数据（实际应该从接口获取）
const getVoteDetail = (id: string): VoteData | null => {
  const voteId = parseInt(id);
  const isTime = Math.random();
  const status = isTime > 0.7 ? 'isEnd' : isTime > 0.5 ? 'isStart' : 'InProgress';
  
  const now = new Date();
  const endTime = isTime > 0.7  
    ? new Date(now.getTime() - isTime * 7 * 24 * 60 * 60 * 1000)
    : new Date(now.getTime() + isTime * 7 * 24 * 60 * 60 * 1000);
  
  const tradingVolume = (isTime * 1000000 + 10000).toFixed(2);
  
  // 模拟个人投注记录
  const userBetRecords: BetRecord[] = isTime > 0.4 ? [
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
  ] : [];
  
  return {
    id: voteId,
    title: `投票项目 ${voteId}`,
    description: `这是第 ${voteId} 个投票项目的详细描述信息`,
    activityDescription: `活动说明：这是一个关于加密货币市场预测的投票活动。参与者可以根据市场趋势选择"是"或"否"，并根据赔率进行下注。活动将在截止日期前结束，结果将在活动结束后公布。`,
    tradingVolume: parseFloat(tradingVolume),
    endTime: endTime.toISOString(),
    status: status as 'InProgress' | 'isStart' | 'isEnd',
    userBetStatus: isTime > 0.5,
    option1: {
      text: `选项A - ${voteId}`,
      odds: '1.85',
    },
    option2: {
      text: `选项B - ${voteId}`,
      odds: '1.95',
    },
    result: status === 'isEnd' ? {
      option1: Math.random() > 0.5 ? 'yes' : 'no',
      option2: Math.random() > 0.5 ? 'yes' : 'no',
    } : undefined,
    userBetRecords: userBetRecords.length > 0 ? userBetRecords : undefined,
  };
};

const VoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { initialState } = useModel('@@initialState');
  const isLoggedIn = !!initialState?.currentUser;
  
  const voteData = id ? getVoteDetail(id) : null;
  // 记录每个选项的是/否的下注金额
  const [betAmounts, setBetAmounts] = useState<{
    option1: { yes: number; no: number };
    option2: { yes: number; no: number };
  }>({
    option1: { yes: 0, no: 0 },
    option2: { yes: 0, no: 0 },
  });
  // 当前正在下注的选项和选择
  const [currentBet, setCurrentBet] = useState<{
    option: 'option1' | 'option2' | null;
    choice: 'yes' | 'no' | null;
    amount: number;
  }>({
    option: null,
    choice: null,
    amount: 0,
  });
  const [userBetRecords, setUserBetRecords] = useState<BetRecord[]>(voteData?.userBetRecords || []);

  if (!voteData) {
    return (
      <PageContainer>
        <div className={styles.container}>
          <Card>未找到投票详情</Card>
        </div>
      </PageContainer>
    );
  }

  const handleBack = () => {
    history.back();
  };

  // 处理下注按钮点击
  const handleBetClick = (option: 'option1' | 'option2', choice: 'yes' | 'no') => {
    if (!isLoggedIn) {
      message.warning('请先登录');
      history.push('/user/login');
      return;
    }
    setCurrentBet({ option, choice, amount: 0 });
  };

  // 确认下注
  const handleConfirmBet = () => {
    if (!currentBet.option || !currentBet.choice || !currentBet.amount || currentBet.amount <= 0) {
      message.warning('请输入下注金额');
      return;
    }

    const optionData = currentBet.option === 'option1' ? voteData.option1 : voteData.option2;
    const newRecord: BetRecord = {
      id: Date.now(),
      option: optionData.text,
      choice: currentBet.choice,
      amount: currentBet.amount,
      odds: optionData.odds,
      time: new Date().toISOString(),
      status: 'pending',
    };

    // 更新下注金额记录
    setBetAmounts((prev) => ({
      ...prev,
      [currentBet.option!]: {
        ...prev[currentBet.option!],
        [currentBet.choice]: prev[currentBet.option!][currentBet.choice] + currentBet.amount,
      },
    }));

    setUserBetRecords([...userBetRecords, newRecord]);
    message.success(`下注成功：${optionData.text} - ${currentBet.choice === 'yes' ? '是' : '否'}，金额：${currentBet.amount} USDT`);
    setCurrentBet({ option: null, choice: null, amount: 0 });
  };

  // 取消下注
  const handleCancelBet = () => {
    setCurrentBet({ option: null, choice: null, amount: 0 });
  };

  const statusConfig = {
    InProgress: { text: '进行中', className: styles.statusInProgress },
    isStart: { text: '即将开始', className: styles.statusIsStart },
    isEnd: { text: '已结束', className: styles.statusIsEnd },
  };

  const statusInfo = statusConfig[voteData.status];

  // 投注记录表格列
  const betRecordColumns = [
    {
      title: '选项',
      dataIndex: 'option',
      key: 'option',
    },
    {
      title: '预测',
      dataIndex: 'choice',
      key: 'choice',
      render: (choice: string) => choice === 'yes' ? '是' : '否',
    },
    {
      title: '下注金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount} USDT`,
    },
    {
      title: '赔率',
      dataIndex: 'odds',
      key: 'odds',
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    ...(voteData.status === 'isEnd' ? [{
      title: '结果',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'win') return <Tag color="green">获胜</Tag>;
        if (status === 'lose') return <Tag color="red">失败</Tag>;
        return <Tag>待定</Tag>;
      },
    }] : []),
  ];

  const handleGoToOrders = () => {
    history.push('/SportsLotteryHall/myOrders');
  };

  return (
    <div className={styles.container}>
      <PageBack title={'返回首页平台'} />
      <Card className={styles.statusCard}>
        <div className={styles.description}>{voteData.description}</div>
        <div className={`${styles.statusTag} ${statusInfo.className}`}>
          {statusInfo.text}
        </div>
        <div className={styles.tradeInfo}>
          <div className={styles.tradeItem}>
            <div className={styles.label}>总交易量 </div>
            <div className={styles.value}>${voteData.tradingVolume.toLocaleString()}</div>
          </div>
          <div className={styles.tradeItem}>
            <div className={styles.label}>截止日期</div>
            <div className={styles.value}>{new Date(voteData.endTime).toLocaleString('zh-CN')}</div>
          </div>
        </div>
      </Card>
      {/* 活动说明 */}
      <Card className={styles.statusCard}>
        <div className={styles.activityTitle}>活动说明</div>
        <div className={styles.activityDescription}>
          {voteData.activityDescription}
        </div>
      </Card>
      {/* 下注区域（进行中和即将开始时显示） */}
      {(voteData.status === 'InProgress' || voteData.status === 'isStart') && (
        <Card className={styles.detailCard} title="预测下注">
          <div className={styles.betSection}>
            {/* 选项1 */}
            <div className={styles.optionCard}>
              <div className={styles.optionHeader}>
                <div className={styles.optionTitle}>{voteData.option1.text}</div>
                <div className={styles.optionOdds}>赔率: {voteData.option1.odds}</div>
              </div>
              <div className={styles.choiceRow}>
                <div className={styles.choiceItem}>
                  <Button
                    type={currentBet.option === 'option1' && currentBet.choice === 'yes' ? 'primary' : 'default'}
                    size="large"
                    className={styles.choiceButton}
                    onClick={() => handleBetClick('option1', 'yes')}
                  >
                    是
                  </Button>
                  {betAmounts.option1.yes > 0 && (
                    <div className={styles.betAmountDisplay}>
                      已下注: {betAmounts.option1.yes.toFixed(2)} USDT
                    </div>
                  )}
                </div>
                <div className={styles.choiceItem}>
                  <Button
                    type={currentBet.option === 'option1' && currentBet.choice === 'no' ? 'primary' : 'default'}
                    size="large"
                    className={styles.choiceButton}
                    onClick={() => handleBetClick('option1', 'no')}
                  >
                    否
                  </Button>
                  {betAmounts.option1.no > 0 && (
                    <div className={styles.betAmountDisplay}>
                      已下注: {betAmounts.option1.no.toFixed(2)} USDT
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 选项2 */}
            <div className={styles.optionCard}>
              <div className={styles.optionHeader}>
                <div className={styles.optionTitle}>{voteData.option2.text}</div>
                <div className={styles.optionOdds}>赔率: {voteData.option2.odds}</div>
              </div>
              <div className={styles.choiceRow}>
                <div className={styles.choiceItem}>
                  <Button
                    type={currentBet.option === 'option2' && currentBet.choice === 'yes' ? 'primary' : 'default'}
                    size="large"
                    className={styles.choiceButton}
                    onClick={() => handleBetClick('option2', 'yes')}
                  >
                    是
                  </Button>
                  {betAmounts.option2.yes > 0 && (
                    <div className={styles.betAmountDisplay}>
                      已下注: {betAmounts.option2.yes.toFixed(2)} USDT
                    </div>
                  )}
                </div>
                <div className={styles.choiceItem}>
                  <Button
                    type={currentBet.option === 'option2' && currentBet.choice === 'no' ? 'primary' : 'default'}
                    size="large"
                    className={styles.choiceButton}
                    onClick={() => handleBetClick('option2', 'no')}
                  >
                    否
                  </Button>
                  {betAmounts.option2.no > 0 && (
                    <div className={styles.betAmountDisplay}>
                      已下注: {betAmounts.option2.no.toFixed(2)} USDT
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 下注金额输入区域 */}
            {currentBet.option && currentBet.choice && (
              <div className={styles.amountSection}>
                <div className={styles.amountTitle}>
                  为 {currentBet.option === 'option1' ? voteData.option1.text : voteData.option2.text} - {currentBet.choice === 'yes' ? '是' : '否'} 下注
                </div>
                <InputNumber
                  className={styles.amountInput}
                  min={0.01}
                  precision={2}
                  value={currentBet.amount}
                  onChange={(value) => setCurrentBet({ ...currentBet, amount: value || 0 })}
                  placeholder="请输入下注金额"
                />
                <div className={styles.amountInfo}>
                  预计收益：{currentBet.amount > 0 ? (currentBet.amount * parseFloat(currentBet.option === 'option1' ? voteData.option1.odds : voteData.option2.odds)).toFixed(2) : '0.00'} USDT
                </div>
                <div className={styles.betActions}>
                  <Button
                    type="primary"
                    size="large"
                    className={styles.confirmButton}
                    onClick={handleConfirmBet}
                    disabled={!currentBet.amount || currentBet.amount <= 0}
                  >
                    确认下注
                  </Button>
                  <Button
                    size="large"
                    className={styles.cancelButton}
                    onClick={handleCancelBet}
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 投注结果（已结束时显示） */}
      {voteData.status === 'isEnd' && voteData.result && (
        <Card className={styles.detailCard} title="投注结果">
          <div className={styles.resultSection}>
            <div className={styles.resultItem}>
              <div className={styles.resultLabel}>{voteData.option1.text}</div>
              <div className={styles.resultValue}>
                {voteData.result.option1 === 'yes' ? '是' : '否'}
              </div>
            </div>
            <div className={styles.resultItem}>
              <div className={styles.resultLabel}>{voteData.option2.text}</div>
              <div className={styles.resultValue}>
                {voteData.result.option2 === 'yes' ? '是' : '否'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 个人投注记录（进行中和已结束时显示，即将开始时不显示） */}
      {voteData.status !== 'isStart' && (
        <Card 
          className={styles.detailCard} 
          title="个人投注记录"
          extra={
            <Button type="link" onClick={handleGoToOrders}>
              查看全部订单
            </Button>
          }
        >
          {!isLoggedIn ? (
            <div className={styles.loginTip}>
              <p>请先登录查看个人投注记录</p>
              <Button type="primary" onClick={() => history.push('/user/login')}>
                立即登录
              </Button>
            </div>
          ) : userBetRecords.length > 0 ? (
            <Table
              columns={betRecordColumns}
              dataSource={userBetRecords}
              rowKey="id"
              pagination={false}
            />
          ) : (
            <div className={styles.emptyRecords}>暂无投注记录</div>
          )}
        </Card>
      )}
    </div>
  );
};

export default VoteDetail;
