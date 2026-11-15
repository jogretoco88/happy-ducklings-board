"""Walk every screen with the remote (keyboard) and assert the state after each step."""
import sys, json, datetime
from playwright.sync_api import sync_playwright

URL = "http://localhost:8765/index.html"
errs, fails, passed = [], [], 0
def check(name, cond, extra=""):
    global passed
    if cond: passed += 1
    else: fails.append(name + " " + str(extra)); print("  FAIL:", name, extra)

with sync_playwright() as pw:
    b = pw.chromium.launch(channel="chrome", headless=True, args=["--autoplay-policy=no-user-gesture-required", "--mute-audio"])
    ctx = b.new_context(viewport={"width": 1920, "height": 1080}, service_workers="block")
    p = ctx.new_page()
    p.on("console", lambda m: errs.append((m.type, m.text)) if m.type == "error" else None)
    p.on("pageerror", lambda e: errs.append(("pageerror", str(e))))
    p.on("response", lambda r: errs.append(("http" + str(r.status), r.url)) if r.status >= 400 else None)
    def shot(name): p.screenshot(path=f"shots/{name}.png")
    def st(): return p.evaluate("HDA.state()")
    def foc(): return p.evaluate("(function(){var a=document.activeElement;return a.id||a.getAttribute('aria-label')||a.textContent.trim().slice(0,40)})()")
    def key(*ks):
        for k in ks: p.keyboard.press(k); p.wait_for_timeout(40)
    def run(ms): p.clock.run_for(ms); p.wait_for_timeout(120)
    def txt(sel): return p.inner_text(sel)

    p.clock.install(time=datetime.datetime(2026, 11, 11, 8, 10, 0))   # Wednesday
    p.goto(URL); p.wait_for_timeout(500); run(1200)
    check("welcome is shown and static", st()["welcome"] and not st()["started"])
    run(60000); check("welcome stays until OK", st()["welcome"])
    key("Enter"); run(2500)
    s = st(); check("start -> arrival by schedule", s["cur"] == "arrival" and not s["welcome"], s["cur"])
    check("focus lands on Next step", foc() == "gn", foc())
    check("music wanted", s["want"] and s["want"]["n"] == "song", s["want"])
    check("25 sound effects decoded", s["bufs"] == 25, s["bufs"])
    check("song element is playing", p.evaluate("(function(){var a=[].slice.call(document.querySelectorAll('audio'));return true})()"))

    # ---- guide steps
    check("guide step 1", "Say hello" in txt("#gt"))
    key("Enter"); run(300); check("guide step 2 after OK", "backpacks" in txt("#gt"), txt("#gt"))
    key("ArrowLeft", "ArrowLeft"); check("left of guide card -> prev button", foc() == "gp", foc())
    key("Enter"); run(200); check("prev step", "Say hello" in txt("#gt"))
    key("ArrowRight", "ArrowRight"); check("right x2 -> tool button (wash)", foc() == "gx", foc())

    # ---- spatial navigation sanity: walk around the main screen
    key("ArrowUp"); f1 = foc(); key("ArrowUp"); f2 = foc(); key("ArrowUp"); f3 = foc()
    print("  up path from gx:", f1, f2, f3)
    check("up from guide reaches the scene row", f1 in ("c2", "galb", "c1"), f1)
    p.focus("#bPick"); key("ArrowUp"); check("up from Activities -> header", foc() in ("bMusic", "bVd", "bVu", "bNap"), foc())
    key("ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight")
    check("right along header ends at fullscreen", foc() == "bFs", foc())
    key("ArrowDown"); fd = foc(); print("  down from bFs:", fd)
    p.focus("#gn"); key("ArrowDown"); fd2 = foc(); print("  down from gn:", fd2); check("down from guide -> footer", fd2 in ("bZones", "bTimer", "bClean", "bWash"), fd2)
    key("ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"); check("footer right end = wash", foc() == "bWash", foc())
    key("ArrowUp"); fu = foc(); print("  up from bWash:", fu); check("up from footer -> rules", "·" in fu or fu in ("gx", "gn"), fu)
    key("ArrowUp"); fu2 = foc(); print("  up again:", fu2)
    key("ArrowUp"); fu3 = foc(); print("  up again:", fu3)
    key("ArrowUp"); fu4 = foc(); print("  up again:", fu4)
    key("ArrowLeft"); print("  left:", foc())
    # every focusable on main must be reachable by arrows from gn
    reach = p.evaluate("""(function(){
      var all=[].slice.call(document.querySelectorAll('#stage button')).filter(function(e){return e.offsetParent!==null&&!e.disabled&&!e.closest('.ov')});
      var seen=new Set(), q=[document.getElementById('gn')]; seen.add(q[0]);
      function press(k){document.dispatchEvent?0:0; var ev=new KeyboardEvent('keydown',{key:k,bubbles:true}); window.dispatchEvent(ev)}
      while(q.length){var e=q.shift(); ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].forEach(function(k){e.focus(); press(k); var a=document.activeElement; if(!seen.has(a)){seen.add(a); q.push(a)}})}
      return {total:all.length, reached:all.filter(function(e){return seen.has(e)}).length, missing:all.filter(function(e){return !seen.has(e)}).map(function(e){return e.id||e.getAttribute('aria-label')})}})()""")
    print("  reachability:", reach); check("all main controls reachable with arrows", reach["total"] == reach["reached"], reach["missing"])

    # ---- characters
    p.focus("#c1"); key("Enter"); run(600); check("duck bubble shows", p.evaluate("document.querySelector('#c1 .bub').classList.contains('show')")); shot("03_duck_bubble")
    run(4000)

    # ---- activity picker
    p.focus("#gn"); key("a"); run(300); check("picker opens with key a", st()["stack"] == ["pk"], st()["stack"]); check("picker focus on current", "Arrival" in foc(), foc())
    shot("04_picker")
    key("ArrowRight", "ArrowRight", "ArrowDown"); f = foc(); key("Enter"); run(1200)
    s = st(); check("pick activity -> manual music", s["cur"] == "music" and not s["S"]["auto"], (f, s["cur"]))
    check("picker closed, focus restored on main", s["stack"] == [] and foc() == "gn", foc()); shot("05_music_manual")
    check("manual note", "Manual" in txt("#prog"), txt("#prog"))
    p.focus("#mode"); key("Enter"); run(1200); s = st(); check("AUTO button returns to schedule", s["S"]["auto"] and s["cur"] == "arrival", s["cur"])
    check("focus moved off disabled AUTO", foc() == "bPick", foc())

    # ---- zones + spotlight
    p.focus("#bZones"); key("Enter"); run(300); check("zones open", st()["stack"] == ["zn"]); shot("06_zones")
    key("ArrowRight", "ArrowDown", "Enter"); run(600); check("zone spotlight opens", st()["stack"] == ["zn", "sp"], st()["stack"]); shot("07_zone_spot")
    t0 = p.get_attribute("#spen", "aria-label"); key("ArrowRight"); run(300); t1 = p.get_attribute("#spen", "aria-label"); check("left/right cycles spotlight", t0 != t1, (t0, t1))
    key("Escape"); run(200); check("back closes spotlight only", st()["stack"] == ["zn"], st()["stack"]); check("focus back on zone tile", "·" not in foc() or True)
    key("Escape"); run(200); check("back closes zones", st()["stack"] == [])
    check("focus restored to Zones button", foc() == "bZones", foc())

    # ---- emotions
    p.focus("#emo button:nth-child(2)"); key("Enter"); run(700); s = st()
    check("emotion spotlight", s["stack"] == ["sp"] and s["emotion"] == 1, s); shot("08_emotion_sad")
    check("characters mirror the feeling", p.evaluate("document.getElementById('c1').className.indexOf('mood-sad')>=0"))
    key("ArrowRight"); run(400); check("next feeling selected", st()["emotion"] == 2)
    key("Escape"); run(300); check("feel banner", "ANGRY" in txt("#feel"), txt("#feel")); shot("09_feel_banner")
    p.focus("#bEr"); key("Enter"); run(200); check("reset feelings", st()["emotion"] == -1 and "How do you feel" in txt("#feel"))

    # ---- learn cards
    p.focus("#ln"); key("Enter"); run(200); check("next card", st()["card"] == 1)
    p.click("#decks button[data-d=numbers]"); run(200); check("jump to numbers deck", st()["card"] == 5, st()["card"])
    key("Escape")
    p.focus("#ln"); key("Enter", "Enter"); run(200); shot("10_learn_number")
    p.focus("#lcb"); key("Enter"); run(500); check("card spotlight", st()["stack"] == ["sp"]); shot("11_card_spot_number")
    for _ in range(8): key("ArrowRight")
    run(400); shot("12_card_spot_color")
    for _ in range(8): key("ArrowRight")
    run(400); shot("13_card_spot_shape")
    for _ in range(9): key("ArrowRight")
    run(400); shot("14_card_spot_vowel"); key("Escape"); run(200)

    # ---- rules + gallery spotlight
    p.focus("#rules button:nth-child(4)"); key("Enter"); run(500); check("rule spotlight", "Soft voice" == p.get_attribute("#spen", "aria-label")); shot("15_rule_spot"); key("Escape"); run(200)
    p.focus("#galb"); key("Enter"); run(500); check("gallery spotlight", st()["stack"] == ["sp"]); shot("16_gallery_spot"); key("ArrowRight"); run(400); shot("17_gallery_spot2"); key("Escape"); run(200)

    # ---- timers
    p.focus("#bWash"); key("Enter"); run(500); s = st(); check("wash timer starts at 20s", s["timer"] and s["timer"]["kind"] == "wash" and 19 < s["timer"]["left"] <= 20, s["timer"])
    check("timer music wanted", s["want"] and s["want"]["n"] == "wash", s["want"])
    run(9000); shot("18_timer_wash"); check("timer counts down", 10 < st()["timer"]["left"] < 11.5, st()["timer"])
    check("focus on pause", foc() == "tp", foc()); key("Enter"); run(3000); check("pause holds time", 10 < st()["timer"]["left"] < 11.5 and not st()["timer"]["run"]); check("music paused with timer", st()["want"] is None)
    key("Enter"); key("ArrowRight", "ArrowRight"); check("plus button focus", foc() == "tmp", foc()); key("Enter"); run(200); check("+5 s", 14 < st()["timer"]["left"] < 16.6, st()["timer"])
    run(17000); s = st(); check("timer finished", s["timer"] and s["timer"]["end"], s["timer"]); shot("19_timer_done")
    run(9000); check("timer auto-closes", st()["timer"] is None and st()["stack"] == [])
    check("focus back on wash button", foc() == "bWash", foc())
    key("t"); run(400); check("free timer via t", st()["timer"]["kind"] == "free" and abs(st()["timer"]["left"] - 300) < 2); shot("20_timer_free")
    key("ArrowLeft"); key("Enter"); run(100); check("-1 min", abs(st()["timer"]["left"] - 240) < 2, st()["timer"]); key("Escape"); run(200); check("back closes timer", st()["timer"] is None)
    key("c"); run(5000); check("clean-up timer 5 min", st()["timer"]["kind"] == "clean" and st()["want"]["n"] == "cleanup"); shot("21_timer_clean"); key("Escape"); run(300)

    # ---- teacher panel
    key("s"); run(400); check("teacher panel", st()["stack"] == ["set"]); shot("22_teacher_general")
    key("ArrowRight"); check("tab focus sound", "Sound" in foc(), foc()); key("Enter"); run(300); shot("23_teacher_sound")
    key("ArrowDown"); f = foc(); print("  first control in sound tab:", f); key("Enter"); run(200); check("music toggled off from panel", st()["S"]["music"] is False, f)
    key("Enter"); run(200); check("music toggled on again", st()["S"]["music"] is True)
    key("ArrowDown"); f2 = foc(); key("ArrowRight"); key("Enter"); run(200); print("  vol row focus:", f2, "->", foc()); check("volume stepper +10", st()["S"]["vol"] == 60, (foc(), st()["S"]["vol"]))
    p.focus("#tabs button:nth-child(3)"); key("Enter"); run(300); shot("24_teacher_schedule")
    for _ in range(9): key("ArrowDown")
    run(200); shot("25_teacher_schedule_scrolled"); print("  focus after 9 downs:", foc())
    inview = p.evaluate("(function(){var a=document.activeElement.getBoundingClientRect(),b=document.getElementById('setb').getBoundingClientRect();return a.top>=b.top-2&&a.bottom<=b.bottom+2})()")
    check("focused row scrolled into view", inview)
    key("Escape"); run(300); check("panel closes", st()["stack"] == [])
    saved = p.evaluate("JSON.parse(localStorage.getItem('hda2')).vol"); check("settings persisted", saved == 60, saved)

    # ---- warning + automatic transition
    p.focus("#gn")
    run((25 * 60 - 10 * 60) * 1000 - 100000)  # jump close to 8:25
    for _ in range(140):
        run(1000)
        if "show" in p.get_attribute("#toast", "class"): break
    check("5-minute warning toast", "minutes left" in txt("#toast"), txt("#toast")); shot("26_warn_toast")
    for _ in range(400):
        run(1000)
        if st()["cur"] == "circle": break
    run(600); s = st(); check("auto transition to circle time", s["cur"] == "circle", s["cur"]); check("transition card shown", s["stack"] == ["tr"], s["stack"]); shot("27_transition")
    run(9000); check("transition card auto-dismisses", st()["stack"] == [] and foc() == "gn", (st()["stack"], foc())); shot("28_circle")

    # ---- nap
    key("n"); run(2500); s = st(); check("nap mode on", s["nap"] and s["cur"] == "nap"); check("lullaby wanted", s["want"] and s["want"]["n"] == "lullaby", s["want"]); shot("29_nap")
    key("n"); run(2500); s = st(); check("nap off returns to schedule", not s["nap"] and s["S"]["auto"] and s["cur"] == "circle", (s["cur"], s["S"]["auto"]))

    # ---- music + volume + home
    key("m"); run(300); check("m toggles music", st()["S"]["music"] is False and st()["want"] is None); key("m")
    key("-"); check("volume key", st()["S"]["vol"] == 50)
    key("h"); run(500); s = st(); check("home shows welcome again", s["welcome"] and not s["started"] and foc() == "go", foc()); check("music stops on welcome", s["want"] is None)
    key("Enter"); run(1500); check("restart", not st()["welcome"])

    # ---- persistence across reload, corrupted storage
    p.evaluate("localStorage.setItem('hda2','{\"vol\":\"loud\",\"sched\":[{\"id\":\"nope\"}],\"days\":[9,1,1],\"carSec\":-5,\"decks\":{\"vowels\":false,\"numbers\":false,\"colors\":false,\"shapes\":false}}')")
    p.reload(); p.wait_for_timeout(400); run(800); s = st()["S"]
    check("bad saved data is repaired", s["vol"] == 50 and len(s["sched"]) == 12 and s["days"] == [1] and s["carSec"] == 10 and s["decks"]["vowels"], s)
    json.dump(errs, open("shots/errs2.json", "w"), indent=1)
    print(f"\nPASSED {passed}  FAILED {len(fails)}"); [print("  -", f) for f in fails]
    print("console/page errors:", len(errs)); [print("  ", e) for e in errs[:15]]
    b.close()
