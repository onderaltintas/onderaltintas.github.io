"use strict";

// DEĞİŞİKLİK: canvas değişkenini global kapsamda tanımla (önceki hata çözümü)
var canvas = null; // Canvas global olarak tanımlandı, main içinde atanacak

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  canvas = document.querySelector("#c"); // DEĞİŞİKLİK: canvas global değişkene atanıyor
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }
  gl.enable(gl.DEPTH_TEST);
  gl.textureEnabled = true;
  var tLoaded = false;
  loadTexture(gl, "world.jpg", function(result){
      tLoaded = result;
  });

  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);
  gl.useProgram(program);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "vertex");
  var normalAttributeLocation = gl.getAttribLocation(program, "normal");
  var texCoordAttributeLocation = gl.getAttribLocation(program, "texCoord");

  // lookup uniforms
  var projectionMatrixLocation = gl.getUniformLocation(program, "projection");
  var modelviewMatrixLocation = gl.getUniformLocation(program, "modelView");
  var sphere = new Sphere(gl, 1.0, 60, 60, true);

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(now) {
    if(!tLoaded){
      requestAnimationFrame(drawScene);
      return;
    }
    
    if(autoRotate){
      // DEĞİŞİKLİK: Otomatik rotasyon, rotationMatrix üzerine y-ekseni etrafında uygulanıyor
      rotationMatrix = m4.multiply(m4.axisRotation([0, 1, 0], toRadian(autoRotateAngle / zoomFactor)), rotationMatrix);
    }

    resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.textureEnabled = true;
    gl.clearColor(0,0,0,1);
    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.enableVertexAttribArray(texCoordAttributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.vboVertex);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 32, 12);
    gl.vertexAttribPointer(texCoordAttributeSavings, 2, gl.FLOAT, false, 32, 24);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.vboIndex);

    // Compute the matrices
    var projectionMatrix = m4.perspective(Math.PI/180*45, canvas.width/canvas.height, 0.1, 1000);
    var modelView = m4.identity();
    // DEĞİŞİKLİK: -90 derece x-rotasyonu kaldırıldı, kuzey kutbu yukarıda olacak şekilde
    modelView = m4.multiply(modelView, m4.inverse(m4.lookAt([0, 0, 5], [0, 0, 0], [0, 1, 0])));
    modelView = m4.multiply(modelView, rotationMatrix); // Raycasting ile hesaplanan rotasyon
    modelView = m4.scale(modelView, zoomFactor, zoomFactor, zoomFactor);
    // Set the matrix.
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
    gl.uniformMatrix4fv(modelviewMatrixLocation, false, modelView);

    // Draw in red
    gl.drawElements(gl.TRIANGLES, sphere.getIndexCount(), gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(drawScene);
  }

  //canvas!
  function resizeCanvasToDisplaySize(canvas) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    // Check if the canvas is not the same size.
    const needResize = canvas.width  !== displayWidth ||
                       canvas.height !== displayHeight;

    if (needResize) {
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }

    return needResize;
  }
}

main();

//texture!
function loadTexture(gl, textureUrl, callback){
  // Create a texture.
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Fill the texture with a 1x1 blue pixel.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));
  // Asynchronously load an image
  var image = new Image();
  image.src = textureUrl;
  image.addEventListener('load', function() {
    // Now that the image2D has loaded make copy it to the texture.
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    callback(true);
  });  
}

// DEĞİŞİKLİK: m4.js'de olmayan dot, cross ve subtractVectors için yardımcı fonksiyonlar
function vectorDot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function vectorCross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function vectorSubtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function vectorNormalize(v) {
  const length = Math.sqrt(vectorDot(v, v));
  return length > 0 ? [v[0] / length, v[1] / length, v[2] / length] : v;
}

//mouse!
var mouseDragging = false;
var firstPosX = 0;
var firstPosY = 0;
var zoomFactor = 1;
var autoRotateAngle = 0.01;
var autoRotate = true;
var rotateTimeouts = [];
// DEĞİŞİKLİK: Raycasting için başlangıç ve mevcut noktaları saklama
var startPoint = null; // Küre üzerindeki başlangıç noktası (3D vektör)
var rotationMatrix = m4.identity(); // Mevcut rotasyonu saklamak için

window.addEventListener("mousedown", mouseDown, false);
window.addEventListener("mousemove", mouseMove, false);
window.addEventListener("mouseup", mouseUp, false);
window.addEventListener('wheel', wheel);

function mouseDown(event) {
  firstPosX = event.clientX;
  firstPosY = event.clientY;
  stopRotate();
  mouseDragging = true;
  // DEĞİŞİKLİK: Raycasting ile fare pozisyonunu küre üzerindeki 3D noktaya eşle
  startPoint = getRaycastPoint(event.clientX, event.clientY);
}

