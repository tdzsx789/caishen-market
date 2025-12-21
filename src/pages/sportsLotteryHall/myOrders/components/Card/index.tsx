import { history } from '@umijs/max';
import React from 'react';
import styles from './index.less';

interface CardProps {
  item: {
    title: string;
    content: string;
    text: string;
    icon: string;
  };
}
const Card: React.FC<CardProps> = (props) => {
  const { item } = props;

  return (
    <div className={styles.statsCard}>
      <div>
        <div className={styles.title}>{item.title}</div>
        <div className={styles.content}>{item.content}</div>
        <div className={styles.text}>{item.text}</div>
      </div>
      <img className={styles.icon} src={item.icon} alt="" />
    </div>
  );
};

export default Card;
