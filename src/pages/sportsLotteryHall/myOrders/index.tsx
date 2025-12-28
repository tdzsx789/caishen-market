import PageBack from '@/components/PageBack'
import React, { useState,useEffect } from 'react';
import Card from './components/Card'
import RenderOrderCard from './components/RenderOrderCard'
import PaginationWithLoadMore from '../components/PaginationWithLoadMore';
import styles from './index.less';
// 模拟数据
const generatePendingOrders = (count: number) => {
  const isTime = Math.random();
  const status = isTime > 0.7 ? 'bet' :isTime > 0.5 ? 'win' : 'notWin';
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    voteTitle: `投票项目 ${index + 1}`,
    option: `选项${index % 2 === 0 ? 'A' : 'B'} - ${index + 1}`,
    choice: index % 2 === 0 ? '是' : '否',
    // 投注价格
    amount: Math.floor(Math.random() * 1000) + 100,
    //投注概率
    odds: (Math.random() * 2 + 1).toFixed(2),
    time: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    status,
  }));
};

const MyOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [pendingPage, setPendingPage] = useState<number>(1);

  // 模拟数据
  const allPendingOrders = generatePendingOrders(25);
  const stateList =[
    {
      title:'总投注',
      content:'$62.90',
      text:'累计投注金额',
      icon:'/icons/Container1.png'
    },
    {
      title:'总收益',
      content:'$37.50',
      text:'已获得收益',
      icon:'/icons/Container2.png'
    },
    {
      title:'胜率',
      content:'100%',
      text:'预测准确率',
      icon:'/icons/Container3.png'
    },
  ]
  const tabList=[
    {
      icon:'/icons/Icon6.png',
      title:'待开奖',
      num: Math.floor(Math.random() * 100),
    },
    {
      icon:'/icons/Icon7.png',
      title:'历史记录',
      num: Math.floor(Math.random() * 100),
    },
  ]
  useEffect(()=>{
    window.scrollTo(0,0)
  },[])

  return (
    <div className={styles.container}>
      <PageBack title={'返回首页平台'}  goBack={true} />
      <div className={styles.title}>我的投注订单</div>
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
        dataSource={allPendingOrders}
        pageSize={10}
        mobilePageSize={5}
        currentPage={pendingPage}
        onPageChange={(page) => setPendingPage(page)}
      >
        {(data) => (
          <div className={styles.cardList}>
            {data.map((order,index) => <RenderOrderCard order={order} key={index} />)}
          </div>
        )}
      </PaginationWithLoadMore>
    </div>
  );
};

export default MyOrders;
