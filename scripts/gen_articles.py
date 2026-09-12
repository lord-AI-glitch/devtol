# Generator script initialized

import os

os.makedirs('src/content/tools', exist_ok=True)

def save(fname, content):
    p = os.path.join('src', 'content', 'tools', fname)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content.strip() + chr(10))
    print(f'Successfully generated {fname} ({os.path.getsize(p)} bytes)')

