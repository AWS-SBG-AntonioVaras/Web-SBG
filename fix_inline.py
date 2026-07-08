import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Remove the inline style from carousel-wrapper
html = re.sub(
    r'class="carousel-wrapper"\s*style="[^"]+"',
    r'class="carousel-wrapper"',
    html
)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

