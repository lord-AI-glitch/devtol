import sys, base64, os
target = sys.argv[1]
b64_data = sys.argv[2]
content = base64.b64decode(b64_data).decode('utf-8')
os.makedirs(os.path.dirname(os.path.abspath(target)), exist_ok=True)
with open(target, 'w', encoding='utf-8') as out:
    out.write(content)
print(f'WROTE {target} ({os.path.getsize(target)} bytes)')
