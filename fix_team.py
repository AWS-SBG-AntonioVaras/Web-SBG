import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Buscamos divs que contengan botones justo después de los párrafos en leader-info
# Vamos a reemplazar:
# <div> y <div style="..."> dentro de leader-info por <div class="leader-socials">
def replacer(match):
    div_start = match.group(1)
    # Check if we are inside leader-info context by ensuring it's a div containing the neo-btn
    if "neo-btn btn-dark" in match.group(2):
        return '<div class="leader-socials">' + match.group(2)
    return match.group(0)

# Simplificar: Busquemos todas las secciones <div class="leader-info"> y modifiquemos el div de los botones.
parts = html.split('<div class="leader-info">')
for i in range(1, len(parts)):
    # Buscar el div justo antes del </a> de los botones (despues del </p>)
    # Usando regex para reemplazar el div contenedor de los botones de la card:
    parts[i] = re.sub(r'<(div)[^>]*>(?=\s*<a[^>]*class="neo-btn btn-dark")', r'<div class="leader-socials">', parts[i])

new_html = '<div class="leader-info">'.join(parts)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(new_html)

