import React, { useState } from 'react';
import { Button, Card, InputNumber, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import LineChart from '@/components/LineChart';
import RuleModal from '../RuleModal';
import ConfirmBetModal from '../ConfirmBetModal';
import BetSuccessModal from '../BetSuccessModal';
import { createAccount, updateAccount } from '@/services/account/api';
import mockUser from '@/mockData/users.json';
import { placeOrder } from '@/services/swagger/store';
import { currentUser as queryCurrentUser, updateCardData, getCardData } from '@/services/ant-design-pro/api';
import styles from './index.less';
import { VoteData, BetRecord, CurrentBet } from '../../types';

interface GuessDetailProps {
  voteData: VoteData;
}

const GuessDetail: React.FC<GuessDetailProps> = ({ voteData }) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const isLoggedIn = !!initialState?.currentUser;

  const [showRuleModal, setShowRuleModal] = useState(false);
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
  const [currentBet, setCurrentBet] = useState<CurrentBet>({
    option: null,
    choice: null,
    amount: 0,
  });

  const [userBetRecords, setUserBetRecords] = useState<BetRecord[]>(voteData?.userBetRecords || []);

  const statusConfig = {
    InProgress: { text: '进行中', className: styles.statusInProgress },
    isStart: { text: '即将开始', className: styles.statusIsStart },
    isEnd: { text: '已结束', className: styles.statusIsEnd },
  };

  const statusInfo = statusConfig[voteData.status];

  // 处理下注按钮点击
  const handleBetClick = (option: 'option1' | 'option2', choice: 'yes' | 'no') => {
    if (!isLoggedIn) {
      message.warning('请先登录');
      // history.push('/user/login');
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
  const handleConfirmOrder = async () => {
    if (!currentBet.option || !currentBet.choice || !currentBet.amount) {
      return;
    }
    
    // 生成16位随机订单ID
    let orderId = '';
    for (let i = 0; i < 16; i++) {
      orderId += Math.floor(Math.random() * 10);
    }

    const type = currentBet.option === 'option1' ? 'rise' : 'fall';
    const price = currentBet.option === 'option1' ? (voteData.rise || 0) : (voteData.fall || 0);
    const income = price > 0 ? (currentBet.amount / price) * 100 : 0;

    try {
      await placeOrder({
        id: initialState?.currentUser?.id,
        petId: orderId,
        quantity: currentBet.amount,
        shipDate: new Date().toISOString(),
        status: 'delivered',
        complete: false,
        category: 'guess',
        currency: voteData.coinName || 'Bitcoin',
        type,
        price,
        income,
      });

      // 投注成功后，更新赔率
      try {
        const cardId = (voteData._id || voteData.id) as string;
        await updateCardData({
          id: cardId, // 优先使用 _id (Mongo ObjectId), 兼容 id
          type: type // 'rise' or 'fall'
        });

        // 更新完成后，获取最新数据并更新页面
        const latestCardData = await getCardData({ id: cardId });
        if (latestCardData) {
           // 更新 voteData 对应的字段
           voteData.rise = latestCardData.rise;
           voteData.fall = latestCardData.fall;
           // 强制刷新组件（虽然 React 通常推荐 setState，但这里 voteData 是 props，
           // 理想做法是父组件 fetch 或使用 context/store，这里直接修改对象并不可取但为了快速生效暂且如此，
           // 更好的方式是通知父组件刷新，或者在这里使用 local state 覆盖显示）
           // 由于 props 是只读的，直接修改可能无效或报错，我们应该使用本地 state 来展示赔率
        }

      } catch (updateError) {
        console.error('Failed to update cards odds:', updateError);
        // 不阻断投注流程，仅记录错误
      }

    } catch (error) {
      console.error('Failed to place order:', error);
      message.error('投注失败，请重试');
      return;
    }

    // 投注成功后，更新账户信息
    if (initialState?.currentUser?.id) {
      try {
        const currentBalance = initialState.currentUser.balance || 0;
        const currentTotalBets = initialState.currentUser.total_bets || 0;

        await updateAccount(initialState.currentUser.id, {
          balance: currentBalance - currentBet.amount,
          total_bets: currentTotalBets + currentBet.amount,
        });

        // 刷新用户信息
        const userInfo = await queryCurrentUser();
        if (userInfo && userInfo.data) {
          setInitialState((s) => ({
            ...s,
            currentUser: userInfo.data,
          }));
        }
      } catch (err) {
        console.error('Failed to update account:', err);
      }
    }

    // 这里应该调用实际的API来提交投注
    // 模拟投注成功
    const optionText = currentBet.option === 'option1' ? voteData.option1?.text : voteData.option2?.text;
    const odds = currentBet.option === 'option1' ? voteData.option1?.odds : voteData.option2?.odds;
    
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
      option: optionText || '',
      choice: currentBet.choice,
      amount: currentBet.amount,
      odds: odds || '',
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
    if (!currentBet.amount) return 0;
    const price = currentBet.option === 'option1' ? (voteData.rise || 0) : (currentBet.option === 'option2' ? (voteData.fall || 0) : 0);
    if (price === 0) return 0;
    return (currentBet.amount / price) * 100;
  };

  // 快速加注
  const handleQuickAdd = (amount: number) => {
    setCurrentBet({ ...currentBet, amount: (currentBet.amount || 0) + amount });
  };

  // 计算平均价格
  const getAveragePrice = (): number => {
    if (currentBet.option === 'option1') {
      return voteData.rise || 0;
    }
    if (currentBet.option === 'option2') {
      return voteData.fall || 0;
    }
    return 0;
  };

  const handleGoToOrders = () => {
    history.push('/SportsLotteryHall/myOrders');
  };

  const renderUserBetRecords = () => {
    if (voteData.status !== 'isStart' && userBetRecords.length > 0) {
      return (
        <Card className={`${styles.CardBg} ${styles.statusCard} ${styles.betSectionCard}`} >
            <div className={styles.betSectionTitle}>
              个人投注记录
              <div className={styles.viewMore} onClick={handleGoToOrders}>查看更多
                <img src='/icons/Icon3.png' alt='' />
              </div>
            </div>
            <div className={styles.betSectionGroup}>
              {/* Mock records - in real app map through userBetRecords */}
              <div className={styles.betSectionItem}>
                <div>
                  <div className={styles.betSectionLabel}>以 0.44 价格投注了$15.25    900,000“是”</div>
                  <div className={styles.betSectionText}>2024-01-15 14:30:00</div>
                </div>
                <div>
                  <div className={styles.betSectionPrice}>$0.03</div>
                  <div className={`${styles.betSectionText} ${styles.betSectionState}`}>待开奖</div>
                </div>
              </div>
              <div className={styles.betSectionItem}>
                <div>
                  <div className={styles.betSectionLabel}>以 0.44 价格投注了$15.25    900,000“是”</div>
                  <div className={styles.betSectionText}>2024-01-15 14:30:00</div>
                </div>
                <div>
                  <div className={styles.betSectionPrice}>$0.03</div>
                  <div className={`${styles.betSectionText} ${styles.betSectionState}`}>待开奖</div>
                </div>
              </div>
            </div>
          </Card>
      );
    }
    return null;
  };

  return (
    <div className={styles.detailCard}>
      {/* Left Wrap */}
      <div className={styles.leftWrap}>
          <Card className={`${styles.CardBg} ${styles.statusCard}`}>
            <div className={styles.description}>{voteData.description}</div>
            <div className={`${styles.statusTag} ${statusInfo.className}`}>
              {statusInfo.text}
            </div>
            {voteData.status === 'InProgress' && <LineChart coinName={voteData.coinName || voteData.id.toString().split('-')[0]} />}
            <div className={styles.tradeInfo}>
              <div className={styles.tradeItem}>
                <div className={styles.tradeItemLabel}>总交易量</div>
                <div className={styles.tradeItemValue}>${voteData.tradingVolume.toLocaleString()}</div>
              </div>
              <div className={styles.tradeItem}>
                <div className={styles.tradeItemLabel}>截止日期</div>
                <div className={styles.tradeItemValue}>{new Date(voteData.endTime).toLocaleString('zh-CN')}</div>
              </div>
            </div>
          </Card>
          {/* 活动说明 */}
          <Card className={`${styles.CardBg} ${styles.statusCard}`}>
            <div className={styles.activityTitle}>活动说明</div>
            <div className={styles.activityDescription}>
              {voteData.activityDescription}
            </div>
          </Card>
          {/* 个人投注记录，暂时先隐藏 */}
          {/* {renderUserBetRecords()} */}
      </div>

      {/* Right Wrap (Betting Status Card) */}
      <div className={styles.bettingStatusCard}>
          {voteData.status !== 'isEnd' ?<Card className={`${styles.CardBg} ${styles.bettingResult}`}>
            <div className={styles.amountSection}>
              <div className={styles.betTitle}>请投注</div>
              {/* 选择是/否按钮 */}
              <div className={styles.choiceButtons}>
                  <div
            className={`${styles.choiceButton} ${currentBet.option === 'option1' ? styles.choiceButtonActive : ''}`}
            onClick={() => setCurrentBet({ ...currentBet, option: 'option1', choice: 'yes' })}
          >
            <span className={styles.choiceText}>涨</span>
            <span className={styles.choicePrice}>{voteData.rise || 0}¢</span>
          </div>
          <div
            className={`${styles.choiceButton} ${currentBet.option === 'option2' ? styles.choiceButtonNoActive : ''}`}
            onClick={() => setCurrentBet({ ...currentBet, option: 'option2', choice: 'no' })}
          >
            <span className={styles.choiceText}>跌</span>
            <span className={`${styles.choicePrice} ${styles.choicePriceNo}`}>{voteData.fall || 0}¢</span>
          </div>
                </div>
              <div className={styles.betAmountSection}>
                <div className={styles.betAmountLabel}>投注金额</div>
                <div className={styles.amountInputWrapper}>
                  <InputNumber
                    className={styles.amountInput}
                    min={0.01}
                    precision={2}
                    value={currentBet.amount}
                    onChange={(value) => setCurrentBet({ ...currentBet, amount: value || 0 })}
                    placeholder="请输入下注金额"
                    disabled={!isLoggedIn || voteData.status !== 'InProgress'}
                  />
                </div>
                <div className={styles.quickAddButtons}>
                  <button className={styles.quickAddBtn} onClick={() => handleQuickAdd(10)}>+ 10</button>
                  <button className={styles.quickAddBtn} onClick={() => handleQuickAdd(50)}>+ 50</button>
                  <button className={styles.quickAddBtn} onClick={() => handleQuickAdd(100)}>+ 100</button>
                  <button className={styles.quickAddBtn} onClick={() => handleQuickAdd(500)}>+ 500</button>
                </div>
              </div>

              {/* 收益信息 */}
              {currentBet.amount > 0 && (
                <div className={styles.winningsSection}>
                  <div className={styles.winningsAmount}>
                    ${calculateWinnings().toLocaleString()}
                  </div>
                  <div className={styles.averagePrice}>
                    平均价格 {getAveragePrice()} 美分 <img src='/icons/Icon13.png' alt=''/>
                  </div>
                </div>
              )}

              {/* 警告提示 */}
              <div className={styles.warningBox}>
                <ExclamationCircleOutlined className={styles.warningIcon} />
                <div className={styles.warningText}>
                  请投注前请仔细阅读<span onClick={() => setShowRuleModal(true)} style={{ cursor: 'pointer' }}>《平台条款与规则》</span>投注即表示您已同意相关条款。
                </div>
              </div>

              {/* 确认按钮 */}
              {!isLoggedIn ? (
                <Button
                  type="primary"
                  size="large"
                  className={styles.confirmBetButton}
                  onClick={async () => {
                    try {
                      await createAccount(mockUser);
                      setInitialState((s) => ({ 
                        ...s, 
                        currentUser: {
                          ...mockUser,
                          id: mockUser.id,
                          username: mockUser.name, 
                          email: '', 
                        } 
                      }));
                    } catch (error) {
                      console.error('Failed to create account:', error);
                    }
                  }}
                >
                  登录后投注
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  className={styles.confirmBetButton}
                  onClick={handleConfirmBetClick}
                  disabled={!currentBet.option || !currentBet.choice || !currentBet.amount || currentBet.amount <= 0}
                >
                  确认投注
                </Button>
              )}
            </div>
            </Card> : (
            <Card className={`${styles.CardBg} ${styles.bettingResult}`}>
              <div className={styles.bettingResultLabel}>
                <div className={styles.resultTitle}>投注结果</div>
                <div>此投注已结束并完成结算</div>
              </div>
              <div className={`${styles.resultSection} ${styles.resultSectionIsWin}`}>
                <div className={styles.resultSectionItem}>
                  <div className={styles.resultLeft}>
                    <img className={styles.resultOptionIcon} src="/icons/Icon8.png" alt="" />
                    <div className={styles.resultOptions}>
                      <div className={styles.resultOptionLabel}>
                        <img src="/icons/Icon10.png" alt="" />
                        90000
                      </div>
                      <div>是</div>
                    </div>
                  </div>
                  <div className={styles.resultType}><img className={styles.resultTypeIcon} src="/icons/Icon11.png" alt="" />获胜方</div>
                  <div className={styles.resultProbability}>
                    <div className={styles.resultNum}>56%</div>
                    <div>最终概率</div>
                  </div>
                </div>
                <div className={styles.bettingDetails}>
                  <div className={styles.bettingDetailsItem}>
                    <div className={styles.bettingDetailLabel}>¥89,200</div>
                    <div className={styles.bettingDetailText}>投注总额</div>
                  </div>
                  <div className={styles.bettingDetailsItem}>
                    <div className={styles.bettingDetailLabel}>432人</div>
                    <div className={styles.bettingDetailText}>参与人数</div>
                  </div>
                  <div className={styles.bettingDetailsItem}>
                    <div className={styles.bettingDetailLabel}>1.78x</div>
                    <div className={styles.bettingDetailText}>平均赔率</div>
                  </div>
                </div>
              </div>
              <div className={`${styles.resultSection} ${styles.resultSectionIsEnd}`}>
                <div className={styles.resultSectionItem}>
                  <div className={styles.resultLeft}>
                    <img className={styles.resultOptionIcon} src="/icons/Icon9.png" alt="" />
                    <div className={styles.resultOptions}>
                      <div className={styles.resultOptionLabel}>
                        <img src="/icons/Icon10.png" alt="" />
                        90000
                      </div>
                      <div>否</div>
                    </div>
                  </div>
                  <div className={styles.resultProbability}>
                    <div className={styles.resultNum}>44%</div>
                    <div>最终概率</div>
                  </div>
                </div>
                <div className={styles.bettingDetails}>
                  <div className={styles.bettingDetailsItem}>
                    <div className={styles.bettingDetailLabel}>¥89,200</div>
                    <div className={styles.bettingDetailText}>投注总额</div>
                  </div>
                  <div className={styles.bettingDetailsItem}>
                    <div className={styles.bettingDetailLabel}>432人</div>
                    <div className={styles.bettingDetailText}>参与人数</div>
                  </div>
                  <div className={styles.bettingDetailsItem}>
                    <div className={styles.bettingDetailLabel}>1.78x</div>
                    <div className={styles.bettingDetailText}>平均赔率</div>
                  </div>
                </div>
              </div>
              <div className={styles.tip}>
                <img src="/icons/Icon12.png" alt="" />
                <div className={styles.tipText}>
                  <div className={styles.title}>市场已结算</div>
                  <div>结算时间：2025-10-31 23:59:59</div>
                  <div>获胜方资金已自动发放至账户</div>
                </div>
              </div>
            </Card>
          )}
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
            value: currentBet.choice === 'yes' ? '涨' : '跌',
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

export default GuessDetail;
