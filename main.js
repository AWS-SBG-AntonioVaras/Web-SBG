// Archivo JS principal (Vanilla JS)

console.log('AWS SBG Console Initialized');

document.addEventListener('DOMContentLoaded', () => {
  // --- Modal System ---
  const modalTriggers = document.querySelectorAll('[data-modal]');
  const modalCloseBtns = document.querySelectorAll('[data-close]');
  const modalOverlays = document.querySelectorAll('.modal-overlay');

  function openModal(id) {
    const modal = document.getElementById(`modal-${id}`);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      const content = modal.querySelector('.modal-content');
      if (content) content.scrollTop = 0;
    }
  }

  function closeModal(id) {
    const modal = document.getElementById(`modal-${id}`);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-modal');
      openModal(modalId);
    });
  });

  modalCloseBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      closeModal(modalId);
    });
  });

  modalOverlays.forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modalOverlays.forEach((overlay) => {
        overlay.classList.remove('active');
      });
      document.body.style.overflow = '';
    }
  });

  // Efecto Animación Infinita para las capas geométricas (Shapes)
  const shapes = document.querySelectorAll('.bg-shape');

  // Asignar posiciones y velocidades iniciales
  const shapeData = Array.from(shapes).map((shape) => {
    const rect = shape.getBoundingClientRect();
    const startX = rect.left + window.scrollX;
    const startY = rect.top + window.scrollY;

    // Desvincular de su anclaje CSS original para controlar con transform desde (0,0)
    shape.style.top = '0px';
    shape.style.left = '0px';
    shape.style.right = 'auto';
    shape.style.bottom = 'auto';

    // Algunos horizontales, otros verticales
    const isHorizontal = Math.random() > 0.5;
    const dir = Math.random() > 0.5 ? 1 : -1;
    const speed = Math.random() * 1.5 + 0.3;

    return {
      el: shape,
      x: startX,
      y: startY,
      vx: isHorizontal ? dir * speed : 0,
      vy: !isHorizontal ? dir * speed : 0,
      width: shape.offsetWidth,
      height: shape.offsetHeight,
    };
  });

  function animateShapes() {
    const docWidth = document.documentElement.scrollWidth;
    const docHeight = document.documentElement.scrollHeight;

    shapeData.forEach((data) => {
      data.x += data.vx;
      data.y += data.vy;

      // Envolver horizontalmente
      if (data.vx > 0 && data.x > docWidth) {
        data.x = -data.width;
      } else if (data.vx < 0 && data.x + data.width < 0) {
        data.x = docWidth;
      }

      // Envolver verticalmente
      if (data.vy > 0 && data.y > docHeight) {
        data.y = -data.height;
      } else if (data.vy < 0 && data.y + data.height < 0) {
        data.y = docHeight;
      }

      data.el.style.transform = `translate3d(${data.x}px, ${data.y}px, 0)`;
    });

    requestAnimationFrame(animateShapes);
  }

  // Iniciar el bucle de animación
  requestAnimationFrame(animateShapes);

  // --- Efecto Terminal Typing ---

  // --- Window Control Buttons ---
  const btnClose = document.getElementById('btn-close-terminal');
  const errorScreen = document.getElementById('terminal-error-screen');
  const reopenBtn = document.getElementById('reopen-terminal-btn');

  if (btnClose && errorScreen) {
    btnClose.addEventListener('click', () => {
      const win = document.querySelector('.terminal-window');
      if (win) win.style.setProperty('display', 'none', 'important');
      if (errorScreen) errorScreen.style.display = 'flex';
    });

    reopenBtn.addEventListener('click', () => {
      const win = document.querySelector('.terminal-window');
      if (errorScreen) errorScreen.style.display = 'none';
      if (win) {
        win.style.setProperty('display', 'flex', 'important');
      }
      if (typeof window.resetTerminal === 'function') {
        window.resetTerminal();
      }
    });
  }
  // --------------------------------

  const terminalSection = document.querySelector('#join');
  const lines = document.querySelectorAll('.typing-line');
  let terminalStarted = false;

  function getPromptHTML() {
    if (window.innerWidth <= 768 || 'ontouchstart' in window) {
      return `<span style="color: var(--aws-mint);">❯</span>`;
    }
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-CL', { hour12: false });
    return `<span style="color: var(--aws-orange);">(${timeString})</span> <span style="color: var(--aws-mint);">git:(Web-SBG:Main)</span><span style="color: white;">:</span>`;
  }

  function formatCommand(cmd) {
    const parts = cmd.split(' ');
    if (parts.length === 0) return '';
    const base = `<span style="color: white;">${parts[0]}</span>`;
    const args = parts
      .slice(1)
      .map((arg) => {
        if (arg.startsWith('-')) {
          return `<span style="color: #6c757d;">${arg}</span>`; // Gris oscuro
        }
        return `<span style="color: #a1aab5;">${arg}</span>`; // Gris claro
      })
      .join(' ');
    return args ? `${base} ${args}` : base;
  }

  let currentSessionId = 0;

  window.resetTerminal = function () {
    currentSessionId++;
    const terminalHistory = document.getElementById('terminal-history');
    const terminalInput = document.getElementById('terminal-input');
    const interactiveSection = document.getElementById('terminal-interactive');

    if (terminalHistory) terminalHistory.innerHTML = '';
    if (terminalInput) terminalInput.value = '';
    if (interactiveSection) interactiveSection.style.display = 'none';

    document.querySelectorAll('.typing-line').forEach((el) => {
      el.style.display = 'flex';
      if (!el.hasAttribute('data-is-cmd')) el.style.display = 'block';
      el.innerHTML = '';
      el.classList.remove('typing-cursor');
    });

    setTimeout(() => {
      typeLines();
    }, 300);
  };

  // Función para escribir línea por línea
  async function typeLines() {
    const sessionId = ++currentSessionId;
    for (let i = 0; i < lines.length; i++) {
      if (currentSessionId !== sessionId) return; // Abortar si inició otra sesión

      const line = lines[i];
      let textToType = line.getAttribute('data-text');
      const isCmd = line.getAttribute('data-is-cmd') === 'true';

      line.innerHTML = ''; // Limpiamos texto inicial
      line.classList.add('typing-cursor'); // Añadimos cursor parpadeante

      if (isCmd) {
        // El prompt de sistema aparece al instante, igual que en una terminal real
        const promptSpan = document.createElement('div');
        promptSpan.innerHTML = getPromptHTML();

        const cmdSpan = document.createElement('span');

        line.appendChild(promptSpan);
        line.appendChild(cmdSpan);

        let currentStr = '';
        for (let char of textToType) {
          if (currentSessionId !== sessionId) return; // Abortar
          currentStr += char;
          cmdSpan.innerHTML = formatCommand(currentStr);
          await new Promise((r) => setTimeout(r, 40)); // Escribiendo el comando toma más tiempo (realismo humano)
        }
      } else {
        // Reemplazar marcador de hora dinámica (si todavía existiera en algún texto)
        if (textToType.includes('[HORA_ACTUAL]')) {
          const now = new Date();
          const timeString = now.toLocaleTimeString('es-CL', { hour12: false });
          textToType = textToType.replace('[HORA_ACTUAL]', timeString);
        }

        // Escribimos caracter por caracter (respuesta rápida de la terminal)
        for (let char of textToType) {
          if (currentSessionId !== sessionId) return; // Abortar
          line.innerHTML += char;
          await new Promise((r) => setTimeout(r, 5)); // Velocidad de escritura de consola
        }
      }

      // Si no es la última línea, quitamos el cursor para pasarlo a la siguiente
      line.classList.remove('typing-cursor');

      const terminalContent = document.querySelector('.terminal-content');
      if (terminalContent) {
        requestAnimationFrame(() => {
          terminalContent.scrollTop = terminalContent.scrollHeight;
        });
      }

      await new Promise((r) => setTimeout(r, 50)); // Pausa entre líneas
    }

    if (currentSessionId !== sessionId) return; // Abortar antes de habilitar input

    // Al finalizar la animación de tipeo, mostrar el input interactivo
    const interactiveSection = document.getElementById('terminal-interactive');
    const interactivePrompt = document.getElementById('interactive-prompt');
    const terminalInput = document.getElementById('terminal-input');
    const terminalHistory = document.getElementById('terminal-history');

    if (interactiveSection && interactivePrompt && terminalInput) {
      interactivePrompt.innerHTML = getPromptHTML();
      interactiveSection.style.display = 'flex';

      if (window.innerWidth <= 768 || 'ontouchstart' in window) {
        terminalInput.readOnly = true;
        terminalInput.placeholder = 'Sólo lectura en móvil';
        terminalInput.blur();
      } else {
        terminalInput.focus();
      }

      if (terminalInput.hasAttribute('data-listeners-attached')) return; // No attach duplicate events
      terminalInput.setAttribute('data-listeners-attached', 'true');

      // --- Kitty Cursor Trail Logic ---
      const customCursor = document.getElementById('custom-cursor');
      const cursorContainer = customCursor.parentElement;
      let lastCursorX = 8; // start margin

      // Función para medir el ancho del texto exacto antes del cursor
      function getCursorOffset() {
        const span = document.createElement('span');
        span.style.fontFamily = "'Space Mono', monospace";
        span.style.fontSize = '0.9rem';
        span.style.visibility = 'hidden';
        span.style.whiteSpace = 'pre';
        span.textContent = terminalInput.value.substring(0, terminalInput.selectionStart);
        document.body.appendChild(span);
        const width = span.getBoundingClientRect().width;
        document.body.removeChild(span);
        return width;
      }

      function updateKittyCursor() {
        if (!customCursor || !terminalInput) return;
        const width = getCursorOffset();
        const newX = 8 + width; // 8px es el margin-left del input

        // Si se movió lo suficiente (threshold), generamos la estela
        if (Math.abs(newX - lastCursorX) > 0.5) {
          customCursor.classList.remove('blink');

          // Crear bloque de estela
          const trail = document.createElement('div');
          trail.className = 'kitty-trail-block';
          trail.style.left = lastCursorX + 'px';
          cursorContainer.appendChild(trail);

          // Destruir bloque después de la animación
          setTimeout(() => trail.remove(), 400);

          // Restablecer parpadeo después de moverse
          clearTimeout(customCursor.blinkTimeout);
          customCursor.blinkTimeout = setTimeout(() => {
            customCursor.classList.add('blink');
          }, 300);
        }

        customCursor.style.left = newX + 'px';
        lastCursorX = newX;
      }

      terminalInput.addEventListener('input', updateKittyCursor);
      terminalInput.addEventListener('keydown', () => setTimeout(updateKittyCursor, 10));
      terminalInput.addEventListener('keyup', () => setTimeout(updateKittyCursor, 10));
      terminalInput.addEventListener('click', updateKittyCursor);
      // --------------------------------

      // Actualizar la hora cada segundo en el prompt si no hay input? Mejor lo dejamos estático hasta que ejecute

      // Mantener el foco si hacen clic en la terminal
      const terminalBody = document.querySelector('.terminal-body');
      if (terminalBody) {
        terminalBody.addEventListener('click', () => {
          if (window.getSelection().toString() === '') {
            if (!(window.innerWidth <= 768 || 'ontouchstart' in window)) {
              terminalInput.focus();
            }
          }
        });
      }

      const commands = {
        help: () => `Comandos disponibles:
<span style="color: var(--aws-mint);">help</span>       - Muestra esta lista de comandos
<span style="color: var(--aws-mint);">ls</span>         - Lista los archivos del repositorio
<span style="color: var(--aws-mint);">whoami</span>     - Muestra el usuario actual
<span style="color: var(--aws-mint);">clear</span>      - Limpia la terminal
<span style="color: var(--aws-mint);">exit</span>       - Reinicia la terminal
<span style="color: var(--aws-mint);">info</span>       - Muestra información básica de SBG`,
        ls: () => `<span style="color: var(--aws-blue);">assets/</span>
<span style="color: var(--aws-blue);">src/</span>
<span style="color: white;">index.html</span>
<span style="color: white;">main.js</span>
<span style="color: white;">style.css</span>
<span style="color: white;">package.json</span>
<span style="color: white;">README.md</span>
<span style="color: white;">.gitignore</span>`,
        whoami: () => `d4mag3`,
        info: (args) => {
          if (args.includes('--ALL') || args.includes('--all')) {
            return `<span style="color: var(--aws-orange);">--- SBG COMPLETO ---</span>
<b>Nombre:</b> AWS Student Builder Groups
<b>Propósito:</b> Programa guiado por estudiantes para eventos, proyectos y certificaciones en la nube de AWS.
<b>Región:</b> Primer SBG en el Cono Sur.
<b>Impacto:</b>
 • +660 Miembros en Meetup
 • +900 Seguidores en LinkedIn
 • 4 Proyectos en desarrollo
 • Multiples certificaciones logradas
<br>
<span style="color: var(--aws-blue);"><b>Beneficios de nuestro SBG:</b></span>
 • Merch Oficial
 • Conexion con expertos de AWS
 • Oportunidades de Certificaciones
 • Muchos stickers!
<br>
<span style="color: var(--aws-mint);">¡Únete a la revolución en la nube!</span>`;
          }
          return `AWS Student Builder Groups es un programa estudiantil enfocado en Cloud (AWS). Usa 'info --ALL' para más datos.`;
        },
        sudo: () => `<span style="color: red;">Este incidente sera reportado. 🦖</span>`,
        rm: () => `<span style="color: red;">rm: command not found (por suerte para ti)</span>`,
      };

      let commandHistory = [];
      let historyIndex = -1;

      terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const commandStr = terminalInput.value.trim();

          if (commandStr) {
            commandHistory.push(commandStr);
            historyIndex = commandHistory.length;
          }

          const newEntry = document.createElement('div');
          newEntry.style.marginBottom = '8px'; // Espaciado entre la salida anterior y el nuevo prompt

          if (!commandStr) {
            newEntry.innerHTML = `<div style="display: flex; align-items: center; gap: 8px;">${interactivePrompt.innerHTML}</div>`;
            terminalHistory.appendChild(newEntry);
          } else {
            const cmdParts = commandStr.split(' ');
            const baseCmd = cmdParts[0].toLowerCase();
            const args = cmdParts.slice(1);

            if (baseCmd === 'clear') {
              terminalHistory.innerHTML = '';
              document
                .querySelectorAll('.typing-line')
                .forEach((el) => (el.style.display = 'none'));
              newEntry.innerHTML = ''; // prevent appending anything
            } else if (baseCmd === 'exit') {
              if (typeof window.resetTerminal === 'function') {
                window.resetTerminal();
              }
              return;
            } else {
              let output;
              if (commands[baseCmd]) {
                output = commands[baseCmd](args);
              } else {
                output = `<span style="color: red;">comando no encontrado: ${baseCmd}</span>`;
              }

              newEntry.innerHTML = `
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    ${interactivePrompt.innerHTML} <span>${formatCommand(commandStr)}</span>
                                </div>
                                <div style="color: #a1aab5; margin-top: 2px; line-height: 1.4; white-space: pre-line; font-size: 0.9rem; font-family: 'Space Mono', monospace;">${output}</div>
                            `;
              terminalHistory.appendChild(newEntry);
            }
          }

          terminalInput.value = '';
          interactivePrompt.innerHTML = getPromptHTML();
          terminalInput.dispatchEvent(new Event('input'));

          const terminalContent = document.querySelector('.terminal-content');
          if (terminalContent) {
            requestAnimationFrame(() => {
              terminalContent.scrollTop = terminalContent.scrollHeight;
            });
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (historyIndex > 0) {
            historyIndex--;
            terminalInput.value = commandHistory[historyIndex];
            terminalInput.dispatchEvent(new Event('input'));
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            terminalInput.value = commandHistory[historyIndex];
            terminalInput.dispatchEvent(new Event('input'));
          } else {
            historyIndex = commandHistory.length;
            terminalInput.value = '';
            terminalInput.dispatchEvent(new Event('input'));
          }
        } else if (e.key === 'Tab') {
          e.preventDefault();
          const currentVal = terminalInput.value.trim();
          if (!currentVal) return;

          const availableCommands = Object.keys(commands).concat(['clear', 'exit']);
          const matches = availableCommands.filter((cmd) =>
            cmd.startsWith(currentVal.toLowerCase())
          );

          if (matches.length === 1) {
            terminalInput.value = matches[0] + ' ';
            terminalInput.dispatchEvent(new Event('input'));
          }
        }
      });
    }
  }

  // Usar Intersection Observer para detonar cuando sea visible
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !terminalStarted) {
          terminalStarted = true;
          typeLines();
        }
      });
    },
    { threshold: 0.5 }
  ); // Se detona cuando el 50% de la terminal es visible

  if (terminalSection) {
    observer.observe(terminalSection);
  }

  // --- Carrusel de Equipo ---
  const carousel = document.getElementById('leadersCarousel');
  const prevBtn = document.getElementById('prevLeaderBtn');
  const nextBtn = document.getElementById('nextLeaderBtn');

  if (carousel && prevBtn && nextBtn) {
    const moveToNext = () => {
      const scrollAmount = carousel.clientWidth;
      // Si estamos al final, volvemos al principio
      if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10) {
        carousel.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };

    const moveToPrev = () => {
      const scrollAmount = carousel.clientWidth;
      if (carousel.scrollLeft <= 10) {
        carousel.scrollTo({ left: carousel.scrollWidth, behavior: 'smooth' });
      } else {
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    };

    nextBtn.addEventListener('click', () => {
      moveToNext();
      resetAutoPlay();
    });

    prevBtn.addEventListener('click', () => {
      moveToPrev();
      resetAutoPlay();
    });

    // Autoplay
    let autoPlayInterval = setInterval(moveToNext, 4000);
    let isHovered = false;

    const resetAutoPlay = () => {
      clearInterval(autoPlayInterval);
      if (!isHovered) {
        autoPlayInterval = setInterval(moveToNext, 4000);
      }
    };

    // Pausar autoplay al hacer hover
    carousel.parentElement.addEventListener('mouseenter', () => {
      isHovered = true;
      clearInterval(autoPlayInterval);
    });

    carousel.parentElement.addEventListener('mouseleave', () => {
      isHovered = false;
      resetAutoPlay();
    });

    // Touch events para móviles
    carousel.parentElement.addEventListener(
      'touchstart',
      () => {
        isHovered = true;
        clearInterval(autoPlayInterval);
      },
      { passive: true }
    );

    carousel.parentElement.addEventListener(
      'touchend',
      () => {
        isHovered = false;
        resetAutoPlay();
      },
      { passive: true }
    );
  }
});
