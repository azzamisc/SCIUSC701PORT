// Interactive Particle Network System
(function() {
    'use strict';

    // Configuration
    const config = {
        particleCount: 120,
        particleColor: 'rgba(255, 255, 255, 0.9)',
        lineColor: 'rgba(26, 188, 156, 0.4)',
        particleSize: 3.5,
        maxDistance: 180,
        speed: 0.3,
        mouseRadius: 200,
        mouseForce: 0.05
    };

    class Particle {
        constructor(canvas) {
            this.canvas = canvas;
            this.reset();
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        }

        reset() {
            this.x = Math.random() * this.canvas.width;
            this.y = Math.random() * this.canvas.height;
            this.vx = (Math.random() - 0.5) * config.speed;
            this.vy = (Math.random() - 0.5) * config.speed;
            this.size = config.particleSize;
        }

        update(mouse) {
            // Mouse interaction
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.mouseRadius) {
                    const force = (config.mouseRadius - distance) / config.mouseRadius;
                    const angle = Math.atan2(dy, dx);
                    this.vx += Math.cos(angle) * force * config.mouseForce;
                    this.vy += Math.sin(angle) * force * config.mouseForce;
                }
            }

            // Update position
            this.x += this.vx;
            this.y += this.vy;

            // Damping
            this.vx *= 0.99;
            this.vy *= 0.99;

            // Keep particles moving
            if (Math.abs(this.vx) < 0.1) this.vx += (Math.random() - 0.5) * 0.1;
            if (Math.abs(this.vy) < 0.1) this.vy += (Math.random() - 0.5) * 0.1;

            // Boundary collision
            if (this.x < 0 || this.x > this.canvas.width) {
                this.vx *= -1;
                this.x = Math.max(0, Math.min(this.canvas.width, this.x));
            }
            if (this.y < 0 || this.y > this.canvas.height) {
                this.vy *= -1;
                this.y = Math.max(0, Math.min(this.canvas.height, this.y));
            }
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = config.particleColor;
            ctx.fill();
        }
    }

    class ParticleSystem {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.mouse = { x: null, y: null };

            this.init();
            this.bindEvents();
            this.animate();
        }

        init() {
            this.resize();

            // Create particles
            for (let i = 0; i < config.particleCount; i++) {
                this.particles.push(new Particle(this.canvas));
            }
        }

        resize() {
            const section = this.canvas.parentElement;
            const oldWidth = this.canvas.width;
            const oldHeight = this.canvas.height;
            const newWidth = section.offsetWidth;
            const newHeight = section.offsetHeight;

            // Update canvas dimensions
            this.canvas.width = newWidth;
            this.canvas.height = newHeight;

            // Redistribute particles proportionally to new dimensions
            if (oldWidth > 0 && oldHeight > 0) {
                this.particles.forEach(particle => {
                    particle.x = (particle.x / oldWidth) * newWidth;
                    particle.y = (particle.y / oldHeight) * newHeight;
                    particle.canvas = this.canvas;
                });
            }
        }

        bindEvents() {
            window.addEventListener('resize', () => this.resize());

            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            });

            this.canvas.addEventListener('mouseleave', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
        }

        drawLines() {
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const dx = this.particles[i].x - this.particles[j].x;
                    const dy = this.particles[i].y - this.particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.maxDistance) {
                        const opacity = (1 - distance / config.maxDistance) * 0.5;
                        this.ctx.beginPath();
                        this.ctx.strokeStyle = `rgba(26, 188, 156, ${opacity})`;
                        this.ctx.lineWidth = 2;
                        this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                        this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                        this.ctx.stroke();
                    }
                }
            }
        }

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw connection lines
            this.drawLines();

            // Update and draw particles
            this.particles.forEach(particle => {
                particle.update(this.mouse);
                particle.draw(this.ctx);
            });

            requestAnimationFrame(() => this.animate());
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new ParticleSystem('particles-canvas');
        });
    } else {
        new ParticleSystem('particles-canvas');
    }

})();
