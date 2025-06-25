import requests

subscription_key = 'BcPFh29nkiAoR4PFfsqOy4me4NpB28hBKXDRUiBZlVZ5FvQodmxqJQQJ99BEAC5RqLJXJ3w3AAAYACOGMKt2'
region = 'westeurope'
endpoint = https://eastus.api.cognitive.microsoft.com/

headers = {
    'Ocp-Apim-Subscription-Key': subscription_key,
    'Content-Type': 'application/ssml+xml',
    'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
    'User-Agent': 'MelloApp'
}

ssml = """
<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='cs-CZ'>
  <voice name='cs-CZ-DagmarNeural'>
    Dobrý den. Já jsem Mello. Těší mě.
  </voice>
</speak>
"""

response = requests.post(endpoint, headers=headers, data=ssml.encode('utf-8'))

if response.status_code == 200:
    with open('mello_vitej.mp3', 'wb') as f:
        f.write(response.content)
    print("✅ Hotovo! Soubor uložen jako 'mello_vitej.mp3'")
else:
    with open('response_debug.txt', 'wb') as f:
        f.write(response.content)
    print(f"❌ Chyba: {response.status_code} – odpověď uložena do response_debug.txt")

