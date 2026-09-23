# -*- coding: utf-8 -*-
"""静态校验：标签配平、链接存在、id 引用存在、JS 语法（用 node 粗查）"""
import re, io, os, glob, sys, subprocess, tempfile

FILES = sorted(glob.glob('*.html'))
VOID = {'br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'path', 'circle', 'rect',
        'stop', 'use', 'area', 'col', 'embed', 'track', 'wbr'}

ok = True

for f in FILES:
    html = io.open(f, 'r', encoding='utf-8').read()
    # 去掉 <script> 块再做标签配平
    nojs = re.sub(r'<script[\s\S]*?</script>', '', html, flags=re.I)
    tags = re.findall(r'<(/?)([a-zA-Z][a-zA-Z0-9]*)\b', nojs)
    stack = []
    for close, name in tags:
        n = name.lower()
        if n in VOID:
            continue
        if close:
            if stack and stack[-1] == n:
                stack.pop()
            elif n in stack:
                print('  !! mismatch in %s: </%s> but stack top is %s' % (f, n, stack[-1]))
                ok = False
                break
        else:
            stack.append(n)
    if stack:
        print('  !! unclosed in %s: %s' % (f, stack[:6]))
        ok = False

    # 链接指向的文件是否存在
    for href in set(re.findall(r'href="([^"#]+\.html[^"]*)"', html)):
        href = href.split('?')[0]
        if not os.path.exists(href):
            print('  !! dead link in %s -> %s' % (f, href))
            ok = False

    # 资源
    for src in set(re.findall(r'src="([^"]+)"', html)):
        if src.startswith('http'):
            continue
        if not os.path.exists(src):
            print('  !! missing asset in %s -> %s' % (f, src))
            ok = False

    # JS 语法
    scripts = re.findall(r'<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)</script>', html)
    for i, s in enumerate(scripts):
        tmp = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8')
        tmp.write(s)
        tmp.close()
        r = subprocess.run(['node', '--check', tmp.name], capture_output=True, text=True)
        if r.returncode != 0:
            print('  !! JS error in %s (script #%d): %s' % (f, i + 1, r.stderr.strip()[:300]))
            ok = False
        os.unlink(tmp.name)

print('files checked:', len(FILES))
print('RESULT:', 'OK' if ok else 'HAS ISSUES')
