import React from 'react';
import { Modal } from 'antd';
import { CloseOutlined, ArrowUpOutlined } from '@ant-design/icons';
import styles from './index.less';

interface ConfirmBetModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  betAmount: number; // 投注金额
  predictionResult: {
    value: string; // 预测结果值，如 "¥ 1,000,000"
    choice: 'yes' | 'no'; // 选择的是/否
  };
  winnings: number; // 中奖可得金额
}

const ConfirmBetModal: React.FC<ConfirmBetModalProps> = ({
  open,
  onClose,
  onConfirm,
  onCancel,
  betAmount,
  predictionResult,
  winnings,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={448}
      className={styles.confirmBetModal}
      maskClosable={false}
    >
      <div className={styles.modalContent}>
        <div className={styles.closeButton} onClick={onClose}>
          <CloseOutlined />
        </div>
        <div className={styles.title}>请注意</div>
        <div className={styles.confirmText}>
          确认投注 <span className={styles.highlightAmount}>${betAmount}</span> 吗? 投注后不可撤销!
        </div>
        <div className={styles.infoSection}>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>预测结果</div>
            <div className={styles.infoValue}>
              {/* <ArrowUpOutlined className={styles.greenArrow} /> */}
              <span
                className={`${styles.choiceBadge} ${
                  predictionResult.choice === 'yes'
                    ? styles.choiceBadgeRise
                    : styles.choiceBadgeFall
                }`}
              >
                {predictionResult.value}
              </span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>投注金额</div>
            <div className={styles.infoValue}>${betAmount.toLocaleString()}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>中奖可得</div>
            <div className={`${styles.infoValue} ${styles.winningsValue}`}>${winnings.toLocaleString()}</div>
          </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.cancelButton} onClick={onCancel}>
            返回修改
          </div>
          <div className={styles.confirmButton} onClick={onConfirm}>
            确认下单
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmBetModal;
