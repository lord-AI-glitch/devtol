import sys, base64, os
fname = sys.argv[1]
b64_data = sys.argv[2]
content = base64.b64decode(b64_data).decode('utf-8')
target = os.path.join('src', 'content', 'tools', fname)
with open(target, 'w', encoding='utf-8') as out:
    out.write(content.strip() + '\n')
print(f'CREATED {fname} ({os.path.getsize(target)} bytes)')
