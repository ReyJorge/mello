from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
import requests
from dotenv import load_dotenv

# ✅ Načti proměnné z .env souboru
load_dotenv(dotenv_path="../mello-frontend/server/.env")

# 🔑 API klíče
openai.api_key = os.getenv("OPENAI_API_KEY")
GOOGLE_API_KEY = os.getenv("VITE_GOOGLE_SEARCH_API_KEY")
GOOGLE_CX = os.getenv("VITE_GOOGLE_SEARCH_CX")

# 🔧 Inicializuj Flask
app = Flask(__name__)
CORS(app)

# 🧠 Endpoint: konverzace s pamětí
@app.route("/api/chat", methods=["GET"])
def chat():
    data = request.get_json()
    message = data.get("message", "")
    memory_context = data.get("memory_context", "")

    print(f"📎 memory_context přijatý ze frontendu:\n{memory_context}")

    messages = []

    if memory_context.strip():
        messages.append({
            "role": "system",
            "content": f"""
Jsi osobní asistent, který si pamatuje uživatelovy vzpomínky.
Níže jsou důležité informace, které uživatel sdělil v minulosti. 
Při odpovídání vždy tyto vzpomínky zohledni, i když se uživatel přímo nezeptá.

{memory_context.strip()}
"""
        })

    messages.append({
        "role": "user",
        "content": message
    })

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages,
            temperature=0.7
        )
        reply = response.choices[0].message.content.strip()
        return jsonify({"reply": reply})
    except Exception as e:
        print(f"❌ Chyba při volání OpenAI API: {str(e)}")
        return jsonify({"error": "Failed to get response from OpenAI."}), 500

# 🏷️ Endpoint: klasifikace, zda uložit vzpomínku
@app.route("/api/classify-memory", methods=["POST"])
def classify_memory():
    data = request.get_json()
    message = data.get("message", "").lower()

    keywords = [
        "narodila se", "vnuk", "vnučka", "dcera", "syn",
        "umřel", "oslava", "jmeniny", "svatba",
        "pamatuju", "vzpomínám", "když mi bylo", "kdysi",
        "jmenoval se", "jela jsem", "jednou jsem", "dřív jsem"
    ]

    worthy = any(word in message for word in keywords)

    return jsonify({"worthy": worthy})

# 🌐 Endpoint: vyhledávání na internetu (GET i POST)
@app.route("/api/search", methods=["GET", "POST"])
def search():
    if request.method == "POST":
        data = request.get_json()
        query = data.get("q", "")
    else:
        query = request.args.get("q", "")

    if not query:
        return jsonify({"error": "Chybí dotaz"}), 400

    if not GOOGLE_API_KEY or not GOOGLE_CX:
        return jsonify({"error": "Chybí Google API klíč nebo CSE ID"}), 500

    try:
        response = requests.get(
            "https://www.googleapis.com/customsearch/v1",
            params={
                "key": GOOGLE_API_KEY,
                "cx": GOOGLE_CX,
                "q": query,
            },
        )
        response.raise_for_status()
        data = response.json()

        results = [
            {
                "title": item.get("title"),
                "link": item.get("link"),
                "snippet": item.get("snippet"),
            }
            for item in data.get("items", [])
        ]

        return jsonify({"results": results})

    except requests.RequestException as e:
        print(f"❌ Chyba při volání Google API: {e}")
        return jsonify({"error": "Vyhledávání selhalo"}), 500

# ✅ Spusť server
if __name__ == "__main__":
    app.run(port=int(os.getenv("PORT", 5000)))
