import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
//import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/RGBELoader.js';
import { FlakesTexture } from 'https://unpkg.com/three@0.126.1/examples/jsm/textures/FlakesTexture.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

window.addEventListener( 'resize', onWindowResize );

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );
			}

camera.position.z = 10;

// const light = new THREE.AmbientLight( 0x404040 ); // soft white light
// scene.add( light );

// const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
// scene.add( directionalLight );
scene.background = new THREE.Color(0xffffff);

camera.position.z = 5
camera.position.y = 0

let materialArray = [];
let texture_bk = new THREE.TextureLoader().load('three/skybox/back.png')
let texture_bm = new THREE.TextureLoader().load('three/skybox/bottom.png')
let texture_ft = new THREE.TextureLoader().load('three/skybox/front.png')
let texture_lt = new THREE.TextureLoader().load('three/skybox/left.png')
let texture_rt = new THREE.TextureLoader().load('three/skybox/right.png')
let texture_tp = new THREE.TextureLoader().load('three/skybox/top.png')

materialArray.push(new THREE.MeshBasicMaterial({map: texture_bk}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_bm}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_ft}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_lt}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_rt}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_tp}));

for(let i=0;i<6;i++){
	materialArray[i].side = THREE.BackSide;
}

const spheregeometry = new THREE.SphereGeometry(0.1,64,64);
const material = new THREE.MeshPhysicalMaterial();
const sphere = new THREE.Mesh( spheregeometry, material );

const spheres = [];
let countstars = 0;


for(let i=0;i<600;i++){
	const sphere = new THREE.Mesh( spheregeometry, material );
	sphere.position.set(
		Math.random()*200-100,
		Math.random()*200-100,
		Math.random()*200-200
		)
	scene.add( sphere );
	spheres.push( sphere );
}

function spawnstars(argument) {
	const sphere = new THREE.Mesh( spheregeometry, material );
	sphere.position.set(
		Math.random()*200-100,
		Math.random()*200-100,
		Math.random()*200-300
		)
	scene.add( sphere );
	spheres.push( sphere );
}
spawnstars();
setInterval( function() {
    spawnstars();
}, 50);


const pointlight = new THREE.PointLight(0xFFFFFF,1);
pointlight.position.set(200,200,200);

scene.add( pointlight );



const geometry = new THREE.BoxGeometry(100,100,100);
const cube = new THREE.Mesh( geometry, materialArray );
scene.add( cube );

function animate() {
	requestAnimationFrame( animate );

	cube.rotation.y += 0.0002;
	cube.rotation.z += 0.0002;

	for ( let i = 0, il = spheres.length; i < il; i ++ ) {

					const sphere = spheres[ i ];

					sphere.position.z += 0.1;

				}
	for ( let i = 0, il = spheres.length; i < il; i ++ ) {

	const sphere = spheres[ i ];

	if (sphere.position.z > 0) {
	scene.remove(sphere);
	}
}
			

	renderer.render( scene, camera );
}
animate();