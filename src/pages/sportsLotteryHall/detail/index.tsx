import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Space, message, Input, InputNumber, Table, Tag, Radio } from 'antd';
import { history, useParams, useModel, useLocation } from '@umijs/max';
import PageBack from '@/components/PageBack'
import RuleModal from './components/RuleModal'
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
  const isTime = 0.5;
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
  const [showRuleModal, setShowRuleModal] = useState(true);
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
          <Card>暂无数据</Card>
        </div>
      </PageContainer>
    );
  }

  // 处理下注按钮点击
  const handleBetClick = (option: 'option1' | 'option2', choice: 'yes' | 'no') => {
    if (!isLoggedIn) {
      message.warning('请先登录');
      history.push('/user/login');
      return;
    }
    setCurrentBet({ option, choice, amount: 0 });
  };
  

  const statusConfig = {
    InProgress: { text: '进行中', className: styles.statusInProgress },
    isStart: { text: '即将开始', className: styles.statusIsStart },
    isEnd: { text: '已结束', className: styles.statusIsEnd },
  };

  const statusInfo = statusConfig[voteData.status];

  const handleGoToOrders = () => {
    history.push('/SportsLotteryHall/myOrders');
  };

  return (
    <div className={styles.container}>
      <PageBack title={'返回首页平台'} />
      <div className={styles.detailCard}>
        <div>
          <Card className={`${styles.CardBg} ${styles.statusCard}`}>
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
          {['InProgress','isStart'].includes(voteData.status) && (
            <Card className={`${styles.statusCard} ${styles.CardBg} ${styles.forecastResultsCard}`}>
              <div className={styles.forecastResultsTitle}>选择预测结果</div>
              <div className={styles.tableTH}>
                <div className={styles.tableTHItem1}>结果</div>
                <div className={styles.tableTHItem2}>概率</div>
                <div className={styles.tableTHItem} style={{color:'#00C950'}}>是</div>
                <div className={styles.tableTHItem} style={{color:'#FB2C36'}}>否</div>
              </div>
              <div className={styles.line}></div>
              <div className={styles.tableTR}>
                <div className={styles.tableTRItem1}>{voteData.option1.text}</div>
                <div className={styles.tableTRItem2}>{voteData.option1.odds}</div>
                <div className={`${styles.tableTRItem}`}>
                  <div className={styles.yewBtn}>{betAmounts.option1.yes}¢</div>
                </div>
                <div className={styles.tableTRItem}>
                  <div className={styles.noBtn}>{betAmounts.option1.no}¢</div>
                </div>
              </div>
              <div className={styles.tableTR}>
                <div className={styles.tableTRItem1}>{voteData.option2.text}</div>
                <div className={styles.tableTRItem2}>{voteData.option2.odds}</div>
                <div className={`${styles.tableTRItem}`}>
                  <div className={styles.yewBtn}>{betAmounts.option2.yes}¢</div>
                </div>
                <div className={styles.tableTRItem}>
                  <div className={styles.noBtn}>{betAmounts.option2.no}¢</div>
                </div>
              </div>
            </Card>
          )}
          {/* 活动说明 */}
          <Card className={`${styles.CardBg} ${styles.statusCard}`}>
            <div className={styles.activityTitle}>活动说明</div>
            <div className={styles.activityDescription}>
              {voteData.activityDescription}
            </div>
          </Card>
          {/* 个人投注记录（进行中和已结束时显示，即将开始时不显示） */}
          {voteData.status !== 'isStart' && userBetRecords.length > 0 && <Card className={`${styles.CardBg} ${styles.statusCard} ${styles.betSectionCard}`} >
            <div className={styles.betSectionTitle}>
              个人投注记录
              <div className={styles.viewMore} onClick={handleGoToOrders}>查看更多
                <img src='/icons/Icon3.png' alt='' />
              </div>
            </div>
            <div className={styles.betSectionGroup}>
              <div className={styles.betSectionItem}>
                <div>
                  <div className={styles.label}>以 0.44 价格投注了$15.25    900,000“是”</div>
                  <div className={styles.text}>2024-01-15 14:30:00</div>
                </div>
                <div>
                  <div className={styles.price}>$0.03</div>
                  <div className={`${styles.text} ${styles.state}`}>待开奖</div>
                </div>
              </div>
              <div className={styles.betSectionItem}>
                <div>
                  <div className={styles.label}>以 0.44 价格投注了$15.25    900,000“是”</div>
                  <div className={styles.text}>2024-01-15 14:30:00</div>
                </div>
                <div>
                  <div className={styles.price}>$0.03</div>
                  <div className={`${styles.text} ${styles.state}`}>待开奖</div>
                </div>
              </div>
            </div>
          </Card>}
        </div>
        <div className={styles.bettingStatusCard}>
          {voteData.status !== 'isEnd' ?<Card className={`${styles.CardBg} ${styles.bettingResult}`}>
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
                {/* <Button
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
                </Button> */}
              </div>
            </div>
          </Card> : (
            <Card className={`${styles.CardBg} ${styles.bettingResult}`}>
              <div className={styles.bettingResultLabel}>
                <div className={styles.label}>投注结果</div>
                <div>此投注已结束并完成结算</div>
              </div>
              <div className={`${styles.resultSection} ${styles.resultSectionIsWin}`}>
                <div className={styles.resultSectionItem}>
                  <div className={styles.left}>
                    <img className={styles.icon} src="/icons/Icon8.png" alt="" />
                    <div className={styles.options}>
                      <div className={styles.label}>
                        <img src="/icons/Icon10.png" alt="" />
                        90000
                      </div>
                      <div>是</div>
                    </div>
                  </div>
                  <div className={styles.type}><img className={styles.icon} src="/icons/Icon11.png" alt="" />获胜方</div>
                  <div className={styles.probability}>
                    <div className={styles.num}>56%</div>
                    <div>最终概率</div>
                  </div>
                </div>
                <div className={styles.bettingDetails}>
                  <div className={styles.bettingDetailsItem}>
                    <div className={styles.label}>¥89,200</div>
                    <div className={styles.text}>投注总额</div>
                  </div>
                  <div className={styles.bettingDetailsItem}>
                    <div className={styles.label}>432人</div>
                    <div className={styles.text}>参与人数</div>
                  </div>
                  <div className={styles.bettingDetailsItem}>
                    <div className={styles.label}>1.78x</div>
                    <div className={styles.text}>平均赔率</div>
                  </div>
                </div>
              </div>
              <div className={`${styles.resultSection} ${styles.resultSectionIsEnd}`}>
                <div className={styles.resultSectionItem}>
                  <div className={styles.left}>
                    <img className={styles.icon} src="/icons/Icon9.png" alt="" />
                    <div className={styles.options}>
                      <div className={styles.label}>
                        <img src="/icons/Icon10.png" alt="" />
                        90000
                      </div>
                      <div>否</div>
                    </div>
                  </div>
                  <div className={styles.probability}>
                    <div className={styles.num}>44%</div>
                    <div>最终概率</div>
                  </div>
                </div>
                <div className={styles.bettingDetails}>
                  <div className={styles.bettingDetailsItem}>
                    <div className={styles.label}>¥89,200</div>
                    <div className={styles.text}>投注总额</div>
                  </div>
                  <div className={styles.bettingDetailsItem}>
                    <div className={styles.label}>432人</div>
                    <div className={styles.text}>参与人数</div>
                  </div>
                  <div className={styles.bettingDetailsItem}>
                    <div className={styles.label}>1.78x</div>
                    <div className={styles.text}>平均赔率</div>
                  </div>
                </div>
              </div>
              <div className={styles.tip}>
                <img src="/icons/Icon12.png" alt="" />
                <div className={styles.text}>
                  <div className={styles.title}>市场已结算</div>
                  <div>结算时间：2025-10-31 23:59:59</div>
                  <div>获胜方资金已自动发放至账户</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
      <RuleModal open={showRuleModal} onClose={() => setShowRuleModal(false)} />
    </div>
  );
};

export default VoteDetail;
