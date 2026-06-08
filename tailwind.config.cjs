// tailwind.config.js
module.exports = {
content: [
    "./index.html",
    "./src/**/*.{html,js,ts,jsx,tsx,vue}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-background": "#1d1b1b",
        "background": "#fef8f8",
        "surface-tint": "#9b4053",
        "error": "#ba1a1a",
        "secondary": "#6d4ea2",
        "on-tertiary-fixed-variant": "#134b6c",
        "on-primary": "#ffffff",
        "primary-fixed": "#ffd9dd",
        "outline-variant": "#dac0c3",
        "on-secondary-fixed": "#270058",
        "surface-container": "#f2eced",
        "secondary-container": "#c5a3ff",
        "primary": "#9b4053",
        "surface-dim": "#ded9d9",
        "tertiary-container": "#86b6db",
        "surface-container-low": "#f8f2f2",
        "surface-container-highest": "#e7e1e1",
        "on-primary-fixed-variant": "#7d283c",
        "surface-variant": "#e7e1e1",
        "tertiary-fixed": "#cae6ff",
        "on-primary-fixed": "#400014",
        "tertiary": "#316385",
        "surface-container-lowest": "#ffffff",
        "inverse-primary": "#ffb2bd",
        "on-secondary-fixed-variant": "#543589",
        "secondary-fixed-dim": "#d5bbff",
        "on-error": "#ffffff",
        "primary-container": "#ff8fa3",
        "primary-fixed-dim": "#ffb2bd",
        "tertiary-fixed-dim": "#9cccf2",
        "surface-bright": "#fef8f8",
        "inverse-surface": "#323030",
        "on-surface-variant": "#544244",
        "secondary-fixed": "#ecdcff",
        "on-error-container": "#93000a",
        "outline": "#877274",
        "on-tertiary-fixed": "#001e2f",
        "on-surface": "#1d1b1b",
        "surface-container-high": "#ece7e7",
        "surface": "#fef8f8",
        "on-secondary": "#ffffff",
        "on-tertiary-container": "#0c4868",
        "on-primary-container": "#782539",
        "on-tertiary": "#ffffff",
        "error-container": "#ffdad6",
        "on-secondary-container": "#533387",
        "inverse-on-surface": "#f5efef"
      },
      spacing: {
        "margin-page": "16px",
        "gutter-card": "12px",
        "padding-inner": "16px",
        "status-bar": "44px",
        "capsule-safe-zone": "90px"
      },
      fontFamily: {
        "headline-md": ["Plus Jakarta Sans", "sans-serif"],
        "label-md": ["Be Vietnam Pro", "sans-serif"],
        "label-sm": ["Be Vietnam Pro", "sans-serif"],
        "body-lg": ["Be Vietnam Pro", "sans-serif"],
        "headline-lg": ["Plus Jakarta Sans", "sans-serif"]
      },
      fontSize: {
        "headline-md": ["18px", { lineHeight: "24px", fontWeight: "700" }],
        "label-md": ["13px", { lineHeight: "18px", fontWeight: "500" }],
        "label-sm": ["11px", { lineHeight: "14px", letterSpacing: "0.02em", fontWeight: "400" }],
        "body-lg": ["15px", { lineHeight: "22px", fontWeight: "400" }],
        "headline-lg": ["20px", { lineHeight: "28px", fontWeight: "700" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "800" }],
        "label-sm-mobile": ["10px", { lineHeight: "12px", fontWeight: "500" }]
      }
    }
  },
  plugins: [],
    // 关键配置：为了防止微信小程序因为特殊的字符报错，我们可以禁用掉一些不必要的特性
    corePlugins: {
      preflight: false // 小程序不需要基础样式重置
    }
}
