import subprocess, re, sys, os
from PIL import Image
LAM='in/868102ae-laminas_preescolar.pdf'; CAR='in/303db8ff-carteles_zonas.pdf'
os.makedirs('svg',exist_ok=True); os.makedirs('pg',exist_ok=True)
def page(pdf,n,zoom,tag):
    svg=f'svg/{tag}{n:02d}.svg'; png=f'pg/{tag}{n:02d}.png'
    subprocess.run(['pdftocairo','-svg','-f',str(n),'-l',str(n),pdf,svg],check=True)
    s=open(svg).read(); i=s.find('</defs>')
    head,body=s[:i+7],s[i+7:]
    body,k1=re.subn(r'<rect [^>]*fill="rgb\(100%, 100%, 100%\)"[^>]*/>\s*','',body,count=1)
    body,k2=re.subn(r'^\s*<path fill-rule="evenodd" fill="rgb\(100%, 100%, 100%\)"[^>]*/>\s*','',body,count=1)
    assert k1==1,(tag,n,k1,k2)
    open(svg,'w').write(head+body)
    subprocess.run(['rsvg-convert','-z',str(zoom),'-o',png,svg],check=True)
    return Image.open(png).convert('RGBA')
if __name__=='__main__':
    for n in range(7,24): im=page(LAM,n,3,'l'); print('l',n,im.size,im.getbbox())
    for n in range(1,13): im=page(CAR,n,3,'c'); print('c',n,im.size,im.getbbox())
