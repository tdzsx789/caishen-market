import { Pagination, Spin } from 'antd';
import React, { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import styles from './index.less';

export interface PaginationWithLoadMoreProps<T> {
  /** 数据列表 */
  dataSource: T[];
  /** PC端每页显示数量 */
  pageSize?: number;
  /** 移动端每次加载数量 */
  mobilePageSize?: number;
  /** 移动端断点宽度，默认480px */
  mobileBreakpoint?: number;
  /** 滚动到底部触发加载的距离阈值，默认100px */
  scrollThreshold?: number;
  /** 当前页码（PC端） */
  currentPage?: number;
  /** 页码变化回调（PC端） */
  onPageChange?: (page: number) => void;
  /** 加载更多回调（移动端，可选，如果不提供则使用内部状态管理） */
  onLoadMore?: () => void;
  /** 是否正在加载 */
  loading?: boolean;
  /** 是否还有更多数据（移动端） */
  hasMore?: boolean;
  /** 自定义渲染内容 */
  children: (data: T[]) => React.ReactNode;
  /** 自定义加载更多文本 */
  loadMoreText?: string;
  /** 自定义无更多数据文本 */
  noMoreText?: string;
  /** 是否禁用自动滚动加载，默认false */
  disableAutoLoad?: boolean;
}

function PaginationWithLoadMore<T>({
  dataSource,
  pageSize = 150,
  mobilePageSize = 20,
  mobileBreakpoint = 480,
  scrollThreshold = 100,
  currentPage: externalCurrentPage,
  onPageChange,
  onLoadMore: externalOnLoadMore,
  loading: externalLoading,
  hasMore: externalHasMore,
  children,
  loadMoreText = '加载更多',
  noMoreText = '没有更多数据了',
  disableAutoLoad = false,
}: PaginationWithLoadMoreProps<T>) {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [mobileLoadedCount, setMobileLoadedCount] = useState(0);
  const [internalLoading, setInternalLoading] = useState(false);

  // 使用自定义 hook 判断是否为移动端
  const isMobile = useIsMobile(mobileBreakpoint);

  // 使用外部传入的页码或内部状态
  const currentPage = externalCurrentPage !== undefined ? externalCurrentPage : internalCurrentPage;
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;

  // 移动端初始化加载
  useEffect(() => {
    if (isMobile && mobileLoadedCount === 0) {
      setMobileLoadedCount(mobilePageSize);
    }
  }, [isMobile, mobilePageSize]);

  // 内部加载更多函数
  const handleLoadMore = useCallback(() => {
    if (loading) return;
    
    if (externalOnLoadMore) {
      // 使用外部提供的加载函数
      externalOnLoadMore();
    } else {
      // 使用内部状态管理
      setInternalLoading(true);
      setTimeout(() => {
        setMobileLoadedCount(prev => prev + mobilePageSize);
        setInternalLoading(false);
      }, 300);
    }
  }, [loading, externalOnLoadMore, mobilePageSize]);

  // 计算是否还有更多数据
  const hasMore = externalHasMore !== undefined 
    ? externalHasMore 
    : mobileLoadedCount < dataSource.length;

  // 获取当前显示的数据
  const getCurrentData = (): T[] => {
    if (isMobile) {
      return dataSource.slice(0, mobileLoadedCount);
    }
    
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return dataSource.slice(start, end);
  };

  // 处理分页变化
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setInternalCurrentPage(page);
    }
  };

  // 滚动监听，自动加载更多（移动端）
  useEffect(() => {
    if (!isMobile || disableAutoLoad || !hasMore || loading) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // 距离底部指定距离时触发加载
      if (scrollTop + windowHeight >= documentHeight - scrollThreshold) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, hasMore, loading, scrollThreshold, disableAutoLoad, handleLoadMore]);

  const currentData = getCurrentData();
  const total = dataSource.length;

  return (
    <>
      {children(currentData)}
      
      {/* PC端显示分页 */}
      {!isMobile && (
        <div className={styles.pagination}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      )}
      
      {/* 移动端显示加载更多 */}
      {isMobile && (
        <div className={styles.mobileLoadMore}>
          {loading ? (
            <Spin size="small" />
          ) : hasMore ? (
            <div className={styles.loadMoreText} onClick={handleLoadMore}>
              {loadMoreText}
            </div>
          ) : (
            <div className={styles.noMoreText}>{noMoreText}</div>
          )}
        </div>
      )}
    </>
  );
}

export default PaginationWithLoadMore;
