import React, { useState } from 'react';
import { Button, Card, InputNumber, message, Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import RuleModal from '../RuleModal';
import ConfirmBetModal from '../ConfirmBetModal';
import BetSuccessModal from '../BetSuccessModal';
import { createAccount } from '@/services/account/api';
import mockUser from '@/mockData/users.json';
import styles from './index.less';
import { VoteData, BetRecord, CurrentBet } from '../../types';

interface MultipleDetailProps {
  voteData: VoteData;
}

const MultipleDetail: React.FC<MultipleDetailProps> = ({ voteData }) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const isLoggedIn = !!initialState?.currentUser;

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showConfirmBetModal, setShowConfirmBetModal] = useState(false);
  const [showBetSuccessModal, setShowBetSuccessModal] = useState(false);
  
  // Multiple 模式下，我们需要知道当前选中的是哪个 Option 对象
  const [selectedOption, setSelectedOption] = useState<any>(null);

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
    
    // 模拟投注成功
    const optionText = selectedOption ? selectedOption.name : '';
    // Multiple 模式下的 odds 可能在 option 对象里，或者固定
    const odds = '1.85'; // Mock odds for now as it wasn't clear in original code
    
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
    setSelectedOption(null);
  };

  // 处理返回修改
  const handleCancelConfirm = () => {
    setShowConfirmBetModal(false);
  };

  // 计算中奖金额
  const calculateWinnings = (): number => {
    if (!currentBet.amount) return 0;
    // Mock calculation
    const odds = 1.85; 
    return currentBet.amount * odds;
  };

  // 获取预测结果显示值
  const getPredictionValue = (): string => {
    if (selectedOption) {
       const name = selectedOption.name;
       return name.includes('以上') ? `↑ ${name}` : name.includes('以下') ? `↓ ${name}` : name;
    }
    return '';
  };

  // 快速加注
  const handleQuickAdd = (amount: number) => {
    setCurrentBet({ ...currentBet, amount: (currentBet.amount || 0) + amount });
  };

  // 获取当前选项的价格（美分）
  const getCurrentPrice = (choice: 'yes' | 'no'): number => {
    if (!currentBet.option) return 0;
    return choice === 'yes' ? 52.3 : 47.7;
  };

  // 计算平均价格
  const getAveragePrice = (): number => {
    return 0.3;
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
              <div className={styles.betSectionItem}>
                <div>
                  <div className={styles.betSectionItemLabel}>以 0.44 价格投注了$15.25    900,000“是”</div>
                  <div className={styles.betSectionItemText}>2024-01-15 14:30:00</div>
                </div>
                <div>
                  <div className={styles.betSectionItemPrice}>$0.03</div>
                  <div className={`${styles.betSectionItemText} ${styles.betSectionItemState}`}>待开奖</div>
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
            
            {['InProgress','isStart'].includes(voteData.status) && voteData.options && (
              <div className={styles.multipleOptionsCard} style={{ marginBottom: 20 }}>
                <div className={styles.forecastResultsTitle}>选择预测结果</div>
                <div className={styles.multipleOptionsList}>
                  {[...voteData.options]
                    .sort((a, b) => (b.tradingVolume || 0) - (a.tradingVolume || 0))
                    .map((opt, idx) => (
                      <div key={idx} className={styles.multipleOptionItem}>
                        <div className={styles.optionText}>{opt.name.includes('以上') ? `↑ ${opt.name}` : opt.name.includes('以下') ? `↓ ${opt.name}` : opt.name}</div>
                        <div className={styles.optionOdds}>概率: {opt.price}%</div>
                        <Space className={styles.buttonGroup}>
                          <div 
                            className={styles.btnYesDouble}
                            onClick={() => {
                              if (!isLoggedIn) {
                                message.warning('请先登录');
                                // history.push('/user/login');
                                return;
                              }
                              setSelectedOption(opt);
                              setCurrentBet({ 
                                option: 'option1', // Use 'option1' as placeholder to activate UI
                                choice: 'yes',
                                amount: 0 
                              });
                            }}
                          >
                            是
                          </div>
                          <div 
                            className={styles.btnNoDouble}
                            onClick={() => {
                               if (!isLoggedIn) {
                                message.warning('请先登录');
                                // history.push('/user/login');
                                return;
                              }
                               setSelectedOption(opt);
                               setCurrentBet({ 
                                option: 'option1',
                                choice: 'no',
                                amount: 0 
                              });
                            }}
                          >
                            否
                          </div>
                        </Space>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className={styles.tradeInfo}>
              <div className={styles.tradeItem}>
                <div className={styles.label}>总交易量</div>
                <div className={styles.value}>${voteData.tradingVolume.toLocaleString()}</div>
              </div>
              <div className={styles.tradeItem}>
                <div className={styles.label}>截止日期</div>
                <div className={styles.value}>{new Date(voteData.endTime).toLocaleString('zh-CN')}</div>
              </div>
            </div>
          </Card>

          <Card className={`${styles.CardBg} ${styles.statusCard}`}>
            <div className={styles.activityTitle}>活动说明</div>
            <div className={styles.activityDescription}>
              {voteData.activityDescription}
            </div>
          </Card>

          {renderUserBetRecords()}
      </div>

      {/* Right Wrap (Betting Status Card) */}
      <div className={styles.bettingStatusCard}>
          {voteData.status !== 'isEnd' ? <Card className={`${styles.CardBg} ${styles.bettingResult}`}>
            <div className={styles.amountSection}>
              <div className={styles.betTitle}>请投注</div>
              {currentBet.option && (
                <div className={styles.currentBetStats}>
                  <img className={styles.statsArrow} src="/icons/Icon10.png" alt="" />
                  <span className={styles.statsValue}>{getPredictionValue()}</span>
                </div>
              )}

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
                    className={`${styles.choiceButton} ${currentBet.choice === 'no' ? styles.choiceButtonNoActive : ''}`}
                    onClick={() => setCurrentBet({ ...currentBet, choice: 'no' })}
                  >
                    <span className={styles.choiceText}>否</span>
                    <span className={`${styles.choicePrice} ${styles.choicePriceNo}`}>{getCurrentPrice('no')}¢</span>
                  </div>
                </div>
              ) : (
                <div className={styles.choicePlaceholder}>
                  请先选择左侧列表中的投注选项
                </div>
              )}
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
                <div className={styles.label}>投注结果</div>
                <div>此投注已结束并完成结算</div>
              </div>
              {/* Multiple Mode End Result - Simplified for now as original code was shared */}
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

export default MultipleDetail;
