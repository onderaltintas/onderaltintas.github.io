"use strict";
function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#c");
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
      xAngle = xAngle + autoRotateAngle / zoomFactor;
      lastXAngle += autoRotateAngle / zoomFactor;
      // DEĞİŞİKLİK: Otomatik rotasyonun mevcut rotationMatrix'e uygulanması için güncelleme
      rotationMatrix = m4.multiply(m4.axisRotation([0, 1, 0], toRadian(autoRotateAngle / zoomFactor)), rotationMatrix);
    }

    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
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
    gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 32, 24);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.vboIndex);

    // Compute the matrices
    var projectionMatrix = m4.perspective(Math.PI/180*45, gl.canvas.width/gl.canvas.height, 0.1, 1000);
    var modelView = m4.identity();
    modelView = m4.multiply(modelView, m4.inverse(m4.lookAt([0,0,5], [0,0,0],[0,1,0])));
    // DEĞİŞİKLİK: xAngle ve yAngle yerine rotationMatrix kullanılarak daha hassas rotasyon
    modelView = m4.multiply(modelView, rotationMatrix);
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
    // Now that the image has loaded make copy it to the texture.
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    callback(true);
  });  
}

//mouse!
var mouseDragging = false;
var firstPosX = 0;
var firstPosY = 0;
var xAngle = 0;
var yAngle = 0;
var lastXAngle = 0;
var lastYAngle = 0;
var zoomFactor = 1;
var autoRotateAngle = 0.01;
var autoRotate = true;
var rotateTimeouts = [];
// DEĞİŞİKLİK: Küre üzerindeki başlangıç noktasını ve rotasyonu saklamak için yeni değişkenler
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
  // DEĞİŞİKLİK: Fare pozisyonunu sanal küre yüzeyine projekte et
  const mouse = getMouseOnSphere(event.clientX, event.clientY);
  startPoint = mouse; // Başlangıç noktası (örn. İstanbul) 3D vektör olarak saklanır
}

function mouseUp(event) {
  mouseDragging = false;
  // DEĞİŞİKLİK: lastXAngle ve lastYAngle kaldırıldı, çünkü rotationMatrix zaten rotasyonu tutuyor
  startRotate();
}

function mouseMove(event) {
  if (mouseDragging) {
    // DEĞİŞİKLİK: Fare hareketini arcball rotasyonuyla işlemek için yeni mantık
    const mouse = getMouseOnSphere(event.clientX, event.clientY);
    if (startPoint && mouse) {
      // Başlangıç ve mevcut noktalar arasında rotasyon hesapla
      const axis = m4.cross(startPoint, mouse); // Dönüş ekseni
      const dot = m4.dot(startPoint, mouse); // Açıyı hesaplamak için
      const angle = Math.acos(Math.min(Math.max(dot, -1), 1)); // Açı (radyan)

      if (angle > 0.0001) { // Küçük hareketleri yoksay
        const rotation = m4.axisRotation(axis, angle); // Quaternion benzeri rotasyon matrisi
        rotationMatrix = m4.multiply(rotation, rotationMatrix); // Mevcut rotasyonu güncelle
      }

      startPoint = mouse; // Yeni başlangıç noktası
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
  return value/57.29577951308232; // DEĞİŞİKLİK: Daha hassas radyan dönüşümü için sabit kullanıldı
}

// DEĞİŞİKLİK: Fare pozisyonunu sanal küre yüzeyine projekte eden yeni fonksiyon
function getMouseOnSphere(clientX, clientY) {
  // Fare koordinatlarını normalize et: [-1, 1]
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / canvas.clientWidth) * 2 - 1;
  const y = -((clientY - rect.top) / canvas.clientHeight) * 2 + 1;

  // Sanal küre yüzeyine projekte et (kamera z=5 mesafede)
  const mag = x * x + y * y;
  if (mag > 1) return null; // Fare küre dışında

  const zCoord = Math.sqrt(1 - mag); // Küre yüzeyinde z koordinatı
  const point = [x, y, zCoord]; // Küre üzerindeki 3D nokta
  const length = Math.sqrt(m4.dot(point, point));
  return length > 0 ? m4.scale(point, 1 / length) : point; // Normalleştir
}
