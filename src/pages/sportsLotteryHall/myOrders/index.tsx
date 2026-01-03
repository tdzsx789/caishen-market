import PageBack from '@/components/PageBack'
import React, { useState,useEffect } from 'react';
import { useModel } from '@umijs/max';
import Card from './components/Card'
import BackToTop from '@/components/BackToTop'
import RenderOrderCard from './components/RenderOrderCard'
import PaginationWithLoadMore from '../components/PaginationWithLoadMore';
import styles from './index.less';
import { getOrders } from '@/services/ant-design-pro/api';

const MyOrders: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [activeTab, setActiveTab] = useState<number>(1);
  const [currency, setCurrency] = useState<string>('all');
  const [pendingPage, setPendingPage] = useState<number>(1);
  const [orders, setOrders] = useState<any[]>([]);

  const currentUser = initialState?.currentUser;

  useEffect(() => {
    const fetchOrders = async () => {
      if (currentUser?.id) {
        try {
          const res = await getOrders({ id: currentUser.id, currency });
          if (res.success && res.data) {
            const mappedOrders = res.data.map((order: any) => ({
              id: order._id,
              voteTitle: '竞猜项目', // 暂时使用固定标题，因为后端Order模型未存储项目名称
              option: order.type === 'rise' ? '看涨' : (order.type === 'fall' ? '看跌' : '未知'),
              choice: order.type === 'rise' ? '涨' : (order.type === 'fall' ? '跌' : '未知'),
              amount: order.quantity,
              odds: (order.income && order.quantity) ? (order.income / order.quantity).toFixed(2) : (order.price ? order.price.toFixed(2) : '1.00'),
              time: order.shipDate,
              status: order.complete ? (order.income > 0 ? 'win' : 'notWin') : 'bet', // 根据 complete 和 income 判断状态
              complete: order.complete, // 添加 complete 字段用于过滤
            })).sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
            setOrders(mappedOrders);
          }
        } catch (error) {
          console.error('Failed to fetch orders', error);
        }
      }
    };
    fetchOrders();
  }, [currentUser?.id, currency]);

  const currencyList = [
    { key: 'all', label: '全部', icon: '/icons/pajamas_earth.svg' },
    { key: 'Bitcoin', label: 'Bitcoin', icon: '/icons/formkit_bitcoin.svg' },
    { key: 'Ethereum', label: 'Ethereum', icon: '/icons/picon_ethereum.svg' },
    { key: 'Caishen', label: 'Caishen', icon: '/icons/token_solana.svg' },
    { key: 'TBC', label: 'TBC', icon: '/icons/Vector.svg' },
  ];

  const stateList =[
    {
      title:'总投注',
      content:`$${(currentUser?.total_bets || 0).toFixed(2)}`,
      text:'累计投注金额',
      icon:'/icons/Container1.png'
    },
    {
      title:'总收益',
      content:`$${(currentUser?.total_income || 0).toFixed(2)}`,
      text:'已获得收益',
      icon:'/icons/Container2.png'
    },
    {
      title:'胜率',
      content:`${(currentUser?.win_rate || 0).toFixed(2)}%`,
      text:'预测准确率',
      icon:'/icons/Container3.png'
    },
  ]
  const pendingOrders = orders.filter(order => !order.complete);
  const dataSource = activeTab === 1 ? pendingOrders : orders;

  const tabList=[
    {
      icon:'/icons/Icon6.png',
      title:'待开奖',
      num: pendingOrders.length,
    },
    {
      icon:'/icons/Icon7.png',
      title:'历史记录',
      num: orders.length,
    },
  ]
  useEffect(()=>{
    window.scrollTo(0,0)
  },[])

  return (
    <div className={styles.container}>
      <PageBack title={'返回首页平台'}  goBack={true} />
      <div className={styles.title}>我的投注订单</div>
      <div className={styles.currencyTabGroup}>
        {currencyList.map((item) => (
          <div 
            key={item.key} 
            className={`${styles.tabItem} ${item.key === currency && styles.activeItem}`} 
            onClick={() => setCurrency(item.key)}
          >
            <img src={item.icon} alt="icon" className={styles.icon} />
            <div className={styles.text}>{item.label}</div>
          </div>
        ))}
      </div>
      <div className={styles.stateRow}>
        {stateList.map((item,index) =>  <Card key={index} item={item} />)}
      </div>
      <div className={styles.tabGroup}>
        {tabList.map((item,index) => (
          <div key={index} className={`${styles.tabItem} ${Number(index + 1) === activeTab && styles.activeItem}`} onClick={() => setActiveTab(index+1)}>
            <img src={item.icon} alt="icon" />{item.title}<div className={styles.num}>{item.num}</div>
          </div>
        ))}
      </div>
      <PaginationWithLoadMore
        dataSource={dataSource}
        pageSize={10}
        mobilePageSize={5}
        currentPage={pendingPage}
        onPageChange={(page) => setPendingPage(page)}
      >
        {(data: any[]) => (
          <div className={styles.cardList}>
            {data.map((order,index) => <RenderOrderCard order={order} key={index} />)}
          </div>
        )}
      </PaginationWithLoadMore>
      <BackToTop />
    </div>
  );
};

export default MyOrders;
