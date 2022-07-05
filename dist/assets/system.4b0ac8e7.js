import{A as y,a as M,T as b,b as h,d as k,S as A,C as R}from"./pixi.94a595d1.js";import{G as O}from"./dat.gui.module.6914edc7.js";y.registerPlugin(M);const d={followMouse:!0,shadowX:450,shadowY:150},_=800,x=700,s=new y({width:_,height:x});document.body.appendChild(s.view);const n=s.shadows.container;s.shadows.filter.useShadowCasterAsOverlay=!1;function c(o,v,S){const l=new R;if(v){const r=new h(v);r.parentGroup=s.shadows.casterGroup,l.addChild(r)}if(S){const r=new h(S);r.parentGroup=s.shadows.overlayGroup,l.addChild(r)}const G=new h(o);return l.addChild(G),l}const E=b.from("../../assets/background.jpg"),F=new h(E);n.addChild(F);const a=b.from("../../assets/flameDemon.png");a.baseTexture.scaleMode=k.NEAREST;const m=c(a,a,a);m.position.set(100,100);m.scale.set(3);n.addChild(m);const u=c(a,a,a);u.position.set(500,100);u.scale.set(3);n.addChild(u);const C=c(a,a,a);C.position.set(300,200);C.scale.set(3);n.addChild(C);const e=new A(300,1,5);e.position.set(d.shadowX,d.shadowY);n.addChild(e);function f(){const o=e.shadowMapResultSprite;o.x=0,o.y=500,o.width=800,o.height=200,s.stage.addChild(o)}f();n.interactive=!0;n.on("mousemove",o=>{d.followMouse?e.position.copyFrom(o.data.global):(e.position.x=d.shadowX,e.position.y=d.shadowY)});const g=new O,p=g.addFolder("Demo options");p.open();p.add(d,"followMouse");p.add(d,"shadowX",0,800);p.add(d,"shadowY",0,600);const t=g.addFolder("Shadow properties");t.open();t.add(e,"range",50,1e3);t.add(e,"intensity",0,3);t.add(e,"pointCount",1,50,1).onChange(f);t.add(e,"scatterRange",0,50);t.add(e,"radialResolution",100,1500,1).onChange(f);t.add(e,"depthResolution",.1,3);t.add(e,"darkenOverlay");const w=g.addFolder("Analyze");w.open();const i={};i["show mask"]=!1;i["remove casters"]=!1;i["remove overlays"]=!1;w.add(i,"show mask").onChange(o=>{o?s.stage.addChild(s.shadows.filter._maskResultSprite):s.stage.removeChild(s.shadows.filter._maskResultSprite)});w.add(i,"remove casters").onChange(o=>{s.shadows.filter._shadowCasterContainer.visible=!o});w.add(i,"remove overlays").onChange(o=>{s.shadows.filter._shadowOverlayContainer.visible=!o});