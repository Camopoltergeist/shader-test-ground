precision highp float;

#define PI 3.1415926538

in vec2 v_UV;
in vec2 v_ScreenPos;

uniform float time;
uniform vec2 screenSize;
uniform sampler2D fftTex;

const float radius = 400.0;
const float fftRange = 1.0 / 3.1;

float angle(vec2 a, vec2 b){
	vec2 diff = b - a;
	return atan(-diff.y, -diff.x) + PI;
}

void main(){
	vec2 screenCenter = screenSize / 2.0;
	float dist = distance(v_ScreenPos, screenCenter);
	dist /= radius;

	// float angel = angle(screenCenter, v_ScreenPos);
	float sampleT = dist;
	float fftU = mix(0.0, fftRange, sampleT);

	float amp = texture2D(fftTex, vec2(fftU, 0.0)).r;

	dist -= amp;
	dist = 1.0 - dist;
	dist *= amp;

	// float stemp = step(dist, 1.0);

	vec3 color = vec3(1, 0.5, 1);
	vec3 altColor = vec3(1, 1, 1);

	float altMod = max(0.0, dist - 1.0);

	altColor *= altMod;

	gl_FragColor = vec4(color * dist + altColor, 1);
}