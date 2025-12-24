# 积分竞猜平台 API 接口文档

## 基础信息

- **Base URL**: `http://192.168.5.138:8000`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token (JWT)

---

## 1. 用户相关接口

### 1.1 用户登录

**接口地址**: `POST /api/login/account`

**请求参数**:
```json
{
  "username": "string",  // 用户名
  "password": "string",  // 密码
  "type": "account"     // 登录类型
}
```

**响应示例**:
```json
{
  "status": "ok",
  "type": "account",
  "currentAuthority": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.png"
  }
}
```

---

### 1.2 获取当前用户信息

**接口地址**: `GET /api/currentUser`

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "data": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.png",
    "balance": 1000.00,  // 账户余额
    "access": "admin"
  }
}
```

---

### 1.3 退出登录

**接口地址**: `POST /api/login/outLogin`

**响应示例**:
```json
{
  "data": {},
  "success": true
}
```

---

## 2. 投票/投注相关接口

### 2.1 获取投票列表

**接口地址**: `GET /api/votes`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| category | string | 否 | 分类：all, Bitcoin, Ethereum, Solana, XRP |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认8 |
| status | string | 否 | 状态筛选：InProgress, isStart, isEnd |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "投票项目 1",
        "description": "这是第 1 个投票项目的详细描述信息",
        "activityDescription": "预测比特币价格是否会在2025年1月31日前突破12万美元大关。",
        "tradingVolume": 500000.00,  // 总交易量
        "endTime": "2025-02-15T10:00:00Z",  // 截止日期
        "status": "InProgress",  // 状态：InProgress(进行中), isStart(即将开始), isEnd(已结束)
        "option1": {
          "text": "选项A - 1",
          "odds": "1.85"  // 赔率
        },
        "option2": {
          "text": "选项B - 1",
          "odds": "1.95"
        },
        "result": null  // 结果（已结束时才有）
      }
    ],
    "total": 32,
    "page": 1,
    "pageSize": 8
  }
}
```

---

### 2.2 获取投票详情

**接口地址**: `GET /api/votes/:id`

**路径参数**:
- `id`: 投票ID

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "投票项目 1",
    "description": "这是第 1 个投票项目的详细描述信息",
    "activityDescription": "预测比特币价格是否会在2025年1月31日前突破12万美元大关。",
    "tradingVolume": 500000.00,
    "endTime": "2025-02-15T10:00:00Z",
    "status": "InProgress",
    "userBetStatus": true,  // 用户是否已投注
    "option1": {
      "text": "选项A - 1",
      "odds": "1.85",
      "yesAmount": 1000.00,  // "是"的总投注金额
      "noAmount": 500.00     // "否"的总投注金额
    },
    "option2": {
      "text": "选项B - 1",
      "odds": "1.95",
      "yesAmount": 800.00,
      "noAmount": 600.00
    },
    "result": null,  // 结果：{ option1: "yes"|"no"|null, option2: "yes"|"no"|null }
    "userBetRecords": [  // 个人投注记录
      {
        "id": 1,
        "option": "选项A - 1",
        "choice": "yes",  // yes 或 no
        "amount": 100.00,
        "odds": "1.85",
        "time": "2025-01-15T10:00:00Z",
        "status": "pending"  // pending(待开奖), win(中奖), lose(未中奖)
      }
    ]
  }
}
```

---

### 2.3 提交投注

**接口地址**: `POST /api/bets`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**:
```json
{
  "voteId": 1,           // 投票ID
  "option": "option1",   // 选项：option1 或 option2
  "choice": "yes",       // 选择：yes 或 no
  "amount": 100.00       // 投注金额
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "投注成功",
  "data": {
    "betId": 12345,
    "voteId": 1,
    "option": "option1",
    "choice": "yes",
    "amount": 100.00,
    "odds": "1.85",
    "potentialWinnings": 185.00,  // 预计收益
    "time": "2025-01-15T10:00:00Z",
    "status": "pending"
  }
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "余额不足",
  "data": null
}
```

---

### 2.4 获取个人投注记录

**接口地址**: `GET /api/bets/my`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | string | 否 | 状态筛选：pending(待开奖), win(已中奖), lose(未中奖) |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "voteId": 1,
        "voteTitle": "投票项目 1",
        "option": "选项A - 1",
        "choice": "yes",
        "amount": 100.00,
        "odds": "1.85",
        "potentialWinnings": 185.00,
        "time": "2025-01-15T10:00:00Z",
        "status": "pending",
        "voteStatus": "InProgress"  // 投票状态
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 2.5 获取投注统计

**接口地址**: `GET /api/bets/statistics`

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalBetAmount": 6290.00,    // 总投注金额
    "totalWinnings": 3750.00,    // 总收益
    "winRate": 100.00,            // 胜率（百分比）
    "totalBets": 25,              // 总投注次数
    "winBets": 25,                // 中奖次数
    "pendingBets": 5              // 待开奖数量
  }
}
```

---

## 3. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 4. 数据模型

### VoteData (投票数据)
```typescript
interface VoteData {
  id: number;
  title: string;
  description: string;
  activityDescription: string;
  tradingVolume: number;
  endTime: string;  // ISO 8601 格式
  status: 'InProgress' | 'isStart' | 'isEnd';
  userBetStatus: boolean;
  option1: {
    text: string;
    odds: string;
    yesAmount?: number;
    noAmount?: number;
  };
  option2: {
    text: string;
    odds: string;
    yesAmount?: number;
    noAmount?: number;
  };
  result?: {
    option1: 'yes' | 'no' | null;
    option2: 'yes' | 'no' | null;
  };
  userBetRecords?: BetRecord[];
}
```

### BetRecord (投注记录)
```typescript
interface BetRecord {
  id: number;
  voteId: number;
  voteTitle?: string;
  option: string;
  choice: 'yes' | 'no';
  amount: number;
  odds: string;
  potentialWinnings?: number;
  time: string;  // ISO 8601 格式
  status: 'pending' | 'win' | 'lose';
  voteStatus?: 'InProgress' | 'isStart' | 'isEnd';
}
```

### User (用户信息)
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  balance: number;
  access: string;
}
```

---

## 5. 接口调用示例

### 使用 umi request

```typescript
import { request } from '@umijs/max';

// 获取投票列表
const getVoteList = async (params: {
  category?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request('/api/votes', {
    method: 'GET',
    params,
  });
};

// 提交投注
const submitBet = async (data: {
  voteId: number;
  option: 'option1' | 'option2';
  choice: 'yes' | 'no';
  amount: number;
}) => {
  return request('/api/bets', {
    method: 'POST',
    data,
  });
};
```

---

## 6. 注意事项

1. 所有需要认证的接口都需要在请求头中携带 `Authorization: Bearer {token}`
2. 时间格式统一使用 ISO 8601 格式（如：`2025-01-15T10:00:00Z`）
3. 金额统一使用数字类型，保留两位小数
4. 分页参数从1开始
5. 投注金额最小值为 0.01
6. 赔率格式为字符串，保留两位小数（如：`"1.85"`）
