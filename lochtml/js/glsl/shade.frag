#extension GL_OES_standard_derivatives : enable

precision mediump float;

varying highp vec2 vTexCoord;
uniform float uContourWidth;
uniform float uAlphaMultiplier;
uniform float uNumBins;
uniform float uUseDensity;
uniform float uContour;
uniform float uPassValue;
uniform float uNumPassValues;
uniform float uMaxf;
uniform sampler2D uSamplerF;
uniform sampler2D uSamplerColorScale;
uniform sampler2D uSamplerFinal;


void main(void) {

  vec2 coord = vTexCoord.xy;
  float f = texture2D(uSamplerF, coord).r;
  vec4 newcolor;

  if(uUseDensity > 0.0){
    newcolor = texture2D(uSamplerColorScale, vec2(f, 0));
    newcolor.a *= uAlphaMultiplier;
    newcolor.a = clamp(newcolor.a, 0.0,1.0);
    gl_FragColor = vec4(newcolor.rgb*newcolor.a, newcolor.a); //TODO: multiply color by alpha?

    //Density uses rgb to calculate the df. Groups use alpha.
    //Set the density alpha to 0 so it doesnt affect the df calculation
    newcolor.a = 0.0;

    //gl_FragColor = vec4(1, 0, 0, 1);
		
  }
  else{
    vec4 oldcolor = texture2D(uSamplerFinal, vTexCoord);
    //oldcolor.a = 1.0;
    //gl_FragColor = oldcolor+vec4(0.25, 0.0, 0.0, 0);
    //return;

    //vec3 color = texture2D(uSamplerColorScale, vec2(uPassValue/(uNumPassValues+1.0) + f/(uNumPassValues+1.0), 0)).rgb;
    newcolor = texture2D(uSamplerColorScale, vec2(uPassValue/(uNumPassValues+1.0), 0));
    newcolor.a = texture2D(uSamplerColorScale, vec2(f, 0)).a;
    //newcolor.a = newcolor.a*0.5;

    //TODO: use premultipled alpha? http://en.wikibooks.org/wiki/GLSL_Programming/Unity/Transparency
    vec4 finalcolor;
    finalcolor.rgb = newcolor.a * newcolor.rgb + (1.0 - newcolor.a) * oldcolor.rgb;
    finalcolor.a = newcolor.a + oldcolor.a;
    //newcolor.a = 0.5;
    gl_FragColor = finalcolor;
  }
  
  float fnextx = texture2D(uSamplerF, coord + vec2(uContourWidth/uNumBins, 0.0)).r;
  float fnexty = texture2D(uSamplerF, coord + vec2(0.0, uContourWidth/uNumBins)).r;
  float fprevx = texture2D(uSamplerF, coord - vec2(0.0, uContourWidth/uNumBins)).r;
  float fprevy = texture2D(uSamplerF, coord - vec2(uContourWidth/uNumBins, 0.0)).r;
  vec4 colornextx = texture2D(uSamplerColorScale, vec2(fnextx, 0)).rgba;
  vec4 colornexty = texture2D(uSamplerColorScale, vec2(fnexty, 0)).rgba;
  vec4 colorprevx = texture2D(uSamplerColorScale, vec2(fprevx, 0)).rgba;
  vec4 colorprevy = texture2D(uSamplerColorScale, vec2(fprevy, 0)).rgba;
  vec4 dfnextx = abs(newcolor.rgba - colornextx.rgba);
  vec4 dfnexty = abs(newcolor.rgba - colornexty.rgba);
  vec4 dfprevx = abs(newcolor.rgba - colorprevx.rgba);
  vec4 dfprevy = abs(newcolor.rgba - colorprevy.rgba);
  if(dfnextx.r*dfnextx.g*dfnextx.b*dfnextx.a > 0.0
  	 || dfprevx.r*dfprevx.g*dfprevx.b*dfprevx.a > 0.0
  	 || dfnexty.r*dfnexty.g*dfnexty.b*dfnexty.a > 0.0
  	 || dfprevy.r*dfprevy.g*dfprevy.b*dfprevy.a > 0.0)
  	gl_FragColor = vec4(0,0,0,1.0);
	
}
