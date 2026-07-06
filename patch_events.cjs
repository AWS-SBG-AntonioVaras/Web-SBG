const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<!-- Eventos de otros SBG -->[\s\S]*?(?=<\/div>\n      <\/div>\n    <\/div> <!-- Cierra el split-section -->)/;

const newHTML = `<!-- Eventos de otros SBG -->
      <div class="tech-card shadow-blue">
        <h2 class="pixel-font" style="color: var(--aws-blue); margin-bottom: 30px; text-align: center;">Otros Eventos SBG</h2>
        
        <div class="events-list">
          <a href="https://www.meetup.com/aws-sbg-at-fcefyn-universidad-nacional-de-cordoba/events/315466282/" target="_blank" class="activity-item" style="border-left: 3px solid var(--aws-orange);">
            <div style="display: flex; justify-content: space-between; width: 100%; align-items: flex-start; gap: 10px; flex-wrap: wrap;">
              <strong style="color:var(--text-light); font-size: 1.15rem; line-height: 1.3;">AWS SBG UNC: Agent Harness con Elizabeth Fuentes</strong>
              <span class="badge badge-ai" style="background-color: rgba(255, 95, 86, 0.1); color: #ff5f56; border: 1px solid rgba(255, 95, 86, 0.3);">IA Generativa</span>
            </div>
            <span style="color:var(--aws-orange); font-size: 0.9rem; display: block; margin-top: 8px; font-weight: bold;">Lunes 13 de julio, 18:00 hs (ARG) · Virtual</span>
            
            <p style="font-size: 0.9rem; color: #a1aab5; margin-top: 12px; margin-bottom: 12px; line-height: 1.5;">
              ¿Tu agente de IA inventa datos, elige la herramienta equivocada o quema tokens sin parar? El problema no es el prompt — es que le falta el <strong>harness</strong>.
            </p>
            
            <div style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 12px;">
              <strong style="color: var(--aws-blue); margin-bottom: 5px; display: inline-block;">🧠 ¿Qué vas a aprender?</strong>
              <ul style="margin: 0; padding-left: 15px; color: #a1aab5;">
                <li style="margin-bottom: 4px;">Qué es el harness y por qué tu agente lo necesita</li>
                <li style="margin-bottom: 4px;">Cómo aterrizar respuestas para que calcule en vez de adivinar</li>
                <li style="margin-bottom: 4px;">Cómo filtrar herramientas y reducir el costo de tokens</li>
                <li style="margin-bottom: 4px;">Cómo bloquear loops y hacer cumplir tus reglas</li>
              </ul>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.85rem; color: var(--aws-mint); background: rgba(39, 201, 63, 0.05); padding: 10px; border-radius: 6px;">
              <span>🎁 Repo con el código + créditos de AWS incluidos</span>
              <span>🐍 Requisito: saber Python básico</span>
              <span>💻 Virtual y gratuito</span>
            </div>
          </a>`;

html = html.replace(regex, newHTML);
fs.writeFileSync('index.html', html);
console.log('Events patched.');
