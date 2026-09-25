import hashlib
from functools import lru_cache
from pathlib import Path
from urllib.parse import quote

from flask import Flask, Response, render_template, url_for

BASE_DIR = Path(__file__).resolve().parent
app = Flask(__name__)
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 60 * 60 * 24 * 30

SITE_URL = "https://ecotrituraparaguay.vercel.app"
WHATSAPP_NUMBER = "595981482510"
WHATSAPP_DISPLAY = "+595 981 482 510"

WA_MESSAGES = {
    "general": "Hola ECOTRITURA, quiero cotizar un trabajo de chipeado.",
    "hero": "Hola ECOTRITURA, quiero cotizar un trabajo de chipeado. Les paso fotos y la ubicación.",
    "antes_despues": "Hola ECOTRITURA, vi el antes y después en la web. Tengo ramas acumuladas y quiero cotizar.",
    "poda": "Hola ECOTRITURA, tengo residuos de poda y quiero consultar por el servicio.",
    "terreno": "Hola ECOTRITURA, necesito cotizar la limpieza de un terreno.",
    "obra": "Hola ECOTRITURA, tengo ramas y residuos verdes en una obra o loteamiento y quiero cotizar el chipeado.",
    "sectores": "Hola ECOTRITURA, quiero consultar si el servicio sirve para mi caso.",
    "fotos": "Hola ECOTRITURA, les quiero mandar fotos para una cotización.",
    "cierre": "Hola ECOTRITURA, quiero cotizar un trabajo de chipeado. Les paso fotos, ubicación y una idea del volumen.",
}

TRABAJOS = []
TESTIMONIOS = []
ZONAS = []

def wa_link(key="general"):
    text = WA_MESSAGES.get(key, WA_MESSAGES["general"])
    return f"https://wa.me/{WHATSAPP_NUMBER}?text={quote(text)}"

@lru_cache(maxsize=None)
def _file_hash(path):
    full = BASE_DIR / "static" / path
    try:
        return hashlib.md5(full.read_bytes()).hexdigest()[:10]
    except OSError:
        return "0"

def asset(path):
    return url_for("static", filename=path, v=_file_hash(path))

@app.context_processor
def inject_globals():
    return {
        "wa": wa_link, "asset": asset, "site_url": SITE_URL,
        "whatsapp_display": WHATSAPP_DISPLAY, "whatsapp_number": WHATSAPP_NUMBER,
        "trabajos": TRABAJOS, "testimonios": TESTIMONIOS, "zonas": ZONAS,
    }

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/health")
def health():
    return {"status": "ok", "service": "ecotritura"}

@app.route("/robots.txt")
def robots():
    body = f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n"
    return Response(body, mimetype="text/plain")

@app.route("/sitemap.xml")
def sitemap():
    body = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"  <url><loc>{SITE_URL}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>\n"
        "</urlset>\n"
    )
    return Response(body, mimetype="application/xml")

@app.route("/favicon.ico")
def favicon():
    return app.send_static_file("images/ecotritura-logo.png")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
