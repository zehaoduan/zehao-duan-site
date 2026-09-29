#!/usr/bin/env python3
"""Runtime checks against a running preview (npm run preview).

usage: BASE=http://localhost:8787 python3 scripts/checks/runtime.py

Status codes, html lang, redirects, the not-found page, the key files (byte for
byte against the old static site and against src/content/keys), HEAD requests,
the blog feeds, sitemap, robots, security headers, a fresh nonce per request, cache headers of
the static files. Exit code 1 if a check fails. Reads only; temporary files go
to a temporary folder.
"""
import subprocess,re,sys,os,tempfile
B=os.environ.get('BASE','http://localhost:8787')
APP=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# the old static site (~/Documents/Website/personal-website, or OLD_SITE), as long as it exists; otherwise the app's own files
OLD=os.environ.get('OLD_SITE',os.path.expanduser('~/Documents/Website/personal-website'))
HAS_OLD=os.path.isdir(OLD)
os.chdir(tempfile.mkdtemp())
res=[]
def curl(path,*a):
    if '-I' in a:
        r=subprocess.run(['curl','-sS','--head',B+path],capture_output=True); open('body.tmp','wb').write(b'')
        sz=subprocess.run(['curl','-sS','-X','HEAD','-m','5','-o','body.tmp',B+path],capture_output=True)
    else:
        r=subprocess.run(['curl','-sS','-D','-','-o','body.tmp',*a,B+path],capture_output=True)
    h=r.stdout.decode('utf-8','replace'); body=open('body.tmp','rb').read()
    status=int(h.split()[1]); hd={}
    for l in h.splitlines()[1:]:
        if ':' in l:
            k,v=l.split(':',1); hd.setdefault(k.strip().lower(),v.strip())
    return status,hd,body
def ok(name,cond,obs):
    res.append((name,cond,obs)); print(('PASS' if cond else 'FAIL'),name,'|',obs)
pages={'/':'en','/zh-hant/':'zh-Hant','/zh-hans/':'zh-Hans','/public-key/':'en','/zh-hant/public-key/':'zh-Hant','/zh-hans/public-key/':'zh-Hans','/blog/':'en','/zh-hant/blog/':'zh-Hant','/zh-hans/blog/':'zh-Hans'}
for p,l in pages.items():
    s,h,b=curl(p); m=re.search(rb'<html[^>]*\blang="([^"]+)"',b)
    ok('page '+p,s==200 and m and m.group(1).decode()==l and h.get('content-type','').startswith('text/html'),f'{s} lang={m and m.group(1).decode()} ct={h.get("content-type")} cache={h.get("cache-control")}')
    s2,h2,b2=curl(p,'-I')
    ok('HEAD '+p,s2==200 and len(b2)==0,f'{s2} body={len(b2)}')
for p in ['/zh-hant','/zh-hans','/public-key','/zh-hant/public-key','/zh-hans/public-key','/blog','/zh-hans/blog']:
    s,h,b=curl(p); ok('308 '+p,s==308 and h.get('location','').endswith(p+'/'),f'{s} -> {h.get("location")}')
for p in ['/en/','/en/public-key/','/en/blog/','/blog/nope/','/zh-hans/blog/constructor/','/nope/','/fr/','/zh-hans/nope/','/public-key/nope.txt','/en']:
    s,h,b=curl(p)
    if s==308:
        loc=h['location']; obs0=f'308 -> {loc}; '; s,h,b=curl(re.sub(r'^https?://[^/]+','',loc))
    else: obs0=''
    t=re.search(rb'<title>(.*?)</title>',b); m=re.search(rb'<html[^>]*\blang="([^"]+)"',b)
    ok('404 '+p,s==404 and t and b'404' in t.group(1) and b'noindex' in b,obs0+f'{s} title={t and t.group(1).decode()} lang={m and m.group(1).decode()}')
for f in ['pgp.asc','ssh.pub']:
    s,h,b=curl('/public-key/'+f); ref=f'{OLD}/public-key/{f}' if HAS_OLD else f'{APP}/src/content/keys/{f}'; same=b==open(ref,'rb').read()
    open('dl-'+f,'wb').write(b); c=subprocess.run(['cmp','dl-'+f,ref]).returncode
    ok('key '+f,s==200 and same and c==0 and h.get('content-type','').startswith('text/plain'),f'{s} ct={h.get("content-type")} bytes={len(b)} cmp={c} cache={h.get("cache-control")} nosniff={h.get("x-content-type-options")}')
    s,h,b=curl('/public-key/'+f,'-I'); ok('HEAD key '+f,s==200 and len(b)==0,f'{s} body={len(b)} ct={h.get("content-type")}')
