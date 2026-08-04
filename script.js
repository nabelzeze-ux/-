// ============================================================
// 🎡 عجلة الحظ - النسخة النهائية (تعمل بدون API)
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
        this.winIndex = null;
        
        // ✅ بدء التشغيل فوراً
        this.init();
    }
    
    init() {
        // ✅ قراءة المعاملات من الرابط
        const urlParams = new URLSearchParams(window.location.search);
        const prizesParam = urlParams.get('prizes');
        const winParam = urlParams.get('win');
        const userIdParam = urlParams.get('user_id');
        
        console.log('📥 البيانات المستلمة من البوت:');
        console.log('  prizes:', prizesParam);
        console.log('  win:', winParam);
        console.log('  user_id:', userIdParam);
        
        // ✅ تخزين البيانات
        this.userId = userIdParam;
        this.winIndex = parseInt(winParam) || 0;
        
        // ✅ قراءة الجوائز من الرابط
        if (prizesParam) {
            try {
                const decoded = decodeURIComponent(prizesParam);
                const prizesArray = JSON.parse(decoded);
                this.prizes = prizesArray.map(name => ({ name }));
                console.log('✅ تم قراءة الجوائز:', this.prizes.length, 'جائزة');
            } catch (e) {
                console.error('❌ خطأ في قراءة الجوائز:', e);
                this.setDefaultPrizes();
            }
        } else {
            console.warn('⚠️ لا توجد جوائز في الرابط، استخدام الجوائز الافتراضية');
            this.setDefaultPrizes();
        }
        
        // ✅ رسم العجلة فوراً
        this.drawWheel();
        this.loadingDiv.style.display = 'none';
        
        // ✅ إذا كان هناك جائزة محددة، قم بالدوران
        if (this.winIndex >= 0 && this.winIndex < this.prizes.length) {
            this.spinsSpan.textContent = '1';
            this.spinBtn.disabled = false;
            this.spinBtn.textContent = '🎡 تدوير (متبقي 1)';
            
            // ✅ الدوران بعد 1.5 ثانية
            setTimeout(() => {
                this.spinToPrize(this.winIndex);
            }, 1500);
        } else {
            this.spinsSpan.textContent = '0';
            this.spinBtn.disabled = true;
            this.spinBtn.textContent = '🚫 لا توجد لفات';
        }
    }
    
    setDefaultPrizes() {
        this.prizes = [
            { name: '50,000 SYP' },
            { name: '10,000 SYP' },
            { name: '5,000 SYP' },
            { name: '1,000 SYP' },
            { name: 'بونص شحن 20%' },
            { name: 'بونص شحن 10%' },
            { name: 'سحب مجاني' },
            { name: '50 نقطة ولاء' },
            { name: 'حظاً أوفر!' }
        ];
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
        
        const defaultColors = [
            '#FF6B6B', '#FFA94D', '#FFD93D', '#6BCB77',
            '#4D96FF', '#9B59B6', '#FF6B9D', '#00C9A7',
            '#FF8A5C', '#A29BFE', '#FD79A8', '#00B894'
        ];
        
        for (let i = 0; i < this.prizes.length; i++) {
            const startAngle = this.currentAngle + i * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            
            const prize = this.prizes[i];
            const color = prize.color || defaultColors[i % defaultColors.length];
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const textRadius = radius * 0.65;
            const text = prize.name || `جائزة ${i+1}`;
            
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#fff';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 5;
            
            if (text.length > 12) {
                const lines = this.splitText(text, 12);
                const lineHeight = 20;
                const startY = -((lines.length - 1) * lineHeight) / 2;
                for (let j = 0; j < lines.length; j++) {
                    ctx.fillText(lines[j], textRadius, startY + j * lineHeight);
                }
            } else {
                ctx.fillText(text, textRadius, 0);
            }
            
            ctx.restore();
        }
        
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
    
    spinToPrize(winIndex) {
        if (this.isSpinning) return;
        if (this.prizes.length === 0) return;
        if (winIndex < 0 || winIndex >= this.prizes.length) return;
        
        this.isSpinning = true;
        this.spinBtn.disabled = true;
        this.resultDiv.textContent = '🎡 جاري التدوير...';
        
        const sliceAngle = (2 * Math.PI) / this.prizes.length;
        const targetAngle = this.currentAngle + (2 * Math.PI * 5) + (winIndex * sliceAngle) + (sliceAngle / 2);
        
        this.animateSpin(targetAngle, winIndex);
    }
    
    animateSpin(targetAngle, winIndex) {
        const startAngle = this.currentAngle;
        const duration = 4000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const eased = 1 - Math.pow(1 - progress, 3);
            this.currentAngle = startAngle + (targetAngle - startAngle) * eased;
            
            this.drawWheel();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.currentAngle = targetAngle;
                this.drawWheel();
                
                const prize = this.prizes[winIndex];
                this.resultDiv.innerHTML = `🎉 <span class="winner-text">مبروك! ربحت ${prize.name}</span>`;
                this.isSpinning = false;
                this.spinBtn.disabled = true;
                this.spinBtn.textContent = '✅ تم التدوير';
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// ============================================================
// تشغيل العجلة
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const wheel = new WheelOfFortune();
    window.wheel = wheel;
});
