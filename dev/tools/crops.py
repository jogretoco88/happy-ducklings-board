import os, re, subprocess
from PIL import Image
Z=3; OUT='app/assets/img/'
def crop(tag,n,box,name,maxw,maxh=None,pad=6):
    im=Image.open(f'pg/{tag}{n:02d}.png').convert('RGBA')
    x0,y0,x1,y1=[int(v*Z) for v in box]; c=im.crop((x0,y0,x1,y1))
    bb=c.getchannel('A').point(lambda a:255 if a>8 else 0).getbbox()
    c=c.crop((max(0,bb[0]-pad),max(0,bb[1]-pad),min(c.width,bb[2]+pad),min(c.height,bb[3]+pad)))
    touching=[bb[0]<=0,bb[1]<=0,bb[2]>=x1-x0,bb[3]>=y1-y0]
    c.thumbnail((maxw,maxh or maxw*2),Image.LANCZOS)
    c.save(OUT+name+'.webp',quality=88,method=6)
    print(name,c.size,os.path.getsize(OUT+name+'.webp')//1024,'KB','EDGE!' if any(touching) else '',touching if any(touching) else '')
EMO=['happy','sad','angry','scared','calm','surprised']
for i,e in enumerate(EMO): crop('l',8+i,(45,60,567,566),'emo_'+e,560)
VOW=[('a','apple','ant'),('e','elephant','egg'),('i','iguana','island'),('o','octopus','orange'),('u','umbrella','unicorn')]
for i,(v,p,q) in enumerate(VOW):
    crop('l',14+i,(34,362,306,640),'w_'+p,520); crop('l',14+i,(306,362,578,640),'w_'+q,520)
for n,nm in [(19,'p_routine'),(20,'p_activities'),(21,'p_friends'),(22,'p_learnplay'),(23,'p_backtoschool')]:
    crop('l',n,(32.4,170,579.6,747),nm,1300,1300)
ZN=['pretend','lyrics','stimulation','feeding','circle','learning','explore','sensory','art','count','bounce','music']
for i,z in enumerate(ZN): crop('c',i+1,(40,220,752,571),'z_'+z,1400)
# raster scenes + rules (AI-upscaled)
for i,nm in enumerate(['arrival','story','nap','clean','goodbye']):
    im=Image.open(f'up/r-{i:03d}.png').convert('RGB'); im.thumbnail((1400,1250),Image.LANCZOS)
    im.save(OUT+'s_'+nm+'.webp',quality=86,method=6); print('s_'+nm,im.size,os.path.getsize(OUT+'s_'+nm+'.webp')//1024,'KB')
for i,nm in enumerate(['walk','hands','share','voice','listen','wash']):
    im=Image.open(f'up/r-{i+5:03d}.png').convert('RGB'); im.thumbnail((560,640),Image.LANCZOS)
    im.save(OUT+'r_'+nm+'.webp',quality=86,method=6); print('r_'+nm,im.size,os.path.getsize(OUT+'r_'+nm+'.webp')//1024,'KB')
