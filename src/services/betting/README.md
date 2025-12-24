# 投注相关 API 服务使用说明

本目录包含积分竞猜平台的投注相关 API 接口，所有接口均按照 `API_DOCUMENTATION.md` 文档实现。

## 文件结构

- `api.ts` - API 接口调用函数
- `typings.d.ts` - TypeScript 类型定义
- `index.ts` - 统一导出

## 使用方式

### 1. 导入接口函数

```typescript
import { 
  getVoteList, 
  getVoteDetail, 
  submitBet, 
  getMyBetRecords, 
  getBetStatistics 
} from '@/services/betting/api';
```

### 2. 导入类型定义

```typescript
import type { 
  VoteData, 
  BetRecord, 
  BetStatistics,
  GetVoteListParams,
  SubmitBetParams 
} from '@/services/betting/typings';
```

## 接口说明

### 获取投票列表

```typescript
const result = await getVoteList({
  category: 'Bitcoin',
  page: 1,
  pageSize: 8,
  status: 'InProgress'
});

// result.data.list - 投票列表
// result.data.total - 总数
// result.data.page - 当前页
// result.data.pageSize - 每页数量
```

### 获取投票详情

```typescript
const result = await getVoteDetail(1);
// result.data - 投票详情数据
```

### 提交投注

```typescript
const result = await submitBet({
  voteId: 1,
  option: 'option1',
  choice: 'yes',
  amount: 100.00
});

// result.data.betId - 投注ID
// result.data.potentialWinnings - 预计收益
```

### 获取个人投注记录

```typescript
const result = await getMyBetRecords({
  status: 'pending',
  page: 1,
  pageSize: 10
});

// result.data.list - 投注记录列表
```

### 获取投注统计

```typescript
const result = await getBetStatistics();
// result.data.totalBetAmount - 总投注金额
// result.data.totalWinnings - 总收益
// result.data.winRate - 胜率
```

## 响应格式

所有接口返回统一的响应格式：

```typescript
{
  code: number;      // 状态码：200成功，400参数错误，401未授权等
  message: string;   // 响应消息
  data: T;          // 响应数据
}
```

## 错误处理

接口可能返回的错误码：
- `200` - 成功
- `400` - 请求参数错误
- `401` - 未授权，需要登录
- `403` - 无权限
- `404` - 资源不存在
- `500` - 服务器内部错误

建议使用 try-catch 处理错误：

```typescript
try {
  const result = await submitBet({
    voteId: 1,
    option: 'option1',
    choice: 'yes',
    amount: 100.00
  });
  
  if (result.code === 200) {
    // 处理成功
  } else {
    // 处理业务错误
    console.error(result.message);
  }
} catch (error) {
  // 处理网络错误
  console.error('网络错误:', error);
}
```

## 认证

需要认证的接口会自动从请求头中获取 token（通过 umi request 配置）。

认证方式：`Authorization: Bearer {token}`

## 注意事项

1. 所有金额使用数字类型，保留两位小数
2. 时间格式统一使用 ISO 8601 格式
3. 分页参数从 1 开始
4. 投注金额最小值为 0.01
5. 赔率格式为字符串，保留两位小数
