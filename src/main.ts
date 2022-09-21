import { OrthographicCamera, Scene, WebGLRenderer } from "three";
import "./style.css";

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
const camera = new OrthographicCamera();

const resizeObserver = new ResizeObserver((entries, observer) => {
	for(const entry of entries){
		const width = entry.devicePixelContentBoxSize[0].inlineSize;
		const height = entry.devicePixelContentBoxSize[0].blockSize;

		renderer.setSize(width, height, false);

		camera.right = width;
		camera.bottom = height;

	}
});

resizeObserver.observe(mainCanvas);

function step(time: DOMHighResTimeStamp){
	requestAnimationFrame(step);

	renderer.clear();
	renderer.render(scene, camera);
}

requestAnimationFrame(step);