import{A as m,a as g,S as w,T as u,b as S,d as a,e as b,C as f}from"./background.71470582.js";import{f as A}from"./flameDemon.c9374d22.js";m.registerPlugin(g);const T=800,E=500,d=new m({width:T,height:E,autoStart:!0});document.body.appendChild(d.view);const o=d.shadows.container;function i(e,n){const s=new f;if(n){const h=new a(n);h.parentGroup=d.shadows.casterGroup,s.addChild(h)}const C=new a(e);return s.addChild(C),s}const r=new w(700,1);r.position.set(450,150);o.addChild(r);const v=u.from(S),x=new a(v);o.addChild(x);const t=u.from(A);t.baseTexture.scaleMode=b.NEAREST;const c=i(t,t);c.position.set(100,100);c.scale.set(3);o.addChild(c);const p=i(t,t);p.position.set(500,100);p.scale.set(3);o.addChild(p);const l=i(t,t);l.position.set(300,200);l.scale.set(3);o.addChild(l);o.interactive=!0;o.on("mousemove",e=>{r.position.copyFrom(e.data.global)});o.on("pointerdown",e=>{const n=new w(700,.7);n.position.copyFrom(e.data.global),o.addChild(n)});