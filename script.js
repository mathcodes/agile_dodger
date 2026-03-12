
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        const overlay = document.getElementById('message-overlay');
        const msgTitle = document.getElementById('message-title');
        const msgSub = document.getElementById('message-sub');
        const msgDetail = document.getElementById('message-detail');
        const actionBtn = document.getElementById('action-btn');

        const livesEl = document.getElementById('lives-val');
        const scoreEl = document.getElementById('score-val');
        const levelEl = document.getElementById('level-val');
        const agileEl = document.getElementById('agile-val');
        const totalEl = document.getElementById('total-val');
        const levelProgressEl = document.getElementById('level-progress-val');

        const W = canvas.width;
        const H = canvas.height;

        // Game state
        let lives, score, level, agileReward, totalRequired, levelPoints;
        let player, obstacles, particles, starField;
        let keys = {};
        let gameRunning = false;
        let animFrameId;
        let spawnTimer = 0;
        let spawnInterval;
        let respawning = false;
        let respawnTimer = 0;
        let flashTimer = 0;
        let shakeAmount = 0;
        let comboText = [];

        // --- STAR FIELD ---
        function createStarField() {
            starField = [];
            for (let i = 0; i < 120; i++) {
                starField.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    speed: 0.2 + Math.random() * 0.8,
                    size: 0.5 + Math.random() * 1.5,
                    alpha: 0.3 + Math.random() * 0.7
                });
            }
        }

        function updateStarField() {
            for (let s of starField) {
                s.x -= s.speed;
                if (s.x < 0) {
                    s.x = W;
                    s.y = Math.random() * H;
                }
            }
        }

        function drawStarField() {
            for (let s of starField) {
                ctx.fillStyle = `rgba(255,255,255,${s.alpha * 0.4})`;
                ctx.fillRect(s.x, s.y, s.size, s.size);
            }
        }

        // --- PLAYER ---
        function createPlayer() {
            return {
                x: 50,
                y: H / 2,
                width: 40,
                height: 40,
                speed: 5,
                color: '#00f0ff',
                trail: [],
                visible: true,
                invincible: false,
                invincibleTimer: 0,
                pulsePhase: 0
            };
        }

        function drawPlayer() {
            if (!player.visible) return;

            // Trail
            for (let i = 0; i < player.trail.length; i++) {
                let t = player.trail[i];
                let alpha = (i / player.trail.length) * 0.3;
                ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
                ctx.fillRect(t.x - 15, t.y - 15, 30, 30);
            }

            let blinkVisible = true;
            if (player.invincible) {
                blinkVisible = Math.floor(Date.now() / 80) % 2 === 0;
            }

            if (blinkVisible) {
                ctx.save();
                ctx.translate(player.x, player.y);

                // Glow
                player.pulsePhase += 0.05;
                let glowSize = 25 + Math.sin(player.pulsePhase) * 5;
                let gradient = ctx.createRadialGradient(0, 0, 5, 0, 0, glowSize);
                gradient.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
                gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(-glowSize, -glowSize, glowSize * 2, glowSize * 2);

                // Ship body - arrow/chevron shape
                ctx.fillStyle = player.color;
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.moveTo(20, 0);
                ctx.lineTo(-15, -18);
                ctx.lineTo(-8, 0);
                ctx.lineTo(-15, 18);
                ctx.closePath();
                ctx.fill();

                // Inner highlight
                ctx.fillStyle = '#fff';
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.moveTo(12, 0);
                ctx.lineTo(-6, -8);
                ctx.lineTo(-2, 0);
                ctx.lineTo(-6, 8);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            }
        }

        function updatePlayer(dt) {
            let moving = false;
            if (keys['ArrowUp'] || keys['KeyW']) {
                player.y -= player.speed;
                moving = true;
            }
            if (keys['ArrowDown'] || keys['KeyS']) {
                player.y += player.speed;
                moving = true;
            }

            // Clamp
            player.y = Math.max(20, Math.min(H - 20, player.y));

            // Trail
            if (moving) {
                player.trail.push({ x: player.x, y: player.y });
                if (player.trail.length > 12) player.trail.shift();
            } else {
                if (player.trail.length > 0) player.trail.shift();
            }

            // Invincibility timer
            if (player.invincible) {
                player.invincibleTimer -= dt;
                if (player.invincibleTimer <= 0) {
                    player.invincible = false;
                }
            }
        }

        // --- OBSTACLES ---
        const OBSTACLE_TYPES = [
            { name: 'block', color: '#ff4757', width: 30, height: 30 },
            { name: 'tall', color: '#ff6348', width: 20, height: 60 },
            { name: 'wide', color: '#ff7f50', width: 60, height: 20 },
            { name: 'diamond', color: '#e84393', width: 35, height: 35 },
            { name: 'fast', color: '#fd79a8', width: 25, height: 25 },
        ];

        function getObstacleSpeed() {
            let base = 2.5 + level * 0.4;
            return base + Math.random() * (1 + level * 0.2);
        }

        function spawnObstacle() {
            let type = OBSTACLE_TYPES[Math.floor(Math.random() * Math.min(OBSTACLE_TYPES.length, 2 + level))];
            let speed = getObstacleSpeed();
            if (type.name === 'fast') speed *= 1.5;

            let obs = {
                x: W + 20,
                y: 30 + Math.random() * (H - 60),
                width: type.width,
                height: type.height,
                speed: speed,
                color: type.color,
                type: type.name,
                rotation: 0,
                scored: false
            };
            obstacles.push(obs);
        }

        function drawObstacle(obs) {
            ctx.save();
            ctx.translate(obs.x, obs.y);

            // Glow
            ctx.shadowColor = obs.color;
            ctx.shadowBlur = 10;

            if (obs.type === 'diamond') {
                obs.rotation += 0.03;
                ctx.rotate(obs.rotation);
                ctx.fillStyle = obs.color;
                ctx.beginPath();
                ctx.moveTo(0, -obs.height / 2);
                ctx.lineTo(obs.width / 2, 0);
                ctx.lineTo(0, obs.height / 2);
                ctx.lineTo(-obs.width / 2, 0);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillStyle = obs.color;
                let rr = 4;
                let x = -obs.width / 2, y = -obs.height / 2, w = obs.width, h = obs.height;
                ctx.beginPath();
                ctx.moveTo(x + rr, y);
                ctx.lineTo(x + w - rr, y);
                ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
                ctx.lineTo(x + w, y + h - rr);
                ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
                ctx.lineTo(x + rr, y + h);
                ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
                ctx.lineTo(x, y + rr);
                ctx.quadraticCurveTo(x, y, x + rr, y);
                ctx.closePath();
                ctx.fill();

                // Inner border
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                ctx.shadowBlur = 0;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            ctx.restore();
        }

        function updateObstacles(dt) {
            for (let i = obstacles.length - 1; i >= 0; i--) {
                let obs = obstacles[i];
                obs.x -= obs.speed;

                // Passed off screen left
                if (obs.x + obs.width / 2 < 0) {
                    if (!obs.scored) {
                        // Earn agile points
                        score += agileReward;
                        levelPoints += agileReward;

                        comboText.push({
                            x: 80,
                            y: obs.y,
                            text: `+${agileReward} AGILE`,
                            alpha: 1,
                            vy: -1.5,
                            color: '#00f0ff'
                        });

                        checkLevelUp();
                        updateHUD();
                    }
                    obstacles.splice(i, 1);
                    continue;
                }

                // Collision check (only if player visible and not invincible)
                if (player.visible && !player.invincible && !respawning) {
                    if (checkCollision(player, obs)) {
                        handleCollision();
                        break;
                    }
                }
            }
        }

        function checkCollision(p, obs) {
            // Player hitbox (slightly smaller for fairness)
            let px = p.x - 12, py = p.y - 14, pw = 28, ph = 28;
            let ox = obs.x - obs.width / 2, oy = obs.y - obs.height / 2, ow = obs.width, oh = obs.height;

            return px < ox + ow && px + pw > ox && py < oy + oh && py + ph > oy;
        }

        // --- PARTICLES ---
        function createExplosion(x, y, color, count) {
            for (let i = 0; i < count; i++) {
                let angle = Math.random() * Math.PI * 2;
                let speed = 1 + Math.random() * 5;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1,
                    decay: 0.01 + Math.random() * 0.03,
                    size: 2 + Math.random() * 4,
                    color: color
                });
            }
        }

        function updateParticles() {
            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;
                p.vx *= 0.98;
                p.vy *= 0.98;
                if (p.life <= 0) particles.splice(i, 1);
            }
        }

        function drawParticles() {
            for (let p of particles) {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            }
            ctx.globalAlpha = 1;
        }

        // --- COMBO TEXT ---
        function updateComboText() {
            for (let i = comboText.length - 1; i >= 0; i--) {
                let ct = comboText[i];
                ct.y += ct.vy;
                ct.alpha -= 0.015;
                if (ct.alpha <= 0) comboText.splice(i, 1);
            }
        }

        function drawComboText() {
            for (let ct of comboText) {
                ctx.globalAlpha = ct.alpha;
                ctx.fillStyle = ct.color;
                ctx.font = 'bold 16px "Segoe UI", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(ct.text, ct.x, ct.y);
            }
            ctx.globalAlpha = 1;
        }

        // --- COLLISION HANDLING ---
        function handleCollision() {
            // Explosion on player
            createExplosion(player.x, player.y, '#00f0ff', 30);

            // Explosion on each obstacle
            for (let obs of obstacles) {
                createExplosion(obs.x, obs.y, obs.color, 15);
            }

            // Screen shake
            shakeAmount = 10;

            // Clear everything
            player.visible = false;
            obstacles = [];

            // Decrease lives
            lives--;

            // If no points earned this level, decrease level
            if (levelPoints === 0 && level > 1) {
                level--;
                recalculateLevelValues();
                comboText.push({
                    x: W / 2,
                    y: H / 2 - 30,
                    text: `LEVEL DOWN! → ${level}`,
                    alpha: 1.5,
                    vy: -0.5,
                    color: '#ff4757'
                });
            }

            // Reset level points for the new life
            levelPoints = 0;

            updateHUD();

            if (lives <= 0) {
                // Game over
                gameRunning = false;
                cancelAnimationFrame(animFrameId);
                setTimeout(() => showGameOver(), 800);
                // Still run a mini loop for particles
                runParticleLoop();
                return;
            }

            // Respawn after a delay
            respawning = true;
            respawnTimer = 90; // frames
        }

        function handleRespawn() {
            if (!respawning) return;
            respawnTimer--;
            if (respawnTimer <= 0) {
                respawning = false;
                player.visible = true;
                player.y = H / 2;
                player.trail = [];
                player.invincible = true;
                player.invincibleTimer = 2000;
            }
        }

        // --- LEVEL SYSTEM ---
        function recalculateLevelValues() {
            // base agile = 50, each level adds 12
            agileReward = 50 + (level - 1) * 12;
            // base total = 500, each level adds 50
            totalRequired = 500 + (level - 1) * 50;
        }

        function checkLevelUp() {
            if (levelPoints >= totalRequired) {
                level++;
                levelPoints = levelPoints - totalRequired; // carry over excess
                recalculateLevelValues();

                comboText.push({
                    x: W / 2,
                    y: H / 2,
                    text: `⚡ LEVEL ${level}! ⚡`,
                    alpha: 2,
                    vy: -0.5,
                    color: '#2ed573'
                });

                // Speed up spawn
                spawnInterval = Math.max(30, spawnInterval - 5);
            }
        }

        // --- HUD ---
        function updateHUD() {
            livesEl.textContent = lives;
            scoreEl.textContent = score;
            levelEl.textContent = level;
            agileEl.textContent = agileReward;
            totalEl.textContent = totalRequired;
            levelProgressEl.textContent = `${levelPoints}/${totalRequired}`;
        }

        // --- DRAWING ---
        function drawBackground() {
            // Grid lines
            ctx.strokeStyle = 'rgba(255,255,255,0.03)';
            ctx.lineWidth = 1;
            for (let x = 0; x < W; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, H);
                ctx.stroke();
            }
            for (let y = 0; y < H; y += 40) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(W, y);
                ctx.stroke();
            }

            // Left safe zone indicator
            ctx.fillStyle = 'rgba(0, 240, 255, 0.02)';
            ctx.fillRect(0, 0, 90, H);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
            ctx.beginPath();
            ctx.moveTo(90, 0);
            ctx.lineTo(90, H);
            ctx.stroke();
        }

        function drawLevelProgress() {
            let progress = Math.min(levelPoints / totalRequired, 1);
            let barWidth = W - 20;
            let barHeight = 3;
            let barY = H - 8;

            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(10, barY, barWidth, barHeight);

            let gradient = ctx.createLinearGradient(10, 0, 10 + barWidth * progress, 0);
            gradient.addColorStop(0, '#2ed573');
            gradient.addColorStop(1, '#00f0ff');
            ctx.fillStyle = gradient;
            ctx.fillRect(10, barY, barWidth * progress, barHeight);
        }

        // --- GAME LOOP ---
        let lastTime = 0;

        function gameLoop(timestamp) {
            if (!gameRunning) return;

            let dt = timestamp - lastTime;
            lastTime = timestamp;
            if (dt > 100) dt = 16;

            // Shake
            let shakeX = 0, shakeY = 0;
            if (shakeAmount > 0) {
                shakeX = (Math.random() - 0.5) * shakeAmount;
                shakeY = (Math.random() - 0.5) * shakeAmount;
                shakeAmount *= 0.9;
                if (shakeAmount < 0.5) shakeAmount = 0;
            }

            ctx.save();
            ctx.translate(shakeX, shakeY);

            // Clear
            ctx.fillStyle = '#0d0d35';
            ctx.fillRect(0, 0, W, H);

            updateStarField();
            drawStarField();
            drawBackground();

            // Spawn obstacles
            if (!respawning) {
                spawnTimer++;
                if (spawnTimer >= spawnInterval) {
                    spawnTimer = 0;
                    spawnObstacle();

                    // Occasionally spawn 2 at once at higher levels
                    if (level >= 3 && Math.random() < 0.3) {
                        spawnObstacle();
                    }
                    if (level >= 6 && Math.random() < 0.2) {
                        spawnObstacle();
                    }
                }
            }

            updatePlayer(dt);
            updateObstacles(dt);
            handleRespawn();
            updateParticles();
            updateComboText();

            // Draw
            for (let obs of obstacles) {
                drawObstacle(obs);
            }
            drawPlayer();
            drawParticles();
            drawComboText();
            drawLevelProgress();

            ctx.restore();

            animFrameId = requestAnimationFrame(gameLoop);
        }

        function runParticleLoop() {
            function loop() {
                if (gameRunning) return;

                ctx.fillStyle = 'rgba(13, 13, 53, 0.1)';
                ctx.fillRect(0, 0, W, H);

                updateStarField();
                drawStarField();
                updateParticles();
                drawParticles();
                updateComboText();
                drawComboText();

                if (particles.length > 0 || comboText.length > 0) {
                    requestAnimationFrame(loop);
                }
            }
            requestAnimationFrame(loop);
        }

        // --- GAME STATES ---
        function initGame() {
            lives = 3;
            score = 0;
            level = 1;
            levelPoints = 0;
            recalculateLevelValues();
            obstacles = [];
            particles = [];
            comboText = [];
            player = createPlayer();
            spawnTimer = 0;
            spawnInterval = 70;
            respawning = false;
            shakeAmount = 0;
            createStarField();
            updateHUD();
        }

        function startGame() {
            initGame();
            overlay.classList.add('hidden');
            gameRunning = true;
            lastTime = performance.now();
            animFrameId = requestAnimationFrame(gameLoop);
        }

        function showGameOver() {
            overlay.classList.remove('hidden');
            msgTitle.textContent = 'Game Over';
            msgSub.textContent = `Final Score: ${score}`;
            msgDetail.textContent = `You reached Level ${level}`;
            actionBtn.textContent = 'Play Again';
            actionBtn.onclick = startGame;
        }

        function showStartScreen() {
            overlay.classList.remove('hidden');
            msgTitle.textContent = 'Agile Dodger';
            msgSub.textContent = 'Dodge the obstacles. Stay agile.';
            msgDetail.textContent = '↑↓ or WS to move';
            actionBtn.textContent = 'Start Game';
            actionBtn.onclick = startGame;

            // Draw initial background
            createStarField();
            ctx.fillStyle = '#0d0d35';
            ctx.fillRect(0, 0, W, H);
            drawStarField();
            drawBackground();

            initGame();
        }

        // --- INPUT ---
        document.addEventListener('keydown', (e) => {
            keys[e.code] = true;
            if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            keys[e.code] = false;
        });

        // --- INIT ---
        showStartScreen();
    
