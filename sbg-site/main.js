// Archivo JS principal (Vanilla JS)

console.log("AWS SBG Console Initialized");

document.addEventListener("DOMContentLoaded", () => {
    // Efecto Parallax para las capas geométricas (Shapes)
    const shapes = document.querySelectorAll('.bg-shape');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        
        shapes.forEach((shape) => {
            const speed = parseFloat(shape.getAttribute('data-speed')) || 0.2;
            // Movemos las formas a diferentes velocidades cuando hacemos scroll
            shape.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
});