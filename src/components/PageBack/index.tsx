import { history } from '@umijs/max';
import React from 'react';
import styles from './index.less';

interface PageBackProps {
  title?: string;
}

const PageBack: React.FC<PageBackProps> = (props) => {
  const { title } = props;
   const handleBack = () => {
    history.back();
  };

  return (
    <div className={styles.pageBackContainer} onClick={handleBack}>
      <img src='/icons/Icon2.png' />
      {title}
    </div>
  );
};

export default PageBack;
