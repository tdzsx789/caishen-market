import { Card, Space } from 'antd';
import { history } from '@umijs/max';
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import styles from './index.less';

interface VoteOption {
  text: string;
  odds: string;
}

interface VoteCardDoubleProps {
  data: {
    id: number | string;
    type?: string;
    title?: string;
    description: string;
    activityDescription?: string;
    tradingVolume: number; // 交易量
    endTime: string; // 结束时间
    status: 'InProgress' | 'isStart' | 'isEnd'; // 状态
    userBetStatus: boolean; // 用户投注状态
    option1: VoteOption;
    option2: VoteOption;
    rise?: number;
    fall?: number;
    result?: {
      option1: 'yes' | 'no' | null;
      option2: 'yes' | 'no' | null;
    };
  };
}

const VoteCardDouble: React.FC<VoteCardDoubleProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const handleCardClick = () => {
    // 通过 state 传递数据到详情页
    history.push({
      pathname: `/SportsLotteryHall/detail/${data.id}`,
    }, data);
  };

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const upOdds = data.rise !== undefined ? data.rise : parseFloat(data.option1.odds);
      const downOdds = data.fall !== undefined ? data.fall : parseFloat(data.option2.odds);
      const total = upOdds + downOdds;
      const upRatio = total > 0 ? upOdds / total : 0.5;
      const downRatio = total > 0 ? downOdds / total : 0.5;

      const option = {
        title: {
          text: upOdds >= downOdds ? '涨' : '跌',
          left: 'center',
          bottom: 0,
          textStyle: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: 600
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['170%', '200%'], // Increase radius to fill the height
            center: ['50%', '100%'], // Move center to bottom
            startAngle: 180,
            itemStyle: {
              borderRadius: 8
            },
            emphasis: {
              scale: false
            },
            label: {
              show: false
            },
            data: [
              {
                value: upRatio,
                itemStyle: { color: '#00A63E' }
              },
              {
                value: downRatio,
                itemStyle: { color: 'rgba(255, 77, 79, 0.5)' }
              },
              {
                // Hidden part for semi-circle
                value: 1,
                itemStyle: {
                  color: 'transparent',
                  opacity: 0
                }
              }
            ]
          }
        ]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [data.option1.odds, data.option2.odds, data.rise, data.fall]);
  
  const statusList ={
    InProgress: '进行中',
    isStart: '即将开始',
    isEnd: '已结束'
  }
  return (
    <Card className={styles.voteCard} onClick={handleCardClick}>
      <div className={styles.metaInfo}>
        {data.userBetStatus && <div className={styles.betStatus}>已投注</div>}
        <div className={styles[data.status]}>
          {statusList[data.status]}
        </div>
      </div>
      
      <div className={styles.contentRow}>
        <div className={styles.description}>{data.description}</div>
        <div className={styles.chartContainer} ref={chartRef}></div>
      </div>

      <div className={styles.doubleBetButtons}>
        <div className={styles.doubleButtonGreen}>
          <div className={styles.text}>涨</div>
          <div className={styles.odds}>{data.rise !== undefined ? data.rise : data.option1.odds}</div>
        </div>
        <div className={styles.doubleButtonRed}>
          <div className={styles.text}>跌</div>
          <div className={styles.odds}>{data.fall !== undefined ? data.fall : data.option2.odds}</div>
        </div>
      </div>
      <div className={styles.line}></div>
      <div className={styles.tradeVolume}>
        <div className={styles.text}><img src="/icons/Icon.png" alt="" />交易量</div>
        <div className={styles.number}>{data.tradingVolume.toLocaleString()}</div>
      </div>
      <div className={styles.tradeVolume}>
        <div className={styles.text}><img src="/icons/Icon1.png" alt="" />结束时间</div>
        <div className={styles.number}>{new Date(data.endTime).toLocaleString('zh-CN')}</div>
      </div>
    </Card>
  );
};

export default VoteCardDouble;
