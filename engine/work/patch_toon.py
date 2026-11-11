import re
s=open('toon_base.js').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)>=1, a[:60]
    s=s.replace(a,b,cnt)
# 1. custom arms
rep("    const drawArm = (a)=>{", """    if (opts.arms) { arms.length = 0;
      for (const [i, side] of [[0, -1], [1, 1]]) { const sp = opts.arms[i];
        if (!sp) { arms.push({ pts: hang(side, 0), front: false }); continue; }
        const S = sh(side); arms.push({ pts: [S, [S[0] + side * sp[0] * u, S[1] + sp[1] * u], [S[0] + side * sp[2] * u, S[1] + sp[3] * u]], front: !!sp[4] }); } }
    if (opts.holdBack) opts.holdBack(p, arms[0].pts[2], arms[1].pts[2], u, HH);
    const drawArm = (a)=>{""")
# 2. hold hook before head
rep("    const Ah = A + headTilt, [cpx, cpy] = rotAbout([", """    if (opts.hold) opts.hold(p, arms[0].pts[2], arms[1].pts[2], u, HH);
    const Ah = A + headTilt, [cpx, cpy] = rotAbout([""",1)
# 3. beards + head info, first bodyFront occurrence only
rep("""    hatOn(p, o, hp, H, 300, hc, light, seed, facing, false);
    const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
    faceFront(p, 300, hc, W, expr, facing, look, lid, brim, skin, o.moustache, o.build === "stout");""",
"""    if (o.mutton) for (const s2 of [-1, 1]) { p.ell(300 + s2 * 0.8 * H.a + 7 * u * facing, hc + 0.3 * H.b, 0.32 * H.a, 0.5 * H.b, o.mutton, 2.6 * u); }
    if (o.beard) { const bl = (opts.beardLen ?? o.beardLen ?? 0.3) * HH, fx = 300 + 7 * u * facing;
      const L0 = [fx - 0.92 * H.a, hc + 0.05 * H.b], R0b = [fx + 0.92 * H.a, hc + 0.05 * H.b];
      const tip = [fx + 4 * u * Math.sin((opts.seed || 1) * 3), hc + H.b + bl];
      const pts = [...curve(L0, [fx - 0.75 * H.a, hc + 0.8 * H.b + bl * 0.45], tip, 14), ...curve(tip, [fx + 0.75 * H.a, hc + 0.8 * H.b + bl * 0.45], R0b, 14),
        ...curve(R0b, [fx, hc + 0.28 * H.b], L0, 10)];
      p.shadedFill(pts, o.beard, mul(o.beard, SH_FELT), light, H.a, 0.35); p.poly(pts, null, 4 * u);
      for (let k = 0; k < 4; k++) p.stroke([[fx + (k - 1.5) * 14 * u, hc + 0.75 * H.b], [fx + (k - 1.5) * 12 * u, hc + 0.75 * H.b + bl * 0.6]], 1.4 * u, mul(o.beard, SH_FELT));
      p.ell(fx + 8 * u * facing / 7, hc + 0.42 * H.b, 13 * u, 9 * u, skin, 0); }
    hatOn(p, o, hp, H, 300, hc, light, seed, facing, false);
    const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
    faceFront(p, 300, hc, W, expr, facing, look, lid, brim, skin, o.moustache, o.build === "stout");
    if (opts.out) Object.assign(opts.out, { hc, W, HH, chin, crown, cx: 300, rot: p.rot });""")
