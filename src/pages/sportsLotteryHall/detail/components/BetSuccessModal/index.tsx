import React from 'react';
import { Modal } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import styles from './index.less';

interface BetSuccessModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl?: string; // 可选的财神爷图片URL
}

const BetSuccessModal: React.FC<BetSuccessModalProps> = ({
  open,
  onClose,
  imageUrl,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={500}
      className={styles.betSuccessModal}
      maskClosable={false}
      centered
    >
      <div className={styles.modalContent}>
        <img className={styles.Caishen} src="/icons/Caishen.png" alt="" />
        <div className={styles.successMessage}>
          <img className={styles.trophyIcon} src="/icons/Icon14.png" alt="" />
          <span className={styles.successText}>投注成功!</span>
        </div>
        <div className={styles.hintText}>请等待开奖</div>
        <div className={styles.confirmButton} onClick={onClose}>
          好的, 我知道了
        </div>
      </div>
    </Modal>
  );
};

export default BetSuccessModal;
