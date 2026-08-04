// ============================================================
// 🎡 عجلة الحظ - JavaScript (النسخة الكاملة)
// ============================================================

class WheelOfFortune {
    constructor() {
        this.canvas = document.getElementById('wheel');
        this.ctx = this.canvas.getContext('2d');
        this.spinBtn = document.getElementById('spinBtn');
        this.resultDiv = document.getElementById('result');
        this.spinsSpan = document.getElementById('spinsCount');
        this.loadingDiv = document.getElementById('loading');
        
        this.prizes = [];
        this.currentAngle = 0;
        this.isSpinning = false;
        this.userId = null;
        this.botUrl = null;
        
        this.init();
    }
    
    init() {
        // الحصول على بيانات المستخدم من Telegram WebApp
        const tg = window.Telegram?.WebApp;
        if (tg) {
            tg.ready();
            tg.expand();
            this.userId = tg.initDataUnsafe?.user?.id;
        }
        
        // قراءة المعاملات من الرابط
        const urlParams = new URLSearchParams(window.location.search);
        this.botUrl = urlParams.get('bot_url') || 'https://your-bot-domain.com';
        
        // جلب البيانات من البوت
        this.fetchStatus();
        
        // إضافة مستمع للزر
        this.spinBtn.addEventListener('click', () => this.spin());
    }
    
    async fetchStatus() {
        try {
            this.loadingDiv.textContent = '⏳ جاري جلب البيانات...';
            
            const response = await fetch(`${this.botUrl}/api/wheel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'status',
                    user_id: this.userId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.prizes = data.prizes || [];
                this.spinsSpan.textContent = data.spins || 0;
                this.spinBtn.disabled = data.spins <= 0;
                
                if (data.spins > 0) {
                    this.spinBtn.textContent = `🎡 تدوير (متبقي ${data.spins})`;
                } else {
                    this.spinBtn.textContent = '🚫 لا توجد لفات';
                }
                
                this.loadingDiv.style.display = 'none';
                this.drawWheel();
            } else {
                this.loadingDiv.textContent = '❌ ' + (data.error || 'فشل جلب البيانات');
            }
        } catch (error) {
            this.loadingDiv.textContent = '❌ خطأ في الاتصال بالبوت';
            console.error('Error fetching status:', error);
        }
    }
    
    drawWheel() {
        const canvas = this.canvas;
        const ctx = this.ctx;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 2 - 10;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.prizes.length === 0) {
            ctx.fillStyle = '#333';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('لا توجد جوائز', centerX, centerY);
            return;
        }
        
        const sliceAngle = (2 * Math.PI) / this.prizes.length;
        
        // الألوان المخصصة أو العشوائية
        const defaultColors = [
            '#FF6B6B', '#FFA94D', '#FFD93D', '#6BCB77',
            '#4D96FF', '#9B59B6', '#FF6B9D', '#00C9A7',
            '#FF8A5C', '#A29BFE', '#FD79A8', '#00B894'
        ];
        
        for (let i = 0; i < this.prizes.length; i++) {
            const startAngle = this.currentAngle + i * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            
            // اختيار اللون
            const prize = this.prizes[i];
            const color = prize.color || defaultColors[i % defaultColors.length];
            
            // رسم القطاع
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // كتابة النص
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const textRadius = radius * 0.65;
            const text = prize.name || `جائزة ${i+1}`;
            
            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = '#fff';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 5;
            
            // تقسيم النص إذا كان طويلاً
            if (text.length > 12) {
                const lines = this.splitText(text, 12);
                const lineHeight = 22;
                const startY = -((lines.length - 1) * lineHeight) / 2;
                for (let j = 0; j < lines.length; j++) {
                    ctx.fillText(lines[j], textRadius, startY + j * lineHeight);
                }
            } else {
                ctx.fillText(text, textRadius, 0);
            }
            
            ctx.restore();
        }
        
        // رسم الدائرة الداخلية
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
        ctx.fillStyle = '#1a1a3e';
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    splitText(text, maxLength) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            if ((currentLine + word).length > maxLength) {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine += word + ' ';
            }
        }
        if (currentLine.trim()) {
            lines.push(currentLine.trim());
        }
        return lines.length > 0 ? lines : [text];
    }
    
    async spin() {
        if (this.isSpinning) return;
        if (this.spinBtn.disabled) return;
        
        this.isSpinning = true;
        this.spinBtn.disabled = true;
        this.resultDiv.textContent = '🎡 جاري التدوير...';
        
        try {
            // طلب الدوران من البوت
            const response = await fetch(`${this.botUrl}/api/wheel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'spin',
                    user_id: this.userId
                })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                this.resultDiv.textContent = '❌ ' + (data.error || 'فشل الدوران');
                this.spinBtn.disabled = false;
                this.isSpinning = false;
                return;
            }
            
            // تحديث عدد اللفات المتبقية
            this.spinsSpan.textContent = data.remaining_spins || 0;
            this.spinBtn.textContent = data.remaining_spins > 0 ? 
                `🎡 تدوير (متبقي ${data.remaining_spins})` : 
                '🚫 لا توجد لفات';
            
            // تحديث الجوائز إذا تغيرت
            if (data.prizes && data.prizes.length > 0) {
                this.prizes = data.prizes.map(name => ({ name }));
            }
            
            // حساب زاوية التوقف
            const stopAngle = data.stop_angle || 0;
            const targetAngle = this.currentAngle + (2 * Math.PI * 5) + (stopAngle * Math.PI / 180);
            
            // تنفيذ الدوران
            await this.animateSpin(targetAngle);
            
            // عرض النتيجة
            const prize = data.prize || {};
            this.resultDiv.innerHTML = `🎉 <span class="winner-text">مبروك! ربحت ${prize.name || 'جائزة'}</span>`;
            
            // إرسال تأكيد الفوز للبوت
            await this.claimPrize(prize);
            
            // تحديث الحالة
            await this.fetchStatus();
            
        } catch (error) {
            this.resultDiv.textContent = '❌ حدث خطأ، حاول مرة أخرى';
            console.error('Spin error:', error);
        }
        
        this.isSpinning = false;
        this.spinBtn.disabled = this.spinsSpan.textContent <= 0;
    }
    
    animateSpin(targetAngle) {
        return new Promise((resolve) => {
            const startAngle = this.currentAngle;
            const duration = 4000; // 4 ثواني
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // منحنى سلس (ease-out)
                const eased = 1 - Math.pow(1 - progress, 3);
                this.currentAngle = startAngle + (targetAngle - startAngle) * eased;
                
                this.drawWheel();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.currentAngle = targetAngle;
                    this.drawWheel();
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }
    
    async claimPrize(prize) {
        try {
            await fetch(`${this.botUrl}/api/wheel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'claim',
                    user_id: this.userId,
                    prize: prize
                })
            });
        } catch (error) {
            console.error('Claim error:', error);
        }
    }
}

// ============================================================
// تشغيل العجلة
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const wheel = new WheelOfFortune();
    window.wheel = wheel;
});
