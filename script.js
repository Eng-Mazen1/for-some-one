const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

// ضبط وتحديث أبعاد الكانفاس
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ==========================================
// 1. إعدادات وتأثير الماتريكس الخلفية (Matrix Rain)
// ==========================================
const katakana = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ♡ERROR';
const alphabet = katakana.split('');
const fontSize = 14; 
let columns = Math.floor(canvas.width / fontSize);
let rainDrops = [];

function initMatrix() {
    columns = Math.floor(canvas.width / fontSize);
    rainDrops = [];
    for (let x = 0; x < columns; x++) {
        rainDrops[x] = Math.random() * -80; // توزيع الخيوط عمودياً بشكل متباعد
    }
}
initMatrix();
window.addEventListener('resize', initMatrix);

function drawMatrixBackground() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // تأثير التعتيم التدريجي لخيوط الماتريكس
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet[Math.floor(Math.random() * alphabet.length)];
        
        // جعل الحرف الأول من كل خيط أبيض وباقي الخيط وردي فوشيا
        if (Math.random() > 0.98) {
            ctx.fillStyle = '#ffffff'; 
        } else {
            ctx.fillStyle = '#630b0b'; 
        }

        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.99) {
            rainDrops[i] = 0;
        }
        rainDrops[i] += 0.4; // سرعة هبوط الخيوط (هادئة ومطابقة للفيديو)
    }
}

// ==========================================
// 2. نظام الجزيئات المتطور (Particle System)
// ==========================================
class Particle {
    constructor(x, y, targetX, targetY, isHeartParticle = false) {
        // تجميع الجزيئات من محيط قريب لراحة العين أثناء التشكيل
        this.x = targetX + (Math.random() - 0.5) * 150;
        this.y = targetY + (Math.random() - 0.5) * 150;
        this.targetX = targetX;
        this.targetY = targetY;
        this.size = isHeartParticle ? (Math.random() * 2 + 1.5) : 2; 
        this.speed = 0.06; // سرعة حركة مرنة ومريحة للقراءة
        this.isHeart = isHeartParticle;
        
        // النص يظهر باللون الأبيض، والقلب باللون الوردي المضيء
        this.color = isHeartParticle 
            ? `hsl(${340 + Math.random() * 15}, 100%, ${65 + Math.random() * 15}%)` 
            : '#ffffff';
        
        this.alpha = 0; // تأثير Fade-in عند الظهور
        this.isDispersing = false; // تأثير التبعثر عند الانتقال
    }
    update() {
        if (this.isDispersing) {
            this.x += (Math.random() - 0.5) * 3;
            this.y += (Math.random() - 0.5) * 3;
            this.alpha -= 0.03; 
        } else {
            this.x += (this.targetX - this.x) * this.speed;
            this.y += (this.targetY - this.y) * this.speed;
            if (this.alpha < 1) this.alpha += 0.04; 
        }
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        
        // توهج خفيف (Glow Effect) لجعل العناصر حادة وواضحة
        ctx.shadowBlur = this.isHeart ? 6 : 4;
        ctx.shadowColor = this.color;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let particles = [];
let currentStage = 0;
let stageTimer = 0;

const stages = ["3", "2", "1", "Proud", "of", "what", "you", "doing","TOTA"; "Heart"];
const stageDuration = 150;
const disperseTime = 25;    

function createParticlesForText(text, isHeart = false) {
    const memCanvas = document.createElement('canvas');
    const memCtx = memCanvas.getContext('2d');
    memCanvas.width = canvas.width;
    memCanvas.height = canvas.height;

    if (isHeart) {
        
        memCtx.fillStyle = '#fff';
        memCtx.translate(canvas.width / 2, canvas.height / 2);
        memCtx.beginPath();
        for (let t = 0; t < Math.PI * 2; t += 0.008) {
            let x = 16 * Math.pow(Math.sin(t), 3);
            let y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            memCtx.lineTo(x * 14, y * 14);     
        }
        memCtx.fill();
    } else {

        let fSize = Math.min(canvas.width, canvas.height) * 0.22;
        memCtx.font = `bold ${fSize}px sans-serif`;
        memCtx.fillStyle = '#fff';
        memCtx.textAlign = 'center';
        memCtx.textBaseline = 'middle';
        memCtx.fillText(text, canvas.width / 2, canvas.height / 2);
    }

    const imgData = memCtx.getImageData(0, 0, canvas.width, canvas.height).data;
    const step = 5; // كثافة الجزيئات (رقم أقل يعني جودة أعلى وخط أوضح)
    const newParticles = [];

    for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
            const index = (y * canvas.width + x) * 4;
            if (imgData[index + 3] > 128) {
                newParticles.push(new Particle(x, y, x, y, isHeart));
            }
        }
    }
    particles = newParticles;
}

// تشغيل البداية (رقم 3)
createParticlesForText(stages[currentStage]);

// رسم النص الداخلي الثابت في النهاية (تم تعديل الأسطر والإيموجي بناءً على طلبك)
function drawCenterText() {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff3385';

    // 1. السطر الأول (إنجليزي)
    ctx.font = 'bold 26px monospace';
    ctx.fillText('My Fav ', canvas.width / 2, canvas.height / 2 - 35);

    // 2. السطر الثاني (عربي)
    ctx.font = 'bold 22px sans-serif'; 
    ctx.fillText('Happy Birth Day Ya Gameel❤️✨ ', canvas.width / 2, canvas.height / 2 + 15);

    // 3. السطر الثالث (إيموجي واضح وحجمه مميز)
    ctx.font = '30px sans-serif';
    ctx.fillText('💖', canvas.width / 2, canvas.height / 2 + 65);

    ctx.restore();
}

// ==========================================
// 3. حلقة الرسوم المتحركة الأساسية (Animation Loop)
// ==========================================
function animate() {
    drawMatrixBackground();

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    stageTimer++;

    // بدء التلاشي التدريجي للجزيئات قبل انتهاء المرحلة
    if (stageTimer === stageDuration - disperseTime && currentStage < stages.length - 1) {
        particles.forEach(p => p.isDispersing = true);
    }

    // الانتقال للمرحلة التالية بالكامل
    if (stageTimer >= stageDuration) {
        if (currentStage < stages.length - 1) {
            currentStage++;
            stageTimer = 0;
            if (stages[currentStage] === "Heart") {
                createParticlesForText("", true);
            } else {
                createParticlesForText(stages[currentStage], false);
            }
        }
    }

    // إظهار العبارة الختامية داخل القلب بعد استقراره
    if (stages[currentStage] === "Heart" && stageTimer > 60) {
        drawCenterText();
    }

    requestAnimationFrame(animate);
}

// الانطلاق!
animate();
// تشغيل وتحكم الأغنية
const audio = document.getElementById('bgMusic');
const playPauseBtn = document.getElementById('playPauseBtn');
const timeDisplay = document.getElementById('timeDisplay');

window.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = '❚❚';
    }
}, { once: true });

playPauseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = '❚❚';
    } else {
        audio.pause();
        playPauseBtn.textContent = '▶';
    }
});

audio.addEventListener('timeupdate', () => {
    const curMin = Math.floor(audio.currentTime / 60);
    const curSec = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
    const durMin = Math.floor((audio.duration || 0) / 60);
    const durSec = Math.floor((audio.duration || 0) % 60).toString().padStart(2, '0');
    timeDisplay.textContent = `${curMin}:${curSec} / ${durMin}:${durSec}`;
});
