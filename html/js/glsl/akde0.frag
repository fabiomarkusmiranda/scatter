precision mediump float;

varying highp vec2 vTexCoord;
uniform sampler2D uSampler0;
uniform float uMinValue;
uniform float uMaxValue;
uniform float uNumBins;
uniform float uWindowSize;
uniform float uIsFirstPass;
uniform float uBandwidth;

const int maxloop = 50000;
const float std = 1.0;
//const float maxvalue = 1.0;

float gauss(float r){
  return 0.3989422804 * exp( (- r*r) / 2.0);
  //return (1.0 / (sqrt(6.28318530718 * std * std))) * exp(- (r*r) / (2.0 * std * std) );
}

void main(void) {

  vec2 coord2D = vTexCoord;
  vec4 values = texture2D(uSampler0, coord2D);

  if(uIsFirstPass > 0.0){
    values.r *= (uMaxValue - uMinValue);
  }

  float h = uBandwidth;
  float oneoverh = 1.0 / h;
  //float x = coord2D.x;
  float f = 0.0;
  float W = 1.0;
  for(int i=0;i<maxloop; i++){
    if(i >= int(uWindowSize)) break;

    int index = i - int(uWindowSize)/2;
    coord2D = vec2(vTexCoord.x + uIsFirstPass * (float(index) / uNumBins), vTexCoord.y + (1.0 - uIsFirstPass) * (float(index) / uNumBins)); //make sure to access not the next texel, but the next bin

    vec4 valuesi = texture2D(uSampler0, coord2D);
    if(uIsFirstPass > 0.0){
      valuesi.r *= (uMaxValue - uMinValue);
      valuesi.g = valuesi.r;
    }

    if(coord2D.x >= 0.0 && coord2D.y >= 0.0 && coord2D.x <= 1.0 && coord2D.y <= 1.0){ //TODO: use clamp_to_border, instead of this if

      float k = gauss((float(index) / uNumBins) * oneoverh);
      //k = valuesi.g * oneoverh * k;
      f += k;
      W += valuesi.r;
    }
  }

  //if(W > 0.0)
    //f = f / W;
  //else
    //f = 0.0;

  if(uIsFirstPass <= 0.0)
    f = (1.0 / (h * h * W)) * f;

  gl_FragColor = vec4(values.r, f, 1, 1); //count, f

}