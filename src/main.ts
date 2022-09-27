import { BufferAttribute, Color, DataArrayTexture, DataTexture, DoubleSide, DynamicDrawUsage, LinearFilter, Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, RedFormat, Scene, ShaderMaterial, TextureLoader, UnsignedByteType, Vector2, WebGLRenderer } from "three";
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

const data = new Uint8Array([0]);
const dataTex = new DataTexture(data, 1, 1);
dataTex.format = RedFormat;
dataTex.type = UnsignedByteType;
dataTex.needsUpdate = true;

shaderMaterial.uniforms = {
	time: {value: 0},
	screenSize: {value: [0, 0]},
	fftTex: {value: dataTex}
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

let audioContext: AudioContext | null = null;
let sourceNode: AudioBufferSourceNode | null = null;
let analyzerNode: AnalyserNode | null = null;
let gainNode: GainNode | null = null;

const fileSelector = document.createElement("input");
fileSelector.type = "file";
fileSelector.addEventListener("input", async (e) => {
	if(fileSelector.files === null){
		return;
	}

	const file = fileSelector.files[0];
	const fileBuffer = await file.arrayBuffer();
	
	if(audioContext === null){
		audioContext = new AudioContext({
			latencyHint: "interactive"
		});

		gainNode = audioContext.createGain();
		gainNode.connect(audioContext.destination);
		gainNode.gain.value = 0.6;

		analyzerNode = audioContext.createAnalyser();
		analyzerNode.fftSize = 4096;
		analyzerNode.connect(gainNode);
	}

	const audioBuffer = await audioContext.decodeAudioData(fileBuffer);

	if(sourceNode !== null){
		sourceNode.disconnect();
		sourceNode = null;
	}

	sourceNode = audioContext.createBufferSource();
	sourceNode.connect(analyzerNode as AnalyserNode);
	sourceNode.loop = true;
	sourceNode.buffer = audioBuffer;
	sourceNode.start();
});

mainCanvas.addEventListener("click", (e) => {
	fileSelector.click();
});

function step(time: DOMHighResTimeStamp){
	requestAnimationFrame(step);

	const screenSize = renderer.getSize(new Vector2());
	
	const screenPosAttrib = (quadGeometry.attributes.screenPos as BufferAttribute);
	screenPosAttrib.set(new Float32Array([0, 0, screenSize.x, 0, 0, screenSize.y, screenSize.x, screenSize.y]));
	screenPosAttrib.needsUpdate = true;

	shaderMaterial.uniforms.time.value = time;
	shaderMaterial.uniforms.screenSize.value = screenSize;
	
	if(analyzerNode !== null){
		const fftData = new Uint8Array(analyzerNode.fftSize);
		analyzerNode.getByteFrequencyData(fftData);
		shaderMaterial.uniforms.fftTex.value.dispose();

		const dataTex = new DataTexture(fftData, fftData.length, 1);
		dataTex.type = UnsignedByteType;
		dataTex.format = RedFormat;
		dataTex.internalFormat = "R8";
		dataTex.minFilter = LinearFilter;
		dataTex.magFilter = LinearFilter;
		dataTex.needsUpdate = true;

		shaderMaterial.uniforms.fftTex.value = dataTex;
	}

	renderer.clear();
	renderer.render(scene, camera);
}

requestAnimationFrame(step);