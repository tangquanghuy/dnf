<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>两京九州 · 天下势力地图</title>
<script src="./jiuzhouMapData.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Ma+Shan+Zheng&display=swap" rel="stylesheet">
<style>
:root{
  --paper:#f1f4ec;
  --gold:#f3dca6;
  --jade:#bfe3cf;
  --water:#9fd6ea;
  --road:#e0bf86;
  --line:rgba(200,212,234,0.26);
  --line-soft:rgba(200,212,234,0.13);
  --panel:rgba(34,42,60,0.92);
}
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:100%; height:100%; overflow:hidden; font-family:'Noto Serif SC',serif; }
body {
  background: linear-gradient(135deg, #2b3a4a 0%, #5f7b98 40%, #1a2535 100%);
  color: var(--paper);
}
/* fine paper/parchment noise */
body::before {
  content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.028'/%3E%3C/svg%3E");
}
/* soft vignette */
body::after {
  content:''; position:fixed; inset:0; z-index:1; pointer-events:none;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(10, 15, 20, 0.5) 100%);
}
#map-container { position:relative; width:100%; height:100%; z-index:2; overflow:hidden; cursor:grab; }
#map-container.grabbing { cursor:grabbing; }
#edge-canvas { position:absolute; top:0; left:0; width:100%; height:100%; }
#node-layer { position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; }
#terrain-layer { position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:0; }
.terrain-icon { position:absolute; transform:translate(-50%,-50%); pointer-events:none; opacity:0.92; }
.terrain-icon svg { display:block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.32)); }
.terrain-label { position:absolute; transform:translate(-50%,-50%); pointer-events:none; text-align:center; white-space:nowrap; font-family:'Noto Serif SC',serif; }
.terrain-label .t-name { font-size:28px; font-weight:700; letter-spacing:6px; }
.terrain-label .t-sub  { font-size:15px; letter-spacing:3px; opacity:0.66; margin-top:3px; }
.node-wrapper {
  position:absolute; display:flex; flex-direction:column; align-items:center;
  pointer-events:auto; cursor:pointer; transform:translate(-50%,-50%);
  transition: filter 0.18s, opacity 0.18s;
}
.node-wrapper.dimmed { opacity:0.28; }
.node-wrapper.mode-dim { opacity:0.32; }
/* 在“全部”视图下，门派降为次要：缩小、标签悬停才显示 */
.node-wrapper.sect-muted .node-label { display:none; }
.node-wrapper.sect-muted:hover .node-label { display:block; }
.node-wrapper:hover { filter: brightness(1.2) drop-shadow(0 0 9px rgba(143,202,173,0.55)); z-index:60; }
.node-icon svg {
  display:block;
  filter: drop-shadow(1px 2px 3px rgba(0,0,0,0.7)) drop-shadow(0 0 4px rgba(0,0,0,0.45));
}
.node-label {
  margin-top: 5px; white-space:nowrap; text-align:center;
  color:var(--paper); font-weight:600; line-height:1.25;
  text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
  background: rgba(22,42,48,0.72); padding:2px 9px; border-radius:4px;
  border:1px solid rgba(190,222,200,0.18);
}
.node-wrapper[data-type="capital"] .node-icon svg {
  filter: drop-shadow(1px 2px 3px rgba(0,0,0,0.7)) drop-shadow(0 0 11px rgba(232,210,154,0.5));
}
.node-wrapper[data-type="capital"] .node-label { color:#f3e1ac; font-size:18px; font-weight:700; letter-spacing:1px; }
.node-wrapper[data-type="city"]    .node-label { color:#e3ecdd; font-size:15px; font-weight:600; }
.node-wrapper[data-type="port"]    .node-label { color:#a8dbef; font-size:14px; }
.node-wrapper[data-type="pass"]    .node-label { color:#eab98e; font-size:14px; font-weight:600; }
.node-wrapper[data-type="garrison"].node-label { color:#e6b48c; font-size:13px; }
.node-wrapper[data-type="frontier"].node-label { color:#cbb78c; font-size:13px; }
.node-wrapper[data-type="wilderness"] .node-label { color:#aebdb0; font-size:12px; }
.node-wrapper[data-type="town"]    .node-label { color:#dccfa0; font-size:13px; }
.node-wrapper[data-type="sect"]    .node-label { color:#9fdcc0; font-size:12px; }
.node-wrapper[data-type="faction"] .node-label { color:#f09a9a; font-size:13px; font-weight:600; }
.node-wrapper[data-type="faction"] .node-icon svg {
  filter: drop-shadow(1px 2px 3px rgba(0,0,0,0.6)) drop-shadow(0 0 8px rgba(200,80,70,0.42));
  animation: fashi-pulse 3.2s ease-in-out infinite;
}
@keyframes fashi-pulse { 0%,100%{filter:drop-shadow(1px 2px 3px rgba(0,0,0,0.6)) drop-shadow(0 0 6px rgba(200,80,70,0.3));} 50%{filter:drop-shadow(1px 2px 3px rgba(0,0,0,0.6)) drop-shadow(0 0 11px rgba(200,80,70,0.55));} }
/* 法尸：关外禁地标记（独立点，非可达城镇） */
.node-wrapper.faction-mark::before {
  content:""; position:absolute; top:-22px; left:50%; width:80px; height:80px;
  transform:translateX(-50%); border-radius:50%; pointer-events:none; z-index:-1;
  background:radial-gradient(circle, rgba(196,58,48,0.30) 0%, rgba(150,30,30,0.12) 45%, transparent 72%);
  animation: fashi-haze 4s ease-in-out infinite;
}
@keyframes fashi-haze { 0%,100%{opacity:0.55; transform:translateX(-50%) scale(0.92);} 50%{opacity:1; transform:translateX(-50%) scale(1.08);} }
.node-wrapper.faction-mark .node-label {
  background:rgba(60,12,12,0.55); border-color:rgba(220,110,100,0.4);
  letter-spacing:1px;
}

/* Detail Modal */
.detail-overlay {
  display:none; position:fixed; inset:0; z-index:200;
  background:rgba(4,9,12,0.8); backdrop-filter:blur(6px);
  justify-content:center; align-items:center;
}
.detail-overlay.active { display:flex; }
.detail-panel {
  position:relative; width:90%; max-width:760px; max-height:86vh;
  background: linear-gradient(160deg, rgba(34,42,60,0.98) 0%, rgba(22,28,42,0.98) 100%);
  border:1px solid var(--line); border-radius:10px;
  overflow-y:auto; padding:0;
  box-shadow: 0 12px 50px rgba(0,0,0,0.7), 0 0 70px rgba(143,202,173,0.05);
}
.detail-panel::-webkit-scrollbar { width:6px; }
.detail-panel::-webkit-scrollbar-track { background:transparent; }
.detail-panel::-webkit-scrollbar-thumb { background:rgba(143,202,173,0.25); border-radius:3px; }
.detail-close {
  position:sticky; top:0; right:0; z-index:10; float:right;
  margin:12px 12px 0 0; width:32px; height:32px;
  border:1px solid var(--line); background:rgba(12,26,32,0.92);
  color:var(--jade); font-size:18px; border-radius:50%; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
}
.detail-close:hover { background:rgba(143,202,173,0.18); }
.detail-header { padding:24px 26px 14px; border-bottom:1px solid var(--line-soft); }
.detail-title { font-size:22px; font-weight:700; color:#f0e6c4; margin-bottom:8px; letter-spacing:1px; }
.detail-badge {
  display:inline-block; padding:3px 11px; border-radius:11px; font-size:11px;
  background:rgba(143,202,173,0.1); color:var(--jade); border:1px solid var(--line);
  margin-right:6px;
}
.detail-summary { padding:16px 26px; color:#cfdcd0; font-size:14px; line-height:1.85; border-bottom:1px solid var(--line-soft); white-space:pre-line; }
.detail-body { padding:8px 26px 26px; }
.detail-section { margin-top:14px; padding-top:12px; border-top:1px solid var(--line-soft); }
.detail-section-title { font-size:12px; color:var(--jade); font-weight:600; margin-bottom:6px; letter-spacing:2px; display:flex; align-items:center; gap:7px; }
.detail-section-title::before { content:''; width:3px; height:13px; border-radius:2px; background:linear-gradient(180deg,var(--jade),var(--gold)); }
.detail-section-content { font-size:13.5px; color:#d2ddd0; line-height:1.78; white-space:pre-line; }

/* Legend */
#legend {
  position:fixed; bottom:18px; left:18px; z-index:100;
  background:rgba(32,40,58,0.9); border:1px solid var(--line);
  border-radius:8px; padding:10px 14px; font-size:11px;
  max-width:60vw;
}
#legend-title {
  color:var(--jade); font-weight:600; letter-spacing:2px;
  display:flex; align-items:center; gap:8px; cursor:pointer; user-select:none;
}
#legend-title .legend-caret { margin-left:auto; transition:transform 0.2s; font-size:10px; opacity:0.8; }
#legend.collapsed #legend-title .legend-caret { transform:rotate(-90deg); }
.legend-body { margin-top:8px; overflow:hidden; }
#legend.collapsed .legend-body { display:none; }
.legend-item { display:flex; align-items:center; gap:8px; padding:2px 0; color:#bcccbe; }
.legend-routes { margin-top:8px; padding-top:8px; border-top:1px solid var(--line-soft); display:flex; flex-direction:column; gap:4px; }
.legend-route { display:flex; align-items:center; gap:8px; color:#bcccbe; }
.legend-swatch { width:20px; height:0; border-top-width:2px; border-top-style:solid; }

/* Minimap */
#minimap {
  position:fixed; bottom:18px; right:18px; z-index:100;
  width:150px; height:118px; border:1px solid var(--line);
  border-radius:6px; background:rgba(32,40,58,0.85);
}

/* Filter bar */
#filter-bar {
  position:fixed; top:16px; left:50%; transform:translateX(-50%); z-index:100;
  display:flex; gap:5px; background:rgba(32,40,58,0.9); border:1px solid var(--line);
  border-radius:8px; padding:6px 10px; flex-wrap:wrap; max-width:92vw; justify-content:center;
}
.filter-btn {
  padding:5px 12px; border-radius:5px; font-size:12px; cursor:pointer;
  background:transparent; color:#88a596; border:1px solid transparent;
  transition: all 0.18s; font-family:'Noto Serif SC',serif;
}
.filter-btn.active { background:rgba(143,202,173,0.18); color:#f0e6c4; border-color:var(--line); }
.filter-btn:hover { color:var(--jade); }

/* Title */
#map-title {
  position:fixed; top:14px; left:18px; z-index:100;
  font-family:'Ma Shan Zheng', 'Noto Serif SC', serif;
  font-size:23px; color:var(--gold); letter-spacing:3px;
  text-shadow: 0 0 14px rgba(232,210,154,0.3), 1px 1px 2px rgba(0,0,0,0.85);
}

/* Zoom controls */
#zoom-controls { position:fixed; top:14px; right:18px; z-index:100; display:flex; flex-direction:column; gap:4px; }
.zoom-btn {
  width:34px; height:34px; border:1px solid var(--line);
  background:rgba(32,40,58,0.9); color:var(--jade);
  font-size:18px; cursor:pointer; border-radius:5px;
  display:flex; align-items:center; justify-content:center; font-family:'Noto Serif SC',serif;
}
.zoom-btn:hover { background:rgba(143,202,173,0.16); }

/* Tooltip */
#tooltip {
  position:fixed; display:none; z-index:300; pointer-events:none; max-width:300px;
  background:rgba(32,40,58,0.97); border:1px solid var(--line);
  border-radius:6px; padding:9px 13px; font-size:12px;
  color:#d2ddd0; box-shadow: 0 4px 16px rgba(0,0,0,0.6);
}
#tt-name { font-size:14px; color:#f0e6c4; font-weight:600; margin-bottom:3px; }
#tt-type { font-size:11px; color:var(--jade); margin-bottom:5px; letter-spacing:1px; }
#tt-summary { font-size:12px; color:#c2d0c4; line-height:1.55; }
</style>
</head>
<body>

<!-- ============ SVG ICON DEFINITIONS ============ -->
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <!-- CAPITAL: 双檐宫阙 -->
    <symbol id="icon-capital" viewBox="0 0 32 32">
      <rect x="4" y="25" width="24" height="5" rx="1" fill="#c9b088" stroke="#5b4630" stroke-width="0.6"/>
      <rect x="7" y="18" width="18" height="7" fill="#d8c099" stroke="#6b5436" stroke-width="0.6"/>
      <rect x="14.4" y="20" width="3.2" height="5" fill="#2c1f15"/>
      <path d="M16,11.5 L7,16 Q3,18.5 4,18.5 L28,18.5 Q29,18.5 25,16 Z" fill="#4d8290" stroke="#234850" stroke-width="0.6"/>
      <path d="M7,16 Q3,18.5 3.4,18.4" fill="none" stroke="#234850" stroke-width="0.6"/>
      <rect x="11" y="11" width="10" height="5" fill="#d8c099" stroke="#6b5436" stroke-width="0.5"/>
      <path d="M16,5.5 L9,10 Q5.5,12 6.4,12 L25.6,12 Q26.5,12 23,10 Z" fill="#56919f" stroke="#234850" stroke-width="0.5"/>
      <rect x="15.1" y="2.4" width="1.8" height="3.6" fill="#e8d29a"/>
      <circle cx="16" cy="2" r="1.4" fill="#f2e2b0"/>
    </symbol>

    <!-- CITY: 城楼 + 城墙 -->
    <symbol id="icon-city" viewBox="0 0 32 32">
      <rect x="2" y="20" width="28" height="10" fill="#c4ac84" stroke="#3d2e1c" stroke-width="0.6"/>
      <g fill="#c4ac84" stroke="#3d2e1c" stroke-width="0.3">
        <rect x="2" y="19" width="2.6" height="2"/><rect x="6.6" y="19" width="2.6" height="2"/>
        <rect x="22.8" y="19" width="2.6" height="2"/><rect x="27.4" y="19" width="2.6" height="2"/>
      </g>
      <rect x="11" y="13" width="10" height="7" fill="#d6be96" stroke="#3d2e1c" stroke-width="0.5"/>
      <rect x="14.4" y="15" width="3.2" height="5" fill="#241a11"/>
      <path d="M16,7.5 L8,13 Q4.5,15 5.4,15 L26.6,15 Q27.5,15 24,13 Z" fill="#4d8290" stroke="#234850" stroke-width="0.5"/>
    </symbol>

    <!-- TOWN: 单檐谯楼 -->
    <symbol id="icon-town" viewBox="0 0 32 32">
      <rect x="6" y="22" width="20" height="8" fill="#bca57e" stroke="#3d2e1c" stroke-width="0.5"/>
      <g fill="#bca57e" stroke="#3d2e1c" stroke-width="0.25">
        <rect x="6" y="21" width="2.2" height="2"/><rect x="10" y="21" width="2.2" height="2"/>
        <rect x="19.8" y="21" width="2.2" height="2"/><rect x="23.8" y="21" width="2.2" height="2"/>
      </g>
      <rect x="12" y="16" width="8" height="6" fill="#cdb78e" stroke="#3d2e1c" stroke-width="0.4"/>
      <rect x="14.6" y="18" width="2.8" height="4" fill="#241a11"/>
      <path d="M16,11 L9.5,16 Q6.5,17.8 7.3,17.8 L24.7,17.8 Q25.5,17.8 22.5,16 Z" fill="#54707a" stroke="#2a474e" stroke-width="0.4"/>
    </symbol>

    <!-- PORT: 帆船泊岸 -->
    <symbol id="icon-port" viewBox="0 0 32 32">
      <path d="M1,25 Q5,23 9,25 Q13,27 17,25 Q21,23 25,25 Q29,27 32,25 L32,32 L0,32 Z" fill="#3a6f86" opacity="0.55"/>
      <path d="M5,21 L27,21 L23.5,27 L8.5,27 Z" fill="#7a5c3a" stroke="#3d2e1c" stroke-width="0.5"/>
      <path d="M6.5,22 L25.5,22 L24,24.5 L8,24.5 Z" fill="#92703f"/>
      <rect x="15.2" y="5" width="1.6" height="16" fill="#5a3f20"/>
      <path d="M16,5 L16,19 L8,17 Z" fill="#e6ddc6" stroke="#b8a884" stroke-width="0.4"/>
      <path d="M16,7 L16,19 L24,16.5 Z" fill="#d6ccb4" stroke="#b8a884" stroke-width="0.4"/>
      <path d="M16,5 L20,3 L16,1.6 Z" fill="#a8453f"/>
    </symbol>

    <!-- PASS: 关楼夹山 -->
    <symbol id="icon-pass" viewBox="0 0 32 32">
      <polygon points="0,30 7,13 13,30" fill="#5d6a6a" stroke="#363f3f" stroke-width="0.5"/>
      <polygon points="19,30 25,13 32,30" fill="#5d6a6a" stroke="#363f3f" stroke-width="0.5"/>
      <polygon points="3,30 7,21 10,30" fill="#eef2f4" opacity="0.7"/>
      <polygon points="22,30 25,22 27.5,30" fill="#eef2f4" opacity="0.7"/>
      <rect x="9" y="20" width="14" height="10" fill="#c4ac84" stroke="#3d2e1c" stroke-width="0.6"/>
      <rect x="13" y="22" width="6" height="8" fill="#1c130c"/>
      <rect x="9" y="14" width="14" height="6" fill="#d6be96" stroke="#3d2e1c" stroke-width="0.5"/>
      <path d="M16,9 L7.5,14 Q4.5,15.8 5.3,15.8 L26.7,15.8 Q27.5,15.8 24.5,14 Z" fill="#4d8290" stroke="#234850" stroke-width="0.5"/>
    </symbol>

    <!-- GARRISON: 军镇 戍楼 + 战旗 -->
    <symbol id="icon-garrison" viewBox="0 0 32 32">
      <rect x="10" y="13" width="12" height="17" fill="#b69e76" stroke="#3d2e1c" stroke-width="0.5"/>
      <g fill="#b69e76" stroke="#3d2e1c" stroke-width="0.3">
        <rect x="10" y="12" width="2.4" height="2"/><rect x="14" y="12" width="2.4" height="2"/>
        <rect x="17.6" y="12" width="2.4" height="2"/>
      </g>
      <rect x="13" y="19" width="6" height="11" fill="#1c130c"/>
      <rect x="15" y="2" width="1.5" height="13" fill="#4a3420"/>
      <path d="M16.5,3 L27,3 L23.5,7 L27,11 L16.5,11 Z" fill="#a8453f" stroke="#5a1f1c" stroke-width="0.4"/>
      <text x="20.5" y="8.4" fill="#f2e2b0" font-size="5" font-weight="700" text-anchor="middle" font-family="serif">军</text>
    </symbol>

    <!-- FRONTIER: 烽燧 -->
    <symbol id="icon-frontier" viewBox="0 0 32 32">
      <polygon points="11,30 12.5,12 19.5,12 21,30" fill="#a89270" stroke="#3d2e1c" stroke-width="0.5"/>
      <g fill="#a89270" stroke="#3d2e1c" stroke-width="0.3">
        <rect x="11.6" y="11" width="2.4" height="2"/><rect x="15" y="11" width="2.4" height="2"/><rect x="18" y="11" width="2.4" height="2"/>
      </g>
      <ellipse cx="16" cy="6" rx="4" ry="5.5" fill="#e07a30" opacity="0.78"/>
      <ellipse cx="16" cy="7" rx="2.6" ry="3.8" fill="#f4b048" opacity="0.85"/>
    </symbol>

    <!-- WILDERNESS: 雪山荒岭 -->
    <symbol id="icon-wilderness" viewBox="0 0 32 32">
      <polygon points="0,29 9,14 17,29" fill="#5f6f72" opacity="0.65"/>
      <polygon points="14,29 23,11 32,29" fill="#6c7c7e" stroke="#465254" stroke-width="0.5"/>
      <polygon points="23,11 19,18 27,18" fill="#eef3f4"/>
      <polygon points="9,14 6,20 12,20" fill="#eef3f4" opacity="0.85"/>
      <ellipse cx="16" cy="30" rx="14" ry="1.6" fill="#39474a" opacity="0.4"/>
    </symbol>

    <!-- SECT: 云上道观 (祥云 + 重檐 + 灵珠) -->
    <symbol id="icon-sect" viewBox="0 0 32 32">
      <path d="M4,27 Q3.5,24 7,24 Q8,21 12,22.5 Q16,20.5 19,23.5 Q24,22.5 25,25 Q28.5,25 28,27.5 Z" fill="#37707d" opacity="0.5"/>
      <rect x="9" y="22" width="14" height="3" fill="#c4ac84" stroke="#4a3a22" stroke-width="0.4"/>
      <rect x="12" y="15.5" width="8" height="6.5" fill="#dceee5" stroke="#356b6f" stroke-width="0.5"/>
      <rect x="14.6" y="18" width="2.8" height="4" fill="#2b524a"/>
      <path d="M16,12 L9.5,16 Q6.8,17.6 7.6,17.6 L24.4,17.6 Q25.2,17.6 22.5,16 Z" fill="#5fb594" stroke="#2c6049" stroke-width="0.5"/>
      <rect x="13.6" y="9.5" width="4.8" height="3" fill="#dceee5" stroke="#356b6f" stroke-width="0.4"/>
      <path d="M16,6.5 L11,9.8 Q8.6,11.2 9.4,11.2 L22.6,11.2 Q23.4,11.2 21,9.8 Z" fill="#5fb594" stroke="#2c6049" stroke-width="0.4"/>
      <circle cx="16" cy="4" r="1.5" fill="#bdeede"/>
      <circle cx="16" cy="4" r="2.6" fill="none" stroke="#bdeede" stroke-width="0.4" opacity="0.5"/>
    </symbol>

    <!-- FACTION: 法尸 (邪煞骷髅 + 赤瞳) -->
    <symbol id="icon-faction" viewBox="0 0 32 32">
      <circle cx="16" cy="15" r="12" fill="#7a1c1c" opacity="0.16"/>
      <path d="M16,4.5 C9.5,4.5 6.5,9 6.5,14 C6.5,17 8.5,19 8.5,21 L11.5,21 L11.5,24.5 L13.6,24.5 L13.6,21 L18.4,21 L18.4,24.5 L20.5,24.5 L20.5,21 L23.5,21 C23.5,19 25.5,17 25.5,14 C25.5,9 22.5,4.5 16,4.5 Z" fill="#dcd4c6" stroke="#42201c" stroke-width="0.7"/>
      <ellipse cx="12.2" cy="14" rx="2.4" ry="2.8" fill="#160808"/>
      <ellipse cx="19.8" cy="14" rx="2.4" ry="2.8" fill="#160808"/>
      <circle cx="12.2" cy="14" r="1" fill="#ff4634"/>
      <circle cx="19.8" cy="14" r="1" fill="#ff4634"/>
      <path d="M16,16 L14.3,19.4 L17.7,19.4 Z" fill="#160808"/>
    </symbol>

    <!-- ===== 大区地形图标（取自 amber_sword 图例，tr- 前缀避免冲突）===== -->
    <symbol id="icon-tr-forest" viewBox="0 0 32 32">
      <polygon points="16,2 8,18 24,18" fill="#4a8a3a" opacity="0.9" />
      <polygon points="16,6 10,18 22,18" fill="#3a7a2a" />
      <polygon points="9,6 3,22 15,22" fill="#2d5a1e" />
      <polygon points="9,10 5,22 13,22" fill="#3a7a2a" />
      <polygon points="23,6 17,22 29,22" fill="#2d5a1e" />
      <polygon points="23,10 19,22 27,22" fill="#3a7a2a" />
      <rect x="15" y="18" width="2" height="10" fill="#4a3020" />
      <rect x="8" y="22" width="2" height="8" fill="#4a3020" />
      <rect x="22" y="22" width="2" height="8" fill="#4a3020" />
      <ellipse cx="16" cy="30" rx="12" ry="2" fill="#2d5a1e" opacity="0.3" />
    </symbol>
    <symbol id="icon-tr-mountain" viewBox="0 0 32 32">
      <polygon points="0,28 8,12 16,28" fill="#6a5a4a" opacity="0.6" />
      <polygon points="16,28 24,14 32,28" fill="#6a5a4a" opacity="0.6" />
      <polygon points="16,2 4,30 28,30" fill="#7a6a5a" stroke="#5a4a3a" stroke-width="0.5" />
      <line x1="10" y1="20" x2="14" y2="14" stroke="#5a4a3a" stroke-width="0.4" opacity="0.5" />
      <line x1="22" y1="20" x2="18" y2="14" stroke="#5a4a3a" stroke-width="0.4" opacity="0.5" />
      <polygon points="16,2 12,10 20,10" fill="#f0f0f0" />
      <polygon points="16,2 11,11 13,10 16,6 19,10 21,11" fill="#e0e8f0" />
      <path d="M12,10 Q13,12 14,10.5 Q15,12 16,10 Q17,12 18,10.5 Q19,12 20,10" fill="#e8ecf0" opacity="0.7" />
    </symbol>
    <symbol id="icon-tr-plains" viewBox="0 0 32 32">
      <path d="M0,20 Q8,12 16,16 Q24,12 32,18 L32,32 L0,32 Z" fill="#7a8a5a" opacity="0.5" />
      <path d="M0,24 Q6,16 14,20 Q20,14 28,20 L32,22 L32,32 L0,32 Z" fill="#8a9a6a" />
      <path d="M6,22 L7,19 L8,22" fill="none" stroke="#6a7a4a" stroke-width="0.4" />
      <path d="M12,20 L13,17 L14,20" fill="none" stroke="#6a7a4a" stroke-width="0.4" />
      <path d="M20,18 L21,15 L22,18" fill="none" stroke="#6a7a4a" stroke-width="0.4" />
      <path d="M26,20 L27,17 L28,20" fill="none" stroke="#6a7a4a" stroke-width="0.4" />
      <path d="M4,26 Q10,24 16,26 Q22,24 28,26" fill="none" stroke="#9aaa7a" stroke-width="0.3" opacity="0.4" />
    </symbol>
    <symbol id="icon-tr-desert" viewBox="0 0 32 32">
      <path d="M0,22 Q8,14 16,18 Q24,14 32,20 L32,32 L0,32 Z" fill="#c8a860" opacity="0.6" />
      <path d="M0,26 Q6,18 14,22 Q22,16 32,24 L32,32 L0,32 Z" fill="#b89850" />
      <path d="M6,20 Q10,17 14,22" fill="none" stroke="#a88840" stroke-width="0.4" />
      <path d="M22,18 Q26,16 30,22" fill="none" stroke="#a88840" stroke-width="0.4" />
      <rect x="18" y="10" width="2" height="14" rx="1" fill="#5a7a3a" stroke="#3a5a2a" stroke-width="0.4" />
      <path d="M18,16 Q14,16 14,12 L14,12 Q14,14 16,14" fill="none" stroke="#5a7a3a" stroke-width="1.5" stroke-linecap="round" />
      <path d="M20,14 Q24,14 24,10 L24,10 Q24,12 22,12" fill="none" stroke="#5a7a3a" stroke-width="1.5" stroke-linecap="round" />
    </symbol>
    <symbol id="icon-tr-warseal" viewBox="0 0 32 32">
      <ellipse cx="16" cy="29" rx="14" ry="2.6" fill="#3a3a32" opacity="0.3" />
      <path d="M2,28 Q9,16 16,16 Q23,16 30,28 Z" fill="#6f5d45" />
      <path d="M6,28 Q11,21 16,21 Q21,21 26,28 Z" fill="#5b4c38" opacity="0.8" />
      <line x1="6.5" y1="27" x2="10" y2="13.5" stroke="#9aa0a6" stroke-width="1.5" stroke-linecap="round" />
      <line x1="7.2" y1="17" x2="11.6" y2="16" stroke="#9aa0a6" stroke-width="1.3" stroke-linecap="round" />
      <line x1="25.5" y1="27" x2="22.6" y2="12" stroke="#7c6a4c" stroke-width="1.3" stroke-linecap="round" />
      <path d="M22.6,12.5 L20.6,8.5 L24.3,10.2 Z" fill="#9aa0a6" />
      <path d="M12.6,26 L12.6,8 Q12.6,4.8 16,4.8 Q19.4,4.8 19.4,8 L19.4,26 Z" fill="#9c968c" stroke="#56524a" stroke-width="0.6" />
      <rect x="14.4" y="8.4" width="3.2" height="12" rx="0.4" fill="#ece3c4" />
      <line x1="16" y1="9.6" x2="16" y2="19" stroke="#a83b2c" stroke-width="0.7" />
      <path d="M14.9,11 H17.1 M14.9,13.2 H17.1 M15.2,15.4 H16.8 M15.2,17 H16.8" stroke="#a83b2c" stroke-width="0.45" />
      <circle cx="16" cy="13.5" r="10.5" fill="none" stroke="#79d2bb" stroke-width="0.5" opacity="0.3" />
    </symbol>
    <symbol id="icon-tr-ocean" viewBox="0 0 32 32">
      <rect x="0" y="8" width="32" height="24" rx="2" fill="#3a6a8a" opacity="0.55" />
      <path d="M0,12 Q4,8 8,12 Q12,16 16,12 Q20,8 24,12 Q28,16 32,12" fill="none" stroke="#4a7a9a" stroke-width="1.5" />
      <path d="M0,18 Q4,14 8,18 Q12,22 16,18 Q20,14 24,18 Q28,22 32,18" fill="none" stroke="#5a8aaa" stroke-width="1.2" />
      <path d="M0,24 Q4,20 8,24 Q12,28 16,24 Q20,20 24,24 Q28,28 32,24" fill="none" stroke="#4a7a9a" stroke-width="1" />
      <path d="M2,11 Q4,9 6,11" fill="none" stroke="#e8e8e8" stroke-width="0.5" opacity="0.5" />
      <path d="M14,11 Q16,9 18,11" fill="none" stroke="#e8e8e8" stroke-width="0.5" opacity="0.5" />
      <path d="M26,11 Q28,9 30,11" fill="none" stroke="#e8e8e8" stroke-width="0.5" opacity="0.5" />
    </symbol>
  </defs>
</svg>

<div id="map-title">两京九州 · 天下势力图</div>
<div id="map-container">
  <div id="terrain-layer"></div>
  <canvas id="edge-canvas"></canvas>
  <div id="node-layer"></div>
</div>

<div id="filter-bar">
  <button class="filter-btn active" data-filter="all">全部</button>
  <button class="filter-btn" data-filter="onlySect">门派</button>
</div>

<div id="zoom-controls">
  <button class="zoom-btn" id="zoom-in" title="放大">+</button>
  <button class="zoom-btn" id="zoom-out" title="缩小">−</button>
  <button class="zoom-btn" id="zoom-reset" title="还原" style="font-size:14px">⌂</button>
</div>

<div id="legend" class="collapsed">
  <div id="legend-title"><span>图例</span><span class="legend-caret">▼</span></div>
  <div class="legend-body">
    <div id="legend-items"></div>
    <div class="legend-routes" id="legend-routes"></div>
  </div>
</div>

<canvas id="minimap"></canvas>

<div id="tooltip">
  <div id="tt-name"></div>
  <div id="tt-type"></div>
  <div id="tt-summary"></div>
</div>

<div class="detail-overlay" id="detail-overlay">
  <div class="detail-panel" id="detail-panel">
    <button class="detail-close" id="detail-close">✕</button>
    <div class="detail-header" id="detail-header"></div>
    <div class="detail-summary" id="detail-summary"></div>
    <div class="detail-body" id="detail-body"></div>
  </div>
</div>

<script>
// ============ TYPE CONFIG ============
const typeConfig = {
  capital:    { size: 60, label: '两京', labelSize: 18, color: '#f2e2b0', tier: 'major' },
  city:       { size: 50, label: '州府', labelSize: 15, color: '#e3ecdd', tier: 'major' },
  town:       { size: 42, label: '重镇', labelSize: 13, color: '#dccfa0' },
  port:       { size: 46, label: '港口', labelSize: 14, color: '#a8dbef' },
  pass:       { size: 46, label: '关隘', labelSize: 14, color: '#eab98e' },
  garrison:   { size: 44, label: '军镇', labelSize: 13, color: '#e6b48c' },
  frontier:   { size: 42, label: '边地', labelSize: 13, color: '#cbb78c' },
  wilderness: { size: 40, label: '荒原', labelSize: 12, color: '#aebdb0' },
  sect:       { size: 38, label: '门派', labelSize: 12, color: '#9fdcc0' },
  faction:    { size: 42, label: '法尸禁地', labelSize: 13, color: '#f09a9a' },
};

// ============ 地形 / 路型 ============
// 每种路型有颜色、线型，以及 factor（每单位距离的耗时系数，供日后路程计算）
const terrainStyles = {
  land:     { color:'#e7c074', alpha:0.80, width:1.9, dash:[],      factor:1.0, label:'陆路 · 官道驿道' },
  water:    { color:'#5fb6d8', alpha:0.85, width:2.0, dash:[],      factor:0.7, label:'水路 · 江河漕运' },
  sea:      { color:'#4f93dd', alpha:0.88, width:2.1, dash:[11,7],  factor:1.4, label:'海路 · 跨海航道' },
  highland: { color:'#c193da', alpha:0.82, width:1.8, dash:[3,6],   factor:2.2, label:'险路 · 雪山戈壁' },
  sect:     { color:'#86d2ad', alpha:0.30, width:1.0, dash:[2,5],   factor:1.0, label:'门派小径' },
};

// ============ 大区地形图标（复用 amber 图例 SVG，每区 3 个大图标）============
// items 为该区的图标坐标(世界系)+尺寸(svg px)；只摆少量大图标，略重叠连成片。
const TERRAIN_REGIONS = [
  { icon:'icon-tr-ocean',    color:'#9fc8e0', name:'东 海', sub:'万里海疆',
    label:[450,150],  items:[[448,150,128]] },
  { icon:'icon-tr-ocean',    color:'#9fc8e0', name:'南 海', sub:'番舶远洋',
    label:[255,468],  items:[[255,468,128]] },
  { icon:'icon-tr-mountain', color:'#c4d2e8', name:'雪域高原', sub:'极寒禁区',
    label:[-348,300], items:[[-348,300,138]] },
  { icon:'icon-tr-desert',   color:'#d8bd84', name:'西域大漠', sub:'化外流沙',
    label:[-372,-188],items:[[-372,-185,128]] },
  { icon:'icon-tr-warseal',  color:'#c2b09c', name:'关外古战场', sub:'南北朝禁制尸海',
    label:[-70,-292], items:[[-70,-292,132]] },
  { icon:'icon-tr-forest',   color:'#9ed0b0', name:'极北林海', sub:'关外苦寒',
    label:[250,-352],  items:[[250,-352,130]] },
];

const GEO_TYPES = new Set(['capital','city','town','port','pass','garrison','frontier','wilderness']);
// 高原 / 雪山 / 戈壁节点：进出此类节点的路按险路计
const HIGHLAND_SET = new Set(['wilderness_xueyu','city_xining','frontier_dunhuang','pass_jiayuguan','city_liangzhou','town_dajianlu']);
// 内河 / 运河 水运节点
const WATER_SET = new Set(['capital_jiangning','city_yangzhou','city_suzhou','city_hangzhou','city_wuchang','city_jiangling','city_chongqing','city_changsha','city_guilin','city_wuzhou','city_kaifeng','city_jinan','city_yanzhou','city_guide']);
// 沿海 / 海港 / 海岛节点
const SEA_SET = new Set(['port_dengzhou','port_guangzhou','city_qiongzhou','city_fuzhou','frontier_bohai']);
// 显式跨海航道（既定地形，也强制连边以保证海上互通）
const SPECIAL_SEA = {
  'garrison_andong|port_dengzhou': '渤海航道',
  'city_fuzhou|port_guangzhou':    '闽广海道',
  'city_fuzhou|city_hangzhou':     '闽浙海道',
  'city_qiongzhou|port_guangzhou': '琼州海路',
};
function pairKey(a,b){ return a < b ? a+'|'+b : b+'|'+a; }

// 判定一条边的地形：海路 > 险路 > 水路 > 陆路
function decideTerrain(aId,bId){
  if (SPECIAL_SEA[pairKey(aId,bId)]) return 'sea';
  if (SEA_SET.has(aId) && SEA_SET.has(bId)) return 'sea';
  if (HIGHLAND_SET.has(aId) || HIGHLAND_SET.has(bId)) return 'highland';
  const aW = WATER_SET.has(aId) || SEA_SET.has(aId);
  const bW = WATER_SET.has(bId) || SEA_SET.has(bId);
  if (aW && bW) return 'water';
  return 'land';
}

// Gabriel 邻近图：A、B 连边，当且仅当以 AB 为直径的圆内没有第三个地点
function gabrielEdges(pts){
  const out = [];
  for (let i=0;i<pts.length;i++){
    for (let j=i+1;j<pts.length;j++){
      const a=pts[i], b=pts[j];
      const mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
      const r2=((a.x-b.x)**2+(a.y-b.y)**2)/4;
      let ok=true;
      for (let k=0;k<pts.length;k++){
        if (k===i||k===j) continue;
        const c=pts[k];
        if ((c.x-mx)**2+(c.y-my)**2 < r2-1e-6){ ok=false; break; }
      }
      if (ok) out.push([a.id,b.id]);
    }
  }
  return out;
}

// 节点防重叠：把过近的节点沿连线方向轻推开（仅为显示，地理大体保持）
function relaxPositions(){
  const minGap = 28;
  for (let it=0; it<80; it++){
    let moved=false;
    for (let i=0;i<nodes.length;i++){
      for (let j=i+1;j<nodes.length;j++){
        const a=nodes[i], b=nodes[j];
        let dx=b.x-a.x, dy=b.y-a.y;
        let d=Math.hypot(dx,dy)||0.0001;
        const gap=(a.type==='sect'||b.type==='sect')?minGap*0.8:minGap;
        if (d<gap){
          const push=(gap-d)/2, ux=dx/d, uy=dy/d;
          a.x-=ux*push; a.y-=uy*push; b.x+=ux*push; b.y+=uy*push;
          moved=true;
        }
      }
    }
    if (!moved) break;
  }
}

// ============ FIELD LABELS ============
const FIELD_LABELS = {
  landscape: '街市', people: '住民', livelihood: '营生', order: '治权',
  threats: '祸患', curiosities: '异闻', socialColor: '风情',
  role: '定位', footprint: '据点', publicFace: '外界形象', specialty: '专长',
  methods: '手段', relationToState: '与朝堂',
  manifestation: '显现', threatScale: '威胁等级', habits: '习性', officialView: '官方说法',
};
const SKIP_FIELDS = new Set(['id','name','type','x','y','tier','dangerLevel','summary','brief']);

// ============ DATA ============
const mapData = MAP_JSON_DATA.mapData;
const nodes = mapData.nodes;
const rawEdges = mapData.edges || [];
const nodeMap = {};
nodes.forEach(n => { nodeMap[n.id] = n; });

// 已知真实路名（取自原始 edges 的地理边，门派小径除外）
const nameDict = {};
rawEdges.forEach(e => {
  const a = e.from || e.source, b = e.to || e.target;
  if (e.label && !/小径/.test(e.label)) nameDict[pairKey(a, b)] = e.label;
});

// 1) 先做防重叠，拉开过密的节点
relaxPositions();

// 2) 路网：优先读取数据文件中固化的路网（含 terrain/kind/dist/cost）；
//    若数据未固化（旧格式），则按坐标实时生成（Gabriel）作为回退。
let edges = [];
(function buildNetwork(){
  const baked = rawEdges.filter(e => (e.from || e.source) && (e.to || e.target) && (e.terrain || e.kind));
  if (baked.length) {
    baked.forEach(e => {
      const a = e.from || e.source, b = e.to || e.target;
      if (!nodeMap[a] || !nodeMap[b]) return;
      const kind = e.kind || (e.terrain === 'sect' ? 'sect' : 'route');
      edges.push({
        from: a, to: b,
        label: e.label || '',
        terrain: e.terrain || (kind === 'sect' ? 'sect' : 'land'),
        kind,
        dist: e.dist, cost: e.cost
      });
    });
    return;
  }
  // —— 回退：按坐标实时生成 ——
  const geo = nodes.filter(n => GEO_TYPES.has(n.type));
  const seen = new Set();
  const addRoute = (a, b) => {
    const k = pairKey(a, b);
    if (a === b || seen.has(k)) return;
    seen.add(k);
    const terrain = decideTerrain(a, b);
    const na = nodeMap[a], nb = nodeMap[b];
    const dist = Math.hypot(na.x - nb.x, na.y - nb.y);
    const cost = Math.round(dist * terrainStyles[terrain].factor);
    edges.push({
      from: a, to: b,
      label: SPECIAL_SEA[k] || nameDict[k] || '',
      terrain, kind: 'route',
      dist: Math.round(dist), cost
    });
  };
  // Gabriel 邻近图
  gabrielEdges(geo).forEach(([a, b]) => addRoute(a, b));
  // 强制补上跨海航道，保证海上互通
  Object.keys(SPECIAL_SEA).forEach(k => { const [a, b] = k.split('|'); if (nodeMap[a] && nodeMap[b]) addRoute(a, b); });

  // 门派 / 异脉：沿用原始锚定关系，作为次要图层
  rawEdges.forEach(e => {
    const a = e.from || e.source, b = e.to || e.target;
    if (!nodeMap[a] || !nodeMap[b]) return;
    const isSect = /小径/.test(e.label || '') ||
      ['sect', 'faction'].includes(nodeMap[a].type) || ['sect', 'faction'].includes(nodeMap[b].type);
    if (!isSect) return;
    const k = pairKey(a, b);
    if (seen.has(k)) return;
    seen.add(k);
    edges.push({ from: a, to: b, label: '门派小径', terrain: 'sect', kind: 'sect' });
  });
})();

// adjacency for hover highlight
const adjacency = {};
edges.forEach((e, i) => {
  (adjacency[e.from] = adjacency[e.from] || new Set()).add(i);
  (adjacency[e.to] = adjacency[e.to] || new Set()).add(i);
});

// ============ STATE ============
const SPREAD = 2.9;
let viewX = 0, viewY = 0, scale = 0.6;
let isDragging = false, dragStartX = 0, dragStartY = 0, dragViewX = 0, dragViewY = 0;
let activeFilter = 'all';
let hoverId = null;

// ============ DOM ============
const container = document.getElementById('map-container');
const canvas = document.getElementById('edge-canvas');
const ctx = canvas.getContext('2d');
const nodeLayer = document.getElementById('node-layer');
const terrainLayer = document.getElementById('terrain-layer');
const minimap = document.getElementById('minimap');
const minimapCtx = minimap.getContext('2d');
const detailOverlay = document.getElementById('detail-overlay');
const detailHeader = document.getElementById('detail-header');
const detailSummary = document.getElementById('detail-summary');
const detailBody = document.getElementById('detail-body');
const detailClose = document.getElementById('detail-close');
const tooltip = document.getElementById('tooltip');

// ============ UTILS ============
function worldToScreen(wx, wy) {
  const cx = container.clientWidth / 2;
  const cy = container.clientHeight / 2;
  return { x: cx + (wx * SPREAD + viewX) * scale, y: cy + (wy * SPREAD + viewY) * scale };
}
function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
function isVisible(node) {
  if (activeFilter === 'noSect') return node.type !== 'sect';
  return true; // 'all' 与 'onlySect' 都渲染全部节点（onlySect 下非门派会被压暗作为底图参照）
}
function hashStr(s){ let h=0; for(let i=0;i<s.length;i++){ h=(h*31+s.charCodeAt(i))|0; } return h; }
function clampScale(){ return Math.min(1.15, Math.max(0.55, scale)); }

// ============ RESIZE ============
function resizeCanvas() {
  const dpr = devicePixelRatio || 1;
  canvas.width = container.clientWidth * dpr;
  canvas.height = container.clientHeight * dpr;
  canvas.style.width = container.clientWidth + 'px';
  canvas.style.height = container.clientHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// ============ RENDER TERRAIN（大区地形图标，最底层）============
let terrainElements = [];
function renderTerrain() {
  terrainLayer.innerHTML = '';
  terrainElements = [];
  TERRAIN_REGIONS.forEach(rg => {
    const lab = document.createElement('div');
    lab.className = 'terrain-label';
    lab.style.color = rg.color;
    lab.innerHTML = `<div class="t-name">${rg.name}</div><div class="t-sub">${rg.sub}</div>`;
    terrainLayer.appendChild(lab);
    terrainElements.push({ el: lab, x: rg.label[0], y: rg.label[1] });
  });
}
function updateTerrainPositions() {
  const cs = clampScale();
  terrainElements.forEach(({ el, x, y }) => {
    const p = worldToScreen(x, y);
    el.style.left = p.x + 'px';
    el.style.top = p.y + 'px';
    el.style.transform = `translate(-50%,-50%) scale(${cs})`;
  });
}

// ============ RENDER NODES ============
let nodeElements = [];
function renderNodes() {
  nodeLayer.innerHTML = '';
  nodeElements = [];
  nodes.forEach(n => {
    if (!isVisible(n)) return;
    const cfg = typeConfig[n.type] || typeConfig.faction;
    const wrapper = document.createElement('div');
    wrapper.className = 'node-wrapper';
    if (n.type === 'faction') wrapper.classList.add('faction-mark'); // 法尸：关外禁地标记，独立不接路网
    wrapper.dataset.type = n.type;
    wrapper.dataset.id = n.id;
    if (cfg.tier) wrapper.dataset.tier = cfg.tier;

    // “全部”视图下门派作为次要图层：缩小并隐藏常驻标签，避免挤成一坨
    const sectMuted = (n.type === 'sect' && activeFilter === 'all');
    if (sectMuted) wrapper.classList.add('sect-muted');
    // “只显示门派”视图下，非门派节点压暗作为底图参照
    if (activeFilter === 'onlySect' && n.type !== 'sect') wrapper.classList.add('mode-dim');
    const iconSize = sectMuted ? Math.round(cfg.size * 0.72) : cfg.size;

    const iconDiv = document.createElement('div');
    iconDiv.className = 'node-icon';
    iconDiv.innerHTML = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 32 32"><use href="#icon-${n.type}"/></svg>`;

    const label = document.createElement('div');
    label.className = 'node-label';
    label.style.fontSize = cfg.labelSize + 'px';
    label.textContent = n.name;

    wrapper.appendChild(iconDiv);
    wrapper.appendChild(label);

    wrapper.addEventListener('mouseenter', () => {
      hoverId = n.id;
      tooltip.style.display = 'block';
      document.getElementById('tt-name').textContent = n.name;
      document.getElementById('tt-type').textContent = `${cfg.label}${n.tier ? ' · ' + n.tier : ''}${n.dangerLevel ? ' · ' + n.dangerLevel : ''}`;
      const summary = (n.brief || n.summary || '').replace(/\n/g, ' ');
      document.getElementById('tt-summary').textContent = summary.length > 140 ? summary.substring(0, 140) + '…' : summary;
      applyHoverDim();
      renderEdges();
    });
    wrapper.addEventListener('mousemove', (ev) => {
      tooltip.style.left = (ev.clientX + 14) + 'px';
      tooltip.style.top = (ev.clientY + 14) + 'px';
      const tr = tooltip.getBoundingClientRect();
      if (tr.right > window.innerWidth - 8) tooltip.style.left = (ev.clientX - tr.width - 10) + 'px';
      if (tr.bottom > window.innerHeight - 8) tooltip.style.top = (ev.clientY - tr.height - 10) + 'px';
    });
    wrapper.addEventListener('mouseleave', () => {
      hoverId = null;
      tooltip.style.display = 'none';
      clearHoverDim();
      renderEdges();
    });
    wrapper.addEventListener('click', (ev) => {
      ev.stopPropagation();
      tooltip.style.display = 'none';
      openDetail(n);
    });

    nodeLayer.appendChild(wrapper);
    nodeElements.push({ el: wrapper, node: n });
  });
  updatePositions();
}

function applyHoverDim() {
  if (!hoverId) return;
  const connected = new Set([hoverId]);
  (adjacency[hoverId] || new Set()).forEach(i => {
    const e = edges[i];
    connected.add(e.from || e.source);
    connected.add(e.to || e.target);
  });
  nodeElements.forEach(({ el, node }) => {
    el.classList.toggle('dimmed', !connected.has(node.id));
  });
}
function clearHoverDim() {
  nodeElements.forEach(({ el }) => el.classList.remove('dimmed'));
}

function updatePositions() {
  const cs = clampScale();
  nodeElements.forEach(({ el, node }) => {
    const p = worldToScreen(node.x, node.y);
    el.style.left = p.x + 'px';
    el.style.top = p.y + 'px';
    el.style.transform = `translate(-50%,-50%) scale(${cs})`;
    const lbl = el.querySelector('.node-label');
    if (lbl) lbl.style.opacity = scale < 0.4 ? '0' : scale < 0.6 ? '0.65' : '1';
  });
  updateTerrainPositions();
}

// ============ RENDER EDGES (curved + categorized + de-cluttered labels) ============
function edgeConnectedToHover(e) {
  if (!hoverId) return false;
  return (e.from || e.source) === hoverId || (e.to || e.target) === hoverId;
}

function renderEdges() {
  const w = container.clientWidth, h = container.clientHeight;
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = 'round';
  // 先画门派小径（最底层最淡），再陆/水，最后险路与海路（最醒目）
  const drawList = edges.map((e, i) => ({ e, i, cat: e.kind === 'sect' ? 'sect' : e.terrain }));

  ['sect', 'land', 'water', 'highland', 'sea'].forEach(catKey => {
    const st = terrainStyles[catKey];
    drawList.forEach(({ e, cat }) => {
      if (cat !== catKey) return;
      const src = nodeMap[e.from || e.source];
      const tgt = nodeMap[e.to || e.target];
      if (!src || !tgt) return;
      const isHot = edgeConnectedToHover(e);
      if (e.kind === 'sect') {
        if (activeFilter === 'noSect') return;          // 隐藏门派：不画小径
        if (activeFilter === 'all' && !isHot) return;   // 全部：默认藏，悬停相连才显
      } else {
        if (activeFilter === 'onlySect') return;        // 只显示门派：藏起所有干道
      }
      let alpha = st.alpha;
      if (hoverId && !isHot) alpha *= 0.16;

      const s = worldToScreen(src.x, src.y);
      const t = worldToScreen(tgt.x, tgt.y);
      const ctrl = curveCtrl(src, tgt, s, t);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = st.color;
      ctx.lineWidth = (isHot ? st.width + 1.1 : st.width) * Math.max(scale, 0.55);
      ctx.setLineDash(st.dash.map(d => d * Math.max(scale, 0.5)));
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.quadraticCurveTo(ctrl.x, ctrl.y, t.x, t.y);
      ctx.stroke();
      ctx.restore();
    });
  });

  drawEdgeLabels(drawList);
}

// 统一的曲线控制点：依据两端点 id 做确定性弯曲方向，避免直线挤叠
function curveCtrl(src, tgt, s, t) {
  const mx = (s.x + t.x) / 2, my = (s.y + t.y) / 2;
  const dx = t.x - s.x, dy = t.y - s.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const dir = ((hashStr((src.id || '') + (tgt.id || '')) & 1) ? 1 : -1);
  const bend = Math.min(len * 0.14, 46) * dir;
  return { x: mx + nx * bend, y: my + ny * bend };
}
// 二次贝塞尔 t=0.5 处的点（曲线顶点附近）
function curveMid(s, ctrl, t) {
  return { x: 0.25 * s.x + 0.5 * ctrl.x + 0.25 * t.x, y: 0.25 * s.y + 0.5 * ctrl.y + 0.25 * t.y };
}

function drawEdgeLabels(drawList) {
  if (scale < 0.62) return;
  ctx.save();
  const fs = Math.max(10, 11 * scale);
  ctx.font = `500 ${fs}px 'Noto Serif SC', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 节点屏幕矩形（避让）
  const cs = clampScale();
  const nodeRects = [];
  nodes.forEach(n => {
    if (!isVisible(n)) return;
    const p = worldToScreen(n.x, n.y);
    const cfg = typeConfig[n.type] || typeConfig.faction;
    const hw = (cfg.size * 0.5 + 34) * cs;
    const hh = (cfg.size * 0.5 + 13) * cs;
    nodeRects.push({ x: p.x - hw, y: p.y - hh, w: hw * 2, h: hh * 2 });
  });

  const placed = [];           // 已放置的标签矩形（含同名去重）
  const DEDUP_DIST = 150;      // 同名标签的最小屏幕间距
  ctx.setLineDash([]);

  drawList.forEach(({ e, cat }) => {
    let text = e.label || '';
    // 悬停某节点时，其相连干道显示路名 + 估算路程（耗时基础）
    if (hoverId && edgeConnectedToHover(e) && e.kind === 'route') {
      text = (e.label ? e.label + ' · ' : '') + e.cost + '程';
    }
    if (!text) return;
    if (cat === 'sect') {
      // 门派小径：仅“只显示门派”视图下、或悬停相连时才标注
      if (!(activeFilter === 'onlySect' || edgeConnectedToHover(e))) return;
    } else {
      if (activeFilter === 'onlySect') return; // 只显示门派时不标注干道
    }
    // hover 模式：只标注相连的边，避免满屏文字
    if (hoverId && !edgeConnectedToHover(e)) return;

    const src = nodeMap[e.from || e.source];
    const tgt = nodeMap[e.to || e.target];
    if (!src || !tgt) return;

    const s = worldToScreen(src.x, src.y);
    const t = worldToScreen(tgt.x, tgt.y);
    const ctrl = curveCtrl(src, tgt, s, t);
    let m = curveMid(s, ctrl, t);
    let mx = m.x, my = m.y;

    const tw = ctx.measureText(text).width;
    const ph = Math.max(15, 17 * scale);
    const pw = tw + 14;

    // 同名去重：附近已有同样文字则跳过（消灭“中原官道”刷屏）
    let dup = false;
    for (const p of placed) {
      if (p.text === text && Math.hypot(p.x - mx, p.y - my) < DEDUP_DIST) { dup = true; break; }
    }
    if (dup) return;

    // 沿法线方向轻推避让节点 / 已有标签
    const dx = t.x - s.x, dy = t.y - s.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const step = 13;
    for (let attempt = 0; attempt < 7; attempt++) {
      let bad = false;
      for (const nr of nodeRects) {
        if (rectsOverlap(mx - pw/2, my - ph/2, pw, ph, nr.x, nr.y, nr.w, nr.h)) { bad = true; break; }
      }
      if (!bad) {
        for (const p of placed) {
          if (rectsOverlap(mx - pw/2, my - ph/2, pw, ph, p.x - p.w/2, p.y - p.h/2, p.w, p.h)) { bad = true; break; }
        }
      }
      if (!bad) break;
      if (attempt % 2 === 0) { mx += nx * step; my += ny * step; }
      else { mx -= nx * step * 2; my -= ny * step * 2; }
    }

    const st = terrainStyles[cat];
    ctx.fillStyle = 'rgba(32,40,58,0.86)';
    ctx.beginPath();
    ctx.roundRect(mx - pw/2, my - ph/2, pw, ph, 4);
    ctx.fill();
    ctx.strokeStyle = st.color;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = st.color;
    ctx.fillText(text, mx, my);

    placed.push({ x: mx, y: my, w: pw, h: ph, text });
  });
  ctx.restore();
}

// ============ DETAIL MODAL ============
function openDetail(node) {
  const cfg = typeConfig[node.type] || typeConfig.faction;
  detailHeader.innerHTML = `
    <div class="detail-title">${escHtml(node.name)}</div>
    <span class="detail-badge">${escHtml(cfg.label)}</span>
    ${node.tier ? `<span class="detail-badge">${escHtml(node.tier)}</span>` : ''}
    ${node.dangerLevel ? `<span class="detail-badge">${escHtml(node.dangerLevel)}</span>` : ''}
  `;
  detailSummary.textContent = node.summary || node.brief || '';
  let bodyHtml = '';
  for (const [key, val] of Object.entries(node)) {
    if (SKIP_FIELDS.has(key)) continue;
    const lbl = FIELD_LABELS[key];
    if (!lbl) continue;
    if (val == null || val === '') continue;
    const strVal = (typeof val === 'object' ? JSON.stringify(val) : String(val)).trim();
    if (!strVal) continue;
    bodyHtml += `<div class="detail-section">
      <div class="detail-section-title">${escHtml(lbl)}</div>
      <div class="detail-section-content">${escHtml(strVal)}</div>
    </div>`;
  }
  detailBody.innerHTML = bodyHtml;
  detailOverlay.classList.add('active');
}
detailClose.addEventListener('click', () => detailOverlay.classList.remove('active'));
detailOverlay.addEventListener('click', (ev) => { if (ev.target === detailOverlay) detailOverlay.classList.remove('active'); });

// ============ PAN & ZOOM ============
container.addEventListener('mousedown', (ev) => {
  if (ev.target.closest('.node-wrapper')) return;
  isDragging = true;
  dragStartX = ev.clientX; dragStartY = ev.clientY;
  dragViewX = viewX; dragViewY = viewY;
  container.classList.add('grabbing');
});
window.addEventListener('mousemove', (ev) => {
  if (!isDragging) return;
  viewX = dragViewX + (ev.clientX - dragStartX) / scale;
  viewY = dragViewY + (ev.clientY - dragStartY) / scale;
  render();
});
window.addEventListener('mouseup', () => { isDragging = false; container.classList.remove('grabbing'); });
container.addEventListener('wheel', (ev) => {
  ev.preventDefault();
  const factor = ev.deltaY > 0 ? 0.9 : 1.1;
  scale = Math.max(0.25, Math.min(3.5, scale * factor));
  render();
}, { passive: false });

document.getElementById('zoom-in').addEventListener('click', () => { scale = Math.min(3.5, scale * 1.2); render(); });
document.getElementById('zoom-out').addEventListener('click', () => { scale = Math.max(0.25, scale / 1.2); render(); });
document.getElementById('zoom-reset').addEventListener('click', () => { scale = 0.6; viewX = 0; viewY = 0; render(); });

// ============ MINIMAP ============
function renderMinimap() {
  const dpr = devicePixelRatio || 1;
  const mw = 150, mh = 118;
  minimap.width = mw * dpr;
  minimap.height = mh * dpr;
  minimap.style.width = mw + 'px';
  minimap.style.height = mh + 'px';
  minimapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  minimapCtx.clearRect(0, 0, mw, mh);
  minimapCtx.fillStyle = 'rgba(18,24,38,0.8)';
  minimapCtx.fillRect(0, 0, mw, mh);

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  nodes.forEach(n => {
    if (!isVisible(n)) return;
    minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
    minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
  });
  if (!isFinite(minX)) return;
  const pad = 16, rangeX = (maxX - minX) || 1, rangeY = (maxY - minY) || 1;
  const s = Math.min((mw - pad*2) / rangeX, (mh - pad*2) / rangeY);
  const offX = pad + (mw - pad*2 - rangeX*s) / 2;
  const offY = pad + (mh - pad*2 - rangeY*s) / 2;

  minimapCtx.strokeStyle = 'rgba(143,202,173,0.16)';
  minimapCtx.lineWidth = 0.5;
  edges.forEach(e => {
    const src = nodeMap[e.from || e.source];
    const tgt = nodeMap[e.to || e.target];
    if (!src || !tgt) return;
    if (e.kind === 'sect') return; // 小地图不画门派小径，保持干净
    if (activeFilter !== 'all' && !isVisible(src) && !isVisible(tgt)) return;
    minimapCtx.beginPath();
    minimapCtx.moveTo(offX + (src.x - minX) * s, offY + (src.y - minY) * s);
    minimapCtx.lineTo(offX + (tgt.x - minX) * s, offY + (tgt.y - minY) * s);
    minimapCtx.stroke();
  });

  nodes.forEach(n => {
    if (!isVisible(n)) return;
    const cfg = typeConfig[n.type] || typeConfig.faction;
    minimapCtx.fillStyle = cfg.color;
    minimapCtx.beginPath();
    const r = (n.type === 'capital') ? 3 : (n.type === 'city' ? 2.2 : 1.5);
    minimapCtx.arc(offX + (n.x - minX) * s, offY + (n.y - minY) * s, r, 0, Math.PI * 2);
    minimapCtx.fill();
  });
}

// ============ LEGEND ============
function renderLegend() {
  const legend = document.getElementById('legend');
  const title = document.getElementById('legend-title');
  title.addEventListener('click', () => legend.classList.toggle('collapsed'));
  const items = document.getElementById('legend-items');
  items.innerHTML = '';
  const usedTypes = new Set(nodes.map(n => n.type));
  Object.entries(typeConfig).forEach(([type, cfg]) => {
    if (!usedTypes.has(type)) return;
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<svg width="15" height="15" viewBox="0 0 32 32"><use href="#icon-${type}"/></svg><span>${cfg.label}</span>`;
    items.appendChild(item);
  });
  const routesBox = document.getElementById('legend-routes');
  routesBox.innerHTML = '';
  Object.values(terrainStyles).forEach(st => {
    const row = document.createElement('div');
    row.className = 'legend-route';
    row.innerHTML = `<span class="legend-swatch" style="border-top-color:${st.color};border-top-style:${st.dash.length?'dashed':'solid'}"></span><span>${st.label}</span>`;
    routesBox.appendChild(row);
  });
}

// ============ FILTER ============
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderNodes();
    render();
  });
});

// ============ MAIN RENDER ============
function render() {
  resizeCanvas();
  renderEdges();
  updatePositions();
  renderMinimap();
}

// ============ INIT ============
function init() {
  renderTerrain();
  renderNodes();
  renderLegend();
  render();
}
window.addEventListener('resize', () => { renderNodes(); render(); });
init();
</script>
</body>
</html>
