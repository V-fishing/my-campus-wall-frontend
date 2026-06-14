<template>
  <view class="document-container">
    <!-- 顶部导航 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="title">{{ documentTitle }}</text>
      <view class="placeholder"></view>
    </view>

    <!-- 文档内容 -->
    <scroll-view class="document-content" scroll-y>
      <view class="content-wrapper">
        <text class="document-text">{{ documentContent }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight)
const documentTitle = ref('')
const documentContent = ref('')
const documentType = ref('')

onLoad((options) => {
  documentType.value = options.type || 'about'
  loadDocumentContent()
})

// 加载文档内容
const loadDocumentContent = () => {
  const documents = {
    'about': {
      title: '关于校园墙',
      content: `欢迎使用校园墙！

校园墙是专为嘉应学院师生打造的校园社交平台。我们致力于为同学们提供一个安全、友善、便捷的交流空间。

【产品愿景】
让每一位嘉大学子都能在这里找到归属感，分享校园生活，结交志同道合的朋友。

【核心功能】
• 动态分享：发布图文动态，记录校园生活
• AI 助手：智能问答，为你提供贴心服务
• 校园资讯：获取最新校园信息
• 私信交流：与好友保持联系

【联系我们】
如果你有任何问题或建议，欢迎通过"意见反馈"功能联系我们。

我们会认真对待每一条反馈，持续改进产品体验。

感谢你的使用与支持！`
    },
    'privacy': {
      title: '隐私政策',
      content: `隐私政策

更新日期：2024年5月20日
生效日期：2024年5月20日

一、信息收集
我们收集的信息包括：
1. 账号信息：昵称、头像、学校信息
2. 使用数据：浏览记录、互动记录
3. 设备信息：设备型号、操作系统版本

二、信息使用
我们使用收集的信息用于：
1. 提供和改进服务
2. 个性化推荐
3. 安全保障

三、信息保护
我们采取以下措施保护你的信息：
1. 数据加密存储
2. 访问权限控制
3. 定期安全审计

四、信息共享
我们不会向第三方出售你的个人信息。仅在以下情况可能共享：
1. 获得你的明确同意
2. 法律法规要求
3. 维护平台安全

五、你的权利
你有权：
1. 访问和修改个人信息
2. 删除账号和数据
3. 撤回授权同意

六、未成年人保护
我们特别重视未成年人的隐私保护。未满18岁的用户应在监护人指导下使用本服务。

七、政策更新
我们可能会适时更新本政策。更新后的政策将在平台内公示。

如有任何疑问，请联系我们的客服团队。`
    },
    'terms': {
      title: '用户协议',
      content: `用户服务协议

更新日期：2024年5月20日
生效日期：2024年5月20日

一、服务说明
校园墙为用户提供社交平台服务，包括但不限于动态发布、消息交流、AI 助手等功能。

二、账号注册
1. 用户需年满16周岁方可注册
2. 必须使用真实身份信息进行认证
3. 账号仅限本人使用，禁止转让

三、用户行为规范
用户在使用服务时应当：
1. 遵守国家法律法规
2. 尊重他人权利
3. 不发布违法违规内容
4. 不利用平台从事商业活动（未经许可）

四、禁止行为
以下行为严格禁止：
1. 发布色情、暴力、恐怖内容
2. 侵犯他人隐私和知识产权
3. 传播虚假信息和谣言
4. 恶意刷量、 spam 行为
5. 使用外挂、作弊工具

五、违规处理
对于违反协议的行为，我们有权：
1. 删除违规内容
2. 限制账号功能
3. 封禁或注销账号
4. 追究法律责任

六、知识产权
平台内的所有内容（除用户原创内容外）归校园墙所有。

七、免责声明
1. 平台不保证服务不间断
2. 用户发布的内容由用户自行承担责任
3. 因不可抗力导致的服务中断不承担责任

八、协议修改
我们保留修改本协议的权利。修改后的协议将在平台公示。

继续使用本服务即表示接受修改后的协议。

如有任何疑问，请联系客服。`
    },
    'copyright': {
      title: '版权声明',
      content: `版权声明

校园墙平台所有内容受版权法保护。

一、平台内容版权
以下内容的版权归校园墙所有：
1. 平台设计、界面、图标
2. Logo 和品牌标识
3. AI 助手生成的内容
4. 平台文案和说明文档

二、用户内容版权
1. 用户发布的原创内容版权归用户所有
2. 用户授权平台在推广中使用其内容
3. 用户保证发布内容不侵犯他人权利

三、使用限制
未经书面许可，禁止：
1. 复制、转载平台内容
2. 修改平台设计和代码
3. 将平台内容用于商业目的

四、侵权举报
如发现侵权行为，请通过"意见反馈"举报。
我们将及时处理并保护合法权益。

© 2024 校园墙 版权所有
All Rights Reserved.`
    }
  }

  const doc = documents[documentType.value]
  if (doc) {
    documentTitle.value = doc.title
    documentContent.value = doc.content
  } else {
    documentTitle.value = '文档不存在'
    documentContent.value = '抱歉，该文档不存在或已被删除。'
  }
}

// 返回
const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.document-container {
  min-height: 100vh;
  background-color: #F4F5F7;
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #f0f0f0;

  .back-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    .back-icon {
      font-size: 24px;
      color: #333;
    }
  }

  .title {
    font-size: 17px;
    font-weight: 600;
    color: #333;
  }

  .placeholder {
    width: 40px;
  }
}

/* 文档内容 */
.document-content {
  flex: 1;
}

.content-wrapper {
  background: #fff;
  padding: 24px 20px;
  margin: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .document-text {
    font-size: 15px;
    line-height: 1.8;
    color: #333;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}
</style>
