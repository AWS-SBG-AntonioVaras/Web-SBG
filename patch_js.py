import re

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

drag_logic = """
    // Pausar autoplay al hacer hover
    carousel.parentElement.addEventListener('mouseenter', () => {
      isHovered = true;
      clearInterval(autoPlayInterval);
    });

    carousel.parentElement.addEventListener('mouseleave', () => {
      isHovered = false;
      resetAutoPlay();
    });

    // --- Arrastrar con Mouse (Mouse Drag) y Soporte Táctil ---
    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener('mousedown', (e) => {
      isDown = true;
      carousel.style.cursor = 'grabbing';
      carousel.style.scrollSnapType = 'none'; // Quitar snap al arrastrar para suavidad
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      clearInterval(autoPlayInterval);
    });

    carousel.addEventListener('mouseleave', () => {
      isDown = false;
      carousel.style.cursor = 'grab';
      carousel.style.scrollSnapType = 'x mandatory';
    });

    carousel.addEventListener('mouseup', () => {
      isDown = false;
      carousel.style.cursor = 'grab';
      carousel.style.scrollSnapType = 'x mandatory';
      resetAutoPlay();
    });

    carousel.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 2; // Multiplicador de velocidad
      carousel.scrollLeft = scrollLeft - walk;
    });

    // Touch events
    carousel.addEventListener('touchstart', () => {
      clearInterval(autoPlayInterval);
    }, {passive: true});

    carousel.addEventListener('touchend', () => {
      resetAutoPlay();
    }, {passive: true});
"""

# Replace the hover logic with our expanded touch/drag logic
js = re.sub(
    r"// Pausar autoplay al hacer hover[\s\S]*?clearInterval\(autoPlayInterval\);\s*}\);",
    drag_logic.strip(),
    js
)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)
