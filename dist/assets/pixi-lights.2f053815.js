import{G as v,T as c,Q as Y,M as z,f as J,P as y,g as E,h as j,i as k,B as W,D as b,j as O,A as P,a as X,b as q,C as _,d as L,S as K}from"./background.4520fc63.js";function Z(a,t=40,i,e){i=i||new Float32Array((t+1)*2),e=e||new Uint16Array(t+1);const r=Math.PI*2/t;let o=-1;e[++o]=o;for(let s=0;s<=t;++s){const l=s*2,f=r*s;i[l]=Math.cos(f)*a.radius,i[l+1]=Math.sin(f)*a.radius,e[++o]=o}return e[o]=1,{vertices:i,indices:e}}const m=new v(0,!1),A=new v(0,!1),H=new v(0,!1);m.useRenderTexture=!0;A.useRenderTexture=!0;class u{constructor(){u.prototype.__init.call(this),u.prototype.__init2.call(this),u.prototype.__init3.call(this)}__init(){this.lastLayer=null}__init2(){this.diffuseTexture=null}__init3(){this.normalTexture=null}check(t){if(this.lastLayer===t)return;this.lastLayer=t;const i=t._activeStageParent,e=t;if(this.diffuseTexture=c.WHITE,this.normalTexture=c.WHITE,e.diffuseTexture&&e.normalTexture)this.diffuseTexture=e.diffuseTexture,this.normalTexture=e.normalTexture;else for(let r=0;r<i._activeLayers.length;r++){const o=i._activeLayers[r];o.group===A&&(this.normalTexture=o.getRenderTexture()),o.group===m&&(this.diffuseTexture=o.getRenderTexture())}}static __initStatic(){this._instance=new u}}u.__initStatic();class p extends Y{update(t){const i=this.buffers[0].data,e=t.x,r=t.y,o=t.x+t.width,s=t.y+t.height;(i[0]!==e||i[1]!==r||i[4]!==o||i[5]!==s)&&(i[0]=i[6]=e,i[1]=i[3]=r,i[2]=i[4]=o,i[5]=i[7]=s,this.buffers[0].update())}static __initStatic(){this._instance=new p}}p.__initStatic();class D extends j{constructor(t=5066073,i=.8,e,r,o){let s,l=!1;r?s=new k().addAttribute("aVertexPosition",r).addIndex(o):(s=p._instance,l=!0),super(s,e),this.blendMode=W.ADD,this.drawMode=l?b.TRIANGLE_STRIP:b.TRIANGLES,this.lightHeight=.075,this.falloff=[.75,3,20],this.useViewportQuad=l,t===null&&(t=5066073),this.tint=t,this.brightness=i,this.parentGroup=H}get color(){return this.tint}set color(t){this.tint=t}get falloff(){return this.material.uniforms.uLightFalloff}set falloff(t){this.material.uniforms.uLightFalloff[0]=t[0],this.material.uniforms.uLightFalloff[1]=t[1],this.material.uniforms.uLightFalloff[2]=t[2]}syncShader(t){const{uniforms:i}=this.shader;i.uViewSize[0]=t.screen.width,i.uViewSize[1]=t.screen.height,i.uViewPixels[0]=t.view.width,i.uViewPixels[1]=t.view.height,i.uFlipY=!t.framebuffer.current,i.uSampler=u._instance.diffuseTexture,i.uNormalSampler=u._instance.normalTexture,i.uUseViewportQuad=this.useViewportQuad,i.uBrightness=this.brightness}_renderDefault(t){if(!this._activeParentLayer)return;u._instance.check(this._activeParentLayer);const i=this.shader;i.alpha=this.worldAlpha,i.update&&i.update(),t.batch.flush(),i.uniforms.translationMatrix=this.transform.worldTransform.toArray(!0),this.useViewportQuad&&this.geometry.update(t.screen),this.syncShader(t),t.shader.bind(i),t.state.set(this.state),t.geometry.bind(this.geometry,i),t.geometry.draw(this.drawMode,this.size,this.start,this.geometry.instanceCount)}}const M=`vec3 intensity = diffuse * attenuation;
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
`,R=`// normalize vectors
vec3 N = normalize(normalColor.xyz * 2.0 - 1.0);
vec3 L = normalize(lightVector);

// pre-multiply light color with intensity
// then perform "N dot L" to determine our diffuse
vec3 diffuse = uColor.rgb * uBrightness * max(dot(N, L), 0.0);
`,S=`vec2 texCoord = gl_FragCoord.xy / uViewPixels;
texCoord.y = (1.0 - texCoord.y) * uFlipY + texCoord.y * (1.0 - uFlipY); // FBOs positions are flipped.
`,V=`vec4 normalColor = texture2D(uNormalSampler, texCoord);
normalColor.g = 1.0 - normalColor.g; // Green layer is flipped Y coords.

// bail out early when normal has no data
if (normalColor.a == 0.0) discard;
`,$=`attribute vec2 aVertexPosition;

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
`;class h extends z{constructor(t){const i={translationMatrix:J.IDENTITY.toArray(!0),uNormalSampler:c.WHITE,uViewSize:new Float32Array(2),uViewPixels:new Float32Array(2),uLightFalloff:new Float32Array([0,0,0]),uLightHeight:.075,uBrightness:1,uUseViewportQuad:!0};t.uniforms&&Object.assign(i,t.uniforms),super(c.WHITE,{...t,uniforms:i})}static __initStatic(){this.defaultVertexSrc=$}}h.__initStatic();var tt=`precision highp float;

${F}

void main(void)
{
${S}
${V}
    // simplified lambert shading that makes assumptions for ambient color
    vec3 diffuse = uColor.rgb * uBrightness;
    vec4 diffuseColor = texture2D(uSampler, texCoord);
    vec3 finalColor = diffuseColor.rgb * diffuse;

    gl_FragColor = vec4(finalColor, diffuseColor.a);
}
`;class x extends h{constructor(){super({program:x._program})}static __initStatic(){this._program=new y(h.defaultVertexSrc,tt)}}x.__initStatic();class it extends D{constructor(t=16777215,i=.5){super(t,i,new x)}}var et=`precision highp float;

// imports the common uniforms like samplers, and ambient color
${F}

uniform float uLightRadius;

void main()
{
${S}
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

${R}

    // calculate attenuation
    float attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));

${M}
}
`;class g extends h{constructor(){super({program:g._program,uniforms:{uLightRadius:1}})}static __initStatic(){this._program=new y(h.defaultVertexSrc,et)}}g.__initStatic();class ot extends D{constructor(t=16777215,i=1,e=1/0){if(e!==1/0){const r=new O(0,0,e),{vertices:o,indices:s}=Z(r);super(t,i,new g,o,s),this.drawMode=b.TRIANGLE_FAN}else super(t,i,new g);this.shaderName="pointLightShader",this.radius=e}get radius(){return this.material.uniforms.uLightRadius}set radius(t){this.material.uniforms.uLightRadius=t}}var rt=`precision highp float;

// imports the common uniforms like samplers, and ambient/light color
${F}

uniform vec2 uLightDirection;

void main()
{
${S}
${V}

    // the directional vector of the light
    vec3 lightVector = vec3(uLightDirection, uLightHeight);

    // compute Distance
    float D = length(lightVector);

${R}

    // calculate attenuation
    float attenuation = 1.0;

${M}
}
`;class w extends h{constructor(){super({program:w._program,uniforms:{uLightRadius:1,uLightDirection:new E}})}static __initStatic(){this._program=new y(h.defaultVertexSrc,rt)}}w.__initStatic();class st extends D{constructor(t=16777215,i=1,e){super(t,i,new w),this.target=e}syncShader(t){super.syncShader(t);const e=this.material.uniforms.uLightDirection,r=this.worldTransform,o=this.target.worldTransform;let s,l;o?(s=o.tx,l=o.ty):(s=this.target.x,l=this.target.y),e.x=r.tx-s,e.y=r.ty-l;const f=Math.sqrt(e.x*e.x+e.y*e.y);e.x/=f,e.y/=f}}var at="/pixi-shadows/dist/assets/backgroundNormalMap.ca4cfe31.jpg",nt="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAA8CAYAAACtrX6oAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMjHxIGmVAAAEDklEQVR4Xu3c/2tVdRzH8f6C3W2plV6wgkIqjOiHYqBE+yWC6IcIIgmkSDKJCBvZbbvnfXcXaLNlZd4v2/XsbrVv11F3zpaueWE2hwqW2lQM0xTnvtztdu+KyLBXn3u3lc73HRto7PM57x8e3B/u4XLP68k53AuXexsAo9FEAI6SCWBLOoj+I0Gkqz/hRzGJJ1mrTto5qtK12HWhDiO1AUz4HBB4RdiGJ2mrkzefL21jx0gUP3fYyFTtwAQ5IHAB2VgRrodnpAn0a7O5Us3YMtaC3qMxpDdHVFyHBC6uspGLHGqEZ+gr0HjcPGNx+Ec70PzTHgzV7UKG6pwTOBvX5ZuKHGyC52I3aKjHLJd78On5BI517EfK3+K8wLnIU4/31rTC8/2PoBOnjFF5/CTiPccxWNONFDU7M/BMpVv7QbV/GMEf/h19H53FqK9LAk+7i1rgoSsggvb8dBWHSQWmryXwNBfV4zUaZQfTjQRmrCT1YYsZS0cSmLGS9rFj6aiS/kacxjCizmmcYiqwreIGlO38KCbh4mY9QF3sWDqSwAwJbAgubpZbDcGNpSMJzJDAhuDiZi2lVnYsHUngPLixdCSB8+DG0pEEzqOc/mIH040EnqGIGnKPb1GGHUw3EjgPCWwALuy01ynJDqYbCZzHKzTIDqYbCZyHBDbAIn+UjZv1Ip1jB9ONowOXXbaxrLqeDfw8nWEH082sgT3JneyPqOdlPKo0gNLMcwtALvKHDg287nQkN4K1QOPcLNdGLqLJ2/ZT9AM7mG5mDezyBfFc3024ijVQdsnG8o//u4JL6Qg7mG5mDVxAQXWyEZS0fYHy8ckhbsnVnH3N7G38OurWzh17C2Wv5CWbJwOX0HfsYLqZU+AiasWDgU5sutTEDvO/SzaCLsZ4pztBA128/gO8AwdBe4/mlO0+hHU0zI6lozkHXqIOKP3gHLyHEv+OcZ09x0Bt6oMJp/E8qE59r+RsS4NqMjfa+hv7hsX8zCvwKvXlv5yusi8kFiYJbDgJbDgJbDgJbDgJbDgJbDgJbDgJbDgJbDgJbDgJbDgJbDgJbDgJbDgJbDgJbDgJbDgJbLi5B/Z2o3TDICrW/glae0VoolL1al8/jOGKb2cL3Ab3m/ux5vEBeO8/ARLa8CmRRwfwy/peFTj7h+BM4OL3Ynjk6V5sdCdg3dENElqpXpbAwdV9GHu3/cbALiuCpa+2Y809e1GxeDcshYRWfErI/Q0uvBRHxpoRuPAdG4+VtGPTohis4jaQ0NL7SuLhL5HaGL0msBWE+4UoXr6zCVZhA0ho7bPFn+Pssw3IeKcCF74dwpMP2fC4dsJyRUBCa1WqY+d9NlJvhCYD3/1MGBtuD8MqCIGEEbYVhXHyiTAmvNvxDzxHPA45XemFAAAAAElFTkSuQmCC",lt="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAA8CAYAAACtrX6oAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMjHxIGmVAAABA0lEQVR4Xu3RUQGAABCDUFPZv4CZzgIkYHy8ABvP3bm93y3jU0xg9BI+xQRGL+FTTGD0Ej7FBEYv4VNMYPQSPsUERi/hU0xg9BI+xQRGL+FTTGD0Ej7FBEYv4VNMYPQSPsUERi/hU0xg9BI+xQRGL+FTTGD0Ej7FBEYv4VNMYPQSPsUERi/hU0xg9BI+xQRGL+FTTGD0Ej7FBEYv4VNMYPQSPsUERi/hU0xg9BI+xQRGL5k/wK7AcgWWK7BcgeUKLFdguQLLFViuwHIFliuwXIHlCixXYLkCyxVYrsByBZYrsFyB5QosV2C5AssVWK7AcgWWK7BcgeUKLFdguQLLFVjtux8BAmltzUXBNQAAAABJRU5ErkJggg==";P.registerPlugin(X);const ut=800,ct=500,B=new P({width:ut,height:ct,fov:{pixiLights:{diffuseGroup:m,lightGroup:H,normalGroup:A}}});document.body.appendChild(B.view);const n=B.shadows.container;function C(a,t,i){const e=new _,r=new L(a);r.parentGroup=m,e.addChild(r);const o=new L(t);if(o.parentGroup=A,e.addChild(o),i){const s=new L(i);s.parentGroup=B.shadows.casterGroup,e.addChild(s)}return e}function I(a,t,i){const e=new _,r=new ot(i,t);e.addChild(r);const o=new K(a,.7);return e.addChild(o),e}n.addChild(new it(null,1));n.addChild(new st(null,1,new E(0,1)));const G=I(700,4,16777215);G.position.set(300,300);n.addChild(G);const ht=c.from(q),dt=c.from(at),ft=C(ht,dt);n.addChild(ft);const d=c.from(lt),T=c.from(nt),Q=C(d,T,d);Q.position.set(100,200);n.addChild(Q);const U=C(d,T,d);U.position.set(500,200);n.addChild(U);const N=C(d,T,d);N.position.set(300,300);n.addChild(N);n.interactive=!0;n.on("mousemove",a=>{G.position.copyFrom(a.data.global)});n.on("pointerdown",a=>{const t=I(450,2,16777215);t.position.copyFrom(a.data.global),n.addChild(t)});
