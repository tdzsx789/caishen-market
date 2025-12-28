import { useEffect, useState, memo, useRef } from "react";
import axios from "axios";
import * as echarts from "echarts";
import styles from "./index.less";
// import { xAxisData } from "./data";

const url = 'https://tsanghi.com/api';

const originOption = {
  grid: {
    left: 0,
    right: 20,
    top: 20,
    bottom: 0,
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    // data: xAxisData,
    axisLabel: {
      show: true,
      fontSize: 12,
      color: "#fff",
      opacity: 0.7
    },
  },
  yAxis: {
    type: "value",
    splitLine: {
      show: false,
    },
    axisLabel: {
      show: true,
      fontSize: 12,
      color: "#fff",
      opacity: 0.7
    },
    // max: 0
  },
  series: [
    {
      data: [],
      type: "line",
      smooth: true,
      showSymbol: false,
      lineStyle: {
        color: "rgb(127,144,248)",
        width: 4,
      },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: "rgb(71,89,206)", // 0% 处的颜色
            },
            {
              offset: 1,
              color: "rgba(71,89,206,0)", // 100% 处的颜色
            },
          ],
          global: false, // 缺省为 false
        },
      },
    },
  ],
  animationDuration: 1000,
};

const tikerObj = {
  Bitcoin: 'BTC/USD',
  Ethereum: 'ETH/USD',
}

const App = memo(function App({ code, coinName }) {
  const ref1 = useRef();
  const chartRef1 = useRef();
  const [data1, setData1] = useState([]);
  const [xAxisData, setXAxisData] = useState([]);
  const lastPriceRef = useRef(null);
  const [currentTime, setCurrentTime] = useState({ h: '--', m: '--', s: '--' });

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Convert to Beijing Time (UTC+8)
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const beijingTime = new Date(utc + (3600000 * 8));
      
      const pad = (n) => n < 10 ? '0' + n : n;
      setCurrentTime({
        h: pad(beijingTime.getHours()),
        m: pad(beijingTime.getMinutes()),
        s: pad(beijingTime.getSeconds())
      });
    };
    
    updateTime(); // Initial call
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync ref with data1
  useEffect(() => {
    if (data1.length > 0) {
      lastPriceRef.current = data1[data1.length - 1];
    }
  }, [data1]);

  // Initialize chart
  useEffect(() => {
    if (ref1.current) {
      chartRef1.current = echarts.init(ref1.current, "light", {
        renderer: "canvas",
      });
    }
    return () => {
      if (chartRef1.current) {
        chartRef1.current.dispose();
      }
    };
  }, []);

  // Update chart option
  useEffect(() => {
    if (chartRef1.current && data1.length > 0) {
      const option = getOption(data1, xAxisData);
      chartRef1.current.setOption(option);
    }
  }, [data1, xAxisData]);

  const get1MinData = async (_code) => {
    try {
      const now = new Date();
      now.setUTCMinutes(0, 0, 0); // Set to current hour:00:00 UTC
      
      const pad = (n) => n < 10 ? '0' + n : n;
      const start_date = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;

      const _result = await axios.get(
        `${url}/fin/crypto/1min/realtime?token=c15cc49a21dc4ecaaff430fafc128532&ticker=${_code}&start_date=${start_date}&limit=500`
      );
      if (_result.data.data && _result.data.data.length > 0) {
        const _timeData = _result.data.data.map((ele) => {
           // Format time as HH:mm
           const date = new Date(ele.date);
           date.setHours(date.getHours() + 8);
           return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
        });
        setXAxisData(_timeData.reverse());
        
        const _values = _result.data.data.map((ele) => ele.close);
        setData1(_values.reverse());
      }
    } catch (error) {
      console.error('Error fetching 1min data:', error);
    }
  };

  const getData = async (_code) => {
    try {
      const _result = await axios.get(
        `${url}/fin/crypto/realtime?token=c15cc49a21dc4ecaaff430fafc128532&ticker=${_code}`
      );
      if (_result.data.data && _result.data.data.length > 0) {
        const latestData = _result.data.data[0];
        
        // Append new data if changed
        if (lastPriceRef.current !== null && latestData.close !== lastPriceRef.current) {
           const pad = (n) => n < 10 ? '0' + n : n;
           const now = new Date();
           now.setHours(now.getHours() + 8);
           const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
           
           setData1(prev => [...prev, latestData.close]);
           setXAxisData(prev => [...prev, timeStr]);
           lastPriceRef.current = latestData.close;
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch data logic
  useEffect(() => {
    let interval;
    const fetchData = async () => {
      if (!coinName) return;

      // Check if we have a direct mapping first (optimization)
      if (tikerObj[coinName]) {
        const ticker = tikerObj[coinName];
        getData(ticker);
        get1MinData(ticker);
        
        interval = setInterval(() => {
            getData(ticker);
        }, 2000);
        return;
      }
    };

    fetchData();
    return () => {
        if (interval) clearInterval(interval);
    };
  }, [coinName]);

  function getOption(_data, _xAxisData) {
    const _option = JSON.parse(JSON.stringify(originOption));
    const _max = Math.max(..._data);
    const _min = Math.min(..._data);
    _option.series[0].data = _data;
    _option.xAxis.data = _xAxisData;
    _option.yAxis.max = _max;
    _option.yAxis.min = _min;
    return _option;
  }

  return (
    <div className={styles.chartContainer}>
      <div className={styles.priceInfoContainer}>
        <div className={styles.priceGroup}>
          <div className={styles.priceItem}>
            <div className={styles.priceLabel}>初始价格</div>
            <div className={styles.priceValue}>{data1.length > 0 ? data1[0] : '--'}</div>
          </div>
          <div className={styles.priceItem}>
            <div className={styles.priceLabel}>当前价格</div>
            <div className={styles.priceValue}>{data1.length > 0 ? data1[data1.length - 1] : '--'}</div>
          </div>
        </div>
        
        <div className={styles.timeContainer}>
            <div className={styles.timeBlock}>
                <div className={styles.timeValue}>{currentTime.h}</div>
                <div className={styles.timeLabel}>时</div>
            </div>
            <div className={styles.timeBlock}>
                <div className={styles.timeValue}>{currentTime.m}</div>
                <div className={styles.timeLabel}>分</div>
            </div>
            <div className={styles.timeBlock}>
                <div className={styles.timeValue}>{currentTime.s}</div>
                <div className={styles.timeLabel}>秒</div>
            </div>
        </div>
      </div>
      <div className={styles.chart1} ref={ref1}></div>
    </div>
  );
});

export default App;
