import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Space, message, Input, InputNumber, Table, Tag, Radio } from 'antd';
import { ArrowUpOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { history, useParams, useModel, useLocation } from '@umijs/max';
import PageBack from '@/components/PageBack'
import RuleModal from './components/RuleModal'
import ConfirmBetModal from './components/ConfirmBetModal'
import BetSuccessModal from './components/BetSuccessModal'
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
  const isTime = 0.8;
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
  const [showConfirmBetModal, setShowConfirmBetModal] = useState(false);
  const [showBetSuccessModal, setShowBetSuccessModal] = useState(false);
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

  // 处理确认下注按钮点击
  const handleConfirmBetClick = () => {
    if (!currentBet.amount || currentBet.amount <= 0) {
      message.warning('请输入有效的投注金额');
      return;
    }
    if (!currentBet.option || !currentBet.choice) {
      message.warning('请先选择投注选项');
      return;
    }
    setShowConfirmBetModal(true);
  };

  // 处理确认下单
  const handleConfirmOrder = () => {
    if (!currentBet.option || !currentBet.choice || !currentBet.amount) {
      return;
    }
    
    // 这里应该调用实际的API来提交投注
    // 模拟投注成功
    const optionText = currentBet.option === 'option1' ? voteData.option1.text : voteData.option2.text;
    const odds = currentBet.option === 'option1' ? voteData.option1.odds : voteData.option2.odds;
    
    // 更新投注金额记录
    setBetAmounts(prev => ({
      ...prev,
      [currentBet.option!]: {
        ...prev[currentBet.option!],
        [currentBet.choice!]: prev[currentBet.option!][currentBet.choice!] + currentBet.amount
      }
    }));

    // 添加投注记录
    const newBetRecord: BetRecord = {
      id: Date.now(),
      option: optionText,
      choice: currentBet.choice,
      amount: currentBet.amount,
      odds: odds,
      time: new Date().toISOString(),
      status: 'pending',
    };
    setUserBetRecords(prev => [...prev, newBetRecord]);

    // 关闭确认弹窗，显示成功弹窗
    setShowConfirmBetModal(false);
    setShowBetSuccessModal(true);
    setCurrentBet({ option: null, choice: null, amount: 0 });
  };

  // 处理返回修改
  const handleCancelConfirm = () => {
    setShowConfirmBetModal(false);
  };

  // 计算中奖金额
  const calculateWinnings = (): number => {
    if (!currentBet.amount || !currentBet.option) return 0;
    const odds = currentBet.option === 'option1' ? parseFloat(voteData.option1.odds) : parseFloat(voteData.option2.odds);
    return currentBet.amount * odds;
  };

  // 获取预测结果显示值
  const getPredictionValue = (): string => {
    // 这里可以根据实际需求返回预测结果的显示值
    // 暂时返回一个示例值
    return `¥ ${voteData.tradingVolume.toLocaleString()}`;
  };

  // 快速加注
  const handleQuickAdd = (amount: number) => {
    setCurrentBet({ ...currentBet, amount: (currentBet.amount || 0) + amount });
  };

  // 获取当前选项的价格（美分）
  const getCurrentPrice = (choice: 'yes' | 'no'): number => {
    if (!currentBet.option) return 0;
    // 这里可以根据实际逻辑计算价格，暂时返回示例值
    return choice === 'yes' ? 52.3 : 47.7;
  };

  // 计算平均价格
  const getAveragePrice = (): number => {
    // 这里可以根据实际逻辑计算平均价格，暂时返回示例值
    return 0.3;
  };

  // 计算赔率显示
  const getOddsDisplay = (): string => {
    if (!currentBet.option) return '1:1.0';
    const odds = currentBet.option === 'option1' ? parseFloat(voteData.option1.odds) : parseFloat(voteData.option2.odds);
    return `1:${odds.toFixed(1)}`;
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
                  <div className={styles.yewBtn} onClick={() => handleBetClick('option1', 'yes')}>{betAmounts.option1.yes}¢</div>
                </div>
                <div className={styles.tableTRItem}>
                  <div className={styles.noBtn} onClick={() => handleBetClick('option1', 'no')}>{betAmounts.option1.no}¢</div>
                </div>
              </div>
              <div className={styles.tableTR}>
                <div className={styles.tableTRItem1}>{voteData.option2.text}</div>
                <div className={styles.tableTRItem2}>{voteData.option2.odds}</div>
                <div className={`${styles.tableTRItem}`}>
                  <div className={styles.yewBtn} onClick={() => handleBetClick('option2', 'yes')}>{betAmounts.option2.yes}¢</div>
                </div>
                <div className={styles.tableTRItem}>
                  <div className={styles.noBtn} onClick={() => handleBetClick('option2', 'no')}>{betAmounts.option2.no}¢</div>
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
              <div className={styles.betTitle}>请投注</div>
              
              {/* 当前投注统计 */}
              <div className={styles.currentBetStats}>
                <ArrowUpOutlined className={styles.statsArrow} />
                <span className={styles.statsValue}>900,000</span>
              </div>

              {/* 选择是/否按钮 */}
              {currentBet.option ? (
                <div className={styles.choiceButtons}>
                  <div
                    className={`${styles.choiceButton} ${currentBet.choice === 'yes' ? styles.choiceButtonActive : ''}`}
                    onClick={() => setCurrentBet({ ...currentBet, choice: 'yes' })}
                  >
                    <span className={styles.choiceText}>是</span>
                    <span className={styles.choicePrice}>{getCurrentPrice('yes')}¢</span>
                  </div>
                  <div
                    className={`${styles.choiceButton} ${currentBet.choice === 'no' ? styles.choiceButtonActive : ''}`}
                    onClick={() => setCurrentBet({ ...currentBet, choice: 'no' })}
                  >
                    <span className={styles.choiceText}>否</span>
                    <span className={`${styles.choicePrice} ${styles.choicePriceNo}`}>{getCurrentPrice('no')}¢</span>
                  </div>
                </div>
              ) : (
                <div className={styles.choicePlaceholder}>
                  请先选择左侧表格中的投注选项
                </div>
              )}

              {/* 投注金额 */}
              <div className={styles.betAmountSection}>
                <div className={styles.betAmountLabel}>投注金额</div>
                <div className={styles.amountInputWrapper}>
                  <span className={styles.amountPrefix}>$</span>
                  <InputNumber
                    className={styles.amountInput}
                    min={0.01}
                    precision={2}
                    value={currentBet.amount}
                    onChange={(value) => setCurrentBet({ ...currentBet, amount: value || 0 })}
                    placeholder="请输入下注金额"
                  />
                </div>
                {/* 快速加注按钮 */}
                <div className={styles.quickAddButtons}>
                  <button className={styles.quickAddBtn} onClick={() => handleQuickAdd(10)}>+ 10</button>
                  <button className={styles.quickAddBtn} onClick={() => handleQuickAdd(50)}>+ 50</button>
                  <button className={styles.quickAddBtn} onClick={() => handleQuickAdd(100)}>+ 100</button>
                  <button className={styles.quickAddBtn} onClick={() => handleQuickAdd(500)}>+ 500</button>
                </div>
              </div>

              {/* 收益信息 */}
              <div className={styles.winningsSection}>
                <div className={styles.winningsLabel}>赢</div>
                <div className={styles.winningsContent}>
                  <div className={styles.winningsAmount}>
                    ${currentBet.amount > 0 ? calculateWinnings().toLocaleString() : '0'}
                  </div>
                  <div className={styles.oddsDisplay}>{getOddsDisplay()}</div>
                </div>
                <div className={styles.averagePrice}>
                  平均价格 {getAveragePrice()} 美分 <span className={styles.infoIcon}>①</span>
                </div>
              </div>

              {/* 警告提示 */}
              <div className={styles.warningBox}>
                <ExclamationCircleOutlined className={styles.warningIcon} />
                <div className={styles.warningText}>
                  请投注前请仔细阅读《平台条款与规则》投注即表示您已同意相关条款。
                </div>
              </div>

              {/* 确认按钮 */}
              <Button
                type="primary"
                size="large"
                className={styles.confirmBetButton}
                onClick={handleConfirmBetClick}
              >
                确认投注
              </Button>
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
      {currentBet.option && currentBet.choice && (
        <ConfirmBetModal
          open={showConfirmBetModal}
          onClose={() => setShowConfirmBetModal(false)}
          onConfirm={handleConfirmOrder}
          onCancel={handleCancelConfirm}
          betAmount={currentBet.amount}
          predictionResult={{
            value: getPredictionValue(),
            choice: currentBet.choice,
          }}
          winnings={calculateWinnings()}
        />
      )}
      <BetSuccessModal
        open={showBetSuccessModal}
        onClose={() => setShowBetSuccessModal(false)}
      />
    </div>
  );
};

export default VoteDetail;
