import React from 'react';
import { Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import styles from './index.less';

interface RuleModalProps {
  open: boolean;
  onClose: () => void;
}

const RuleModal: React.FC<RuleModalProps> = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={600}
      className={styles.ruleModal}
      maskClosable={false}
    >
      <div className={styles.modalContent}>
        <div className={styles.closeButton} onClick={onClose}>
          <CloseOutlined />
        </div>
        <div className={styles.title}>平台条款与规则</div>
        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>1. 投注规则</div>
            <div className={styles.sectionText}>
              用户需使用平台积分进行投注，积分仅用于娱乐竞猜，不具有现金价值
            </div>
            <div className={styles.sectionText}>
              投注一经确认即锁定赔率，活动结束前无法撤销
            </div>
            <div className={styles.sectionText}>
              固定赔率模式：投注时锁定赔率，不受后续投注影响
            </div>
            <div className={styles.sectionText}>
              动态赔率模式：赔率会根据实时投注情况动态调整，投注时锁定当前赔率
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>2. 结算规则</div>
            <div className={styles.sectionText}>
              活动结束后，系统将根据实际结果自动结算
            </div>
            <div className={styles.sectionText}>
              猜中用户将按锁定倍数获得积分奖励，积分自动到账
            </div>
            <div className={styles.sectionText}>
              未猜中用户的投注积分不予退还
            </div>
            <div className={styles.sectionText}>
              如遇特殊情况无法判定结果，平台将全额退还所有用户的投注积分
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>3. 平台责任</div>
            <div className={styles.sectionText}>
              平台采用无限奖池模式，保证所有中奖用户都能按锁定倍数获得奖励
            </div>
            <div className={styles.sectionText}>
              平台保证公平、公正、公开的结算流程
            </div>
            <div className={styles.sectionText}>
              平台有权拒绝或撤销任何涉嫌作弊、违规的投注
            </div>
            <div className={styles.sectionText}>
              平台不对投注决策提供任何建议，用户需自行承担投注风险
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>4. 用户责任</div>
            <div className={styles.sectionText}>
              用户应理性娱乐，合理使用平台积分
            </div>
            <div className={styles.sectionText}>
              用户不得利用技术手段干扰平台正常运营
            </div>
            <div className={styles.sectionText}>
              用户不得将账户借予他人使用
            </div>
            <div className={styles.sectionText}>
              用户应妥善保管账户信息，因账户泄露造成的损失由用户自行承担
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>5. 免责声明</div>
            <div className={styles.sectionText}>
              本平台仅供娱乐，所有竞猜活动均为虚拟积分游戏
            </div>
            <div className={styles.sectionText}>
              平台积分不可兑换现金或其他实物奖励
            </div>
            <div className={styles.sectionText}>
              本平台不涉及任何形式的赌博或非法活动
            </div>
            <div className={styles.sectionText}>
              使用本平台即表示您已阅读并同意以上条款
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.confirmButton} onClick={onClose}>
            我已知晓
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RuleModal;