# 4. hats
rep("""    } else if (o.hat === "bonnet") {""", """    } else if (o.hat === "straw") {
        const yb = crown + 0.24 * HH, col = "#e6c066";
        const [bx, by] = R([[cx, yb]])[0];
        p.ell(bx, by, 0.66 * W, 0.075 * HH, col, ow, 0, 360, a * 180 / Math.PI);
        p.ell(bx, by, 0.66 * W, 0.075 * HH, mul(col, [0.86, 0.8, 0.72]), 0, 0, 180, a * 180 / Math.PI);
        const body = R([...sag(yb, 0.31 * W).reverse(), [cx - 0.27 * W, yb - 0.3 * HH], [cx + 0.27 * W, yb - 0.32 * HH]]);
        p.shadedFill(body, col, mul(col, SH_FELT), light, 0.3 * W, 0.4);
        p.clip(body, () => p.band(R([[cx - 0.4 * W, yb - 0.06 * HH], [cx + 0.4 * W, yb - 0.06 * HH]]), "#b8402e", 0.08 * HH, 1 * u));
        p.poly(body, null, ow);
        for (let k = 0; k < 5; k++) p.stroke(R([[cx - 0.2 * W + k * 0.1 * W, yb - 0.12 * HH], [cx - 0.19 * W + k * 0.1 * W, yb - 0.28 * HH]]), 1.2 * u, mul(col, [0.8, 0.72, 0.6]));
    } else if (o.hat === "kepi") {
        const yb = crown + 0.27 * HH, col = "#2b4478";
        const body = R([...sag(yb, 0.47 * W).reverse(), [cx - 0.40 * W, yb - 0.36 * HH], [cx + 0.47 * W, yb - 0.27 * HH]]);
        p.shadedFill(body, col, mul(col, SH_FELT), light, 0.45 * W, 0.4);
        p.clip(body, () => p.band(R([[cx - 0.6 * W, yb - 0.05 * HH], [cx + 0.6 * W, yb - 0.05 * HH]]), "#1d2f55", 0.1 * HH, 1 * u));
        p.poly(body, null, ow);
        const [px, py] = R([[cx + 3 * u * facing, yb + 3 * u]])[0];
        p.ell(px, py, 34 * u, 0.05 * HH, "#16171b", 2.5 * u, 0, 180, a * 180 / Math.PI);
        const [bx, by] = R([[cx, yb - 0.1 * HH]])[0]; p.ell(bx, by, 4 * u, 4 * u, "#e8c45a", 1.5 * u);
    } else if (o.hat === "bicorne") {
        const yb = crown + 0.2 * HH, col = "#1d1f2a", pts = [];
        for (let i = 0; i <= 30; i++) { const t = Math.PI + Math.PI * i / 30; pts.push([cx + 0.82 * W * Math.cos(t), yb + 0.36 * HH * Math.sin(t)]); }
        const body = R([...pts, [cx + 0.82 * W, yb + 0.04 * HH], [cx - 0.82 * W, yb + 0.04 * HH]]);
        p.shadedFill(body, col, mul(col, SH_FELT), light, 0.8 * W, 0.4);
        p.stroke(R(pts.map(([x, y]) => [cx + (x - cx) * 0.93, yb + (y - yb) * 0.9])), 2.6 * u, "#e8c45a");
        p.poly(body, null, ow);
        const [bx, by] = R([[cx + 0.18 * W, yb - 0.17 * HH]])[0]; p.ell(bx, by, 9 * u, 9 * u, "#e9edf3", 2 * u); p.ell(bx, by, 4 * u, 4 * u, "#b8402e", 1.2 * u);
    } else if (o.hat === "pickel") {
        const yb = crown + 0.3 * HH, col = "#1b1c22", pts = [];
        for (let i = 0; i <= 30; i++) { const t = Math.PI + Math.PI * i / 30; pts.push([cx + 0.53 * W * Math.cos(t), yb + 0.44 * HH * Math.sin(t)]); }
        const [sx, sy] = R([[cx, yb - 0.44 * HH]])[0];
        p.poly(R([[cx - 6 * u, yb - 0.42 * HH], [cx, yb - 0.78 * HH], [cx + 6 * u, yb - 0.42 * HH]]), "#e8c45a", 2.5 * u);
        const body = R([...pts, [cx + 0.55 * W, yb + 0.03 * HH], [cx - 0.55 * W, yb + 0.03 * HH]]);
        p.shadedFill(body, col, "#0e0f13", light, 0.5 * W, 0.4); p.poly(body, null, ow);
        p.ell(sx, sy + 2 * u, 8 * u, 4 * u, "#e8c45a", 2 * u);
        const [bx, by] = R([[cx, yb - 0.18 * HH]])[0]; p.ell(bx, by, 11 * u, 13 * u, "#e8c45a", 2.2 * u);
        const [vx, vy] = R([[cx + 3 * u * facing, yb + 3 * u]])[0]; p.ell(vx, vy, 36 * u, 0.045 * HH, "#0e0f13", 2.5 * u, 0, 180, a * 180 / Math.PI);
    } else if (o.hat === "sailor") {
        const yb = crown + 0.2 * HH;
        const body = R([...sag(yb, 0.42 * W).reverse(), [cx - 0.45 * W, yb - 0.16 * HH], [cx + 0.45 * W, yb - 0.16 * HH]]);
        p.shadedFill(body, "#f4f2ea", "#c9cbd8", light, 0.45 * W, 0.4);
        p.clip(body, () => p.band(R([[cx - 0.6 * W, yb - 0.03 * HH], [cx + 0.6 * W, yb - 0.03 * HH]]), "#24407a", 0.07 * HH, 1 * u));
        p.poly(body, null, ow);
    } else if (o.hat === "bonnet") {""")
open('toon.js','w').write(s)
print('ok')
