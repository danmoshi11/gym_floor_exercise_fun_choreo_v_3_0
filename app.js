// ==========================================
// 自由体操系统 中枢控制台 (app.js)
// ==========================================

const ToastManager = {
    timer: null,
    // type: 'success' | 'error' | 'warning' | 'info' | 'coin'
    show: function(type, title, message, duration = 3500) {
        const toast = document.getElementById('globalToast');
        if (!toast) return;

        const iconBox = document.getElementById('toastIconBox');
        const titleEl = document.getElementById('toastTitle');
        const msgEl = document.getElementById('toastMessage');

        // 基础重置
        toast.className = "fixed top-6 left-1/2 transform -translate-x-1/2 -translate-y-40 opacity-0 z-[9999] bg-white border-2 rounded-2xl shadow-2xl p-4 flex items-center gap-4 transition-all duration-500 pointer-events-none min-w-[300px] max-w-[90%]";
        iconBox.className = "w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner shrink-0";

        // 核心：根据不同类型动态上色
        if (type === 'success') {
            toast.classList.add('border-emerald-300');
            iconBox.classList.add('bg-gradient-to-br', 'from-emerald-100', 'to-teal-100', 'border', 'border-emerald-200');
            iconBox.innerHTML = '✅';
        } else if (type === 'error') {
            toast.classList.add('border-rose-300');
            iconBox.classList.add('bg-gradient-to-br', 'from-rose-100', 'to-red-100', 'border', 'border-rose-200');
            iconBox.innerHTML = '❌';
        } else if (type === 'warning') {
            toast.classList.add('border-amber-300');
            iconBox.classList.add('bg-gradient-to-br', 'from-amber-100', 'to-orange-100', 'border', 'border-amber-200');
            iconBox.innerHTML = '⚠️';
        } else if (type === 'coin') {
            toast.classList.add('border-amber-300');
            iconBox.classList.add('bg-gradient-to-br', 'from-amber-100', 'to-yellow-100', 'border', 'border-amber-200');
            iconBox.innerHTML = '🎁';
        } else {
            toast.classList.add('border-blue-300');
            iconBox.classList.add('bg-gradient-to-br', 'from-blue-100', 'to-indigo-100', 'border', 'border-blue-200');
            iconBox.innerHTML = '💡';
        }

        titleEl.innerText = title;
        // 支持 HTML 标签注入和换行
        msgEl.innerHTML = message.replace(/\n/g, '<br>');

        // 丝滑滑入
        toast.classList.remove('-translate-y-40', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');

        // 清除旧定时器，防止连续点击导致闪烁
        if (this.timer) clearTimeout(this.timer);

        // 丝滑滑出
        this.timer = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('-translate-y-40', 'opacity-0');
        }, duration);
    }
};
const CoinManager = {
    getCoins: function() { 
        return parseInt(localStorage.getItem('gymCoins') || '0'); 
    },
    addCoins: function(amount) {
        let current = this.getCoins();
        localStorage.setItem('gymCoins', current + amount);
        this.updateUI();
    },
    deductCoins: function(amount) {
        let current = this.getCoins();
        if (current >= amount) {
            localStorage.setItem('gymCoins', current - amount);
            this.updateUI();
            return true;
        }
        return false;
    },
    checkDailyLogin: function() {
        const todayStr = new Date().toLocaleDateString();
        const lastLogin = localStorage.getItem('gymLastLogin');
        
        if (lastLogin !== todayStr) {
            this.addCoins(100);
            localStorage.setItem('gymLastLogin', todayStr);
            // 调用全局引擎，炫酷发钱！
            setTimeout(() => {
                ToastManager.show('coin', '每日签到成功！', '系统已为您发放 <span class="text-amber-500 text-sm font-black bg-amber-50 px-1.5 rounded border border-amber-100 ml-0.5">100 🪙</span>');
            }, 1500);
        }
        this.updateUI();
    },
    // ✨ 新增：控制悬浮窗滑入和滑出的动画函数
    showCoinToast: function() {
        const toast = document.getElementById('coinToast');
        if (!toast) return;
        
        // 滑下来显示
        toast.classList.remove('-translate-y-32', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
        
        // 停留 3.5 秒后，自动滑上去隐藏
        setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('-translate-y-32', 'opacity-0');
        }, 3500);
    },
    updateUI: function() {
        const el = document.getElementById('coinDisplay');
        if (el) el.innerText = this.getCoins();
    }
};

