"""Une dev/src/style.css + body.html + app.js en index.html.  Uso: python3 dev/tools/build.py"""
import os
HERE=os.path.dirname(os.path.abspath(__file__)); SRC=os.path.join(HERE,'..','src'); OUT=os.path.join(HERE,'..','..','index.html')
rd=lambda n: open(os.path.join(SRC,n),encoding='utf-8').read()
css=rd('style.css'); body=rd('body.html'); js=rd('app.js')
html=f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Happy Ducklings Smart Board</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#BCE6D8">
<meta name="description" content="Happy Ducklings Academy: bilingual smart classroom board for TV (English / Español).">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="assets/icons/icon-192.png">
<link rel="apple-touch-icon" href="assets/icons/icon-192.png">
<style>
{css}</style>
</head>
<body>
{body}<script src="assets/sfx.js"></script>
<script>
{js}</script>
</body>
</html>
'''
open(OUT,'w',encoding='utf-8').write(html); print('index.html', len(html)//1024, 'KB')
