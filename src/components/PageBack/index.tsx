import { history } from '@umijs/max';
import React from 'react';
import styles from './index.less';

const PageBack: React.FC = (props) => {
  const { title } = props;
   console.log("🚀 ~ Button ~ title:", title)
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
