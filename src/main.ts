import { BufferAttribute, DynamicDrawUsage, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, WebGLRenderer } from "three";
import "./style.css";
import vertexSource from "./vertex.glsl";
import fragSource from "./fragment.glsl";

const mainCanvas = document.querySelector("#mainCanvas") as HTMLCanvasElement | null;

if(mainCanvas === null){
	throw new Error("Could not find mainCanvas in document!");
}

const renderer = new WebGLRenderer({
	canvas: mainCanvas,
	antialias: true,
	preserveDrawingBuffer: true,
	powerPreference: "high-performance"
});

const scene = new Scene();

const shaderMaterial = new ShaderMaterial({vertexShader: vertexSource, fragmentShader: fragSource});
shaderMaterial.uniforms = {
	time: {value: 0},
	screenSize: {value: [0, 0]}
};

const quadGeometry = new PlaneGeometry(2, 2, 1, 1);
quadGeometry.setAttribute("screenPos", new BufferAttribute(new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]), 2));
(quadGeometry.attributes.screenPos as BufferAttribute).usage = DynamicDrawUsage;

const fullscreenQuad = new Mesh(quadGeometry, shaderMaterial);
scene.add(fullscreenQuad);

const camera = new OrthographicCamera(0, 1, 0, 1, 0, 1);

const resizeObserver = new ResizeObserver((entries, observer) => {
	for(const entry of entries){
		const width = entry.devicePixelContentBoxSize[0].inlineSize;
		const height = entry.devicePixelContentBoxSize[0].blockSize;

		renderer.setSize(width, height, false);
	}
});

resizeObserver.observe(mainCanvas);

function step(time: DOMHighResTimeStamp){
	requestAnimationFrame(step);

	const screenSize = renderer.getSize(new Vector2());
	
	const screenPosAttrib = (quadGeometry.attributes.screenPos as BufferAttribute);
	screenPosAttrib.set(new Float32Array([0, 0, screenSize.x, 0, 0, screenSize.y, screenSize.x, screenSize.y]));
	screenPosAttrib.needsUpdate = true;

	shaderMaterial.uniforms.time.value = time;
	shaderMaterial.uniforms.screenSize.value = screenSize;

	renderer.clear();
	renderer.render(scene, camera);
}

requestAnimationFrame(step);