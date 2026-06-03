<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("App Launch");
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style lang="scss">
/* 引入 Tailwind 基础样式（之前配置的内容） */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 全局引入刚刚做好的本地 Material Symbols 图标库 */
@import '@/static/material-icons.css';

/* 注意：如果你项目的别名配置不支持 @/，可以直接用相对路径，比如：
   @import './static/material-icons.css';
*/
view, text, scroll-view, swiper, swiper-item, image, navigator, button, input, textarea {
  box-sizing: border-box;
}
@font-face {
  font-family: "iconfont"; /* Project id 5181832 */
  src: url('https://at.alicdn.com/t/c/font_5181832_zwc363bmuka.woff2?t=1779679492797') format('woff2'),
  url('https://at.alicdn.com/t/c/font_5181832_zwc363bmuka.woff?t=1779679492797') format('woff'),
  url('https://at.alicdn.com/t/c/font_5181832_zwc363bmuka.ttf?t=1779679492797') format('truetype');

}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-fensi1:before {
  content: "\e606";
}

.icon-nanxing:before {
  content: "\e636";
}

.icon-xiangyou1:before {
  content: "\e775";
}

.icon-xiangzuo1:before {
  content: "\e779";
}

.icon-yijianfankui:before {
  content: "\e662";
}

.icon-iconfontzhizuobiaozhunbduan36:before {
  content: "\e6e9";
}

.icon-guanyuwomen:before {
  content: "\e682";
}

.icon-shezhi4:before {
  content: "\e670";
}

.icon-svg_user_man:before {
  content: "\e754";
}

.icon-a-12nanxingjiaose:before {
  content: "\ee89";
}

.icon-a-18nvxingjiaose:before {
  content: "\ee8f";
}

.icon-svg_user_woman:before {
  content: "\e753";
}

.icon-sousuo:before {
  content: "\e628";
}

.icon-yanjing:before {
  content: "\e661";
}

.icon-fenxiang:before {
  content: "\e643";
}

.icon-sousuo-copy:before {
  content: "\e900";
}

.icon-icon-copy:before {
  content: "\e901";
}

.icon-shoucang-copy:before {
  content: "\e902";
}

.icon-sixin-copy:before {
  content: "\e903";
}

.icon-yonghu-copy:before {
  content: "\e904";
}

.icon-faxian-copy:before {
  content: "\e905";
}

.icon-zhinengyouhua-copy:before {
  content: "\e906";
}

.icon-yonghu:before {
  content: "\e658";
}

.icon-zhinengyouhua:before {
  content: "\e69a";
}

.icon-pinglun:before {
  content: "\e6ad";
}

.icon-icon:before {
  content: "\e651";
}

.icon-fangzi:before {
  content: "\e8ff";
}

.icon-fensi:before {
  content: "\e642";
}

.icon-faxian:before {
  content: "\e8af";
}

.icon-shoucang:before {
  content: "\e8b9";
}

.icon-sixin:before {
  content: "\e635";
}


</style>
