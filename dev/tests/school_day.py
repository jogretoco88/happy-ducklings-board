"""A simulated school day: jump the clock and check what the board does on its own."""
import datetime
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b=pw.chromium.launch(channel="chrome",headless=True,args=["--autoplay-policy=no-user-gesture-required","--mute-audio"])
    ctx=b.new_context(viewport={"width":1920,"height":1080},service_workers="block"); p=ctx.new_page(); errs=[]
    p.on("console",lambda m: errs.append((m.type,m.text)) if m.type=="error" else None); p.on("pageerror",lambda e: errs.append(("pageerror",str(e))))
    st=lambda: p.evaluate("(function(){var s=HDA.state();return {cur:s.cur,nap:s.nap,stack:s.stack,want:s.want&&s.want.n}})()")
    def jump(minutes): p.clock.fast_forward(minutes*60*1000); p.wait_for_timeout(300); p.clock.run_for(3500); p.wait_for_timeout(500)
    p.clock.install(time=datetime.datetime(2026,11,11,12,50,0)); p.goto("http://localhost:8765/index.html"); p.wait_for_timeout(500); p.clock.run_for(1000)
    p.keyboard.press("Enter"); p.clock.run_for(5000); p.wait_for_timeout(1200); print("12:50", st())
    p.focus("#c2"); p.keyboard.press("Enter"); p.clock.run_for(900); p.wait_for_timeout(600); p.screenshot(path="shots/40_story.png")
    jump(26); s=st(); print("13:16", s); assert s["cur"]=="clean" and s["stack"]==["tr"]
    jump(15); s=st(); print("13:31", s); assert s["cur"]=="nap" and s["nap"] and s["want"]=="lullaby" and s["stack"]==[], s
    p.screenshot(path="shots/41_nap_auto.png")
    jump(90); s=st(); print("15:01", s); assert s["cur"]=="goodbye" and not s["nap"] and s["stack"]==["tr"], s
    p.screenshot(path="shots/42_goodbye_announce.png")
    jump(31); s=st(); print("15:32", s, "|", p.inner_text("#prog")[:40]); assert "Outside schedule" in p.inner_text("#prog")
    print("errors", errs[:5]); b.close()
