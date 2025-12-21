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
        {/* 财神爷插图区域 */}
        <div className={styles.illustrationContainer}>
          <div className={styles.illustration}>
            {/* 装饰元素 - 星星 */}
            <div className={styles.sparkleLeft}></div>
            <div className={styles.sparkleRight}></div>
            {/* 装饰元素 - 圆点 */}
            <div className={styles.dotRed1}></div>
            <div className={styles.dotRed2}></div>
            <div className={styles.dotBlue}></div>
            {/* 财神爷主体 - 如果有图片则使用图片，否则使用CSS绘制 */}
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="财神爷" 
                className={styles.caishenImage}
              />
            ) : (
              <div className={styles.caishenCharacter}>
                <div className={styles.characterFace}>
                  <div className={styles.characterHat}>
                    <span className={styles.bitcoinSymbol}>₿</span>
                    <span className={styles.bitcoinSymbol}>₿</span>
                  </div>
                  <div className={styles.characterBody}>
                    <div className={styles.characterIngot}>元宝</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 成功消息 */}
        <div className={styles.successMessage}>
          <TrophyOutlined className={styles.trophyIcon} />
          <span className={styles.successText}>投注成功!</span>
        </div>

        {/* 提示文字 */}
        <div className={styles.hintText}>请等待开奖</div>

        {/* 确认按钮 */}
        <button className={styles.confirmButton} onClick={onClose}>
          好的, 我知道了
        </button>
      </div>
    </Modal>
  );
};

export default BetSuccessModal;
