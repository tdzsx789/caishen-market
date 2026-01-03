import styles from './index.less';

interface OrderRecord {
  id: number;
  voteTitle: string;
  option: string;
  choice: string;
  amount: number;
  odds: string;
  time: string;
  status: 'bet' | 'win' | 'notWin';
}
// 渲染订单卡片
  const RenderOrderCard = (props: {order: OrderRecord}) => {
    const {order} = props;
    const odds = parseFloat(order.odds);
    const potentialReturn = order.amount * odds; // 潜在收益
    const potentialProfit = potentialReturn - order.amount; // 潜在利润
    const typeConfig = {
      bet: { text: '待开奖',class: 'betClass',icon:'' },
      win: { text: '已中奖',class: 'winClass',icon:'/icons/Icon5.png' },
      notWin: { text: '未中奖',class: 'notWinClass',icon: '/icons/Icon4.png' },
    };

    return (
      <div className={styles.orderdiv}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            {order.voteTitle}
            <div className={`${styles.tag} ${styles[typeConfig[order.status].class]}`}>
              {typeConfig[order.status].icon && <img src={typeConfig[order.status].icon} alt="icon" />}
              {typeConfig[order.status].text}
            </div>
          </div>
          <div className={styles.optionItem}>
            <div className={`${styles.choice} ${order.choice === '涨' ? styles.rise : (order.choice === '跌' ? styles.fall : '')}`}>{order.choice}</div>
            {order.option}
          </div>
        </div>
        <div className={styles.line} />
        <div className={styles.cardContent}>
          <div className={styles.cardItem}>
            <div className={styles.label}>投注价格</div>
            <div className={styles.value}>{order.amount}</div>
          </div>
          <div className={styles.cardItem}>
            <div className={styles.label}>投注本金</div>
            <div className={styles.value}>{order.amount}</div>
          </div>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardItem}>
            <div className={styles.label}>潜在收益</div>
            <div className={styles.value}>{potentialReturn.toFixed(2)}</div>
          </div>
          <div className={styles.cardItem}>
            <div className={styles.label}>潜在利润</div>
            <div className={styles.value}>{potentialProfit.toFixed(2)}</div>
          </div>
        </div>
        <div className={styles.line} />
        <div className={styles.time}>
          投注时间:<span>{new Date(order.time).toLocaleString('zh-CN')}</span>
        </div>
      </div>
    );
  };
export default RenderOrderCard;