const AppController = {
    modal: {
        currentTrackId: null,
        skills: [],
        connectionType: 'direct'
    },

    init: function() {
        CoinManager.checkDailyLogin();
        this.renderDictionary(skillsData);
        this.renderHistory();
        document.getElementById('searchInput').addEventListener('input', () => this.filterDictionary());
        document.getElementById('groupFilter').addEventListener('change', () => this.filterDictionary());
        document.getElementById('diffFilter').addEventListener('change', () => this.filterDictionary());
    
        // 【新增】初始化加载选手名单
        const selector = document.getElementById('gymnastSelector');
        if (selector && typeof gymnastsData !== 'undefined') {
            gymnastsData.forEach(g => {
                const option = document.createElement('option');
                option.value = g.id;
                option.textContent = `${g.country} | ${g.nameEn}`;
                selector.appendChild(option);
            });
        }
        window.currentRoutineData = window.currentRoutineData || {};
        this.setGymnastMode('none');
    },

    // ==========================================
    // 附加模块：选手身份管家与国旗 Emoji 引擎
    // ==========================================
    // ==========================================
    // 附加模块：选手身份管家与国旗引擎 (使用 FlagCDN 突破 Windows 限制)
    // ==========================================
    getFlag: function(code) {
        // 映射国家代码到 ISO 3166-1 alpha-2 格式
        const flagMap = {
            'CHN': 'cn', 'USA': 'us', 'BRA': 'br', 'FRA': 'fr', 'ITA': 'it', 'JPN': 'jp',
            'GBR': 'gb', 'ROU': 'ro', 'CAN': 'ca', 'PHI': 'ph', 'KOR': 'kr', 'NED': 'nl',
            'AUS': 'au', 'ESP': 'es', 'GER': 'de', 'ALG': 'dz', 'AUT': 'at', 'BEL': 'be',
            'COL': 'co', 'CZE': 'cz', 'EGY': 'eg', 'HAI': 'ht', 'HUN': 'hu', 'MEX': 'mx',
            'NZL': 'nz', 'PAN': 'pa', 'POR': 'pt', 'PRK': 'kp', 'RSA': 'za', 'SLO': 'si',
            'SUI': 'ch', 'UKR': 'ua'
        };
        const iso = flagMap[code];
        if (iso) {
            // 直接返回高清国旗图片标签
            return `<img src="https://flagcdn.com/w40/${iso}.png" class="inline-block w-5 h-3.5 rounded-[2px] object-cover shadow-sm align-middle" alt="${code}">`;
        }
        return '🏳️'; 
    },

    setGymnastMode: function(mode) {
        window.currentRoutineData.gymnastMode = mode;
        const display = document.getElementById('setupGymnastDisplay');
        const customInput = document.getElementById('customGymnastNameInput');
        const avatarBox = document.getElementById('setupGymnastAvatar');
        
        if (mode === 'none') {
            display.classList.remove('hidden');
            if(customInput) customInput.classList.add('hidden');
            avatarBox.innerHTML = '<span class="text-slate-400">🙈</span>';
            document.getElementById('setupGymnastFlag').innerHTML = '';
            document.getElementById('setupGymnastName').innerText = '纯排位测试 (无E分)';
            document.getElementById('setupGymnastStats').innerText = '系统将仅计算 D 分';
        } else if (mode === 'custom') {
            display.classList.add('hidden');
            if(customInput) customInput.classList.remove('hidden');
        } else {
            // 从数据库选定
            const g = gymnastsData.find(x => x.id === mode);
            display.classList.remove('hidden');
            if(customInput) customInput.classList.add('hidden');
            
            
            // 【核心修改】：动态拼接 assets 路径，并加上 onerror 容错保护
            const imgPath = `./assets/${g.id}.png`; // 如果你存的是 jpg，请改为 .jpg
            avatarBox.innerHTML = `<img src="${imgPath}" class="w-full h-full object-cover" onerror="this.outerHTML='<span class=\\'text-slate-300\\'>👤</span>'">`;
            
            document.getElementById('setupGymnastFlag').innerHTML = this.getFlag(g.country);
            document.getElementById('setupGymnastName').innerText = g.nameEn;
            document.getElementById('setupGymnastStats').innerText = `已载入该选手专属模型`;
            const currentBrand = window.currentRoutineData ? window.currentRoutineData.brand : 'gymnova';
            if (currentBrand === 'gaofei' && g.country !== 'CHN') {
                ToastManager.show('warning', '器材切换提示', '当前选中选手为非中国籍，无法适应高飞场地，系统已自动切回默认 Gymnova 场地。');
                if (typeof selectBrand === 'function') selectBrand('gymnova');
            }
            
        }
    },

    openGymnastModal: function() {
        document.getElementById('gymnastModal').classList.remove('hidden');
        this.renderGymnastList(gymnastsData);
        
        // 绑定搜索逻辑
        document.getElementById('gymnastSearch').oninput = (e) => {
            const q = e.target.value.toLowerCase();
            const filtered = gymnastsData.filter(g => 
                g.nameEn.toLowerCase().includes(q) || g.country.toLowerCase().includes(q)
            );
            this.renderGymnastList(filtered);
        };
    },

    closeGymnastModal: function() {
        document.getElementById('gymnastModal').classList.add('hidden');
    },

    renderGymnastList: function(data) {
        const grid = document.getElementById('gymnastListGrid');
        grid.innerHTML = '';
        if (data.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-slate-400 py-10">未找到相关选手...</p>';
            return;
        }
        data.forEach(g => {
            const flag = this.getFlag(g.country);
            const imgPath = `./assets/${g.id}.png`; // 这里拼接路径
            
            grid.innerHTML += `
                <div onclick="AppController.selectGymnast('${g.id}')" class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-400 cursor-pointer flex items-center gap-4 transition-all transform hover:-translate-y-1">
                    <div class="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex justify-center items-center text-3xl shadow-inner">
                        <img src="${imgPath}" class="w-full h-full object-cover" onerror="this.outerHTML='<span class=\\'text-slate-300 flex items-center justify-center w-full h-full\\'>👤</span>'">
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <div class="text-[10px] font-bold text-slate-400 mb-0.5 tracking-widest flex items-center gap-1">${g.country}</div>
                        <div class="font-black text-slate-800 text-base truncate flex items-center gap-2" title="${g.nameEn}">
                            <span>${flag}</span>
                            <span class="truncate">${g.nameEn}</span>
                        </div>
                        <div class="text-xs text-blue-600 font-bold mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded-md border border-blue-100">已内置数据</div>
                    </div>
                </div>
            `;
        });
    },

    selectGymnast: function(id) {
        this.setGymnastMode(id);
        this.closeGymnastModal();
    },

    // 【新增】监听选手选择下拉框变化
    handleGymnastChange: function() {
        const val = document.getElementById('gymnastSelector').value;
        const customInput = document.getElementById('customGymnastName');
        if (val === 'custom') {
            customInput.classList.remove('hidden');
        } else {
            customInput.classList.add('hidden');
        }
    },
    

    renderDictionary: function(data) {
        const grid = document.getElementById('skillsGrid');
        grid.innerHTML = '';
        if (data.length === 0) {
            grid.innerHTML = `<p class="col-span-full text-center py-10 text-gray-400">未找到匹配的动作</p>`;
            return;
        }
        data.forEach(skill => {
            const isAcro = skill.id.startsWith('4.') || skill.id.startsWith('5.');
            const bgClass = isAcro ? 'bg-blue-50' : 'bg-green-50'; 
            grid.innerHTML += `
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div class="${bgClass} p-2 flex justify-center">
                        <img src="${skill.image}" class="h-24 object-contain mix-blend-multiply" alt="${skill.nameZh[0]}">
                    </div>
                    <div class="p-3">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-xs font-mono text-gray-400">ID: ${skill.id}</span>
                            <span class="px-2 py-0.5 bg-diff-${skill.difficulty} text-white font-bold rounded-md text-xs">${skill.difficulty} (${skill.value})</span>
                        </div>
                        <h4 class="font-bold text-gray-800 text-sm mb-1 truncate" title="${skill.nameZh[0]}">${skill.nameZh[0]}</h4>
                    </div>
                </div>
            `;
        });
    },

    filterDictionary: function() {
        const query = document.getElementById('searchInput').value.toLowerCase();
        const group = document.getElementById('groupFilter').value;
        const diff = document.getElementById('diffFilter').value;
        const filtered = skillsData.filter(skill => {
            const matchName = skill.nameZh.join(" ").toLowerCase().includes(query) || skill.nameEn.toLowerCase().includes(query);
            const matchGroup = group === 'all' || skill.id.startsWith(group + '.');
            const matchDiff = diff === 'all' || skill.difficulty === diff;
            return matchName && matchGroup && matchDiff;
        });
        this.renderDictionary(filtered);
    },

    // 【新增】：侧边栏点击一键呼出弹窗
    openModalById: function(trackId) {
        const track = canvasManager.tracks.find(t => t.id === trackId);
        if (track) {
            this.openModal(track);
        }
    },

    openModal: function(track) {
        if (track.type === 'transit') {
            canvasManager.updateTrackSkills(track.id, [{nameZh: ["移动路线"], difficulty: "-"}], 'direct');
            this.updateUIRoutineList();
            return;
        }

        this.modal.currentTrackId = track.id;
        const isEditing = track.skills && track.skills.length > 0;
        this.modal.skills = track.skills ? [...track.skills] : [];
        this.modal.connections = track.connections ? [...track.connections] : Array(Math.max(0, this.modal.skills.length - 1)).fill('direct');
        document.getElementById('skillModal').classList.remove('hidden');
        
        let availableSkills = [];
        let title = "";
        let prefix = isEditing ? "✏️ 修改" : "➕ 配置";
        
        if (track.type === 'line') {
            title = `${prefix}技巧空翻串`;
            availableSkills = skillsData.filter(s => /^[345]\./.test(s.id));
        } else if (track.type === 'curve') {
            title = `${prefix}舞蹈跳步串`;
            availableSkills = skillsData.filter(s => s.id.startsWith('1.'));
        } else if (track.type === 'point') {
            title = `${prefix}定点立转`;
            availableSkills = skillsData.filter(s => s.id.startsWith('2.'));
        }

        if (isEditing) {
            let trackIndex = canvasManager.tracks.findIndex(t => t.id === track.id) + 1;
            title = `${title} (路线 ${trackIndex})`;
        }

        document.getElementById('modalTitle').innerText = title;
        document.getElementById('modalConfirmBtn').innerText = isEditing ? "保存修改" : "写入画板";

        this.generateRecommendations(track.type);
        
        // ✨【核心改造】：将总库交由弹窗引擎管理，初始化默认难度过滤为 'all'
        this.modal.availableSkills = availableSkills;
        this.modal.currentDiffFilter = 'all';
        
        this.renderModalDiffFilter(); // 渲染 A-J 按钮
        this.filterModalList();       // 替代直接渲染，走一道过滤网

        // 更新搜索框绑定事件
        document.getElementById('modalSearch').oninput = () => this.filterModalList();
        this.updateCartUI();
    },

    // ✨【新增 1】渲染 A-J 难度按钮
    renderModalDiffFilter: function() {
        const bar = document.getElementById('modalDiffFilterBar');
        if (!bar) return;
        const diffs = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        
        let html = `<button onclick="AppController.setModalDiffFilter('all')" class="px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 ${this.modal.currentDiffFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}">所有难度</button>`;
        
        diffs.forEach(d => {
            let isSelected = this.modal.currentDiffFilter === d;
            html += `<button onclick="AppController.setModalDiffFilter('${d}')" class="px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}">${d} 组</button>`;
        });
        bar.innerHTML = html;
    },

    // ✨【新增 2】切换难度标签状态
    setModalDiffFilter: function(diff) {
        this.modal.currentDiffFilter = diff;
        this.renderModalDiffFilter(); // 重新渲染高亮
        this.filterModalList();       // 触发过滤
    },

    // ✨【新增 3】联合搜素 (搜索框 + 难度按钮)
    filterModalList: function() {
        const q = (document.getElementById('modalSearch').value || '').toLowerCase();
        const diff = this.modal.currentDiffFilter;
        
        const filtered = this.modal.availableSkills.filter(s => {
            const matchQ = s.nameZh.join(" ").toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q);
            const matchD = diff === 'all' || s.difficulty === diff;
            return matchQ && matchD;
        });
        
        this.renderModalList(filtered);
    },

    generateRecommendations: function(trackType) {
        const bar = document.getElementById('recommendationBar');
        bar.innerHTML = '';
        let recs = [];
        if (trackType === 'line') {
            const lineCount = canvasManager.tracks.filter(t => t.type === 'line').length;
            if (lineCount === 1) recs = skillsData.filter(s => /^[45]\./.test(s.id) && ['F','G','H','I','J'].includes(s.difficulty));
            else if (lineCount === 2) recs = skillsData.filter(s => /^[45]\./.test(s.id) && ['E','F'].includes(s.difficulty));
            else recs = skillsData.filter(s => /^[45]\./.test(s.id) && ['C','D'].includes(s.difficulty));
        } else if (trackType === 'curve') {
            recs = skillsData.filter(s => s.id.startsWith('1.') && s.tags && s.tags.includes('cr1'));
        } else {
            recs = skillsData.filter(s => s.id.startsWith('2.') && ['C','D','E'].includes(s.difficulty));
        }
        recs.sort(() => 0.5 - Math.random()).slice(0, 5).forEach(skill => {
            bar.innerHTML += `<button onclick="AppController.addToCart('${skill.id}', '${skill.nameZh[0]}')" class="flex-shrink-0 bg-white border border-blue-200 hover:border-blue-500 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm transition-colors"><span class="text-xs font-bold text-blue-600">${skill.difficulty}</span><span class="text-sm text-gray-700">${skill.nameZh[0]}</span></button>`;
        });
    },

    renderModalList: function(skills) {
        const list = document.getElementById('modalSkillList');
        list.innerHTML = '';
        skills.forEach(skill => {
            list.innerHTML += `
                <div onclick="AppController.addToCart('${skill.id}', '${skill.nameZh[0]}')" class="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer flex justify-between items-center transition-all hover:border-blue-300">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-[10px] font-mono bg-gray-100 px-1.5 rounded text-gray-500">${skill.id}</span>
                            <span class="text-xs font-bold bg-diff-${skill.difficulty} text-white px-1.5 rounded">${skill.difficulty}</span>
                        </div>
                        <h4 class="font-bold text-gray-800 text-sm">${skill.nameZh[0]}</h4>
                    </div>
                    <img src="${skill.image}" class="h-10 w-10 object-contain mix-blend-multiply opacity-50">
                </div>
            `;
        });
    },

    // 修改 C：接收两个参数，实行【ID + 名字】的高精度双重绑定！
    addToCart: function(skillId, skillName) {
        if (this.modal.skills.length >= 6) { ToastManager.show('warning', '动作数量已达上限', '一条轨迹最多配置 6 个动作！'); return; }
        
        // ✨【核心修改】：双重筛选，彻底避免相同 ID 动作互相顶替的 Bug！
        const fullSkillObj = skillsData.find(s => s.id === skillId && s.nameZh[0] === skillName);
        if (!fullSkillObj) return;

        this.modal.skills.push(fullSkillObj);
        if (this.modal.skills.length > 1) this.modal.connections.push('direct');
        this.updateCartUI();
        
        // 选完动作后自动清空搜索框
        const searchInput = document.getElementById('modalSearch');
        if (searchInput && searchInput.value !== '') {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input')); 
        }
    },

    removeFromCart: function(index) {
        this.modal.skills.splice(index, 1);
        if (this.modal.connections.length > 0) {
            let connIndex = Math.max(0, index - 1);
            this.modal.connections.splice(connIndex, 1);
        }
        this.updateCartUI();
    },

    toggleConnection: function(index) {
        this.modal.connections[index] = this.modal.connections[index] === 'direct' ? 'indirect' : 'direct';
        this.updateCartUI();
    },

    updateCartUI: function() {
        const cart = document.getElementById('modalCurrentQueue');
        if (!cart) return;
        cart.innerHTML = '';
        if (this.modal.skills.length === 0) {
            cart.innerHTML = '<span class="text-gray-400 text-sm">尚未选择动作...</span>';
            return;
        }
        this.modal.skills.forEach((skill, index) => {
            cart.innerHTML += `
                <div class="flex items-center gap-1 bg-white px-3 py-1.5 rounded border border-gray-200 shadow-sm shrink-0">
                    <span class="text-xs font-bold text-blue-600">${skill.difficulty}</span>
                    <span class="text-sm text-gray-700">${skill.nameZh[0]}</span>
                    <button onclick="AppController.removeFromCart(${index})" class="text-red-400 hover:text-red-600 ml-1">&times;</button>
                </div>`;
            if (index < this.modal.skills.length - 1) {
                let isDirect = this.modal.connections[index] === 'direct';
                let symbol = isDirect ? '+' : '++';
                let colorClass = isDirect ? 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200' : 'bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200';
                cart.innerHTML += `<button onclick="AppController.toggleConnection(${index})" class="px-2 py-0.5 text-xs font-black rounded border cursor-pointer transition-colors ${colorClass}">${symbol}</button>`;
            }
        });

        // ==================================================
        // ✨【全新黑科技】：动作弹窗队列，实时无感动态演练 CV
        // ==================================================
        let modalTitleText = document.getElementById('modalTitle').innerText;
        let mockType = modalTitleText.includes('技巧') ? 'line' : (modalTitleText.includes('转体') ? 'point' : 'curve');
        
        // 封存为一个临时的虚拟 Track 镜像
        let mockTrack = {
            type: mockType,
            skills: this.modal.skills,
            connections: this.modal.connections,
            connectionType: 'direct'
        };
        
        // 扔给引擎单独跑一次
        let estimatedCV = ChoreographyEngine.calculateCV([mockTrack]);
        
        // 如果触发了连接加分，直接在弹窗底部的动作序列右侧，闪烁飙出炫酷绿标提示！
        if (estimatedCV > 0) {
            cart.innerHTML += `
                <div class="text-xs font-black text-green-600 bg-green-50 border-2 border-green-300 px-2.5 py-1.5 rounded-lg shadow-sm ml-auto shrink-0 animate-pulse flex items-center gap-1">
                    🔥 连击达成 CV: +${estimatedCV.toFixed(1)}
                </div>
            `;
        }
    },

    confirmModal: function() {
        const track = canvasManager.tracks.find(t => t.id === this.modal.currentTrackId);
        if (track) {
            track.skills = [...this.modal.skills];
            track.connections = [...this.modal.connections]; 
            canvasManager.redraw();
        }
        this.closeModal();
        this.updateUIRoutineList(); 
    },

    closeModal: function() {
        document.getElementById('skillModal').classList.add('hidden');
        if (this.modal.currentTrackId) {
            const track = canvasManager.tracks.find(t => t.id === this.modal.currentTrackId);
            if (track && track.skills.length === 0) {
                canvasManager.tracks = canvasManager.tracks.filter(t => t.id !== this.modal.currentTrackId);
                canvasManager.redraw();
            }
        }
    },

    updateUIRoutineList: function() {
        // ✨【生命周期校准】：先计算最新数据，再渲染 HTML！
        this.runScoringEngine();

        const list = document.getElementById('routineList');
        let html = '';
        let validCount = 0;

        canvasManager.tracks.forEach((track, index) => {
            if (track.skills.length === 0) return;
            
            const dragAttributes = `
                draggable="true"
                ondragstart="SidebarInteraction.dragStartTrack(event, ${index})"
                ondragover="SidebarInteraction.dragOverTrack(event)"
                ondrop="SidebarInteraction.dropTrack(event, ${index})"
                ondragend="SidebarInteraction.dragEndTrack(event)"
            `;

            if (track.type === 'transit') {
                html += `
                    <div class="track-card cursor-move transition-all duration-200 flex items-center justify-between p-2 border border-gray-100 bg-gray-50 rounded" ${dragAttributes}>
                        <div class="flex-1 text-sm text-gray-400 italic">🚶‍♀️ ${index + 1}. 移动路线 (无难度)</div>
                        <button onclick="SidebarInteraction.deleteTrack(${index})" class="text-gray-400 hover:text-red-500 p-1">🗑️</button>
                    </div>`;
                return;
            }

            let trackCV = track.cvValue || 0.0; 
            let trackDMT = track.dmtBonus || 0.0; 
            
            // ==========================================
            // 1. 顶部徽章区：CV、下法、以及【整串总扣分】
            // ==========================================
            let statsHTML = `<div class="flex gap-1 ml-2 shrink-0">`;
            if (track.skills.length >= 2 && trackCV > 0) { 
                statsHTML += `<span class="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-bold border border-green-200 shadow-sm">CV +${trackCV.toFixed(1)}</span>`; 
            } 
            if (trackDMT > 0) {
                statsHTML += `<span class="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold border border-amber-200 shadow-sm animate-pulse">下法 +0.2</span>`;
            }
            // ✨ 新增：这条路线在 E裁模式 下的总扣分
            if (track.manualDeductionTotal > 0) {
                statsHTML += `<span class="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-bold border border-rose-200 shadow-sm">总扣 -${track.manualDeductionTotal.toFixed(1)}</span>`;
            }
            statsHTML += `</div>`;

            const connector = track.connectionType === 'direct' ? ' + ' : ' / '; 
            
            // ==========================================
            // 2. 动作渲染区：支持在动作下方挂载【独立扣分框】
            // ==========================================
            const skillsText = track.skills.map((s, skillIndex) => {
                // 基础动作名字
                let skillHtml = `
                    <span class="group relative inline-flex items-center hover:bg-gray-200 px-1 rounded transition-colors cursor-pointer">
                        <span class="font-bold text-gray-800">${s.nameZh[0]}</span> 
                        <span class="text-[10px] bg-gray-200 group-hover:bg-gray-300 px-1 rounded ml-1">${s.difficulty}</span>
                        <button onclick="event.stopPropagation(); AppController.removeSkillFromTrack('${track.id}', ${skillIndex})" class="hidden group-hover:flex absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 text-[10px] items-center justify-center shadow z-10">&times;</button>
                    </span>`;
                
                // ✨ 查找该动作名下是否被裁判挂了扣分项！
                let faultsForThisSkill = (track.manualDeductions || []).filter(f => f.skillIdx === skillIndex);
                
                if (faultsForThisSkill.length > 0) {
                    let totalDed = faultsForThisSkill.reduce((sum, f) => sum + f.deduction, 0);
                    let faultTags = faultsForThisSkill.map(f => {
                        let tagColor = f.isArtistry ? 'text-fuchsia-600 border-fuchsia-200 bg-fuchsia-50' : 'text-rose-500 border-rose-200 bg-white';
                        return `<span class="text-[9px] ${tagColor} px-1 rounded shadow-sm whitespace-nowrap">${f.faultName}</span>`;
                    }).join('');
                    
                    // 在动作下方撑开一个小红框，展示总计和明细
                    skillHtml += `
                        <div class="mt-1 flex flex-wrap items-center gap-1 bg-rose-50 p-1 rounded-md border border-rose-100 shadow-sm w-full">
                            <span class="text-[10px] font-black text-white bg-rose-500 px-1 py-0.5 rounded">-${totalDed.toFixed(1)}</span>
                            ${faultTags}
                        </div>`;
                }
                
                // 使用 flex-col 包裹，保证扣分框乖乖待在动作正下方
                return `<div class="inline-flex flex-col items-start align-top">${skillHtml}</div>`;
                
            }).join(`<span class="mx-1 self-start mt-0.5 text-gray-400 font-bold">${connector}</span>`);
            
            let icon = track.type === 'line' ? '📏' : (track.type === 'curve' ? '〰️' : '📍'); 
            let ndWarning = track.nd < 0 ? `<span class="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold ml-2 shadow-sm border border-red-200 shrink-0">出界 ${track.nd}</span>` : ''; 
            validCount += track.skills.length; 

            // ==========================================
            // 3. 重构卡片布局，防止多行红框挤乱原本的图标
            // ==========================================
            html += `
                <div class="track-card cursor-move transition-all duration-200 flex items-start justify-between p-2 border-b border-gray-50 hover:bg-gray-100 rounded group" ${dragAttributes}>
                    
                    <div class="flex gap-2 overflow-hidden pr-2 flex-1 cursor-pointer" onclick="AppController.openModalById('${track.id}')" title="点击重新编辑此路线">
                        <div class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0 mt-0.5" style="color: ${track.color}">${index + 1}</div>
                        
                        <div class="text-sm leading-relaxed flex flex-col w-full gap-1.5">
                            <div class="flex items-center w-full">
                                ${icon} ${statsHTML} ${ndWarning}
                            </div>
                            <div class="flex flex-wrap items-start gap-y-2 w-full">
                                ${skillsText}
                            </div>
                        </div>
                    </div>
                    
                    <div class="shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                        <button onclick="AppController.openModalById('${track.id}')" class="text-blue-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50" title="编辑编排">✏️</button>
                        <button onclick="SidebarInteraction.deleteTrack(${index})" class="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50" title="删除路线">🗑️</button>
                    </div>
                </div>
            `; 
        });

        if (html === '') html = '<p class="text-center text-gray-400 py-10">在左侧场地上画线开始编排</p>'; 
        list.innerHTML = html; 
        document.getElementById('skillCount').innerText = `${validCount}/8 有效`; 
    },

    deleteTrack: function(trackId) {
        canvasManager.tracks = canvasManager.tracks.filter(t => t.id !== trackId);
        canvasManager.redraw();
        this.updateUIRoutineList();
    },

    removeSkillFromTrack: function(trackId, skillIndex) {
        const track = canvasManager.tracks.find(t => t.id === trackId);
        if (track) {
            track.skills.splice(skillIndex, 1);
            if (track.connections && track.connections.length > 0) {
                let connIndex = Math.max(0, skillIndex - 1);
                track.connections.splice(connIndex, 1);
            }
            if (track.skills.length === 0) this.deleteTrack(trackId);
            else { canvasManager.redraw(); this.updateUIRoutineList(); }
        }
    },

    runScoringEngine: function() {
        const report = ChoreographyEngine.calculateDScore(canvasManager.tracks);
        let totalND = canvasManager.tracks.reduce((sum, t) => sum + (t.nd || 0), 0);

        document.getElementById('score-totalD').innerText = report.totalD.toFixed(2);
        document.getElementById('score-dv').innerText = report.dv.toFixed(2);
        document.getElementById('score-cr').innerText = report.cr.toFixed(2);
        document.getElementById('score-cv').innerText = report.cv.toFixed(2);
        document.getElementById('score-dmt').innerText = report.dmtBonus.toFixed(2);
        document.getElementById('score-nd').innerText = totalND.toFixed(2);

        const warningPanel = document.getElementById('warningsPanel');
        if (report.warnings.length > 0) {
            warningPanel.classList.remove('hidden');
            warningPanel.innerHTML = report.warnings.map(w => `<p>• ${w}</p>`).join('');
        } else {
            warningPanel.classList.add('hidden');
        }
        window.currentScoreReport = report;
    },

    // ==========================================
    // 模块四：“成套亮相”动画分发器
    // ==========================================
    triggerFinishAnimation: function() {
        if(canvasManager.tracks.length === 0) { ToastManager.show('warning', '操作拦截', '你还没编排动作呢！'); return; }
        
        // 【关键】直接从全局状态里读，不再读 select 标签
        const mode = window.currentRoutineData.gymnastMode || 'none';
        const actualDScore = window.currentScoreReport ? window.currentScoreReport.totalD : 0;
        
        if (mode === 'none') {
            window.currentRoutineData.gymnastName = "无";
            // 即使是无名选手，也要走一遍引擎，这样手动打分模式才有地方存 E 分！
            window.currentEScoreReport = ExecutionEngine.calculateEScore('none', canvasManager.tracks, actualDScore);
            this.playShowcase();
            
        } else if (mode === 'custom') {
            const customName = document.getElementById('customGymnastNameInput').value || "佚名选手";
            window.currentRoutineData.gymnastName = customName;
            document.getElementById('customScoreModal').classList.remove('hidden');
            
        } else {
            // 数据库名将模式
            const gymnast = gymnastsData.find(g => g.id === mode);
            if (!gymnast) return;
            window.currentRoutineData.gymnastName = gymnast.nameEn;
            
            // 【核心联动】：调用双引擎算分！
            // 注意：如果是 manual_e 模式，这里预计算出来的是 10分满分（因为还没打分）。
            // 真实的 E 分将在展示结束后，成绩单弹出前再次计算。
            window.currentEScoreReport = ExecutionEngine.calculateEScore(mode, canvasManager.tracks, actualDScore);
            
            this.playShowcase();
        }
    },
    
    // ==========================================
    // 终极结算看板：汇总 D 分与最终 E 分
    // ==========================================
    showFinalScoreBoard: function() {
        const mode = window.currentPlaybackMode || 'none';
        const gymnastMode = window.currentRoutineData.gymnastMode || 'none';
        const actualDScore = window.currentScoreReport ? window.currentScoreReport.totalD : 0;
        
        // 【关键修复】：动画播放完、用户全部打完分后，必须再调用一次引擎，获取最终的手动扣分结果！
        window.currentEScoreReport = ExecutionEngine.calculateEScore(gymnastMode, canvasManager.tracks, actualDScore);

        const dReport = window.currentScoreReport;
        const eReport = window.currentEScoreReport;

        if (!dReport || !eReport) {
            ToastManager.show('error', '数据不完整', '成绩数据不完整，请先编排动作！');
            return;
        }

        const finalTotal = dReport.totalD + eReport.finalEScore;
        
        // 根据模式生成描述文案
        let modeText = '🤖 自动打分 (大心脏/神经刀概率)';
        if (mode === 'manual_e') modeText = '👨‍⚖️ 我来当E裁判 (手动判罚)';
        if (mode === 'skip_to_d') modeText = '⚡ 跳过播放快速结算';
        if (mode === 'no_e') modeText = '👀 仅观看 (未打分)';

        // 拼接 E 分展示区 (如果是 no_e 模式则不显示 E 分)
        let eScoreHtml = '';
        let totalHtml = `<div class="text-5xl font-black text-slate-900 mb-8 border-b pb-8">难度分: ${dReport.totalD.toFixed(1)}</div>`;
        
        if (mode !== 'no_e') {
            eScoreHtml = `
            <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 w-32 shadow-sm">
                <div class="text-sm text-indigo-500 font-bold mb-1">完成分 (E)</div>
                <div class="text-3xl font-black text-indigo-700">${eReport.finalEScore.toFixed(3)}</div>
            </div>`;
            totalHtml = `<div class="text-5xl font-black text-slate-900 mb-8 border-b pb-8">总分: ${finalTotal.toFixed(3)}</div>`;
        }

        // 拼接扣分明细区
        let detailsHtml = '';
        if (mode !== 'no_e' && eReport.details && eReport.details.length > 0) {
            detailsHtml = `
            <div class="text-left bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 max-h-40 overflow-y-auto shadow-inner">
                <h4 class="text-sm font-bold text-slate-700 mb-2 border-b border-slate-200 pb-1">📋 E分扣分明细：</h4>
                <ul class="text-sm text-slate-600 space-y-1">
                    ${eReport.details.map(d => `<li class="flex items-start"><span class="mr-2 text-red-500">•</span> ${d}</li>`).join('')}
                </ul>
            </div>`;
        }

        // ==========================================
        // ✨【核心新增】：为亮相直接分享准备参数
        // ==========================================
        const routineNameForShare = window.currentRoutineData?.name || "未命名成套";
        const finalScoreText = mode === 'no_e' ? `D分 ${dReport.totalD.toFixed(1)}` : `总分 ${finalTotal.toFixed(2)}`;

        // ==========================================
        // ✨【新逻辑】：根据模式决定是否显示冲榜按钮
        // ==========================================
        let uploadBtnHtml = '';
        
        // 核心公平锁：只有自动算 E 分的成套，才有资格冲榜！
        if (mode === 'auto_e') {
            uploadBtnHtml = `
            <button onclick="AppController.attemptUploadLeaderboard()" class="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black py-3 rounded-xl text-sm transition shadow-lg flex justify-center items-center gap-1.5 transform hover:-translate-y-0.5">
                <span>🚀 付费冲榜</span>
            </button>`;
        } else {
            uploadBtnHtml = `
            <div class="flex-1 bg-slate-100 text-slate-400 font-bold py-3 rounded-xl text-xs flex justify-center items-center cursor-not-allowed border border-slate-200" title="为保证公平，仅【系统自动算E分】模式可参与全网冲榜">
                🚫 非自动打分不可冲榜
            </div>`;
        }

        // 终极弹窗 HTML 
        let html = `
        <div id="finalScoreModal" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[200] backdrop-blur-sm transition-opacity">
            <div class="bg-white rounded-2xl shadow-2xl p-8 w-11/12 max-w-lg text-center transform transition-all scale-100 border-t-8 border-indigo-600">
                ${totalHtml}
                ${detailsHtml}
                
                <div class="flex flex-col sm:flex-row gap-2.5 mt-2">
                    <button onclick="document.getElementById('finalScoreModal').remove()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-sm transition shadow-sm">
                        关闭
                    </button>
                    <button onclick="AppController.shareRoutinePlaceholder('${routineNameForShare}', '${finalScoreText}')" class="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-xl text-sm transition shadow-sm flex justify-center items-center gap-1.5">
                        <span>🔗 复制口令</span>
                    </button>
                    
                    ${uploadBtnHtml}
                </div>
            </div>
        </div>
        `;

        // 移除旧弹窗（如果有），注入新弹窗
        const existing = document.getElementById('finalScoreModal');
        if (existing) existing.remove();
        
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = html;
        document.body.appendChild(modalDiv.firstElementChild);
    },

    // ✨【新增】：冲榜扣费与拦截系统
    attemptUploadLeaderboard: function() {
        const mode = window.currentRoutineData.gymnastMode;
        
        // 从数据库查这个人的出场费。如果你没在数据里写 cost，默认收 20 块门票费。
        const gymnast = typeof gymnastsData !== 'undefined' ? gymnastsData.find(g => g.id === mode) : null;
        const cost = (gymnast && gymnast.cost !== undefined) ? gymnast.cost : 20;
        const name = gymnast ? gymnast.nameEn : '当前选手';

        const currentCoins = CoinManager.getCoins();

        if (currentCoins < cost) {
            ToastManager.show('error', '金币不足', `余额: ${currentCoins} 🪙 | 需要: ${cost} 🪙\n穷鬼教练，请明天再来领取每日低保吧！`, 4000);
            return;
        }

        if (confirm(`🏆 冲榜确认\n派遣【${name}】打入全球排行榜，将消耗您 ${cost} 🪙 出场费。\n是否确认支付并上传？`)) {
            // 扣钱
            CoinManager.deductCoins(cost);
            // 关掉成绩单弹窗
            document.getElementById('finalScoreModal').remove();
            // 呼叫上一阶段写的云端上传接口！
            if (typeof SupabaseEngine !== 'undefined') {
                SupabaseEngine.uploadRoutine(); 
            } else {
                ToastManager.show('error', '上传失败', '云端连接失败，可能是网络问题。金币已扣除但未上传。');
            }
        }
    },

    // 【新增】处理自定义填分提交
    confirmCustomScore: function() {
        const val = parseFloat(document.getElementById('customEScoreInput').value);
        if (isNaN(val) || val < 0 || val > 10) {
            ToastManager.show('error', '输入无效', '请输入 0 到 10 之间的有效 E 分！');
            return;
        }
        document.getElementById('customScoreModal').classList.add('hidden');
        
        // 伪造一个数据给动画和算分面板
        window.currentEScoreReport = {
            gymnastNameEn: window.currentRoutineData.gymnastName,
            isCustom: true,
            fallTrackIds: [], // 自定义选手不进行随机摔倒判定
            finalEScore: val
        };
        this.playShowcase();
    },

    playShowcase: function() {
        const container = document.getElementById('floorContainer');
        const overlay = document.createElement('div');
        overlay.id = "showcaseOverlay";
        overlay.className = "absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-md text-white font-black tracking-widest pointer-events-none transition-opacity duration-500 opacity-0";
        overlay.innerHTML = `<span class="text-5xl md:text-6xl drop-shadow-2xl scale-50 transition-transform duration-500" id="showcaseText">✨成套亮相✨</span>`;
        container.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.classList.remove('opacity-0');
            document.getElementById('showcaseText').classList.remove('scale-50');
            document.getElementById('showcaseText').classList.add('scale-100');
        });

        setTimeout(() => {
            overlay.classList.add('opacity-0');
            setTimeout(() => { if (container.contains(overlay)) container.removeChild(overlay); }, 500);

            let fallIds = window.currentEScoreReport ? window.currentEScoreReport.fallTrackIds : [];
            
            canvasManager.playHighlightAnimation(() => {
                if (overlay && overlay.parentNode) {
                    overlay.classList.add('opacity-0');
                    setTimeout(() => { if(overlay.parentNode) container.removeChild(overlay); }, 500);
                }
                
                // 🛡️ 核心防死锁 1：重新安全提取当前环境的选手状态和D分
                const currentGymnastMode = window.currentRoutineData.gymnastMode || 'none';
                const actualDScore = window.currentScoreReport ? window.currentScoreReport.totalD : 0;

                // 强制要求计算一遍手动 E 分，确保 currentEScoreReport 不为空
                if (window.currentPlaybackMode === 'manual_e') {
                    window.currentEScoreReport = ExecutionEngine.calculateEScore(currentGymnastMode, canvasManager.tracks, actualDScore);
                }
                
                // 🛡️ 核心防死锁 2：赋予兜底属性，绝不允许系统读取到 null！
                let dReport = window.currentScoreReport || { totalD: 0 };
                let eReport = window.currentEScoreReport || { finalEScore: 10.0, details: [] };
                let ndDeduction = canvasManager.tracks.reduce((sum, t) => sum + (t.nd || 0), 0);
                
                const isNoE = (window.currentPlaybackMode === 'no_e');
                
                // 此时提取 eReport.finalEScore 绝不会再报错了！
                let finalTotalScore = isNoE 
                    ? (dReport.totalD + ndDeduction).toFixed(3) 
                    : (dReport.totalD + eReport.finalEScore + ndDeduction).toFixed(3);
                
                document.getElementById('saveModalTotalScore').innerText = finalTotalScore;
                document.getElementById('saveModalDScore').innerText = dReport.totalD.toFixed(3);

                const eScoreBox = document.getElementById('saveModalEScore').closest('div');
                if (eScoreBox) {
                    if (isNoE) {
                        eScoreBox.style.display = 'none';
                        document.getElementById('saveModalTotalScore').previousElementSibling.innerText = "最终得分 (仅D分)";
                    } else {
                        eScoreBox.style.display = 'block';
                        document.getElementById('saveModalEScore').innerText = eReport.finalEScore.toFixed(3);
                        document.getElementById('saveModalTotalScore').previousElementSibling.innerText = "最终总分";
                    }
                }

                this.saveRoutineToHistory(finalTotalScore); 
                this.exportToImage();
                
                const confirmModal = document.getElementById('saveConfirmModal');
                if (confirmModal) confirmModal.classList.remove('hidden');
                
            }, fallIds); 
        }, 800); 
    },

    // ✨【新增】：暂存草稿功能
    saveDraft: function() {
        if (canvasManager.tracks.length === 0) {
            ToastManager.show('warning', '操作拦截', '画板上还没有任何动作，不需要保存草稿哦~');
            return;
        }
        let history = JSON.parse(localStorage.getItem('gymChoreoHistory') || '[]');
        let currentName = window.currentRoutineData?.name || "未命名成套";
        
        // 自动加上草稿后缀
        if (!currentName.endsWith("(草稿)")) {
            currentName += " (草稿)";
        }

        let routine = {
            id: 'routine_' + Date.now(),
            name: currentName,
            brand: window.currentRoutineData?.brand || "gymnova",
            date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString().slice(0,5),
            score: "暂存", // 草稿没有具体分数
            tracks: canvasManager.tracks 
        };
        
        history.unshift(routine); 
        localStorage.setItem('gymChoreoHistory', JSON.stringify(history));
        this.renderHistory();
        ToastManager.show('success', '保存成功', '💾 草稿已安全保存！\n可随时在【我的成套】中点击加载。');
    },

    saveRoutineToHistory: function(finalTotalScore) {
        let history = JSON.parse(localStorage.getItem('gymChoreoHistory') || '[]');
        
        // ✨【核心修改】：如果有总分传入（且不是只看D分模式），把总分拼接到历史记录的徽章里
        let scoreText = `D分 ${window.currentScoreReport.totalD.toFixed(3)}`;
        if (finalTotalScore && window.currentPlaybackMode !== 'no_e') {
            scoreText += ` | 总分 ${finalTotalScore}`;
        }

        let routine = {
            id: 'routine_' + Date.now(),
            name: window.currentRoutineData?.name || "未命名成套",
            brand: window.currentRoutineData?.brand || "gymnova",
            date: new Date().toLocaleDateString(),
            score: scoreText,
            tracks: canvasManager.tracks 
        };
        history.unshift(routine); 
        localStorage.setItem('gymChoreoHistory', JSON.stringify(history));
        this.renderHistory();
    },

    // ✨【修复 #5】私密分享草稿 (不再上榜)
    shareFromHistory: function(id) {
        let history = JSON.parse(localStorage.getItem('gymChoreoHistory') || '[]');
        let routine = history.find(r => r.id === id);
        if (!routine) return;

        let rawD = parseFloat(routine.score.split('D分 ')[1]) || 0;
        const payload = {
            name: routine.name.replace(" (草稿)", ""),
            brand: routine.brand,
            dScore: rawD,
            eScore: 0, 
            tracks: routine.tracks
        };
        // 注意：第二个参数传 false，代表【不上榜】
        SupabaseEngine.uploadRoutine(payload, false);
    },

    // ✨【修复 #5】历史记录的“冲榜”校验器
    uploadFromHistory: function(id) {
        let history = JSON.parse(localStorage.getItem('gymChoreoHistory') || '[]');
        let routine = history.find(r => r.id === id);
        if (!routine) return;

        // 【核心拦截】：必须是数据库选手 + 自动打 E 分 才能冲榜
        // 这里需要你之前保存历史时存入了 gMode 和 mode，如果没有，可以直接用当前环境判断
        if (routine.gMode === 'none' || routine.gMode === 'custom' || !routine.score.includes('总分')) {
            ToastManager.show('error', '资格不符', '❌ 只有使用【数据库名将】且由【系统自动算E分】的成套，才能参与全网排行榜保证公平！');
            return;
        }

        let rawD = parseFloat(routine.score.split('D分 ')[1]) || 0;
        let rawTotal = parseFloat(routine.score.split('总分 ')[1]) || 0;
        
        const payload = {
            name: routine.name,
            brand: routine.brand,
            dScore: rawD,
            eScore: rawTotal - rawD, // 逆向算出 E 分
            tracks: routine.tracks
        };
        
        // 扣门票钱
        const cost = 20; // 统一定价 20 金币
        if (CoinManager.getCoins() < cost) {
            ToastManager.show('error', '金币不足', `冲榜需要 ${cost} 🪙，请明天签到再来吧！`);
            return;
        }

        if (confirm(`🏆 冲榜确认\n上传《${routine.name}》打入全球排行榜，将消耗 ${cost} 🪙。\n是否支付？`)) {
            CoinManager.deductCoins(cost);
            // 注意：第二个参数传 true，代表【公开上榜】
            SupabaseEngine.uploadRoutine(payload, true);
        }
    },

    renderHistory: function() {
        const grid = document.getElementById('historyGrid');
        let history = JSON.parse(localStorage.getItem('gymChoreoHistory') || '[]');
        if (history.length === 0) {
            grid.innerHTML = '<p class="text-gray-400 col-span-full text-center py-10 text-sm">暂无保存的成套，去“战术画板”编排一套吧！</p>';
            return;
        }
        grid.innerHTML = '';
        history.forEach(routine => {
            // ✨【修改】：直接渲染 routine.score（里面已经包含了 D分 甚至 总分）
            grid.innerHTML += `
                <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all relative overflow-hidden group">
                    <div class="absolute top-0 left-0 w-2 h-full bg-blue-500 group-hover:bg-indigo-500 transition-colors"></div>
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-black text-base text-gray-800 truncate pr-4">${routine.name}</h4>
                        <span class="bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 rounded text-xs shrink-0">${routine.score}</span>
                    </div>
                    <p class="text-[11px] text-slate-400 mb-4">保存时间: ${routine.date} | 场地: ${routine.brand.toUpperCase()}</p>
                    
                    <div class="flex gap-1.5 mt-2">
                        <button onclick="AppController.loadRoutine('${routine.id}')" 
                                class="flex-1 bg-white border border-blue-200 hover:bg-blue-50 text-blue-600 font-black text-xs py-2 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1"
                                title="加载此成套回到画板继续编辑或回放">
                            <span>✏️ 编辑</span>
                        </button>
                        
                        <button onclick="AppController.shareFromHistory('${routine.id}')" 
                                class="px-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 font-bold text-xs py-2 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1"
                                title="直接把这套历史草稿上传并换取 6 位数全网验证码">
                            <span>🔗 分享</span>
                        </button>
                        
                        <button onclick="AppController.uploadFromHistory('${routine.id}')" 
                                class="px-2.5 bg-purple-50 text-purple-600 hover:bg-purple-100 font-bold text-xs py-2 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1"
                                title="花费金币将此成套上传至全网大奖牌榜">
                            <span>🚀 冲榜</span>
                        </button>

                        <button onclick="AppController.deleteHistory('${routine.id}')" 
                                class="px-3 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center"
                                title="永久删除此成套">
                            <span>🗑️</span>
                        </button>
                    </div>
                </div>
            `;
        });
    },

    // ✨ 替换原来的画饼占位函数，实现真正的口令一键复制
    shareRoutinePlaceholder: function(name, score) {
        // 临时将当前草稿加载到舞台（为了提取 tracks 数据）
        const code = ShareEngine.generateShareCode();
        if(!code) {
            ToastManager.show('warning', '操作拦截', '只能在画板里直接点击分享，或者先加载草稿后再分享哦！');
            return;
        }

        // 复制到剪贴板
        navigator.clipboard.writeText(code).then(() => {
            ToastManager.show('success', '口令生成成功', `复制成功！\n发给好友，他们点击“导入口令”即可重现。`, 5000);
        }).catch(err => {
            // 降级兼容保护：如果浏览器禁用了剪贴板 API，弹窗让用户手动手动复制
            prompt("复制失败，请手动复制以下口令：", code);
        });
    },

    // ✨【新增】：逆向工程，将历史记录完全还原到工作台
    loadRoutine: function(id) {
        let history = JSON.parse(localStorage.getItem('gymChoreoHistory') || '[]');
        let routine = history.find(r => r.id === id);
        if (!routine) return;
        
        if (canvasManager.tracks.length > 0) {
            if (!confirm("加载历史记录将覆盖您当前画板上的所有进度，确定要加载吗？")) return;
        }
        
        // 1. 恢复核心轨迹数据
        canvasManager.tracks = routine.tracks;
        
        // 2. 恢复全局状态与名称 (如果是草稿，去掉草稿后缀让用户接着编)
        window.currentRoutineData.name = routine.name.replace(" (草稿)", "");
        window.currentRoutineData.brand = routine.brand;
        
        // 3. 恢复场地 UI 和颜色
        if (typeof selectBrand === 'function') {
            selectBrand(routine.brand);
        }
        
        // 4. 同步顶部控制台的名字
        const nameInput = document.getElementById('routineNameInput');
        if (nameInput) nameInput.value = window.currentRoutineData.name;
        const displayRoutineName = document.getElementById('displayRoutineName');
        if (displayRoutineName) displayRoutineName.innerText = window.currentRoutineData.name;
        
        // 5. 暴力唤醒重绘与侧边栏算分
        canvasManager.redraw();
        this.updateUIRoutineList();
        
        // 6. 强行切回战术板
        isRoutineInitialized = true;
        switchTab('builder');
        
        // 延迟给一个小弹窗，让用户感到安心
        setTimeout(() => ToastManager.show('success', '还原成功', '进度已成功还原到画板！您可以继续编辑了。'), 100);
    },

    deleteHistory: function(id) {
        if(confirm("确定要删除这条成套记录吗？")) {
            let history = JSON.parse(localStorage.getItem('gymChoreoHistory') || '[]');
            history = history.filter(r => r.id !== id);
            localStorage.setItem('gymChoreoHistory', JSON.stringify(history));
            this.renderHistory();
        }
    },

    exportToImage: function() {
        const targetDOM = document.getElementById('viewBuilder');
        if (!targetDOM || typeof html2canvas === 'undefined') return;

        const watermark = document.createElement('div');
        watermark.innerHTML = `<h2 class="text-2xl font-black">GymChoreo 智能编排</h2><p class="text-lg">成套：${window.currentRoutineData?.name} | D分: ${window.currentScoreReport.totalD.toFixed(2)}</p>`;
        watermark.className = "absolute bottom-10 right-10 text-gray-400 opacity-50 pointer-events-none";
        targetDOM.appendChild(watermark);

        html2canvas(targetDOM, { backgroundColor: '#f9fafb', scale: 2 }).then(canvas => {
            let link = document.createElement('a');
            link.download = `GymChoreo_${window.currentRoutineData?.name || '编排'}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            targetDOM.removeChild(watermark);
        });
    },

    processOOB: function(choice) {
        const track = window.pendingOOBTrack;
        document.getElementById('oobModal').classList.add('hidden');
        if (!track) return;

        if (choice === 'single') track.nd = -0.1;
        else if (choice === 'double') track.nd = -0.3;
        else if (choice === 'snap') {
            const marginX = canvasManager.canvas.width / 14 + 1;
            const marginY = canvasManager.canvas.height / 14 + 1;
            track.points = track.points.map(p => ({
                x: Math.max(marginX, Math.min(canvasManager.canvas.width - marginX, p.x)),
                y: Math.max(marginY, Math.min(canvasManager.canvas.height - marginY, p.y))
            }));
            track.nd = 0;
        }

        // 【关键修复】查重保护机制！
        // 如果这本身就是一条旧线（通过拖拽触发），不要重复 push。只在画新线出界时 push。
        if (!canvasManager.tracks.includes(track)) {
            canvasManager.tracks.push(track);
        }

        canvasManager.redraw();
        window.pendingOOBTrack = null;
        
        // 智能分流：如果是新画的线出界，弹窗配动作；如果是旧线拖拽出界，只静默刷新侧边栏算分即可
        if (!track.skills || track.skills.length === 0) {
            this.openModal(track);
        } else {
            this.updateUIRoutineList();
        }
    }
};

window.addEventListener('DOMContentLoaded', () => { AppController.init(); });
window.openSkillModal = function(track) { AppController.openModal(track); };
window.closeModal = function() { AppController.closeModal(); };
window.confirmModalSelection = function() { AppController.confirmModal(); };
window.updateUIRoutineList = function() { AppController.updateUIRoutineList(); };
// ==========================================
// 替换 app.js 中的 saveRoutine，并新增 startPlayback
// ==========================================

window.saveRoutine = function() { 
    // 不再直接触发动画，而是先弹窗询问裁判模式
    const modal = document.getElementById('playbackOptionsModal');
    if (modal) modal.classList.remove('hidden');
};

window.startPlayback = function(mode) {
    document.getElementById('playbackOptionsModal').classList.add('hidden');
    // ✨【Bug 修复】：重新播放时，强制将可能未收回的 E裁判 面板踢回底部！
    const deck = document.getElementById('juryCardDeck');
    if (deck) {
        deck.classList.remove('translate-y-0');
        deck.classList.add('translate-y-full');
    }
    window.currentPlaybackMode = mode; 
    
    if (mode === 'skip_to_d') {
        // 【秒结算模式】：跳过所有动画，直接弹成绩单！
        AppController.updateUIRoutineList(); // 确保 D 分最新
        const gymnastMode = window.currentRoutineData.gymnastMode || 'none';
        const actualDScore = window.currentScoreReport ? window.currentScoreReport.totalD : 0;
        
        // 即便是跳过，也跑一遍引擎算出结果
        window.currentEScoreReport = ExecutionEngine.calculateEScore(gymnastMode, canvasManager.tracks, actualDScore);
        
        // 直接弹窗！
        AppController.showFinalScoreBoard(); 
    } else {
        // 启动 Canvas 动画系统，老老实实看表演/打分
        AppController.triggerFinishAnimation(); 
    }
};

window.startNewRoutine = function() {
    document.getElementById('saveConfirmModal').classList.add('hidden');
    if (typeof window.resetBuilderFlow === 'function') window.resetBuilderFlow();
};
window.renderHistory = function() { AppController.renderHistory(); };
window.handleOOBChoice = function(choice) { AppController.processOOB(choice); };
window.AppController = AppController;

// ==========================================
// 追加到 app.js 最底部，或独立成文件
// ==========================================
window.SidebarInteraction = {
    
    // 1. 一键删除整条路线
    deleteTrack: function(trackIndex) {
        if (!confirm('🗑️ 确定要删除这条动作路线吗？')) return;
        
        if (typeof canvasManager !== 'undefined' && canvasManager.tracks) {
            // 从底层数组中彻底抹除这条线
            canvasManager.tracks.splice(trackIndex, 1);
            
            // 核心联动：重新绘制画布，刷新分数和编排列表！
            canvasManager.redraw();
            if (typeof AppController !== 'undefined' && AppController.updateUIRoutineList) {
                AppController.updateUIRoutineList();
            }
        }
    },

    // 2. 抓起路线卡片 (开始拖拽)
    dragStartTrack: function(event, trackIndex) {
        event.dataTransfer.setData('text/plain', trackIndex.toString());
        event.dataTransfer.effectAllowed = 'move';
        
        setTimeout(() => {
            const card = event.target.closest('.track-card');
            if(card) card.classList.add('opacity-40', 'scale-[0.98]', 'shadow-lg');
        }, 0);
    },

    // 3. 拖拽经过其他卡片上方
    dragOverTrack: function(event) {
        event.preventDefault(); 
        event.dataTransfer.dropEffect = 'move';
    },

    // 4. 拖拽松手但未成功
    dragEndTrack: function(event) {
        const card = event.target.closest('.track-card');
        if(card) card.classList.remove('opacity-40', 'scale-[0.98]', 'shadow-lg');
    },

    // 5. 成功放下卡片：执行数组互换
    dropTrack: function(event, targetIndex) {
        event.preventDefault();
        
        const card = event.target.closest('.track-card');
        if(card) card.classList.remove('opacity-40', 'scale-[0.98]', 'shadow-lg');

        const sourceIndex = parseInt(event.dataTransfer.getData('text/plain'), 10);
        if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

        if (typeof canvasManager !== 'undefined' && canvasManager.tracks) {
            const tracks = canvasManager.tracks;
            
            // 执行数组内部元素的剪切与插入（重排路线顺序）
            const [movedTrack] = tracks.splice(sourceIndex, 1);
            tracks.splice(targetIndex, 0, movedTrack);

            console.log(`🔄 战术路线重排成功：从位置 ${sourceIndex} 移动到 ${targetIndex}`);
            
            // 【补全联动】顺序变了，画布上的连线顺序和右侧分值必须立刻重算
            canvasManager.redraw();
            if (typeof AppController !== 'undefined' && AppController.updateUIRoutineList) {
                AppController.updateUIRoutineList();
            }
        }
    }
};
// ==========================================
// 附加模块：E裁判手动打分系统控制台
// ==========================================

// ==========================================
// 史诗级：E裁判拖拽判罚系统引擎 (ManualJurySystem)
// ==========================================

// ==========================================
// 史诗级优化版：E裁判拖拽判罚系统引擎 (ManualJurySystem)
// ==========================================

window.ManualJurySystem = {
    currentTrack: null,
    nextCallback: null,
    currentDeductions: 0,
    appliedFaults: [], 
    activeGhostNode: null, // 用于暂存残影节点，防止垃圾回收导致拖拽闪退
    isMinimized: false,   // 面板折叠状态

    // 1. 智能套牌牌库加载
    // ==========================================
    // 1. 智能套牌牌库加载 (✨ 增加艺术分专属紫色渲染与数据标记)
    // ==========================================
    // ==========================================
    // 1. 智能套牌牌库加载 (🛡️ 引入无死角字段提取，兼容 D裁无名数据)
    // ==========================================
    initCardDeck: function() {
        const container = document.getElementById('juryCardContainer');
        if (!container) return;
        
        const eDeductions = (window.e_jury_deductions || []).map(r => ({...r, isDScore: false}));
        const dDeductions = (window.d_jury_deductions || []).map(r => ({...r, isDScore: true}));
        const allRules = [...eDeductions, ...dDeductions];

        if (allRules.length === 0) {
            container.innerHTML = '<div class="text-rose-500 font-black text-xs w-full text-center mt-4">数据加载失败，请检查 JS 文件是否正确加载。</div>';
            return;
        }

        const searchVal = (document.getElementById('juryCardSearch')?.value || '').toLowerCase();
        const filterVal = document.getElementById('juryCardFilter')?.value || 'recommend';
        const recommendedKeywords = ['落地', '高度', '出界', '屈膝', '分腿', '未停稳', '多余', '步'];

        let filtered = allRules.filter(rule => {
            // 🛡️ 核心修复：D 裁规则可能没有 name 字段，我们智能向下兼容读取！
            const ruleName = rule.name || rule.description || rule.fault_condition || "未命名扣分";
            
            const isArtistry = (rule.target_tags && rule.target_tags.includes("global")) || 
                               ruleName.includes("艺术") || ruleName.includes("编排");

            if (filterVal === 'd_jury') return rule.isDScore;
            if (rule.isDScore) return false;

            if (filterVal === 'artistry') return isArtistry;
            if (isArtistry && filterVal !== 'all') return false; 

            if (filterVal === 'recommend') {
                if (!recommendedKeywords.some(kw => ruleName.includes(kw))) return false;
            } else if (filterVal !== 'all') {
                if (rule.deduction.toString() !== filterVal) return false;
            }
            if (searchVal && !ruleName.toLowerCase().includes(searchVal)) return false;
            return true;
        });

        if (filtered.length === 0) {
            container.innerHTML = '<div class="text-slate-400 font-bold text-xs w-full text-center mt-4">无匹配扣分项...</div>';
            return;
        }

        const groups = {};
        filtered.forEach(rule => {
            // 🛡️ 同步替换提取逻辑
            const ruleName = rule.name || rule.description || rule.fault_condition || "未命名扣分";
            let baseName = ruleName.replace(/(极度|严重|小|中|大)?(失误|扣分|错误|掉下器械|降组|不予承认)/g, '').trim();
            if (!baseName) baseName = ruleName;
            if (!groups[baseName]) groups[baseName] = [];
            groups[baseName].push(rule);
        });

        let html = '';
        for (const [baseName, rules] of Object.entries(groups)) {
            rules.sort((a, b) => a.deduction - b.deduction);
            let chipsHtml = '';
            
            const isArtistryGroup = rules.some(r => {
                const rn = r.name || r.description || r.fault_condition || "";
                return rn.includes("艺术") || rn.includes("编排") || (r.target_tags && r.target_tags.includes("global"));
            });
            const isDScoreGroup = rules.some(r => r.isDScore);

            rules.forEach(rule => {
                const ruleName = rule.name || rule.description || rule.fault_condition || "未命名";
                let colorClass = 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-400';
                
                if (isDScoreGroup) colorClass = 'bg-blue-50 text-blue-700 border-blue-300 hover:border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.15)]';
                else if (isArtistryGroup) colorClass = 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-300 hover:border-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.15)]';
                else if (rule.deduction >= 1.0) colorClass = 'bg-rose-50 text-rose-600 border-rose-200 hover:border-rose-400';
                else if (rule.deduction >= 0.5) colorClass = 'bg-orange-50 text-orange-600 border-orange-200 hover:border-orange-400';
                else if (rule.deduction >= 0.3) colorClass = 'bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-400';
                
                // 将安全提取的 ruleName 写入 payload
                const payload = JSON.stringify({ name: ruleName, deduction: rule.deduction, isArtistry: isArtistryGroup, isDScore: rule.isDScore });
                
                chipsHtml += `
                    <div draggable="true" 
                         ondragstart="ManualJurySystem.dragStart(event, '${encodeURIComponent(payload)}')"
                         ondragend="ManualJurySystem.dragEnd(event)"
                         title="${ruleName}"
                         class="${colorClass} border px-2 py-0.5 rounded font-black text-xs cursor-grab active:cursor-grabbing transition-all transform hover:-translate-y-0.5">
                        -${rule.deduction.toFixed(1)}
                    </div>
                `;
            });

            let boxBorder = 'border-slate-200 hover:border-indigo-300';
            let icon = '';
            if (isDScoreGroup) { boxBorder = 'border-blue-200 hover:border-blue-400'; icon = '🟦 '; }
            else if (isArtistryGroup) { boxBorder = 'border-fuchsia-200 hover:border-fuchsia-400'; icon = '🎭 '; }
            
            html += `
                <div class="bg-white border-2 ${boxBorder} rounded-xl p-2 shrink-0 flex flex-col gap-1 w-32 shadow-sm transition-colors">
                    <div class="text-[10px] font-black text-slate-700 text-center border-b border-slate-100 pb-1 truncate" title="${baseName}">${icon}${baseName}</div>
                    <div class="flex flex-wrap gap-1 justify-center">
                        ${chipsHtml}
                    </div>
                </div>
            `;
        }
        container.innerHTML = html;
    },

    bindScrollEvents: function() {
        const container = document.getElementById('juryCardContainer');
        if (!container || container.dataset.scrollBound === 'true') return;
        let isDown = false, startX, scrollLeft;

        container.addEventListener('mousedown', (e) => {
            if (e.target.closest('[draggable="true"]')) return;
            isDown = true; container.classList.add('cursor-grabbing');
            startX = e.pageX - container.offsetLeft; scrollLeft = container.scrollLeft;
        });
        container.addEventListener('mouseleave', () => { isDown = false; container.classList.remove('cursor-grabbing'); });
        container.addEventListener('mouseup', () => { isDown = false; container.classList.remove('cursor-grabbing'); });
        container.addEventListener('mousemove', (e) => {
            if (!isDown) return; e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            container.scrollLeft = scrollLeft - (x - startX) * 1.5;
        });
        container.dataset.scrollBound = 'true';
    },

    // ==========================================
    // 2. HTML5 拖拽安全升级（绝不拒绝、绝不闪退）
    // ==========================================
    dragStart: function(event, encodedPayload) {
        event.dataTransfer.setData('text/plain', encodedPayload);
        event.dataTransfer.effectAllowed = 'copy';
        const data = JSON.parse(decodeURIComponent(encodedPayload));

        // 🛡️ 核心修复：创建残影，挂载到隐藏区域，绝不瞬间回收
        const ghost = document.createElement('div');
        ghost.className = "bg-white border-2 border-indigo-500 text-indigo-700 font-black px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-1.5 pointer-events-none select-none text-xs";
        ghost.style.position = 'fixed'; ghost.style.top = '-500px'; ghost.style.left = '-500px';
        ghost.innerHTML = `<span>⚖️ ${data.name}</span> <span class="bg-rose-100 text-rose-600 px-1 rounded">-${data.deduction.toFixed(1)}</span>`;
        document.body.appendChild(ghost);
        
        event.dataTransfer.setDragImage(ghost, 40, 15);
        this.activeGhostNode = ghost; // 固化引用，阻断 GC 垃圾回收机制

        setTimeout(() => event.target.classList.add('opacity-40', 'scale-90'), 0);
    },
    
    dragEnd: function(event) {
        event.target.classList.remove('opacity-40', 'scale-90');
        // 🛡️ 拖拽彻底结束，安全销毁残影节点
        if (this.activeGhostNode && this.activeGhostNode.parentNode) {
            this.activeGhostNode.parentNode.removeChild(this.activeGhostNode);
            this.activeGhostNode = null;
        }
    },
    
    dragOver: function(event) {
        event.preventDefault(); 
        event.dataTransfer.dropEffect = 'copy';
        const dropZone = event.target.closest('.drop-zone');
        if (dropZone) dropZone.classList.add('bg-indigo-50', 'border-indigo-400', 'scale-[1.01]', 'shadow-inner');
    },
    
    dragLeave: function(event) {
        const dropZone = event.target.closest('.drop-zone');
        if (dropZone) dropZone.classList.remove('bg-indigo-50', 'border-indigo-400', 'scale-[1.01]', 'shadow-inner');
    },
    
    drop: function(event, skillIndex) {
        event.preventDefault();
        const dropZone = event.target.closest('.drop-zone');
        if (dropZone) dropZone.classList.remove('bg-indigo-50', 'border-indigo-400', 'scale-[1.01]', 'shadow-inner');
        
        const rawPayload = event.dataTransfer.getData('text/plain');
        if (!rawPayload || rawPayload === 'remove_fault') return;
        
        try {
            const data = JSON.parse(decodeURIComponent(rawPayload));
            this.appliedFaults[skillIndex].push(data);
            this.currentDeductions += data.deduction;
            this.updateDropZoneUI(skillIndex);
            this.updateTotalUI();
        } catch (e) { console.error(e); }
    },

    dragFaultStart: function(event, skillIndex, faultIndex) {
        event.dataTransfer.setData('text/plain', 'remove_fault');
        event.dataTransfer.effectAllowed = 'move';
        const fault = this.appliedFaults[skillIndex][faultIndex];

        const ghost = document.createElement('div');
        ghost.className = "bg-rose-50 border-2 border-rose-500 text-rose-700 font-black px-3 py-1.5 rounded-lg shadow-xl pointer-events-none select-none text-xs";
        ghost.style.position = 'fixed'; ghost.style.top = '-500px'; ghost.style.left = '-500px';
        ghost.innerHTML = `<span>🗑️ 撤销: ${fault.name}</span>`;
        document.body.appendChild(ghost);
        
        event.dataTransfer.setDragImage(ghost, 40, 15);
        this.activeGhostNode = ghost;

        setTimeout(() => event.target.classList.add('opacity-30', 'scale-90'), 0);
    },

    dragFaultEnd: function(event, skillIndex, faultIndex) {
        event.target.classList.remove('opacity-30', 'scale-90');
        if (this.activeGhostNode && this.activeGhostNode.parentNode) {
            this.activeGhostNode.parentNode.removeChild(this.activeGhostNode);
            this.activeGhostNode = null;
        }
        if (event.dataTransfer.dropEffect === 'none') {
            this.removeFault(skillIndex, faultIndex);
            ToastManager.show('info', '销毁成功', '卡片已移出，扣分已撤销！', 1500);
        }
    },

    // ==========================================
    // 3. 【新增】：面板高保真折叠收纳控制器
    // ==========================================
    toggleMinimize: function() {
        const deck = document.getElementById('juryCardDeck');
        const arrow = document.getElementById('juryToggleArrow');
        const text = document.getElementById('juryToggleText');
        if (!deck) return;

        this.isMinimized = !this.isMinimized;

        if (this.isMinimized) {
            // 极限折叠：利用 CSS Calc 仅露出 55px 高度的头部栏，卡牌隐藏
            deck.style.transform = 'translateY(calc(100% - 55px))';
            if (arrow) arrow.style.transform = 'rotate(180deg)';
            if (text) text.innerText = '展开';
        } else {
            // 完全恢复原状
            deck.style.transform = 'translateY(0)';
            if (arrow) arrow.style.transform = 'rotate(0deg)';
            if (text) text.innerText = '收起';
        }
    },

    removeFault: function(skillIndex, faultIndex) {
        const fault = this.appliedFaults[skillIndex][faultIndex];
        this.currentDeductions -= fault.deduction;
        this.appliedFaults[skillIndex].splice(faultIndex, 1);
        this.updateDropZoneUI(skillIndex);
        this.updateTotalUI();
    },

    updateDropZoneUI: function(skillIndex) {
        const zone = document.getElementById(`dropZone_${skillIndex}`);
        if (!zone) return;
        const faults = this.appliedFaults[skillIndex];
        
        if (faults.length === 0) {
            zone.innerHTML = `<div class="text-slate-400 font-bold text-[10px] pointer-events-none flex flex-col items-center gap-0.5"><span class="text-sm">📥</span> 将扣分卡片拖放于此</div>`;
            return;
        }
        
        let html = '<div class="flex flex-wrap gap-1 w-full p-0.5">';
        faults.forEach((f, idx) => {
            let colorClass = f.deduction >= 1.0 ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-white text-slate-700 border-slate-200';
            let textColor = 'text-rose-500';
            
            // ✨ 根据卡片属性赋色
            if (f.isDScore) {
                colorClass = 'bg-blue-100 text-blue-700 border-blue-300';
                textColor = 'text-blue-600';
            } else if (f.isArtistry) {
                colorClass = 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300';
                textColor = 'text-fuchsia-600';
            }

            html += `
                <div draggable="true"
                     ondragstart="ManualJurySystem.dragFaultStart(event, ${skillIndex}, ${idx})"
                     ondragend="ManualJurySystem.dragFaultEnd(event, ${skillIndex}, ${idx})"
                     class="${colorClass} border px-1.5 py-1 rounded-md text-[10px] font-bold shadow-sm flex items-center gap-1 group transform transition-all cursor-grab active:cursor-grabbing hover:scale-105">
                    <span>${f.name} <span class="${textColor} ml-0.5">-${f.deduction.toFixed(1)}</span></span>
                    <button onclick="ManualJurySystem.removeFault(${skillIndex}, ${idx})" class="text-slate-300 hover:text-red-500 bg-white/50 rounded-full w-3 h-3 flex items-center justify-center hidden group-hover:flex transition-colors">&times;</button>
                </div>
            `;
        });
        html += '</div>';
        zone.innerHTML = html;
    },

    updateTotalUI: function() {
        this.currentDeductions = Math.round(this.currentDeductions * 10) / 10;
        document.getElementById('juryDeckTotalDeduction').innerText = `-${this.currentDeductions.toFixed(1)}`;
    },

    showPanel: function(track, index, nextCallback) {
        if (track.type === 'transit' || !track.skills || track.skills.length === 0) {
            nextCallback(); 
            return;
        }

        this.currentTrack = track;
        this.nextCallback = nextCallback;
        this.currentDeductions = 0;
        this.appliedFaults = track.skills.map(() => []); 
        this.isMinimized = false; 
        
        const deck = document.getElementById('juryCardDeck');
        const arrow = document.getElementById('juryToggleArrow');
        const text = document.getElementById('juryToggleText');
        if(deck) deck.style.transform = 'translateY(0)';
        if(arrow) arrow.style.transform = 'rotate(0deg)';
        if(text) text.innerText = '收起';

        this.updateTotalUI();
        this.initCardDeck();
        this.bindScrollEvents();

        const searchInput = document.getElementById('juryCardSearch');
        const filterSelect = document.getElementById('juryCardFilter');
        if(searchInput) searchInput.oninput = () => this.initCardDeck();
        if(filterSelect) filterSelect.onchange = () => this.initCardDeck();

        if(deck) {
            deck.classList.remove('translate-y-full');
            deck.classList.add('translate-y-0');
        }

        this.renderJuryDropZones(track, index);

        // ✨ 核心黑科技：裁判面板弹出时，扫描艺术违规并弹窗警告！
        setTimeout(() => {
            let validTracks = canvasManager.tracks.filter(t => t.skills && t.skills.length > 0);
            let isLastTrack = track.id === validTracks[validTracks.length - 1].id;
            
            // 警报 1：开场直接技巧
            if (index === 0 && track.type === 'line') {
                ToastManager.show('warning', '艺术分违规提示', '🎭 选手开场直接进入技巧串，缺乏舞蹈铺垫！\\n建议在【艺术与编排】分类中拖拽罚分。', 5500);
            }
            // 警报 2：结尾没有舞蹈
            if (isLastTrack && track.type === 'line') {
                ToastManager.show('warning', '艺术分违规提示', '🎭 选手以技巧串直接结束成套，缺乏舞蹈收尾！\\n建议在【艺术与编排】分类中拖拽罚分。', 5500);
            }
            // 警报 3：技巧串超限
            let acroCount = canvasManager.tracks.filter((t, i) => i <= index && t.type === 'line' && t.skills.length > 0).length;
            if (track.type === 'line' && acroCount > 4) {
                ToastManager.show('warning', '编排违规提示', '⚠️ 这是本成套的第 ' + acroCount + ' 串技巧！\\n多余的技巧串应予以编排扣分！', 5500);
            }
        }, 500);
    },

    renderJuryDropZones: function(track, trackIndex) {
        const list = document.getElementById('routineList');
        let html = `
            <div class="bg-indigo-600 p-3 mb-3 rounded-xl shadow-md text-white border border-indigo-500 relative overflow-hidden select-none">
                <h3 class="font-black text-sm mb-0.5 relative z-10">E裁模式：路线 ${trackIndex + 1}</h3>
                <p class="text-indigo-200 text-[10px] font-bold relative z-10">请从下方牌库拖拽卡片至下方相应的动作虚线框</p>
            </div>
        `;

        track.skills.forEach((skill, idx) => {
            html += `
                <div class="mb-3 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transform transition-all duration-300">
                    <div class="bg-slate-50 px-2.5 py-2 border-b border-slate-100 flex justify-between items-center select-none">
                        <div class="font-black text-slate-800 text-xs flex items-center gap-1.5">
                            <span class="bg-white border border-slate-200 w-5 h-5 rounded-full flex items-center justify-center text-[9px] shadow-sm text-slate-400">${idx+1}</span> 
                            ${skill.nameZh[0]}
                        </div>
                        <span class="text-[9px] font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 shadow-sm">${skill.difficulty} 组</span>
                    </div>
                    <div class="p-2 bg-white">
                        <div id="dropZone_${idx}" 
                             class="drop-zone border-2 border-dashed border-slate-300 rounded-xl min-h-[60px] flex flex-col items-center justify-center p-1.5 transition-all duration-200 bg-slate-50"
                             ondragover="ManualJurySystem.dragOver(event)"
                             ondragleave="ManualJurySystem.dragLeave(event)"
                             ondrop="ManualJurySystem.drop(event, ${idx})">
                            <div class="text-slate-400 font-bold text-xs pointer-events-none flex flex-col items-center gap-0.5">
                                <span class="text-base">📥</span> 将扣分卡片拖拽放置于此
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        list.innerHTML = html;
        
        // 🛡️ 核心注入：在 CSS 树中封杀所有 drop-zone 子元素的鼠标事件，实现 100% 精准释放吸入！
        const styleId = "dropZoneFixStyle";
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `.drop-zone * { pointer-events: none !important; }`;
            document.head.appendChild(style);
        }
    },

    confirmAndContinue: function() {
        let manualFaults = [];
        this.appliedFaults.forEach((faultsForSkill, skillIdx) => {
            faultsForSkill.forEach(f => {
                manualFaults.push({ skillIdx: skillIdx, faultName: f.name, deduction: f.deduction, isArtistry: f.isArtistry });
            });
        });
        
        this.currentTrack.manualDeductions = manualFaults;
        this.currentTrack.manualDeductionTotal = this.currentDeductions;

        const deck = document.getElementById('juryCardDeck');
        if(deck) {
            deck.classList.remove('translate-y-0');
            deck.classList.add('translate-y-full');
            deck.style.transform = ''; 
        }

        if (typeof AppController !== 'undefined') AppController.updateUIRoutineList();
        if (this.nextCallback) this.nextCallback();
    }
};

window.showManualEJuryPanel = function(track, index, nextCallback) {
    ManualJurySystem.showPanel(track, index, nextCallback);
};