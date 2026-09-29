#!/usr/bin/env python3
"""Content parity between the OLD static pages and the pages rendered by the preview.

usage: BASE=http://localhost:8787 python3 scripts/checks/parity.py            (real check, exit 0 when clean)
       BASE=... python3 parity.py --negative-control           (tampers with the fetched pages; must FAIL)
"""
import html, json, os, re, sys, urllib.request, urllib.error
from html.parser import HTMLParser

BASE = os.environ.get('BASE', 'http://localhost:8787')
_APP = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# the old static site: ~/Documents/Website/personal-website, or OLD_SITE
OLD = os.path.join(os.environ.get('OLD_SITE', os.path.expanduser('~/Documents/Website/personal-website')), '')
KEYS = OLD + 'public-key/'
PAGES = [  # name, url, old file, kind, locale
    ('home-en', '/', 'index.html', 'home', 'en'),
    ('home-zh-hant', '/zh-hant/', 'zh-hant/index.html', 'home', 'zh-hant'),
    ('home-zh-hans', '/zh-hans/', 'zh-hans/index.html', 'home', 'zh-hans'),
    ('keys-en', '/public-key/', 'public-key/index.html', 'keys', 'en'),
    ('keys-zh-hant', '/zh-hant/public-key/', 'zh-hant/public-key/index.html', 'keys', 'zh-hant'),
    ('keys-zh-hans', '/zh-hans/public-key/', 'zh-hans/public-key/index.html', 'keys', 'zh-hans'),
    ('not-found', '/nope/', '404.html', '404', 'en'),
]
# OLD text that is in the new page only after hydration (checked in the browser run).
AFTER_HYDRATION = {'Copy', '複製', '复制'}
# Text the new pages may have that the OLD page does not (interface of the new header etc.).
# Filled from the dictionaries by meaning, not by guess: anything else is reported as a defect.
EXPECTED_NEW_KINDS = ['header page link (title of the keys page)', 'theme labels',
                      'breadcrumb', 'in-page links', '404 status in footer']

def fetch(url):
    try:
        with urllib.request.urlopen(BASE + url) as r:
            return r.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.read().decode('utf-8')

def ws(s):
    return re.sub(r'\s+', ' ', s.replace(' ', ' ')).strip()

class Text(HTMLParser):
    """Visible text of <body>: text nodes, and the running text in two variants."""
    SKIP = {'script', 'style', 'template', 'svg', 'head', 'title'}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0; self.body = False; self.nodes = []; self.glued = []; self.spaced = []
        self.hidden_stack = []
    def handle_starttag(self, t, a):
        if t == 'body': self.body = True
        if t in self.SKIP: self.skip += 1
        self.spaced.append(' ')
    def handle_endtag(self, t):
        if t in self.SKIP: self.skip = max(0, self.skip - 1)
        self.spaced.append(' ')
    def handle_data(self, d):
        if self.skip or not self.body: return
        self.glued.append(d); self.spaced.append(d)
        if ws(d): self.nodes.append(ws(d))

def text_of(doc):
    p = Text(); p.feed(doc); p.close()
    glued = ws(''.join(p.glued)); spaced = ws(''.join(p.spaced))
    return p.nodes, glued, spaced

def nospace(s):
    return re.sub(r'\s+', '', s)