function mouseUp(event) {
  mouseDragging = false;
  // DEĞİŞİKLİK: Raycasting ile son noktayı güncelle
  startPoint = getRaycastPoint(event.clientX, event.clientY);
  startRotate();
}

function mouseMove(event) {
  if (mouseDragging) {
    // DEĞİŞİKLİK: Raycasting ile mevcut fare pozisyonunu al ve rotasyonu hesapla
    const currentPoint = getRaycastPoint(event.clientX, event.clientY);
    if (startPoint && currentPoint) {
      // Başlangıç ve mevcut noktalar arasında rotasyon hesapla
      const axis = vectorCross(startPoint, currentPoint); // Dönüş ekseni
      const dot = vectorDot(startPoint, currentPoint); // Açıyı hesaplamak için
      const angle = Math.acos(Math.min(Math.max(dot, -1), 1)); // Açı (radyan)

      if (angle > 0.0001) { // Küçük hareketleri yoksay
        const rotation = m4.axisRotation(axis, angle); // Rotasyon matrisi
        rotationMatrix = m4.multiply(rotation, rotationMatrix); // Mevcut rotasyonu güncelle
      }

      startPoint = currentPoint; // Yeni başlangıç noktası
    }
  }
}

function wheel(event) {
  zoomFactor -= event.deltaY / 750;
  zoomFactor = zoomFactor > 4.5 ? 4.5 : zoomFactor;
  zoomFactor = zoomFactor <= 0.2 ? 0.2 : zoomFactor;
  stopRotate();
  startRotate();
}

function stopRotate() {
  while(rotateTimeouts.length) {
    clearTimeout(rotateTimeouts.pop());
  }
  autoRotate = false;
}

function startRotate() {
  var rotateTimeout = setTimeout(function(){
    autoRotate = true;
  }, 2000);
  rotateTimeouts.push(rotateTimeout);
}

//geometry!
function toRadian(value) {
  return value / 57.29577951308232; // DEĞİŞİKLİK: Hassas radyan dönüşümü
}

// DEĞİŞİKLİK: Raycasting ile fare pozisyonunu küre üzerindeki 3D noktaya eşleme, m4.multiplyVector yerine m4.transformVector kullanıldı
function getRaycastPoint(clientX, clientY) {
  // Fare koordinatlarını normalize et: [-1, 1]
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / canvas.clientWidth) * 2 - 1;
  const y = -((clientY - rect.top) / canvas.clientHeight) * 2 + 1;

  // Kamera ve projeksiyon parametreleri
  const aspect = canvas.width / canvas.height;
  const fov = Math.PI / 180 * 45; // 45 derece FOV
  const near = 0.1;
  const far = 1000;
  const projectionMatrix = m4.perspective(fov, aspect, near, far);
  const viewMatrix = m4.inverse(m4.lookAt([0, 0, 5], [0, 0, 0], [0, 1, 0]));

  // Ekran koordinatlarından dünya koordinatlarına ışın oluştur
  const rayClip = [x, y, -1, 1]; // Clip uzayında ışın başlangıcı
  const rayEye = m4.transformVector(m4.inverse(projectionMatrix), rayClip); // DEĞİŞİKLİK: m4.multiplyVector yerine m4.transformVector
  rayEye[2] = -1; // İleri yön
  rayEye[3] = 0; // Yön vektörü için
  const rayWorld = m4.transformVector(m4.inverse(viewMatrix), rayEye); // DEĞİŞİKLİK: m4.multiplyVector yerine m4.transformVector
  const rayDir = vectorNormalize([rayWorld[0], rayWorld[1], rayWorld[2]]); // Normalleştirilmiş yön
  const rayOrigin = [0, 0, 5]; // Kamera pozisyonu

  // Küre ile kesişim hesapla (radius=1)
  const sphereCenter = [0, 0, 0];
  const oc = vectorSubtract(rayOrigin, sphereCenter); // DEĞİŞİKLİK: m4.subtractVectors yerine vectorSubtract
  const a = vectorDot(rayDir, rayDir); // DEĞİŞİKLİK: m4.dot yerine vectorDot
  const b = 2 * vectorDot(oc, rayDir); // DEĞİŞİKLİK: m4.dot yerine vectorDot
  const c = vectorDot(oc, oc) - 1; // radius^2
  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) return null; // Kesişim yok

  const t = (-b - Math.sqrt(discriminant)) / (2 * a); // Yakın kesişim noktası
  if (t < 0) return null; // Kesişim kamera arkasında

  const intersection = [
    rayOrigin[0] + t * rayDir[0],
    rayOrigin[1] + t * rayDir[1],
    rayOrigin[2] + t * rayDir[2]
  ];

  return vectorNormalize(intersection); // DEĞİŞİKLİK: m4.normalize yerine vectorNormalize
}