# the blog feeds, one per language
for p,l in {'/blog/feed.xml':'en','/zh-hant/blog/feed.xml':'zh-Hant','/zh-hans/blog/feed.xml':'zh-Hans'}.items():
    s,h,b=curl(p); ok('feed '+p,s==200 and h.get('content-type','').startswith('application/rss+xml') and b.startswith(b'<?xml') and f'<language>{l}</language>'.encode() in b,f'{s} ct={h.get("content-type")} items={b.count(b"<item>")} cache={h.get("cache-control")}')
# nine pages with the date of the site; every published blog post adds three entries with its own date
s,h,b=curl('/sitemap.xml'); ok('sitemap',s==200 and b.count(b'<url>')>=9 and b.count(b'<url>')%3==0 and b.count(b'<lastmod>2026-09-28')>=9,f'{s} ct={h.get("content-type")} urls={b.count(b"<url>")} lastmod2026-09-28={b.count(b"<lastmod>2026-09-28")}')
s,h,b=curl('/robots.txt'); old=open(OLD+'/robots.txt','rb').read() if HAS_OLD else b'Sitemap: https://zehao-duan.com/sitemap.xml\n'; ok('robots',s==200 and b.strip()==old.strip(),f'{s} ct={h.get("content-type")} {b!r} identical={b==old}')
# headers and nonce
need=['content-security-policy','x-content-type-options','referrer-policy','x-frame-options','permissions-policy','strict-transport-security','cross-origin-opener-policy']
nonces=[]
for p in ['/','/','/zh-hans/public-key/','/nope/']:
    s,h,b=curl(p); csp=h.get('content-security-policy','')
    n=re.search(r"'nonce-([^']+)'",csp); nonces.append(n.group(1) if n else None)
    inbody=len(re.findall(rb'nonce="'+re.escape(n.group(1).encode())+rb'"',b)) if n else 0
    allscripts=len(re.findall(rb'<script\b',b)); nn=len(re.findall(rb'<script\b(?![^>]*\bnonce=)(?![^>]*application/ld\+json)',b))
    styles=len(re.findall(rb'\sstyle="',b))
    ok('headers '+p,n is not None and "unsafe-inline" not in csp.split('style-src')[1].split(';')[0] and 'style-src-attr' not in csp and nn==0 and styles==0,f'nonce={n and n.group(1)[:10]}.. nonce-in-body={inbody} scripts={allscripts} un-nonced={nn} style-attrs={styles} present={[k for k in need if k in h]} missing={[k for k in need if k not in h]}')
    if p=='/zh-hans/public-key/': print('CSP:',csp); print({k:h[k] for k in need if k in h})
ok('nonce differs per request',len(set(nonces))==len(nonces),str([x[:8] for x in nonces]))
# static assets
s,h,b=curl('/'); assets=set(re.findall(rb'(/_next/static/[^"\'\\ )]+)',b))
for a in sorted(assets)[:3]+[x for x in sorted(assets) if x.endswith(b'.css')][:1]+[x for x in sorted(assets) if x.endswith(b'.woff2')][:1]:
    a=a.decode(); s,h,b=curl(a); ok('asset '+a[-40:],s==200 and 'immutable' in h.get('cache-control',''),f'{s} cache={h.get("cache-control")} ct={h.get("content-type")} nosniff={h.get("x-content-type-options")}')
for a in ['/favicon.svg']:
    s,h,b=curl(a); ok('asset '+a,s==200 and 'max-age=86400' in h.get('cache-control',''),f'{s} cache={h.get("cache-control")} ct={h.get("content-type")} bytes={len(b)}')
s,h,b=curl('/'); photos=sorted(set(re.findall(rb'(/media/photo/[^"\'\\ ,)]+)',b)))
ok('portrait in the page',len(photos)>0,str(len(photos)))
for a in photos:
    a=a.decode(); s,h,b=curl(a); ok('asset '+a,s==200 and 'immutable' in h.get('cache-control','') and b==open(APP+'/public'+a,'rb').read(),f'{s} cache={h.get("cache-control")} ct={h.get("content-type")} bytes={len(b)}')
failed=[r[0] for r in res if not r[1]]
print('FAILED:',failed)
sys.exit(1 if failed else 0)
