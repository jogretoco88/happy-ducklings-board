"""Audio really plays, offline cache works, file:// works, off-schedule and phone-size views."""
import json, datetime, time, os
from playwright.sync_api import sync_playwright
URL="http://localhost:8765/index.html"
with sync_playwright() as pw:
    b=pw.chromium.launch(channel="chrome",headless=True,args=["--autoplay-policy=no-user-gesture-required","--mute-audio"])
    # --- 1. real clock, audio + service worker
    ctx=b.new_context(viewport={"width":1920,"height":1080}); p=ctx.new_page(); errs=[]
    p.on("console",lambda m: errs.append((m.type,m.text)) if m.type=="error" else None); p.on("pageerror",lambda e: errs.append(("pageerror",str(e))))
    p.goto(URL); p.wait_for_timeout(1500); p.screenshot(path="shots/30_welcome_real.png")
    p.keyboard.press("Enter"); p.wait_for_timeout(4000)
    s=p.evaluate("HDA.state()"); song=[a for a in s["audio"] if a["n"]=="song"][0]
    print("off-schedule activity:",s["cur"],"| song:",song)
    assert not song["paused"] and song["t"]>1.5 and song["err"] is None, song
    p.screenshot(path="shots/31_offschedule.png")
    p.keyboard.press("w"); p.wait_for_timeout(3500); s=p.evaluate("HDA.state()"); w=[a for a in s["audio"] if a["n"]=="wash"][0]; song=[a for a in s["audio"] if a["n"]=="song"][0]
    print("wash track:",w,"| song paused:",song["paused"]); assert not w["paused"] and w["t"]>1 and song["paused"]
    p.keyboard.press("Escape"); p.wait_for_timeout(3000); s=p.evaluate("HDA.state()"); song=[a for a in s["audio"] if a["n"]=="song"][0]; print("song resumed:",not song["paused"], round(song["vol"],2)); assert not song["paused"]
    p.keyboard.press("n"); p.wait_for_timeout(4000); s=p.evaluate("HDA.state()"); l=[a for a in s["audio"] if a["n"]=="lullaby"][0]; print("lullaby:",l); assert not l["paused"] and l["t"]>1 and abs(l["vol"]-0.3)<0.05
    p.keyboard.press("n"); p.wait_for_timeout(500)
    # service worker + offline
    reg=p.evaluate("navigator.serviceWorker.getRegistration().then(function(r){return !!r&&!!(r.active||r.installing||r.waiting)})"); print("service worker registered:",reg)
    p.wait_for_timeout(2500); p.reload(); p.wait_for_timeout(2500)   # second load fills the cache through the worker
    keys=p.evaluate("caches.open('hda-board-v2').then(function(c){return c.keys()}).then(function(k){return k.length})"); print("cached files:",keys)
    ctx.set_offline(True); p.reload(); p.wait_for_timeout(2000)
    ok=p.evaluate("typeof HDA==='object' && document.fonts.check('700 40px Fredoka')"); print("offline reload works:",ok); assert ok
    p.keyboard.press("Enter"); p.wait_for_timeout(4000); s=p.evaluate("HDA.state()"); song=[a for a in s["audio"] if a["n"]=="song"][0]; print("offline song:",song)
    imgs=p.evaluate("[].slice.call(document.images).filter(function(i){return i.src&&(!i.complete||i.naturalWidth===0)}).map(function(i){return i.src})"); print("broken images offline:",imgs)
    p.screenshot(path="shots/32_offline.png"); ctx.set_offline(False)
    print("errors:",errs[:6]); ctx.close()
    # --- 2. file:// (double-click from a USB stick)
    ctx=b.new_context(viewport={"width":1920,"height":1080}); p=ctx.new_page(); errs=[]
    p.on("console",lambda m: errs.append((m.type,m.text)) if m.type=="error" else None); p.on("pageerror",lambda e: errs.append(("pageerror",str(e))))
    p.goto("file://"+os.path.abspath("app/index.html")); p.wait_for_timeout(1000); p.keyboard.press("Enter"); p.wait_for_timeout(3500)
    s=p.evaluate("HDA.state()"); song=[a for a in s["audio"] if a["n"]=="song"][0]; print("file:// song playing:",not song["paused"],"sfx buffers:",s["bufs"],"errors:",errs[:4]); ctx.close()
    # --- 3. phone portrait + small laptop
    for name,vp in (("33_phone",{"width":390,"height":844}),("34_laptop",{"width":1366,"height":768})):
        ctx=b.new_context(viewport=vp,device_scale_factor=2); p=ctx.new_page(); p.goto(URL); p.wait_for_timeout(1200); p.keyboard.press("Enter"); p.wait_for_timeout(1500); p.screenshot(path=f"shots/{name}.png"); ctx.close()
    b.close()
