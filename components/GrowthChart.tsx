"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Script from "next/script";
import { useEffect, useRef } from "react";

import { monthData } from "@/lib/month-data";

declare global {
  interface Window {
    THREE?: any;
  }
}

interface GrowthChartProps {
  theme: string;
  requestsLength: number;
}

/**
 * "Monthly report" 3D bar chart — ported 1:1 from Component.initThree /
 * teardownThree. Same three.js r128 build (loaded from the original CDN),
 * orthographic camera, custom navy/gold shader, eased entrance + idle-settle
 * loop, and live theme reaction. Reacts to `theme` and `requestsLength`
 * exactly as the source componentDidUpdate did.
 */
export default function GrowthChart({
  theme,
  requestsLength,
}: GrowthChartProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const threeRef = useRef<any>(null);
  const waitRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const themeRef = useRef(theme);
  const lenRef = useRef(requestsLength);
  const initRef = useRef<() => void>(() => {});

  useEffect(() => {
    const initThree = () => {
      if (threeRef.current) return;
      const el = elRef.current;
      if (!el) return;
      if (!window.THREE) {
        if (!waitRef.current) {
          waitRef.current = setInterval(() => {
            if (window.THREE) {
              if (waitRef.current) clearInterval(waitRef.current);
              waitRef.current = null;
              initThree();
            }
          }, 150);
        }
        return;
      }
      const THREE = window.THREE,
        PAD = 18;
      const data = monthData(lenRef.current),
        nb = data.dim;
      const W = el.clientWidth || 640,
        H = el.clientHeight || 220;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(W, H);
      renderer.domElement.style.display = "block";
      el.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const cam = new THREE.OrthographicCamera(0, W, H, 0, -10, 10);
      const gridGeo = new THREE.BufferGeometry();
      const gl: number[] = [];
      for (let k = 1; k <= 4; k++) {
        const yy = PAD + (H - 2 * PAD) * (k / 5);
        gl.push(0, yy, -1, W, yy, -1);
      }
      gridGeo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(gl, 3),
      );
      const gridMat = new THREE.LineBasicMaterial({
        color: 0xeceef3,
        transparent: true,
        opacity: 1,
      });
      scene.add(new THREE.LineSegments(gridGeo, gridMat));
      // bars: 4 verts per bar, av(0 base /1 top), acol(0 navy /1 gold for today)
      const pos = new Float32Array(nb * 4 * 3),
        av = new Float32Array(nb * 4),
        acol = new Float32Array(nb * 4);
      for (let i = 0; i < nb; i++) {
        const isToday = i === data.today - 1 ? 1 : 0;
        av[i * 4] = 0;
        av[i * 4 + 1] = 0;
        av[i * 4 + 2] = 1;
        av[i * 4 + 3] = 1;
        acol[i * 4] = isToday;
        acol[i * 4 + 1] = isToday;
        acol[i * 4 + 2] = isToday;
        acol[i * 4 + 3] = isToday;
      }
      const idx: number[] = [];
      for (let i = 0; i < nb; i++) {
        const b = i * 4;
        idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
      }
      const barGeo = new THREE.BufferGeometry();
      barGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      barGeo.setAttribute("av", new THREE.BufferAttribute(av, 1));
      barGeo.setAttribute("acol", new THREE.BufferAttribute(acol, 1));
      barGeo.setIndex(idx);
      const barMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uPrimary: { value: new THREE.Color(0x02066f) },
          uGold: { value: new THREE.Color(0xfac800) },
        },
        vertexShader:
          "attribute float av; attribute float acol; varying float vv; varying float vc; void main(){ vv=av; vc=acol; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
        fragmentShader:
          "uniform vec3 uPrimary; uniform vec3 uGold; varying float vv; varying float vc; void main(){ vec3 c=mix(uPrimary,uGold,vc); gl_FragColor=vec4(c,1.0); }",
      });
      scene.add(new THREE.Mesh(barGeo, barMat));
      const T: any = {
        renderer,
        scene,
        cam,
        barMat,
        gridMat,
        gridGeo,
        pos,
        barGeo,
        el,
        nb,
        PAD,
        W,
        H,
        data,
        heights: new Array(nb).fill(0),
        prog: 0,
        prevTheme: themeRef.current,
        stable: 0,
        raf: null,
        last: performance.now(),
      };
      threeRef.current = T;
      const layout = () => {
        const w = T.W,
          h = T.H,
          P = T.PAD,
          n = T.nb,
          innerH = h - 2 * P,
          slot = w / n,
          barW = slot * 0.58,
          base = P;
        const max = T.data.max;
        for (let i = 0; i < n; i++) {
          const xc = slot * (i + 0.5),
            x0 = xc - barW / 2,
            x1 = xc + barW / 2;
          const target = (T.data.counts[i] / max) * innerH;
          const cur = T.heights[i];
          const top = base + cur;
          const o = i * 12;
          T.pos[o] = x0;
          T.pos[o + 1] = base;
          T.pos[o + 2] = 0;
          T.pos[o + 3] = x1;
          T.pos[o + 4] = base;
          T.pos[o + 5] = 0;
          T.pos[o + 6] = x1;
          T.pos[o + 7] = top;
          T.pos[o + 8] = 0;
          T.pos[o + 9] = x0;
          T.pos[o + 10] = top;
          T.pos[o + 11] = 0;
          T._targets = T._targets || new Array(n);
          T._targets[i] = target;
        }
        T.barGeo.attributes.position.needsUpdate = true;
      };
      T.ro = new ResizeObserver(() => {
        const w = el.clientWidth || T.W,
          h = el.clientHeight || T.H;
        T.W = w;
        T.H = h;
        renderer.setSize(w, h);
        cam.right = w;
        cam.top = h;
        cam.updateProjectionMatrix();
        const g: number[] = [];
        for (let k = 1; k <= 4; k++) {
          const yy = T.PAD + (h - 2 * T.PAD) * (k / 5);
          g.push(0, yy, -1, w, yy, -1);
        }
        T.gridGeo.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(g, 3),
        );
        layout();
        T.wake();
      });
      T.ro.observe(el);
      const draw = () => {
        if (threeRef.current !== T) return;
        const dark = themeRef.current === "dark";
        T.barMat.uniforms.uPrimary.value.set(dark ? 0x5c70f0 : 0x02066f);
        T.gridMat.color.set(dark ? 0x28314c : 0xeceef3);
        layout();
        // ease heights toward targets (entrance + data updates), then idle
        let maxDelta = 0;
        const tg = T._targets || [];
        for (let i = 0; i < T.nb; i++) {
          const d = tg[i] - T.heights[i];
          T.heights[i] += d * 0.16;
          maxDelta = Math.max(maxDelta, Math.abs(d));
        }
        layout();
        T.renderer.render(T.scene, T.cam);
        const themeChanged = themeRef.current !== T.prevTheme;
        T.prevTheme = themeRef.current;
        if (maxDelta < 0.05 && !themeChanged) {
          T.stable++;
        } else {
          T.stable = 0;
        }
        if (T.stable > 6) {
          T.raf = null;
          return;
        } // settle then stop (no constant motion)
        T.raf = requestAnimationFrame(draw);
      };
      T.wake = () => {
        T.data = monthData(lenRef.current);
        T.stable = 0;
        if (!T.raf) T.raf = requestAnimationFrame(draw);
      };
      T.wake();
    };

    const teardownThree = () => {
      const T = threeRef.current;
      if (!T) return;
      threeRef.current = null;
      if (T.raf) cancelAnimationFrame(T.raf);
      if (T.ro) T.ro.disconnect();
      try {
        T.renderer.forceContextLoss();
        T.renderer.dispose();
        const c = T.renderer.domElement;
        if (c && c.parentNode) c.parentNode.removeChild(c);
      } catch {
        /* ignore */
      }
    };

    initRef.current = initThree;
    initThree();
    return () => {
      if (waitRef.current) {
        clearInterval(waitRef.current);
        waitRef.current = null;
      }
      teardownThree();
    };
  }, []);

  // Keep refs current + mirror componentDidUpdate: refresh data + wake on
  // theme / data change. Refs are written here (in an effect), never in render.
  useEffect(() => {
    themeRef.current = theme;
    lenRef.current = requestsLength;
    const T = threeRef.current;
    if (T) {
      T.data = monthData(requestsLength);
      if (T.wake) T.wake();
    }
    initRef.current();
  }, [theme, requestsLength]);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        strategy="afterInteractive"
      />
      <div
        id="growth3d"
        ref={elRef}
        style={{ width: "100%", height: "220px", marginTop: "12px" }}
      />
    </>
  );
}
