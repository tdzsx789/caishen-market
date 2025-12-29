import { useState, useEffect } from 'react';

/**
 * 判断是否为移动端的自定义 Hook
 * @param breakpoint 移动端断点宽度，默认 480px
 * @returns 是否为移动端
 */
export const useIsMobile = (breakpoint: number = 480): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // 服务端渲染时返回 false
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth <= breakpoint;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    // 初始检查
    checkMobile();

    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile);

    // 清理函数
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
