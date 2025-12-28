import { useIsMobile } from '@/hooks/useIsMobile'
import { ArrowUpOutlined } from '@ant-design/icons';
import React,{ useState,useEffect } from 'react';
import styles from './index.less'

const BackToTop: React.FC = () => {
  const isMobile = useIsMobile();
  const [showBackToTop, setShowBackToTop] = useState(false);
  // 回到顶部函数
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 监听滚动，控制回到顶部按钮的显示
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 300); // 滚动超过300px时显示按钮
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <>{showBackToTop && isMobile && (
        <div className={styles.backToTop} onClick={scrollToTop}>
          <ArrowUpOutlined />
        </div>
      )}</>
  );
};

export default BackToTop;
