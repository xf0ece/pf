<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - materials - modified</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>

	<body>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> wegbl - modified material.
			<a href="http://graphics.cs.williams.edu/data/meshes.xml#14" target="_blank" rel="noopener">Lee Perry-Smith</a> head.
		</div>

		<script type="module">

			import * as THREE from '../build/three.module.js';

			import Stats from './jsm/libs/stats.module.js';

			import { OrbitControls } from './jsm/controls/OrbitControls.js';
			import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';

			let camera, scene, renderer, stats;

			init();
			animate();

			function init() {

				camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 0.1, 100 );
				camera.position.z = 20;

				scene = new THREE.Scene();

				const loader = new GLTFLoader();
				loader.load( 'models/gltf/LeePerrySmith/LeePerrySmith.glb', function ( gltf ) {

					const geometry = gltf.scene.children[ 0 ].geometry;

					let mesh = new THREE.Mesh( geometry, buildTwistMaterial( 2.0 ) );
					mesh.position.x = - 3.5;
					mesh.position.y = - 0.5;
					scene.add( mesh );

					mesh = new THREE.Mesh( geometry, buildTwistMaterial( - 2.0 ) );
					mesh.position.x = 3.5;
					mesh.position.y = - 0.5;
					scene.add( mesh );

				} );

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				const controls = new OrbitControls( camera, renderer.domElement );
				controls.minDistance = 10;
				controls.maxDistance = 50;

				//

				stats = new Stats();
				document.body.appendChild( stats.dom );

				// EVENTS

				window.addEventListener( 'resize', onWindowResize );

			}

			function buildTwistMaterial( amount ) {

				const material = new THREE.MeshNormalMaterial();
				material.onBeforeCompile = function ( shader ) {

					shader.uniforms.time = { value: 0 };

					shader.vertexShader = 'uniform float time;\n' + shader.vertexShader;
					shader.vertexShader = shader.vertexShader.replace(
						'#include <begin_vertex>',
						[
							`float theta = sin( time + position.y ) / ${ amount.toFixed( 1 ) };`,
							'float c = cos( theta );',
							'float s = sin( theta );',
							'mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );',
							'vec3 transformed = vec3( position ) * m;',
							'vNormal = vNormal * m;'
						].join( '\n' )
					);

					material.userData.shader = shader;

				};

				// Make sure WebGLRenderer doesnt reuse a single program

				material.customProgramCacheKey = function () {

					return amount;

				};

				return material;

			}

			//

			function onWindowResize() {

				const width = window.innerWidth;
				const height = window.innerHeight;

				camera.aspect = width / height;
				camera.updateProjectionMatrix();

				renderer.setSize( width, height );

			}

			//

			function animate() {

				requestAnimationFrame( animate );

				render();

				stats.update();

			}

			function render() {

				scene.traverse( function ( child ) {

					if ( child.isMesh ) {

						const shader = child.material.userData.shader;

						if ( shader ) {

							shader.uniforms.time.value = performance.now() / 1000;

						}

					}

				} );

				renderer.render( scene, camera );

			}

		</script>

	</body>
</html>
