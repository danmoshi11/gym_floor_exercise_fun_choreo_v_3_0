// ==========================================
// GymChoreo 独家数据密钥压缩与口令分享引擎 (share_engine.js)
// ==========================================

const ShareEngine = {
    // 1. 【高阶抽样压缩】：将轨迹点集脱水压榨，极大缩减口令长度
    compressTrack: function(t) {
        let sampledPoints = t.points;
        
        if (t.type === 'curve' && t.points.length > 8) {
            // 几何抽样：曲线每 4 个点只留 1 个，缩短 75% 的坐标数据！
            sampledPoints = t.points.filter((_, idx) => idx % 4 === 0);
            if ((t.points.length - 1) % 4 !== 0) {
                sampledPoints.push(t.points[t.points.length - 1]);
            }
        } else if (t.type === 'line' && t.points.length >= 2) {
            // 直线只需要保留起点和终点
            sampledPoints = [t.points[0], t.points[t.points.length - 1]];
        }

        return {
            ty: t.type,
            pts: sampledPoints.map(p => [Math.round(p.x), Math.round(p.y)]), 
            // 复合绑定 ID 和 名字，防止动作被张冠李戴
            sk: t.skills.map(s => `${s.id}|${s.nameZh[0]}`),
            ct: t.connections || [],
            nd: t.nd || 0
        };
    },

    // 2. 【双模生成引擎】：支持生成历史卡片数据 或 当前画布数据
    generateShareCode: function(customRoutinePayload = null) {
        let routinePayload;

        if (customRoutinePayload) {
            // A. 如果传入了特定成套数据（从历史草稿箱点击）
            routinePayload = {
                name: customRoutinePayload.name,
                brand: customRoutinePayload.brand,
                gName: customRoutinePayload.gName || "未知选手",
                gMode: customRoutinePayload.gMode || "none",
                tracks: customRoutinePayload.tracks.map(t => this.compressTrack(t))
            };
        } else {
            // B. 否则默认读取画布（从工作台点分享）
            if (!canvasManager || canvasManager.tracks.length === 0) return null;
            routinePayload = {
                name: window.currentRoutineData?.name || "未命名成套",
                brand: window.currentRoutineData?.brand || "gymnova",
                gName: window.currentRoutineData?.gymnastName || "未知选手",
                gMode: window.currentRoutineData?.gymnastMode || "none",
                tracks: canvasManager.tracks.map(t => this.compressTrack(t))
            };
        }

        const jsonStr = JSON.stringify(routinePayload);
        const utf8Bytes = encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
        });
        
        // 🚨 把下面这一行：
        // return `#GYM-${btoa(utf8Bytes).slice(0, -2)}#`;
        
        // ✨ 修改为绝对完整的安全形态：
        return `#GYM-${btoa(utf8Bytes)}#`;
    },

    // 3. 【解密还原】：将口令逆向还原并兼容双重定位
    parseShareCode: function(code) {
        try {
            if (!code.startsWith('#GYM-') || !code.endsWith('#')) {
                if(typeof ToastManager !== 'undefined') ToastManager.show('error', '口令格式无效', '无效的口令格式！请检查复制是否完整。');
                return null;
            }
            const base64Str = code.slice(5, -1);
            const binaryStr = atob(base64Str);
            const jsonStr = decodeURIComponent(binaryStr.split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonStr);

            const restoredTracks = payload.tracks.map(t => {
                const fullSkills = t.sk.map(item => {
                    // 支持复合解密 "ID|中文名"
                    if (item.includes('|')) {
                        const [id, name] = item.split('|');
                        return skillsData.find(s => s.id === id && s.nameZh[0] === name);
                    }
                    return skillsData.find(s => s.id === item);
                }).filter(Boolean);
                
                return {
                    id: 'track_' + Date.now() + '_' + Math.random(),
                    type: t.ty,
                    points: t.pts.map(p => ({ x: p[0], y: p[1] })),
                    skills: fullSkills,
                    connections: t.ct,
                    connectionType: 'direct',
                    nd: t.nd,
                    color: t.ty === 'transit' ? '#9ca3af' : canvasManager.morandiColors[Math.floor(Math.random() * 8)]
                };
            });

            return {
                name: payload.name,
                brand: payload.brand,
                gName: payload.gName,
                gMode: payload.gMode,
                tracks: restoredTracks
            };
        } catch (e) {
            console.error(e);
            if(typeof ToastManager !== 'undefined') ToastManager.show('warning', '口令解析失败', '口令损坏或版本不匹配。');
            return null;
        }
    },

    // 4. 【异步托管】：提取码直接移交云端引擎
    importRoutineWorkflow: function() {
        const code = prompt("📥 请输入好友分享给您的 6 位数成套提取码 (例如 X7R2Y9)：");
        if (!code || code.trim() === "") return;

        if (typeof SupabaseEngine !== 'undefined') {
            SupabaseEngine.importByShortCode(code.trim());
        } else {
            if(typeof ToastManager !== 'undefined') ToastManager.show('error', '连接失败', '云端引擎尚未准备就绪，请刷新重试！');
        }
    }
};

window.ShareEngine = ShareEngine;