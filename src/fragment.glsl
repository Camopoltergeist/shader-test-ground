precision highp float;

in vec2 v_UV;
in vec2 v_ScreenPos;

uniform float time;
uniform vec2 screenSize;

void main(){
	vec2 posDiff = v_ScreenPos - (screenSize / 2.f);

	vec2 powPos = pow(posDiff, vec2(2));
	float dist = sqrt(powPos.x + powPos.y);

	dist /= 200.f + sin(time / 100.f) * 10.f;

	dist = step(dist, 1.f);

	vec3 color = vec3(0, 0.5, 1);

	gl_FragColor = vec4(color * dist, 1);
}