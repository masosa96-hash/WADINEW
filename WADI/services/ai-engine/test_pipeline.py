import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from dotenv import load_dotenv
load_dotenv()

from engines.pipeline import process_message
import json

print("=== TEST 1: mensaje vago ===")
r1 = process_message("hola, quiero hacer algo con cafe", "user-test-1")
print(json.dumps(r1, ensure_ascii=False, indent=2))

print("\n=== TEST 2: respuesta con mas contexto ===")
state = r1.get("state", {})
r2 = process_message("quiero vender cafe online, marca propia, para consumidores", "user-test-1", state)
print(json.dumps(r2, ensure_ascii=False, indent=2))
