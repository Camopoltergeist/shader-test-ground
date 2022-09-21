import { Color, DoubleSide, Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget } from "three";
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

const fullscreenQuad = new Mesh(new PlaneGeometry(2, 2, 1, 1), shaderMaterial);
console.log(fullscreenQuad.geometry);
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

	renderer.clear();
	renderer.render(scene, camera);
}

requestAnimationFrame(step);