class Head(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tags = []; self.ld = []; self.cur = None; self.title = None; self.t = None
    def handle_starttag(self, t, a):
        a = dict(a)
        if t in ('meta', 'link', 'base'):
            self.tags.append((t, tuple(sorted((k, v) for k, v in a.items() if k != 'nonce'))))
        if t == 'script' and a.get('type') == 'application/ld+json': self.cur = ''
        if t == 'title' and self.title is None: self.t = ''
    def handle_startendtag(self, t, a): self.handle_starttag(t, a)
    def handle_data(self, d):
        if self.cur is not None: self.cur += d
        if self.t is not None: self.t += d
    def handle_endtag(self, t):
        if t == 'script' and self.cur is not None:
            self.ld.append(json.loads(self.cur)); self.cur = None
        if t == 'title' and self.t is not None:
            self.title = self.t; self.t = None

def head_of(doc):
    p = Head(); p.feed(doc); p.close(); return p

def expected_head_difference(tag):
    t, attrs = tag; a = dict(attrs)
    if t == 'meta' and a.get('name') == 'theme-color': return True
    if t == 'link' and a.get('rel') == 'icon': return True
    if t == 'link' and a.get('rel') == 'stylesheet': return True
    if t == 'link' and a.get('rel') == 'preload': return True        # framework: script and font preloads
    if t == 'meta' and a.get('name') == 'next-size-adjust': return True
    if t == 'meta' and a.get('name') == 'robots' and a.get('content') == 'noindex': return True  # added by Next.js on 404
    return False

def pre_text(doc, element_id):
    m = re.search(r'<pre\b[^>]*\bid="%s"[^>]*>(.*?)</pre>' % re.escape(element_id), doc, re.S)
    if not m: return None, False
    inner = m.group(1)
    # the comment pair may stand inside the element (new) or around it (old)
    before = doc[max(0, m.start() - 20):m.start()]; after = doc[m.end():m.end() + 20]
    pair = (inner.lstrip('\n').startswith('<!--email_off-->') and inner.rstrip().endswith('<!--/email_off-->')) or \
           (before.rstrip().endswith('<!--email_off-->') and after.lstrip().startswith('<!--/email_off-->'))
    inner = re.sub(r'<!--.*?-->', '', inner, flags=re.S)
    inner = re.sub(r'<[^>]+>', '', inner)
    if inner.startswith('\n'): inner = inner[1:]   # HTML drops a newline right after <pre>
    return html.unescape(inner), pair

def check_page(name, kind, locale, new, old, problems, notes):
    def bad(msg): problems.append('%s: %s' % (name, msg))
    o_nodes, o_glued, o_spaced = text_of(old)
    n_nodes, n_glued, n_spaced = text_of(new)
    # 1. every text segment of OLD is in NEW
    missing = []
    for seg in o_nodes:
        if seg in n_glued or seg in n_spaced: continue
        if seg in AFTER_HYDRATION:
            notes.append('%s: "%s" comes after hydration' % (name, seg)); continue
        if nospace(seg) in nospace(n_glued):
            # same characters, other white space: accept only if the words are not glued
            notes.append('%s: white space differs for "%s"' % (name, seg[:60])); 
            bad('white space differs in segment: %r' % seg[:80]); continue
        missing.append(seg)
    for seg in missing: bad('OLD text missing in NEW: %r' % seg[:120])
    # 2. text of NEW that OLD does not have
    extra = []
    for seg in n_nodes:
        # a piece of NEW text is known if OLD has the same characters in the same order
        # (the new markup cuts running text into smaller pieces: dates, parts of addresses)
        if seg in o_nodes or seg in o_glued or seg in o_spaced: continue
        if nospace(seg) in nospace(o_glued): continue
        extra.append(seg)
    # 3. key text, comments
    if kind == 'keys':
        for eid, f in (('pgp-armor', 'pgp.asc'), ('ssh-line', 'ssh.pub')):
            want = open(KEYS + f, 'rb').read()
            got, pair = pre_text(new, eid)
            if got is None: bad('no <pre id=%s>' % eid); continue
            if got.encode('utf-8') != want and got.encode('utf-8') != want.rstrip(b'\n'):
                bad('%s differs from %s (%d bytes against %d)' % (eid, f, len(got.encode()), len(want)))
            elif got.encode('utf-8') != want:
                notes.append('%s: %s equal but for the final newline' % (name, eid))
            if not pair: bad('no email_off comment pair at %s' % eid)
        m = re.search(r'<dd\b[^>]*>\s*<!--email_off-->([^<]*)<!--/email_off-->\s*</dd>', new)
        if not m or 'zehao.duan@gmail.com' not in html.unescape(m.group(1)):
            bad('user ID is not inside an email_off comment pair')
        if new.count('<!--email_off-->') != 3 or new.count('<!--/email_off-->') != 3:
            bad('email_off pairs: %d open, %d close (3 expected)' % (new.count('<!--email_off-->'), new.count('<!--/email_off-->')))
    # 4. content rules
    if re.search(r'\+\s*86\b|(?<!\d)86[\s-]?1[3-9]\d{9}(?!\d)|(?<!\d)1[3-9]\d{9}(?!\d)', n_spaced) or '+86' in new:
        bad('a mainland-China phone number is on the page')
    if kind == 'home':
        for needle in ('3820 3A1C', '38203A1C', 'SHA256:', 'BEGIN PGP', 'ssh-ed25519'):
            if needle in new: bad('key data on a home page: %s' % needle)
    has_wechat = bool(re.search(r'wechat|weixin|微信', new, re.I))
    if kind == 'home' and locale == 'zh-hans':
        if not re.search(r'微信', n_spaced): bad('WeChat row missing on zh-hans')
        if re.search(r'<a\b[^>]*href="[^"]*(weixin|wechat)', new, re.I): bad('WeChat is a link')
    elif has_wechat:
        bad('WeChat appears on a page that is not the zh-hans home page')
    if re.search(r'<img\b[^>]*(qr|wechat)', new, re.I): bad('QR code image')
    # 5. head and JSON-LD
    oh, nh = head_of(old), head_of(new)
    if oh.title != nh.title: bad('title differs: %r / %r' % (oh.title, nh.title))
    ns, os_ = set(nh.tags), set(oh.tags)
    for t in oh.tags:
        if t not in ns and not expected_head_difference(t): bad('head tag of OLD missing: %r' % (t,))
    for t in nh.tags:
        if t not in os_ and not expected_head_difference(t): bad('head tag only in NEW: %r' % (t,))
    if len(nh.tags) != len(ns): bad('duplicate head tags')
    if oh.ld != nh.ld: bad('JSON-LD differs')
    # 6. date
    if kind != '404':
        dates = re.findall(r'<time\b[^>]*\bdatetime="([^"]+)"[^>]*>([^<]*)</time>', new, re.I)
        old_dates = re.findall(r'<time\b[^>]*\bdatetime="([^"]+)"[^>]*>([^<]*)</time>', old, re.I)
        if ('2026-09-29' not in [d[0] for d in dates]): bad('last-updated date 2026-09-29 not found')
        if set(dates) != set(old_dates): bad('time elements differ: %r / %r' % (sorted(set(old_dates)), sorted(set(dates))))
    return extra, len(o_nodes), len(n_nodes)

def tamper(name, kind, doc):
    """Negative control: changes that the checks must notice."""
    if kind == 'home':
        doc = doc.replace('power system', 'power sistem', 1)                       # wording
        doc = doc.replace('</main>', '<p>+86 138 0013 8000</p></main>', 1)         # forbidden number
    if kind == 'keys':
        doc = doc.replace('mDMEaqugRBYJKwYB', 'mDMEaqugRBYJKwYC', 1)                # one character of the key
        doc = doc.replace('<!--/email_off-->', '', 1)                               # a comment pair broken
    if kind == '404':
        doc = doc.replace('<main', '<p>An extra sentence.</p><main', 1)             # new text
        doc = re.sub(r'<script type="application/ld\+json".*?</script>', '', doc, flags=re.S)
        doc = doc.replace('<title>', '<title>x', 1)
    return doc

def main():
    negative = '--negative-control' in sys.argv
    problems, notes, extras = [], [], {}
    for name, url, oldfile, kind, locale in PAGES:
        new = fetch(url); old = open(OLD + oldfile, encoding='utf-8').read()
        if negative: new = tamper(name, kind, new)
        extra, n_old, n_new = check_page(name, kind, locale, new, old, problems, notes)
        extras[name] = extra
        print('%-14s OLD segments %3d, NEW segments %3d, only in NEW: %s' % (name, n_old, n_new, extra))
    for n in notes: print('note:', n)
    if negative:
        hit = {p.split(':')[0] for p in problems}
        extra_hit = bool(extras['not-found'] and 'An extra sentence.' in extras['not-found'])
        print('\nnegative control found %d problems on %d pages; extra text seen: %s' % (len(problems), len(hit), extra_hit))
        for p in problems: print('  (expected)', p)
        ok = len(hit) == 7 and extra_hit
        print('NEGATIVE CONTROL', 'WORKS (the script can fail)' if ok else 'DID NOT FAIL: the script is blind')
        sys.exit(0 if ok else 2)
    print()
    for p in problems: print('PROBLEM', p)
    print('PARITY', 'OK' if not problems else 'FAILED (%d)' % len(problems))
    sys.exit(1 if problems else 0)

main()
