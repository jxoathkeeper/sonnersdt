from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re
ROOT=Path(__file__).resolve().parent.parent
class ResourceHTML(HTMLParser):
 def __init__(self):super().__init__();self.urls=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  for key in ('src','href','poster'):
   u=d.get(key)
   if u and (key!='href' or tag in ('link','script','a')):self.urls.append((tag,key,u))

def resolve(doc,url):
 if url.startswith(('#','data:','blob:','javascript:')) or url.startswith(('http:','https:','mailto:','tel:','about:')) or '${' in url: return None
 u=unquote(urlsplit(url).path)
 p=(doc.parent/u).resolve()
 if not p.is_relative_to(ROOT.resolve()):return False
 return p if p.exists() else False

errors=[];checked=0
for p in ROOT.rglob('*.html'):
 parser=ResourceHTML();parser.feed(p.read_text())
 for tag,attr,url in parser.urls:
  if tag=='a' and attr=='href':continue
  checked+=1
  if resolve(p,url) is False:errors.append((str(p.relative_to(ROOT)),url))
for p in ROOT.rglob('*.css'):
 for uri in re.findall(r'url\(["\']?([^"\')]+)',p.read_text()):
  checked+=1
  if resolve(p,uri) is False: errors.append((str(p.relative_to(ROOT)),uri))
for p in ROOT.rglob('*.js'):
 # Relative URLs in JS are resolved against the HTML document, not the JS file.
 base=ROOT/'index.html' if p.parent.name=='namegate' else ROOT/'jordanspage/index.html' if p.parent.name=='jordanspage' else ROOT/'fornic/index.html'
 # these JS literals are the parts of media URLs before any template placeholders
 for uri in re.findall(r'''[\"'`]((?:\.\./)*assets/[^\"'`]+)[\"'`]''',p.read_text()):
  if '${' in uri: continue
  checked+=1
  if resolve(base,uri) is False:errors.append((str(p.relative_to(ROOT)),uri))
print('Verified resource references:',checked,'missing:',len(errors))
for err in errors:print('MISSING',*err)
if errors:raise SystemExit(1)
