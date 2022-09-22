precision highp float;

in vec2 v_UV;
in vec2 v_ScreenPos;

uniform float time;
uniform vec2 screenSize;

void main(){
	gl_FragColor = vec4(v_UV, 0, 1);
}