// Archivo JS principal (Vanilla JS)

console.log("AWS SBG Console Initialized");

document.addEventListener("DOMContentLoaded", () => {
    // Efecto Parallax para las capas geométricas (Shapes)
    const shapes = document.querySelectorAll('.bg-shape');
    let isTicking = false;
    
    window.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                shapes.forEach((shape) => {
                    const speed = parseFloat(shape.getAttribute('data-speed')) || 0.2;
                    const yPos = Math.round(scrolled * speed);
                    shape.style.transform = `translate3d(0, ${yPos}px, 0)`;
                });
                isTicking = false;
            });
            isTicking = true;
        }
    }, { passive: true });

    // --- Efecto Terminal Typing ---
    const terminalSection = document.querySelector('#join');
    const lines = document.querySelectorAll('.typing-line');
    let terminalStarted = false;

    // Función para escribir línea por línea
    async function typeLines() {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const textToType = line.getAttribute('data-text');
            line.innerHTML = ''; // Limpiamos texto inicial
            line.classList.add('typing-cursor'); // Añadimos cursor parpadeante
            
            // Escribimos caracter por caracter
            for (let char of textToType) {
                line.innerHTML += char;
                await new Promise(r => setTimeout(r, 20)); // Velocidad de escritura
            }
            
            // Si no es la última línea, quitamos el cursor para pasarlo a la siguiente
            if (i < lines.length - 1) {
                line.classList.remove('typing-cursor');
            }
            await new Promise(r => setTimeout(r, 200)); // Pausa entre líneas
        }
    }

    // Usar Intersection Observer para detonar cuando sea visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !terminalStarted) {
                terminalStarted = true;
                typeLines();
            }
        });
    }, { threshold: 0.5 }); // Se detona cuando el 50% de la terminal es visible

    if (terminalSection) {
        observer.observe(terminalSection);
    }
});