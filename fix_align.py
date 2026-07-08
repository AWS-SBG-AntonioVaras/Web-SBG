with open("style.css", "r", encoding="utf-8") as f:
    css = f.read()

# Buscamos la regla exacta y la cambiamos
css = css.replace("""  .leader-info p {
    text-align: center !important;
  }""", """  .leader-info p {
    text-align: left !important;
  }""")

with open("style.css", "w", encoding="utf-8") as f:
    f.write(css)
