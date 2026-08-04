// ============================================================
// 🎡 عجلة الحظ - النسخة النهائية (تعمل بدون API)
// X TEAM - قراءة البيانات من الرابط مباشرة
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
        
        // ✅ الألوان الافتراضية للقطاعات
        this.defaultColors = [
            '#FF6B6B', '#FFA94D', '#FFD93D', '#6BCB77',
            '#4D96FF', '#9B59B6', '#FF6B9D', '#00C9A7',
            '#FF8A5C', '#A29BFE', '#FD79A8', '#00B894'
        ];
        
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
                console.log('📋 الجوائز:', this.prizes.map(p => p.name).join(' | '));
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
            this.spinBtn.classList.add('pulse');
            
            // ✅ الدوران بعد 1.5 ثانية
            setTimeout(() => {
                this.spinToPrize(this.winIndex);
            }, 1500);
        } else {
            this.spinsSpan.textContent = '0';
            this.spinBtn.disabled = true;
            this.spinBtn.textContent = '🚫 لا توجد لفات';
            this.spinBtn.classList.remove('pulse');
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
            ctx.fillStyle = '#888';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚠️ لا توجد جوائز', centerX, centerY);
            return;
        }
        
        const sliceAngle = (2 * Math.PI) / this.prizes.length;
        
        for (let i = 0; i < this.prizes.length; i++) {
            const startAngle = this.currentAngle + i * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            
            const prize = this.prizes[i];
            const color = prize.color || this.defaultColors[i % this.defaultColors.length];
            
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
            
            // كتابة النص داخل القطاع
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const textRadius = radius * 0.65;
            const text = prize.name || `جائزة ${i+1}`;
            
            ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#fff';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 5;
            
            // تقسيم النص إذا كان طويلاً
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
        
        // الدائرة المركزية
        ctx.beginPath();
        ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
        ctx.fillStyle = '#1a1a3e';
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // نص "X" في المنتصف
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255,215,0,0.3)';
        ctx.shadowBlur = 10;
        ctx.fillText('X', centerX, centerY);
        ctx.shadowBlur = 0;
    }
    
    splitText(text, maxLength) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            if ((currentLine + word).length > maxLength) {
                if (currentLine.trim()) {
                    lines.push(currentLine.trim());
                }
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
        this.spinBtn.classList.remove('pulse');
        this.resultDiv.textContent = '🎡 جاري التدوير...';
        this.resultDiv.style.color = '#FFD700';
        
        const sliceAngle = (2 * Math.PI) / this.prizes.length;
        // دوران 5 لفات كاملة + الوصول إلى القطاع المطلوب
        const targetAngle = this.currentAngle + (2 * Math.PI * 5) + (winIndex * sliceAngle) + (sliceAngle / 2);
        
        this.animateSpin(targetAngle, winIndex);
    }
    
    animateSpin(targetAngle, winIndex) {
        const startAngle = this.currentAngle;
        const duration = 4500; // 4.5 ثواني
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
                
                // عرض النتيجة
                const prize = this.prizes[winIndex];
                this.resultDiv.innerHTML = `🎉 <span class="winner-text">مبروك! ربحت ${prize.name}</span>`;
                this.isSpinning = false;
                this.spinBtn.disabled = true;
                this.spinBtn.textContent = '✅ تم التدوير';
                
                // اهتزاز خفيف للاحتفال
                this.resultDiv.style.animation = 'winAnimation 0.5s ease-in-out';
                
                console.log('🎉 الجائزة الفائزة:', prize.name);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // ✅ دالة للدوران اليدوي (عند الضغط على الزر)
    spin() {
        if (this.isSpinning) return;
        if (this.spinBtn.disabled) return;
        
        // ✅ إذا كان هناك جائزة محددة مسبقاً، استخدمها
        if (this.winIndex !== null && this.winIndex >= 0 && this.winIndex < this.prizes.length) {
            this.spinToPrize(this.winIndex);
        } else {
            // ✅ إذا لم تكن هناك جائزة محددة (لن يحدث مع الحل 5)
            this.resultDiv.textContent = '⚠️ لا توجد جائزة محددة!';
            this.resultDiv.style.color = '#FF6B6B';
        }
    }
}

// ============================================================
// تشغيل العجلة عند تحميل الصفحة
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const wheel = new WheelOfFortune();
    window.wheel = wheel;
    
    // ✅ ربط زر التدوير بالدالة
    document.getElementById('spinBtn').addEventListener('click', () => {
        wheel.spin();
    });
});
