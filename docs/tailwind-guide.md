# 常用 Tailwind CSS 用法速查

## 一、Tailwind 是什么

Tailwind 是**工具类优先（utility-first）**的 CSS 框架。它不提供现成组件，而是提供大量细粒度类名（如 `flex`、`pt-4`、`text-center`），让你直接在 HTML/模板里拼出样式。

```html
<!-- 传统 CSS -->
<div class="card">内容</div>

<!-- Tailwind -->
<div class="rounded-xl bg-white p-4 shadow-md">内容</div>
```

---

## 二、布局类

### Flexbox

```html
<div class="flex items-center justify-between gap-4">
  <div class="flex-1">左侧</div>
  <div class="shrink-0">右侧</div>
</div>
```

| 类名 | 作用 |
|---|---|
| `flex` | `display: flex` |
| `flex-col` | 纵向排列 |
| `items-center` | 交叉轴居中 |
| `justify-between` | 主轴两端对齐 |
| `flex-1` | 自动占满剩余空间 |
| `shrink-0` | 不压缩 |

### Grid

```html
<div class="grid grid-cols-3 gap-4">
  <div>1</div><div>2</div><div>3</div>
</div>
```

| 类名 | 作用 |
|---|---|
| `grid` | `display: grid` |
| `grid-cols-3` | 三列 |
| `grid-cols-1 md:grid-cols-2` | 小屏1列，中屏2列 |
| `gap-4` | 网格间距 |
| `col-span-2` | 跨两列 |

---

## 三、间距

基于 `0.25rem`（默认 4px）的刻度。

```html
<div class="m-4 p-2 px-6 py-3 space-y-2">
  <p>上</p>
  <p>下</p>
</div>
```

| 类名 | 值 |
|---|---|
| `m-4` | 全外边距 16px |
| `p-2` | 全内边距 8px |
| `px-6` | 水平方向内边距 24px |
| `py-3` | 垂直方向内边距 12px |
| `gap-2` | flex/grid 间距 8px |
| `space-y-2` | 子元素垂直间距 8px |

---

## 四、尺寸

```html
<div class="w-full h-screen min-h-[200px] max-w-md">
```

| 类名 | 作用 |
|---|---|
| `w-full` | 宽度 100% |
| `h-screen` | 高度 100vh |
| `min-h-full` | 最小高度 100% |
| `max-w-md` | 最大宽度 448px |
| `w-1/2` | 宽度 50% |
| `h-10` | 高度 2.5rem（40px）|

---

## 五、文字排版

```html
<p class="text-base font-bold text-gray-800 text-center leading-relaxed">
  一段文字
</p>
```

| 类名 | 作用 |
|---|---|
| `text-sm` / `text-base` / `text-lg` / `text-xl` | 字号 |
| `font-bold` | 加粗 |
| `text-gray-800` | 文字颜色 |
| `text-center` | 居中 |
| `leading-relaxed` | 宽松行高 |
| `truncate` | 单行省略 |
| `line-clamp-3` | 多行截断（需插件）|

---

## 六、颜色与背景

```html
<div class="bg-blue-500 text-white hover:bg-blue-600">
  按钮
</div>
```

| 类名 | 作用 |
|---|---|
| `bg-red-500` | 红色背景 |
| `text-white` | 白色文字 |
| `bg-opacity-50` | 背景透明度 |
| `bg-gradient-to-r from-blue-500 to-purple-500` | 渐变背景 |

颜色刻度：`50` 最浅，`900` 最深，`500` 通常是基准色。

---

## 七、边框与圆角

```html
<div class="border border-gray-200 rounded-lg">
```

| 类名 | 作用 |
|---|---|
| `border` | 1px 实线边框 |
| `border-2` | 2px 边框 |
| `border-red-500` | 边框颜色 |
| `rounded` / `rounded-lg` / `rounded-full` | 圆角 |

---

## 八、效果

```html
<div class="shadow-md opacity-80 transition hover:opacity-100">
```

| 类名 | 作用 |
|---|---|
| `shadow-sm` / `shadow` / `shadow-lg` | 阴影 |
| `opacity-80` | 透明度 80% |
| `transition` | 过渡动画 |
| `duration-300` | 动画时长 300ms |

---

## 九、响应式

Tailwind 使用**移动优先**的断点前缀。

```html
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
```

| 前缀 | 断点 |
|---|---|
| `sm:` | 640px+ |
| `md:` | 768px+ |
| `lg:` | 1024px+ |
| `xl:` | 1280px+ |

不写前缀就是默认（最小屏幕生效），大断点覆盖小断点。

---

## 十、状态变体

```html
<button class="bg-blue-500 hover:bg-blue-600 focus:ring-2 disabled:opacity-50">
  提交
</button>
```

| 前缀 | 作用 |
|---|---|
| `hover:` | 鼠标悬停 |
| `focus:` | 聚焦状态 |
| `active:` | 激活/按下 |
| `disabled:` | 禁用状态 |
| `first:` / `last:` / `odd:` / `even:` | 子元素位置 |

---

## 十一、任意值与重要修饰

当预设刻度不够用时，可用方括号写任意值：

```html
<div class="w-[120px] h-[60rpx] text-[28rpx] top-[220px]">
```

在小程序/UniApp 项目里经常能看到 `rpx` 单位的任意值，例如 `text-[28rpx]`、`p-[32rpx]`。

---

## 十二、常用组合示例

```html
<!-- 卡片 -->
<div class="rounded-2xl bg-white p-4 shadow-md border border-gray-100">
  <h3 class="text-lg font-bold text-gray-900">标题</h3>
  <p class="mt-2 text-sm text-gray-500 line-clamp-2">描述文字...</p>
</div>

<!-- 按钮 -->
<button class="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
  确认
</button>

<!-- 水平居中布局 -->
<div class="flex items-center justify-center min-h-screen">
  <div class="w-full max-w-md p-6">内容</div>
</div>
```
