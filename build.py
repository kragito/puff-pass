"""Rebuild docs/index.html from src/. Run: python3 build.py"""
import os
here = os.path.dirname(os.path.abspath(__file__))
r = lambda p: open(os.path.join(here, p), encoding='utf-8').read()
body = r('src/shell3.html').replace('/*ENGINE*/', r('src/engine.js')).replace('/*DATA*/', r('src/data.js')).replace('/*UI*/', r('src/ui3.js'))
doc = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  '<meta name="description" content="Puff Pass: name something in the category before the puffer pops. Play with friends online, no account needed.">\n'
  '<style>body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}</style>\n'
  '<script>/* PeerJS 1.5.4, MIT License, https://github.com/peers/peerjs */\n' + r('src/peerjs.min.js').replace('</script', '<\\/script') + '\n</script>\n'
  '<script>\n' + r('src/p2p.js') + '\n</script>\n</head>\n<body>\n' + body + '\n</body>\n</html>\n')
os.makedirs(os.path.join(here, 'docs'), exist_ok=True)
open(os.path.join(here, 'docs/index.html'), 'w', encoding='utf-8').write(doc)
print('built docs/index.html')
