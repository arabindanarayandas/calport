"""Build the shareable preview (auronara.com/calport) from the Main version.

Usage:  python3 build_preview.py <output index.html>
e.g.    python3 build_preview.py ../../portfolio/calport/index.html

What it changes, compared with calport-main.html:
  - adds a proper page head: no-index tags, title, link-preview (og) tags, icons
  - turns on PREVIEW (beta bar, persona switcher, back/forward, page transitions,
    home tips, no demo account list on sign-in)
  - replaces the "open in Claude" AI messages with "Live AI is switched off in this preview"
The share image and icons in share-card/ must sit next to the output file
(og.png, icon.svg, apple-touch-icon.png).
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
if len(sys.argv) != 2:
    sys.exit(__doc__)
OUT = sys.argv[1]

s = open(os.path.join(HERE, 'calport-main.html')).read()
for old, new in json.load(open(os.path.join(HERE, 'preview_pairs.json'))):
    assert s.count(old) == 1, 'Text to replace not found once: ' + old[:80]
    s = s.replace(old, new)

HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>Calport · beta preview</title>
<meta name="description" content="Calport: placement prep with seniors who got placed. Beta preview for testing.">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="theme-color" content="#0A0A0A">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Calport">
<meta property="og:url" content="https://auronara.com/calport/">
<meta property="og:title" content="Calport · Get interview-ready, from first year to final offer">
<meta property="og:description" content="Practice daily and get mock interviews from seniors who've done the job. Beta, early access.">
<meta property="og:image" content="https://auronara.com/calport/og.png">
<meta property="og:image:secure_url" content="https://auronara.com/calport/og.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Calport: get interview-ready, from first year to final offer">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Calport · Get interview-ready, from first year to final offer">
<meta name="twitter:description" content="Practice daily and get mock interviews from seniors who've done the job. Beta, early access.">
<meta name="twitter:image" content="https://auronara.com/calport/og.png">
'''
lines = s.split('\n')
assert lines[0].startswith('<title>') and lines[1].startswith('<meta name="claude')
rest = '\n'.join(lines[2:])
i = rest.index('<style>'); rest = rest[:i] + '</head>\n<body>\n' + rest[i:]
flag = '  var PREVIEW = false;'
assert rest.count(flag) == 1; rest = rest.replace(flag, '  var PREVIEW = true;')
open(OUT, 'w').write(HEAD + rest.rstrip('\n') + '\n</body>\n</html>\n')
print('Built', OUT)
