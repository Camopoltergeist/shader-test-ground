in vec2 screenPos;

out vec2 v_UV;
out vec2 v_ScreenPos;

void main(){
	gl_Position = vec4(position, 1);
	v_UV = uv;
	v_ScreenPos = screenPos;
}