const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const rounded = function(number){
    return +number.toFixed(2);
}

import { OrbitControls } from 'controls/OrbitControls.js/';

scene.background = new THREE.Color(0xffffff);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//camera



//

// animate //

function animate() {
	requestAnimationFrame(animate);
	document.getElementById("info").innerHTML = "Cube X: " + rounded(camera.rotation.x);

	plane.position.y = -2;

	renderer.render(scene, camera);
}

//

const cube_geometry = new THREE.BoxGeometry(1,2,1);
const plane_geometry = new THREE.PlaneGeometry(100);


const cube_material = new THREE.MeshPhongMaterial( {color: 0xFFFFFF} );


const cube = new THREE.Mesh( cube_geometry, cube_material );
const plane = new THREE.Mesh( plane_geometry, cube_material );

const directionalLight = new THREE.DirectionalLight( 0xFFFFFF, 0.5 );

scene.add( directionalLight );
scene.add( cube );
scene.add( plane );

cube.rotation.x == 50

camera.position.z = 5;

const controls = new OrbitControls( camera, renderer.domElement );

//controls.update() must be called after any manual changes to the camera's transform
camera.position.set( 0, 20, 100 );
controls.update();

animate();

