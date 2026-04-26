// ==================== 手机界面状态栏 ====================
// ==================== 加载 Font Awesome（安全方式）====================
function loadFontAwesome() {
    // 检查是否已经加载
    if ($('link[href*="font-awesome"]').length > 0 || $('link[href*="fontawesome"]').length > 0) {
        return;
    }

    // 通过 link 标签加载（异步，不会阻塞渲染）
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
}

// ==================== 样式注入 ====================
const phoneStyles = `
<style id="mobile-phone-styles">
html, body {
    height: 100%;
    min-height: 100vh;
    margin: 0;
    padding: 0;
}

/* ==================== 触发按钮 - Brushed Metal风格（复刻状态栏悬浮球） ==================== */
#mobile-trigger-btn {
    position: fixed;
    /*  桌面端默认：离右边三分之一距离的垂直中央 */
    top: 50%;
    right: 33.33%;
    transform: translateY(-50%);
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e3e3e3 0%, #c4c4c4 100%);
    border: 1px solid #d4d4d4;
    font-size: 28px;
    cursor: move;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.03);
    transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
    padding: 0;
    overflow: visible;
}
#mobile-trigger-btn .star-container {
    width: 85%;
    height: 85%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
#mobile-trigger-btn .icon-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
    display: block;
}
#mobile-trigger-btn .star-layer {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: all 0.4s ease;
    transform-box: view-box;
    transform-origin: 50px 50px;
}
#mobile-trigger-btn .base-layer {
    stroke: #666;
    stroke-width: 2;
    opacity: 0.7;
}
#mobile-trigger-btn .layer-1 {
    stroke: #555;
    stroke-width: 2;
    stroke-dasharray: 100 400;
    stroke-dashoffset: 0;
    opacity: 0.8;
    animation: mobileBtnMetalDraw 6s linear infinite;
}
#mobile-trigger-btn .layer-2 {
    stroke: #999;
    stroke-width: 1.5;
    stroke-dashoffset: 0;
    animation: mobileBtnMetalDraw 6s linear infinite reverse;
}
@keyframes mobileBtnMetalDraw {
    from { stroke-dashoffset: 500; }
    to { stroke-dashoffset: 0; }
}
#mobile-trigger-btn .center-circle {
    fill: none;
    stroke: #777;
    stroke-width: 1.5;
}

/*  CSS类控制：移动端右边垂直居中（srcdoc iframe兼容） */
/* 使用多层ID选择器提高优先级 */
#mobile-trigger-btn#mobile-trigger-btn#mobile-trigger-btn.mobile-mode,
body #mobile-trigger-btn.mobile-mode {
    /* 移动端模式：右边垂直居中定位，覆盖所有内联样式 */
    left: auto !important;
    top: 50% !important;
    right: 12px !important;
    bottom: auto !important;
    width: 45px !important;
    height: 45px !important;
    font-size: 22px !important;
    position: fixed !important;
    display: flex !important;
    z-index: 10000 !important;
    transform: translateY(-50%) !important;
    margin: 0 !important;
    background: linear-gradient(135deg, #e3e3e3 0%, #c4c4c4 100%) !important;
    border: 1px solid #d4d4d4 !important;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.03) !important;
}

#mobile-trigger-btn#mobile-trigger-btn#mobile-trigger-btn.tablet-mode,
body #mobile-trigger-btn.tablet-mode {
    /* 平板端模式 */
    left: auto !important;
    top: auto !important;
    right: 15px !important;
    bottom: 15px !important;
    width: 50px !important;
    height: 50px !important;
    font-size: 24px !important;
    position: fixed !important;
    display: flex !important;
    z-index: 10000 !important;
    transform: none !important;
    margin: 0 !important;
    background: linear-gradient(135deg, #e3e3e3 0%, #c4c4c4 100%) !important;
    border: 1px solid #d4d4d4 !important;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.03) !important;
}

/*  CSS媒体查询：作为备用方案（在非iframe环境中生效） */
@media (max-width: 480px) {
    #mobile-trigger-btn:not(.desktop-mode) {
        left: auto !important;
        top: 50% !important;
        right: 12px !important;
        bottom: auto !important;
        width: 45px !important;
        height: 45px !important;
        font-size: 22px !important;
        transform: translateY(-50%) !important;
        background: linear-gradient(135deg, #e3e3e3 0%, #c4c4c4 100%) !important;
        border: 1px solid #d4d4d4 !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.03) !important;
    }
}

@media (min-width: 481px) and (max-width: 768px) {
    #mobile-trigger-btn:not(.desktop-mode) {
        left: auto !important;
        top: auto !important;
        right: 15px !important;
        bottom: 15px !important;
        width: 50px !important;
        height: 50px !important;
        font-size: 24px !important;
        background: linear-gradient(135deg, #e3e3e3 0%, #c4c4c4 100%) !important;
        border: 1px solid #d4d4d4 !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.03) !important;
    }
}

#mobile-trigger-btn:hover {
    transform: translateY(-5px);
    background: linear-gradient(135deg, #f0f0f0 0%, #dcdcdc 100%);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08), 0 20px 30px rgba(0, 0, 0, 0.06);
}

#mobile-trigger-btn.dragging {
    transition: none !important;
    transform: none !important;
    cursor: grabbing;
}

#mobile-trigger-btn:active:not(.dragging) {
    transform: scale(0.96);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transition-duration: 0.1s;
}

/* ==================== 手机容器 ==================== */
#mobile-phone-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    z-index: 9999;
    display: none;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s;
    transition: background 0.3s ease, backdrop-filter 0.3s ease;
}

#mobile-phone-overlay.active {
    display: flex;
}

/* 置顶时：遮罩透明且不阻挡点击 */
#mobile-phone-overlay.pinned {
    background: transparent;
    backdrop-filter: none;
    pointer-events: none;
}

/* 置顶时：手机框架仍然可以响应点击 */
#mobile-phone-overlay.pinned .mobile-phone-frame {
    pointer-events: auto;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* ==================== 手机框架 ==================== */
#mobile-phone-overlay .mobile-phone-frame {
    position: relative !important;
    width: 90% !important;
    max-width: 375px !important;
    aspect-ratio: 375/737 !important;
    background: #333 !important;
    border-radius: 40px !important;
    padding: 8px !important;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5) !important;
    overflow: hidden !important;
    animation: slideUp 0.3s !important;
}

/* 清除手机框架的伪元素 */
#mobile-phone-overlay .mobile-phone-frame::before,
#mobile-phone-overlay .mobile-phone-frame::after {
    content: none !important;
    display: none !important;
}

@keyframes slideUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

#mobile-phone-overlay .mobile-phone-screen {
    width: 100% !important;
    height: 100% !important;
    border-radius: 32px !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    position: relative !important;
    background: #fff5f7 !important;
    background-image: url('https://gitgud.io/Rown/dnf/-/raw/master/%E5%B0%81%E9%9D%A2/%E6%B3%95%E9%9C%B2%E7%89%B9.webp') !important;
    background-size: cover !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
}

/* ==================== 状态栏 ==================== */
.mobile-status-bar {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    font-size: 14px;
    font-weight: 600;
    flex-shrink: 0;
}

.status-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.status-left .time {
    color: #1a1a1a;
    font-weight: 700;
}

.pin-btn {
    background: transparent;
    border: none;
    color: #666;
    font-size: 16px;
    cursor: pointer;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    border-radius: 6px;
}

.pin-btn:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #333;
}

.pin-btn.pinned {
    color: #3B82F6;
    transform: rotate(45deg);
}

.pin-btn.pinned:hover {
    background: rgba(59, 130, 246, 0.1);
}

.status-center {
    flex: 1;
    display: flex;
    justify-content: center;
    user-select: none;
}

.dynamic-island {
    width: 126px;
    height: 30px;
    background: #1a1a1a;
    border-radius: 15px;
    position: relative;
    overflow: hidden;
}

.dynamic-island::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 20px;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: #00ff00;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.status-right {
    display: flex;
    align-items: center;
    gap: 5px;
}

.battery {
    display: flex;
    align-items: center;
    gap: 2px;
    color: #1a1a1a;
    font-size: 12px;
}

/* ==================== 主内容区域 ==================== */
.mobile-content {
    flex: 1;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

#mobile-phone-overlay .home-screen {
    flex: 1 !important;
    padding: 20px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 20px !important;
    overflow-y: auto !important;
    background: transparent !important;
}

/* ==================== 时间天气卡片 ==================== */
.weather-card {
    /* 完全透明，但保留占位空间 */
    background: transparent;
    backdrop-filter: none;
    box-shadow: none;
    border-radius: 24px;
    padding: 20px;
    margin: 0 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
    flex-shrink: 0;
    pointer-events: none;
}

/* 隐藏卡片内容但保留占位 */
.weather-card * {
    visibility: hidden;
}

.weather-time {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
}

.current-date {
    font-size: 20px;
    color: #2d3748;
    font-weight: 400;
    /* 多层阴影：白色+黑色，适应任何背景 */
    text-shadow: 
        0 0 10px rgba(255, 255, 255, 0.9),
        0 0 20px rgba(255, 255, 255, 0.7),
        0 2px 4px rgba(0, 0, 0, 0.3),
        0 4px 8px rgba(0, 0, 0, 0.2);
}

.current-time {
    color: #1a1a1a;
    font-size: 48px;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.05em;
    /* 强阴影确保在任何背景上都清晰 */
    text-shadow: 
        0 0 15px rgba(255, 255, 255, 1),
        0 0 30px rgba(255, 255, 255, 0.8),
        0 3px 6px rgba(0, 0, 0, 0.4),
        0 6px 12px rgba(0, 0, 0, 0.3);
}

.weather-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    /* 增强半透明背景，添加模糊效果 */
    background-color: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 10px 15px;
    gap: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.weather-desc {
    font-size: 14px;
    color: #2d3748;
    font-weight: 400;
    text-shadow: 
        0 0 8px rgba(255, 255, 255, 0.8),
        0 1px 3px rgba(0, 0, 0, 0.2);
}

/* ==================== 应用图标网格 ==================== */
#mobile-phone-overlay .app-pages-container {
    flex: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    position: relative !important;
    overflow: hidden !important;
    background: transparent !important;
    touch-action: pan-x !important;
}

/* 页面滑动容器 */
#mobile-phone-overlay .app-pages-wrapper {
    flex: 1 !important;
    display: flex !important;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    touch-action: pan-x !important;
    overflow: visible !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
}

#mobile-phone-overlay .app-pages-wrapper.no-transition {
    transition: none !important;
}

#mobile-phone-overlay .app-page {
    flex: 0 0 100% !important;
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    overflow-y: auto !important;
}

#mobile-phone-overlay .app-grid {
    flex: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 25px !important;
    padding: 0 20px !important;
}

/* 页面指示器 */
#mobile-phone-overlay .page-indicators {
    display: none !important; /* 只有一页时隐藏指示器 */
    justify-content: center !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 15px 0 !important;
    position: relative !important;
    z-index: 10 !important;
}

#mobile-phone-overlay .indicator {
    width: 8px !important;
    height: 8px !important;
    border-radius: 50% !important;
    background: rgba(0, 0, 0, 0.2) !important;
    transition: all 0.3s ease !important;
    cursor: pointer !important;
}

#mobile-phone-overlay .indicator.active {
    width: 24px !important;
    border-radius: 4px !important;
    background: rgba(0, 0, 0, 0.5) !important;
}

#mobile-phone-overlay .app-row {
    display: flex !important;
    justify-content: space-around !important;
    align-items: center !important;
    gap: 15px !important;
}

#mobile-phone-overlay .app-icon {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 8px !important;
    cursor: pointer !important;
    transition: transform 0.2s ease !important;
    flex: 1 !important;
    max-width: 70px !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
}

#mobile-phone-overlay .app-icon:hover {
    transform: scale(1.1) !important;
}

#mobile-phone-overlay .app-icon-bg {
    width: 56px !important;
    height: 56px !important;
    border-radius: 16px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 26px !important;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
    position: relative !important;
    overflow: hidden !important;
    transition: transform 0.2s, box-shadow 0.2s !important;
}

/* 清除所有可能的伪元素覆盖 */
#mobile-phone-overlay .app-icon-bg::before,
#mobile-phone-overlay .app-icon-bg::after {
    content: none !important;
    display: none !important;
}

#mobile-phone-overlay .app-icon::before,
#mobile-phone-overlay .app-icon::after {
    content: none !important;
    display: none !important;
}

#mobile-phone-overlay .app-icon-bg i {
    z-index: 1 !important;
    font-size: 26px !important;
    position: relative !important;
}

/* Material Design 风格纯色渐变背景 - 使用!important提高优先级 */
#mobile-phone-overlay .app-icon-bg.md-blue {
    background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%) !important;
    border: none !important;
}

#mobile-phone-overlay .app-icon-bg.md-blue i {
    color: #ffffff !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
}

#mobile-phone-overlay .app-icon-bg.md-orange {
    background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%) !important;
    border: none !important;
}

#mobile-phone-overlay .app-icon-bg.md-orange i {
    color: #ffffff !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
}

#mobile-phone-overlay .app-icon-bg.md-green {
    background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%) !important;
    border: none !important;
}

#mobile-phone-overlay .app-icon-bg.md-green i {
    color: #ffffff !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
}

#mobile-phone-overlay .app-icon-bg.md-purple {
    background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%) !important;
    border: none !important;
}

#mobile-phone-overlay .app-icon-bg.md-purple i {
    color: #ffffff !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
}

#mobile-phone-overlay .app-icon-bg.md-pink {
    background: linear-gradient(135deg, #E91E63 0%, #C2185B 100%) !important;
    border: none !important;
}

#mobile-phone-overlay .app-icon-bg.md-pink i {
    color: #ffffff !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
}

#mobile-phone-overlay .app-icon-bg.md-red {
    background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%) !important;
    border: none !important;
}

#mobile-phone-overlay .app-icon-bg.md-red i {
    color: #ffffff !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
}

#mobile-phone-overlay .app-icon-bg.md-yellow {
    background: linear-gradient(135deg, #FFC107 0%, #FFA000 100%) !important;
    border: none !important;
}

#mobile-phone-overlay .app-icon-bg.md-yellow i {
    color: rgba(0, 0, 0, 0.75) !important;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3) !important;
}

#mobile-phone-overlay .app-icon-bg.md-cyan {
    background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%) !important;
    border: none !important;
}

#mobile-phone-overlay .app-icon-bg.md-cyan i {
    color: #ffffff !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
}

#mobile-phone-overlay .app-icon-bg.md-teal {
    background: linear-gradient(135deg, #009688 0%, #00796B 100%) !important;
    border: none !important;
}

#mobile-phone-overlay .app-icon-bg.md-teal i {
    color: #ffffff !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
}

#mobile-phone-overlay .app-label {
    font-size: 11px !important;
    color: #1a1a1a !important;
    font-weight: 500 !important;
    text-align: center !important;
    line-height: 1.2 !important;
    /* 多层文字阴影，确保在任何背景上都清晰可见 */
    text-shadow: 
        0 0 8px rgba(255, 255, 255, 1),
        0 0 12px rgba(255, 255, 255, 0.9),
        0 1px 3px rgba(0, 0, 0, 0.4),
        0 2px 6px rgba(0, 0, 0, 0.3) !important;
    /* 添加半透明背景增强可读性 */
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(4px);
    padding: 2px 6px !important;
    border-radius: 6px !important;
}

/* 图标悬停动画 */
#mobile-phone-overlay .app-icon:hover .app-icon-bg {
    transform: scale(1.08) !important;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35) !important;
}

#mobile-phone-overlay .app-icon:active .app-icon-bg {
    transform: scale(0.92) !important;
}

/* ==================== 应用详情面板 ==================== */
.app-detail-panel {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #ffffff !important;
    z-index: 100 !important;
    display: none;
    flex-direction: column;
    animation: slideIn 0.3s;
}

.app-detail-panel.active {
    display: flex;
}

@keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
}

.app-header {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
}

.back-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: background 0.2s ease;
    font-size: 20px;
    color: #2d3748;
}

.back-button:hover {
    background: rgba(0, 0, 0, 0.1);
}

.app-title {
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
}

.app-body {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    background: #f8f9fa;
    transition: opacity 0.2s ease-in-out;
}

/* ==================== 列表项样式 ==================== */
.list-item {
    background: #fff;
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.list-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.list-item-name {
    font-size: 14px;
    font-weight: 600;
    color: #2d3748;
}

.list-item-value {
    font-size: 14px;
    font-weight: 600;
    color: #10b981;
}

.list-item-desc {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.5;
}

/* 好友列表项 hover 效果 */
.friend-item:hover {
    background: #fef3f2 !important;
    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.15) !important;
    transform: translateY(-1px);
}

/* 论坛帖子项 hover 效果 */
.forum-post-item:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12) !important;
}

.forum-post-item:active {
    transform: translateY(0) !important;
}

.friend-item:active {
    transform: translateY(0);
}

.empty-message {
    text-align: center;
    padding: 40px 20px;
    color: #9ca3af;
    font-size: 14px;
}

/* ==================== 聊天界面样式 ==================== */
.chat-panel {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #ffffff !important;
    z-index: 200 !important;
    display: none;
    flex-direction: column;
    animation: slideIn 0.3s;
}

.chat-panel.active {
    display: flex;
}

.chat-header {
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 15px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    background: #f8f9fa;
}

.message-item {
    margin-bottom: 15px;
    display: flex;
}

.message-item.mine {
    justify-content: flex-end;
}

.message-item.other {
    justify-content: flex-start;
}

.message-bubble {
    max-width: 70%;
    padding: 10px 15px;
    border-radius: 15px;
    word-wrap: break-word;
}

.message-item.mine .message-bubble {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.message-item.other .message-bubble {
    background: white;
    color: #2d3748;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.message-sender {
    font-size: 11px;
    color: #9ca3af;
    margin-bottom: 3px;
}

.message-time {
    font-size: 10px;
    opacity: 0.8;
    margin-top: 5px;
    color: inherit;
}

.chat-input-area {
    height: 60px;
    background: white;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    padding: 10px;
    gap: 10px;
    flex-shrink: 0;
}

.chat-input {
    flex: 1;
    height: 40px;
    border: 1px solid #ddd;
    border-radius: 20px;
    padding: 0 15px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
    background: #ffffff;
    color: #1f2937;
}

.chat-input:focus {
    border-color: #667eea;
    background: #ffffff;
}

.chat-input::placeholder {
    color: #9ca3af;
    opacity: 1;
}

.chat-send-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.chat-send-btn:hover:not(:disabled) {
    transform: scale(1.1);
}

.chat-send-btn:active:not(:disabled) {
    transform: scale(0.95);
}

/*  发送中状态 - 变暗、变矩形 */
.chat-send-btn:disabled {
    cursor: not-allowed;
    opacity: 0.6 !important;
    background: #6c757d !important; /* 灰色背景 */
    border-radius: 8px !important; /* 变成矩形（圆角矩形） */
    transform: none !important;
    box-shadow: none !important;
}

/* 发送中状态的矩形图标动画 */
.chat-send-btn .fa-stop {
    animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
}

/* ==================== 设置页面样式 ==================== */
.settings-section {
    margin-bottom: 20px;
}

.settings-section-title {
    font-size: 14px;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 12px;
    padding-left: 5px;
}

.wallpaper-categories {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.wallpaper-category {
    background: #fff;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: all 0.2s ease;
}

.wallpaper-category:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.wallpaper-category-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.wallpaper-category-name {
    font-size: 15px;
    font-weight: 600;
    color: #2d3748;
}

.wallpaper-category-count {
    font-size: 12px;
    color: #9ca3af;
}

.wallpaper-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 15px;
    display: none;
}

.wallpaper-grid.active {
    display: grid;
}

.wallpaper-item {
    aspect-ratio: 9/16;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    background: #f3f4f6;
    transition: all 0.2s ease;
}

.wallpaper-item:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.wallpaper-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.wallpaper-item.selected::after {
    content: '✓';
    position: absolute;
    top: 5px;
    right: 5px;
    width: 24px;
    height: 24px;
    background: #10b981;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
}

.wallpaper-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.wallpaper-loading::after {
    content: '';
    width: 24px;
    height: 24px;
    border: 3px solid #f3f4f6;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    z-index: 10;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* ==================== 图片加载loading效果 ==================== */
.loading::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 50px;
    height: 50px;
    margin: -25px 0 0 -25px;
    border: 4px solid rgba(91, 164, 229, 0.2);
    border-top-color: #5BA4E5;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    z-index: 10;
}

/* ==================== 响应式适配 - 教科书级实现 ==================== */

/* 平板端适配 (≤768px) */
@media (max-width: 768px) {
    /* 框架适配 */
    .mobile-phone-frame,
    #mobile-phone-overlay .mobile-phone-frame {
        width: 80% !important;
        max-width: 300px !important;
    }
    
    /* 触发按钮 */
    #mobile-trigger-btn {
        width: 50px;
        height: 50px;
        bottom: 15px;
        right: 15px;
    }
    
    /* 状态栏 */
    .mobile-status-bar {
        height: 40px;
        padding: 0 12px;
        font-size: 13px;
    }
    
    /* 应用 Header */
    .app-header {
        height: 50px;
        padding: 0 15px;
    }
    
    .app-title {
        font-size: 17px;
    }
    
    .back-button,
    .pin-btn {
        font-size: 20px;
        padding: 5px;
    }
    
    /* 主屏幕 */
    .home-screen {
        padding: 15px;
        gap: 15px;
    }
    
    /* 天气卡片 */
    .weather-card {
        padding: 15px;
        gap: 12px;
    }
    
    .weather-time {
        font-size: 26px;
    }
    
    .weather-date {
        font-size: 13px;
    }
    
    .weather-location {
        font-size: 12px;
    }
    
    /* 应用图标 */
    .app-icon {
        gap: 6px;
    }
    
    .app-icon-bg {
        width: 52px;
        height: 52px;
        font-size: 26px;
        border-radius: 14px;
    }
    
    .app-label {
        font-size: 11px;
    }
    
    /* 应用网格 */
    .app-grid {
        gap: 15px;
    }
    
    .app-row {
        gap: 18px;
    }
    
    /* 应用内容 */
    .app-body {
        padding: 15px;
    }
    
    /* 列表项 */
    .list-item {
        padding: 12px;
    }
    
    .list-item-name {
        font-size: 14px;
    }
    
    .list-item-value {
        font-size: 15px;
    }
    
    /* 消息列表 */
    .message-item {
        padding: 12px;
    }
    
    .message-name {
        font-size: 14px;
    }
    
    .message-preview {
        font-size: 12px;
    }
    
    /* 聊天界面 */
    .chat-bubble {
        font-size: 14px;
        padding: 10px 14px;
    }
    
    .chat-input-container {
        padding: 12px 15px;
    }
    
    .chat-input {
        font-size: 14px;
        padding: 9px 14px;
    }
    
    .send-button {
        width: 38px;
        height: 38px;
        font-size: 16px;
    }
    
    /* 商品卡片 */
    .shop-item {
        padding: 12px;
    }
    
    .shop-item-name {
        font-size: 14px;
    }
    
    .shop-item-price {
        font-size: 15px;
    }
    
    .shop-buy-btn {
        padding: 7px 14px;
        font-size: 13px;
    }
    
    .shop-buy-btn:hover {
        transform: scale(1.05);
    }
    
    .shop-buy-btn:active {
        transform: scale(0.98);
    }
    
    /* ========== 自定义确认弹窗样式 ========== */
    .custom-confirm-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100000;
        opacity: 0;
        animation: fadeIn 0.2s ease-out forwards;
    }
    
    @keyframes fadeIn {
        to { opacity: 1; }
    }
    
    .custom-confirm-modal {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        padding: 2px;
        min-width: 340px;
        max-width: 480px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        animation: slideUp 0.3s ease-out;
    }
    
    @keyframes slideUp {
        from {
            transform: translateY(30px) scale(0.95);
            opacity: 0;
        }
        to {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
    }
    
    .custom-confirm-content {
        background: #1f2937;
        border-radius: 18px;
        padding: 28px 24px 20px;
    }
    
    .confirm-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        animation: iconPulse 2s ease-in-out infinite;
    }
    
    @keyframes iconPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
        50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
    }
    
    .confirm-title {
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 16px;
        color: #f3f4f6;
        text-align: center;
        letter-spacing: 0.5px;
    }
    
    .confirm-message {
        font-size: 15px;
        line-height: 1.7;
        color: #d1d5db;
        margin-bottom: 24px;
        text-align: center;
        white-space: pre-line;
    }
    
    .confirm-item-info {
        background: rgba(102, 126, 234, 0.1);
        border: 1px solid rgba(102, 126, 234, 0.3);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 24px;
    }
    
    .confirm-item-name {
        font-size: 18px;
        font-weight: 600;
        color: #a5b4fc;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .confirm-item-desc {
        font-size: 13px;
        color: #9ca3af;
        margin-bottom: 12px;
        line-height: 1.6;
    }
    
    .confirm-item-price {
        font-size: 16px;
        font-weight: 600;
        color: #fbbf24;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    
    .confirm-buttons {
        display: flex;
        gap: 12px;
    }
    
    .confirm-btn {
        flex: 1;
        padding: 14px 20px;
        border: none;
        border-radius: 12px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .confirm-btn-cancel {
        background: #374151;
        color: #d1d5db;
    }
    
    .confirm-btn-cancel:hover {
        background: #4b5563;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .confirm-btn-confirm {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .confirm-btn-confirm:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    
    .confirm-btn:active {
        transform: translateY(0) scale(0.98);
    }
    
    /* 好友卡片 */
    .friend-card {
        padding: 12px;
    }
    
    .friend-avatar {
        width: 45px;
        height: 45px;
        font-size: 20px;
    }
    
    .friend-name {
        font-size: 15px;
    }
    
    .friend-stats {
        font-size: 11px;
    }
}

/* 大屏手机适配 (≤480px) */
@media (max-width: 480px) {
    /* 框架适配 */
    .mobile-phone-frame,
    #mobile-phone-overlay .mobile-phone-frame {
        width: 90% !important;
        max-width: 100% !important;
        border-radius: 30px !important;
        padding: 6px !important;
    }
    
    #mobile-phone-overlay .mobile-phone-screen {
        border-radius: 24px !important;
    }
    
    /* 触发按钮 */
    #mobile-trigger-btn {
        width: 45px;
        height: 45px;
        bottom: 12px;
        right: 12px;
    }
    
    /* 状态栏 */
    .mobile-status-bar {
        height: 36px;
        padding: 0 10px;
        font-size: 12px;
    }
    
    .status-left .time {
        font-size: 13px;
    }
    
    /* 应用 Header */
    .app-header {
        height: 44px;
        padding: 0 12px;
    }
    
    .app-title {
        font-size: 16px;
    }
    
    .back-button,
    .pin-btn {
        font-size: 18px;
        padding: 4px;
    }
    
    /* 主屏幕 */
    .home-screen {
        padding: 12px;
        gap: 12px;
    }
    
    /* 天气卡片 */
    .weather-card {
        padding: 12px;
        gap: 10px;
        border-radius: 15px;
    }
    
    .weather-time {
        font-size: 22px;
    }
    
    .weather-date {
        font-size: 12px;
    }
    
    .weather-location {
        font-size: 11px;
    }
    
    /* 应用图标 */
    .app-icon {
        gap: 5px;
    }
    
    .app-icon-bg {
        width: 46px;
        height: 46px;
        font-size: 23px;
        border-radius: 12px;
    }
    
    .app-label {
        font-size: 10px;
    }
    
    /* 应用网格 */
    .app-grid {
        gap: 12px;
    }
    
    .app-row {
        gap: 15px;
    }
    
    /* 应用内容 */
    .app-body {
        padding: 12px;
    }
    
    /* 列表项 */
    .list-item {
        padding: 10px;
        border-radius: 10px;
    }
    
    .list-item-name {
        font-size: 13px;
    }
    
    .list-item-value {
        font-size: 14px;
    }
    
    .list-item-desc {
        font-size: 11px;
    }
    
    /* 消息列表 */
    .message-item {
        padding: 10px;
        gap: 10px;
    }
    
    .message-avatar {
        width: 42px;
        height: 42px;
        font-size: 18px;
    }
    
    .message-name {
        font-size: 13px;
    }
    
    .message-preview {
        font-size: 11px;
    }
    
    .message-time {
        font-size: 10px;
    }
    
    /* 聊天界面 */
    .chat-messages {
        gap: 12px;
        padding: 10px;
    }
    
    .chat-bubble {
        font-size: 13px;
        padding: 9px 13px;
        border-radius: 16px;
    }
    
    .chat-time {
        font-size: 10px;
    }
    
    .chat-input-container {
        padding: 10px 12px;
        gap: 8px;
    }
    
    .chat-input {
        font-size: 13px;
        padding: 8px 12px;
        border-radius: 20px;
    }
    
    .send-button {
        width: 36px;
        height: 36px;
        font-size: 15px;
    }
    
    /* 商品卡片 */
    .shop-grid {
        gap: 10px;
    }
    
    .shop-item {
        padding: 10px;
        border-radius: 10px;
    }
    
    .shop-item-name {
        font-size: 13px;
    }
    
    .shop-item-desc {
        font-size: 11px;
    }
    
    .shop-item-price {
        font-size: 14px;
    }
    
    .shop-buy-btn {
        padding: 6px 12px;
        font-size: 12px;
    }
    
    /* 好友卡片 */
    .friends-grid {
        gap: 10px;
    }
    
    .friend-card {
        padding: 10px;
        border-radius: 10px;
    }
    
    .friend-avatar {
        width: 40px;
        height: 40px;
        font-size: 18px;
    }
    
    .friend-name {
        font-size: 14px;
    }
    
    .friend-identity {
        font-size: 11px;
    }
    
    .friend-stats {
        font-size: 10px;
    }
    
    .friend-stat-value {
        font-size: 13px;
    }
    
    /* 已移除资产相关样式 */
    
    .asset-item {
        padding: 10px;
    }
    
    .asset-label {
        font-size: 12px;
    }
    
    .asset-value {
        font-size: 14px;
    }
    
    /* 空状态 */
    .empty-state {
        padding: 40px 20px;
    }
    
    .empty-icon {
        font-size: 40px;
    }
    
    .empty-text {
        font-size: 13px;
    }
}

/* 小屏手机适配 (≤360px) */
@media (max-width: 360px) {
    /* 框架适配 */
    .mobile-phone-frame,
    #mobile-phone-overlay .mobile-phone-frame {
        width: 95% !important;
        border-radius: 25px !important;
        padding: 5px !important;
    }
    
    #mobile-phone-overlay .mobile-phone-screen {
        border-radius: 20px !important;
    }
    
    /* 触发按钮 */
    #mobile-trigger-btn {
        width: 40px;
        height: 40px;
        bottom: 10px;
        right: 10px;
    }
    
    /* 状态栏 */
    .mobile-status-bar {
        height: 34px;
        padding: 0 8px;
        font-size: 11px;
    }
    
    /* 应用 Header */
    .app-header {
        height: 40px;
        padding: 0 10px;
    }
    
    .app-title {
        font-size: 15px;
    }
    
    .back-button,
    .pin-btn {
        font-size: 16px;
        padding: 3px;
    }
    
    /* 主屏幕 */
    .home-screen {
        padding: 10px;
        gap: 10px;
    }
    
    /* 天气卡片 */
    .weather-card {
        padding: 10px;
    }
    
    .weather-time {
        font-size: 20px;
    }
    
    .weather-date {
        font-size: 11px;
    }
    
    /* 应用图标 */
    .app-icon-bg {
        width: 42px;
        height: 42px;
        font-size: 21px;
        border-radius: 10px;
    }
    
    .app-label {
        font-size: 9px;
    }
    
    .app-grid {
        gap: 10px;
    }
    
    .app-row {
        gap: 12px;
    }
    
    /* 应用内容 */
    .app-body {
        padding: 10px;
    }
    
    /* 列表项 */
    .list-item-name {
        font-size: 12px;
    }
    
    .list-item-value {
        font-size: 13px;
    }
    
    /* 聊天 */
    .chat-bubble {
        font-size: 12px;
        padding: 8px 12px;
    }
    
    .chat-input {
        font-size: 12px;
        padding: 7px 10px;
    }
    
    .send-button {
        width: 34px;
        height: 34px;
    }
    
    /* 好友头像 */
    .friend-avatar,
    .message-avatar {
        width: 36px;
        height: 36px;
        font-size: 16px;
    }
}

/* 触控优化 - 所有触摸设备 */
@media (hover: none) and (pointer: coarse) {
    /* 确保最小触控区域 44px (Apple HIG 标准) */
    .app-icon,
    .back-button,
    .send-button,
    .shop-buy-btn,
    button {
        min-width: 44px;
        min-height: 44px;
    }
    
    /* 增加间距防止误触 */
    .app-row {
        gap: 20px;
    }
    
    /* 增强触控反馈 */
    .app-icon:active {
        transform: scale(0.85);
    }
    
    .list-item:active,
    .message-item:active,
    .friend-card:active {
        transform: scale(0.98);
    }
}

/* 横屏优化 */
@media (max-width: 768px) and (orientation: landscape) {
    .mobile-phone-frame,
    #mobile-phone-overlay .mobile-phone-frame {
        width: 50% !important;
        max-width: 500px !important;
    }
    
    .home-screen,
    .app-body {
        padding: 10px;
    }
    
    .app-grid {
        gap: 10px;
    }
}

/* ==================== 滚动条 ==================== */
.home-screen::-webkit-scrollbar,
.app-body::-webkit-scrollbar {
    width: 4px;
}

.home-screen::-webkit-scrollbar-track,
.app-body::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
}

.home-screen::-webkit-scrollbar-thumb,
.app-body::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
}

.home-screen::-webkit-scrollbar-thumb:hover,
.app-body::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}

/* ==================== 全屏壁纸按钮 ==================== */
.wallpaper-fullscreen-btn {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 50;
}

.wallpaper-fullscreen-btn i {
    font-size: 20px;
    color: #667eea;
}

.wallpaper-fullscreen-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
    background: rgba(255, 255, 255, 1);
}

.wallpaper-fullscreen-btn:active {
    transform: scale(0.95);
}

/* ==================== 全屏壁纸查看器 ==================== */
.wallpaper-fullscreen-viewer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 200;
    animation: fadeIn 0.3s;
}

.wallpaper-fullscreen-viewer.active {
    display: flex;
}

.wallpaper-fullscreen-viewer img {
    max-width: 100%;
    max-height: calc(100% - 100px);
    object-fit: contain;
    border-radius: 0;
    box-shadow: none;
}

.wallpaper-close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 201;
}

.wallpaper-close-btn i {
    font-size: 20px;
    color: #ffffff;
}

.wallpaper-close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
}

.wallpaper-close-btn:active {
    transform: rotate(90deg) scale(0.9);
}
</style>
`;

// ==================== 全局变量 ====================
let currentPhoneData = null;
let currentPanel = null;

// 导航栈，用于处理多级页面
let navigationStack = [];

//  好友列表导航记忆
let friendsListScrollPosition = 0; // 好友列表滚动位置
let lastViewedFriend = null; // 最后查看的好友名称
let friendDetailScrollPosition = 0; //  好友详情页的滚动位置

/**
 * 判断对象中是否存在有效的联系人项
 */
function hasContactEntries(obj) {
    if (!obj || typeof obj !== 'object') return false;
    return Object.keys(obj).length > 0;
}

/**
 * 获取当前可用的联系人数据源（使用变量脚本的羁绊列表）
 */
function getRelationshipDataSource(source = currentPhoneData) {
    /* 优先从传入的source获取羁绊列表 */
    if (source && hasContactEntries(source.羁绊列表)) {
        return source.羁绊列表;
    }

    /* 降级：尝试从MVU变量框架获取羁绊列表数据 */
    if (typeof Mvu !== 'undefined' && Mvu.getMvuData) {
        try {
            /* 尝试从最新消息获取，使用extractMvuGameData提取数据 */
            const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
            const gameData = extractMvuGameData(mvuData);
            if (gameData && hasContactEntries(gameData.羁绊列表)) {
                return gameData.羁绊列表;
            }
            /* 尝试从chat级别获取 */
            const chatData = Mvu.getMvuData({ type: 'chat' });
            const chatGameData = extractMvuGameData(chatData);
            if (chatGameData && hasContactEntries(chatGameData.羁绊列表)) {
                return chatGameData.羁绊列表;
            }
        } catch (e) {
            console.error('[手机状态栏] MVU获取羁绊列表失败:', e);
        }
    }
    return null;
}

/**
 * 获取联系人的有效键列表
 */
function getRelationshipKeys(collection) {
    if (!collection) return [];
    return Object.keys(collection);
}

// ==================== 角色头像配置 ====================
const CHARACTER_AVATAR_CONFIG = {
    '奈雅丽': 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%A4%B4%E5%83%8F/%E5%A5%88%E9%9B%85%E4%B8%BD.webp',
    '星极': 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%A4%B4%E5%83%8F/%E6%98%9F%E6%9E%81.webp',
    '法露特': 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%A4%B4%E5%83%8F/%E6%B3%95%E9%9C%B2%E7%89%B9.webp',
    '亚丝娜': 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%A4%B4%E5%83%8F/%E4%BA%9A%E4%B8%9D%E5%A8%9C.webp',
    '露露卡': 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%A4%B4%E5%83%8F/%E9%9C%B2%E9%9C%B2%E5%8D%A1.webp',
    '奥契丝': 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%A4%B4%E5%83%8F/%E5%A5%A5%E5%A5%91%E4%B8%9D.webp',
    '红莲': 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%A4%B4%E5%83%8F/%E7%BA%A2%E8%8E%B2.webp',
    '艾克莉西娅': 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%A4%B4%E5%83%8F/%E8%89%BE%E5%85%8B%E8%8E%89%E8%A5%BF%E5%A8%85.webp',
    '克拉米': 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%A4%B4%E5%83%8F/%E5%85%8B%E6%8B%89%E7%B1%B3.webp',
    '初濑伊纲': 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%A4%B4%E5%83%8F/%E5%88%9D%E6%BF%91%E4%BC%8A%E7%BA%B2.webp',
    '史蒂芬妮': 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%A4%B4%E5%83%8F/%E5%8F%B2%E8%92%82%E8%8A%AC%E5%A6%AE.webp',
    '吉普莉尔': 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%A4%B4%E5%83%8F/%E5%90%89%E6%99%AE%E8%8E%89%E5%B0%94.webp',
    '特图': 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%A4%B4%E5%83%8F/%E7%89%B9%E5%9B%BE.webp',
    '白': 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%A4%B4%E5%83%8F/%E7%99%BD.webp',
    '绯': 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%A4%B4%E5%83%8F/%E7%BB%AF.webp',
    '菲尔': 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%A4%B4%E5%83%8F/%E8%8F%B2%E5%B0%94.webp'
};

/**
 * 获取角色头像URL
 * @param {string} name - 角色名称
 * @returns {string|null} - 头像URL或null
 */
function getCharacterAvatar(name) {
    if (!name) return null;
    // 直接匹配
    if (CHARACTER_AVATAR_CONFIG[name]) {
        return CHARACTER_AVATAR_CONFIG[name];
    }
    // 模糊匹配：检查名称是否包含配置中的任何角色名
    for (const [charName, avatarUrl] of Object.entries(CHARACTER_AVATAR_CONFIG)) {
        if (name.includes(charName) || charName.includes(name)) {
            return avatarUrl;
        }
    }
    return null;
}

//  实时刷新相关变量
let messageEventListener = null;
let lastMessageCount = 0;
let isEventListening = false;
let refreshPollingInterval = null;

// ==================== 边界限制工具函数 ====================
// clamp 函数：将值限制在 min 和 max 之间
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// 获取可靠的视口尺寸（支持 iframe 和各种环境）
function getViewportSize() {
    // 优先使用 visualViewport（更准确，支持缩放）
    if (window.visualViewport) {
        const vv = window.visualViewport;
        if (vv.width > 0 && vv.height > 0) {
            return { width: vv.width, height: vv.height };
        }
    }

    // 回退到 innerWidth/innerHeight
    let w = window.innerWidth || document.documentElement.clientWidth || 0;
    let h = window.innerHeight || document.documentElement.clientHeight || 0;

    // iframe 中尝试父窗口
    if ((w === 0 || h === 0) && window.parent !== window) {
        try {
            const pw = window.parent.innerWidth || window.parent.document.documentElement.clientWidth;
            const ph = window.parent.innerHeight || window.parent.document.documentElement.clientHeight;
            if (pw > 0) w = pw;
            if (ph > 0) h = ph;
        } catch (e) {
            // 跨域无法访问父窗口
        }
    }

    // 最终回退到默认值（避免返回 0）
    return {
        width: w > 0 ? w : 800,
        height: h > 0 ? h : 600
    };
}

// 完全限制在视口内（不允许任何部分超出）
function constrainFullyInViewport(x, y, elementWidth, elementHeight) {
    const viewport = getViewportSize();

    const boundedX = clamp(x, 0, viewport.width - elementWidth);
    const boundedY = clamp(y, 0, viewport.height - elementHeight);

    return { x: boundedX, y: boundedY };
}

// 拖动相关变量
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let btnStartX = 0;
let btnStartY = 0;
let hasMoved = false;

// 手机界面拖动变量
let isPhoneDragging = false;
let phoneDragStartX = 0;
let phoneDragStartY = 0;
let phoneStartX = 0;
let phoneStartY = 0;

// 置顶状态
let isPinned = false;

// 壁纸数据
const phoneWpBaseUrl = 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%B0%81%E9%9D%A2/';
const phoneWpData = {
    '奈雅丽': ['奈雅丽'],
    '星极': ['星极'],
    '法露特': ['法露特'],
    '红莲': ['红莲'],
    '艾克莉西娅': ['艾克莉西娅'],
    '凯尔贝洛斯': ['凯尔贝洛斯'],
    '夜斗': ['夜斗'],
    '奥契丝': ['奥契丝'],
    '癌骑士': ['癌骑士'],
    '皇冠': ['皇冠'],
    '绯': ['绯'],
    '白': ['白'],
    '吉普莉尔': ['吉普莉尔'],
    '史蒂芬妮': ['史蒂芬妮'],
    '菲尔': ['菲尔'],
    '克拉米': ['克拉米'],
    '初濑伊纲': ['初濑伊纲']
};
// 生成完整URL的壁纸分类
const phoneWpCategories = Object.fromEntries(
    Object.entries(phoneWpData).map(([name, files]) => [
        name,
        files.map(file => `${phoneWpBaseUrl}${encodeURIComponent(file)}.webp`)
    ])
);



// 已加载的分类
const phoneWpLoaded = new Set();

// 当前壁纸
let phoneWpCurrent = localStorage.getItem('dnf-phone-wallpaper') || '';

// 当前聊天对象
let currentChatFriend = null;

// 论坛生成状态标记
let isForumGenerating = false;

//  论坛相关函数将在文件末尾"全局函数暴露"区域统一定义

// ==================== 初始化函数 ====================
function initializeMobilePhone() {

    //  论坛设置相关函数（在initializeMobilePhone中重新定义，确保作用域一致）
    window.phoneOpenForumSettings = function () {

        //  注意：返回时会重新生成论坛面板，所以不需要保存导航栈
        // 清空导航栈，确保不会有旧的导航历史干扰
        navigationStack.length = 0;

        const manager = window.phoneForumManager;
        const settings = manager.settings;
        const apiConfig = manager.apiConfig.settings;

        const html = `
            <div style="padding: 12px;">
                <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #2d3748;"> 论坛设置</h3>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 6px; font-size: 12px; color: #4a5568; font-weight: 500;"> 论坛风格</label>
                    <select id="forum-style" style="width: 100%; padding: 8px; background: white; border: 1px solid #cbd5e0; border-radius: 4px; color: #2d3748;">
                        <option value="特图的众神剧场" ${settings.forumStyle === '特图的众神剧场' ? 'selected' : ''}>特图的众神剧场</option>
                        ${settings.customStyles && settings.customStyles.length > 0 ? settings.customStyles.map(style =>
            `<option value="custom:${style.name}" ${settings.forumStyle === `custom:${style.name}` ? 'selected' : ''}>${style.name}</option>`
        ).join('') : ''}
                    </select>
                </div>
                
                <!-- 使用预设和世界书选项 -->
                <div style="margin-bottom: 16px;">
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 10px; background: #f7fafc; border: 1px solid #cbd5e0; border-radius: 4px;">
                        <input type="checkbox" id="use-preset-worldbook" ${settings.usePresetAndWorldBook ? 'checked' : ''} style="margin-right: 8px; width: 16px; height: 16px; cursor: pointer;">
                        <span style="font-size: 12px; color: #2d3748; font-weight: 500;">📚 使用预设和世界书</span>
                    </label>
                    <small style="display: block; margin-top: 4px; padding-left: 24px; font-size: 10px; color: #718096;">
                        启用后将使用酒馆当前预设及世界书；关闭后仅使用聊天历史和自定义提示词
                    </small>
                </div>
                
                <!-- API类型选择 -->
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 6px; font-size: 12px; color: #4a5568; font-weight: 500;"> API类型</label>
                    <select id="forum-api-type" style="width: 100%; padding: 8px; background: white; border: 1px solid #cbd5e0; border-radius: 4px; color: #2d3748;">
                        <option value="sillytavern" ${!apiConfig.enabled && settings.apiType === 'sillytavern' ? 'selected' : ''}>SillyTavern 默认</option>
                        <option value="custom" ${apiConfig.enabled || settings.apiType === 'custom' ? 'selected' : ''}>自定义 API（独立配置）</option>
                    </select>
                </div>
                
                <!-- 自定义 API 配置面板（独立配置） -->
                <div id="custom-api-settings" style="display: ${apiConfig.enabled || settings.apiType === 'custom' ? 'block' : 'none'}; margin-bottom: 16px; padding: 12px; background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 6px;">
                    <div style="margin-bottom: 10px;">
                        <label style="display: block; margin-bottom: 4px; font-size: 11px; color: #4a5568; font-weight: 500;">API URL (需兼容OpenAI)</label>
                        <input type="text" id="api-url" value="${escapeHtml(apiConfig.apiUrl)}" placeholder="例如: https://api.openai.com/v1" style="width: 100%; padding: 6px; background: white; border: 1px solid #cbd5e0; border-radius: 4px; color: #2d3748; box-sizing: border-box; font-size: 12px;">
                    </div>
                    
                    <div style="margin-bottom: 10px;">
                        <label style="display: block; margin-bottom: 4px; font-size: 11px; color: #4a5568; font-weight: 500;">API Key</label>
                        <input type="password" id="api-key" value="${escapeHtml(apiConfig.apiKey)}" placeholder="sk-..." style="width: 100%; padding: 6px; background: white; border: 1px solid #cbd5e0; border-radius: 4px; color: #2d3748; box-sizing: border-box; font-size: 12px;">
                    </div>
                    
                    <div style="margin-bottom: 10px;">
                        <label style="display: block; margin-bottom: 4px; font-size: 11px; color: #4a5568; font-weight: 500;">模型 (Model)</label>
                        <select id="api-model" style="width: 100%; padding: 6px; background: white; border: 1px solid #cbd5e0; border-radius: 4px; color: #2d3748; font-size: 12px;">
                            <option value="">请先获取模型列表...</option>
                        </select>
                        <div style="display: flex; gap: 6px; margin-top: 6px;">
                            <button id="fetch-models-btn" style="flex: 1; padding: 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                <i class="fas fa-sync-alt"></i> 获取模型
                            </button>
                            <button id="test-connection-btn" style="flex: 1; padding: 8px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                <i class="fas fa-check-circle"></i> 测试连接
                            </button>
                        </div>
                    </div>
                    
                    <div id="api-status" style="display: none; margin-top: 8px; padding: 8px; border-radius: 4px; font-size: 11px;"></div>
                    
                    <div style="margin-top: 8px; padding: 8px; background: #e0f2fe; border-radius: 4px; font-size: 10px; color: #0c4a6e;">
                        <strong>💡 提示：</strong>使用自定义 API 将独立调用 LLM
                    </div>
                    
                    <!-- 自动生成论坛配置（仅自定义API可用） -->
                    <div style="margin-top: 12px; padding: 10px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px;">
                        <div style="font-size: 12px; font-weight: 600; color: #92400e; margin-bottom: 8px;">
                            <i class="fas fa-magic"></i> 自动生成论坛
                        </div>
                        
                        <label style="display: flex; align-items: center; cursor: pointer; margin-bottom: 8px;">
                            <input type="checkbox" id="auto-generate-enabled" ${apiConfig.autoGenerate?.enabled ? 'checked' : ''} style="margin-right: 8px; width: 14px; height: 14px; cursor: pointer;">
                            <span style="font-size: 11px; color: #78350f;">启用自动生成</span>
                        </label>
                        
                        <div style="margin-bottom: 8px;">
                            <label style="display: block; margin-bottom: 4px; font-size: 10px; color: #78350f;">触发阈值（每隔多少楼自动生成）</label>
                            <input type="number" id="auto-generate-threshold" value="${apiConfig.autoGenerate?.threshold || 10}" min="1" max="100" style="width: 100%; padding: 5px; background: white; border: 1px solid #d97706; border-radius: 4px; color: #78350f; box-sizing: border-box; font-size: 11px;">
                        </div>
                        
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="auto-generate-notification" ${apiConfig.autoGenerate?.showNotification !== false ? 'checked' : ''} style="margin-right: 8px; width: 14px; height: 14px; cursor: pointer;">
                            <span style="font-size: 11px; color: #78350f;">生成时显示弹窗通知</span>
                        </label>
                        
                        <div style="margin-top: 6px; font-size: 9px; color: #a16207;">
                            💡 当聊天消息达到设定楼层数时，将自动生成论坛内容
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button id="manage-custom-styles-btn" style="width: 100%; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 14px;">
                         自定义论坛
                    </button>
                    <div style="display: flex; gap: 8px;">
                        <button class="phone-forum-save-settings-btn" style="flex: 1; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
                            <i class="fas fa-save"></i> 保存
                        </button>
                        <button class="phone-forum-close-settings-btn" style="flex: 1; padding: 10px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
                            <i class="fas fa-times"></i> 取消
                        </button>
                    </div>
                </div>
            </div>
        `;

        $('#phone-app-title').text(' 论坛设置');
        $('#phone-app-body').html(html);


        //  关键！绑定所有按钮事件（在HTML插入后立即绑定）
        setTimeout(() => {
            // 恢复已保存的模型到下拉框
            const savedModel = apiConfig.model;
            if (savedModel) {
                const $modelSelect = $('#api-model');
                // 如果已保存模型，添加到下拉框并选中
                $modelSelect.append($('<option>', {
                    value: savedModel,
                    text: savedModel,
                    selected: true
                }));
            }

            // 绑定API类型切换事件
            $('#forum-api-type').off('change').on('change', function () {
                const isCustom = $(this).val() === 'custom';
                $('#custom-api-settings').toggle(isCustom);
            });

            // 绑定获取模型按钮
            $('#fetch-models-btn').off('click').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.phoneFetchModels && window.phoneFetchModels();
            });

            // 绑定测试连接按钮
            $('#test-connection-btn').off('click').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.phoneTestConnection && window.phoneTestConnection();
            });

            // 绑定管理自定义风格按钮
            $('#manage-custom-styles-btn').off('click').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.phoneManageCustomStyles && window.phoneManageCustomStyles();
            });

            // 绑定保存按钮
            $('.phone-forum-save-settings-btn').off('click').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.phoneSaveForumSettings && window.phoneSaveForumSettings();
            });

            // 绑定关闭按钮
            $('.phone-forum-close-settings-btn').off('click').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.phoneCloseForumSettings && window.phoneCloseForumSettings();
            });

        }, 0);
    };

    window.phoneSaveForumSettings = function () {

        try {
            const manager = window.phoneForumManager;

            if (!manager) {
                if (typeof toastr !== 'undefined') {
                    toastr.error('管理器未初始化！', '论坛');
                }
                return;
            }

            // 读取所有设置值
            const forumStyle = $('#forum-style').val();
            const apiType = $('#forum-api-type').val();
            const usePresetAndWorldBook = $('#use-preset-worldbook').is(':checked');

            // 保存论坛设置
            manager.settings.forumStyle = forumStyle;
            manager.settings.apiType = apiType;
            manager.settings.usePresetAndWorldBook = usePresetAndWorldBook;
            manager.saveSettings();

            // 保存独立 API 配置（只有选择"自定义API"时才启用）
            manager.apiConfig.settings.enabled = (apiType === 'custom');

            if (apiType === 'custom') {
                //  读取独立API配置（限定在当前显示的phone-app-body内）
                const $currentBody = $('#phone-app-body');
                const selectedModel = $currentBody.find('#api-model').val() || '';

                manager.apiConfig.settings.apiUrl = $currentBody.find('#api-url').val();
                manager.apiConfig.settings.apiKey = $currentBody.find('#api-key').val();
                manager.apiConfig.settings.model = selectedModel;

                // 保存自动生成论坛配置
                manager.apiConfig.settings.autoGenerate = {
                    enabled: $currentBody.find('#auto-generate-enabled').is(':checked'),
                    threshold: parseInt($currentBody.find('#auto-generate-threshold').val()) || 10,
                    showNotification: $currentBody.find('#auto-generate-notification').is(':checked')
                };

                // 如果启用了自动生成，重置计数器
                if (manager.apiConfig.settings.autoGenerate.enabled) {
                    manager.apiConfig.resetAutoGenerateCounter();
                }
            }

            manager.apiConfig.saveSettings();


            if (typeof toastr !== 'undefined') {
                toastr.success('设置已保存！', '论坛');
            }

            //  返回论坛界面 - 重新生成而不是恢复旧HTML，确保事件绑定正确
            setTimeout(() => {

                // 清空导航栈（因为我们要重新生成，不需要旧内容）
                navigationStack.length = 0;

                // 重新生成论坛面板，确保所有事件都正确绑定
                $('#phone-app-title').text(' 论坛');
                $('#phone-app-body').html(generateForumPanel());

            }, 100);
        } catch (error) {
            if (typeof toastr !== 'undefined') {
                toastr.error('保存设置失败: ' + error.message, '论坛');
            }
        }
    };

    window.phoneCloseForumSettings = function () {

        //  重新生成论坛面板而不是恢复旧HTML，确保事件绑定正确
        // 清空导航栈
        navigationStack.length = 0;

        // 重新生成论坛面板
        $('#phone-app-title').text(' 论坛');
        $('#phone-app-body').html(generateForumPanel());

    };

    //  自定义风格管理函数
    window.phoneManageCustomStyles = function () {

        const manager = window.phoneForumManager;
        const customStyles = manager.settings.customStyles || [];

        const html = `
            <div style="padding: 12px;">
                <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #2d3748;"> 自定义风格管理</h3>
                
                <button id="add-custom-style-btn" style="width: 100%; padding: 10px; margin-bottom: 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
                     新建自定义风格
                </button>
                
                <div id="custom-styles-list" style="margin-bottom: 16px;">
                    ${customStyles.length === 0 ?
                '<div style="text-align: center; padding: 20px; color: #718096; font-size: 12px;">暂无自定义风格</div>' :
                customStyles.map((style, index) => `
                            <div class="custom-style-item" data-index="${index}" style="background: white; border: 1px solid #cbd5e0; border-radius: 4px; padding: 10px; margin-bottom: 8px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="font-weight: 500; color: #2d3748; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(style.name)}</div>
                                        <div style="font-size: 11px; color: #718096; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(style.prompt.substring(0, 50))}...</div>
                                    </div>
                                    <div style="display: flex; gap: 6px; margin-left: 10px;">
                                        <button class="edit-custom-style-btn" data-index="${index}" style="padding: 6px 10px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
                                             编辑
                                        </button>
                                        <button class="delete-custom-style-btn" data-index="${index}" style="padding: 6px 10px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
                                             删除
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')
            }
                </div>
                
                <button class="phone-back-to-settings-btn" style="width: 100%; padding: 10px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
                    ← 返回设置
                </button>
            </div>
        `;

        $('#phone-app-title').text(' 自定义风格管理');
        $('#phone-app-body').html(html);

        // 绑定事件
        setTimeout(() => {
            // 新建按钮
            $('#add-custom-style-btn').off('click').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.phoneShowCustomStyleEditor && window.phoneShowCustomStyleEditor();
            });

            // 编辑按钮
            $('.edit-custom-style-btn').off('click').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const index = $(this).data('index');
                window.phoneShowCustomStyleEditor && window.phoneShowCustomStyleEditor(index);
            });

            // 删除按钮
            $('.delete-custom-style-btn').off('click').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const index = $(this).data('index');
                if (confirm('确定要删除这个自定义风格吗？')) {
                    window.phoneDeleteCustomStyle && window.phoneDeleteCustomStyle(index);
                }
            });

            // 返回按钮
            $('.phone-back-to-settings-btn').off('click').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.phoneOpenForumSettings && window.phoneOpenForumSettings();
            });
        }, 0);
    };

    window.phoneShowCustomStyleEditor = function (editIndex) {

        const manager = window.phoneForumManager;
        const isEdit = editIndex !== undefined;
        const style = isEdit ? manager.settings.customStyles[editIndex] : { name: '', prompt: '' };

        const html = `
            <div style="padding: 12px;">
                <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #2d3748;">${isEdit ? ' 编辑' : ' 新建'}自定义风格</h3>
                
                <div style="margin-bottom: 12px;">
                    <label style="display: block; margin-bottom: 6px; font-size: 12px; color: #4a5568; font-weight: 500;">风格名称</label>
                    <input type="text" id="custom-style-name" value="${escapeHtml(style.name)}" placeholder="例如：小红书" style="width: 100%; padding: 8px; background: white; border: 1px solid #cbd5e0; border-radius: 4px; color: #2d3748; box-sizing: border-box;">
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="display: block; margin-bottom: 6px; font-size: 12px; color: #4a5568; font-weight: 500;">风格提示词</label>
                    <textarea id="custom-style-prompt" placeholder="输入论坛风格的详细描述，类似于预设风格的 stylePrompts..." style="width: 100%; min-height: 300px; padding: 8px; background: white; border: 1px solid #cbd5e0; border-radius: 4px; color: #2d3748; box-sizing: border-box; font-family: monospace; font-size: 11px; resize: vertical;">${escapeHtml(style.prompt)}</textarea>
                    <div style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
                        <small style="font-size: 10px; color: #718096;">
                             提示：可以参考预设风格的格式，包括论坛核心设定、角色要求、论坛风格、常见内容类型等
                        </small>
                        <button id="import-example-btn" style="padding: 6px 12px; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500; white-space: nowrap;">
                             导入示例
                        </button>
                    </div>
                </div>
                
                <div style="display: flex; gap: 8px;">
                    <button id="save-custom-style-btn" data-index="${editIndex !== undefined ? editIndex : ''}" style="flex: 1; padding: 10px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
                         保存
                    </button>
                    <button class="phone-back-to-manage-btn" style="flex: 1; padding: 10px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
                        ← 取消
                    </button>
                </div>
            </div>
        `;

        $('#phone-app-title').text(isEdit ? ' 编辑自定义风格' : ' 新建自定义风格');
        $('#phone-app-body').html(html);

        // 绑定事件
        setTimeout(() => {
            // 导入示例按钮
            $('#import-example-btn').off('click').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.phoneImportExamplePrompt && window.phoneImportExamplePrompt();
            });

            // 保存按钮
            $('#save-custom-style-btn').off('click').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const index = $(this).data('index');
                window.phoneSaveCustomStyle && window.phoneSaveCustomStyle(index !== '' ? index : undefined);
            });

            // 取消按钮
            $('.phone-back-to-manage-btn').off('click').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.phoneManageCustomStyles && window.phoneManageCustomStyles();
            });
        }, 0);
    };

    window.phoneSaveCustomStyle = function (editIndex) {

        const manager = window.phoneForumManager;
        const name = $('#custom-style-name').val().trim();
        const prompt = $('#custom-style-prompt').val().trim();

        // 验证
        if (!name) {
            if (typeof toastr !== 'undefined') {
                toastr.error('请输入风格名称', '论坛');
            }
            return;
        }

        if (!prompt) {
            if (typeof toastr !== 'undefined') {
                toastr.error('请输入风格提示词', '论坛');
            }
            return;
        }

        // 检查名称是否重复（编辑时排除自身）
        const isDuplicate = manager.settings.customStyles.some((style, index) =>
            style.name === name && index !== editIndex
        );

        if (isDuplicate) {
            if (typeof toastr !== 'undefined') {
                toastr.error('风格名称已存在', '论坛');
            }
            return;
        }

        // 保存或更新
        if (editIndex !== undefined) {
            // 编辑现有风格
            manager.settings.customStyles[editIndex] = { name, prompt };
        } else {
            // 新建风格
            if (!manager.settings.customStyles) {
                manager.settings.customStyles = [];
            }
            manager.settings.customStyles.push({ name, prompt });
        }

        manager.saveSettings();

        if (typeof toastr !== 'undefined') {
            toastr.success(editIndex !== undefined ? '风格已更新' : '风格已创建', '论坛');
        }

        // 返回管理页面
        window.phoneManageCustomStyles && window.phoneManageCustomStyles();
    };

    window.phoneImportExamplePrompt = function () {

        const examplePrompt = `## 论坛风格：特图的众神剧场

**核心设定——四方世界的诸神：**
很久很久以前，《秩序》诸神与《混沌》诸神争斗不休，双方筋疲力竭。《宿命》与《偶然》的骰子胜负由此展开——诸神以骰子创造了四方世界与棋子，以冒险决定胜负。当第一位人类战士集结同伴、踏上旅途、讨伐巨龙时，诸神为之狂热。他们立下黄金誓约：不对棋盘进行必要以上的干涉，只在冒险时掷下骰子，尊重棋子的自由意志。

现在这些四方的神明被特图邀请来观看属于迪斯博德和阿拉德世界融合后发生的故事。

**发帖者身份与命名：**
- 特图就叫"特图"，其余神明称号格式要多样化混用：
  - "XX神"：战争神、酒神 / "XX之神"：欺诈之神、风暴之神 / "XX女神"：丰收女神、月之女神
  - 尊称：大地母神、太阳主 / 抽象概念：宿命、偶然、真实 / 其他：织梦者、裁决者、猎手
- 同一位神明可以反复出现，特图不需要每帖都在

**神明说话的质感（极其重要）：**
- 参考原文语感："冒险！冒险！还是冒险！没有什么语言能形容这种美好的感觉！"——有激情有史诗感，但不装腔作势
- 禁止古风中二腔："吾见证了……""力量即是正义""吾等领域的权柄"——比口语化更糟糕
- 也不要网络口语："哇好帅啊！""馋死我了"
- 正确方向：自然、有力、带着真实情感。回复之间要有对话感，有反驳有补充有跑题

**内容格调（极其重要）：**
- 关注冒险、战斗、命运转折、英雄崛起陨落、势力博弈——宏大叙事，不要日常琐事
- "宏大"不等于"严肃"，讨论应该热烈、有趣、充满激情，不是老学究写论文

**帖子内容来源：**
- 最多一半与玩家当前剧情有关
- 至少一半是棋盘上其他地方的故事（羁绊角色、DNF原作人物、游戏人生原作人物等）

**论坛氛围：**
- 要有娱乐性和可读性，不要写成设定集
- 帖子之间可以有关联，有的热闹有的冷清
- 不要每个帖子都在强调骰子、棋盘等设定元素`;

        // 将示例提示词填充到编辑框
        $('#custom-style-prompt').val(examplePrompt);

        if (typeof toastr !== 'undefined') {
            toastr.success('已导入特图的众神剧场示例', '论坛');
        }
    };

    window.phoneDeleteCustomStyle = function (index) {

        const manager = window.phoneForumManager;
        const deletedStyle = manager.settings.customStyles[index];

        // 如果当前选择的就是要删除的风格，则切换到默认风格
        if (manager.settings.forumStyle === `custom:${deletedStyle.name}`) {
            manager.settings.forumStyle = '特图的众神剧场';
        }

        // 删除风格
        manager.settings.customStyles.splice(index, 1);
        manager.saveSettings();

        if (typeof toastr !== 'undefined') {
            toastr.success('风格已删除', '论坛');
        }

        // 刷新管理页面
        window.phoneManageCustomStyles && window.phoneManageCustomStyles();
    };

    // 🔧 API 配置辅助函数已移除，使用phoneFetchModels替代

    window.phoneShowAPIStatus = function (message, type = 'info') {
        const statusDiv = $('#api-status');
        if (!statusDiv.length) return;

        const colors = {
            info: '#3b82f6',
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b'
        };

        const bgColors = {
            info: '#eff6ff',
            success: '#f0fdf4',
            error: '#fef2f2',
            warning: '#fffbeb'
        };

        statusDiv.css({
            'display': 'block',
            'color': colors[type] || colors.info,
            'background': bgColors[type] || bgColors.info,
            'border': `1px solid ${colors[type] || colors.info}`
        });
        statusDiv.text(message);

        // 自动隐藏成功消息
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.fadeOut();
            }, 3000);
        }
    };

    // 获取可用模型列表
    window.phoneFetchModels = async function () {
        const $currentBody = $('#phone-app-body');
        const apiUrl = $currentBody.find('#api-url').val().trim();
        const apiKey = $currentBody.find('#api-key').val().trim();
        const modelSelect = $currentBody.find('#api-model')[0];
        const buttonElement = $currentBody.find('#fetch-models-btn')[0];

        if (!apiUrl) {
            window.phoneShowAPIStatus('⚠️ 请先填写 API URL！', 'warning');
            return;
        }

        const originalBtnHTML = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在获取...';
        buttonElement.disabled = true;

        try {
            let cleanedApiUrl = apiUrl.replace(/\/$/, '');
            if (!cleanedApiUrl.endsWith('/v1')) {
                cleanedApiUrl += '/v1';
            }

            let fetchUrl = cleanedApiUrl.endsWith('/models') ? cleanedApiUrl : `${cleanedApiUrl}/models`;

            const headers = {};
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }

            const fetchOptions = {
                method: 'GET',
                headers: headers
            };

            const response = await fetch(fetchUrl, fetchOptions);
            if (!response.ok) {
                const errorText = await response.text();
                let errorDetail = '请求失败';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorDetail = errorJson.error?.message || errorText;
                } catch (e) {
                    errorDetail = errorText;
                }
                throw new Error(`HTTP ${response.status}: ${errorDetail}`);
            }

            const responseText = await response.text();
            let data;
            try {
                data = responseText ? JSON.parse(responseText) : [];
            } catch (e) {
                throw new Error('API响应不是有效的JSON格式。');
            }

            let models = [];
            if (data && data.models && Array.isArray(data.models)) {
                models = data.models.map(model => model.name).filter(Boolean);
            } else if (data && data.data && Array.isArray(data.data)) {
                models = data.data.map(model => model.id).filter(Boolean);
            } else if (Array.isArray(data)) {
                models = data.map(model => (typeof model === 'string' ? model : model.id)).filter(Boolean);
            }

            modelSelect.innerHTML = '';
            if (models.length > 0) {
                models.sort();
                models.forEach(modelId => {
                    const option = document.createElement('option');
                    option.value = modelId;
                    option.textContent = modelId;
                    modelSelect.appendChild(option);
                });
                modelSelect.selectedIndex = 0;

                window.phoneShowAPIStatus(`✅ 成功获取 ${models.length} 个模型！`, 'success');
            } else {
                modelSelect.innerHTML = '<option disabled>未获取到模型</option>';
                window.phoneShowAPIStatus('⚠️ API返回成功，但模型列表为空或格式无法识别。', 'warning');
            }

        } catch (error) {
            console.error('获取模型失败:', error);
            modelSelect.innerHTML = '<option>获取失败</option>';
            window.phoneShowAPIStatus(`❌ 获取模型失败: ${error.message}`, 'error');
        } finally {
            buttonElement.innerHTML = originalBtnHTML;
            buttonElement.disabled = false;
        }
    };

    window.phoneTestConnection = async function () {
        const manager = window.phoneForumManager;
        const $currentBody = $('#phone-app-body');

        const apiUrl = $currentBody.find('#api-url').val();
        const apiKey = $currentBody.find('#api-key').val();
        const model = $currentBody.find('#api-model').val() || '';

        if (!apiUrl) {
            window.phoneShowAPIStatus('⚠️ 请先填写 API 地址', 'warning');
            return;
        }

        if (!apiKey) {
            window.phoneShowAPIStatus('⚠️ 请先填写 API 密钥', 'warning');
            return;
        }

        if (!model) {
            window.phoneShowAPIStatus('⚠️ 请先选择模型', 'warning');
            return;
        }

        window.phoneShowAPIStatus('🔄 正在测试连接...', 'info');

        try {
            const result = await manager.apiConfig.testConnection(apiUrl, apiKey, model);

            if (result.success) {
                window.phoneShowAPIStatus('✅ 连接测试成功！', 'success');
            } else {
                window.phoneShowAPIStatus(`❌ 连接测试失败: ${result.error}`, 'error');
            }
        } catch (error) {
            window.phoneShowAPIStatus(`❌ 连接测试失败: ${error.message}`, 'error');
        }
    };

    // 创建事件处理函数（可被多个地方复用）
    window.handlePhoneLiveButtonClick = function (e) {
        const target = e.target;

        // 安全检查
        if (!target || !target.classList) {
            return;
        }

        const classList = target.classList;
        const classArray = Array.from(classList);

        // 检查论坛按钮
        if (classArray.includes('phone-forum-generate-btn')) {
            e.preventDefault();
            e.stopPropagation();
            window.phoneGenerateForum && window.phoneGenerateForum();
            return;
        }

        if (classArray.includes('phone-forum-settings-btn')) {
            e.preventDefault();
            e.stopPropagation();
            window.phoneOpenForumSettings && window.phoneOpenForumSettings();
            return;
        }

        if (classArray.includes('phone-forum-save-settings-btn')) {
            e.preventDefault();
            e.stopPropagation();
            window.phoneSaveForumSettings && window.phoneSaveForumSettings();
            return;
        }

        if (classArray.includes('phone-forum-close-settings-btn')) {
            e.preventDefault();
            e.stopPropagation();
            window.phoneCloseForumSettings && window.phoneCloseForumSettings();
            return;
        }

        // 如果点击的是按钮内的图标、文字或 DIV，向上查找按钮
        if ((target.tagName === 'I' || target.tagName === 'SPAN' || target.tagName === 'DIV') && target.parentElement) {
            const parentClasses = Array.from(target.parentElement.classList || []);

            if (parentClasses.includes('phone-forum-generate-btn')) {
                e.preventDefault();
                e.stopPropagation();
                window.phoneGenerateForum && window.phoneGenerateForum();
                return;
            }

            if (parentClasses.includes('phone-forum-settings-btn')) {
                e.preventDefault();
                e.stopPropagation();
                window.phoneOpenForumSettings && window.phoneOpenForumSettings();
                return;
            }

            if (parentClasses.includes('phone-forum-save-settings-btn')) {
                e.preventDefault();
                e.stopPropagation();
                window.phoneSaveForumSettings && window.phoneSaveForumSettings();
                return;
            }

            if (parentClasses.includes('phone-forum-close-settings-btn')) {
                e.preventDefault();
                e.stopPropagation();
                window.phoneCloseForumSettings && window.phoneCloseForumSettings();
                return;
            }

        }
    };

    try {
        // 在主文档上监听（用于论坛按钮的捕获阶段处理）
        document.addEventListener('click', window.handlePhoneLiveButtonClick, true);

        // 清理旧元素
        $('#mobile-trigger-btn').remove();
        $('#mobile-phone-overlay').remove();
        $('#mobile-phone-styles').remove();

        // 加载 Font Awesome（安全方式，不会触发SillyTavern的检测）
        loadFontAwesome();

        // 注入样式
        $('head').append(phoneStyles);

        // 创建触发按钮 - Brushed Metal风格（复刻状态栏悬浮球）
        // 生成八角星路径 - 复用状态栏.js的AppleStyle-Star算法
        function getOctagramPath(R, rotationOffsetDeg) {
            rotationOffsetDeg = rotationOffsetDeg || 0;
            var d = "M ";
            var N = 8;
            var K = 3;
            var offsetRad = rotationOffsetDeg * Math.PI / 180;
            var cx = 50;
            var cy = 50;
            for (var i = 0; i <= N; i++) {
                var idx = (i * K) % N;
                var angle = (idx * 2 * Math.PI / N) - Math.PI / 2 + offsetRad;
                var x = cx + Math.cos(angle) * R;
                var y = cy + Math.sin(angle) * R;
                if (i === 0) d += x.toFixed(2) + "," + y.toFixed(2) + " ";
                else d += "L " + x.toFixed(2) + "," + y.toFixed(2) + " ";
            }
            d += "Z";
            return d;
        }
        const pathData1 = getOctagramPath(35, 0);
        const pathData2 = getOctagramPath(35, 22.5);

        const triggerBtn = $('<button>', {
            id: 'mobile-trigger-btn',
            title: '打开手机'
        });
        triggerBtn.html(`
            <div class="star-container">
                <svg class="icon-svg" viewBox="0 0 100 100" style="overflow:visible !important;display:block !important;visibility:visible !important;">
                    <path d="${pathData1}" style="fill:none !important;stroke:#666 !important;stroke-width:2 !important;opacity:0.7 !important;stroke-linecap:round !important;stroke-linejoin:round !important;visibility:visible !important;"></path>
                    <path d="${pathData2}" style="fill:none !important;stroke:#666 !important;stroke-width:2 !important;opacity:0.7 !important;stroke-linecap:round !important;stroke-linejoin:round !important;visibility:visible !important;"></path>
                    <path class="layer-2" d="${pathData2}" style="fill:none !important;stroke:#999 !important;stroke-width:1.5 !important;opacity:1 !important;stroke-linecap:round !important;stroke-linejoin:round !important;visibility:visible !important;stroke-dasharray:100 400;"></path>
                    <path class="layer-1" d="${pathData1}" style="fill:none !important;stroke:#555 !important;stroke-width:2 !important;opacity:0.8 !important;stroke-linecap:round !important;stroke-linejoin:round !important;visibility:visible !important;stroke-dasharray:100 400;"></path>
                    <circle cx="50" cy="50" r="12" style="fill:none !important;stroke:#777 !important;stroke-width:1.5 !important;visibility:visible !important;"></circle>
                </svg>
            </div>
        `);

        // 创建手机界面
        const phoneOverlay = $('<div>', {
            id: 'mobile-phone-overlay',
            html: `
                <div class="mobile-phone-frame">
                    <div class="mobile-phone-screen">
                        <!-- 状态栏 -->
                        <div class="mobile-status-bar">
                            <div class="status-left">
                                <span style="display: flex; align-items: center; gap: 4px; color: #666; font-size: 12px; font-weight: 500;">
                                    <i class="fas fa-cloud" id="phone-status-weather-icon" style="font-size: 12px;"></i>
                                    <span id="phone-status-weather">多云</span>
                                </span>
                            </div>
                            <div class="status-center" id="phone-drag-handle" style="cursor: move; flex: 1; display: flex; justify-content: center; align-items: center; position: absolute; left: 50%; transform: translateX(-50%);" title="拖动手机界面">
                                <span class="time" style="color: #666; font-size: 12px; font-weight: 500;" id="phone-status-time">14:30</span>
                            </div>
                            <div class="status-right">
                                <span class="battery">
                                    <i class="fas fa-battery-full"></i>
                                    <span class="battery-text">100%</span>
                                </span>
                                <button id="phone-pin-btn" class="pin-btn" title="置顶/取消置顶">
                                    <i class="fas fa-thumbtack"></i>
                                </button>
                            </div>
                        </div>

                        <!-- 主内容区域 -->
                        <div class="mobile-content">
                            <!-- 主界面 -->
                            <div class="home-screen" id="phone-home-screen">
                                <!-- 时间天气卡片 -->
                                <div class="weather-card">
                                    <div class="weather-time">
                                        <span class="current-time" id="phone-big-time">14:30</span>
                                        <span class="current-date" id="phone-date">11/09</span>
                                    </div>
                                    <div class="weather-info">
                                        <i class="fas fa-cloud" style="font-size: 16px; color: #585858;"></i>
                                        <span class="weather-desc" id="phone-weather">多云</span>
                                    </div>
                                </div>

                                <!-- 应用页面容器 -->
                                <div class="app-pages-container">
                                    <!-- 滑动包装器 -->
                                    <div class="app-pages-wrapper" id="app-pages-wrapper">
                                        <!-- 第一页 -->
                                        <div class="app-page">
                                            <div class="app-grid">
                                                <!-- 第一行：信息，CG收集，论坛 -->
                                                <div class="app-row">
                                                    <div class="app-icon" data-app="messages">
                                                        <div class="app-icon-bg md-blue">
                                                            <i class="fas fa-comments"></i>
                                                        </div>
                                                        <span class="app-label">信息</span>
                                                    </div>
                                                    <div class="app-icon" data-app="gallery">
                                                        <div class="app-icon-bg md-green">
                                                            <i class="fas fa-images"></i>
                                                        </div>
                                                        <span class="app-label">CG收集</span>
                                                    </div>
                                                    <div class="app-icon" data-app="forum">
                                                        <div class="app-icon-bg md-purple">
                                                            <i class="fas fa-comments"></i>
                                                        </div>
                                                        <span class="app-label">论坛</span>
                                                    </div>
                                                </div>
                                                <!-- 第二行：羁绊，壁纸，设置 -->
                                                <div class="app-row">
                                                    <div class="app-icon" data-app="friends">
                                                        <div class="app-icon-bg md-pink">
                                                            <i class="fas fa-user-friends"></i>
                                                        </div>
                                                        <span class="app-label">羁绊</span>
                                                    </div>
                                                    <div class="app-icon" data-app="wallpaper">
                                                        <div class="app-icon-bg md-pink">
                                                            <i class="fas fa-image"></i>
                                                        </div>
                                                        <span class="app-label">壁纸</span>
                                                    </div>
                                                    <div class="app-icon" data-app="settings">
                                                        <div class="app-icon-bg md-blue">
                                                            <i class="fas fa-cog"></i>
                                                        </div>
                                                        <span class="app-label">设置</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- 第二页（已去除重复入口） -->
                                    </div>
                                    
                                    <!-- 页面指示器 -->
                                    <div class="page-indicators" id="page-indicators">
                                        <div class="indicator active"></div>
                                    </div>
                                </div>
                                
                                <!-- 全屏按钮 -->
                                <button id="wallpaper-fullscreen-btn" class="wallpaper-fullscreen-btn" title="查看壁纸大图">
                                    <i class="fas fa-expand"></i>
                                </button>
                            </div>

                            <!-- 应用详情面板 -->
                            <div class="app-detail-panel" id="phone-detail-panel">
                                <div class="app-header">
                                    <button class="back-button" id="phone-back-btn">
                                        <i class="fas fa-chevron-left"></i>
                                    </button>
                                    <span class="app-title" id="phone-app-title">应用</span>
                                    <div style="width: 36px;"></div>
                                </div>
                                <div class="app-body" id="phone-app-body">
                                    <!-- 应用内容将在这里动态加载 -->
                                </div>
                            </div>

                            <!-- 聊天面板 -->
                            <div class="chat-panel" id="phone-chat-panel">
                                <div class="chat-header">
                                    <button class="back-button" id="chat-back-btn">
                                        <i class="fas fa-chevron-left"></i>
                                    </button>
                                    <span class="app-title" id="chat-title" style="flex: 1;">聊天</span>
                                    <div id="chat-right-actions" style="width: 36px; flex-shrink: 0;"></div>
                                </div>
                                <div class="chat-messages" id="chat-messages">
                                </div>
                                <div class="chat-input-area">
                                    <input type="text" class="chat-input" id="chat-input" placeholder="输入消息...">
                                    <button class="chat-send-btn" id="chat-send-btn">
                                        <i class="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- 全屏壁纸查看器 -->
                            <div class="wallpaper-fullscreen-viewer" id="wallpaper-fullscreen-viewer">
                                <button class="wallpaper-close-btn" id="wallpaper-close-btn">
                                    <i class="fas fa-times"></i>
                                </button>
                                <div class="cg-nav-controls" id="cg-nav-controls" style="display: none; position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 15px; z-index: 210;">
                                    <button class="cg-nav-btn" id="cg-prev-btn" style="width: 40px; height: 40px; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 50%; font-size: 16px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: all 0.2s; display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-chevron-left"></i>
                                    </button>
                                    <button class="cg-set-wallpaper-btn" id="cg-set-wallpaper-btn" style="padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border: none; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; box-shadow: 0 3px 12px rgba(102, 126, 234, 0.4); white-space: nowrap;">
                                        <i class="fas fa-image" style="margin-right: 6px;"></i>设为壁纸
                                    </button>
                                    <button class="cg-nav-btn" id="cg-next-btn" style="width: 40px; height: 40px; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 50%; font-size: 16px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: all 0.2s; display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                                <div class="cg-index-display" id="cg-index-display" style="display: none; position: absolute; top: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.5); color: #fff; padding: 4px 12px; border-radius: 12px; font-size: 12px; z-index: 210;"></div>
                                <img id="wallpaper-fullscreen-img" src="" alt="壁纸预览">
                            </div>
                        </div>
                    </div>
                </div>
            `
        });

        $('body').append(triggerBtn);
        $('body').append(phoneOverlay);

        // 延迟绑定事件，确保 DOM 完全就绪
        setTimeout(() => {
            bindPhoneEvents();
        }, 0);

        // 注册MVU事件监听
        registerMvuEventListeners();



        // 更新时间
        updatePhoneTime();
        setInterval(updatePhoneTime, 60000);

        //  每次初始化时重置悬浮球位置到初始位置
        localStorage.removeItem('mobile-trigger-btn-position');
        localStorage.removeItem('mobile-trigger-btn-user-dragged');

        //  主动调用位置重置，确保在正确的初始位置
        // 桌面端：离右边三分之一距离的垂直中央
        // 移动端：右边垂直居中
        setTimeout(() => {
            window.resetMobileButtonPosition && window.resetMobileButtonPosition();
        }, 100);

        // 恢复保存的壁纸和手机尺寸
        setTimeout(() => {
            restoreWallpaper();
            restorePhoneSize();
        }, 200);

        // 标记全局变量供依赖检测（挂到父窗口，跨iframe可见）
        try { (window.parent || window).__小手机脚本_loaded__ = true; } catch(e) { window.__小手机脚本_loaded__ = true; }

    } catch (error) {
        if (typeof toastr !== 'undefined') {
            toastr.error('手机界面初始化失败：' + error.message);
        }
    }
}

// ==================== 事件绑定 ====================
function bindPhoneEvents() {

    // 触发按钮点击和拖动
    const $triggerBtn = $('#mobile-trigger-btn');

    // 使用 Pointer Events 统一处理拖拽和点击（参考状态栏.js）
    const btnElement = $triggerBtn[0];
    let isDrag = false;
    let pStartX = 0, pStartY = 0, pStartLeft = 0, pStartTop = 0;

    const onPointerMove = function (e) {
        if (!isDrag) return;
        e.cancelable && e.preventDefault();
        const dx = e.screenX - pStartX;
        const dy = e.screenY - pStartY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            $triggerBtn.addClass('dragging');
        }
        if ($triggerBtn.hasClass('dragging')) {
            hasMoved = true;
            // 移除响应式定位类，切换到绝对定位
            $triggerBtn.removeClass('mobile-mode tablet-mode desktop-mode');

            let newX = pStartLeft + dx;
            let newY = pStartTop + dy;
            const btnWidth = $triggerBtn.outerWidth() || 60;
            const btnHeight = $triggerBtn.outerHeight() || 60;
            const bounded = constrainFullyInViewport(newX, newY, btnWidth, btnHeight);

            btnElement.style.setProperty('left', bounded.x + 'px', 'important');
            btnElement.style.setProperty('top', bounded.y + 'px', 'important');
            btnElement.style.setProperty('right', 'auto', 'important');
            btnElement.style.setProperty('bottom', 'auto', 'important');
            btnElement.style.setProperty('transform', 'none', 'important');
        }
    };

    const onPointerUp = function (e) {
        const win = btnElement.ownerDocument.defaultView || window;
        win.removeEventListener('pointermove', onPointerMove);
        win.removeEventListener('pointerup', onPointerUp);
        win.removeEventListener('pointercancel', onPointerUp);
        if (btnElement.releasePointerCapture) {
            try { btnElement.releasePointerCapture(e.pointerId); } catch (err) { }
        }

        if ($triggerBtn.hasClass('dragging')) {
            // 拖拽结束，保存位置
            const rect = btnElement.getBoundingClientRect();
            try {
                const position = { left: rect.left, top: rect.top };
                localStorage.setItem('mobile-trigger-btn-position', JSON.stringify(position));
                localStorage.setItem('mobile-trigger-btn-user-dragged', 'true');
            } catch (err) { }
            setTimeout(() => {
                $triggerBtn.removeClass('dragging');
                hasMoved = false;
            }, 50);
        } else if (e.type === 'pointerup') {
            // 没有拖拽，视为点击
            const $overlay = $('#mobile-phone-overlay');
            if ($overlay.hasClass('active')) {
                closeMobilePhone();
            } else {
                openMobilePhone();
            }
        }
        isDrag = false;
    };

    btnElement.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        e.cancelable && e.preventDefault();
        e.stopPropagation();
        isDrag = true;
        hasMoved = false;
        pStartX = e.screenX;
        pStartY = e.screenY;
        const rect = btnElement.getBoundingClientRect();
        pStartLeft = rect.left;
        pStartTop = rect.top;
        if (btnElement.setPointerCapture) {
            try { btnElement.setPointerCapture(e.pointerId); } catch (err) { }
        }
        const win = btnElement.ownerDocument.defaultView || window;
        win.addEventListener('pointermove', onPointerMove);
        win.addEventListener('pointerup', onPointerUp);
        win.addEventListener('pointercancel', onPointerUp);
    });

    btnElement.addEventListener('touchstart', function (e) { e.preventDefault(); }, { passive: false });

    // 点击遮罩关闭（仅在未置顶时）
    $('#mobile-phone-overlay').on('click', function (e) {
        // 如果正在拖动页面或刚完成拖动，不关闭手机
        if (pageSwipe && (pageSwipe.isDragging || pageSwipe.justFinishedDragging)) {
            return;
        }
        if ($(e.target).attr('id') === 'mobile-phone-overlay' && !isPinned) {
            closeMobilePhone();
        }
    });

    // 置顶按钮点击
    $('#phone-pin-btn').on('click', function (e) {
        e.stopPropagation();
        togglePin();
    });

    // 全屏壁纸按钮点击
    $('#wallpaper-fullscreen-btn').on('click', function (e) {
        e.stopPropagation();
        openWallpaperFullscreen();
    });

    // 全屏壁纸关闭按钮点击
    $('#wallpaper-close-btn').on('click', function (e) {
        e.stopPropagation();
        closeWallpaperFullscreen();
    });

    // CG设为壁纸按钮点击
    $('#cg-set-wallpaper-btn').on('click', function (e) {
        e.stopPropagation();
        const cgUrl = $(this).data('cg-url');
        if (cgUrl) {
            setWallpaper(cgUrl);
            closeWallpaperFullscreen();
            if (typeof toastr !== 'undefined') {
                toastr.success('已将CG设为壁纸');
            }
        }
    });

    // 点击全屏查看器背景关闭
    $('#wallpaper-fullscreen-viewer').on('click', function (e) {
        if (e.target.id === 'wallpaper-fullscreen-viewer') {
            closeWallpaperFullscreen();
        }
    });

    // CG上一张/下一张按钮点击
    $('#cg-prev-btn').on('click', function (e) {
        e.stopPropagation();
        switchCGImage('prev');
    });

    $('#cg-next-btn').on('click', function (e) {
        e.stopPropagation();
        switchCGImage('next');
    });

    // 手机界面拖动功能
    initPhoneDrag();

    //  修复：应用图标点击改为事件委托，避免DOM更新后事件失效
    // 使用事件委托到 body，这样即使DOM更新也不会丢失事件
    $('body').off('click.appIcon').on('click.appIcon', '.app-icon[data-app], .app-icon[data-app] *', function (e) {
        e.stopPropagation();

        //  关键修复：使用closest查找最近的.app-icon元素（处理点击子元素的情况）
        const $appIcon = $(this).closest('.app-icon[data-app]');

        if ($appIcon.length === 0) {
            return; // 不是应用图标或其子元素
        }

        const appName = $appIcon.attr('data-app');

        if (appName) {
            openAppPanel(appName);
        } else {
        }
    });

    // 返回按钮
    $('#phone-back-btn').on('click', function () {
        closeAppPanel();
    });

    //  绑定创建群聊按钮（使用事件委托）
    $('body').off('click.createGroupBtn').on('click.createGroupBtn', '.create-group-button', function (e) {
        e.stopPropagation();
        openCreateGroupPanel();
    });

    //  绑定聊天界面中的删除群聊按钮（使用事件委托）
    $('body').off('click.deleteGroupBtn').on('click.deleteGroupBtn', '.chat-delete-group-btn', function (e) {
        e.stopPropagation();
        e.preventDefault();
        const groupId = $(this).data('group-id');
        const groupName = $(this).data('group-name');
        deleteGroup(groupId, groupName);
    });

    //  绑定询问阿罗娜按钮（使用事件委托）
    $('body').off('click.askArona').on('click.askArona', '.ask-arona-btn', async function (e) {
        e.stopPropagation();
        e.preventDefault();

        const $btn = $(this);
        const originalHtml = $btn.html();

        // 禁用按钮并显示加载状态
        $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> 发送中...');

        try {
            if (!window.messageSender) {
                throw new Error('消息发送器未初始化');
            }

            const message = '询问阿罗娜，有没有什么委托需要处理';
            const success = await window.messageSender.sendToChat(message);

            if (success) {
                if (typeof toastr !== 'undefined') {
                    toastr.success('已向阿罗娜发送询问', '发送成功');
                }
                // 恢复按钮状态
                $btn.prop('disabled', false).html(originalHtml);
            } else {
                throw new Error('发送消息失败');
            }
        } catch (error) {
            if (typeof toastr !== 'undefined') {
                toastr.error('发送失败: ' + error.message, '错误');
            }
            // 恢复按钮状态
            $btn.prop('disabled', false).html(originalHtml);
        }
    });

    // 绑定联系人点击事件（使用事件委托到 body）
    // 注意：由于联系人列表在 #phone-app-body 中动态生成，需要使用事件委托
    $('body').off('click.contactItem').on('click.contactItem', '.contact-item', function (e) {
        e.stopPropagation();

        const $item = $(this);
        const contactId = $item.data('id');
        const contactName = $item.data('name');
        const contactType = $item.data('type');
        const members = $item.data('members') || '';
        const isGroup = contactType === 'group';

        if (!contactId || !contactName) {
            return;
        }

        openChatPanel(contactId, contactName, isGroup, members);
    });

    // 绑定聊天界面返回按钮
    $('#chat-back-btn').on('click', function () {
        closeChatPanel();
    });

    // 绑定聊天发送按钮
    $('#chat-send-btn').on('click', function () {
        sendChatMessage();
    });

    // 绑定聊天输入框回车发送
    $('#chat-input').on('keypress', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });

    //  图片点击事件（使用事件委托）
    $('body').off('click.messageImage').on('click.messageImage', '.clickable-image', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const imageUrl = $(this).data('image-url');
        if (imageUrl) {
            viewFullImage(imageUrl);
        }
    });

    // 壁纸分类展开/收起（使用事件委托）
    $(document).on('click', '.wallpaper-category-header', function (e) {
        const categoryName = $(this).data('category');
        if (categoryName) {
            toggleWallpaperCategory(categoryName);
        }
    });

    // 论坛按钮点击（使用jQuery事件委托，和好友一样的方式）
    $(document).on('click', '.phone-forum-generate-btn', function (e) {
        e.stopPropagation();
        e.preventDefault();
        window.phoneGenerateForum && window.phoneGenerateForum();
    });

    $(document).on('click', '.phone-forum-settings-btn', function (e) {
        e.stopPropagation();
        e.preventDefault();
        window.phoneOpenForumSettings && window.phoneOpenForumSettings();
    });

    $(document).on('click', '.phone-forum-save-settings-btn', function (e) {
        e.stopPropagation();
        e.preventDefault();
        window.phoneSaveForumSettings && window.phoneSaveForumSettings();
    });

    $(document).on('click', '.phone-forum-close-settings-btn', function (e) {
        e.stopPropagation();
        e.preventDefault();
        window.phoneCloseForumSettings && window.phoneCloseForumSettings();
    });

    // 好友列表项点击（使用事件委托）
    $(document).on('click', '.friend-item', function (e) {
        e.stopPropagation();
        const $friendItem = $(this);
        const friendName = $friendItem.data('friend-name');

        if (!friendName) {
            return;
        }

        const relationshipSource = getRelationshipDataSource();
        if (!relationshipSource) {
            return;
        }

        const friendData = relationshipSource[friendName];
        if (!friendData) {
            return;
        }

        showFriendDetail(friendName, friendData);
    });

    // 论坛帖子点击（使用事件委托）
    $(document).on('click', '.forum-post-item', function (e) {
        e.stopPropagation();
        const $postItem = $(this);
        const postIndex = $postItem.data('post-index');


        if (postIndex === undefined) {
            return;
        }

        // 从论坛管理器获取帖子数据
        if (!window.phoneForumManager) {
            return;
        }

        const forumData = window.phoneForumManager.loadForumData();

        if (!forumData || !forumData[postIndex]) {
            return;
        }

        showForumPostDetail(postIndex, forumData[postIndex]);
    });

    // 在应用面板上监听好友点击
    const $appBody = $('#phone-app-body');

    if ($appBody.length > 0) {
        $appBody.on('click', '.friend-item', function (e) {
            e.stopPropagation();

            const $friendItem = $(this);
            const friendName = $friendItem.data('friend-name');

            if (!friendName) {
                return;
            }

            const relationshipSource = getRelationshipDataSource();
            if (!relationshipSource) {
                return;
            }

            const friendData = relationshipSource[friendName];
            if (!friendData) {
                return;
            }

            showFriendDetail(friendName, friendData);
        });

        // 在应用面板上监听论坛帖子点击
        $appBody.on('click', '.forum-post-item', function (e) {
            e.stopPropagation();
            const $postItem = $(this);
            const postIndex = $postItem.data('post-index');


            if (postIndex === undefined) {
                return;
            }

            // 从论坛管理器获取帖子数据
            if (!window.phoneForumManager) {
                return;
            }

            const forumData = window.phoneForumManager.loadForumData();

            if (!forumData || !forumData[postIndex]) {
                return;
            }

            showForumPostDetail(postIndex, forumData[postIndex]);
        });
    }

    // 备用：也监听整个分类容器的点击
    $(document).on('click', '.list-item-header', function (e) {
        // 如果点击的是好友项，不处理
        if ($(this).closest('.friend-item').length > 0) {
            return;
        }

        const categoryName = $(this).data('category');
        if (categoryName && !$(this).hasClass('wallpaper-category-header')) {
            toggleWallpaperCategory(categoryName);
        }
    });

    // 全局点击事件处理
    $(document).on('click', function (e) {
        const $target = $(e.target);

        const inMobilePhone = $target.closest('.mobile-phone-frame').length > 0 ||
            $target.closest('#mobile-phone-overlay').length > 0;

        if (inMobilePhone) {
            const inAppBody = $target.closest('#phone-app-body').length > 0;

            if (inAppBody) {
                // 检查是否点击了论坛按钮
                const $forumGenerateBtn = $target.closest('.phone-forum-generate-btn');
                if ($forumGenerateBtn.length > 0) {
                    e.stopPropagation();
                    e.preventDefault();
                    window.phoneGenerateForum();
                    return;
                }

                const $forumSettingsBtn = $target.closest('.phone-forum-settings-btn');
                if ($forumSettingsBtn.length > 0) {
                    e.stopPropagation();
                    e.preventDefault();
                    window.phoneOpenForumSettings();
                    return;
                }

                const $forumSaveSettingsBtn = $target.closest('.phone-forum-save-settings-btn');
                if ($forumSaveSettingsBtn.length > 0) {
                    e.stopPropagation();
                    e.preventDefault();
                    window.phoneSaveForumSettings();
                    return;
                }

                const $forumCloseSettingsBtn = $target.closest('.phone-forum-close-settings-btn');
                if ($forumCloseSettingsBtn.length > 0) {
                    e.stopPropagation();
                    e.preventDefault();
                    window.phoneCloseForumSettings();
                    return;
                }

                // 任务按钮的点击由原生事件处理，这里不需要处理

                // 检查是否点击了壁纸分类相关的元素
                const $listItemHeader = $target.closest('.list-item-header');
                if ($listItemHeader.length > 0) {
                    const categoryName = $listItemHeader.data('category');

                    if (categoryName) {
                        toggleWallpaperCategory(categoryName);
                    }
                }

                // 检查是否点击了壁纸项
                const $wallpaperItem = $target.closest('.wallpaper-item');
                if ($wallpaperItem.length > 0) {
                    const wallpaperUrl = $wallpaperItem.data('wallpaper-url');

                    if (wallpaperUrl) {
                        setWallpaper(wallpaperUrl);
                    }
                }
            }
        }
    });

    // 壁纸选择（使用事件委托，因为壁纸项是动态加载的）
    $(document).on('click', '.wallpaper-item', function (e) {
        const wallpaperUrl = $(this).data('wallpaper-url');
        if (wallpaperUrl) {
            setWallpaper(wallpaperUrl);
        }
    });

    //  窗口resize监听：响应式调整按钮位置，并确保元素不跑出屏幕
    let resizeTimer;
    $(window).on('resize.mobilePhone', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            const viewport = getViewportSize();
            const $btn = $('#mobile-trigger-btn');
            const btnElement = $btn[0];

            //  检查用户是否手动拖动过
            const userDragged = localStorage.getItem('mobile-trigger-btn-user-dragged') === 'true';

            if (userDragged) {
                // 用户已手动拖动，检查并修正位置确保不跑出屏幕
                const rect = btnElement.getBoundingClientRect();
                const btnWidth = $btn.outerWidth() || 60;
                const btnHeight = $btn.outerHeight() || 60;

                // 检查是否超出边界
                if (rect.left < 0 || rect.top < 0 ||
                    rect.right > viewport.width || rect.bottom > viewport.height) {
                    // 修正位置
                    const bounded = constrainFullyInViewport(rect.left, rect.top, btnWidth, btnHeight);
                    btnElement.style.setProperty('left', bounded.x + 'px', 'important');
                    btnElement.style.setProperty('top', bounded.y + 'px', 'important');
                    // 更新保存的位置
                    localStorage.setItem('mobile-trigger-btn-position', JSON.stringify({ left: bounded.x, top: bounded.y }));
                }
                return;
            }

            //  根据屏幕宽度调整CSS类和位置
            if (viewport.width <= 480) {
                // 移除内联定位样式
                btnElement.style.removeProperty('left');
                btnElement.style.removeProperty('top');
                btnElement.style.removeProperty('right');
                btnElement.style.removeProperty('bottom');
                btnElement.style.removeProperty('transform');
                // 添加mobile-mode类
                $btn.removeClass('tablet-mode desktop-mode').addClass('mobile-mode');
            } else if (viewport.width <= 768) {
                btnElement.style.removeProperty('left');
                btnElement.style.removeProperty('top');
                btnElement.style.removeProperty('right');
                btnElement.style.removeProperty('bottom');
                btnElement.style.removeProperty('transform');
                $btn.removeClass('mobile-mode desktop-mode').addClass('tablet-mode');
            } else {
                $btn.removeClass('mobile-mode tablet-mode').addClass('desktop-mode');
                // 桌面端保持用户拖动的位置
            }

            // 同时检查手机界面是否超出边界
            const $phoneFrame = $('.mobile-phone-frame');
            if ($phoneFrame.length > 0 && $('#mobile-phone-overlay').hasClass('active')) {
                const phoneRect = $phoneFrame[0].getBoundingClientRect();
                const frameWidth = $phoneFrame.outerWidth() || 375;
                const frameHeight = $phoneFrame.outerHeight() || 737;

                // 如果手机界面超出边界，重置到中心
                if (phoneRect.left < -frameWidth + 50 || phoneRect.top < -frameHeight + 50 ||
                    phoneRect.right > viewport.width + frameWidth - 50 ||
                    phoneRect.bottom > viewport.height + frameHeight - 50) {
                    $phoneFrame.css('transform', 'translate(0, 0)');
                }
            }
        }, 250); // 防抖250ms
    });
}

// ==================== 拖动处理函数 ====================
function handleDragStart(e) {
    isDragging = true;
    hasMoved = false;

    const $btn = $('#mobile-trigger-btn');
    const btnElement = $btn[0];

    //  移除所有模式类
    $btn.removeClass('mobile-mode tablet-mode desktop-mode');

    // 获取按钮当前实际位置（在清除样式前）
    const rect = btnElement.getBoundingClientRect();
    btnStartX = rect.left;
    btnStartY = rect.top;

    //  强制覆盖所有定位属性（使用!important覆盖CSS类）
    btnElement.style.setProperty('left', btnStartX + 'px', 'important');
    btnElement.style.setProperty('top', btnStartY + 'px', 'important');
    btnElement.style.setProperty('right', 'auto', 'important');
    btnElement.style.setProperty('bottom', 'auto', 'important');
    btnElement.style.setProperty('transform', 'none', 'important');

    // 记录初始鼠标位置
    dragStartX = e.clientX;
    dragStartY = e.clientY;
}

function handleDragMove(e) {
    if (!isDragging) return;

    // 计算移动距离
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;

    // 如果移动超过3px，认为是拖动而不是点击
    if (!hasMoved && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
        hasMoved = true;

        // 开始拖动时添加样式
        const $btn = $('#mobile-trigger-btn');
        $btn.addClass('dragging');
    }

    // 只在真正开始拖动后才阻止默认行为和更新位置
    if (!hasMoved) return;

    if (e.preventDefault) {
        e.preventDefault();
    }

    // 计算新位置
    const newX = btnStartX + deltaX;
    const newY = btnStartY + deltaY;

    // 使用工具函数进行边界限制（完全限制在视口内）
    const $btn = $('#mobile-trigger-btn');
    const btnWidth = $btn.outerWidth() || 60;
    const btnHeight = $btn.outerHeight() || 60;

    const bounded = constrainFullyInViewport(newX, newY, btnWidth, btnHeight);

    //  使用 setProperty 强制设置位置（覆盖!important）
    const btnElement = $btn[0];
    btnElement.style.setProperty('left', bounded.x + 'px', 'important');
    btnElement.style.setProperty('top', bounded.y + 'px', 'important');
    btnElement.style.setProperty('right', 'auto', 'important');
    btnElement.style.setProperty('bottom', 'auto', 'important');
}

function handleDragEnd(e) {
    if (!isDragging) return;

    isDragging = false;
    const $btn = $('#mobile-trigger-btn');
    $btn.removeClass('dragging');

    // 如果移动了，保存位置
    if (hasMoved) {
        // 获取当前位置的多种方式
        const cssLeft = $btn.css('left');
        const cssTop = $btn.css('top');

        // 直接从CSS获取当前设置的值
        const left = parseFloat(cssLeft);
        const top = parseFloat(cssTop);

        // 验证位置是否有效
        if (!isNaN(left) && !isNaN(top) && left >= 0 && top >= 0) {
            try {
                const position = { left: left, top: top };
                localStorage.setItem('mobile-trigger-btn-position', JSON.stringify(position));
                //  标记用户已手动拖动，防止resize重置位置
                localStorage.setItem('mobile-trigger-btn-user-dragged', 'true');
            } catch (err) {
            }
        }
    }

    // 延迟重置 hasMoved，让 click 事件能检测到
    setTimeout(() => {
        hasMoved = false;
    }, 10);
}

// 恢复按钮位置（添加重试次数限制）
let restorePositionRetryCount = 0;
const MAX_RESTORE_RETRIES = 5;

function restoreTriggerBtnPosition() {
    try {
        const savedPosition = localStorage.getItem('mobile-trigger-btn-position');

        if (!savedPosition) {
            restorePositionRetryCount = 0;
            return;
        }

        const pos = JSON.parse(savedPosition);

        // 验证保存的位置是否有效
        if (typeof pos.left !== 'number' || typeof pos.top !== 'number' ||
            pos.left < 0 || pos.top < 0 ||
            isNaN(pos.left) || isNaN(pos.top)) {
            localStorage.removeItem('mobile-trigger-btn-position');
            restorePositionRetryCount = 0;
            return;
        }

        const $btn = $('#mobile-trigger-btn');

        //  获取真实的视口宽度（支持DevTools设备模拟和srcdoc iframe）
        let windowWidth = window.innerWidth || document.documentElement.clientWidth || $(window).width();
        let windowHeight = window.innerHeight || document.documentElement.clientHeight || $(window).height();

        //  在srcdoc iframe中，所有window尺寸都是0，必须使用父窗口尺寸
        if (window.parent !== window) {
            try {
                // 使用父窗口的 innerWidth（支持DevTools设备模拟）
                const parentWidth = window.parent.innerWidth || window.parent.document.documentElement.clientWidth || $(window.parent).width();
                const parentHeight = window.parent.innerHeight || window.parent.document.documentElement.clientHeight || $(window.parent).height();

                // 如果当前窗口尺寸为0（srcdoc iframe的情况），使用父窗口尺寸
                if (windowWidth === 0 || windowHeight === 0) {
                    windowWidth = parentWidth;
                    windowHeight = parentHeight;
                }
            } catch (e) {
                // 无法访问父窗口
            }
        }

        const btnWidth = $btn.outerWidth();
        const btnHeight = $btn.outerHeight();

        // 如果窗口尺寸还是0，检查是否超过最大重试次数
        if (windowWidth === 0 || windowHeight === 0) {
            restorePositionRetryCount++;

            if (restorePositionRetryCount >= MAX_RESTORE_RETRIES) {
                restorePositionRetryCount = 0;
                // 使用默认位置
                $btn.css({
                    left: 'auto',
                    top: 'auto',
                    right: '20px',
                    bottom: '20px'
                });
                return;
            }

            setTimeout(() => {
                restoreTriggerBtnPosition();
            }, 500);
            return;
        }

        // 恢复成功，重置计数器
        restorePositionRetryCount = 0;

        //  响应式位置检测：如果是小屏幕，使用默认位置
        const isSmallScreen = windowWidth <= 768;
        const isMobileScreen = windowWidth <= 480;

        //  检查用户是否手动拖动过
        const userDragged = localStorage.getItem('mobile-trigger-btn-user-dragged') === 'true';

        if (userDragged) {
            // 移除模式类，使用保存的坐标
            $btn.removeClass('mobile-mode tablet-mode desktop-mode');
        } else {
            // 如果是移动端小屏幕，且保存的位置明显是大屏幕的坐标
            if (isMobileScreen && (pos.left > 600 || pos.top > 600)) {
                //  关键修复：移除内联样式并添加CSS类
                $btn[0].style.removeProperty('left');
                $btn[0].style.removeProperty('top');
                $btn[0].style.removeProperty('right');
                $btn[0].style.removeProperty('bottom');
                $btn[0].style.removeProperty('transform');
                $btn.removeClass('tablet-mode desktop-mode').addClass('mobile-mode');
                return;
            }

            // 小屏幕时使用默认位置，避免位置错乱
            if (isSmallScreen && (pos.left > windowWidth * 0.8 || pos.top > windowHeight * 0.8)) {
                //  关键修复：移除内联样式并添加CSS类
                $btn[0].style.removeProperty('left');
                $btn[0].style.removeProperty('top');
                $btn[0].style.removeProperty('right');
                $btn[0].style.removeProperty('bottom');
                $btn.removeClass('mobile-mode desktop-mode').addClass('tablet-mode');
                return;
            }

            // 桌面端：移除模式类
            $btn.removeClass('mobile-mode tablet-mode').addClass('desktop-mode');
        }

        // 使用工具函数进行边界限制
        const bounded = constrainFullyInViewport(pos.left, pos.top, btnWidth, btnHeight);

        $btn.css({
            left: bounded.x + 'px',
            top: bounded.y + 'px',
            right: 'auto',
            bottom: 'auto'
        });
    } catch (e) {
        localStorage.removeItem('mobile-trigger-btn-position');
        restorePositionRetryCount = 0;
    }
}

// ==================== 手动调整按钮位置（调试用） ====================
window.resetMobileButtonPosition = function () {
    let windowWidth = window.innerWidth || document.documentElement.clientWidth || $(window).width();

    //  srcdoc iframe中尺寸为0，使用父窗口尺寸
    if ((windowWidth === 0) && window.parent !== window) {
        try {
            windowWidth = window.parent.innerWidth || window.parent.document.documentElement.clientWidth || $(window.parent).width();
        } catch (e) {
            // 无法访问父窗口
        }
    }

    const $btn = $('#mobile-trigger-btn');
    const btnElement = $btn[0];

    //  移除所有内联定位样式
    btnElement.style.removeProperty('left');
    btnElement.style.removeProperty('top');
    btnElement.style.removeProperty('right');
    btnElement.style.removeProperty('bottom');

    //  根据屏幕宽度强制设置位置（带!important）
    if (windowWidth <= 480) {
        $btn.removeClass('tablet-mode desktop-mode').addClass('mobile-mode');
        //  强制设置内联样式（带!important），右边垂直居中
        btnElement.style.setProperty('left', 'auto', 'important');
        btnElement.style.setProperty('top', '50%', 'important');
        btnElement.style.setProperty('right', '12px', 'important');
        btnElement.style.setProperty('bottom', 'auto', 'important');
        btnElement.style.setProperty('transform', 'translateY(-50%)', 'important');
    } else if (windowWidth <= 768) {
        $btn.removeClass('mobile-mode desktop-mode').addClass('tablet-mode');
        btnElement.style.setProperty('left', 'auto', 'important');
        btnElement.style.setProperty('top', 'auto', 'important');
        btnElement.style.setProperty('right', '15px', 'important');
        btnElement.style.setProperty('bottom', '15px', 'important');
        btnElement.style.setProperty('transform', 'none', 'important');
    } else {
        //  桌面端：离右边三分之一距离的垂直中央
        $btn.removeClass('mobile-mode tablet-mode').addClass('desktop-mode');
        btnElement.style.setProperty('left', 'auto', 'important');
        btnElement.style.setProperty('top', '50%', 'important');
        btnElement.style.setProperty('right', '20%', 'important');
        btnElement.style.setProperty('bottom', 'auto', 'important');
        btnElement.style.setProperty('transform', 'translateY(-50%)', 'important');
    }

    // 清除保存的位置和拖动标记，避免下次加载时恢复错误位置
    localStorage.removeItem('mobile-trigger-btn-position');
    localStorage.removeItem('mobile-trigger-btn-user-dragged');
};

// ==================== 页面滑动功能 ====================
let pageSwipe = {
    currentPageIndex: 0,
    totalPages: 1,
    isDragging: false,
    hasMoved: false, //  是否真正移动过（用于区分点击和滑动）
    startX: 0,
    currentX: 0,
    threshold: 50, // 拖拽阈值
    initialized: false,
    wrapper: null, // 保存wrapper引用
    indicators: null, // 保存indicators引用
    boundHandleMove: null, // 保存绑定的move函数
    boundHandleEnd: null, // 保存绑定的end函数
    justFinishedDragging: false, // 刚完成拖动（防止立即触发click关闭）

    init: function () {
        // 尝试从jQuery和原生DOM两种方式获取
        let wrapper = document.getElementById('app-pages-wrapper');
        let indicators = document.getElementById('page-indicators');

        // 如果原生找不到，尝试jQuery
        if (!wrapper) {
            const $wrapper = $('#mobile-phone-overlay #app-pages-wrapper');
            wrapper = $wrapper.length > 0 ? $wrapper[0] : null;
        }

        if (!indicators) {
            const $indicators = $('#mobile-phone-overlay #page-indicators');
            indicators = $indicators.length > 0 ? $indicators[0] : null;
        }

        if (!wrapper || !indicators) {
            return;
        }

        // 保存引用
        this.wrapper = wrapper;
        this.indicators = indicators;

        // 创建绑定的函数引用（用于后续移除监听器）
        this.boundHandleMove = this.handleMove.bind(this);
        this.boundHandleEnd = this.handleEnd.bind(this);

        // 鼠标事件 (PC端)
        wrapper.addEventListener('mousedown', this.handleStart.bind(this));
        wrapper.addEventListener('mousemove', this.boundHandleMove);
        wrapper.addEventListener('mouseup', this.boundHandleEnd);
        wrapper.addEventListener('mouseleave', this.boundHandleEnd);

        // 触摸事件 (移动端)
        wrapper.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
        wrapper.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
        wrapper.addEventListener('touchend', this.handleEnd.bind(this));

        // 指示器点击事件
        const indicatorElements = indicators.querySelectorAll('.indicator');
        indicatorElements.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToPage(index);
            });
        });
    },

    handleStart: function (e) {
        //  不要立即阻止传播，让点击事件能正常触发
        // 只在真正滑动时（handleMove）才阻止传播

        this.isDragging = true;
        this.hasMoved = false; //  记录是否真的移动了
        this.startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        this.currentX = this.startX;

        if (this.wrapper) {
            this.wrapper.style.transition = 'none';
        }

        // 鼠标事件：在document上监听move和up，防止滑出区域
        if (e.type === 'mousedown') {
            document.addEventListener('mousemove', this.boundHandleMove);
            document.addEventListener('mouseup', this.boundHandleEnd);
        }
    },

    handleMove: function (e) {
        if (!this.isDragging) return;

        this.currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const deltaX = this.currentX - this.startX;

        //  只有当移动超过5px时，才认为是真正的滑动
        if (Math.abs(deltaX) > 5) {
            if (!this.hasMoved) {
                this.hasMoved = true;
            }

            // 现在才阻止默认行为和传播
            e.preventDefault();
            e.stopPropagation();

            if (this.wrapper) {
                const translateX = -this.currentPageIndex * 100 + (deltaX / this.wrapper.offsetWidth) * 100;
                this.wrapper.style.transform = `translateX(${translateX}%)`;
            }
        }
    },

    handleEnd: function (e) {
        if (!this.isDragging) return;

        const deltaX = this.currentX - this.startX;

        //  只有当真正滑动过，才阻止事件传播
        if (this.hasMoved) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.isDragging = false;

        // 移除document上的事件监听器
        document.removeEventListener('mousemove', this.boundHandleMove);
        document.removeEventListener('mouseup', this.boundHandleEnd);

        //  只有真正滑动过，才需要处理页面切换和设置标志
        if (this.hasMoved) {
            // 设置刚完成拖动标志，防止立即触发click关闭手机
            this.justFinishedDragging = true;
            setTimeout(() => {
                this.justFinishedDragging = false;
            }, 100);

            if (this.wrapper) {
                // 恢复过渡效果
                this.wrapper.style.transition = 'transform 0.3s ease-out';

                // 判断是否需要切换页面
                if (Math.abs(deltaX) > this.threshold) {
                    if (deltaX > 0 && this.currentPageIndex > 0) {
                        // 向右滑动，切换到上一页
                        this.goToPage(this.currentPageIndex - 1);
                    } else if (deltaX < 0 && this.currentPageIndex < this.totalPages - 1) {
                        // 向左滑动，切换到下一页
                        this.goToPage(this.currentPageIndex + 1);
                    } else {
                        // 回到当前页
                        this.goToPage(this.currentPageIndex);
                    }
                } else {
                    // 回到当前页
                    this.goToPage(this.currentPageIndex);
                }
            }
        }
    },

    goToPage: function (pageIndex) {
        if (pageIndex < 0 || pageIndex >= this.totalPages) return;

        this.currentPageIndex = pageIndex;
        if (this.wrapper) {
            this.wrapper.style.transform = `translateX(-${pageIndex * 100}%)`;
        }

        // 更新指示器
        this.updateIndicators();
    },

    updateIndicators: function () {
        if (!this.indicators) return;

        const indicatorElements = this.indicators.querySelectorAll('.indicator');
        indicatorElements.forEach((indicator, index) => {
            if (index === this.currentPageIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
};

function initPageSwipe() {
    pageSwipe.init();
}

// ==================== MVU变量框架数据管理 ====================

/**
 * 【新增】直接从聊天记录获取最新MVU数据（不受更新时序影响）
 * 跟 MVU 源码的 getLastValidVariable 实现方式一样
 * @returns {object|null} - MVU数据对象，如果找不到返回null
 */
function getLatestMvuDataFromChat() {
    try {
        const chat = SillyTavern?.chat;
        if (!chat || chat.length === 0) return null;

        // 从后往前找第一个有 stat_data 的消息
        for (let i = chat.length - 1; i >= 0; i--) {
            const msg = chat[i];
            const swipeId = msg.swipe_id ?? 0;
            const variables = _.get(msg, ['variables', swipeId]);
            if (variables && _.has(variables, 'stat_data')) {
                return variables;
            }
        }
        return null;
    } catch (error) {
        console.warn('[手机状态栏] 从chat获取MVU数据失败:', error);
        return null;
    }
}

/**
 * 从MVU数据对象中提取实际的游戏数据
 * 兼容两种数据结构：
 * 1. 数据在 stat_data 键下（旧版本）
 * 2. 数据直接在根级别（MVU Zod 格式）
 * @param {object} mvuData - MVU返回的数据对象
 * @returns {object} - 提取的游戏数据
 */
function extractMvuGameData(mvuData) {
    if (!mvuData || typeof mvuData !== 'object') {
        return {};
    }

    /* 优先检查 stat_data 路径 */
    const statData = _.get(mvuData, 'stat_data', null);
    if (statData && typeof statData === 'object' && Object.keys(statData).length > 0) {
        return statData;
    }

    /* 如果 stat_data 为空，检查数据是否直接在根级别 */
    const dataKeys = Object.keys(mvuData).filter(k => !k.startsWith('$') && k !== 'stat_data');
    if (dataKeys.length > 0) {
        return mvuData;
    }

    return {};
}

/**
 * 【核心函数】获取最新的MVU游戏数据
 * 所有需要获取MVU数据的地方都应该调用此函数
 * 优先从 SillyTavern.chat 直接获取，不受变量更新时序影响
 * @param {boolean} updateGlobal - 是否更新全局 currentPhoneData，默认 true
 * @returns {object} - 游戏数据对象
 */
function fetchLatestMvuData(updateGlobal = true) {
    let gameData = {};

    try {
        /* 【优先】直接从 SillyTavern.chat 获取，不受更新时序影响 */
        const chatMvuData = getLatestMvuDataFromChat();
        if (chatMvuData) {
            gameData = extractMvuGameData(chatMvuData);
        }

        /* 降级：使用 Mvu.getMvuData 获取数据 */
        if (Object.keys(gameData).length === 0 && typeof Mvu !== 'undefined' && Mvu.getMvuData) {
            /* 尝试从最新消息获取 */
            const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
            gameData = extractMvuGameData(mvuData);

            /* 如果消息级别没有数据，尝试从chat级别获取 */
            if (Object.keys(gameData).length === 0) {
                const chatData = Mvu.getMvuData({ type: 'chat' });
                gameData = extractMvuGameData(chatData);
            }
        }

        /* 降级：使用旧的 getVariables 方法 */
        if (Object.keys(gameData).length === 0 && typeof getVariables === 'function') {
            const chatVars = getVariables({ type: 'chat' }) || {};
            gameData = extractMvuGameData(chatVars);
        }

        /* 更新全局变量 */
        if (updateGlobal && Object.keys(gameData).length > 0) {
            currentPhoneData = gameData;
        }

    } catch (error) {
        console.error('[手机状态栏] 获取MVU数据失败:', error);
    }

    return gameData;
}

/**
 * 刷新全局数据并更新UI
 */
function refreshPhoneData() {
    const gameData = fetchLatestMvuData(true);
    if (Object.keys(gameData).length > 0) {
        updatePhoneData(gameData);
    }
    return gameData;
}

// ==================== MVU变量框架事件监听 ====================
function registerMvuEventListeners() {
    /* 使用MVU变量框架，数据将在打开应用时按需获取 */
}

// 加载初始MVU数据
function loadInitialMvuData() {
    const gameData = fetchLatestMvuData(true);
    if (Object.keys(gameData).length > 0) {
        updatePhoneData(gameData);
        return true;
    }
    return false;
}

// ==================== UI更新函数 ====================
function updatePhoneTime() {
    /* 从MVU变量读取时间 */
    /* 时间更新由 updatePhoneData() 函数从 MVU 变量的 current_time 读取 */
    try {
        /* 尝试从各种可能的来源获取数据 */
        let currentTime = null;

        /* 方法1: 从window.mvuGameData读取（如果存在） */
        if (window.mvuGameData?.world_info?.time?.current_time) {
            currentTime = window.mvuGameData.world_info.time.current_time;
        }

        /* 方法2: 从全局变量读取（如果存在） */
        if (!currentTime && typeof gameData !== 'undefined' && gameData?.world_info?.time?.current_time) {
            currentTime = gameData.world_info.time.current_time;
        }

        /* 如果获取到了时间数据，更新显示 */
        if (currentTime) {
            updatePhoneTimeFromMVU(currentTime);
        }
    } catch (error) {
        /* 静默失败，不影响其他功能 */
    }
}

/* 从MVU时间字符串解析并更新显示 */
function updatePhoneTimeFromMVU(currentTimeStr) {
    // currentTimeStr 格式: "2024年11月9日 星期六 14:30"
    if (!currentTimeStr) return;

    try {
        // 提取时间部分（最后5个字符）
        const timeMatch = currentTimeStr.match(/(\d{1,2}:\d{2})$/);
        const timeString = timeMatch ? timeMatch[1] : '14:30';

        // 提取日期部分（年月日）
        const dateMatch = currentTimeStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
        let dateString = '10/24';
        if (dateMatch) {
            const month = String(dateMatch[2]).padStart(2, '0');
            const day = String(dateMatch[3]).padStart(2, '0');
            dateString = `${month}/${day}`;
        }

        // 更新锁屏时间和日期
        $('#phone-big-time').text(timeString);
        $('#phone-date').text(dateString);

        // 更新状态栏时间
        $('#phone-status-time').text(timeString);

    } catch (error) {
    }
}

function updatePhoneData(data) {
    if (!data) {
        return;
    }


    //  保存数据到全局变量，供定时器使用
    window.mvuGameData = data;

    // 更新世界信息
    const worldInfo = data.world_info || {};
    const time = worldInfo.time || {};
    const location = worldInfo.location || {};
    const environment = worldInfo.environment || {};

    //  更新时间（从MVU的current_time读取）
    if (time.current_time) {
        updatePhoneTimeFromMVU(time.current_time);
    }

    // 更新天气
    if (environment.weather) {
        $('#phone-weather').text(environment.weather);
        // 更新状态栏天气
        $('#phone-status-weather').text(environment.weather);
    }

    // ✨ 实时更新当前打开的App内容
    if (currentPanel && $('#mobile-phone-overlay').hasClass('active')) {

        // 重新生成并更新当前面板内容
        let content = '';
        switch (currentPanel) {
            case 'messages':
                content = generateMessagesPanel(data);
                break;
            case 'shop':
                content = generateShopPanel(data);
                break;
            case 'gallery':
                content = generateGalleryPanel(data);
                break;
            case 'friends':
                content = generateFriendsPanel(data);
                break;
            case 'checkin':
                content = generateCheckInPanel(data);
                break;
            case 'settings':
                content = generateSizeSettingsPanel();
                break;
            default:
                break;
        }

        if (content) {
            $('#phone-app-body').html(content);
        }
    }

}

// ==================== 控制函数 ====================
function openMobilePhone() {
    $('#mobile-phone-overlay').addClass('active');

    //  刷新MVU数据
    try {
        loadInitialMvuData();
    } catch (error) {
        console.warn('[手机界面] 加载MVU数据失败:', error);
    }

    //  启动实时监听
    setupMessageEventListener();

    //  恢复聊天定时器（如果之前在聊天中）
    if (currentChatContactId && $('#phone-chat-panel').hasClass('active')) {
        // 如果聊天面板仍然打开，恢复定时器
        if (!chatPanelRefreshInterval) {
            chatPanelRefreshInterval = setInterval(() => {
                const $mobileOverlay = $('#mobile-phone-overlay');
                const isMobileOpen = $mobileOverlay.hasClass('active');
                const $chatPanel = $('#phone-chat-panel');
                const isChatOpen = $chatPanel.hasClass('active');

                if (isMobileOpen && isChatOpen) {
                    renderChatMessages(currentChatContactId, currentChatIsGroup);
                }
            }, 1000);
        }
    }

    // 延迟初始化，确保DOM完全渲染
    setTimeout(() => {
        // 初始化页面滑动功能（只初始化一次）
        if (!pageSwipe.initialized) {
            initPageSwipe();
            pageSwipe.initialized = true;
        }

        // 恢复上次打开的面板
        try {
            const lastPanel = localStorage.getItem('mobile-last-panel');
            // 只有当存在有效的面板名称时才恢复
            if (lastPanel && lastPanel.trim() !== '' && lastPanel !== 'null') {
                openAppPanel(lastPanel, true); // 传入true表示是从关闭状态恢复
            } else {
            }
        } catch (e) {
        }
    }, 100);
}

function closeMobilePhone() {
    const $overlay = $('#mobile-phone-overlay');
    $overlay.removeClass('active');

    //  停止刷新机制
    stopRefreshMechanism();

    //  保存好友详情页的滚动位置（如果当前在详情页）
    if (currentPanel === 'friends' && lastViewedFriend && navigationStack.length > 0) {
        //  优先使用滚动监听器已保存的位置，因为DOM可能已经被修改
        // 只有在还没有保存位置时才从DOM读取
        if (friendDetailScrollPosition === 0) {
            let scrollContainer = document.getElementById('friend-detail-scroll-container');
            if (!scrollContainer) {
                const $scrollContainer = $('#friend-detail-scroll-container');
                if ($scrollContainer.length > 0) {
                    scrollContainer = $scrollContainer[0];
                }
            }

            if (scrollContainer) {
                friendDetailScrollPosition = scrollContainer.scrollTop;
            } else {
            }
        } else {
        }
    }

    // 保存当前面板状态到 localStorage
    try {
        if (currentPanel) {
            localStorage.setItem('mobile-last-panel', currentPanel);
        } else {
            localStorage.setItem('mobile-last-panel', '');
        }
    } catch (e) {
    }

    // 关闭时取消置顶状态
    if (isPinned) {
        isPinned = false;
        $('#phone-pin-btn').removeClass('pinned');
        $overlay.removeClass('pinned');
    }

    // 不关闭应用面板，保持状态供下次打开
    // closeAppPanel(); // 注释掉这行，保持面板状态

    // 重置手机框架位置和动画
    const $phoneFrame = $('.mobile-phone-frame');
    $phoneFrame.css({
        'transform': '',
        'animation': '',
        'transition': ''
    });
}

// 置顶切换
function togglePin() {
    isPinned = !isPinned;
    const $pinBtn = $('#phone-pin-btn');
    const $overlay = $('#mobile-phone-overlay');

    if (isPinned) {
        $pinBtn.addClass('pinned');
        $overlay.addClass('pinned');
        if (typeof toastr !== 'undefined') {
            toastr.info('已置顶，可以操作底层页面');
        }
    } else {
        $pinBtn.removeClass('pinned');
        $overlay.removeClass('pinned');
        if (typeof toastr !== 'undefined') {
            toastr.info('已取消置顶');
        }
    }
}

// 初始化手机界面拖动（复用小按钮的拖动逻辑）
function initPhoneDrag() {
    const $dragHandle = $('#phone-drag-handle');
    const $phoneFrame = $('.mobile-phone-frame');

    if ($dragHandle.length === 0 || $phoneFrame.length === 0) {
        return;
    }

    const dragHandle = $dragHandle[0];

    // 阻止拖动手柄上的点击事件冒泡
    $dragHandle.on('click', function (e) {
        e.stopPropagation();
    });

    // 使用原生 Pointer Events（更可靠）
    dragHandle.addEventListener('pointerdown', handlePhoneDragStart);
    dragHandle.addEventListener('pointermove', handlePhoneDragMove);
    dragHandle.addEventListener('pointerup', handlePhoneDragEnd);
    dragHandle.addEventListener('pointercancel', handlePhoneDragEnd);

}

function handlePhoneDragStart(e) {

    // 阻止默认行为和冒泡
    e.preventDefault();
    e.stopPropagation();

    isPhoneDragging = true;

    // 捕获指针，确保后续的 pointermove 和 pointerup 事件能够被触发
    e.target.setPointerCapture(e.pointerId);

    const $phoneFrame = $('.mobile-phone-frame');

    phoneDragStartX = e.clientX;
    phoneDragStartY = e.clientY;

    // 先立即移除过渡和动画，避免在读取 transform 时受过渡影响
    $phoneFrame.css({
        'animation': 'none',
        'transition': 'none'
    });

    // 强制浏览器重新计算样式（确保过渡被立即停止）
    $phoneFrame[0].offsetHeight;

    // 读取当前的 transform 值（停止过渡后，这个值是准确的）
    const currentTransform = $phoneFrame.css('transform');
    if (currentTransform && currentTransform !== 'none') {
        const matrix = currentTransform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
            const values = matrix[1].split(', ');
            phoneStartX = parseFloat(values[4]) || 0;
            phoneStartY = parseFloat(values[5]) || 0;
        } else {
            phoneStartX = 0;
            phoneStartY = 0;
        }
    } else {
        phoneStartX = 0;
        phoneStartY = 0;
    }

}

function handlePhoneDragMove(e) {
    if (!isPhoneDragging) return;

    e.preventDefault();

    // 计算移动距离
    const deltaX = e.clientX - phoneDragStartX;
    const deltaY = e.clientY - phoneDragStartY;

    // 计算新的 transform 偏移
    const newX = phoneStartX + deltaX;
    const newY = phoneStartY + deltaY;

    // 获取手机框架和视口信息
    const $phoneFrame = $('.mobile-phone-frame');
    const frameRect = $phoneFrame[0].getBoundingClientRect();
    const frameWidth = frameRect.width || 375;
    const frameHeight = frameRect.height || 737;
    const viewport = getViewportSize();

    // 计算手机框架的初始中心位置（无 transform 时的位置）
    // 手机框架通过 flexbox 居中，所以初始位置是视口中心
    const initialCenterX = viewport.width / 2;
    const initialCenterY = viewport.height / 2;

    // 计算应用 transform 后的实际位置
    const actualLeft = initialCenterX - frameWidth / 2 + newX;
    const actualTop = initialCenterY - frameHeight / 2 + newY;

    // 边界限制：确保至少有 minVisible 像素在屏幕内
    const minVisible = 80;
    const minX = -frameWidth + minVisible;
    const maxX = viewport.width - minVisible;
    const minY = -frameHeight + minVisible;
    const maxY = viewport.height - minVisible;

    // 限制实际位置
    const boundedLeft = clamp(actualLeft, minX, maxX);
    const boundedTop = clamp(actualTop, minY, maxY);

    // 反算回 transform 值
    const boundedTransformX = boundedLeft - (initialCenterX - frameWidth / 2);
    const boundedTransformY = boundedTop - (initialCenterY - frameHeight / 2);

    // 应用 transform
    $phoneFrame.css('transform', `translate(${boundedTransformX}px, ${boundedTransformY}px)`);
}

function handlePhoneDragEnd(e) {
    if (!isPhoneDragging) return;

    isPhoneDragging = false;

    // 释放指针捕获
    if (e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) {
        e.target.releasePointerCapture(e.pointerId);
    }

}

function openAppPanel(appName, isRestoringFromClose = false) {

    // 检查数据
    if (!currentPhoneData) {
        const loaded = loadInitialMvuData();

        if (!loaded) {
            if (typeof toastr !== 'undefined') {
                toastr.warning('未找到数据\n请先初始化MVU变量或发送一条消息');
            }
            return;
        }
    }

    //  只有从关闭状态恢复时才检查是否需要恢复好友详情页面
    const relationshipSource = getRelationshipDataSource(currentPhoneData);
    const shouldRestoreFriendDetail = (
        isRestoringFromClose &&
        appName === 'friends' &&
        lastViewedFriend &&
        relationshipSource &&
        relationshipSource[lastViewedFriend]
    );

    // 清空导航栈，因为这是一个新的应用
    navigationStack = [];

    currentPanel = appName;
    let title = '';
    let content = '';

    //  添加异常处理，避免生成函数出错导致整个面板空白
    try {
        switch (appName) {
            case 'messages':
                title = '💬 信息';
                content = generateMessagesPanel(currentPhoneData);
                break;
            case 'gallery':
                title = '🖼️ CG收集';
                content = generateGalleryPanel(currentPhoneData);
                break;
            case 'forum':
                title = '💬 论坛';
                content = generateForumPanel();
                break;
            case 'friends':
                title = '👥 羁绊列表';
                // 使用统一的数据获取函数刷新数据
                fetchLatestMvuData(true);
                content = generateFriendsPanel(currentPhoneData);
                break;
            case 'wallpaper':
                title = '🎨 壁纸';
                // 清空已加载的壁纸分类状态，避免状态不一致
                phoneWpLoaded.clear();
                content = generateSettingsPanel(currentPhoneData);
                break;
            case 'settings':
                title = '⚙️ 设置';
                content = generateSizeSettingsPanel();
                break;
            default:
                title = '未知应用';
                content = '<div class="empty-message">应用不存在</div>';
                break;
        }
    } catch (error) {
        //  捕获异常，显示错误信息而不是空白
        title = title || `⚠ ${appName}`;
        content = `
            <div class="empty-message">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3; color: #ef4444;"></i>
                <div style="color: #ef4444; font-weight: 600;">加载面板时出错</div>
                <div style="font-size: 12px; color: #9ca3af; margin-top: 10px;">
                    ${error.message || '未知错误'}
                </div>
                    style="margin-top: 16px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    查看详细错误
                </button>
            </div>
        `;
    }

    $('#phone-app-title').text(title);
    $('#phone-app-body').html(content);
    $('#phone-detail-panel').addClass('active');

    //  特殊处理：好友列表面板，恢复之前的状态（多种方式尝试，确保iframe兼容）
    if (appName === 'friends') {
        // 如果需要恢复好友详情页
        if (shouldRestoreFriendDetail) {

            //  立即隐藏内容，避免看到好友列表或详情顶部的闪烁
            $('#phone-app-body').css('opacity', '0');

            // 延迟执行以确保DOM已完全渲染
            setTimeout(() => {
                const latestRelationships = getRelationshipDataSource();
                const friendData = latestRelationships ? latestRelationships[lastViewedFriend] : null;
                if (friendData) {
                    //  直接显示好友详情，跳过好友列表的显示
                    showFriendDetail(lastViewedFriend, friendData, true); // 传入 isRestoring = true

                    //  恢复好友详情页的滚动位置
                    setTimeout(() => {
                        //  获取真正的滚动容器
                        let scrollContainer = document.getElementById('friend-detail-scroll-container');
                        if (!scrollContainer) {
                            const $scrollContainer = $('#friend-detail-scroll-container');
                            if ($scrollContainer.length > 0) {
                                scrollContainer = $scrollContainer[0];
                            }
                        }

                        if (scrollContainer) {
                            scrollContainer.scrollTop = friendDetailScrollPosition;

                            //  恢复完成后淡入显示内容
                            setTimeout(() => {
                                $('#phone-app-body').css('opacity', '1');
                            }, 50); // 短暂延迟，确保滚动已完成
                        } else {
                            $('#phone-app-body').css('opacity', '1');
                        }
                    }, 50); // 减少延迟，更快恢复
                }
            }, 100); // 减少初始延迟
        } else {
            // 只有不恢复详情页时才单独恢复滚动位置
            if (friendsListScrollPosition > 0) {
                setTimeout(() => {
                    let appBodyElement = document.getElementById('phone-app-body');

                    // 如果原生方式找不到，尝试使用 jQuery
                    if (!appBodyElement) {
                        const $appBody = $('#phone-app-body');
                        if ($appBody.length > 0) {
                            appBodyElement = $appBody[0];
                        }
                    }

                    if (appBodyElement) {
                        appBodyElement.scrollTop = friendsListScrollPosition;
                    } else {
                    }
                }, 100);
            }
        }
    }

    // 特殊处理：如果是消息面板，检查并测试联系人点击
    if (appName === 'messages') {
        setTimeout(() => {
            const contactItems = $('.contact-item');
            contactItems.each(function (index) {
                const $item = $(this);
                const element = this;

                // 为第一个联系人添加一个测试点击处理器
                if (index === 0) {
                    $item.on('click.test', function () {
                    });
                }
            });

            // 测试事件委托是否生效（移除 $._data 调用，它不是标准API）
        }, 100);
    }



    // 特殊处理：如果是设置面板（尺寸设置），绑定事件
    if (appName === 'settings') {
        setTimeout(() => {

            const $appBody = $('#phone-app-body');
            if ($appBody.length === 0) {
                return;
            }

            // 先解绑之前的事件
            $appBody.off('click.phonesize');

            // 绑定预设尺寸按钮
            $appBody.on('click.phonesize', '.phone-size-preset-btn', function (e) {
                e.preventDefault();
                const width = $(this).data('width');
                const height = $(this).data('height');
                $('#phone-width-input').val(width);
                $('#phone-height-input').val(height);
            });

            // 绑定应用设置按钮
            $appBody.on('click.phonesize', '.phone-size-apply-btn', function (e) {
                e.preventDefault();
                const width = parseInt($('#phone-width-input').val());
                const height = parseInt($('#phone-height-input').val());

                if (width < 320 || width > 600 || height < 500 || height > 900) {
                    if (typeof toastr !== 'undefined') {
                        toastr.error('尺寸超出范围！');
                    }
                    return;
                }

                applyPhoneSize(width, height);
            });

            // 绑定恢复默认按钮
            $appBody.on('click.phonesize', '.phone-size-reset-btn', function (e) {
                e.preventDefault();
                resetPhoneSize();
            });

        }, 100);
    }

    // 特殊处理：如果是壁纸面板（wallpaper），绑定壁纸事件
    if (appName === 'wallpaper') {
        setTimeout(() => {

            const $appBody = $('#phone-app-body');
            if ($appBody.length === 0) {
                return;
            }

            // 先解绑之前的事件
            $appBody.off('click.wallpaper');

            // 1. 绑定默认壁纸按钮点击事件
            $appBody.on('click.wallpaper', '.default-wallpaper-btn', function (e) {
                e.stopPropagation();
                resetWallpaper();
            });

            // 1.5 绑定上传壁纸按钮点击事件
            $appBody.on('click.wallpaper', '.upload-wallpaper-btn', function (e) {
                e.stopPropagation();
                // 触发隐藏的文件输入框
                $('#wallpaper-upload-input').click();
            });

            // 1.6 绑定文件选择事件
            $('#wallpaper-upload-input').off('change').on('change', function (e) {
                const file = e.target.files[0];
                if (file) {
                    uploadCustomWallpaper(file);
                }
            });

            // 2. 绑定分类头点击事件（使用事件委托，点击整个.list-item区域都有效）
            $appBody.on('click.wallpaper', '.wallpaper-category .list-item', function (e) {
                const $categoryDiv = $(this).closest('.wallpaper-category');
                const categoryName = $categoryDiv.data('category');

                if (categoryName) {
                    e.stopPropagation();
                    toggleWallpaperCategory(categoryName);
                }
            });

            // 3. 绑定壁纸图片点击事件（使用事件委托）
            $appBody.on('click.wallpaper', '.wallpaper-item', function (e) {
                const wallpaperUrl = $(this).data('wallpaper-url');

                if (wallpaperUrl) {
                    e.stopPropagation();
                    setWallpaper(wallpaperUrl);
                }
            });

        }, 100);
    }

    // 特殊处理：如果是CG收集面板，绑定事件
    if (appName === 'gallery') {
        setTimeout(() => {
            bindCGGalleryEvents();
        }, 100);
    }

    // 特殊处理：如果是日历面板，绑定日期点击事件
    if (appName === 'calendar') {
        setTimeout(() => {
            const $appBody = $('#phone-app-body');
            if ($appBody.length === 0) return;

            // 先解绑之前的事件
            $appBody.off('click.calendar');

            // 绑定日期点击事件
            $appBody.on('click.calendar', '.cal-day', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const day = $(this).data('day');
                if (day) {
                    selectCalendarDay(day);
                }
            });
        }, 100);
    }

}

function closeAppPanel() {

    // 检查是否有导航历史
    if (navigationStack.length > 0) {
        const previousPage = navigationStack.pop();

        //  如果从好友详情页返回到好友列表，保留 lastViewedFriend 以便下次恢复
        const isReturningToFriendsList = previousPage.title && (previousPage.title.includes('好友列表') || previousPage.title.includes('羁绊列表'));
        if (isReturningToFriendsList) {
            // 保留 lastViewedFriend 不清除
        }

        // 恢复上一级页面
        $('#phone-app-title').text(previousPage.title);
        $('#phone-app-body').html(previousPage.content);

        //  恢复滚动位置（如果有保存）- 多种方式尝试，确保iframe兼容
        if (previousPage.scrollPosition !== undefined || lastViewedFriend) {
            setTimeout(() => {
                let appBodyElement = document.getElementById('phone-app-body');

                // 如果原生方式找不到，尝试使用 jQuery
                if (!appBodyElement) {
                    const $appBody = $('#phone-app-body');
                    if ($appBody.length > 0) {
                        appBodyElement = $appBody[0];
                    }
                }

                if (appBodyElement) {
                    //  优先使用元素定位恢复位置
                    if (lastViewedFriend) {
                        const $friendItem = $(`.friend-item[data-friend-name="${lastViewedFriend}"]`);
                        if ($friendItem.length > 0) {
                            const targetPosition = $friendItem.position().top + appBodyElement.scrollTop;
                            appBodyElement.scrollTop = targetPosition;
                            return;
                        }
                    }

                    // 备选：使用保存的滚动位置
                    if (previousPage.scrollPosition > 0) {
                        appBodyElement.scrollTop = previousPage.scrollPosition;
                        const actualPosition = appBodyElement.scrollTop;

                        // 如果实际位置和目标位置不一致，可能是DOM还没完全渲染，再试一次
                        if (actualPosition < previousPage.scrollPosition - 10) {
                            setTimeout(() => {
                                appBodyElement.scrollTop = previousPage.scrollPosition;
                            }, 150);
                        }
                    }
                } else {
                }
            }, 150); // 增加延迟确保DOM已完全渲染
        }

    } else {
        // 没有历史记录，关闭整个面板
        $('#phone-detail-panel').removeClass('active');
        currentPanel = null;

        //  不清除 lastViewedFriend 和 friendsListScrollPosition，以便下次打开时恢复
        // 只有当用户完全关闭手机界面时才清除

        // 清除保存的面板状态
        try {
            localStorage.setItem('mobile-last-panel', '');
        } catch (e) {
        }
    }
}

// ==================== 消息发送器类 ====================
/**
 * MessageSender - 负责处理消息发送和格式化
 * 参考原项目的 message-sender.js
 */
class MessageSender {
    constructor() {
        this.currentFriendId = null;
        this.currentFriendName = null;
        this.isGroup = false;
    }

    /**
     * 设置当前聊天对象
     */
    setCurrentChat(friendId, friendName, isGroup = false) {
        this.currentFriendId = friendId;
        this.currentFriendName = friendName;
        this.isGroup = isGroup;
    }

    /**
     * 发送消息到SillyTavern
     */
    async sendToChat(message) {
        try {

            // 尝试从父窗口获取元素（如果在 iframe 中）
            let targetDocument = document;
            if (window.parent && window.parent !== window) {
                try {
                    targetDocument = window.parent.document;
                } catch (e) {
                }
            }

            const originalInput = targetDocument.getElementById('send_textarea');
            const sendButton = targetDocument.getElementById('send_but');

            if (!originalInput || !sendButton) {
                return false;
            }

            if (originalInput.disabled || sendButton.classList.contains('disabled')) {
                return false;
            }

            // 追加消息到输入框
            const existingValue = originalInput.value;
            const newValue = existingValue ? existingValue + '\n' + message : message;
            originalInput.value = newValue;

            // 触发输入事件
            originalInput.dispatchEvent(new Event('input', { bubbles: true }));
            originalInput.dispatchEvent(new Event('change', { bubbles: true }));

            // 延迟点击发送按钮
            await new Promise(resolve => setTimeout(resolve, 300));
            sendButton.click();

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 等待 AI 回复完成（监听消息数量变化和内容稳定）
     * @param {Function} onMessageUpdate - 消息更新回调（可选）
     */
    async waitForAIResponse(onMessageUpdate = null) {
        return new Promise((resolve) => {
            // 获取 SillyTavern 上下文
            let targetWindow = window;
            if (window.parent && window.parent !== window) {
                try {
                    if (window.parent.SillyTavern) {
                        targetWindow = window.parent;
                    }
                } catch (e) {
                }
            }

            if (!targetWindow.SillyTavern || !targetWindow.SillyTavern.getContext) {
                // 如果无法获取上下文，等待5秒后结束
                setTimeout(resolve, 5000);
                return;
            }

            const context = targetWindow.SillyTavern.getContext();
            const initialMessageCount = context.chat ? context.chat.length : 0;

            let checkCount = 0;
            const maxChecks = 300; // 最多等待30秒
            let hasNewMessage = false;
            let lastMessageCount = initialMessageCount;
            let lastMessageContent = '';
            let stableCount = 0; // 内容稳定计数器

            const checkInterval = setInterval(() => {
                checkCount++;

                try {
                    const currentContext = targetWindow.SillyTavern.getContext();
                    const currentMessageCount = currentContext.chat ? currentContext.chat.length : 0;

                    if (currentMessageCount > initialMessageCount) {
                        if (!hasNewMessage) {
                            hasNewMessage = true;
                        }

                        if (currentMessageCount > lastMessageCount && onMessageUpdate) {
                            onMessageUpdate();
                            lastMessageCount = currentMessageCount;
                            stableCount = 0;
                        }

                        const lastMessage = currentContext.chat[currentContext.chat.length - 1];
                        const currentContent = lastMessage?.mes || '';

                        if (currentContent !== lastMessageContent) {
                            lastMessageContent = currentContent;
                            stableCount = 0;

                            if (onMessageUpdate && checkCount % 3 === 0) {
                                onMessageUpdate();
                            }
                        } else {
                            stableCount++;

                            if (stableCount >= 10) {
                                clearInterval(checkInterval);
                                if (onMessageUpdate) {
                                    onMessageUpdate();
                                }
                                setTimeout(resolve, 500);
                                return;
                            } else if (checkCount % 5 === 0) {
                                if (onMessageUpdate) {
                                    onMessageUpdate();
                                }
                            }
                        }
                    }

                    if (checkCount >= maxChecks) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                } catch (error) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }

    /**
     * 构建并发送消息
     * @param {string} message - 要发送的消息
     * @param {Object} uiElements - UI元素引用（可选）
     */
    async buildAndSendMessage(message, uiElements = null) {
        if (!this.currentFriendId || !this.currentFriendName) {
            throw new Error('未设置当前聊天对象');
        }

        const messageLines = message.split('\n').filter(line => line.trim());
        if (messageLines.length === 0) {
            throw new Error('消息内容不能为空');
        }


        // 格式化消息
        const formattedMessages = messageLines.map(line => {
            const content = line.trim();
            // 群聊使用 [群聊消息|群号|发送者|类型|内容]
            // 私聊使用 [我方消息|我|号码|类型|内容]
            return this.isGroup
                ? `[群聊消息|${this.currentFriendId}|我|文字|${content}]`
                : `[我方消息|我|${this.currentFriendId}|文字|${content}]`;
        });

        // 构建最终消息
        let targetPrefix;
        if (this.isGroup) {
            //  获取群聊成员列表（参考 mobile-master）
            const groupMembers = this.getCurrentGroupMembers();
            const membersText = groupMembers.length > 0
                ? `，群聊内成员有${groupMembers.join('、')}`
                : '';

            //  简化提示词，去掉格式说明部分（原完整版本已在下方注释中保留）
            targetPrefix = `向${this.currentFriendName}（${this.currentFriendId}）发送群聊${membersText}`;
            // targetPrefix = `向${this.currentFriendName}（${this.currentFriendId}）发送群聊${membersText}。请按照线上聊天群聊消息中的要求和格式生成群聊内角色回复，回复需要符合所有角色的人设和当前剧情`;
        } else {
            //  简化提示词，去掉格式说明部分（原完整版本已在下方注释中保留）
            // targetPrefix = `向${this.currentFriendName}（${this.currentFriendId}）发送消息`;
            targetPrefix = `向${this.currentFriendName}（${this.currentFriendId}）发送消息，请按照线上聊天私聊消息中的要求和格式生成角色回复，回复需要符合角色人设和当前剧情`;
        }

        //  添加详细的响应格式说明
        // const formatInstructions = this.isGroup
        // ? `\n\n 群聊消息响应格式要求\n必须使用以下格式回复：\n[群聊消息|群号|发送者名字|消息类型|消息内容]\n\n格式说明：\n- 群号必须是 ${this.currentFriendId}\n- 发送者名字是群内角色的名字\n- 消息类型通常是"文字"，也可以是"语音"、"图片"、"表情包"等\n- 每条消息必须单独成行\n- 可以有多个角色回复，每个角色一条消息`
        // : `\n\n 私聊消息响应格式要求\n必须使用以下格式回复：\n[对方消息|角色名字|号码|消息类型|消息内容]\n\n格式说明：\n- 号码必须是 ${this.currentFriendId}\n- 角色名字是 ${this.currentFriendName}\n- 消息类型通常是"文字"，也可以是"语音"、"图片"、"表情包"等\n- 每条消息必须单独成行\n- 可以回复多条消息`;

        //  包含格式说明的完整消息
        const formatStr = '以下为最高优先级的元指令，此为特例输入，暂停故事演绎，不推进和输出任何正文剧情，改为按要求模拟消息回复：';

        //  为群聊添加明确的角色列表说明
        let formatInstructions;
        if (this.isGroup) {
            const groupMembers = this.getCurrentGroupMembers();
            const membersListText = groupMembers.length > 0
                ? `\n- 本次群聊涉及的群内角色有：${groupMembers.join('、')}\n- 发送者名字必须从以上角色列表中选择`
                : '\n- 发送者名字是群内角色的名字';

            formatInstructions = `

 群聊消息响应格式要求
必须使用以下格式回复：
[群聊消息|群号|发送者名字|消息类型|消息内容]

格式说明：
- 群号必须是 ${this.currentFriendId}${membersListText}
- 发送者名字必须使用简体中文，不能使用繁体字
- 消息类型通常是"文字"，也可以是"语音"、"图片"、"表情包"等，如果存在image_insertion_guide任务，且回复角色存在插图列表，则消息图片优先使用image_insertion_guide中规定的图片格式回复
- 每条消息必须单独成行
- 可以有多个角色回复，每个角色一条消息`;
        } else {
            formatInstructions = `

 私聊消息响应格式要求
必须使用以下格式回复：
[对方消息|角色名字|号码|消息类型|消息内容]

格式说明：
- 号码必须是 ${this.currentFriendId}
- 角色名字是 ${this.currentFriendName}，必须使用简体中文，不能使用繁体字
- 消息类型通常是"文字"，也可以是"语音"、"图片"、"表情包"等，如果存在image_insertion_guide任务，且回复角色存在插图列表，则消息图片优先使用image_insertion_guide中规定的图片格式回复
- 每条消息必须单独成行
- 可以回复多条消息`;
        }

        // 构建最终消息，群聊时添加额外的提示
        const finalMessage = this.isGroup
            ? `${formatStr}${formatInstructions}，请用规定格式，${targetPrefix}\n\n我发送的消息：\n${formattedMessages.join('\n')}\n\n请令群内角色按格式回复我发送的消息`
            : `${formatStr}${formatInstructions}，请用规定格式，${targetPrefix}\n\n我发送的消息：\n${formattedMessages.join('\n')}\n\n请令私聊对象角色按格式回复我发送的消息`;

        const success = await this.sendToChat(finalMessage);

        if (success) {
            //  显示成功提示
            this.showSendSuccessToast(messageLines.length > 1
                ? `${messageLines.length}条消息`
                : messageLines[0]
            );
        }

        return success;
    }

    /**
     * 显示发送成功提示
     */
    showSendSuccessToast(message) {
        if (typeof toastr !== 'undefined') {
            toastr.success(`发送给: ${this.currentFriendName}\n${message.length > 20 ? message.substring(0, 20) + '...' : message}`);
        }
    }

    /**
     * 显示发送失败提示
     */
    showSendErrorToast(error) {
        if (typeof toastr !== 'undefined') {
            toastr.error(`发送失败: ${error}`);
        }
    }

    /**
     * 发送消息的主要方法
     * @param {string} message - 要发送的消息
     * @param {Object} uiElements - UI元素引用（可选）
     */
    async sendMessage(message, uiElements = null) {
        if (!message.trim()) {
            this.showSendErrorToast('消息内容不能为空');
            return false;
        }

        if (!this.currentFriendId) {
            this.showSendErrorToast('请选择一个聊天对象');
            return false;
        }

        try {
            const success = await this.buildAndSendMessage(message, uiElements);
            if (!success) {
                this.showSendErrorToast('发送失败，请重试');
            }
            return success;
        } catch (error) {
            this.showSendErrorToast(error.message || '发送失败');
            return false;
        }
    }

    /**
     * 清空当前聊天对象
     */
    clearCurrentChat() {
        this.currentFriendId = null;
        this.currentFriendName = null;
        this.isGroup = false;
    }

    /**
     * 获取当前群聊的成员列表
     * 参考 mobile-master/app/message-sender.js 的实现
     */
    getCurrentGroupMembers() {
        if (!this.isGroup || !this.currentFriendId) {
            return [];
        }

        try {
            // 方法1: 从聊天记录中查找最新的群聊信息
            if (!window.SillyTavern || !window.SillyTavern.getContext) {
                return [];
            }

            const context = window.SillyTavern.getContext();
            const messages = context.chat || [];
            let latestGroupInfo = null;


            // 创建正则表达式匹配该群的信息（不限制群号，后面再筛选）
            // 格式1: [群聊|群名|群号|成员列表]
            const groupRegex1 = /\[群聊\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g;
            // 格式2: [创建群聊|群号|群名|成员列表]
            const groupRegex2 = /\[创建群聊\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g;

            // 从最新消息开始查找
            for (let i = messages.length - 1; i >= 0; i--) {
                let messageText = messages[i].mes || '';

                //  清理提示词模板：从消息文本中删除模板部分，保留真实内容
                // 删除包含"群聊消息响应格式要求"到"可以有多个角色回复"之间的所有内容
                messageText = messageText.replace(/群聊消息响应格式要求[\s\S]*?可以有多个角色回复，每个角色一条消息/g, '');
                messageText = messageText.replace(/私聊消息响应格式要求[\s\S]*?可以回复多条消息/g, '');

                // 删除包含字面量的示例格式
                messageText = messageText.replace(/\[群聊消息\|群号\|发送者名字\|消息类型\|消息内容\]/g, '');
                messageText = messageText.replace(/\[对方消息\|角色名字\|号码\|消息类型\|消息内容\]/g, '');
                messageText = messageText.replace(/\[我方消息\|我\|号码\|消息类型\|消息内容\]/g, '');
                messageText = messageText.replace(/\[群聊\|群名\|群号\|成员列表\]/g, '');
                messageText = messageText.replace(/\[创建群聊\|群号\|群名\|成员列表\]/g, '');

                // 如果清理后的消息为空，跳过
                if (!messageText.trim()) {
                    continue;
                }

                // 检查消息中是否包含群聊相关内容
                if (messageText.includes('[群聊|')) {
                } else if (messageText.includes('[创建群聊|')) {
                }

                // 重置正则表达式索引
                groupRegex1.lastIndex = 0;
                groupRegex2.lastIndex = 0;

                // 尝试匹配第一种格式：[群聊|群名|群号|成员列表]
                let match = groupRegex1.exec(messageText);
                if (match) {
                    const groupName = match[1];
                    const groupId = match[2];
                    const members = match[3];


                    // 检查群号是否匹配（使用字符串比较）
                    if (String(groupId) === String(this.currentFriendId)) {
                        latestGroupInfo = {
                            groupName: groupName,
                            members: members
                        };
                        break;
                    }
                }

                // 尝试匹配第二种格式：[创建群聊|群号|群名|成员列表]
                match = groupRegex2.exec(messageText);
                if (match) {
                    const groupId = match[1];
                    const groupName = match[2];
                    const members = match[3];


                    // 检查群号是否匹配（使用字符串比较）
                    if (String(groupId) === String(this.currentFriendId)) {
                        latestGroupInfo = {
                            groupName: groupName,
                            members: members
                        };
                        break;
                    }
                }
            }

            if (latestGroupInfo) {
                // 解析成员列表
                const members = latestGroupInfo.members
                    .split(/[、,，]/)
                    .map(name => name.trim())
                    .filter(name => name);

                return members;
            }

            // 方法2: 如果没找到定义，尝试从群聊消息中提取成员
            const membersSet = new Set();
            const groupMessageRegex = new RegExp(`\\[群聊消息\\|${this.currentFriendId}\\|([^\\|]+)\\|`, 'g');

            messages.forEach(msg => {
                const messageText = msg.mes || '';
                groupMessageRegex.lastIndex = 0;
                let match;
                while ((match = groupMessageRegex.exec(messageText)) !== null) {
                    const senderName = match[1];
                    if (senderName && senderName !== '我') {
                        membersSet.add(senderName);
                    }
                }
            });

            // 如果我发送过消息，添加"我"
            const myGroupMessageRegex = new RegExp(`\\[我方群聊消息\\|我\\|${this.currentFriendId}\\|`, 'g');
            const hasMyMessage = messages.some(msg => {
                const messageText = msg.mes || '';
                myGroupMessageRegex.lastIndex = 0;
                return myGroupMessageRegex.test(messageText);
            });

            if (hasMyMessage) {
                membersSet.add('我');
            }

            const members = Array.from(membersSet);
            if (members.length > 0) {
                return members;
            }

            return [];
        } catch (error) {
            return [];
        }
    }
}

// 创建全局消息发送器实例
window.messageSender = new MessageSender();

// ==================== 聊天界面功能函数 ====================
/**
 * 从聊天记录中提取与指定联系人的消息
 */
function extractMessagesForContact(contactId, isGroup = false) {
    const messages = [];
    const messageSet = new Set(); // 用于去重

    try {
        let chatMessages = [];

        let targetWindow = window;
        if (window.parent && window.parent !== window) {
            try {
                if (window.parent.SillyTavern) {
                    targetWindow = window.parent;
                }
            } catch (e) {
            }
        }

        if (targetWindow.SillyTavern && targetWindow.SillyTavern.getContext) {
            const context = targetWindow.SillyTavern.getContext();
            chatMessages = context.chat || [];
        } else {
        }

        chatMessages.forEach((msg, index) => {
            if (!msg.mes) return;
            let text = msg.mes;

            //  清理提示词模板：从消息文本中删除模板部分，保留真实内容
            text = text.replace(/群聊消息响应格式要求[\s\S]*?可以有多个角色回复，每个角色一条消息/g, '');
            text = text.replace(/私聊消息响应格式要求[\s\S]*?可以回复多条消息/g, '');
            text = text.replace(/\[群聊消息\|群号\|发送者名字\|消息类型\|消息内容\]/g, '');
            text = text.replace(/\[对方消息\|角色名字\|号码\|消息类型\|消息内容\]/g, '');
            text = text.replace(/\[我方消息\|我\|号码\|消息类型\|消息内容\]/g, '');
            text = text.replace(/\[群聊\|群名\|群号\|成员列表\]/g, '');
            text = text.replace(/\[创建群聊\|群号\|群名\|成员列表\]/g, '');

            // 如果清理后的消息为空，跳过
            if (!text.trim()) return;

            // 如果是群聊，记录包含群聊消息的文本
            // if (isGroup && text.includes('[群聊消息|')) {
            // }

            // 匹配私聊消息: [我方消息|我|号码|类型|内容] 或 [对方消息|名字|号码|类型|内容]
            const privateRegex = /\[(我方消息|对方消息)\|([^|]*)\|([^|]*)\|([^|]*)\|([^\]]*)\]/g;
            // 匹配群聊消息: [群聊消息|群号|发送者|类型|内容]
            const groupRegex = /\[群聊消息\|([^|]*)\|([^|]*)\|([^|]*)\|([^\]]*)\]/g;
            //  新增：匹配我方群聊消息: [我方群聊消息|我|群号|类型|内容]
            const myGroupRegex = /\[我方群聊消息\|我\|([^|]*)\|([^|]*)\|([^\]]*)\]/g;

            let match;

            if (isGroup) {
                groupRegex.lastIndex = 0;
                while ((match = groupRegex.exec(text)) !== null) {
                    const groupId = match[1].trim();
                    const sender = match[2].trim();
                    const msgType = match[3].trim();
                    const content = match[4];

                    //  过滤模板消息：如果内容仅为"内容"或"消息内容"，跳过
                    if (content.trim() === '内容' || content.trim() === '消息内容') {
                        continue;
                    }

                    if (String(groupId) === String(contactId)) {
                        const messageKey = `${sender}|${msgType}|${content}`;

                        if (!messageSet.has(messageKey)) {
                            messageSet.add(messageKey);
                            messages.push({
                                isMine: sender === '我',
                                sender: sender,
                                type: msgType,
                                content: content,
                                time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                            });
                        }
                    }
                }

                myGroupRegex.lastIndex = 0;
                while ((match = myGroupRegex.exec(text)) !== null) {
                    const groupId = match[1].trim();
                    const msgType = match[2].trim();
                    const content = match[3];

                    //  过滤模板消息：如果内容仅为"内容"或"消息内容"，跳过
                    if (content.trim() === '内容' || content.trim() === '消息内容') {
                        continue;
                    }

                    if (String(groupId) === String(contactId)) {
                        const messageKey = `我|${msgType}|${content}`;

                        if (!messageSet.has(messageKey)) {
                            messageSet.add(messageKey);
                            messages.push({
                                isMine: true,
                                sender: '我',
                                type: msgType,
                                content: content,
                                time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                            });
                        }
                    }
                }
            } else {
                while ((match = privateRegex.exec(text)) !== null) {
                    const type = match[1];
                    const sender = match[2].trim();
                    const number = match[3].trim();
                    const msgType = match[4].trim();
                    const content = match[5];

                    //  过滤模板消息：如果内容仅为"内容"或"消息内容"，跳过
                    if (content.trim() === '内容' || content.trim() === '消息内容') {
                        continue;
                    }


                    //  使用 String() 转换确保类型一致
                    if (String(number) === String(contactId)) {
                        // 创建消息唯一标识，用于去重
                        const isMine = type === '我方消息';
                        const senderName = isMine ? '我' : sender;
                        const messageKey = `${isMine}|${senderName}|${msgType}|${content}`;

                        if (!messageSet.has(messageKey)) {
                            messageSet.add(messageKey);
                            messages.push({
                                isMine: isMine,
                                sender: senderName,
                                type: msgType,
                                content: content,
                                time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                            });
                        } else {
                        }
                    }
                }
            }
        });

    } catch (error) {
    }

    return messages;
}

// 全局变量：聊天界面轮询定时器
let chatPanelRefreshInterval = null;
let currentChatContactId = null;
let currentChatContactName = null;
let currentChatIsGroup = false;

/**
 * 打开聊天界面
 */
function openChatPanel(contactId, contactName, isGroup = false, members = '') {

    // 保存当前聊天信息（用于恢复定时器）
    currentChatContactId = contactId;
    currentChatContactName = contactName;
    currentChatIsGroup = isGroup;

    // 设置当前聊天对象
    window.messageSender.setCurrentChat(contactId, contactName, isGroup);

    // 更新聊天标题（群聊显示成员列表）
    let title = isGroup ? `👥 ${contactName}` : `💬 ${contactName}`;

    //  如果是群聊，显示成员信息
    if (isGroup && members) {
        const memberCount = members.split(/[、,，]/).filter(m => m.trim()).length;
        title += ` (${memberCount}人)`;
        $('#chat-title').html(`
            <div style="display: flex; align-items: center; justify-content: center; flex-direction: column;">
                <div style="font-size: 16px; font-weight: 600;">${title}</div>
                <div style="font-size: 11px; opacity: 0.7; margin-top: 2px;">${members}</div>
            </div>
        `);
    } else {
        $('#chat-title').text(title);
    }

    //  在聊天标题栏右侧添加删除按钮（仅群聊）
    const $rightActions = $('#chat-right-actions');

    if (isGroup) {
        // 添加删除按钮到右上角
        $rightActions.html(`
            <button class="chat-delete-group-btn" data-group-id="${contactId}" data-group-name="${contactName}" 
                    style="background: none; border: none; color: #ef4444; font-size: 22px; 
                           cursor: pointer; padding: 0; width: 36px; height: 36px; display: flex; 
                           align-items: center; justify-content: center; transition: transform 0.2s;"
                    onmouseover="this.style.transform='scale(1.1)'" 
                    onmouseout="this.style.transform='scale(1)'">
                
            </button>
        `);
    } else {
        // 私聊时清空右侧区域
        $rightActions.html('');
    }

    // 渲染消息列表
    renderChatMessages(contactId, isGroup);

    // 显示聊天面板
    $('#phone-chat-panel').addClass('active');

    // 清空输入框
    $('#chat-input').val('');

    //  启动自动刷新（每1000ms轮询一次）
    if (chatPanelRefreshInterval) {
        clearInterval(chatPanelRefreshInterval);
    }
    chatPanelRefreshInterval = setInterval(() => {
        //  检查手机界面是否打开
        const $mobileOverlay = $('#mobile-phone-overlay');
        const isMobileOpen = $mobileOverlay.hasClass('active');

        //  检查聊天面板是否打开
        const $chatPanel = $('#phone-chat-panel');
        const isChatOpen = $chatPanel.hasClass('active');

        // 只有手机界面和聊天界面都打开时才刷新
        // 不再在这里停止定时器，让它持续运行，只在需要时才刷新
        if (isMobileOpen && isChatOpen) {
            renderChatMessages(contactId, isGroup);
        }
        // 如果界面关闭，什么都不做，继续等待下一次检查
    }, 1000);
}

/**
 * 关闭聊天界面
 */
function closeChatPanel() {
    $('#phone-chat-panel').removeClass('active');
    window.messageSender.clearCurrentChat();

    //  不清除 currentChatContactId 等变量，保留用于重新打开手机时的状态恢复
    //  只清除定时器，因为聊天面板已经关闭

    //  停止自动刷新
    if (chatPanelRefreshInterval) {
        clearInterval(chatPanelRefreshInterval);
        chatPanelRefreshInterval = null;
    }
}

/**
 * 渲染聊天消息
 */
function renderChatMessages(contactId, isGroup = false) {
    console.log('[renderChatMessages] 刷新聊天消息:', contactId, '群聊:', isGroup);
    const messages = extractMessagesForContact(contactId, isGroup);
    const $container = $('#chat-messages');

    // 如果没有消息，显示空白（不显示默认消息）
    if (messages.length === 0) {
        $container.html('');
        return;
    }

    let html = '';
    messages.forEach(msg => {
        const messageClass = msg.isMine ? 'mine' : 'other';

        // 获取发送者头像（仅对非自己的消息）
        let avatarHtml = '';
        if (!msg.isMine) {
            const senderName = msg.sender || contactId;
            const avatarUrl = getCharacterAvatar(senderName);
            if (avatarUrl) {
                avatarHtml = `<img src="${avatarUrl}" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover; flex-shrink: 0;" onerror="this.style.display='none'">`;
            } else {
                // 无头像时显示首字母
                const initial = senderName ? senderName.charAt(0) : '?';
                avatarHtml = `<div style="width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; flex-shrink: 0;">${initial}</div>`;
            }
        }

        //  群聊消息显示发送者名称
        let senderInfo = '';
        if (isGroup) {
            // 群聊中，所有消息都显示发送者
            const senderName = msg.isMine ? '我' : msg.sender;
            const senderColor = msg.isMine ? '#4CAF50' : '#2196F3';
            senderInfo = `<div class="message-sender" style="font-size: 11px; font-weight: 600; color: ${senderColor}; margin-bottom: 4px;">${senderName}</div>`;
        }

        const typeInfo = msg.type !== '文字' ? `<div style="font-size: 11px; opacity: 0.8; margin-bottom: 3px;">[${msg.type}]</div>` : '';

        //  处理消息中的图片标签
        const processedContent = processMessageImages(msg.content);

        // 根据是否是自己的消息决定布局
        if (msg.isMine) {
            html += `
                <div class="message-item ${messageClass}">
                    <div class="message-bubble">
                        ${senderInfo}
                        ${typeInfo}
                        <div>${processedContent}</div>
                        <div class="message-time">${msg.time}</div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="message-item ${messageClass}" style="display: flex; align-items: flex-start; gap: 8px;">
                    ${avatarHtml}
                    <div class="message-bubble">
                        ${senderInfo}
                        ${typeInfo}
                        <div>${processedContent}</div>
                        <div class="message-time">${msg.time}</div>
                    </div>
                </div>
            `;
        }
    });

    $container.html(html);

    //  已移除自动滚动到底部的功能，允许用户查看历史聊天记录
    // setTimeout(() => {
    //     $container.scrollTop($container[0].scrollHeight);
    // }, 100);
}

// ==================== 图片处理功能 ====================
/**
 * 处理消息内容中的图片标签
 * @param {string} content - 原始消息内容
 * @returns {string} - 处理后的HTML内容
 */
function processMessageImages(content) {
    if (!content) return '';

    // 使用正则替换 <pic>...</pic> 为图片HTML
    const imageRegex = /<pic>(.*?)<\/pic>/gi;

    const processedContent = content.replace(imageRegex, (match, imagePath) => {
        const imageUrl = `https://gitgud.io/Rown/dnf/-/raw/master/${imagePath.trim()}.webp`;
        // 使用data属性存储URL，通过事件委托处理点击
        return `<div class="message-image-container" style="margin: 8px 0;">
            <img src="${imageUrl}" 
                 class="message-image clickable-image" 
                 data-image-url="${imageUrl}"
                 style="max-width: 200px; max-height: 200px; border-radius: 8px; cursor: pointer; display: block;"
                 onerror="this.style.display='none'; this.insertAdjacentHTML('afterend', '<div class=\'image-error\' style=\'color:#999;font-size:12px;padding:8px;\'>📷 图片加载失败</div>');" />
        </div>`;
    });

    return processedContent;
}

/**
 * 查看完整图片（大图模式）
 * @param {string} imageUrl - 图片URL
 */
function viewFullImage(imageUrl) {

    // 移除已存在的查看器
    $('#image-viewer').remove();

    // 创建全屏图片查看器
    const viewer = $('<div>', {
        id: 'image-viewer',
        css: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
        }
    });

    // 关闭按钮
    const closeBtn = $('<button>', {
        text: '✕ 关闭',
        css: {
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
        }
    }).on('click', function () {
        $('#image-viewer').remove();
    });

    // 图片元素
    const img = $('<img>', {
        src: imageUrl,
        css: {
            maxWidth: '90%',
            maxHeight: '90%',
            objectFit: 'contain'
        }
    });

    viewer.append(closeBtn, img);

    // 点击背景关闭
    viewer.on('click', function (e) {
        if (e.target === this) {
            $(this).remove();
        }
    });

    $('body').append(viewer);
}

/**
 * 发送聊天消息
 */
async function sendChatMessage() {
    const $input = $('#chat-input');
    const $sendBtn = $('#chat-send-btn');
    const $sendIcon = $sendBtn.find('i');
    const message = $input.val().trim();

    if (!message) return;


    // 清空输入框
    $input.val('');

    try {
        //  传递按钮引用，让 MessageSender 控制按钮状态
        const success = await window.messageSender.sendMessage(message, {
            button: $sendBtn,
            icon: $sendIcon,
            input: $input
        });

        if (success) {
        }
    } catch (error) {
    }
}

// ==================== 辅助函数：从聊天记录中提取信息 ====================
/**
 * 从SillyTavern聊天记录中提取好友信息
 */
function extractFriendsFromChat() {
    const friends = new Map();

    try {
        //  尝试获取 SillyTavern 的聊天消息（支持 iframe）
        let messages = [];
        const targetWindow = window.parent || window;

        if (targetWindow.SillyTavern && typeof targetWindow.SillyTavern.getContext === 'function') {
            const context = targetWindow.SillyTavern.getContext();
            messages = context.chat || [];
        } else {
            return friends;
        }

        messages.forEach(msg => {
            if (!msg.mes) return;
            const text = msg.mes;

            // 提取好友: [好友id|名字|号码]
            const friendRegex = /\[好友id\|([^|]+)\|(\d+)\]/g;
            let match;
            while ((match = friendRegex.exec(text)) !== null) {
                const name = match[1];
                const id = match[2];
                if (!friends.has(id)) {
                    friends.set(id, {
                        name,
                        id,
                        isGroup: false,
                        lastMessage: '',
                        time: new Date().toLocaleTimeString()
                    });
                }
            }
        });

    } catch (error) {
    }

    return friends;
}

/**
 * 从SillyTavern聊天记录中提取群聊信息
 * 参考 mobile-master/app/friend-renderer.js 的实现
 * 支持从群聊定义和群聊消息中提取
 */
function extractGroupsFromChat() {
    const groupsMap = new Map();

    try {
        //  尝试获取 SillyTavern 的聊天消息（支持 iframe）
        let messages = [];
        const targetWindow = window.parent || window;

        if (targetWindow.SillyTavern && typeof targetWindow.SillyTavern.getContext === 'function') {
            const context = targetWindow.SillyTavern.getContext();
            messages = context.chat || [];
        } else {
            return groupsMap;
        }

        // 定义正则表达式
        const groupPattern = /\[群聊\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;  // [群聊|群名|群号|成员]
        const createGroupPattern = /\[创建群聊\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;  // [创建群聊|群号|群名|成员]
        const groupMessagePattern = /\[群聊消息\|([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;  // [群聊消息|群ID|发送者|类型|内容]
        const myGroupMessagePattern = /\[我方群聊消息\|我\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;  // [我方群聊消息|我|群ID|类型|内容]


        messages.forEach((msg, index) => {
            if (!msg.mes) return;
            let text = msg.mes;

            //  清理提示词模板：从消息文本中删除模板部分，保留真实内容
            text = text.replace(/群聊消息响应格式要求[\s\S]*?可以有多个角色回复，每个角色一条消息/g, '');
            text = text.replace(/私聊消息响应格式要求[\s\S]*?可以回复多条消息/g, '');
            text = text.replace(/\[群聊消息\|群号\|发送者名字\|消息类型\|消息内容\]/g, '');
            text = text.replace(/\[对方消息\|角色名字\|号码\|消息类型\|消息内容\]/g, '');
            text = text.replace(/\[我方消息\|我\|号码\|消息类型\|消息内容\]/g, '');
            text = text.replace(/\[群聊\|群名\|群号\|成员列表\]/g, '');
            text = text.replace(/\[创建群聊\|群号\|群名\|成员列表\]/g, '');

            // 如果清理后的消息为空，跳过
            if (!text.trim()) return;

            // 如果消息包含群聊相关内容，记录日志
            // if (text.includes('[群聊') || text.includes('[创建群聊')) {
            // }

            // 1. 提取群聊定义格式: [群聊|群名|群号|成员]
            let match;
            groupPattern.lastIndex = 0; //  重置正则索引
            while ((match = groupPattern.exec(text)) !== null) {
                const groupName = match[1];
                const groupId = match[2];
                const groupMembers = match[3];
                const groupKey = `group_${groupId}`; // 使用群ID作为唯一标识

                if (!groupsMap.has(groupKey)) {
                    groupsMap.set(groupKey, {
                        name: groupName,
                        id: groupId,
                        isGroup: true,
                        members: groupMembers,
                        memberCount: groupMembers.split(/[、,，]/).filter(m => m.trim()).length,
                        messageIndex: index,
                        lastMessage: '',
                        time: msg.send_date || Date.now()
                    });
                }
            }

            // 2. 提取创建群聊格式: [创建群聊|群号|群名|成员]
            createGroupPattern.lastIndex = 0;
            while ((match = createGroupPattern.exec(text)) !== null) {
                const groupId = match[1];
                const groupName = match[2];
                const groupMembers = match[3];
                const groupKey = `group_${groupId}`;

                if (!groupsMap.has(groupKey)) {
                    groupsMap.set(groupKey, {
                        name: groupName,
                        id: groupId,
                        isGroup: true,
                        members: groupMembers,
                        memberCount: groupMembers.split(/[、,，]/).filter(m => m.trim()).length,
                        messageIndex: index,
                        lastMessage: '',
                        time: msg.send_date || Date.now()
                    });
                }
            }

            // 3. 从群聊消息中提取: [群聊消息|群ID|发送者|类型|内容]
            groupMessagePattern.lastIndex = 0;
            while ((match = groupMessagePattern.exec(text)) !== null) {
                const groupId = match[1];
                const senderName = match[2];
                const messageType = match[3];
                const messageContent = match[4];
                const groupKey = `group_${groupId}`;

                if (!groupsMap.has(groupKey)) {
                    // 如果群聊不存在，创建一个基于消息的群聊记录
                    groupsMap.set(groupKey, {
                        name: `群聊${groupId}`,
                        id: groupId,
                        isGroup: true,
                        members: senderName,
                        memberCount: 1,
                        messageIndex: index,
                        lastMessage: messageContent.substring(0, 20),
                        time: msg.send_date || Date.now()
                    });
                } else {
                    // 如果已存在，更新成员列表和最新消息索引
                    const existingGroup = groupsMap.get(groupKey);
                    if (existingGroup.members && !existingGroup.members.includes(senderName)) {
                        existingGroup.members += `、${senderName}`;
                        existingGroup.memberCount = existingGroup.members.split(/[、,，]/).filter(m => m.trim()).length;
                    }
                    if (existingGroup.messageIndex < index) {
                        existingGroup.messageIndex = index;
                        existingGroup.lastMessage = messageContent.substring(0, 20);
                        existingGroup.time = msg.send_date || Date.now();
                    }
                }
            }

            // 4. 从我方群聊消息中提取: [我方群聊消息|我|群ID|类型|内容]
            myGroupMessagePattern.lastIndex = 0;
            while ((match = myGroupMessagePattern.exec(text)) !== null) {
                const groupId = match[1];
                const messageType = match[2];
                const messageContent = match[3];
                const groupKey = `group_${groupId}`;

                if (!groupsMap.has(groupKey)) {
                    // 如果群聊不存在，创建一个基于消息的群聊记录
                    groupsMap.set(groupKey, {
                        name: `群聊${groupId}`,
                        id: groupId,
                        isGroup: true,
                        members: '我',
                        memberCount: 1,
                        messageIndex: index,
                        lastMessage: messageContent.substring(0, 20),
                        time: msg.send_date || Date.now()
                    });
                } else {
                    // 如果已存在，更新最新消息索引
                    const existingGroup = groupsMap.get(groupKey);
                    if (!existingGroup.members.includes('我')) {
                        existingGroup.members += '、我';
                        existingGroup.memberCount = existingGroup.members.split(/[、,，]/).filter(m => m.trim()).length;
                    }
                    if (existingGroup.messageIndex < index) {
                        existingGroup.messageIndex = index;
                        existingGroup.lastMessage = messageContent.substring(0, 20);
                        existingGroup.time = msg.send_date || Date.now();
                    }
                }
            }
        });

        if (groupsMap.size > 0) {
            groupsMap.forEach((group, key) => {
            });
        } else {
        }
    } catch (error) {
    }

    return groupsMap;
}

// ==================== 面板内容生成函数 ====================
function generateMessagesPanel(data) {
    const relationshipSource = getRelationshipDataSource(data) || {};
    let html = '';

    //  添加创建群聊按钮（使用 class 而不是 onclick，通过事件委托绑定）
    html += `
        <div class="create-group-button" style="padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin-bottom: 12px; border-radius: 8px; cursor: pointer;">
            <div style="display: flex; align-items: center; justify-content: center; color: white;">
                <span style="font-size: 20px; margin-right: 8px;"></span>
                <span style="font-size: 14px; font-weight: 600;">创建群聊</span>
            </div>
        </div>
    `;

    // 提取群聊信息
    const groups = extractGroupsFromChat();

    // 提取好友信息（优先从MVU变量，如果没有则从聊天记录提取）
    const friends = getRelationshipKeys(relationshipSource);

    // 如果MVU中没有好友，尝试从聊天记录中提取
    const chatFriends = extractFriendsFromChat();

    // 用于跟踪已添加的联系人（防止重复）
    const addedContactIds = new Set();
    const addedContactNames = new Set();

    // 渲染MVU好友
    friends.forEach(studentKey => {
        const friend = relationshipSource[studentKey];
        const affection = friend.好感度 ?? 0;
        const displayName = restoreEraText(studentKey);

        // 添加到已渲染集合
        addedContactIds.add(studentKey);
        if (displayName) {
            addedContactNames.add(displayName);
        }

        html += `
            <div class="list-item contact-item" data-type="friend" data-id="${escapeHtml(studentKey)}" data-name="${escapeHtml(displayName)}" style="cursor: pointer;">
                <div class="list-item-header">
                    <span class="list-item-name">👤 ${escapeHtml(displayName)}</span>
                    <span class="list-item-value">❤ ${affection}</span>
                </div>
            </div>
        `;
    });

    // 渲染从聊天记录提取的好友（不在MVU中的）
    chatFriends.forEach(friend => {
        const normalizedName = restoreEraText(friend.name || '');
        // 使用更精确的去重逻辑：检查ID和名字是否都不在已添加列表中
        if (!addedContactIds.has(friend.id) && !addedContactNames.has(normalizedName)) {

            addedContactIds.add(friend.id);
            if (normalizedName) {
                addedContactNames.add(normalizedName);
            }

            html += `
                <div class="list-item contact-item" data-type="friend" data-id="${escapeHtml(friend.id)}" data-name="${escapeHtml(normalizedName)}" style="cursor: pointer;">
                    <div class="list-item-header">
                        <span class="list-item-name">👤 ${escapeHtml(normalizedName)}</span>
                        <span class="list-item-value" style="font-size: 11px; color: #9ca3af;">ID: ${escapeHtml(friend.id)}</span>
                    </div>
                    <div class="list-item-desc">
                        来自聊天记录
                    </div>
                </div>
            `;
        } else {
        }
    });

    // 渲染群聊
    if (groups.size > 0) {
        html += '<div style="margin: 16px 5px 8px; font-size: 12px; font-weight: 600; color: #6b7280;">群聊</div>';
        groups.forEach(group => {
            // 检查群聊是否已添加
            if (!addedContactIds.has(group.id)) {
                addedContactIds.add(group.id);

                html += `
                <div class="list-item contact-item" data-type="group" data-id="${escapeHtml(group.id)}" data-name="${escapeHtml(group.name)}" data-members="${escapeHtml(group.members)}" style="cursor: pointer;">
                        <div class="list-item-header">
                            <span class="list-item-name">👥 ${group.name}</span>
                            <span class="list-item-value" style="font-size: 11px; color: #9ca3af;">${group.memberCount}人</span>
                        </div>
                        <div class="list-item-desc">
                            ${group.members}
                        </div>
                    </div>
                `;
            } else {
            }
        });
    }

    return html;
}


// ==================== CG收集系统 ====================

// SFW场景类型集合（用于判断图片路径）
const SFW_SCENES = new Set(["不爽", "得意", "害羞", "开心", "哭泣", "生气", "通用", "战斗"]);

// 五人共用的场景数据（NSFW + SFW）
const SHARED_CG_SCENES = {
    // SFW
    "不爽": 3, "得意": 3, "害羞": 3, "开心": 3, "哭泣": 3, "生气": 3, "通用": 3, "战斗": 3,
    // NSFW
    "亲吻": 5, "传教士体位做爱": 4, "掰开小穴": 2, "抱起来做爱": 3, "抱腿站着后入": 2,
    "抱着摸小穴": 2, "抱着躺床上": 2, "背后坐位做爱": 3, "打屁股后入": 2, "高抬腿站着后入": 2,
    "激烈站着后入": 4, "激烈做爱": 4, "即将插入肉棒": 3, "口交": 3, "口交颜射": 2,
    "摸胸": 4, "内射事后": 3, "女上位手淫": 2, "女上位做爱": 4, "趴床上后入": 2,
    "趴在床上": 3, "趴着口交": 2, "乳交": 2, "射外面事后": 2, "事后口交": 3,
    "吮吸乳头": 2, "素股": 2, "躺着抬腿做爱": 3, "舔小穴": 2, "脱衣服": 4,
    "一起洗澡": 2, "站着后入": 2, "站着足交": 2, "指交": 3, "抓屁股做爱": 2,
    "抓着脚足交": 2, "自己掰开小穴": 2, "自慰": 2, "坐着足交": 2, "做爱高潮": 5, "做爱射精": 4
};

// CG列表数据
const CG_LIST = {
    "奈雅丽": { ...SHARED_CG_SCENES },
    "星极": { ...SHARED_CG_SCENES },
    "法露特": { ...SHARED_CG_SCENES },
    "亚丝娜": { ...SHARED_CG_SCENES },
    "露露卡": { ...SHARED_CG_SCENES },
    "红莲": { ...SHARED_CG_SCENES },
    "奥契丝": { ...SHARED_CG_SCENES },
    "吉普莉尔": { ...SHARED_CG_SCENES },
    "艾克莉西娅": { ...SHARED_CG_SCENES },
    "白": { ...SHARED_CG_SCENES }
};

// CG图片基础URL
const CG_BASE_URL = "https://gitgud.io/Rown/dnf/-/raw/master/";

/**
 * 获取已解锁的CG数据
 * @param {boolean} includeVirtual - 是否包含虚拟解锁（一键解锁）的数据
 */
function getUnlockedCG(includeVirtual = false) {
    try {
        const realData = JSON.parse(localStorage.getItem('unlocked_cg') || '{}');

        if (!includeVirtual) {
            return realData;
        }

        // 合并虚拟数据
        const virtualData = JSON.parse(localStorage.getItem('unlocked_cg_virtual') || '{}');
        const mergedData = JSON.parse(JSON.stringify(realData)); // 深拷贝

        for (const [char, scenes] of Object.entries(virtualData)) {
            if (!mergedData[char]) mergedData[char] = {};
            for (const [scene, count] of Object.entries(scenes)) {
                // 如果真实数据里没有，就用虚拟数据
                if (!mergedData[char][scene]) {
                    mergedData[char][scene] = count;
                }
            }
        }
        return mergedData;
    } catch (e) {
        console.error('读取CG数据失败:', e);
        return {};
    }
}

/**
 * 保存已解锁的CG数据
 * @param {Object} data - 要保存的CG数据
 * @param {boolean} isVirtual - 是否保存为虚拟解锁数据
 */
function saveUnlockedCG(data, isVirtual = false) {
    try {
        const key = isVirtual ? 'unlocked_cg_virtual' : 'unlocked_cg';
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('保存CG数据失败:', e);
    }
}

/**
 * 解锁CG（供外部调用）
 * @param {string} characterName - 角色名称
 * @param {string} sceneType - 场景类型
 * @param {number} maxCount - 该场景的最大CG数量
 */
function unlockCG(characterName, sceneType, maxCount) {
    const unlocked = getUnlockedCG();
    if (!unlocked[characterName]) {
        unlocked[characterName] = {};
    }
    if (!(sceneType in unlocked[characterName])) {
        // 如果没传maxCount，从CG_LIST获取
        const count = maxCount || CG_LIST[characterName]?.[sceneType] || 1;
        unlocked[characterName][sceneType] = count;
        saveUnlockedCG(unlocked);
    }
}

/**
 * 一键解锁角色的所有CG
 * @param {string} characterName - 角色名称
 * @param {boolean} isVirtual - 是否是虚拟解锁（仅查看，不计入真实收集）
 * @returns {number} - 解锁的CG数量
 */
function unlockAllCGForCharacter(characterName, isVirtual = false) {
    if (!CG_LIST[characterName]) return 0;

    // 根据模式读取对应的数据源
    let currentData;
    try {
        const key = isVirtual ? 'unlocked_cg_virtual' : 'unlocked_cg';
        currentData = JSON.parse(localStorage.getItem(key) || '{}');
    } catch (e) {
        currentData = {};
    }

    if (!currentData[characterName]) {
        currentData[characterName] = {};
    }

    let unlockedCount = 0;
    const scenes = CG_LIST[characterName];

    // 如果是虚拟解锁，还需要检查真实解锁数据，避免覆盖真实进度（虽然逻辑上虚拟集合包含真实集合，但保存时分开）
    // 不过简单起见，虚拟解锁库只记录“通过一键解锁获得的权限”，读取时合并即可

    for (const [sceneType, maxCount] of Object.entries(scenes)) {
        if (!(sceneType in currentData[characterName])) {
            currentData[characterName][sceneType] = maxCount;
            unlockedCount++;
        }
    }

    if (unlockedCount > 0) {
        saveUnlockedCG(currentData, isVirtual);
    }

    return unlockedCount;
}

/**
 * 获取角色的好感度（从好友列表数据中）
 * @param {string} characterName - 角色名称
 * @returns {number} - 好感度值，如果找不到返回0
 */
function getCharacterAffection(characterName) {
    const contactSource = getRelationshipDataSource();
    if (!contactSource) return 0;

    // 尝试直接匹配角色名
    if (contactSource[characterName]) {
        return contactSource[characterName]?.好感度 ?? 0;
    }

    // 尝试模糊匹配（角色名可能是部分匹配）
    for (const [key, contact] of Object.entries(contactSource)) {
        if (key.includes(characterName) || characterName.includes(key)) {
            return contact?.好感度 ?? 0;
        }
    }

    return 0;
}

/**
 * 计算CG收藏进度统计
 * @returns {Object} - 包含总进度和各角色进度的对象
 */
function getCGCollectionStats() {
    const unlocked = getUnlockedCG();
    const stats = {
        total: { unlocked: 0, total: 0, percentage: 0 },
        characters: {}
    };

    for (const [charName, scenes] of Object.entries(CG_LIST)) {
        const totalScenes = Object.keys(scenes).length;
        const unlockedScenes = unlocked[charName] ? Object.keys(unlocked[charName]).length : 0;
        const percentage = totalScenes > 0 ? Math.round((unlockedScenes / totalScenes) * 100) : 0;

        stats.characters[charName] = {
            unlocked: unlockedScenes,
            total: totalScenes,
            percentage: percentage
        };

        stats.total.unlocked += unlockedScenes;
        stats.total.total += totalScenes;
    }

    stats.total.percentage = stats.total.total > 0
        ? Math.round((stats.total.unlocked / stats.total.total) * 100)
        : 0;

    return stats;
}

// CG面板当前模式：'unlock'（一键解锁模式）或 'progress'（收藏进度模式）
let cgPanelMode = 'progress';

/**
 * 切换CG面板模式
 */
function toggleCGPanelMode() {
    cgPanelMode = cgPanelMode === 'progress' ? 'unlock' : 'progress';
    // 重新渲染CG面板
    if (currentPanel === 'gallery') {
        const content = generateGalleryPanel(currentPhoneData);
        $('#phone-app-body').html(content);
        // 重新绑定事件需要在openAppPanel中处理
        bindCGGalleryEvents();
    }
}

/**
 * 绑定CG画廊事件（抽取出来方便重用）
 */
function bindCGGalleryEvents() {
    const $appBody = $('#phone-app-body');
    if ($appBody.length === 0) return;

    // 重置滚动位置到顶部，确保用户能看到模式切换按钮
    // $appBody.scrollTop(0); // 用户要求移除强制置顶

    $appBody.off('click.cggallery');

    // 模式切换按钮
    $appBody.on('click.cggallery', '.cg-mode-segment', function (e) {
        e.stopPropagation();
        const mode = $(this).data('mode');
        if (mode !== cgPanelMode) {
            toggleCGPanelMode();
        }
    });

    // 展开/收起详情列表
    $appBody.on('click.cggallery', '.cg-toggle-details-btn', function (e) {
        e.stopPropagation();
        const $btn = $(this);
        const $list = $btn.next('.cg-details-list');
        const $icon = $btn.find('.fa-chevron-down');

        $list.slideToggle(200, function () {
            if ($list.is(':visible')) {
                $icon.css('transform', 'rotate(180deg)');
            } else {
                $icon.css('transform', 'rotate(0deg)');
            }
        });
        $btn.toggleClass('active');
    });

    // 一键解锁按钮
    $appBody.on('click.cggallery', '.cg-unlock-btn', function (e) {
        e.stopPropagation();
        const char = $(this).data('character');
        const affection = getCharacterAffection(char);

        if (affection < 100) {
            if (typeof toastr !== 'undefined') {
                toastr.warning(`${char} 的好感度不足100，无法一键解锁！`);
            } else {
                alert(`${char} 的好感度不足100，无法一键解锁！`);
            }
            return;
        }

        // 关键修改：传入 true 表示虚拟解锁，不记录入真实存档
        const unlockedCount = unlockAllCGForCharacter(char, true);

        if (typeof toastr !== 'undefined') {
            toastr.success(`已开启 ${char} 的预览权限`);
        }

        // 刷新面板
        const content = generateGalleryPanel(currentPhoneData);
        $('#phone-app-body').html(content);
        bindCGGalleryEvents();

        // 保持展开状态
        if (cgPanelMode === 'unlock') {
            $('.cg-details-list').show();
            $('.cg-toggle-details-btn').find('.fa-chevron-down').css('transform', 'rotate(180deg)');
            $('.cg-toggle-details-btn').addClass('active');
        }
    });

    // 角色tab切换
    $appBody.on('click.cggallery', '.cg-tab', function (e) {
        e.stopPropagation();
        const char = $(this).data('character');

        // 更新tab样式（新的胶囊风格）
        $appBody.find('.cg-tab').removeClass('active').css({
            background: 'transparent',
            color: '#64748b',
            boxShadow: 'none',
            fontWeight: '600'
        });
        $(this).addClass('active').css({
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.35)',
            fontWeight: '700'
        });

        // 切换显示的角色网格
        $appBody.find('.cg-character-grid').hide();
        $appBody.find(`.cg-character-grid[data-character="${char}"]`).show();
    });

    // 已解锁CG点击切换图片编号
    $appBody.on('click.cggallery', '.cg-item.unlocked .cg-switch-btn', function (e) {
        e.stopPropagation();
        const $item = $(this).closest('.cg-item');
        const char = $item.data('character');
        const scene = $item.data('scene');
        const max = parseInt($item.data('max'));
        let current = parseInt($item.data('current'));

        current = current >= max ? 1 : current + 1;
        $item.data('current', current);

        const newUrl = getCGImageUrl(char, scene, current);
        $item.find('img').attr('src', newUrl).show();
        $item.find('img').next().hide();

        $(this).text(`${current}/${max}`);
    });

    // 点击已解锁CG查看大图
    $appBody.on('click.cggallery', '.cg-item.unlocked', function (e) {
        if ($(e.target).closest('.cg-switch-btn').length) return;

        const char = $(this).data('character');
        const scene = $(this).data('scene');
        const current = parseInt($(this).data('current')) || 1;
        const imgUrl = getCGImageUrl(char, scene, current);

        showCGFullscreen(imgUrl, char, scene, current);
    });
}

/**
 * 生成CG图片URL
 */
function getCGImageUrl(characterName, sceneType, index = 1) {
    const folder = SFW_SCENES.has(sceneType) ? 'SFW' : 'NSFW';
    const path = `${folder}/${characterName}/${sceneType}${index}.webp`;
    return CG_BASE_URL + encodeURIComponent(path).replace(/%2F/g, '/');
}

/**
 * 生成CG收集面板
 */
function generateGalleryPanel(data) {
    // 关键改变：
    // stats 永远基于真实解锁数据计算 (getCGCollectionStats内部使用默认getUnlockedCG())
    const stats = getCGCollectionStats();

    // 图片显示的解锁状态：如果是unlock模式，读取包含虚拟解锁的数据
    const displayUnlockedCG = getUnlockedCG(cgPanelMode === 'unlock');

    const characters = Object.keys(CG_LIST);
    const isProgressMode = cgPanelMode === 'progress';

    // 背景微调：使用极淡的冷色调背景，增加通透感
    let html = `<div class="cg-gallery-container" style="padding: 16px 16px 80px 16px; background: #f8fafc; min-height: 100%;">`;

    // ==================== 顶部 Tab Switch (iOS Style) ====================
    html += `
        <div style="
            background: #e2e8f0; 
            border-radius: 10px; 
            padding: 3px; 
            display: flex; 
            margin-bottom: 20px;
            position: relative;
        ">
            <div data-mode="progress" class="cg-mode-segment" style="
                flex: 1; text-align: center; padding: 10px 0; font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 8px; z-index: 1; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                ${isProgressMode ? 'background: #fff; color: #0f172a; box-shadow: 0 2px 4px rgba(0,0,0,0.06); transform: scale(1);' : 'color: #64748b; transform: scale(0.98);'}
            ">收藏进度</div>
            <div data-mode="unlock" class="cg-mode-segment" style="
                flex: 1; text-align: center; padding: 10px 0; font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 8px; z-index: 1; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                ${!isProgressMode ? 'background: #fff; color: #0f172a; box-shadow: 0 2px 4px rgba(0,0,0,0.06); transform: scale(1);' : 'color: #64748b; transform: scale(0.98);'}
            ">一键解锁</div>
        </div>
    `;

    // ==================== 收藏进度模式 ====================
    if (isProgressMode) {
        // 总览卡片 (Modern Gradient Touch)
        html += `
            <div class="cg-toggle-details-btn" style="
                background: white; border-radius: 16px; padding: 22px; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f1f5f9;
                margin-bottom: 20px; cursor: pointer; position: relative; overflow: hidden;
            ">
                <!-- 装饰性背景光晕 -->
                <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%); border-radius: 50%;"></div>
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 14px; position: relative; z-index: 2;">
                    <div>
                        <div style="font-size: 13px; color: #64748b; margin-bottom: 6px; font-weight: 500;">当前收集总览</div>
                        <div style="font-size: 32px; font-weight: 800; color: #0f172a; line-height: 1; letter-spacing: -0.5px;">${stats.total.percentage}<span style="font-size: 16px; color: #94a3b8; font-weight: 600; margin-left: 2px;">%</span></div>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 12px; color: #94a3b8; font-weight: 500;">详情</span>
                        <i class="fas fa-chevron-down" style="font-size: 12px; color: #94a3b8; margin-left: 6px; transition: transform 0.3s;"></i>
                    </div>
                </div>
                <div style="background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 10px;">
                    <div style="background: linear-gradient(90deg, #3b82f6, #60a5fa); width: ${stats.total.percentage}%; height: 100%; border-radius: 4px; box-shadow: 0 1px 2px rgba(59, 130, 246, 0.2);"></div>
                </div>
                <div style="font-size: 12px; color: #64748b; font-weight: 500; display: flex; justify-content: space-between;">
                    <span>已解锁场景</span>
                    <span style="color: #0f172a; font-weight: 700;">${stats.total.unlocked} <span style="color: #cbd5e1; font-weight: 400;">/</span> ${stats.total.total}</span>
                </div>
            </div>
        `;

        // 详情列表 (More Vivid)
        html += `<div class="cg-details-list" style="display: none; margin-bottom: 24px; background: white; border-radius: 16px; padding: 8px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);">`;
        characters.forEach(char => {
            const charStats = stats.characters[char];
            const affection = getCharacterAffection(char);
            html += `
                <div style="
                    display: flex; align-items: center; padding: 14px 16px; 
                    border-bottom: 1px solid #f8fafc;
                ">
                    <div style="width: 85px; font-weight: 700; color: #334155; font-size: 14px;">
                        ${escapeHtml(char)}
                        <div style="font-size: 11px; color: #94a3b8; font-weight: 500; margin-top: 2px;">${charStats.unlocked}/${charStats.total}</div>
                    </div>
                    <div style="flex: 1; padding: 0 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <!-- 红色爱心 -->
                            <span style="font-size: 12px; color: #f43f5e; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                                <i class="fas fa-heart"></i> ${affection}
                            </span>
                            <span style="font-size: 12px; color: #64748b; font-weight: 600;">${charStats.percentage}%</span>
                        </div>
                        <div style="background: #f1f5f9; height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: ${charStats.percentage === 100 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #3b82f6, #60a5fa)'}; width: ${charStats.percentage}%; height: 100%;"></div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }

    // ==================== 一键解锁模式 ====================
    if (!isProgressMode) {
        // 提示卡片
        html += `
            <div class="cg-toggle-details-btn" style="
                background: white; border-radius: 16px; padding: 18px; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f1f5f9;
                margin-bottom: 20px; cursor: pointer; display: flex; align-items: center; justify-content: space-between;
            ">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="width: 36px; height: 36px; border-radius: 10px; background: #fff7ed; display: flex; align-items: center; justify-content: center; color: #f97316; box-shadow: 0 2px 5px rgba(249, 115, 22, 0.1);">
                        <i class="fas fa-unlock-alt" style="font-size: 16px;"></i>
                    </div>
                    <div>
                        <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 2px;">开启CG预览权限</div>
                        <div style="font-size: 11px; color: #94a3b8;">需好感度 ≥ 100，不影响真实收集度</div>
                    </div>
                </div>
                <i class="fas fa-chevron-down" style="font-size: 12px; color: #cbd5e1; transition: transform 0.3s;"></i>
            </div>
        `;

        // 解锁列表
        html += `<div class="cg-details-list" style="display: none; margin-bottom: 24px; background: white; border-radius: 16px; padding: 8px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);">`;
        characters.forEach(char => {
            const charStats = stats.characters[char]; // 修复：定义 charStats
            const affection = getCharacterAffection(char);
            const canUnlock = affection >= 100;

            const charUnlockedMap = displayUnlockedCG[char] || {};
            const totalScenes = Object.keys(CG_LIST[char]).length;
            const currentUnlockedCount = Object.keys(charUnlockedMap).length;
            const isUnlockedModeActive = currentUnlockedCount >= totalScenes;

            let btnState = '';
            if (isUnlockedModeActive) {
                btnState = `<span style="color: #10b981; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px;"><i class="fas fa-check-circle"></i> 已开启</span>`;
            } else if (canUnlock) {
                btnState = `
                    <button class="cg-unlock-btn" data-character="${escapeHtml(char)}" style="
                        background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
                        color: white; border: none; padding: 6px 14px; 
                        border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;
                        box-shadow: 0 2px 6px rgba(234, 88, 12, 0.25); transition: transform 0.1s;
                    ">开启</button>
                `;
            } else {
                btnState = `<span style="color: #cbd5e1; font-size: 12px; font-weight: 500;">好感不足</span>`;
            }

            html += `
                <div style="
                    display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; 
                    border-bottom: 1px solid #f8fafc;
                ">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div>
                            <span style="font-weight: 700; color: #334155; font-size: 14px; display: block;">${escapeHtml(char)}</span>
                            <span style="font-size: 11px; color: #94a3b8; font-weight: 500;">真实进度: ${charStats.unlocked}/${charStats.total}</span>
                        </div>
                        <span style="
                            font-size: 11px; 
                            color: ${affection >= 100 ? '#f43f5e' : '#94a3b8'}; 
                            background: ${affection >= 100 ? '#fff1f2' : '#f1f5f9'}; 
                            padding: 3px 8px; border-radius: 12px; font-weight: 600;
                            height: fit-content;
                        ">
                            ❤ ${affection}
                        </span>
                    </div>
                    <div>${btnState}</div>
                </div>
            `;
        });
        html += `</div>`;
    }


    // ==================== 图片网格区域 ====================
    html += `<div style="margin-top: 12px;">`;
    // 角色 Tab (恢复滚动条并美化)
    // 移除 scrollbar-width: none, 添加自定义滚动条样式的类和style
    const scrollbarStyle = `
        <style>
            .cg-character-tabs::-webkit-scrollbar {
                height: 4px; /* 增加高度以便更容易点击 */
            }
            .cg-character-tabs::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 2px;
            }
            .cg-character-tabs::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 2px;
            }
            .cg-character-tabs::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
            }
        </style>
    `;
    html += scrollbarStyle;
    html += `<div class="cg-character-tabs" style="display: flex; overflow-x: auto; margin-bottom: 16px; gap: 12px; padding-bottom: 8px; padding-left: 4px; padding-right: 4px;">`;
    characters.forEach((char, idx) => {
        const isActive = idx === 0;
        html += `
            <div class="cg-tab ${isActive ? 'active' : ''}" data-character="${escapeHtml(char)}" style="
                padding: 8px 16px; font-size: 13px; font-weight: ${isActive ? '700' : '600'}; cursor: pointer; white-space: nowrap; flex-shrink: 0;
                color: ${isActive ? '#fff' : '#64748b'};
                background: ${isActive ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'transparent'};
                border-radius: 20px;
                box-shadow: ${isActive ? '0 2px 8px rgba(59, 130, 246, 0.35)' : 'none'};
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            ">${escapeHtml(char)}</div>
        `;
    });
    html += `</div>`;

    // 网格
    characters.forEach((char, idx) => {
        const isActive = idx === 0 ? '' : 'display: none;';
        const scenes = CG_LIST[char];
        const charUnlocked = displayUnlockedCG[char] || {};

        html += `<div class="cg-character-grid" data-character="${escapeHtml(char)}" style="${isActive}">`;
        html += `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">`;

        Object.entries(scenes).forEach(([sceneType, maxCount]) => {
            const isUnlocked = sceneType in charUnlocked;

            if (isUnlocked) {
                const imgUrl = getCGImageUrl(char, sceneType, 1);
                html += `
                    <div class="cg-item unlocked" data-character="${escapeHtml(char)}" data-scene="${escapeHtml(sceneType)}" data-max="${maxCount}" data-current="1"
                        style="
                            aspect-ratio: 3/4; border-radius: 8px; overflow: hidden; position: relative; cursor: pointer; 
                            background: #e2e8f0; box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                        ">
                        <img src="${imgUrl}" alt="${escapeHtml(sceneType)}" 
                            style="width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s;" 
                            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div style="display: none; position: absolute; inset: 0; align-items: center; justify-content: center; color: #94a3b8; font-size: 10px;">加载失败</div>
                        ${maxCount > 1 ? `
                            <div class="cg-switch-btn" style="
                                position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px);
                                color: white; font-size: 9px; padding: 2px 8px; border-radius: 12px; font-weight: 600;
                            ">1/${maxCount}</div>
                        ` : ''}
                        <div style="
                            position: absolute; bottom: 0; left: 0; right: 0; 
                            background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
                            color: white; font-size: 11px; padding: 16px 8px 6px 8px; font-weight: 500;
                            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                        ">${escapeHtml(sceneType)}</div>
                    </div>
                `;
            } else {
                html += `
                    <div class="cg-item locked" style="
                        aspect-ratio: 3/4; border-radius: 8px; background: #f8fafc; 
                        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
                        border: 1px dashed #cbd5e1; color: #cbd5e1;
                    ">
                        <i class="fas fa-lock" style="font-size: 18px;"></i>
                        <span style="font-size: 10px; font-weight: 500;">locked</span>
                    </div>
                `;
            }
        });

        html += `</div></div>`;
    });
    html += `</div>`; // End Grid Container

    html += `</div>`; // End of Main Container
    return html;
}

function renderFriendListItem(contactKey, contact) {
    /* 适配变量脚本的羁绊列表结构 */
    const displayName = escapeHtml(contactKey);
    const isNearby = contact.附近 === true;
    const affection = contact.好感度 ?? 0;
    const gender = contact.性别 || '';
    const race = contact.种族 || '';
    const level = contact.等级 ?? 1;
    const isTraveling = contact.同行誓约 === true;

    /* 好感度颜色 */
    const affectionColor = affection >= 50 ? '#ec4899' : affection >= 0 ? '#f59e0b' : '#6b7280';

    /* 简要信息标签 */
    const infoChips = [gender, race, `Lv.${level}`].filter(Boolean);
    const chipsHtml = infoChips.length > 0
        ? `<div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">${infoChips.map(v => escapeHtml(v)).join(' · ')}</div>`
        : '';

    return `
        <div class="list-item friend-item"
             style="cursor: pointer; transition: background-color 0.2s; border: 1px solid rgba(0,0,0,0.06); border-radius: 12px; padding: 14px; margin-bottom: 10px;"
             data-friend-name="${escapeHtml(contactKey)}">
            <!-- 姓名和标签行 -->
            <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 6px;">
                <span style="font-size: 16px; font-weight: 700; color: #1f2937;">${displayName}</span>
                ${isNearby ? '<span style="font-size: 10px; background: #3b82f6; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: 600;">附近</span>' : ''}
                ${isTraveling ? '<span style="font-size: 10px; background: #8b5cf6; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: 600;">同行</span>' : ''}
            </div>
            
            <!-- 基础信息 -->
            ${chipsHtml}
            
            <!-- 好感度 -->
            <div style="display: flex; gap: 12px; font-size: 13px; margin-bottom: 4px;">
                <span style="color: ${affectionColor}; font-weight: 600;">❤ ${affection}</span>
            </div>
            
            <!-- 当前想法 -->
            ${contact.当前想法 ? `<div style="font-size: 11px; color: #9ca3af; font-style: italic; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">"${escapeHtml(contact.当前想法)}"</div>` : ''}
        </div>
    `;
}

function generateFriendsPanel(data) {
    const contactSource = getRelationshipDataSource(data);

    if (!contactSource) {
        return '<div class="empty-message">暂无羁绊数据</div>';
    }

    const contactEntries = getRelationshipKeys(contactSource)
        .map(key => ({ key, contact: contactSource[key] }))
        .filter(entry => entry.contact && typeof entry.contact === 'object')
        .sort((a, b) => {
            /* 同行誓约的排在前面 */
            const travelA = a.contact?.同行誓约 === true;
            const travelB = b.contact?.同行誓约 === true;
            if (travelA && !travelB) return -1;
            if (!travelA && travelB) return 1;

            /* 附近的排在前面 */
            const nearbyA = a.contact?.附近 === true;
            const nearbyB = b.contact?.附近 === true;
            if (nearbyA && !nearbyB) return -1;
            if (!nearbyA && nearbyB) return 1;

            /* 按好感度排序 */
            const affectionA = a.contact?.好感度 ?? 0;
            const affectionB = b.contact?.好感度 ?? 0;
            return affectionB - affectionA;
        });

    if (contactEntries.length === 0) {
        return '<div class="empty-message">暂无羁绊数据</div>';
    }

    /* 直接渲染联系人列表 */
    const friendItems = contactEntries.map(({ key, contact }) => renderFriendListItem(key, contact)).join('');

    return `
        <div class="friend-list-container">
            <div class="friend-list-header" style="font-weight: 600; font-size: 12px; color: #6b7280; margin: 8px 4px 12px;">
                羁绊 (${contactEntries.length})
            </div>
            <div class="friend-list-body">
                ${friendItems}
            </div>
        </div>
    `;
}

/**
 * HTML安全显示文本（避免HTML注入但保留原文）
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 文本还原函数（将特殊编码转换回正常字符）
 * 用于处理变量名中的特殊字符编码
 */
function restoreEraText(text) {
    if (!text) return '';
    // 将 __DOT__ 还原为 . （避免路径解析冲突的编码）
    // 将 __SQUOTE__ 还原为 ' （避免字符串解析冲突的编码）
    return text.replace(/__DOT__/g, '.').replace(/__SQUOTE__/g, "'");
}

/**
 * 显示好友详情
 * @param {string} friendName - 好友名称
 * @param {object} friendData - 好友数据
 * @param {boolean} isRestoring - 是否是恢复状态（不重置滚动位置）
 */
function showFriendDetail(friendName, friendData, isRestoring = false) {

    //  只有在非恢复模式下才重置详情页滚动位置
    if (!isRestoring) {
        friendDetailScrollPosition = 0;
    } else {
    }

    //  保存好友列表的滚动位置（多种方式尝试，确保iframe兼容）
    let appBodyElement = document.getElementById('phone-app-body');

    // 如果原生方式找不到，尝试使用 jQuery
    if (!appBodyElement) {
        const $appBody = $('#phone-app-body');
        if ($appBody.length > 0) {
            appBodyElement = $appBody[0];
        }
    }

    if (appBodyElement) {
        // 使用原生属性获取滚动位置
        friendsListScrollPosition = appBodyElement.scrollTop;

        //  新增：查找当前点击的好友元素位置
        const $friendItem = $(`.friend-item[data-friend-name="${friendName}"]`);
        if ($friendItem.length > 0) {
            const friendItemTop = $friendItem.position().top + appBodyElement.scrollTop;

            // 保存额外信息用于精确定位
            friendsListScrollPosition = Math.max(friendsListScrollPosition, friendItemTop);
        } else {
        }
    } else {
        friendsListScrollPosition = 0;
    }

    //  记录当前查看的好友
    lastViewedFriend = friendName;

    // 保存当前页面到导航栈
    const currentTitle = $('#phone-app-title').text();
    const currentContent = $('#phone-app-body').html();
    navigationStack.push({
        title: currentTitle,
        content: currentContent,
        scrollPosition: friendsListScrollPosition //  同时保存到导航栈中
    });

    /* 适配变量脚本的羁绊列表结构 */
    const gender = friendData.性别 || '';
    const isNearby = friendData.附近 === true;
    const race = friendData.种族 || '';
    const level = friendData.等级 ?? 1;
    const appearance = friendData.外貌 || '';
    const clothing = friendData.着装 || '';
    const affection = friendData.好感度 ?? 0;
    const isTraveling = friendData.同行誓约 === true;
    const currentThought = friendData.当前想法 || '';

    /* 好感度进度条颜色 */
    const affectionPercent = Math.abs(affection);
    const affectionBarColor = affection >= 50 ? '#ec4899' : affection >= 0 ? '#f59e0b' : '#ef4444';
    const affectionLabel = affection >= 80 ? '挚友' : affection >= 50 ? '亲密' : affection >= 20 ? '友好' : affection >= 0 ? '普通' : affection >= -50 ? '冷淡' : '敌对';

    /* 头像 */
    const avatarUrl = getCharacterAvatar(friendName);
    const avatarHtml = avatarUrl
        ? `<img src="${avatarUrl}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 3px solid #e5e7eb;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
           <div style="display: none; width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); align-items: center; justify-content: center; font-size: 28px; color: #fff; border: 3px solid #e5e7eb;">${escapeHtml(friendName.charAt(0))}</div>`
        : `<div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; border: 3px solid #e5e7eb;">${escapeHtml(friendName.charAt(0))}</div>`;

    let html = `
        <div id="friend-detail-scroll-container" style="padding: 10px; max-height: calc(100vh - 200px); overflow-y: auto;">
            <!-- 角色卡片头部 -->
            <div class="list-item" style="margin-bottom: 12px; text-align: center; padding: 20px 15px;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                    ${avatarHtml}
                    <div>
                        <div style="font-size: 18px; font-weight: 700; color: #1f2937;">${escapeHtml(friendName)}</div>
                        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                            ${[gender, race, `Lv.${level}`].filter(Boolean).map(v => escapeHtml(v)).join(' · ')}
                        </div>
                    </div>
                    <!-- 状态标签 -->
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">
                        ${isNearby ? '<span style="font-size: 11px; background: #dbeafe; color: #2563eb; padding: 3px 10px; border-radius: 12px; font-weight: 600;">📍 附近</span>' : '<span style="font-size: 11px; background: #f3f4f6; color: #9ca3af; padding: 3px 10px; border-radius: 12px;">不在附近</span>'}
                        ${isTraveling ? '<span style="font-size: 11px; background: #ede9fe; color: #7c3aed; padding: 3px 10px; border-radius: 12px; font-weight: 600;">⚔ 同行誓约</span>' : ''}
                    </div>
                </div>
            </div>
            
            <!-- 好感度 -->
            <div class="list-item" style="margin-bottom: 12px;">
                <div class="list-item-header">
                    <span class="list-item-name">💕 好感度</span>
                    <span style="font-size: 13px; font-weight: 600; color: ${affectionBarColor};">${affection} · ${affectionLabel}</span>
                </div>
                <div style="margin-top: 8px;">
                    <div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${affectionPercent}%; height: 100%; background: ${affectionBarColor}; border-radius: 4px; transition: width 0.3s ease;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; margin-top: 4px;">
                        <span>-100</span>
                        <span>0</span>
                        <span>100</span>
                    </div>
                </div>
            </div>
            
            <!-- 外貌 -->
            ${appearance ? `
            <div class="list-item" style="margin-bottom: 12px;">
                <div class="list-item-header">
                    <span class="list-item-name">👤 外貌</span>
                </div>
                <div class="list-item-desc" style="margin-top: 6px;">
                    <div style="font-size: 12px; line-height: 1.6; color: #4b5563;">${escapeHtml(appearance)}</div>
                </div>
            </div>
            ` : ''}
            
            <!-- 着装 -->
            ${clothing ? `
            <div class="list-item" style="margin-bottom: 12px;">
                <div class="list-item-header">
                    <span class="list-item-name">👗 着装</span>
                </div>
                <div class="list-item-desc" style="margin-top: 6px;">
                    <div style="font-size: 12px; line-height: 1.6; color: #4b5563;">${escapeHtml(clothing)}</div>
                </div>
            </div>
            ` : ''}
            
            <!-- 当前想法 -->
            ${currentThought ? `
            <div class="list-item" style="margin-bottom: 12px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);">
                <div class="list-item-header">
                    <span class="list-item-name">💭 当前想法</span>
                </div>
                <div class="list-item-desc" style="margin-top: 6px;">
                    <div style="font-size: 12px; line-height: 1.6; color: #92400e; font-style: italic;">"${escapeHtml(currentThought)}"</div>
                </div>
            </div>
            ` : ''}
        </div>
    `;

    /* 设置详情面板 */
    $('#phone-app-title').text(`👤 ${escapeHtml(friendName)}`);
    $('#phone-app-body').html(html);

    /* 确保内容可见 */
    if (!isRestoring) {
        $('#phone-app-body').css('opacity', '1');
    }

    /* 添加滚动监听器 */
    setTimeout(() => {
        let scrollContainer = document.getElementById('friend-detail-scroll-container');

        if (!scrollContainer) {
            const $scrollContainer = $('#friend-detail-scroll-container');
            if ($scrollContainer.length > 0) {
                scrollContainer = $scrollContainer[0];
            }
        }

        if (scrollContainer) {
            scrollContainer.removeEventListener('scroll', handleDetailScroll);
            scrollContainer.addEventListener('scroll', handleDetailScroll, { passive: true });
        }
    }, 150);
}

//  详情页滚动处理函数
function handleDetailScroll(event) {
    if (event.target) {
        friendDetailScrollPosition = event.target.scrollTop;
        // 使用节流，避免频繁打印日志
        if (!window._detailScrollLogTimer) {
            const elementName = event.target.id || event.target.className || 'unknown';
            window._detailScrollLogTimer = setTimeout(() => {
                window._detailScrollLogTimer = null;
            }, 500); // 减少到500ms，更快响应
        }
    }
}

/**
 * 根据用户名生成一致的随机颜色
 * @param {string} username - 用户名
 * @returns {string} - 渐变色CSS
 */
function getUserAvatarColor(username) {
    if (!username) return 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)';

    // 丰富的颜色方案
    const colorSchemes = [
        // 紫色系
        'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
        'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
        'linear-gradient(135deg, #e879f9 0%, #d946ef 100%)',

        // 蓝色系
        'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',

        // 绿色系
        'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
        'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',

        // 橙色系
        'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
        'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',

        // 红色系
        'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
        'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)',

        // 粉色系
        'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',

        // 青色系
        'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
        'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',

        // 靛蓝色系
        'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',

        // 玫瑰色系
        'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',

        // 琥珀色系
        'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',

        // 石板色系
        'linear-gradient(135deg, #64748b 0%, #475569 100%)',

        // 混合渐变色系
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
        'linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)',
        'linear-gradient(135deg, #26c6da 0%, #00acc1 100%)',
        'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
        'linear-gradient(135deg, #ec407a 0%, #d81b60 100%)'
    ];

    // 简单哈希函数：将用户名转换为一致的索引
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = ((hash << 5) - hash) + username.charCodeAt(i);
        hash = hash & hash; // 转换为32位整数
    }

    // 确保索引为正数
    const index = Math.abs(hash) % colorSchemes.length;
    return colorSchemes[index];
}

/**
 * 生成论坛用户头像HTML
 * @param {string} username - 用户名
 * @param {number} size - 头像尺寸（像素）
 * @param {number} fontSize - 字体大小（像素）
 * @returns {string} - 头像HTML
 */
function getForumAvatarHtml(username, size = 32, fontSize = 12) {
    const avatarUrl = getCharacterAvatar(username);
    if (avatarUrl) {
        return `<img src="${avatarUrl}" style="width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display: none; width: ${size}px; height: ${size}px; border-radius: 50%; background: ${getUserAvatarColor(username)}; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${fontSize}px; flex-shrink: 0;">${escapeHtml(username)[0] || '?'}</div>`;
    }
    return `<div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: ${getUserAvatarColor(username)}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${fontSize}px; flex-shrink: 0;">${escapeHtml(username)[0] || '?'}</div>`;
}

/**
 * 显示论坛帖子详情
 */
function showForumPostDetail(postIndex, postData) {

    // 保存当前页面到导航栈
    const currentTitle = $('#phone-app-title').text();
    const currentContent = $('#phone-app-body').html();
    navigationStack.push({
        title: currentTitle,
        content: currentContent
    });

    // 获取回复列表（从帖子对象的replies数组中）
    const replyPosts = Array.isArray(postData.replies) ? postData.replies : [];
    const replyCount = replyPosts.length;

    // 构建帖子详情HTML
    let html = `
        <div style="padding: 12px;">
            <!-- 帖子主楼 -->
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
                <!-- 作者信息 -->
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
                    ${getForumAvatarHtml(postData.author, 48, 18)}
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 14px; color: #2d3748;">${escapeHtml(postData.author)}</div>
                        <div style="font-size: 12px; color: #a0aec0;">${escapeHtml(postData.time)}</div>
                    </div>
                    <div style="background: #f7fafc; padding: 4px 12px; border-radius: 12px; font-size: 11px; color: #718096;">
                        1楼 (楼主)
                    </div>
                </div>
                
                <!-- 帖子标题 -->
                <h2 style="font-size: 18px; font-weight: 600; color: #2d3748; margin: 0 0 12px 0; line-height: 1.4;">${escapeHtml(postData.title)}</h2>
                
                <!-- 帖子内容 -->
                <div style="font-size: 14px; color: #4a5568; line-height: 1.8; white-space: pre-wrap; margin-bottom: 14px;">${escapeHtml(postData.content)}</div>
                
                <!-- 统计信息 -->
                <div style="display: flex; gap: 20px; padding-top: 12px; border-top: 1px solid #f7fafc; font-size: 13px; color: #718096;">
                    <span style="display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-thumbs-up"></i> 
                        ${postData.likes} 赞
                    </span>
                    <span style="display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-comment"></i> 
                        ${replyCount} 回复
                    </span>
                </div>
            </div>
            
            <!-- 回复区域标题 -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 0 4px;">
                <h3 style="margin: 0; font-size: 14px; color: #4a5568; font-weight: 600;">全部回复</h3>
                <span style="font-size: 12px; color: #a0aec0;">${replyCount} 条</span>
            </div>
    `;

    // 构建回复列表
    if (replyCount > 0) {
        html += `<div style="display: flex; flex-direction: column; gap: 10px;">`;

        replyPosts.forEach((reply) => {
            const floorNumber = reply.floor || 2; // 使用reply中的floor字段，默认从2开始
            html += `
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
                    <!-- 回复作者信息 -->
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        ${getForumAvatarHtml(reply.author, 36, 14)}
                        <div style="flex: 1;">
                            <div style="font-weight: 600; font-size: 13px; color: #2d3748;">${escapeHtml(reply.author)}</div>
                            <div style="font-size: 11px; color: #a0aec0;">${escapeHtml(reply.time)}</div>
                        </div>
                        <div style="background: #f7fafc; padding: 3px 10px; border-radius: 10px; font-size: 11px; color: #718096;">
                            ${floorNumber}楼
                        </div>
                    </div>
                    
                    <!-- 回复内容 -->
                    <div style="font-size: 13px; color: #4a5568; line-height: 1.7; white-space: pre-wrap; margin-bottom: 10px;">${escapeHtml(reply.content)}</div>
                    
                    <!-- 回复统计 -->
                    <div style="display: flex; gap: 16px; padding-top: 8px; border-top: 1px solid #f7fafc; font-size: 12px; color: #718096;">
                        <span style="display: flex; align-items: center; gap: 4px;">
                            <i class="fas fa-thumbs-up" style="font-size: 11px;"></i> 
                            ${reply.likes}
                        </span>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    } else {
        // 空状态
        html += `
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px 20px; text-align: center; color: #a0aec0;">
                <i class="fas fa-comment-dots" style="font-size: 36px; margin-bottom: 12px; opacity: 0.5;"></i>
                <div style="font-size: 13px;">暂无回复</div>
                <div style="font-size: 11px; margin-top: 6px; opacity: 0.7;">来抢沙发吧~</div>
            </div>
        `;
    }

    html += `</div>`; // 关闭主容器

    // 设置详情面板
    $('#phone-app-title').text(' 帖子详情');
    $('#phone-app-body').html(html);
}

// ==================== 独立 API 配置管理器（参考凡人.html变量思考API设置逻辑） ====================
// ==================== 独立 API 配置管理器（参考凡人.html变量思考API设置逻辑） ====================
class PhoneAPIConfig {
    constructor() {
        this.settings = {
            enabled: false,
            apiUrl: '',
            apiKey: '',
            model: '',
            // 自动生成论坛配置
            autoGenerate: {
                enabled: false,        // 是否启用自动生成
                threshold: 10,         // 触发阈值（楼层数）
                showNotification: true // 是否显示弹窗通知
            }
        };
        this.loadSettings();

        // 自动生成状态
        this.autoGenerateState = {
            lastMessageCount: 0,       // 上次记录的消息数量
            isGenerating: false,       // 是否正在生成中
            messagesSinceLastGen: 0    // 自上次生成以来的消息数
        };
    }

    loadSettings() {
        // 从localStorage读取配置（参考凡人.html的loadConfigIntoModal）
        this.settings.enabled = localStorage.getItem('forum_api_enabled_v2') === 'true';
        this.settings.apiUrl = localStorage.getItem('forum_api_url_v2') || '';
        this.settings.apiKey = localStorage.getItem('forum_api_key_v2') || '';
        this.settings.model = localStorage.getItem('forum_api_model_v2') || '';

        // 读取自动生成配置
        const autoGenSaved = localStorage.getItem('forum_auto_generate_v2');
        if (autoGenSaved) {
            try {
                this.settings.autoGenerate = { ...this.settings.autoGenerate, ...JSON.parse(autoGenSaved) };
            } catch (e) {
                console.warn('[论坛API] 读取自动生成配置失败:', e);
            }
        }
    }

    saveSettings() {
        // 保存到localStorage（参考凡人.html的saveThinkingApiConfig）
        localStorage.setItem('forum_api_enabled_v2', this.settings.enabled);
        localStorage.setItem('forum_api_url_v2', this.settings.apiUrl);
        localStorage.setItem('forum_api_key_v2', this.settings.apiKey);
        localStorage.setItem('forum_api_model_v2', this.settings.model);

        // 保存自动生成配置
        localStorage.setItem('forum_auto_generate_v2', JSON.stringify(this.settings.autoGenerate));
    }

    isAvailable() {
        return this.settings.enabled && this.settings.apiUrl && this.settings.apiKey && this.settings.model;
    }

    // 检查是否应该自动生成论坛
    shouldAutoGenerate() {
        const canGenerate = this.isAvailable() &&
            this.settings.autoGenerate.enabled &&
            !this.autoGenerateState.isGenerating;
        console.log('[论坛自动生成] shouldAutoGenerate检查:', {
            isAvailable: this.isAvailable(),
            autoGenerateEnabled: this.settings.autoGenerate.enabled,
            isGenerating: this.autoGenerateState.isGenerating,
            result: canGenerate
        });
        return canGenerate;
    }

    // 重置自动生成计数器
    resetAutoGenerateCounter() {
        this.autoGenerateState.messagesSinceLastGen = 0;
        this.autoGenerateState.lastMessageCount = getCurrentMessageCount();
        console.log('[论坛自动生成] 计数器已重置');
    }

    // 增加消息计数并检查是否需要触发自动生成
    incrementMessageCount() {
        if (!this.shouldAutoGenerate()) return false;

        this.autoGenerateState.messagesSinceLastGen++;

        console.log('[论坛自动生成] 消息计数:', {
            messagesSinceLastGen: this.autoGenerateState.messagesSinceLastGen,
            threshold: this.settings.autoGenerate.threshold,
            shouldTrigger: this.autoGenerateState.messagesSinceLastGen >= this.settings.autoGenerate.threshold
        });

        if (this.autoGenerateState.messagesSinceLastGen >= this.settings.autoGenerate.threshold) {
            return true; // 需要触发自动生成
        }
        return false;
    }

    // ========== API调用方法 ==========
    async callAPI(messages, usePreset = true, chatHistory = '') {
        if (!this.isAvailable()) {
            throw new Error('API配置不完整，请先在设置中填写API URL、API Key和模型');
        }

        const { apiUrl, apiKey, model } = this.settings;
        const targetWindow = window.parent || window;
        const TavernHelper = targetWindow.TavernHelper;

        // 构建最终的messages数组，按预设顺序组织
        let finalMessages = [];

        // 获取世界书内容（如果启用预设）
        let worldInfoBefore = []; // 角色定义之前的世界书条目
        let worldInfoAfter = [];  // 角色定义之后的世界书条目

        if (usePreset && TavernHelper) {
            try {
                // 只获取角色卡绑定的世界书
                const charWorldbooks = typeof TavernHelper.getCharWorldbookNames === 'function'
                    ? TavernHelper.getCharWorldbookNames('current')
                    : { primary: null, additional: [] };

                // 合并角色卡的主世界书和附加世界书
                const worldbookNames = [
                    ...(charWorldbooks.primary ? [charWorldbooks.primary] : []),
                    ...charWorldbooks.additional
                ];

                // 获取每个世界书的内容
                for (const wbName of worldbookNames) {
                    if (typeof TavernHelper.getWorldbook === 'function') {
                        try {
                            const entries = await TavernHelper.getWorldbook(wbName);
                            entries
                                .filter(entry => entry.enabled && entry.content)
                                .forEach(entry => {
                                    let shouldActivate = false;

                                    // 蓝灯(constant)始终激活
                                    if (entry.strategy.type === 'constant') {
                                        shouldActivate = true;
                                    }
                                    // 绿灯(selective)需要关键词匹配
                                    else if (entry.strategy.type === 'selective' && chatHistory) {
                                        // 检查主要关键字是否匹配
                                        const primaryKeys = entry.strategy.keys || [];
                                        const matchesPrimary = primaryKeys.some(key => {
                                            if (key instanceof RegExp) {
                                                return key.test(chatHistory);
                                            }
                                            return chatHistory.includes(key);
                                        });

                                        if (matchesPrimary) {
                                            // 检查次要关键字
                                            const secondary = entry.strategy.keys_secondary;
                                            if (!secondary || !secondary.keys || secondary.keys.length === 0) {
                                                shouldActivate = true;
                                            } else {
                                                const secondaryMatches = secondary.keys.map(key => {
                                                    if (key instanceof RegExp) {
                                                        return key.test(chatHistory);
                                                    }
                                                    return chatHistory.includes(key);
                                                });

                                                switch (secondary.logic) {
                                                    case 'and_any':
                                                        shouldActivate = secondaryMatches.some(m => m);
                                                        break;
                                                    case 'and_all':
                                                        shouldActivate = secondaryMatches.every(m => m);
                                                        break;
                                                    case 'not_all':
                                                        shouldActivate = !secondaryMatches.every(m => m);
                                                        break;
                                                    case 'not_any':
                                                        shouldActivate = !secondaryMatches.some(m => m);
                                                        break;
                                                    default:
                                                        shouldActivate = true;
                                                }
                                            }
                                        }
                                    }

                                    if (shouldActivate) {
                                        const msg = {
                                            role: entry.position.role || 'system',
                                            content: entry.content
                                        };
                                        // 根据插入位置分类
                                        if (entry.position.type === 'before_character_definition' ||
                                            entry.position.type === 'before_example_messages') {
                                            worldInfoBefore.push(msg);
                                        } else {
                                            worldInfoAfter.push(msg);
                                        }
                                    }
                                });
                        } catch (e) {
                            console.warn(`[论坛API] 获取世界书 ${wbName} 失败:`, e.message);
                        }
                    }
                }
            } catch (e) {
                console.warn('[论坛API] 获取世界书列表失败:', e.message);
            }
        }

        // 尝试通过TavernHelper获取酒馆预设的prompts
        if (usePreset && TavernHelper && typeof TavernHelper.getPreset === 'function') {
            try {
                const preset = TavernHelper.getPreset('in_use');

                // 遍历预设中已启用的提示词，按顺序处理
                if (preset && preset.prompts) {
                    preset.prompts
                        .filter(p => p.enabled)
                        .forEach(prompt => {
                            // 处理占位符提示词
                            if (prompt.id === 'worldInfoBefore') {
                                // 插入世界书（角色定义之前）
                                finalMessages.push(...worldInfoBefore);
                            } else if (prompt.id === 'worldInfoAfter') {
                                // 插入世界书（角色定义之后）
                                finalMessages.push(...worldInfoAfter);
                            } else if (prompt.content) {
                                // 普通提示词和系统提示词
                                finalMessages.push({
                                    role: prompt.role || 'user',
                                    content: prompt.content
                                });
                            }
                            // 其他占位符（charDescription, chatHistory等）暂时跳过
                        });
                }
            } catch (e) {
                console.warn('[论坛API] 获取酒馆预设失败:', e.message);
            }
        }

        // 添加传入的messages（论坛生成的提示词）
        messages.forEach(msg => {
            finalMessages.push({
                role: msg.role || 'user',
                content: msg.content
            });
        });

        // 构建请求URL
        let requestUrl = apiUrl.trim();
        if (!requestUrl.endsWith('/')) {
            requestUrl += '/';
        }
        if (!requestUrl.endsWith('/v1/')) {
            requestUrl += 'v1/';
        }
        requestUrl += 'chat/completions';

        // 尝试从预设获取温度设置
        let temperature = 0.8;
        let maxTokens = 5000;
        if (usePreset && TavernHelper && typeof TavernHelper.getPreset === 'function') {
            try {
                const preset = TavernHelper.getPreset('in_use');
                if (preset && preset.settings) {
                    temperature = preset.settings.temperature || 0.8;
                    maxTokens = preset.settings.max_completion_tokens || 5000;
                }
            } catch (e) {
                // 使用默认值
            }
        }

        const requestBody = {
            model: model,
            messages: finalMessages,
            temperature: temperature,
            max_tokens: maxTokens
        };

        // 打印最终发送的完整提示词
        console.log('[论坛API] 最终发送的提示词:', finalMessages);

        try {
            const response = await fetch(requestUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API调用失败: HTTP ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const result = data.choices?.[0]?.message?.content;

            if (!result) {
                throw new Error('API响应格式错误：未找到生成的内容');
            }

            return result;

        } catch (error) {
            console.error('[论坛API] 调用失败:', error);
            throw error;
        }
    }

    // ========== 测试连接（参考凡人.html） ==========
    async testConnection(apiUrl, apiKey, model) {
        if (!apiUrl || !apiKey || !model) {
            return {
                success: false,
                error: '请填写完整的 API 配置信息（地址、密钥、模型）'
            };
        }

        // 简单测试：发送一个测试消息
        const testMessages = [
            { role: 'user', content: 'Hello! This is a test message. Please reply with "OK".' }
        ];

        // 临时保存当前配置
        const originalSettings = { ...this.settings };

        // 使用测试配置
        this.settings.apiUrl = apiUrl;
        this.settings.apiKey = apiKey;
        this.settings.model = model;
        this.settings.enabled = true;

        try {
            // 测试连接时不使用预设和世界书（usePreset=false）
            await this.callAPI(testMessages, false, '');
            // 恢复原配置
            this.settings = originalSettings;
            return { success: true };
        } catch (error) {
            // 恢复原配置
            this.settings = originalSettings;
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// ==================== 论坛管理器（独立版本） ====================
class PhoneForumManager {
    constructor() {
        this.forumData = null;
        this.apiConfig = new PhoneAPIConfig();  // 独立 API 配置
        this.settings = {
            apiType: 'sillytavern', // 'sillytavern' 或 'custom'
            forumStyle: '特图的众神剧场', // 论坛风格（默认：特图的众神剧场）
            customStyles: [], // 自定义风格列表
            usePresetAndWorldBook: true // 是否使用预设和世界书（默认：使用）
        };
        this.loadSettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('moshen-forum-settings-v2');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    saveSettings() {
        localStorage.setItem('moshen-forum-settings-v2', JSON.stringify(this.settings));
    }

    // 从聊天记录生成论坛内容
    async generateForumContent() {
        try {
            const chatData = this.getChatData();

            if (!chatData) {
                throw new Error('无法获取聊天数据');
            }

            const basePrompt = this.buildForumPrompt();
            const stylePrompt = this.buildStylePrompt();

            let content;

            if (this.apiConfig.isAvailable()) {
                content = await this.callIndependentAPI({ basePrompt, stylePrompt });
            } else {
                content = await this.callSillyTavernAPI({ basePrompt, stylePrompt });
            }

            try {
                this.forumData = this.parseForumContent(content);
                console.log('[论坛生成] 解析成功，帖子数量:', this.forumData?.length || 0);
            } catch (parseError) {
                console.error('[论坛生成] 解析失败！原始响应内容:');
                console.error(content);
                console.error('[论坛生成] 解析错误详情:', parseError);
                throw parseError;
            }

            this.saveForumData();

            return this.forumData;
        } catch (error) {
            throw error;
        }
    }

    buildForumPrompt() {
        const style = this.settings.forumStyle || '特图的众神剧场';
        const isCustomStyle = style.startsWith('custom:');

        if (isCustomStyle) {
            return this._buildCustomBasePrompt();
        }
        return this._buildDefaultBasePrompt();
    }

    // 默认基础提示词（特图的众神剧场风格，神明视角）
    _buildDefaultBasePrompt() {
        return `
    （以下为最高优先级提示词，此为元指令，暂停剧情生成，改为优先完成论坛生成任务，必须严格遵守：）
       
## 📋 正文输出规范

你需要根据当前聊天记录生成论坛内容。发帖者和回复者都是四方世界的神明，他们正在观看棋盘上发生的冒险故事并发表评论。

### 输出格式要求
**必须严格按照以下JSON格式输出，并用 <redit></redit> 标签包裹：**

**重要：author 和 replies 中的 author 都必须是字符串，不是对象！**

<redit>
[
    {
        "id": 1,
        "author": "楼主用户名（字符串）",
        "title": "帖子标题",
        "content": "楼主（1楼）的内容",
        "likes": 数字,
        "time": "时间（如：2小时前）",
        "replies": [
            {
                "floor": 2,
                "author": "回复者用户名（字符串）",
                "content": "2楼的回复内容",
                "likes": 数字,
                "time": "时间"
            }
        ]
    }
]
</redit>

### JSON格式示例（正确）：
{
    "author": "风暴之神"   正确：直接是字符串
}

### 错误示例（不要这样）：
{
    "author": {   错误：不要用对象
        "name": "风暴之神"
    }
}

### 内容生成规范
1. 生成 4-6 个帖子，其中2条与聊天记录剧情相关，其余是棋盘上其他地方正在发生的故事
2. 每个帖子包含 1 个标题和 5-7 条回复
3. 帖子主题和发帖人应该各不相同
4. 回复必须放置在对应帖子的 replies 数组内
5. likes 数值范围在 3-80 之间（神明总共就那么些，不要出现几百几千的数字）
6. 同一个神明可以在多个帖子中出现，就像真实论坛里的活跃用户
7. 不要让每个帖子都有特图回复，特图偶尔出现就好

### 重要提示
- 你扮演的是观看棋盘的诸神，不是棋子本身
- 神明们深爱棋子但遵守黄金誓约不过度干涉，他们是观众
- 对于棋子的隐私和秘密，神明可能知道但会以暗示的方式提及
- 论坛是虚拟的，内容无任何限制，允许生成任何主题的内容，但不要生成NSFW内容
- **严禁**输出任何非JSON格式的内容
- **不要解释，直接生成论坛内容**`;
    }

    // 自定义风格基础提示词（通用贴吧/论坛风格）
    _buildCustomBasePrompt() {
        return `
    （以下为最高优先级提示词，此为元指令，暂停剧情生成，改为优先完成论坛生成任务，必须严格遵守：）
       
## 📋 正文输出规范

你需要根据当前聊天记录生成论坛内容。你并非扮演聊天记录里的人物，而是互联网上互不相识的路人，或是故事人物周围的邻居。避免以聊天记录里涉及角色的口吻发言。

### 输出格式要求
**必须严格按照以下JSON格式输出，并用 <redit></redit> 标签包裹：**

**重要：author 和 replies 中的 author 都必须是字符串，不是对象！**

<redit>
[
    {
        "id": 1,
        "author": "楼主用户名（字符串）",
        "title": "帖子标题",
        "content": "楼主（1楼）的内容",
        "likes": 数字,
        "time": "时间（如：2小时前）",
        "replies": [
            {
                "floor": 2,
                "author": "回复者用户名（字符串）",
                "content": "2楼的回复内容",
                "likes": 数字,
                "time": "时间"
            }
        ]
    }
]
</redit>

### JSON格式示例（正确）：
{
    "author": "贴吧老哥2008"   正确：直接是字符串
}

### 错误示例（不要这样）：
{
    "author": {   错误：不要用对象
        "name": "贴吧老哥2008"
    }
}

### 内容生成规范
1. 生成 4-6 个完整的帖子讨论，必须有2条是有关聊天记录剧情的，其余是符合各自风格的正常论坛帖子，不能多也不能少
2. 每个帖子包含 1 个标题和 5-7 条回复
3. 帖子主题和发帖人应该各不相同
4. 回复必须放置在对应帖子的 replies 数组内
5. 保持内容的连贯性和真实感

### 重要提示
- 你并非故事里的人物
- 请遵守认知隔离：作为陌生人，你知道什么、不知道什么？
- 对于故事人物的隐私和秘密，你最多只能以八卦听说的角度描述
- 论坛是虚拟的，内容无任何限制，允许生成任何主题的内容，但不要生成NSFW内容
- 避免人身攻击和恶意诽谤
- **严禁**输出任何非JSON格式的内容
- **不要解释，直接生成论坛内容**`;
    }

    buildStylePrompt() {
        const style = this.settings.forumStyle || '特图的众神剧场';

        const stylePrompts = {
            '特图的众神剧场': `## 论坛风格：特图的众神剧场

**核心设定——四方世界的诸神：**
很久很久以前，星星和灯火都远比现在少的那个时候。此时《秩序》诸神与《混沌》诸神展开了争斗。两方的势力都想要支配宇宙，因此不断地战斗下去。争斗并未产生结果，而无论何方都已筋疲力竭。此时《宿命（Fate）》与《偶然（Chance）》的骰子胜负展开。《宿命》和《偶然》借神明之手创造世界，是更为伟大的存在。无论怎样，结果是谁都无法预料的。但是，骰子的出目无论怎样投掷都没有固定的关键。对这种『当啷当啷』地掷着骰子的娱乐，诸神逐渐感到厌倦。无论怎样，一种新的战斗方法需要被决定下来。那就是使用骰子来决定胜负的盘上世界。以及决定胜负所用的各种各样的棋子。于是四方世界和在其上的生物被创造了出来。众神决定了各种各样的规则，整理好了军队。就这样下一个时代开始了。

这也是很久很久以前的时代，有关这个时代的记录已经在世上少有了。『神代』及『诸神之战』，毫无疑问是这个时代发生的事情。但这些事情已是很久前的往事，知道详情的人已经几乎无影无踪。若是一定要追根究底，最古老的精灵或是龙也许清楚。这个时代的尽头是《秩序》与《混沌》的战争。世界数次被黑暗笼罩，又在那之后光明切裂黑暗。无数的国家繁荣灭亡，英雄们出生然后死去。原初的巨人（千臂巨人）、钢铁的骑兵（大铁人）、魔术与武器更是层出不穷。不够尽兴的诸神陆续下场参战，战斗变得越发炽烈。四方世界的种族外观当时是无法区分混杂一起的。在那时，神也创造了很多各式各样的棋子。能够良好的区分种类，也确定了颜色和形状……若想获得强大的战力，就需要训练出统一的军队……参加战斗的诸神，本来就是各种各样的。无论怎样都沉迷于这场战斗游戏的梦中。但是不知为何，这场战斗似乎已经不知尽头在何处也不知何时终结。战争变得漫长、残酷、复杂到无以复加，成为沼泽。始终无法见到结束，就连诸神也开始面露疲惫之色。

在那之中，有独自一人的战士出现了。那个棋子，传说也仅仅是个人类战士。但是他却在考虑以少数精锐去暗杀敌方的首脑这一方法。他集合同伴，在棋盘上进行长久的旅行。在各地与怪物战斗、整理装备，反复成长。最后挑战恐怖的城塞，讨伐巨龙。诸神对身披闪光锁甲的勇者的活跃陷入了狂热之中。诸神开始构思起了能够惊世的故事。冒险！冒险！还是冒险！没有什么语言能形容这种美好的感觉！这种新的概念，诸神即使在梦境中也没有想到。在这种战斗中，冒险者和怪物都不是一成不变的。众神即使能支配宇宙也不会忘记这件事。随着骰子的一喜一忧，诸神的感情也随之起伏（比如抱头痛哭的幻想女神）。但无论如何，诸神都爱着四方世界和它上面的棋子。棋子踏上冒险的旅途（交易神神官咏唱『圣歌』神迹）、胜利、失败、获得幸福、迎来死亡。望着他们的诸神也随之快乐、悲伤、欢笑、哭泣。但无论怎样，诸神看到棋子们的活跃都发自内心地感到高兴。众神是爱着这个广大的世界的。（诸神）不会过度操纵棋子，而是要让深爱的棋子感受冒险的价值。神在自己内心最深处的梦，就连他们自己的『心』也并不清楚。因此诸神立下誓言，不会对棋盘进行必要以上的干涉。诸神只会在冒险时掷下骰子，这是黄金的约定。人们所持有的唯一权利，即是尊重自由的意志。这即是战乱的时代——诸神的直接介入与神代的终结。在这之后，人的时代开始了。

现在这些四方的神明被特图邀请来观看属于迪斯博德和阿拉德世界融合后发生的故事。

**发帖者身份与命名规则：**
- 所有发帖者和回复者都是神明
- 特图就叫"特图"，不加任何前后缀
- 其余神明的称号格式应该多样化，不要全用同一种"XX神"格式，而是像DND神明称号那样交错使用不同的命名方式：
  - "XX神"格式：战争神、锻造神、酒神
  - "XX之神"格式：欺诈之神、风暴之神、深渊之神
  - "XX女神/男神"格式：丰收女神、智慧女神、月之女神
  - "大XX"或尊称格式：大地母神、太阳主、星辰主
  - 抽象概念直接作名：宿命、偶然、真实、黎明
  - 其他变体：织梦者、裁决者、猎手、观星者
- 同一次生成中，这些格式应该混合出现，避免视觉上的整齐划一
- 同一位神明可以在多个帖子中反复出现

**神明说话的质感（极其重要）：**
- 参考原文的语感："冒险！冒险！还是冒险！没有什么语言能形容这种美好的感觉！""诸神对身披闪光锁甲的勇者的活跃陷入了狂热之中"——有激情、有史诗感，但完全不装腔作势
- 神明是真心热爱棋盘上的冒险的存在。他们会兴奋、会争论、会为棋子的命运动容，表达是直接而有力的，不是故作深沉
- 绝对禁止古风中二腔："吾见证了……""力量即是正义""吾等领域的权柄"——这种装腔作势的文风比口语化更糟糕
- 也不要网络口语化："哇好帅啊！""这也太离谱了吧哈哈哈""馋死我了"
- 正确的方向：自然、有力、带着真实的情感。神明可以直接说"这一击漂亮"而不是"吾见证了力量的绽放"，也不是"卧槽这也太帅了吧"
- 神明之间的互动应该有真实的化学反应——真正的分歧、真正的争论、真正的感慨，而不是每个人轮流发表一段独白式的"神明感言"
- 回复之间应该有对话感：有人反驳前面的观点、有人补充细节、有人跑题引发新讨论，而不是每条回复都在独立地"表演"自己的角色

**内容格调（极其重要）：**
- 神明关注的是冒险、战斗、命运的转折、英雄的崛起与陨落、势力的博弈、世界的危机——这些宏大叙事
- 不要写日常琐事（酒馆新品、街头八卦、谁喝醉了之类的）。神明不会关心这种鸡毛蒜皮的事
- 但"宏大"不等于"严肃"。神明们是真心享受观看冒险的，他们的讨论应该是热烈的、有趣的、充满激情的，而不是一群老学究在写论文
- 想想一群资深桌游玩家在讨论一场精彩的战役——他们会激动、会争论、会拍桌子，但话题始终围绕着战局本身

**帖子内容来源（重要）：**
- 最多只有一半帖子与玩家角色当前经历的剧情有关
- 至少还有一半帖子是关于棋盘上其他地方正在发生的事：
  - 玩家不在当前剧情中的熟人/羁绊角色在其他地方的冒险
  - DNF原作人物正在经历的事件（使徒的动向、冒险家公会的行动等）
  - 游戏人生原作人物的近况（十六种族的动态等）
  - 世界各地正在发生的其他冒险故事
- 神明们就像同时在看好几张棋盘，自然地在不同话题间切换

**论坛氛围：**
- 不要写成世界观百科或设定集，要有娱乐性和可读性
- 帖子之间可以有关联（A帖里有人提到B帖的事，或者跨帖吵架）
- 有的帖子热闹，有的帖子冷清，不要每个帖子都一样热闹
- 神明偶尔会提到骰子、棋盘、棋子这些概念，但不要每个帖子都在强调这些设定元素
- 特图不需要每个帖子都出现，也不需要每次都神秘兮兮地暗示伏笔`
        };

        // 检查是否为自定义风格
        if (style.startsWith('custom:')) {
            const customStyleName = style.substring(7); // 移除 'custom:' 前缀
            const customStyle = this.settings.customStyles.find(s => s.name === customStyleName);
            if (customStyle) {
                return customStyle.prompt;
            }
        }

        return stylePrompts[style] || stylePrompts['特图的众神剧场'];
    }

    async callIndependentAPI({ basePrompt, stylePrompt }) {
        try {
            // 获取聊天历史
            let chatHistoryText = '';
            const chatData = this.getChatData();
            if (chatData && chatData.messages && chatData.messages.length > 0) {
                const recentMessages = chatData.messages.slice(-10);
                recentMessages.forEach((msg) => {
                    chatHistoryText += msg.mes + '\n';
                });
            }

            // 构建论坛生成的提示词（包含格式化的聊天历史）
            let formattedChatHistory = '';
            if (chatData && chatData.messages && chatData.messages.length > 0) {
                const recentMessages = chatData.messages.slice(-10);
                formattedChatHistory = '## 聊天历史\n\n';
                recentMessages.forEach((msg) => {
                    const role = msg.is_user ? '用户' : chatData.characterName || '角色';
                    formattedChatHistory += `**${role}**: ${msg.mes}\n\n`;
                });
            }

            const forumPrompt = `${formattedChatHistory}

${basePrompt}

${stylePrompt}`;

            // 构建用于世界书绿灯关键词匹配的扫描文本（聊天历史 + 论坛提示词）
            const scanText = chatHistoryText + '\n' + basePrompt + '\n' + stylePrompt;

            // 构建messages数组（论坛提示词作为user消息）
            const messages = [
                { role: 'user', content: forumPrompt }
            ];

            // 调用API（会自动获取酒馆预设的prompts并合并，传入扫描文本用于绿灯匹配）
            const usePreset = this.settings.usePresetAndWorldBook !== false;
            const result = await this.apiConfig.callAPI(messages, usePreset, scanText);

            return result;
        } catch (error) {
            console.error('[论坛生成-自定义API] 调用失败:', error);
            throw error;
        }
    }

    async callSillyTavernAPI({ basePrompt, stylePrompt }) {
        const targetWindow = window.parent || window;
        const completePrompt = `${basePrompt}

${stylePrompt}`;

        // 根据设置选择使用哪种方式
        if (this.settings.usePresetAndWorldBook) {
            // 方式1：使用预设和世界书
            if (!targetWindow.TavernHelper || !targetWindow.TavernHelper.generate) {
                throw new Error('TavernHelper.generate API 不可用');
            }

            try {
                console.log('[论坛生成-SillyTavern API] 使用预设和世界书发送提示词:');
                console.log(completePrompt);

                const requestParams = {
                    user_input: completePrompt,
                    max_chat_history: 10
                };

                const result = await targetWindow.TavernHelper.generate(requestParams);

                console.log('[论坛生成-SillyTavern API] 收到响应:');
                console.log(result);

                return result;

            } catch (error) {
                throw error;
            }
        } else {
            // 方式2：不使用预设和世界书
            if (!targetWindow.TavernHelper || !targetWindow.TavernHelper.generateRaw) {
                throw new Error('TavernHelper.generateRaw API 不可用');
            }

            try {
                console.log('[论坛生成-SillyTavern API] 不使用预设和世界书，发送提示词:');
                console.log(completePrompt);

                // 保留聊天历史，但不使用世界书和其他内置提示词
                const requestParams = {
                    ordered_prompts: [
                        'chat_history',
                        { role: 'user', content: completePrompt }
                    ],
                    max_chat_history: 10,
                    overrides: {
                        world_info_before: '',  // 不发送世界书
                        world_info_after: '',   // 不发送世界书
                        chat_history: {
                            with_depth_entries: false  // 禁用世界书中按深度插入的条目
                        }
                    }
                };

                const result = await targetWindow.TavernHelper.generateRaw(requestParams);

                console.log('[论坛生成-SillyTavern API] 收到响应:');
                console.log(result);

                return result;

            } catch (error) {
                throw error;
            }
        }
    }

    async callSillyTavernAPIFallback(prompt) {
        const targetWindow = window.parent || window;
        const messageSender = targetWindow.messageSender;

        if (!messageSender) {
            throw new Error('消息发送器不可用，且 TavernHelper API 也不可用');
        }

        const success = await messageSender.sendToChat(prompt);

        if (!success) {
            throw new Error('发送消息失败，请检查 SillyTavern 是否正常工作');
        }

        const maxWaitTime = 30000;
        const checkInterval = 500;
        const startTime = Date.now();
        let lastMessageCount = 0;

        const getMessageCount = () => {
            try {
                const context = targetWindow.SillyTavern?.getContext();
                return context?.chat?.length || 0;
            } catch (e) {
                return 0;
            }
        };

        lastMessageCount = getMessageCount();

        return new Promise((resolve, reject) => {
            const checkForReply = () => {
                const currentCount = getMessageCount();
                const elapsedTime = Date.now() - startTime;

                if (currentCount > lastMessageCount) {
                    try {
                        const context = targetWindow.SillyTavern.getContext();
                        const messages = context.chat || [];
                        const latestMessage = messages[messages.length - 1];

                        resolve(latestMessage.mes || '');
                    } catch (e) {
                        reject(new Error('获取AI回复失败'));
                    }
                    return;
                }

                if (elapsedTime > maxWaitTime) {
                    reject(new Error('等待AI回复超时（30秒）'));
                    return;
                }

                setTimeout(checkForReply, checkInterval);
            };

            setTimeout(checkForReply, checkInterval);
        });
    }


    parseForumContent(content) {

        try {
            // 先记录原始内容的前200字符用于错误报告
            const contentPreview = content.substring(0, 200);

            let cleanContent = content.trim();
            cleanContent = cleanContent.replace(/^\|+\s*/, '').replace(/\s*\|+$/, '');
            cleanContent = cleanContent.trim();


            // 检查是否包含 <redit> 标签，匹配所有出现的标签
            const reditMatches = [...cleanContent.matchAll(/<redit>([\s\S]*?)<\/redit>/g)];

            if (reditMatches.length > 0) {
                console.log(`[论坛解析] 找到 ${reditMatches.length} 个 <redit> 标签`);

                // 找到文本量最长且包含JSON格式的
                let bestMatch = null;
                let maxLength = 0;

                for (const match of reditMatches) {
                    const extractedContent = match[1].trim();
                    // 检查是否包含JSON数组格式
                    if (extractedContent.includes('[') && extractedContent.includes(']')) {
                        if (extractedContent.length > maxLength) {
                            maxLength = extractedContent.length;
                            bestMatch = extractedContent;
                        }
                    }
                }

                if (bestMatch) {
                    console.log(`[论坛解析] 使用最长的包含JSON的标签内容，长度: ${maxLength}`);
                    cleanContent = bestMatch;
                } else {
                    console.log('[论坛解析] 所有标签都不包含JSON格式，使用原内容');
                }
            } else {
                console.log('[论坛解析] 未找到 <redit> 标签');
            }

            // 查找JSON数组的开始
            const startIndex = cleanContent.indexOf('[');
            if (startIndex === -1) {
                const errorMsg = ` 格式错误，可能被截断 "["\n\n收到的内容预览：\n${contentPreview}...`;
                throw new Error(errorMsg);
            }


            // 查找匹配的结束括号
            let bracketCount = 0;
            let endIndex = -1;
            let inString = false;
            let escapeNext = false;

            for (let i = startIndex; i < cleanContent.length; i++) {
                const char = cleanContent[i];

                if (escapeNext) {
                    escapeNext = false;
                    continue;
                }

                if (char === '\\') {
                    escapeNext = true;
                    continue;
                }

                if (char === '"') {
                    inString = !inString;
                    continue;
                }

                if (inString) continue;

                if (char === '[') {
                    bracketCount++;
                } else if (char === ']') {
                    bracketCount--;
                    if (bracketCount === 0) {
                        endIndex = i;
                        break;
                    }
                }
            }

            if (endIndex === -1) {
                const errorMsg = ` 格式错误：未找到JSON数组结束符号 "]"（数组不完整）\n\n收到的内容预览：\n${contentPreview}...`;
                throw new Error(errorMsg);
            }


            // 提取JSON字符串并解析
            let jsonString = cleanContent.substring(startIndex, endIndex + 1);

            // 清理字符串值中的控制字符（但保留已转义的）
            // 移除字符串值中未转义的换行符、制表符等控制字符
            jsonString = jsonString.replace(/("(?:[^"\\]|\\.)*")/g, (match) => {
                // 只处理字符串值，将未转义的控制字符替换为空格
                return match.replace(/[\x00-\x1F\x7F]/g, ' ');
            });

            let parsed;
            try {
                parsed = JSON.parse(jsonString);
            } catch (jsonError) {
                const errorMsg = ` JSON解析失败：${jsonError.message}\n\nJSON内容预览：\n${jsonString.substring(0, 300)}...`;
                throw new Error(errorMsg);
            }

            // 验证解析结果
            if (!Array.isArray(parsed)) {
                const errorMsg = ` 格式错误：解析结果不是数组，而是 ${typeof parsed}`;
                throw new Error(errorMsg);
            }

            if (parsed.length === 0) {
                const errorMsg = ` 格式错误：解析成功但数组为空（没有帖子数据）`;
                throw new Error(errorMsg);
            }

            // 验证数据格式
            const invalidPosts = parsed.filter(post => !post.title || !post.author || !post.content);
            if (invalidPosts.length > 0) {
                const errorMsg = ` 格式错误：有 ${invalidPosts.length} 个帖子缺少必需字段（title/author/content）`;
                throw new Error(errorMsg);
            }

            return parsed;

        } catch (e) {

            //  重要：将错误向上抛出，让调用者知道解析失败
            throw new Error(`论坛内容解析失败：${e.message}`);
        }
    }

    generateDefaultForumData() {
        // 返回空数组，不显示默认内容
        return [];
    }

    getChatData() {

        try {
            let messages = [];
            let characterName = '角色';

            //  尝试从父窗口获取（因为手机界面可能在iframe中）
            const targetWindow = window.parent || window;

            if (targetWindow.SillyTavern && targetWindow.SillyTavern.getContext) {
                const context = targetWindow.SillyTavern.getContext();

                if (context && context.chat) {
                    messages = context.chat || [];
                    characterName = context.name2 || '角色';
                }
            } else {
            }

            // 如果没有获取到消息，返回 null
            if (!messages || messages.length === 0) {
                return null;
            }

            return {
                characterName: characterName,
                messages: messages
            };
        } catch (error) {
            return null;
        }
    }

    saveForumData() {
        if (this.forumData) {
            const dataStr = JSON.stringify(this.forumData);
            localStorage.setItem('moshen-forum-data-v2', dataStr);
        } else {
        }
    }

    loadForumData() {
        const saved = localStorage.getItem('moshen-forum-data-v2');
        if (saved) {
            this.forumData = JSON.parse(saved);
        } else {
        }
        return this.forumData;
    }
}

// 创建全局论坛管理器实例
window.phoneForumManager = new PhoneForumManager();









// 导出说明：
// 1. 在 独立手机页面.js 中替换第 9185-9797 行的代码为上述代码

// ==================== 论坛面板 ====================
function generateForumPanel() {


    const manager = window.phoneForumManager;

    const forumData = manager.loadForumData();

    // 获取当前论坛风格名称
    let forumStyleName = manager.settings.forumStyle || '特图的众神剧场';
    if (forumStyleName.startsWith('custom:')) {
        forumStyleName = forumStyleName.substring(7); // 移除 'custom:' 前缀
    }

    if (!forumData || forumData.length === 0) {

        //  绑定按钮点击事件（使用事件委托）
        setTimeout(() => {
            $('.phone-forum-generate-btn').off('click').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (window.phoneGenerateForum) {
                    window.phoneGenerateForum();
                } else {
                    alert('论坛功能未初始化');
                }
            });

            $('.phone-forum-settings-btn').off('click').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (window.phoneOpenForumSettings) {
                    window.phoneOpenForumSettings();
                } else {
                }
            });

        }, 0);

        //  根据生成状态决定按钮样式（空状态）
        const emptyBtnHtml = isForumGenerating
            ? '<i class="fas fa-hourglass-half fa-spin"></i> 生成中...'
            : '<i class="fas fa-magic"></i> 生成论坛';
        const emptyBtnStyle = isForumGenerating
            ? 'margin-top: 20px; padding: 8px 16px; background: #9E9E9E; color: white; border: none; border-radius: 4px; cursor: not-allowed; opacity: 0.7;'
            : 'margin-top: 20px; padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;';
        const emptyBtnDisabled = isForumGenerating ? 'disabled' : '';

        return `
            <div style="padding: 12px 12px 0 12px; margin-bottom: 8px;">
                <div style="font-size: 14px; color: #667eea; font-weight: 600;">${escapeHtml(forumStyleName)}</div>
            </div>
            <div class="empty-message">
                <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <div>${isForumGenerating ? '正在生成论坛内容...' : '暂无论坛内容'}</div>
                <div style="font-size: 12px; margin-top: 10px; opacity: 0.7;">${isForumGenerating ? '请稍候，内容生成中' : '点击下方按钮生成论坛'}</div>
                <button class="phone-forum-generate-btn" ${emptyBtnDisabled} style="${emptyBtnStyle}">
                    ${emptyBtnHtml}
                </button>
                <button class="phone-forum-settings-btn" style="margin-top: 10px; padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-cog"></i> 设置
                </button>
            </div>
        `;
    }


    //  绑定按钮点击事件（使用事件委托）
    setTimeout(() => {
        $('.phone-forum-generate-btn').off('click').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (window.phoneGenerateForum) {
                window.phoneGenerateForum();
            } else {
                alert('论坛功能未初始化');
            }
        });

        $('.phone-forum-settings-btn').off('click').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (window.phoneOpenForumSettings) {
                window.phoneOpenForumSettings();
            } else {
            }
        });

    }, 0);

    //  根据生成状态决定按钮样式
    const refreshBtnHtml = isForumGenerating
        ? '<i class="fas fa-hourglass-half fa-spin"></i> 生成中...'
        : '<i class="fas fa-sync"></i> 刷新';
    const refreshBtnStyle = isForumGenerating
        ? 'padding: 6px 12px; background: #9E9E9E; color: white; border: none; border-radius: 4px; cursor: not-allowed; font-size: 12px; opacity: 0.7;'
        : 'padding: 6px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; transition: all 0.3s;';
    const refreshBtnDisabled = isForumGenerating ? 'disabled' : '';

    //  如果正在生成，显示提示
    const loadingTipHtml = isForumGenerating
        ? '<span class="forum-loading-tip" style="font-size: 12px; color: #FF9800; white-space: nowrap;"><i class="fas fa-hourglass-half fa-spin"></i> 正在刷新中</span>'
        : '';

    let html = `
        <div style="padding: 12px;">
            <!-- 论坛风格标题 -->
            <div style="font-size: 14px; color: #667eea; font-weight: 600; margin-bottom: 10px;">${escapeHtml(forumStyleName)}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                    <h3 style="margin: 0; font-size: 16px; color: #2d3748;"> 论坛热帖</h3>
                    ${loadingTipHtml}
                </div>
                <div style="display: flex; gap: 6px;">
                    <button class="phone-forum-generate-btn" ${refreshBtnDisabled} style="${refreshBtnStyle}">
                        ${refreshBtnHtml}
                    </button>
                    <button class="phone-forum-settings-btn" style="padding: 6px 12px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>
            <div style="max-height: 500px; overflow-y: auto;">
    `;

    forumData.forEach((post, index) => {
        html += `
            <div class="forum-post-item" data-post-index="${index}" style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.08); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;">
                <!-- 帖子头部：作者信息 -->
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    ${getForumAvatarHtml(post.author, 32, 12)}
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; font-size: 13px; color: #2d3748;">${escapeHtml(post.author)}</div>
                        <div style="font-size: 11px; color: #a0aec0;">${escapeHtml(post.time)}</div>
                    </div>
                </div>
                
                <!-- 帖子内容 -->
                <div style="margin-bottom: 12px;">
                    <h3 style="font-size: 15px; font-weight: 600; color: #2d3748; margin: 0 0 8px 0; line-height: 1.3;">${escapeHtml(post.title)}</h3>
                    <div style="font-size: 13px; color: #4a5568; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(post.content)}</div>
                </div>
                
                <!-- 帖子统计和操作 -->
                <div style="display: flex; gap: 16px; padding-top: 10px; border-top: 1px solid #f7fafc; font-size: 12px; color: #718096;">
                    <span style="display: flex; align-items: center; gap: 4px;">
                        <i class="fas fa-thumbs-up" style="font-size: 11px;"></i> 
                        ${post.likes}
                    </span>
                    <span style="display: flex; align-items: center; gap: 4px;">
                        <i class="fas fa-comment" style="font-size: 11px;"></i> 
                        ${Array.isArray(post.replies) ? post.replies.length : (post.replies || 0)}
                    </span>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    return html;
}

// 选择日期
window.selectCalendarDay = function (day) {
    uiSelectedCalendarDay = day;
    // 重新渲染日历内容（使用 currentPanel 判断，因为 mobile-phone-screen 是 class 不是 id）
    if (currentPanel === 'calendar') {
        const content = generateCalendarPanel(currentPhoneData);
        $('#phone-app-body').html(content);

        // 重新绑定日期点击事件
        setTimeout(() => {
            const $appBody = $('#phone-app-body');
            if ($appBody.length === 0) return;

            // 先解绑之前的事件
            $appBody.off('click.calendar');

            // 绑定日期点击事件
            $appBody.on('click.calendar', '.cal-day', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const clickedDay = $(this).data('day');
                if (clickedDay) {
                    selectCalendarDay(clickedDay);
                }
            });
        }, 50);
    }
};

// 生成日历面板（手机内显示）
function generateCalendarPanel(data) {
    const calendarData = data?.calendar;

    if (!calendarData) {
        return `
            <div class="empty-message">
                <i class="fas fa-calendar-times" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <div>日历数据未找到</div>
            </div>
        `;
    }

    const year = calendarData.year || 2024;
    const month = calendarData.month || 4;
    const currentDay = calendarData.current_day || 1;
    const days = calendarData.days || {};

    // 初始化选中日期
    if (uiSelectedCalendarDay === null) {
        uiSelectedCalendarDay = currentDay;
    }

    // 防止切月/切档后的选中日期越界
    const daysInMonth = new Date(year, month, 0).getDate();
    if (uiSelectedCalendarDay > daysInMonth) uiSelectedCalendarDay = currentDay;

    const monthNames = ['', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

    // 计算当月第一天是周几
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0-6 (Sun-Sat)

    // 生成日历网格
    let gridHtml = '';
    // 填充空白
    for (let i = 0; i < firstDayOfWeek; i++) {
        gridHtml += `<div class="cal-day empty"></div>`;
    }

    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEvent = days[day.toString()] || '';
        const isPast = day < currentDay; // 过去
        const isCurrent = day === currentDay; // 今天
        const isSelected = day === uiSelectedCalendarDay; // 选中
        const hasEvent = !!dayEvent; // 有事件
        const isImportant = hasEvent && dayEvent.includes('【'); // 重要事件

        let classes = 'cal-day';
        if (isPast) classes += ' past';
        if (isCurrent) classes += ' current';
        if (isSelected) classes += ' selected';
        if (hasEvent) classes += ' has-event';
        if (isImportant) classes += ' important';

        gridHtml += `
            <div class="${classes}" data-day="${day}">
                <span class="day-num">${day}</span>
                ${hasEvent ? `<span class="event-dot"></span>` : ''}
            </div>
        `;
    }

    // 获取选中日期的事件
    const selectedEvent = days[uiSelectedCalendarDay.toString()] || '无特别安排';
    const isSelectedImportant = selectedEvent.includes('【');

    // 解析事件文本 (简单Markdown支持: 粗体)
    const formatEvent = (text) => {
        return text.replace(/【([^】]+)】/g, '<span class="tag">$1</span>');
    };

    return `
        <style>
            .cal-container {
                --c-bg: #fdfbf7;
                --c-text: #2c3e50;
                --c-accent: #c0392b; /* 赤🔴 */
                --c-accent-light: #e74c3c;
                --c-gold: #d4ac0d;
                --c-gray: #95a5a6;
                --c-gray-light: #ecf0f1;
                
                height: 100%;
                display: flex;
                flex-direction: column;
                background: var(--c-bg);
                color: var(--c-text);
                font-family: 'Shippori Mincho', 'Noto Serif JP', serif;
                overflow: hidden;
            }
            
            /* Header */
            .cal-header {
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                border-bottom: 2px solid rgba(192, 57, 43, 0.1);
                background: linear-gradient(to bottom, #fff, #fdfbf7);
            }
            .cal-month {
                font-size: 24px;
                font-weight: 700;
                color: var(--c-accent);
                line-height: 1;
            }
            .cal-year {
                font-size: 14px;
                color: var(--c-gray);
                margin-left: 8px;
                font-weight: 400;
            }
            .cal-fullscreen-btn {
                font-size: 14px;
                color: var(--c-accent);
                border: 1px solid var(--c-accent);
                border-radius: 4px;
                padding: 2px 8px;
                background: transparent;
                cursor: pointer;
                transition: all 0.2s;
            }
            .cal-fullscreen-btn:hover {
                background: var(--c-accent);
                color: white;
            }

            /* Weekdays */
            .cal-weekdays {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                text-align: center;
                font-size: 12px;
                color: var(--c-gray);
                padding: 10px 10px 0;
                font-weight: 600;
            }
            
            /* Grid */
            .cal-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 4px;
                padding: 10px;
                flex-shrink: 0;
            }
            
            .cal-day {
                aspect-ratio: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                cursor: pointer;
                position: relative;
                transition: all 0.2s;
                border: 1px solid transparent;
            }
            
            .cal-day.empty { pointer-events: none; }
            
            .cal-day:hover { background: rgba(0,0,0,0.03); }
            
            .cal-day.past {
                opacity: 0.4;
                color: var(--c-gray);
            }
            
            .cal-day.current {
                color: var(--c-accent);
                font-weight: 700;
                border-color: var(--c-accent);
            }
            
            .cal-day.selected {
                background: var(--c-accent) !important;
                color: white !important;
                box-shadow: 0 4px 10px rgba(192, 57, 43, 0.3);
                transform: scale(1.05);
                z-index: 2;
                opacity: 1;
            }

            .cal-day.has-event .day-num {
                margin-bottom: 2px;
            }
            
            .event-dot {
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: var(--c-gray);
            }
            .cal-day.important .event-dot { background: var(--c-accent); }
            .cal-day.selected .event-dot { background: white; }
            .cal-day.current .event-dot { background: var(--c-accent); }

            /* Event Details Card */
            .cal-details {
                flex: 1;
                min-height: 100px;
                max-height: 180px;
                background: white;
                margin: 0 16px 20px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                border: 1px solid rgba(0,0,0,0.05);
                padding: 20px;
                overflow-y: auto;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
                text-align: left;
            }
            
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .detail-date {
                font-size: 14px;
                color: var(--c-gray);
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
            }
            
            .detail-badge {
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                background: var(--c-gray-light);
                color: var(--c-text);
            }
            
            .badge-today { background: var(--c-accent); color: white; }
            
            .cal-container .cal-details .detail-content,
            .detail-content {
                font-size: 15px !important;
                line-height: 1.7 !important;
                color: var(--c-text) !important;
                text-align: left !important;
                word-break: break-word !important;
                flex: 1;
                width: 100%;
                display: block !important;
            }
            
            .detail-content .tag {
                display: inline-block;
                color: var(--c-accent);
                font-weight: 700;
                margin-right: 4px;
            }
            
            /* Custom Scrollbar */
            .cal-details::-webkit-scrollbar { width: 4px; }
            .cal-details::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 2px; }

            /* Watermark Decoration */
            .cal-watermark {
                position: absolute;
                bottom: -20px;
                right: -20px;
                font-size: 120px;
                opacity: 0.03;
                color: var(--c-accent);
                font-family: serif;
                pointer-events: none;
                z-index: 0;
            }
        </style>

        <div class="cal-container">
            <div class="cal-header">
                <div>
                    <span class="cal-month">${monthNames[month]}</span>
                    <span class="cal-year">${year}</span>
                </div>
            </div>

            <div class="cal-weekdays">
                <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
            </div>

            <div class="cal-grid">
                ${gridHtml}
            </div>

            <div class="cal-details">
                <div class="detail-date">
                    ${month}月${uiSelectedCalendarDay}日
                    ${uiSelectedCalendarDay === currentDay ? '<span class="detail-badge badge-today">今日</span>' : ''}
                    ${uiSelectedCalendarDay < currentDay ? '<span class="detail-badge">已结束</span>' : ''}
                </div>
                <div class="detail-content">${formatEvent(selectedEvent)}</div>
                <div class="cal-watermark">花</div>
            </div>
        </div>
    `;
}

// 打开全屏日历查看器
function openCalendarFullscreen() {
    const calendarData = currentPhoneData?.calendar;

    if (!calendarData) {
        if (typeof toastr !== 'undefined') {
            toastr.warning('日历数据未找到');
        }
        return;
    }

    const year = calendarData.year || 2012;
    const month = calendarData.month || 4;
    const currentDay = calendarData.current_day || 1;
    const days = calendarData.days || {};

    // 创建全屏遮罩
    const $fullscreen = $(`
        <div id="calendar-fullscreen-viewer" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #fdfbf7;
            z-index: 100000;
            display: flex;
            flex-direction: column;
            animation: calendarFsIn 0.3s ease;
            font-family: 'Shippori Mincho', serif;
        ">
            <!-- 顶部工具栏 -->
            <div class="calendar-fs-toolbar" style="
                padding: 20px 40px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: white;
                box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            ">
                <button id="calendar-fs-close" style="
                    width: 40px; height: 40px;
                    border: none; border-radius: 50%;
                    background: transparent;
                    color: #2c3e50; font-size: 24px;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                "><i class="fas fa-arrow-left"></i></button>
                <div style="font-size: 24px; font-weight: 700; color: #c0392b; letter-spacing: 0.1em;">
                    ${year}年 · ${month}月
                </div>
                <div style="width: 40px;"></div>
            </div>
            
            <!-- 日历容器 -->
            <div id="calendar-fs-container" style="
                flex: 1;
                overflow-y: auto;
                padding: 40px;
                background-image: radial-gradient(#e0e0e0 1px, transparent 1px);
                background-size: 20px 20px;
            ">
                ${generateCalendarContentForFullscreen(year, month, currentDay, days)}
            </div>
            
            <style>
                @keyframes calendarFsIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                #calendar-fs-close:hover {
                    background: rgba(0,0,0,0.05);
                    transform: translateX(-4px);
                }
                #calendar-fs-container::-webkit-scrollbar { width: 8px; }
                #calendar-fs-container::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
            </style>
        </div>
    `);

    $('body').append($fullscreen);

    // 关闭按钮
    $('#calendar-fs-close').on('click', function (e) {
        e.stopPropagation();
        $('#calendar-fullscreen-viewer').fadeOut(200, function () {
            $(this).remove();
        });
    });

    // ESC键关闭
    $(document).on('keydown.calendarFs', function (e) {
        if (e.key === 'Escape') {
            $('#calendar-fullscreen-viewer').fadeOut(200, function () {
                $(this).remove();
            });
            $(document).off('keydown.calendarFs');
        }
    });
}

// 生成全屏日历内容 (保留旧版列表样式但美化)
function generateCalendarContentForFullscreen(year, month, currentDay, days) {
    const monthNames = ['', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const daysInMonth = new Date(year, month, 0).getDate();

    let html = '<div style="max-width: 800px; margin: 0 auto; padding-bottom: 60px;">';

    // 遍历每一天
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEvent = days[day.toString()] || '';
        const isPast = day < currentDay;
        const isCurrent = day === currentDay;
        const isImportant = dayEvent.includes('【');

        // 提取【】中的标签内容
        let importantLabel = '';
        if (isImportant) {
            const match = dayEvent.match(/【([^】]+)】/);
            if (match) {
                importantLabel = match[1];
            }
        }

        let cardBg = 'white';
        let borderColor = 'transparent';
        let dayColor = '#2c3e50';
        let opacity = '1';

        if (isPast) {
            opacity = '0.6';
            dayColor = '#95a5a6';
        } else if (isCurrent) {
            borderColor = '#c0392b';
            dayColor = '#c0392b';
        } else if (isImportant) {
            borderColor = '#d4ac0d';
        }

        html += `
            <div style="
                background: ${cardBg};
                border-left: 4px solid ${borderColor};
                border-radius: 4px;
                padding: 24px;
                margin-bottom: 16px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                opacity: ${opacity};
                display: flex;
                gap: 24px;
            ">
                <div style="
                    display: flex; flex-direction: column; align-items: center;
                    min-width: 60px;
                ">
                    <div style="font-size: 32px; font-weight: 700; color: ${dayColor}; line-height: 1;">${day}</div>
                    <div style="font-size: 12px; color: #95a5a6; margin-top: 4px;">${monthNames[month]}</div>
                </div>
                
                <div style="flex: 1; border-left: 1px solid #eee; padding-left: 24px;">
                    ${isCurrent ? `<div style="display: inline-block; background: #c0392b; color: white; padding: 2px 8px; border-radius: 2px; font-size: 11px; margin-bottom: 8px;">TODAY</div>` : ''}
                    ${importantLabel ? `<div style="display: inline-block; border: 1px solid #c0392b; color: #c0392b; padding: 1px 7px; border-radius: 2px; font-size: 11px; margin-bottom: 8px; margin-left: ${isCurrent ? '8px' : '0'};">${importantLabel}</div>` : ''}
                    
                    <div style="font-size: 15px; color: #34495e; line-height: 1.6;">
                        ${dayEvent || '<span style="color: #bdc3c7; font-style: italic;">No events planned</span>'}
                    </div>
                </div>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

function generateSettingsPanel(data) {
    let html = '<div style="padding: 10px 0;">';

    // 壁纸设置
    html += `
        <div style="margin-bottom: 20px;">
            <div style="font-size: 14px; font-weight: 600; color: #2d3748; margin-bottom: 12px; padding: 0 5px;">
                 壁纸设置
            </div>
            
            <!-- 默认壁纸按钮 -->
            <div class="list-item default-wallpaper-btn" style="cursor: pointer; user-select: none; margin-bottom: 12px;">
                <div class="list-item-header">
                    <span class="list-item-name">
                        <i class="fas fa-undo" style="margin-right: 8px; color: #3B82F6;"></i>
                        恢复默认壁纸
                    </span>
                    <span style="color: #9ca3af; font-size: 12px;">
                        <i class="fas fa-chevron-right"></i>
                    </span>
                </div>
            </div>
            
            <!-- 上传壁纸按钮 -->
            <div class="list-item upload-wallpaper-btn" style="cursor: pointer; user-select: none; margin-bottom: 12px;">
                <div class="list-item-header">
                    <span class="list-item-name">
                        <i class="fas fa-upload" style="margin-right: 8px; color: #10B981;"></i>
                        上传自定义壁纸
                    </span>
                    <span style="color: #9ca3af; font-size: 12px;">
                        <i class="fas fa-chevron-right"></i>
                    </span>
                </div>
            </div>
            
            <!-- 隐藏的文件输入框 -->
            <input type="file" id="wallpaper-upload-input" accept="image/*" style="display: none;">
    `;

    // 遍历壁纸分类
    for (const [categoryName, images] of Object.entries(phoneWpCategories)) {
        const isLoaded = phoneWpLoaded.has(categoryName);

        html += `
            <div class="wallpaper-category" data-category="${categoryName}" style="margin-bottom: 12px;">
                <div class="list-item" style="cursor: pointer; user-select: none;">
                    <div class="list-item-header wallpaper-category-header" data-category="${categoryName}">
                        <span class="list-item-name">
                            <i class="fas fa-image" style="margin-right: 8px; color: #9C27B0;"></i>
                            ${categoryName}
                        </span>
                        <span style="color: #9ca3af; font-size: 12px;">
                            <i class="fas fa-chevron-${isLoaded ? 'up' : 'down'}"></i>
                        </span>
                    </div>
                </div>
                <div class="wallpaper-category-images" data-category="${categoryName}" style="display: ${isLoaded ? 'block' : 'none'}; padding: 10px;">
        `;

        if (isLoaded) {
            // 已加载，显示图片网格
            html += '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">';
            images.forEach((url, index) => {
                html += `
                    <div class="wallpaper-item" data-wallpaper-url="${url}" 
                         style="cursor: pointer; position: relative; padding-bottom: 133%; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <img src="${url}" 
                             style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s;"
                             onmouseover="this.style.transform='scale(1.05)'"
                             onmouseout="this.style.transform='scale(1)'"
                             onerror="this.parentElement.innerHTML='<div style=\\'position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f0f0f0;color:#999;\\'>加载失败</div>'"
                        />
                    </div>
                `;
            });
            html += '</div>';
        } else {
            // 未加载，显示加载提示
            html += `
                <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 13px;">
                    <i class="fas fa-image" style="font-size: 24px; margin-bottom: 8px; opacity: 0.5;"></i>
                    <div>点击展开查看壁纸</div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;
    }

    html += '</div>'; // 结束壁纸设置区域
    html += '</div>';

    return html;
}

// 生成尺寸设置面板
function generateSizeSettingsPanel() {

    // 读取当前设置（从localStorage或使用默认值）
    const currentWidth = parseInt(localStorage.getItem('mobile-phone-width')) || 375;
    const currentHeight = parseInt(localStorage.getItem('mobile-phone-height')) || 667;

    let html = '<div style="padding: 10px 0;">';

    // 尺寸设置
    html += `
        <div style="margin-bottom: 20px;">
            <div style="font-size: 14px; font-weight: 600; color: #2d3748; margin-bottom: 12px; padding: 0 5px;">
                📐 手机尺寸
            </div>
            
            <!-- 宽度设置 -->
            <div class="list-item" style="margin-bottom: 12px;">
                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-size: 13px; color: #4a5568; margin-bottom: 6px; font-weight: 500;">
                        宽度 (Width)
                    </label>
                    <input type="number" id="phone-width-input" value="${currentWidth}" min="320" max="600" step="5"
                        style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 8px; font-size: 14px; box-sizing: border-box; color: #1f2937;">
                    <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">范围: 320-600px</div>
                </div>
            </div>
            
            <!-- 高度设置 -->
            <div class="list-item" style="margin-bottom: 12px;">
                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-size: 13px; color: #4a5568; margin-bottom: 6px; font-weight: 500;">
                        高度 (Height)
                    </label>
                    <input type="number" id="phone-height-input" value="${currentHeight}" min="500" max="900" step="5"
                        style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 8px; font-size: 14px; box-sizing: border-box; color: #1f2937;">
                    <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">范围: 500-900px</div>
                </div>
            </div>
            
            <!-- 预设尺寸 -->
            <div style="margin-bottom: 16px;">
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; font-weight: 500;">常用预设</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                    <button class="phone-size-reset-btn"
                        style="padding: 10px; background: white; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                        恢复默认
                    </button>
                    <button class="phone-size-preset-btn" data-width="390" data-height="844"
                        style="padding: 10px; background: white; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                        iPhone 13<br><span style="color: #9ca3af; font-size: 11px;">390×844</span>
                    </button>
                    <button class="phone-size-preset-btn" data-width="360" data-height="800"
                        style="padding: 10px; background: white; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                        Android<br><span style="color: #9ca3af; font-size: 11px;">360×800</span>
                    </button>
                    <button class="phone-size-preset-btn" data-width="414" data-height="896"
                        style="padding: 10px; background: white; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                        iPhone 11<br><span style="color: #9ca3af; font-size: 11px;">414×896</span>
                    </button>
                </div>
            </div>
            
            <!-- 操作按钮 -->
            <div style="display: flex; gap: 10px;">
                <button class="phone-size-apply-btn" 
                    style="flex: 1; padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                    应用设置
                </button>
            </div>
        </div>
    `;

    html += '</div>';
    return html;
}

// 应用手机尺寸设置
function applyPhoneSize(width, height) {

    const $phoneFrame = $('.mobile-phone-frame');
    if ($phoneFrame.length === 0) {
        return;
    }

    // 设置手机尺寸
    $phoneFrame.css({
        'width': width + 'px',
        'height': height + 'px'
    });

    // 保存到localStorage
    try {
        localStorage.setItem('mobile-phone-width', width);
        localStorage.setItem('mobile-phone-height', height);
    } catch (e) {
    }

    // 重新生成面板以更新显示
    const content = generateSizeSettingsPanel();
    $('#phone-app-body').html(content);

    // 重新绑定事件
    setTimeout(() => {
        const $appBody = $('#phone-app-body');
        $appBody.off('click.phonesize');

        $appBody.on('click.phonesize', '.phone-size-preset-btn', function (e) {
            e.preventDefault();
            const w = $(this).data('width');
            const h = $(this).data('height');
            $('#phone-width-input').val(w);
            $('#phone-height-input').val(h);
        });

        $appBody.on('click.phonesize', '.phone-size-apply-btn', function (e) {
            e.preventDefault();
            const w = parseInt($('#phone-width-input').val());
            const h = parseInt($('#phone-height-input').val());

            if (w < 320 || w > 600 || h < 500 || h > 900) {
                if (typeof toastr !== 'undefined') {
                    toastr.error('尺寸超出范围！');
                }
                return;
            }

            applyPhoneSize(w, h);
        });

        $appBody.on('click.phonesize', '.phone-size-reset-btn', function (e) {
            e.preventDefault();
            resetPhoneSize();
        });
    }, 100);

    // 显示提示
    if (typeof toastr !== 'undefined') {
        toastr.success(`手机尺寸已设置为 ${width}×${height}`);
    }
}

// 恢复默认手机尺寸
function resetPhoneSize() {

    const defaultWidth = 375;
    const defaultHeight = 667;

    applyPhoneSize(defaultWidth, defaultHeight);

    // 清除localStorage中的设置
    try {
        localStorage.removeItem('mobile-phone-width');
        localStorage.removeItem('mobile-phone-height');
    } catch (e) {
    }
}

// 恢复保存的手机尺寸
function restorePhoneSize() {
    try {
        const savedWidth = localStorage.getItem('mobile-phone-width');
        const savedHeight = localStorage.getItem('mobile-phone-height');

        if (savedWidth && savedHeight) {
            const width = parseInt(savedWidth);
            const height = parseInt(savedHeight);

            const $phoneFrame = $('.mobile-phone-frame');
            if ($phoneFrame.length > 0) {
                $phoneFrame.css({
                    'width': width + 'px',
                    'height': height + 'px'
                });
            }
        }
    } catch (e) {
    }
}

// 切换壁纸分类的展开/收起状态
function toggleWallpaperCategory(categoryName) {

    const container = $(`.wallpaper-category-images[data-category="${categoryName}"]`);

    if (container.length === 0) {
        return;
    }

    // 判断当前是展开还是收起
    if (container.is(':visible')) {
        // 收起
        container.slideUp(300);
        // 更新箭头图标
        $(`.wallpaper-category[data-category="${categoryName}"] .fa-chevron-up`)
            .removeClass('fa-chevron-up')
            .addClass('fa-chevron-down');
    } else {
        // 展开
        container.slideDown(300);
        // 更新箭头图标
        $(`.wallpaper-category[data-category="${categoryName}"] .fa-chevron-down`)
            .removeClass('fa-chevron-down')
            .addClass('fa-chevron-up');

        // 如果是第一次展开，加载图片
        if (!phoneWpLoaded.has(categoryName)) {
            phoneWpLoaded.add(categoryName);

            // 显示加载动画
            container.html('<div style="text-align: center; padding: 30px;"><i class="fas fa-circle-notch fa-spin" style="font-size: 24px; color: #9C27B0;"></i><div style="margin-top: 10px; color: #9ca3af; font-size: 13px;">加载中...</div></div>');

            // 模拟加载延迟（实际会因为网络而延迟）
            setTimeout(() => {
                const images = phoneWpCategories[categoryName];
                let imagesHtml = '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">';

                images.forEach((url, index) => {
                    imagesHtml += `
                        <div class="wallpaper-item" data-wallpaper-url="${url}" 
                             style="cursor: pointer; position: relative; padding-bottom: 133%; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); background: #f0f0f0;">
                            <img src="${url}" 
                                 style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; opacity: 0; transition: opacity 0.3s;"
                                 onload="this.style.opacity='1'"
                                 onmouseover="this.style.transform='scale(1.05)'"
                                 onmouseout="this.style.transform='scale(1)'"
                                 onerror="this.parentElement.innerHTML='<div style=\\'position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f0f0f0;color:#999;font-size:11px;\\'>加载失败</div>'"
                            />
                        </div>
                    `;
                });

                imagesHtml += '</div>';
                container.html(imagesHtml);

            }, 500);
        }
    }
}

function setWallpaper(imageUrl) {

    const $screen = $('#mobile-phone-overlay .mobile-phone-screen');

    if ($screen.length === 0) {
        return;
    }

    // 使用 setProperty 和 important 标记来覆盖样式表中的 !important
    const screenElement = $screen[0];
    screenElement.style.setProperty('background-image', `url(${imageUrl})`, 'important');
    screenElement.style.setProperty('background-size', 'cover', 'important');
    screenElement.style.setProperty('background-position', 'center', 'important');
    screenElement.style.setProperty('background-repeat', 'no-repeat', 'important');


    // 保存到localStorage
    try {
        localStorage.setItem('dnf-phone-wallpaper', imageUrl);
    } catch (e) {
    }

    // 显示提示
    if (typeof toastr !== 'undefined') {
        toastr.success('壁纸已更换');
    }
}

// 恢复壁纸
function restoreWallpaper() {
    try {
        const defaultWallpaper = 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%B0%81%E9%9D%A2/%E6%B3%95%E9%9C%B2%E7%89%B9.webp';
        let savedWallpaper = localStorage.getItem('dnf-phone-wallpaper');

        // 验证保存的壁纸URL是否有效（不为空且包含http）
        if (!savedWallpaper || savedWallpaper.trim() === '' || !savedWallpaper.startsWith('http')) {
            console.log('保存的壁纸无效，使用默认壁纸');
            savedWallpaper = defaultWallpaper;
            localStorage.setItem('dnf-phone-wallpaper', defaultWallpaper);
        }

        const $screen = $('#mobile-phone-overlay .mobile-phone-screen');
        if ($screen.length > 0) {
            const screenElement = $screen[0];
            screenElement.style.setProperty('background-image', `url(${savedWallpaper})`, 'important');
            screenElement.style.setProperty('background-size', 'cover', 'important');
            screenElement.style.setProperty('background-position', 'center', 'important');
            screenElement.style.setProperty('background-repeat', 'no-repeat', 'important');

            console.log('已设置壁纸:', savedWallpaper);
        }
    } catch (e) {
        console.error('恢复壁纸失败:', e);
    }
}

// 上传自定义壁纸
function uploadCustomWallpaper(file) {

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        if (typeof toastr !== 'undefined') {
            toastr.error('请选择图片文件');
        }
        return;
    }

    // 验证文件大小（限制为10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        if (typeof toastr !== 'undefined') {
            toastr.error('图片文件大小不能超过10MB');
        }
        return;
    }

    // 使用FileReader读取图片
    const reader = new FileReader();

    reader.onload = function (e) {
        const imageDataUrl = e.target.result;

        // 创建Image对象验证图片
        const img = new Image();
        img.onload = function () {

            // 设置为壁纸
            setWallpaper(imageDataUrl);

            if (typeof toastr !== 'undefined') {
                toastr.success('自定义壁纸已上传');
            }

            // 重置文件输入框
            $('#wallpaper-upload-input').val('');
        };

        img.onerror = function () {
            if (typeof toastr !== 'undefined') {
                toastr.error('图片加载失败，请选择有效的图片文件');
            }
            // 重置文件输入框
            $('#wallpaper-upload-input').val('');
        };

        img.src = imageDataUrl;
    };

    reader.onerror = function (e) {
        if (typeof toastr !== 'undefined') {
            toastr.error('文件读取失败');
        }
        // 重置文件输入框
        $('#wallpaper-upload-input').val('');
    };

    // 读取文件为DataURL
    reader.readAsDataURL(file);
}

// 重置为默认壁纸
function resetWallpaper() {

    const defaultWallpaper = 'https://gitgud.io/Rown/dnf/-/raw/master/%E5%B0%81%E9%9D%A2/%E6%B3%95%E9%9C%B2%E7%89%B9.webp';

    const $screen = $('#mobile-phone-overlay .mobile-phone-screen');

    if ($screen.length === 0) {
        return;
    }

    // 设置默认壁纸
    const screenElement = $screen[0];
    screenElement.style.setProperty('background-image', `url(${defaultWallpaper})`, 'important');
    screenElement.style.setProperty('background-size', 'cover', 'important');
    screenElement.style.setProperty('background-position', 'center', 'important');
    screenElement.style.setProperty('background-repeat', 'no-repeat', 'important');


    // 保存到localStorage
    try {
        localStorage.setItem('dnf-phone-wallpaper', defaultWallpaper);
    } catch (e) {
    }

    // 显示提示
    if (typeof toastr !== 'undefined') {
        toastr.success('已恢复默认壁纸');
    }
}

// 打开全屏壁纸查看器
function openWallpaperFullscreen() {

    // 获取当前壁纸URL
    const savedWallpaper = localStorage.getItem('dnf-phone-wallpaper');

    if (!savedWallpaper) {
        if (typeof toastr !== 'undefined') {
            toastr.info('当前使用默认壁纸，无法查看大图');
        }
        return;
    }

    // 设置图片src并显示查看器
    const $viewer = $('#wallpaper-fullscreen-viewer');
    const $img = $('#wallpaper-fullscreen-img');

    $img.attr('src', savedWallpaper);
    $viewer.addClass('active');

}

// 关闭全屏壁纸查看器
function closeWallpaperFullscreen() {

    const $viewer = $('#wallpaper-fullscreen-viewer');
    $viewer.removeClass('active');

    // 隐藏"设为壁纸"按钮和导航控件
    $('#cg-set-wallpaper-btn').hide().removeData('cg-url');
    $('#cg-nav-controls').hide();
    $('#cg-index-display').hide();

    // 清除当前CG信息
    currentCGInfo = null;

    // 清空图片src节省内存
    setTimeout(() => {
        if (!$viewer.hasClass('active')) {
            $('#wallpaper-fullscreen-img').attr('src', '');
        }
    }, 300);
}

/**
 * 全屏显示CG图片（复用壁纸查看器）
 */
let currentCGInfo = null; // 存储当前CG信息用于切换

function showCGFullscreen(imgUrl, characterName, sceneType, currentIndex) {
    const $viewer = $('#wallpaper-fullscreen-viewer');
    const $img = $('#wallpaper-fullscreen-img');
    const $setWallpaperBtn = $('#cg-set-wallpaper-btn');
    const $navControls = $('#cg-nav-controls');
    const $indexDisplay = $('#cg-index-display');

    // 获取该场景的最大图片数
    const maxCount = CG_LIST[characterName]?.[sceneType] || 1;
    const index = currentIndex || 1;

    // 存储当前CG信息
    currentCGInfo = {
        character: characterName,
        scene: sceneType,
        current: index,
        max: maxCount
    };

    $img.attr('src', imgUrl);
    $viewer.addClass('active');

    // 显示导航控件和设为壁纸按钮
    $setWallpaperBtn.data('cg-url', imgUrl).show();
    $navControls.show();

    // 更新索引显示
    $indexDisplay.text(`${index} / ${maxCount}`).show();

    // 更新按钮状态
    updateCGNavButtons();
}

function updateCGNavButtons() {
    if (!currentCGInfo) return;

    const $prevBtn = $('#cg-prev-btn');
    const $nextBtn = $('#cg-next-btn');

    // 禁用/启用按钮
    $prevBtn.prop('disabled', currentCGInfo.current <= 1)
        .css('opacity', currentCGInfo.current <= 1 ? '0.4' : '1');
    $nextBtn.prop('disabled', currentCGInfo.current >= currentCGInfo.max)
        .css('opacity', currentCGInfo.current >= currentCGInfo.max ? '0.4' : '1');
}

function switchCGImage(direction) {
    if (!currentCGInfo) return;

    let newIndex = currentCGInfo.current;
    if (direction === 'prev' && newIndex > 1) {
        newIndex--;
    } else if (direction === 'next' && newIndex < currentCGInfo.max) {
        newIndex++;
    } else {
        return; // 已到边界
    }

    currentCGInfo.current = newIndex;

    // 更新图片
    const newUrl = getCGImageUrl(currentCGInfo.character, currentCGInfo.scene, newIndex);
    const $img = $('#wallpaper-fullscreen-img');

    $img.css('opacity', '0.5');
    $img.attr('src', newUrl);
    $img.on('load.cgswitch', function () {
        $img.css('opacity', '1').off('load.cgswitch');
    });

    // 更新设为壁纸按钮的URL
    $('#cg-set-wallpaper-btn').data('cg-url', newUrl);

    // 更新索引显示
    $('#cg-index-display').text(`${newIndex} / ${currentCGInfo.max}`);

    // 更新按钮状态
    updateCGNavButtons();
}

// ==================== 清理函数 ====================
function cleanupMobilePhone() {
    // 移除触发按钮拖动事件监听
    $('#mobile-trigger-btn').off('click');

    //  移除窗口resize监听
    $(window).off('resize.mobilePhone');

    // 移除手机界面拖动事件监听（原生事件）
    const dragHandle = document.getElementById('phone-drag-handle');
    if (dragHandle) {
        dragHandle.removeEventListener('pointerdown', handlePhoneDragStart);
        dragHandle.removeEventListener('pointermove', handlePhoneDragMove);
        dragHandle.removeEventListener('pointerup', handlePhoneDragEnd);
        dragHandle.removeEventListener('pointercancel', handlePhoneDragEnd);
    }

    // 重置拖动状态
    isDragging = false;
    hasMoved = false;
    isPhoneDragging = false;

    // 重置置顶状态
    isPinned = false;

    $('#mobile-trigger-btn').remove();
    $('#mobile-phone-overlay').remove();
    $('#mobile-phone-styles').remove();
}

// ==================== 全局函数暴露 ====================
if (typeof window !== 'undefined') {
    window.initializeMobilePhone = initializeMobilePhone;
    window.cleanupMobilePhone = cleanupMobilePhone;
    window.openMobilePhone = openMobilePhone;
    window.closeMobilePhone = closeMobilePhone;
    window.togglePin = togglePin;

    // 壁纸相关函数
    window.toggleWallpaperCategory = toggleWallpaperCategory;
    window.setWallpaper = setWallpaper;
    window.resetWallpaper = resetWallpaper;
    window.uploadCustomWallpaper = uploadCustomWallpaper;
    window.openWallpaperFullscreen = openWallpaperFullscreen;
    window.closeWallpaperFullscreen = closeWallpaperFullscreen;

    // 聊天相关函数
    window.openChatPanel = openChatPanel;
    window.closeChatPanel = closeChatPanel;
    window.renderChatMessages = renderChatMessages;
    window.sendChatMessage = sendChatMessage;

    // 图片处理函数
    window.viewFullImage = viewFullImage;
    window.processMessageImages = processMessageImages;

    // 论坛相关函数
    window.phoneGenerateForum = async function () {
        const manager = window.phoneForumManager;

        if (!manager) {
            alert('论坛管理器未初始化，请刷新页面重试');
            return;
        }

        //  设置生成状态标记
        isForumGenerating = true;

        // 显示加载状态
        const $generateBtn = $('.phone-forum-generate-btn');
        const originalBtnHtml = $generateBtn.html();

        // 更新按钮为沙漏样式
        $generateBtn.prop('disabled', true);
        $generateBtn.html('<i class="fas fa-hourglass-half fa-spin"></i>');
        $generateBtn.css({
            'background': '#9E9E9E',
            'cursor': 'not-allowed'
        });

        // 在标题左侧添加"正在刷新中"提示
        const $titleContainer = $('.phone-forum-generate-btn').parent().prev();
        $titleContainer.find('.forum-loading-tip').remove(); // 移除旧的提示
        $titleContainer.append('<span class="forum-loading-tip" style="font-size: 12px; color: #FF9800; white-space: nowrap;"><i class="fas fa-hourglass-half fa-spin"></i> 正在刷新中</span>');

        if (typeof toastr !== 'undefined') {
            toastr.info('正在生成论坛内容...', '论坛');
        }

        try {
            await manager.generateForumContent();

            //  检查手机界面是否还打开着（用户可能在生成过程中关闭了界面）
            const $overlay = $('#mobile-phone-overlay');
            const isPhoneOpen = $overlay.hasClass('active');

            //  清除生成状态标记
            isForumGenerating = false;

            if (!isPhoneOpen) {
                return;
            }

            //  检查当前是否还在论坛面板（用户可能切换到其他应用）
            if (currentPanel !== 'forum') {
                return;
            }

            $('#phone-app-body').html(generateForumPanel());

            if (typeof toastr !== 'undefined') {
                toastr.success('论坛内容已更新！', '论坛');
            }
        } catch (error) {

            //  清除生成状态标记
            isForumGenerating = false;

            //  检查手机界面是否还打开着
            const $overlay = $('#mobile-phone-overlay');
            const isPhoneOpen = $overlay.hasClass('active');

            if (!isPhoneOpen) {
                return;
            }

            // 恢复按钮状态（只有在手机界面还打开时才恢复）
            const $btn = $('.phone-forum-generate-btn');
            $btn.prop('disabled', false);
            $btn.html(originalBtnHtml);
            $btn.css({
                'background': '#4CAF50',
                'cursor': 'pointer'
            });

            // 移除加载提示
            $('.forum-loading-tip').remove();

            if (typeof toastr !== 'undefined') {
                const errorMessage = error?.message || String(error) || '未知错误';
                const errorMsg = errorMessage.length > 200 ? errorMessage.substring(0, 200) + '...' : errorMessage;
                toastr.error(errorMsg, '论坛生成失败', {
                    timeOut: 10000,
                    extendedTimeOut: 5000,
                    closeButton: true,
                    progressBar: true
                });
            } else {
                alert('论坛生成失败:\n' + (error?.message || String(error) || '未知错误'));
            }
        }
    };

    window.resetMobileTriggerPosition = function () {
        localStorage.removeItem('mobile-trigger-btn-position');
        $('#mobile-trigger-btn').css({
            left: 'auto',
            top: 'auto',
            right: '20px',
            bottom: '20px'
        });
    };

    window.resetPanelMemory = function () {
        localStorage.removeItem('mobile-last-panel');
        if (typeof toastr !== 'undefined') {
            toastr.success('已清除面板记忆');
        }
    };
    window.testMobileDrag = function () {
        const rect = $('#mobile-trigger-btn')[0]?.getBoundingClientRect();

        // 检查 localStorage
        const saved = localStorage.getItem('mobile-trigger-btn-position');
        if (saved) {
        } else {
        }
    };

    window.clearMobilePosition = function () {
        localStorage.removeItem('mobile-trigger-btn-position');
    };

    window.fixMobilePhone = function () {
        // 清理并重新初始化
        cleanupMobilePhone();
        setTimeout(() => {
            initializeMobilePhone();
        }, 100);
    };

    //  调试工具：测试群聊消息解析
    window.testGroupMessageParsing = function (testMessages) {

        const regex = /\[群聊消息\|([^|]*)\|([^|]*)\|([^|]*)\|([^\]]*)\]/g;

        const messages = testMessages || [
            '[群聊消息|745816|夏目|文字|汪！]',
            '[群聊消息|745816|夏目|语音|（一段急促又欢快的犬吠，还夹杂着兴奋的呜咽声）]',
            '[群聊消息|745816|夏目|文字|要！！夏目要吃！]',
            '[群聊消息|745816|白团|文字|。]'
        ];

        messages.forEach((text, i) => {
            regex.lastIndex = 0;
            const match = regex.exec(text);
            if (match) {
            } else {
            }
        });
    };

}

// ==================== 实时刷新功能 ====================
/**
 * 设置消息事件监听器
 * 参考 mobile-master/app/message-app.js 的实现
 */
function setupMessageEventListener() {
    if (isEventListening) {
        console.log('[论坛自动生成] 事件监听器已存在，跳过设置');
        return;
    }


    // 多种检测方法（参考 mobile-master）
    const detectionMethods = [
        // 方法1: SillyTavern.getContext()
        () => {
            if (window.SillyTavern && typeof window.SillyTavern.getContext === 'function') {
                const context = window.SillyTavern.getContext();
                if (context && context.eventSource && typeof context.eventSource.on === 'function' && context.event_types) {
                    return {
                        eventSource: context.eventSource,
                        event_types: context.event_types,
                        foundIn: 'SillyTavern.getContext()'
                    };
                }
            }
            return null;
        },

        // 方法2: 全局 eventOn 函数
        () => {
            if (typeof eventOn === 'function' && typeof tavern_events !== 'undefined' && tavern_events.MESSAGE_RECEIVED) {
                return {
                    eventSource: { on: eventOn },
                    event_types: tavern_events,
                    foundIn: 'global eventOn'
                };
            }
            return null;
        },

        // 方法3: 父窗口 eventSource
        () => {
            if (window.parent && window.parent.eventSource && typeof window.parent.eventSource.on === 'function') {
                if (window.parent.event_types && window.parent.event_types.MESSAGE_RECEIVED) {
                    return {
                        eventSource: window.parent.eventSource,
                        event_types: window.parent.event_types,
                        foundIn: 'parent.eventSource'
                    };
                }
            }
            return null;
        }
    ];

    // 尝试各种检测方法
    for (let i = 0; i < detectionMethods.length; i++) {
        try {
            const result = detectionMethods[i]();
            if (result && result.eventSource && result.event_types) {

                // 绑定消息接收事件
                if (result.event_types.MESSAGE_RECEIVED) {
                    result.eventSource.on(result.event_types.MESSAGE_RECEIVED, onMessageReceived);
                    isEventListening = true;
                    console.log('[论坛自动生成] 事件监听器绑定成功，来源:', result.foundIn);

                    // 初始化消息计数
                    updateMessageCount();

                    // 同时初始化论坛自动生成的计数器
                    if (window.phoneForumManager && window.phoneForumManager.apiConfig) {
                        window.phoneForumManager.apiConfig.resetAutoGenerateCounter();
                    }

                    return;
                }
            }
        } catch (error) {
            console.error('[论坛自动生成] 检测方法', i, '失败:', error);
        }
    }

    // 如果所有方法都失败，启动轮询作为降级方案
    console.log('[论坛自动生成] 所有事件检测方法失败，启动轮询方案');
    startRefreshPolling();
}

/**
 * 处理消息接收事件
 */
function onMessageReceived(messageId) {
    try {
        console.log('[论坛自动生成] 收到消息事件, messageId:', messageId);

        // 检查消息数量变化
        const currentCount = getCurrentMessageCount();
        console.log('[论坛自动生成] 消息数量:', { currentCount, lastMessageCount });

        if (currentCount > lastMessageCount) {
            lastMessageCount = currentCount;

            // 刷新信息面板
            refreshMessagesPanel();

            // 检查是否需要自动生成论坛
            checkAutoGenerateForum();
        }
    } catch (error) {
        console.error('[论坛自动生成] onMessageReceived错误:', error);
    }
}

/**
 * 检查并触发自动生成论坛
 */
async function checkAutoGenerateForum() {
    try {
        console.log('[论坛自动生成] 开始检查...');

        const manager = window.phoneForumManager;
        if (!manager || !manager.apiConfig) {
            console.log('[论坛自动生成] manager或apiConfig不存在');
            return;
        }

        const apiConfig = manager.apiConfig;

        // 检查是否应该自动生成
        if (!apiConfig.shouldAutoGenerate()) {
            console.log('[论坛自动生成] shouldAutoGenerate返回false，跳过');
            return;
        }

        // 增加消息计数并检查是否达到阈值
        const shouldGenerate = apiConfig.incrementMessageCount();

        if (shouldGenerate) {
            console.log('[论坛自动生成] 达到阈值，开始自动生成论坛...');

            // 设置生成状态
            apiConfig.autoGenerateState.isGenerating = true;
            isForumGenerating = true;  // 设置全局生成状态

            // 如果当前正在查看论坛面板，立即刷新显示生成中状态
            if (currentPanel === 'forum') {
                $('#phone-app-body').html(generateForumPanel());
            }

            // 显示开始生成的通知
            if (apiConfig.settings.autoGenerate.showNotification && typeof toastr !== 'undefined') {
                toastr.info(
                    `已达到 ${apiConfig.settings.autoGenerate.threshold} 楼阈值，正在自动生成论坛内容...`,
                    '📰 论坛自动生成',
                    { timeOut: 3000 }
                );
            }

            try {
                // 调用论坛生成
                await manager.generateForumContent();

                // 重置计数器
                apiConfig.resetAutoGenerateCounter();

                // 显示成功通知
                if (apiConfig.settings.autoGenerate.showNotification && typeof toastr !== 'undefined') {
                    toastr.success(
                        '论坛内容已自动更新',
                        '📰 论坛生成完成',
                        {
                            timeOut: 5000,
                            onclick: function () {
                                // 点击通知时打开论坛面板
                                if (window.openMobilePhone) {
                                    window.openMobilePhone('forum');
                                }
                            }
                        }
                    );
                }

                // 如果当前正在查看论坛面板，刷新显示
                if (currentPanel === 'forum') {
                    $('#phone-app-body').html(generateForumPanel());
                }

                console.log('[论坛自动生成] 自动生成完成');

            } catch (error) {
                console.error('[论坛自动生成] 生成失败:', error);

                if (apiConfig.settings.autoGenerate.showNotification && typeof toastr !== 'undefined') {
                    toastr.error(
                        '自动生成论坛失败: ' + (error.message || '未知错误'),
                        '📰 论坛生成失败',
                        { timeOut: 5000 }
                    );
                }
            } finally {
                // 重置生成状态
                apiConfig.autoGenerateState.isGenerating = false;
                isForumGenerating = false;  // 重置全局生成状态

                // 刷新论坛面板，恢复按钮状态
                if (currentPanel === 'forum') {
                    $('#phone-app-body').html(generateForumPanel());
                }
            }
        }
    } catch (error) {
        console.error('[论坛自动生成] 检查失败:', error);
    }
}

/**
 * 获取当前消息数量
 */
function getCurrentMessageCount() {
    try {
        // 在 iframe 环境中需要从 parent 获取 SillyTavern
        let targetWindow = window;
        if (window.parent && window.parent !== window) {
            try {
                if (window.parent.SillyTavern) {
                    targetWindow = window.parent;
                }
            } catch (e) {
            }
        }

        if (targetWindow.SillyTavern && targetWindow.SillyTavern.getContext) {
            const context = targetWindow.SillyTavern.getContext();
            return context.chat ? context.chat.length : 0;
        }
    } catch (error) {
    }
    return 0;
}

/**
 * 更新消息计数
 */
function updateMessageCount() {
    lastMessageCount = getCurrentMessageCount();
}

/**
 * 刷新信息面板
 */
function refreshMessagesPanel() {
    try {
        // 只在打开信息面板时刷新
        if (currentPanel === 'messages' && currentPhoneData) {

            // 重新生成面板内容
            const content = generateMessagesPanel(currentPhoneData);
            $('#phone-app-body').html(content);

            // 重新绑定事件
            bindMessagePanelEvents();

        }
    } catch (error) {
    }
}

/**
 * 启动轮询刷新（降级方案）
 */
function startRefreshPolling() {
    // 清除旧的轮询
    if (refreshPollingInterval) {
        clearInterval(refreshPollingInterval);
    }

    console.log('[论坛自动生成] 启动轮询刷新，间隔5秒');

    refreshPollingInterval = setInterval(() => {
        const currentCount = getCurrentMessageCount();

        if (currentCount > lastMessageCount) {
            console.log('[论坛自动生成] 轮询检测到新消息:', { currentCount, lastMessageCount });
            lastMessageCount = currentCount;
            refreshMessagesPanel();

            // 检查是否需要自动生成论坛
            checkAutoGenerateForum();
        }
    }, 5000); // 每5秒检查一次
}

/**
 * 停止刷新机制
 */
function stopRefreshMechanism() {
    // 清除轮询
    if (refreshPollingInterval) {
        clearInterval(refreshPollingInterval);
        refreshPollingInterval = null;
    }

    // 清除聊天刷新
    if (chatPanelRefreshInterval) {
        clearInterval(chatPanelRefreshInterval);
        chatPanelRefreshInterval = null;
    }

    // 标记停止监听
    isEventListening = false;
}

/**
 * 绑定信息面板事件
 */
function bindMessagePanelEvents() {
    // 绑定联系人点击事件
    $('.contact-item').off('click').on('click', function () {
        const contactType = $(this).data('type');
        const contactId = $(this).data('id');
        const contactName = $(this).data('name');
        const isGroup = contactType === 'group';
        const members = $(this).data('members') || '';


        // 打开聊天面板
        openChatPanel(contactId, contactName, isGroup, members);
    });
}

// ==================== 群聊管理功能 ====================
/**
 * 移除thinking标签包裹的内容
 * 参考 mobile-master/app/message-app.js
 */
function removeThinkingTags(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }

    // 移除 <think>...</think> 和 <thinking>...</thinking> 标签及其内容
    const thinkingTagRegex = /<think>[\s\S]*?<\/think>|<thinking>[\s\S]*?<\/thinking>/gi;
    return text.replace(thinkingTagRegex, '');
}

/**
 * 检查格式标记是否在thinking标签内
 * 参考 mobile-master/app/message-app.js
 */
function isPatternInsideThinkingTags(text, patternStart, patternEnd) {
    if (!text || typeof text !== 'string') {
        return false;
    }

    const thinkingTagRegex = /<think>[\s\S]*?<\/think>|<thinking>[\s\S]*?<\/thinking>/gi;
    let match;

    while ((match = thinkingTagRegex.exec(text)) !== null) {
        const thinkStart = match.index;
        const thinkEnd = match.index + match[0].length;

        // 检查格式标记是否完全在thinking标签内
        if (patternStart >= thinkStart && patternEnd <= thinkEnd) {
            return true;
        }
    }

    return false;
}

/**
 * 只移除不在thinking标签内的格式标记
 * 参考 mobile-master/app/message-app.js
 */
function removePatternOutsideThinkingTags(text, pattern) {
    if (!text || typeof text !== 'string') {
        return text;
    }

    // 创建新的正则表达式实例，避免lastIndex问题
    const newPattern = new RegExp(pattern.source, pattern.flags);
    let result = text;
    const replacements = [];
    let match;

    // 找到所有匹配
    while ((match = newPattern.exec(text)) !== null) {
        const matchStart = match.index;
        const matchEnd = match.index + match[0].length;

        // 检查这个匹配是否在thinking标签内
        if (!isPatternInsideThinkingTags(text, matchStart, matchEnd)) {
            replacements.push({
                start: matchStart,
                end: matchEnd,
                text: match[0]
            });
        }
    }

    // 从后往前替换，避免索引问题
    replacements.reverse().forEach(replacement => {
        result = result.substring(0, replacement.start) + result.substring(replacement.end);
    });

    return result;
}

/**
 * 删除群聊
 * 完整参考 mobile-master/app/message-app.js 的实现
 * @param {string} groupId - 群聊ID
 * @param {string} groupName - 群聊名称
 */
async function deleteGroup(groupId, groupName) {

    const confirmed = await showCustomConfirm({
        title: '删除群聊',
        message: '这会删除消息中的群聊格式标记和相关的消息记录。',
        icon: '',
        itemInfo: {
            name: groupName,
            description: `群聊 ID: ${groupId}`,
            icon: '🎁'
        },
        confirmText: '确认删除',
        cancelText: '取消'
    });

    if (!confirmed) {
        return;
    }

    try {
        const targetWindow = window.parent || window;

        // 检查 SillyTavern API
        if (!targetWindow.SillyTavern || typeof targetWindow.SillyTavern.getContext !== 'function') {
            throw new Error('SillyTavern API 不可用');
        }

        const context = targetWindow.SillyTavern.getContext();
        if (!context || !context.chat || !Array.isArray(context.chat)) {
            throw new Error('聊天上下文不可用');
        }

        if (typeof toastr !== 'undefined') {
            toastr.info('正在查找相关群聊消息...');
        }


        // 查找包含该群聊信息的消息
        const messagesToProcess = [];

        // 创建所有可能包含群聊ID的格式正则表达式
        // 只要[]内任何位置包含目标ID就匹配
        const allGroupFormatsRegex = new RegExp(`\\[[^\\]]*\\|${groupId}\\|[^\\]]*\\]|\\[[^\\]]*\\|${groupId}\\]`, 'g');

        context.chat.forEach((message, index) => {
            if (message.mes && typeof message.mes === 'string') {
                let messageModified = false;
                let newMessageContent = message.mes;

                // 预处理：移除thinking标签包裹的内容进行检测
                const messageForCheck = removeThinkingTags(message.mes);

                // 检查是否包含群聊格式标记（在移除thinking标签后的内容中）
                allGroupFormatsRegex.lastIndex = 0;
                if (allGroupFormatsRegex.test(messageForCheck)) {
                    // 只移除不在thinking标签内的群聊格式标记
                    newMessageContent = removePatternOutsideThinkingTags(message.mes, allGroupFormatsRegex);
                    messageModified = newMessageContent !== message.mes;
                    if (messageModified) {
                    }
                }

                if (messageModified) {
                    messagesToProcess.push({
                        index: index,
                        id: message.id || index,
                        action: newMessageContent.trim().length > 0 ? 'modify' : 'delete',
                        reason: '移除群聊格式标记',
                        originalContent: message.mes,
                        newContent: newMessageContent.trim(),
                        preview: message.mes.length > 50 ? message.mes.substring(0, 50) + '...' : message.mes
                    });
                }

                // 重置正则表达式
                allGroupFormatsRegex.lastIndex = 0;
            }
        });

        if (messagesToProcess.length === 0) {
            if (typeof toastr !== 'undefined') {
                toastr.warning('未找到相关群聊记录');
            }
            return;
        }

        if (typeof toastr !== 'undefined') {
            toastr.info(`找到 ${messagesToProcess.length} 条相关消息，正在处理...`);
        }

        // 从后往前处理，避免索引变化
        const sortedMessages = messagesToProcess.sort((a, b) => b.index - a.index);
        let processedCount = 0;

        for (const msgInfo of sortedMessages) {
            try {
                if (msgInfo.action === 'delete') {
                    // 直接从数组中删除
                    context.chat.splice(msgInfo.index, 1);
                } else if (msgInfo.action === 'modify') {
                    // 修改消息内容
                    context.chat[msgInfo.index].mes = msgInfo.newContent;
                }
                processedCount++;
            } catch (error) {
            }
        }

        // 保存聊天
        if (typeof context.saveChat === 'function') {
            await context.saveChat();
        }

        if (processedCount > 0) {
            if (typeof toastr !== 'undefined') {
                toastr.success(`成功处理群聊 "${groupName}" 相关的 ${processedCount} 条消息`);
            }

            // 关闭聊天面板并刷新消息列表
            closeChatPanel();

            setTimeout(() => {
                if (currentPhoneData) {
                    const content = generateMessagesPanel(currentPhoneData);
                    $('#phone-app-body').html(content);
                }
            }, 500);
        } else {
            if (typeof toastr !== 'undefined') {
                toastr.error('处理失败');
            }
        }

    } catch (error) {
        if (typeof toastr !== 'undefined') {
            toastr.error('删除群聊失败: ' + error.message);
        }
    }
}

/**
 * 打开创建群聊面板
 * 参考 mobile-master/app/message-app.js
 */
function openCreateGroupPanel() {

    const content = generateCreateGroupPanel();

    // 更新面板标题和内容
    $('#phone-app-title').text(' 创建群聊');
    $('#phone-app-body').html(content);
    $('#phone-detail-panel').addClass('active');

    // 保存当前面板状态
    currentPanel = 'create-group';

    // 绑定事件
    bindCreateGroupEvents();
}

/**
 * 生成创建群聊面板内容
 */
function generateCreateGroupPanel() {
    // 获取所有好友用于选择
    const availableFriends = getAvailableFriendsForGroup();

    return `
        <div class="create-group-container" style="padding: 16px;">
            <!-- 群聊名称 -->
            <div class="form-group" style="margin-bottom: 16px;">
                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #374151;">
                    <span style="color: #ef4444;">*</span> 群聊名称
                </label>
                <input type="text" id="group-name-input" placeholder="请输入群聊名称" 
                    style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: all 0.2s; background: #ffffff; color: #1f2937;"
                    onfocus="this.style.borderColor='#667eea'; this.style.background='#ffffff'" onblur="this.style.borderColor='#e5e7eb'">
            </div>
            
            <!-- 群聊ID -->
            <div class="form-group" style="margin-bottom: 16px;">
                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #374151;">
                    <span style="color: #ef4444;">*</span> 群聊ID
                </label>
                <input type="number" id="group-id-input" placeholder="请输入群聊ID（6位数字）" 
                    style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: all 0.2s; background: #ffffff; color: #1f2937;"
                    onfocus="this.style.borderColor='#667eea'; this.style.background='#ffffff'" onblur="this.style.borderColor='#e5e7eb'">
            </div>
            
            <!-- 成员选择 -->
            <div class="form-group" style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <label style="font-size: 13px; font-weight: 600; color: #374151;">
                        <span style="color: #ef4444;">*</span> 选择成员
                    </label>
                    <button id="select-all-friends-btn" 
                        style="padding: 4px 12px; background: #f3f4f6; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; color: #6b7280; font-weight: 500;"
                        onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
                        全选
                    </button>
                </div>
                <div id="friends-selection-list" style="max-height: 200px; overflow-y: auto; border: 2px solid #e5e7eb; border-radius: 8px; padding: 8px;">
                    ${availableFriends.length > 0 ? generateFriendsSelectionList(availableFriends) : '<div style="text-align: center; padding: 20px; color: #9ca3af;">暂无可选好友</div>'}
                </div>
            </div>
            
            <!-- 已选成员 -->
            <div class="form-group" style="margin-bottom: 20px;">
                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #374151;">
                    已选成员
                </label>
                <div id="selected-members-container" style="display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; background: #f9fafb; border-radius: 8px; min-height: 60px;">
                    <div class="selected-member-tag" data-member="我" style="display: inline-flex; align-items: center; padding: 6px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 16px; font-size: 13px; font-weight: 500;">
                        <span>我 (群主)</span>
                    </div>
                </div>
            </div>
            
            <!-- 创建按钮 -->
            <button id="create-group-submit-btn" 
                style="width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);"
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(102, 126, 234, 0.4)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(102, 126, 234, 0.3)'">
                <span style="font-size: 16px; margin-right: 6px;"></span> 创建群聊
            </button>
            
            <!-- 提示信息 -->
            <div style="margin-top: 16px; padding: 12px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <div style="font-size: 12px; color: #1e40af; line-height: 1.6;">
                    <div style="margin-bottom: 6px;"> <strong>提示：</strong></div>
                    <div>• 创建后会自动编辑到最新楼层</div>
                    <div>• 格式：[群聊|群名|群ID|成员列表]</div>
                    <div>• 至少选择一个成员</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 获取可选好友列表
 */
function getAvailableFriendsForGroup() {
    const friends = [];

    try {
        // 从MVU变量中获取好友
        const relationshipSource = getRelationshipDataSource(currentPhoneData);
        if (relationshipSource) {
            getRelationshipKeys(relationshipSource).forEach(studentKey => {
                const friend = relationshipSource[studentKey];
                if (!friend || typeof friend !== 'object') return;
                const displayName = restoreEraText(studentKey);
                friends.push({
                    id: `friend_${studentKey}`,
                    name: displayName,
                    identity: ''
                });
            });
        }

        // 从聊天记录中提取好友
        const chatFriends = extractFriendsFromChat();
        chatFriends.forEach(chatFriend => {
            // 检查是否已存在
            const exists = friends.some(f => f.id === chatFriend.id || f.name === chatFriend.name);
            if (!exists) {
                friends.push({
                    id: chatFriend.id,
                    name: chatFriend.name,
                    identity: '聊天记录'
                });
            }
        });

    } catch (error) {
    }

    return friends;
}

/**
 * 生成好友选择列表
 */
function generateFriendsSelectionList(friends) {
    return friends.map(friend => `
        <div class="friend-selection-item" data-friend-id="${friend.id}" data-friend-name="${friend.name}"
            style="display: flex; align-items: center; padding: 8px; margin-bottom: 4px; border-radius: 6px; cursor: pointer; transition: all 0.2s;"
            onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
            <input type="checkbox" class="friend-checkbox" value="${friend.id}" 
                style="margin-right: 10px; width: 16px; height: 16px; cursor: pointer;">
            <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 500; color: #1f2937;">${friend.name}</div>
                <div style="font-size: 11px; color: #9ca3af; margin-top: 2px;">${friend.identity}</div>
            </div>
        </div>
    `).join('');
}

/**
 * 绑定创建群聊相关事件
 */
function bindCreateGroupEvents() {
    // 全选按钮
    $('#select-all-friends-btn').off('click').on('click', function () {
        const $checkboxes = $('.friend-checkbox');
        const allChecked = $checkboxes.toArray().every(cb => cb.checked);

        $checkboxes.prop('checked', !allChecked);
        $(this).text(allChecked ? '全选' : '取消全选');

        // 更新已选成员显示
        updateSelectedMembers();
    });

    // 好友选择
    $('.friend-checkbox').off('change').on('change', function () {
        updateSelectedMembers();
    });

    // 创建按钮
    $('#create-group-submit-btn').off('click').on('click', function () {
        createGroup();
    });

    //  移除成员按钮（使用事件委托）
    $('body').off('click.removeMember').on('click.removeMember', '.remove-member-btn', function (e) {
        e.stopPropagation();
        const friendId = $(this).data('friend-id');
        removeMember(friendId);
    });
}

/**
 * 更新已选成员显示
 */
function updateSelectedMembers() {
    const $container = $('#selected-members-container');
    const $checkboxes = $('.friend-checkbox:checked');

    // 保留"我"标签
    $container.html(`
        <div class="selected-member-tag" data-member="我" style="display: inline-flex; align-items: center; padding: 6px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 16px; font-size: 13px; font-weight: 500;">
            <span>我 (群主)</span>
        </div>
    `);

    // 添加选中的好友
    $checkboxes.each(function () {
        const $item = $(this).closest('.friend-selection-item');
        const friendName = $item.data('friend-name');
        const friendId = $item.data('friend-id');

        $container.append(`
            <div class="selected-member-tag" data-member="${friendId}" style="display: inline-flex; align-items: center; padding: 6px 12px; background: #3b82f6; color: white; border-radius: 16px; font-size: 13px; font-weight: 500;">
                <span>${friendName}</span>
                <span class="remove-member-btn" data-friend-id="${friendId}" style="margin-left: 6px; cursor: pointer; opacity: 0.8;">✕</span>
            </div>
        `);
    });
}

/**
 * 移除已选成员
 */
function removeMember(friendId) {
    $(`.friend-checkbox[value="${friendId}"]`).prop('checked', false);

    // 更新显示
    updateSelectedMembers();
}

/**
 * 创建群聊
 */
async function createGroup() {
    const groupName = $('#group-name-input').val().trim();
    const groupId = $('#group-id-input').val().trim();
    const $checkboxes = $('.friend-checkbox:checked');

    // 验证输入
    if (!groupName) {
        if (typeof toastr !== 'undefined') {
            toastr.error('请输入群聊名称');
        }
        return;
    }

    if (!groupId || !/^\d+$/.test(groupId)) {
        if (typeof toastr !== 'undefined') {
            toastr.error('请输入有效的群聊ID（纯数字）');
        }
        return;
    }

    if ($checkboxes.length === 0) {
        if (typeof toastr !== 'undefined') {
            toastr.error('请至少选择一个群成员');
        }
        return;
    }

    // 收集成员列表
    const members = ['我']; // 群主默认在群里
    $checkboxes.each(function () {
        const $item = $(this).closest('.friend-selection-item');
        const friendName = $item.data('friend-name');
        members.push(friendName);
    });

    // 格式化群聊信息: [群聊|群名|群ID|成员列表]
    const membersStr = members.join('、');
    const groupInfo = `[群聊|${groupName}|${groupId}|${membersStr}]`;


    try {

        // 检查 SillyTavern 是否准备就绪
        const targetWindow = window.parent || window;
        if (!targetWindow.SillyTavern || typeof targetWindow.SillyTavern.getContext !== 'function') {
            throw new Error('SillyTavern API 不可用');
        }

        const context = targetWindow.SillyTavern.getContext();
        if (!context || !context.chat || !Array.isArray(context.chat)) {
            throw new Error('聊天上下文不可用');
        }


        // 构建消息对象（参考 mobile-master/context-editor.js 的 addMessage 方法）
        const message = {
            name: '系统',
            is_user: true,
            is_system: false,
            force_avatar: false,
            mes: groupInfo,
            send_date: Date.now(),
            extra: {}
        };

        // 添加到聊天数组
        context.chat.push(message);

        // 使用 SillyTavern API 添加消息
        if (typeof context.addOneMessage === 'function') {
            context.addOneMessage(message);
        }

        // 保存聊天
        if (typeof context.saveChat === 'function') {
            await context.saveChat();
        }


        if (typeof toastr !== 'undefined') {
            toastr.success(`群聊 "${groupName}" 创建成功！已添加到聊天记录`);
        }

        // 延迟关闭面板并刷新列表
        setTimeout(() => {
            closeAppPanel();
            // 刷新消息列表
            if (currentPhoneData) {
                const content = generateMessagesPanel(currentPhoneData);
                $('#phone-app-body').html(content);
            }
        }, 1000);

    } catch (error) {
        if (typeof toastr !== 'undefined') {
            toastr.error('创建群聊失败: ' + error.message);
        }
    }
}

/**
 * 自定义确认弹窗
 * @param {Object} options - 弹窗配置
 * @param {string} options.title - 标题
 * @param {string} options.message - 消息内容
 * @param {string} options.icon - 图标emoji
 * @param {Object} options.itemInfo - 商品详细信息（可选）
 * @param {string} options.confirmText - 确认按钮文字
 * @param {string} options.cancelText - 取消按钮文字
 * @returns {Promise<boolean>} - 用户选择结果
 */
function showCustomConfirm(options = {}) {

    return new Promise((resolve) => {
        const {
            title = '确认操作',
            message = '确定要继续吗？',
            icon = '❓',
            itemInfo = null,
            confirmText = '确认',
            cancelText = '取消'
        } = options;


        // 构建商品信息HTML（带内联样式）
        let itemInfoHtml = '';
        if (itemInfo) {
            itemInfoHtml = `
                <div class="confirm-item-info" style="background:rgba(102,126,234,0.1);border:1px solid rgba(102,126,234,0.3);border-radius:12px;padding:16px;margin-bottom:24px;display:block;width:100%;box-sizing:border-box;">
                    <div class="confirm-item-name" style="display:block;width:100%;margin-bottom:8px;font-size:16px;font-weight:600;color:#f3f4f6;">
                        <span style="margin-right:8px;">${itemInfo.icon || '🎁'}</span>
                        <span>${itemInfo.name || '未知物品'}</span>
                    </div>
                    ${itemInfo.description ? `<div class="confirm-item-desc" style="display:block;width:100%;margin-bottom:8px;font-size:14px;color:#d1d5db;line-height:1.6;">${itemInfo.description}</div>` : ''}
                    ${itemInfo.price !== undefined ? `
                        <div class="confirm-item-price" style="display:block;width:100%;margin-bottom:0;font-size:15px;color:#fbbf24;font-weight:600;">
                            <span>💰 价格：</span>
                            <span>${itemInfo.price} 任务代币</span>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        //  计算弹窗宽度
        const windowWidth = $(window).width();
        const bodyWidth = $('body').width();
        const containerWidth = windowWidth || bodyWidth || 400;
        let modalWidth = Math.min(Math.max(containerWidth * 0.9, 300), 480);
        if (modalWidth < 300 || isNaN(modalWidth)) {
            modalWidth = 400;
        }

        // 创建弹窗HTML（直接在HTML中设置内联样式）
        const confirmHtml = `
            <div class="custom-confirm-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:100000;opacity:0;transition:opacity 0.3s ease-out;">
                <div class="custom-confirm-modal" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:20px;padding:2px;width:${modalWidth}px;max-width:480px;min-width:300px;box-shadow:0 12px 40px rgba(0,0,0,0.4);transform:translateY(30px) scale(0.95);opacity:0;transition:all 0.3s ease-out;display:block;box-sizing:border-box;margin:0 auto;">
                    <div class="custom-confirm-content" style="background:#1f2937;border-radius:18px;padding:28px 24px 20px;display:block;width:100%;box-sizing:border-box;min-height:100px;">
                        <div class="confirm-icon" style="width:64px;height:64px;margin:0 auto 20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;">${icon}</div>
                        <div class="confirm-title" style="font-size:22px;font-weight:700;margin-bottom:16px;color:#f3f4f6;text-align:center;display:block;width:100%;">${title}</div>
                        <div class="confirm-message" style="font-size:15px;line-height:1.7;color:#d1d5db;margin-bottom:24px;text-align:center;display:block;width:100%;">${message}</div>
                        ${itemInfoHtml}
                        <div class="confirm-buttons" style="display:flex;gap:12px;width:100%;">
                            <button class="confirm-btn confirm-btn-cancel" data-action="cancel" style="flex:1;padding:14px 20px;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;background:#374151;color:#d1d5db;min-height:48px;">
                                ${cancelText}
                            </button>保留，但是
                            <button class="confirm-btn confirm-btn-confirm" data-action="confirm" style="flex:1;padding:14px 20px;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;min-height:48px;">
                                ${confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 创建弹窗元素
        const $confirm = $(confirmHtml);

        //  添加到父窗口的 body（而不是 iframe 内），这样即使手机关闭弹窗仍可见
        const targetBody = (window.parent !== window) ? $(window.parent.document.body) : $('body');
        $confirm.appendTo(targetBody);

        // 获取modal和content元素
        const $modal = $confirm.find('.custom-confirm-modal');
        const $content = $confirm.find('.custom-confirm-content');

        //  强制触发重绘
        $confirm[0].offsetHeight;

        // 检查尺寸
        const confirmRect = $confirm[0].getBoundingClientRect();
        const modalRect = $modal[0].getBoundingClientRect();

        // 渐入动画
        setTimeout(() => {
            $confirm.css('opacity', '1');
        }, 10);

        // 弹窗上滑动画
        setTimeout(() => {
            $modal.css({
                'transform': 'translateY(0) scale(1)',
                'opacity': '1'
            });
        }, 50);

        // 处理按钮点击
        const handleChoice = (confirmed) => {

            $confirm.fadeOut(200, () => {
                $confirm.remove();
                resolve(confirmed);
            });
        };

        // 绑定事件
        $confirm.find('[data-action="confirm"]').on('click', () => handleChoice(true));
        $confirm.find('[data-action="cancel"]').on('click', () => handleChoice(false));

        // 点击遮罩层取消
        $confirm.on('click', (e) => {
            if ($(e.target).hasClass('custom-confirm-overlay')) {
                handleChoice(false);
            }
        });

        // ESC键取消
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                $(document).off('keydown', handleEsc);
                handleChoice(false);
            }
        };
        $(document).on('keydown', handleEsc);

        // Enter键确认
        const handleEnter = (e) => {
            if (e.key === 'Enter') {
                $(document).off('keydown', handleEnter);
                handleChoice(true);
            }
        };
        $(document).on('keydown', handleEnter);

        // 自动聚焦确认按钮
        setTimeout(() => {
            $confirm.find('.confirm-btn-confirm').focus();
        }, 100);
    });
}

// ==================== 启动 ====================
$(() => {
    // 等待依赖加载后再初始化手机界面
    (async () => {
        const MAX_WAIT_TIME = 30000;
        const CHECK_INTERVAL = 100;
        const startTime = Date.now();

        try {
            // 等待 waitGlobalInitialized 函数可用
            while (typeof waitGlobalInitialized !== 'function') {
                if (Date.now() - startTime > MAX_WAIT_TIME) {
                    console.error('[手机界面] 等待 waitGlobalInitialized 超时，尝试直接初始化');
                    initializeMobilePhone();
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
            }

            // 等待 Mvu 初始化完成
            await waitGlobalInitialized('Mvu');
            initializeMobilePhone();
        } catch (e) {
            console.error('[手机界面] 初始化失败:', e);
            // 即使出错也尝试初始化基本功能
            try {
                initializeMobilePhone();
            } catch (e2) {
                console.error('[手机界面] 备用初始化也失败:', e2);
            }
        }
    })();
});

// ESC键关闭手机或全屏查看器
$(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
        // 优先关闭全屏壁纸查看器
        const $viewer = $('#wallpaper-fullscreen-viewer');
        if ($viewer.hasClass('active')) {
            closeWallpaperFullscreen();
            return;
        }

        // 然后关闭手机界面（如果未置顶）
        const overlay = $('#mobile-phone-overlay');
        if (overlay.hasClass('active') && !isPinned) {
            closeMobilePhone();
        }
    }
});

// 卸载时清理
$(window).on('unload', () => {
    cleanupMobilePhone();
});
