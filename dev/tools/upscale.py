import sys, time, os, numpy as np, ncnn
OUT=os.environ.get('UPOUT','up')
from PIL import Image
P='/home/claude/dl/esr/models/realesrgan-x4plus-anime'
net=ncnn.Net(); net.opt.use_vulkan_compute=False; net.opt.num_threads=2
net.load_param(P+'.param'); net.load_model(P+'.bin')
def run(a):  # a: HxWx3 float32 0..1
    ex=net.create_extractor()
    chw=np.ascontiguousarray(a.transpose(2,0,1)).copy()   # keep alive: ncnn.Mat only borrows the numpy memory
    m=ncnn.Mat(chw).clone(); ex.input('data', m)
    r,o=ex.extract('output'); out=np.array(o).transpose(1,2,0).copy(); del m
    assert np.isfinite(out).all() and -1<out.min() and out.max()<2, ('bad tile', float(out.min()), float(out.max()))
    return out
def up(im, tile=160, pad=12):
    a=np.asarray(im.convert('RGB'),dtype=np.float32)/255.
    H,W,_=a.shape; out=np.zeros((H*4,W*4,3),np.float32)
    ap=np.pad(a,((pad,pad),(pad,pad),(0,0)),mode='edge')
    for y in range(0,H,tile):
        for x in range(0,W,tile):
            h=min(tile,H-y); w=min(tile,W-x)
            t=ap[y:y+h+2*pad, x:x+w+2*pad]
            o=run(t)[pad*4:(pad+h)*4, pad*4:(pad+w)*4]
            out[y*4:(y+h)*4, x*4:(x+w)*4]=o
    return Image.fromarray((np.clip(out,0,1)*255+.5).astype(np.uint8))
for f in sys.argv[1:]:
    t=time.time(); im=Image.open(f); o=up(im); o.save(OUT+'/'+f.split('/')[-1]); print(f, im.size,'->',o.size, round(time.time()-t,1),'s', flush=True)
