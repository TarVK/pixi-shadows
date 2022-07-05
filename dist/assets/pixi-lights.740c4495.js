import{G as v,T as c,Q,M as H,e as j,P as L,f as A,g as U,h as Y,B as O,D as S,i as W,A as N,a as q,C as k,b as C,S as J}from"./pixi.94a595d1.js";function K(a,t=40,i,e){i=i||new Float32Array((t+1)*2),e=e||new Uint16Array(t+1);const r=Math.PI*2/t;let o=-1;e[++o]=o;for(let s=0;s<=t;++s){const l=s*2,d=r*s;i[l]=Math.cos(d)*a.radius,i[l+1]=Math.sin(d)*a.radius,e[++o]=o}return e[o]=1,{vertices:i,indices:e}}const g=new v(0,!1),p=new v(0,!1),z=new v(0,!1);g.useRenderTexture=!0;p.useRenderTexture=!0;class u{constructor(){u.prototype.__init.call(this),u.prototype.__init2.call(this),u.prototype.__init3.call(this)}__init(){this.lastLayer=null}__init2(){this.diffuseTexture=null}__init3(){this.normalTexture=null}check(t){if(this.lastLayer===t)return;this.lastLayer=t;const i=t._activeStageParent,e=t;if(this.diffuseTexture=c.WHITE,this.normalTexture=c.WHITE,e.diffuseTexture&&e.normalTexture)this.diffuseTexture=e.diffuseTexture,this.normalTexture=e.normalTexture;else for(let r=0;r<i._activeLayers.length;r++){const o=i._activeLayers[r];o.group===p&&(this.normalTexture=o.getRenderTexture()),o.group===g&&(this.diffuseTexture=o.getRenderTexture())}}static __initStatic(){this._instance=new u}}u.__initStatic();class x extends Q{update(t){const i=this.buffers[0].data,e=t.x,r=t.y,o=t.x+t.width,s=t.y+t.height;(i[0]!==e||i[1]!==r||i[4]!==o||i[5]!==s)&&(i[0]=i[6]=e,i[1]=i[3]=r,i[2]=i[4]=o,i[5]=i[7]=s,this.buffers[0].update())}static __initStatic(){this._instance=new x}}x.__initStatic();class b extends U{constructor(t=5066073,i=.8,e,r,o){let s,l=!1;r?s=new Y().addAttribute("aVertexPosition",r).addIndex(o):(s=x._instance,l=!0),super(s,e),this.blendMode=O.ADD,this.drawMode=l?S.TRIANGLE_STRIP:S.TRIANGLES,this.lightHeight=.075,this.falloff=[.75,3,20],this.useViewportQuad=l,t===null&&(t=5066073),this.tint=t,this.brightness=i,this.parentGroup=z}get color(){return this.tint}set color(t){this.tint=t}get falloff(){return this.material.uniforms.uLightFalloff}set falloff(t){this.material.uniforms.uLightFalloff[0]=t[0],this.material.uniforms.uLightFalloff[1]=t[1],this.material.uniforms.uLightFalloff[2]=t[2]}syncShader(t){const{uniforms:i}=this.shader;i.uViewSize[0]=t.screen.width,i.uViewSize[1]=t.screen.height,i.uViewPixels[0]=t.view.width,i.uViewPixels[1]=t.view.height,i.uFlipY=!t.framebuffer.current,i.uSampler=u._instance.diffuseTexture,i.uNormalSampler=u._instance.normalTexture,i.uUseViewportQuad=this.useViewportQuad,i.uBrightness=this.brightness}_renderDefault(t){if(!this._activeParentLayer)return;u._instance.check(this._activeParentLayer);const i=this.shader;i.alpha=this.worldAlpha,i.update&&i.update(),t.batch.flush(),i.uniforms.translationMatrix=this.transform.worldTransform.toArray(!0),this.useViewportQuad&&this.geometry.update(t.screen),this.syncShader(t),t.shader.bind(i),t.state.set(this.state),t.geometry.bind(this.geometry,i),t.geometry.draw(this.drawMode,this.size,this.start,this.geometry.instanceCount)}}const G=`vec3 intensity = diffuse * attenuation;
vec4 diffuseColor = texture2D(uSampler, texCoord);
vec3 finalColor = diffuseColor.rgb * intensity;

gl_FragColor = vec4(finalColor, diffuseColor.a);
`,F=`uniform sampler2D uSampler;
uniform sampler2D uNormalSampler;

uniform mat3 translationMatrix;

uniform vec2 uViewPixels;   // size of the viewport, in pixels
uniform vec2 uViewSize;     // size of the viewport, in CSS

uniform vec4 uColor;   // light color, alpha channel used for intensity.
uniform float uBrightness;
uniform vec3 uLightFalloff; // light attenuation coefficients (constant, linear, quadratic)
uniform float uLightHeight; // light height above the viewport
uniform float uFlipY;             // whether we use renderTexture, FBO is flipped
`,I=`// normalize vectors
vec3 N = normalize(normalColor.xyz * 2.0 - 1.0);
vec3 L = normalize(lightVector);

// pre-multiply light color with intensity
// then perform "N dot L" to determine our diffuse
vec3 diffuse = uColor.rgb * uBrightness * max(dot(N, L), 0.0);
`,T=`vec2 texCoord = gl_FragCoord.xy / uViewPixels;
texCoord.y = (1.0 - texCoord.y) * uFlipY + texCoord.y * (1.0 - uFlipY); // FBOs positions are flipped.
`,V=`vec4 normalColor = texture2D(uNormalSampler, texCoord);
normalColor.g = 1.0 - normalColor.g; // Green layer is flipped Y coords.

// bail out early when normal has no data
if (normalColor.a == 0.0) discard;
`,X=`attribute vec2 aVertexPosition;

uniform bool uUseViewportQuad;
uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;

void main(void) {
    if (uUseViewportQuad) {
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
    else
    {
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
}
`;class h extends H{constructor(t){const i={translationMatrix:j.IDENTITY.toArray(!0),uNormalSampler:c.WHITE,uViewSize:new Float32Array(2),uViewPixels:new Float32Array(2),uLightFalloff:new Float32Array([0,0,0]),uLightHeight:.075,uBrightness:1,uUseViewportQuad:!0};t.uniforms&&Object.assign(i,t.uniforms),super(c.WHITE,{...t,uniforms:i})}static __initStatic(){this.defaultVertexSrc=X}}h.__initStatic();var Z=`precision highp float;

${F}

void main(void)
{
${T}
${V}
    // simplified lambert shading that makes assumptions for ambient color
    vec3 diffuse = uColor.rgb * uBrightness;
    vec4 diffuseColor = texture2D(uSampler, texCoord);
    vec3 finalColor = diffuseColor.rgb * diffuse;

    gl_FragColor = vec4(finalColor, diffuseColor.a);
}
`;class w extends h{constructor(){super({program:w._program})}static __initStatic(){this._program=new L(h.defaultVertexSrc,Z)}}w.__initStatic();class tt extends b{constructor(t=16777215,i=.5){super(t,i,new w)}}var it=`precision highp float;

// imports the common uniforms like samplers, and ambient color
${F}

uniform float uLightRadius;

void main()
{
${T}
${V}

    vec2 lightPosition = translationMatrix[2].xy / uViewSize;

    // the directional vector of the light
    vec3 lightVector = vec3(lightPosition - texCoord, uLightHeight);

    // correct for aspect ratio
    lightVector.x *= uViewSize.x / uViewSize.y;

    // compute Distance
    float D = length(lightVector);

    // bail out early when pixel outside of light sphere
    if (D > uLightRadius) discard;

${I}

    // calculate attenuation
    float attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));

${G}
}
`;class m extends h{constructor(){super({program:m._program,uniforms:{uLightRadius:1}})}static __initStatic(){this._program=new L(h.defaultVertexSrc,it)}}m.__initStatic();class et extends b{constructor(t=16777215,i=1,e=1/0){if(e!==1/0){const r=new W(0,0,e),{vertices:o,indices:s}=K(r);super(t,i,new m,o,s),this.drawMode=S.TRIANGLE_FAN}else super(t,i,new m);this.shaderName="pointLightShader",this.radius=e}get radius(){return this.material.uniforms.uLightRadius}set radius(t){this.material.uniforms.uLightRadius=t}}var ot=`precision highp float;

// imports the common uniforms like samplers, and ambient/light color
${F}

uniform vec2 uLightDirection;

void main()
{
${T}
${V}

    // the directional vector of the light
    vec3 lightVector = vec3(uLightDirection, uLightHeight);

    // compute Distance
    float D = length(lightVector);

${I}

    // calculate attenuation
    float attenuation = 1.0;

${G}
}
`;class y extends h{constructor(){super({program:y._program,uniforms:{uLightRadius:1,uLightDirection:new A}})}static __initStatic(){this._program=new L(h.defaultVertexSrc,ot)}}y.__initStatic();class rt extends b{constructor(t=16777215,i=1,e){super(t,i,new y),this.target=e}syncShader(t){super.syncShader(t);const e=this.material.uniforms.uLightDirection,r=this.worldTransform,o=this.target.worldTransform;let s,l;o?(s=o.tx,l=o.ty):(s=this.target.x,l=this.target.y),e.x=r.tx-s,e.y=r.ty-l;const d=Math.sqrt(e.x*e.x+e.y*e.y);e.x/=d,e.y/=d}}N.registerPlugin(q);const st=800,at=500,D=new N({width:st,height:at,fov:{pixiLights:{diffuseGroup:g,lightGroup:z,normalGroup:p}}});document.body.appendChild(D.view);const n=D.shadows.container;function _(a,t,i){const e=new k,r=new C(a);r.parentGroup=g,e.addChild(r);const o=new C(t);if(o.parentGroup=p,e.addChild(o),i){const s=new C(i);s.parentGroup=D.shadows.casterGroup,e.addChild(s)}return e}function R(a,t,i){const e=new k,r=new et(i,t);e.addChild(r);const o=new J(a,.7);return e.addChild(o),e}n.addChild(new tt(null,1));n.addChild(new rt(null,1,new A(0,1)));const M=R(700,4,16777215);M.position.set(300,300);n.addChild(M);const nt=c.from("../../assets/background.jpg"),lt=c.from("../../assets/backgroundNormalMap.jpg"),ut=_(nt,lt);n.addChild(ut);const f=c.from("../../assets/cutBlock.png"),P=c.from("../../assets/cutBlockNormalMap.png"),$=_(f,P,f);$.position.set(100,200);n.addChild($);const B=_(f,P,f);B.position.set(500,200);n.addChild(B);const E=_(f,P,f);E.position.set(300,300);n.addChild(E);n.interactive=!0;n.on("mousemove",a=>{M.position.copyFrom(a.data.global)});n.on("pointerdown",a=>{const t=R(450,2,16777215);t.position.copyFrom(a.data.global),n.addChild(t)});
