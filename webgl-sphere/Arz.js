/**
 * @file Arz.js
 * @brief Provides a WebGL globe rendering API.
 * @author Önder ALTINTAŞ
 * @version 1.0.0
 */

import Sphere from './Sphere.js';
import ThreeDThings from './ThreeDThings.js'; 

class Arz {
    /**
     * @private
     * @type {HTMLCanvasElement}
     */
    canvas = null;

    /**
     * @private
     * @type {WebGLRenderingContext}
     */
    gl = null;

    /**
     * @private
     * @type {WebGLProgram}
     */
    program = null; // Earth program

    /**
     * @private
     * @type {Sphere}
     */
    sphere = null; // Earth sphere

    /**
     * @private
     * @type {WebGLTexture}
     */
    earthTexture = null; // Earth texture reference

    /**
     * @private
     * @type {WebGLUniformLocation}
     */
    projectionMatrixLocation = null;

    /**
     * @private
     * @type {WebGLUniformLocation}
     */
    modelviewMatrixLocation = null;

    /**
     * @private
     * @type {WebGLUniformLocation}
     */
    earthTextureUniformLocation = null; // Uniform for Earth texture

    /**
     * @private
     * @type {number}
     */
    positionAttributeLocation = null;

    /**
     * @private
     * @type {number}
     */
    normalAttributeLocation = null;

    /**
     * @private
     * @type {number}
     */
    texCoordAttributeLocation = null;

    /**
     * @private
     * @type {boolean}
     */
    textureLoaded = false; // Earth texture loaded flag

    /**
     * @private
     * @type {boolean}
     */
    mouseDragging = false;

    /**
     * @private
     * @type {number}
     */
    firstPosX = 0;

    /**
     * @private
     * @type {number}
     */
    firstPosY = 0;

    /**
     * @private
     * @type {number}
     */
    cameraDistance = 5; // Kamera başlangıç mesafesi.
    
    /**
     * @private
     * @type {number}
     */
    minCameraDistance = 1.5; // Minimum yakınlaştırma mesafesi
    
    /**
     * @private
     * @type {number}
     */
    maxCameraDistance = 10; // Maksimum uzaklaştırma mesafesi

    /**
     * @private
     * @type {number}
     */
    autoRotateAngle = 0.01;

    /**
     * @private
     * @type {boolean}
     */
    autoRotate = true;

    /**
     * @private
     * @type {Array<number>}
     */
    rotateTimeouts = [];

    /**
     * @private
     * @type {Array<number>|null}
     */
    startPoint = null; // 3D vector on the sphere surface

    /**
     * @private
     * @type {Array<number>}
     */
    rotationMatrix = null; // ThreeDThings.m4.identity() ile başlatılacak

    /**
     * @private
     * @type {ThreeDThings}
     */
    _threeDThings = null; // ThreeDThings instance'ı eklendi

    /**
     * @private
     * @type {number|null}
     */
    initialPinchDistance = null; // İki parmakla zoom için başlangıç mesafesi

    // --- Atmosfer için yeni özellikler ---
    /**
     * @private
     * @type {Sphere}
     */
    atmosphereSphere = null;

    /**
     * @private
     * @type {WebGLTexture}
     */
    atmosphereTexture = null;

    /**
     * @private
     * @type {boolean}
     */
    atmosphereTextureLoaded = false;

    /**
     * @private
     * @type {WebGLProgram}
     */
    atmosphereProgram = null;

    /**
     * @private
     * @type {number}
     */
    atmospherePositionAttributeLocation = null;
    /**
     * @private
     * @type {number}
     */
    atmosphereTexCoordAttributeLocation = null;
    /**
     * @private
     * @type {WebGLUniformLocation}
     */
    atmosphereProjectionMatrixLocation = null;
    /**
     * @private
     * @type {WebGLUniformLocation}
     */
    atmosphereModelviewMatrixLocation = null;
    /**
     * @private
     * @type {WebGLUniformLocation}
     */
    atmosphereUniformTextureLocation = null;
    /**
     * @private
     * @type {WebGLUniformLocation}
     */
    atmosphereCameraDistanceUniformLocation = null; // YENİ EKLENEN


    /**
     * Initializes the WebGL globe within a specified HTML element.
     * @param {string} selector - The CSS selector (e.g., "#myCanvas" or ".globe-container") for the canvas element.
     * @throws {Error} If the canvas element is not found or WebGL is not supported.
     */
    constructor(selector) {
        this.canvas = document.querySelector(selector);
        if (!this.canvas) {
            throw new Error(`Canvas element with selector "${selector}" not found.`);
        }

        this.gl = this.canvas.getContext("webgl", { alpha: false });
        if (!this.gl) {
            throw new Error("WebGL not supported.");
        }

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.textureEnabled = true;

        this._threeDThings = new ThreeDThings();
        this.rotationMatrix = this._threeDThings.m4.identity();
        this.rotationMatrix = this._threeDThings.m4.multiply(
            this.rotationMatrix,
            this._threeDThings.m4.xRotation(this.toRadian(-90))
        );

        // --- Dünya Dokusunu Yükle ---
        this.loadTexture(this.gl, "world.jpg", (result, texture) => {
            this.textureLoaded = result;
            this.earthTexture = texture;
        });

        // --- Bulut Dokusunu Yükle ---
        this.loadTexture(this.gl, "clouds.jpg", (result, texture) => {
            this.atmosphereTextureLoaded = result;
            this.atmosphereTexture = texture;
        });

        // --- Dünya Küresi ve Shader Ayarları ---
        this.program = this._threeDThings.webGLUtils.createProgramFromScripts(this.gl, ["vertex-shader-2d", "fragment-shader-2d"]);
        this.gl.useProgram(this.program);

        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, "vertex");
        this.normalAttributeLocation = this.gl.getAttribLocation(this.program, "normal");
        this.texCoordAttributeLocation = this.gl.getAttribLocation(this.program, "texCoord");

        this.projectionMatrixLocation = this.gl.getUniformLocation(this.program, "projection");
        this.modelviewMatrixLocation = this.gl.getUniformLocation(this.program, "modelView");
        this.earthTextureUniformLocation = this.gl.getUniformLocation(this.program, "uTexture");

        this.sphere = new Sphere(this.gl, 1.0, 60, 60, true);

        // --- Atmosfer Küresi ve Shader Ayarları ---
        this.atmosphereSphere = new Sphere(this.gl, 1.015, 60, 60, true); // Küreden %1.5 daha büyük
        this.atmosphereProgram = this._threeDThings.webGLUtils.createProgramFromScripts(this.gl, ["atmosphere-vertex-shader", "atmosphere-fragment-shader"]);
        
        this.atmospherePositionAttributeLocation = this.gl.getAttribLocation(this.atmosphereProgram, "vertex");
        this.atmosphereTexCoordAttributeLocation = this.gl.getAttribLocation(this.atmosphereProgram, "texCoord");
        this.atmosphereProjectionMatrixLocation = this.gl.getUniformLocation(this.atmosphereProgram, "projection");
        this.atmosphereModelviewMatrixLocation = this.gl.getUniformLocation(this.atmosphereProgram, "modelView");
        this.atmosphereUniformTextureLocation = this.gl.getUniformLocation(this.atmosphereProgram, "uCloudTexture");
        this.atmosphereCameraDistanceUniformLocation = this.gl.getUniformLocation(this.atmosphereProgram, "uCameraDistance"); // YENİ EKLENEN
        // Burayı ekleyin:
        if (this.atmosphereUniformTextureLocation === null) {
            console.error("HATA: atmosphereProgram içinde 'uCloudTexture' uniform konumu bulunamadı!");
        } else {
            console.log("atmosphereUniformTextureLocation başarıyla alındı:", this.atmosphereUniformTextureLocation);
        }
        // Ekleyeceğiniz kısım burası bitti.

        this.addEventListeners();
        requestAnimationFrame(this.drawScene.bind(this));
    }

    /**
     * Adds mouse, wheel and touch event listeners to the canvas for interaction.
     * @private
     */
    addEventListeners() {
        // Mouse Events
        this.canvas.addEventListener("mousedown", this.mouseDown.bind(this), false);
        this.canvas.addEventListener("mousemove", this.mouseMove.bind(this), false);
        this.canvas.addEventListener("mouseup", this.mouseUp.bind(this), false);
        this.canvas.addEventListener('wheel', this.wheel.bind(this), false);

        // Touch Events
        this.canvas.addEventListener("touchstart", this.touchStart.bind(this), false);
        this.canvas.addEventListener("touchmove", this.touchMove.bind(this), false);
        this.canvas.addEventListener("touchend", this.touchEnd.bind(this), false);
        this.canvas.addEventListener("touchcancel", this.touchEnd.bind(this), false);
    }

    /**
     * Handles the mousedown event for globe interaction.
     * @param {MouseEvent} event - The mouse event.
     * @private
     */
    mouseDown(event) {
        this.firstPosX = event.clientX;
        this.firstPosY = event.clientY;
        this.stopRotate();
        this.mouseDragging = true;
        this.startPoint = this.getRaycastPoint(event.clientX, event.clientY);
    }

    /**
     * Handles the mouseup event for globe interaction.
     * @param {MouseEvent} event - The mouse event.
     * @private
     */
    mouseUp(event) {
        this.mouseDragging = false;
        this.startRotate();
    }

    /**
     * Handles the mousemove event for globe rotation.
     * @param {MouseEvent} event - The mouse event.
     * @private
     */
    mouseMove(event) {
        if (this.mouseDragging) {
            const currentPoint = this.getRaycastPoint(event.clientX, event.clientY);
            if (this.startPoint && currentPoint) {
                const axis = this.vectorCross(this.startPoint, currentPoint);
                const dot = this.vectorDot(this.startPoint, currentPoint);
                const angle = Math.acos(Math.min(Math.max(dot, -1), 1));

                if (angle > 0.0001) {
                    const rotation = this._threeDThings.m4.axisRotation(axis, angle);
                    this.rotationMatrix = this._threeDThings.m4.multiply(rotation, this.rotationMatrix);
                }
                this.startPoint = currentPoint;
            }
        }
    }

    /**
     * Handles the wheel event for globe zooming.
     * @param {WheelEvent} event - The wheel event.
     * @private
     */
    wheel(event) {
        this.cameraDistance += event.deltaY * 0.01;
        this.cameraDistance = Math.max(this.minCameraDistance, Math.min(this.maxCameraDistance, this.cameraDistance));
        this.stopRotate();
        this.startRotate();
    }

    /**
     * Handles the touchstart event for globe interaction.
     * @param {TouchEvent} event - The touch event.
     * @private
     */
    touchStart(event) {
        event.preventDefault();
        this.stopRotate();

        if (event.touches.length === 1) {
            this.firstPosX = event.touches[0].clientX;
            this.firstPosY = event.touches[0].clientY;
            this.mouseDragging = true;
            this.startPoint = this.getRaycastPoint(event.touches[0].clientX, event.touches[0].clientY);
            this.initialPinchDistance = null;
        } else if (event.touches.length === 2) {
            this.mouseDragging = false;
            this.startPoint = null;
            this.initialPinchDistance = this.getTwoFingerDistance(event.touches);
        }
    }

    /**
     * Handles the touchmove event for globe interaction (rotation and zoom).
     * @param {TouchEvent} event - The touch event.
     * @private
     */
    touchMove(event) {
        event.preventDefault();

        if (event.touches.length === 1 && this.mouseDragging) {
            const currentPoint = this.getRaycastPoint(event.touches[0].clientX, event.touches[0].clientY);
            if (this.startPoint && currentPoint) {
                const axis = this.vectorCross(this.startPoint, currentPoint);
                const dot = this.vectorDot(this.startPoint, currentPoint);
                const angle = Math.acos(Math.min(Math.max(dot, -1), 1));

                if (angle > 0.0001) {
                    const rotation = this._threeDThings.m4.axisRotation(axis, angle);
                    this.rotationMatrix = this._threeDThings.m4.multiply(rotation, this.rotationMatrix);
                }
                this.startPoint = currentPoint;
            }
        } else if (event.touches.length === 2 && this.initialPinchDistance !== null) {
            const currentPinchDistance = this.getTwoFingerDistance(event.touches);
            if (currentPinchDistance !== 0) {
                const pinchFactor = this.initialPinchDistance / currentPinchDistance;
                this.cameraDistance = this.cameraDistance * pinchFactor; 
                this.cameraDistance = Math.max(this.minCameraDistance, Math.min(this.maxCameraDistance, this.cameraDistance));
            }
            this.initialPinchDistance = currentPinchDistance;
        }
    }

    /**
     * Handles the touchend event for globe interaction.
     * @param {TouchEvent} event - The touch event.
     * @private
     */
    touchEnd(event) {
        this.mouseDragging = false;
        this.initialPinchDistance = null;
        if (event.touches.length === 0) {
            this.startRotate();
        }
    }

    /**
     * Calculates the distance between two touch points for pinch-to-zoom.
     * @param {TouchList} touches - The list of active touch points.
     * @returns {number} The distance between the first two touch points.
     * @private
     */
    getTwoFingerDistance(touches) {
        if (touches.length < 2) return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Stops the automatic rotation of the globe.
     * @private
     */
    stopRotate() {
        while (this.rotateTimeouts.length) {
            clearTimeout(this.rotateTimeouts.pop());
        }
        this.autoRotate = false;
    }

    /**
     * Starts the automatic rotation of the globe after a delay.
     * @private
     */
    startRotate() {
        const rotateTimeout = setTimeout(() => {
            this.autoRotate = true;
        }, 2000);
        this.rotateTimeouts.push(rotateTimeout);
    }

    /**
     * Converts degrees to radians.
     * @param {number} value - The value in degrees.
     * @returns {number} The value in radians.
     * @private
     */
    toRadian(value) {
        return value / 57.29577951308232;
    }

    /**
     * Performs a raycast from screen coordinates to find an intersection point on the sphere.
     * @param {number} clientX - The X-coordinate of the mouse cursor in client space.
     * @param {number} clientY - The Y-coordinate of the mouse cursor in client space.
     * @returns {Array<number>|null} A normalized 3D vector representing the intersection point on the sphere, or null if no intersection.
     * @private
     */
    getRaycastPoint(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = ((clientX - rect.left) / this.canvas.clientWidth) * 2 - 1;
        const y = -((clientY - rect.top) / this.canvas.clientHeight) * 2 + 1;

        const aspect = this.canvas.width / this.canvas.height;
        const fov = Math.PI / 180 * 45;
        const near = 0.1;
        const far = 1000;
        const projectionMatrix = this._threeDThings.m4.perspective(fov, aspect, near, far);
        
        const cameraPosition = [0, 0, this.cameraDistance];
        const viewMatrix = this._threeDThings.m4.inverse(this._threeDThings.m4.lookAt(cameraPosition, [0, 0, 0], [0, 1, 0]));

        const rayClip = [x, y, -1, 1];
        const rayEye = this._threeDThings.m4.transformVector(this._threeDThings.m4.inverse(projectionMatrix), rayClip);
        rayEye[2] = -1;
        rayEye[3] = 0;
        const rayWorld = this._threeDThings.m4.transformVector(this._threeDThings.m4.inverse(viewMatrix), rayEye);
        const rayDir = this.vectorNormalize([rayWorld[0], rayWorld[1], rayWorld[2]]);
        const rayOrigin = cameraPosition;

        const sphereCenter = [0, 0, 0];
        const oc = this.vectorSubtract(rayOrigin, sphereCenter);
        const a = this.vectorDot(rayDir, rayDir);
        const b = 2 * this.vectorDot(oc, rayDir);
        const c = this.vectorDot(oc, oc) - 1;
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) return null;

        const t = (-b - Math.sqrt(discriminant)) / (2 * a);
        if (t < 0) return null;

        const intersection = [
            rayOrigin[0] + t * rayDir[0],
            rayOrigin[1] + t * rayDir[1],
            rayOrigin[2] + t * rayDir[2]
        ];

        return this.vectorNormalize(intersection);
    }

    /**
     * Calculates the dot product of two 3D vectors.
     * @param {Array<number>} a - The first vector.
     * @param {Array<number>} b - The second vector.
     * @returns {number} The dot product.
     * @private
     */
    vectorDot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    /**
     * Calculates the cross product of two 3D vectors.
     * @param {Array<number>} a - The first vector.
     * @param {Array<number>} b - The second vector.
     * @returns {Array<number>} A new 3D vector representing the cross product.
     * @private
     */
    vectorCross(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }

    /**
     * Subtracts one 3D vector from another.
     * @param {Array<number>} a - The first vector.
     * @param {Array<number>} b - The second vector (to subtract).
     * @returns {Array<number>} A new 3D vector representing the result of the subtraction.
     * @private
     */
    vectorSubtract(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }

    /**
     * Normalizes a 3D vector.
     * @param {Array<number>} v - The vector to normalize.
     * @returns {Array<number>} A new 3D vector representing the normalized vector.
     * @private
     */
    vectorNormalize(v) {
        const length = Math.sqrt(this.vectorDot(v, v));
        return length > 0 ? [v[0] / length, v[1] / length, v[2] / length] : v;
    }

    /**
     * Dokuları yüklemek için yardımcı fonksiyon.
     * @param {WebGLRenderingContext} gl - WebGL bağlamı.
     * @param {string} url - Yüklenecek dokunun URL'si.
     * @param {function(boolean, WebGLTexture)} callback - Yükleme tamamlandığında çağrılacak geri çağırma fonksiyonu.
     */
    loadTexture(gl, url, callback) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Dokuyu yüklenirken geçici olarak 1x1 mavi bir pikselle doldur (placeholder)
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]); // Tam opak mavi piksel
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

        const image = new Image();
        image.onload = () => {
            console.log(`[Arz.js] Dokusu yüklendi: ${url}`); // Başarılı yükleme bildirimi
            gl.bindTexture(gl.TEXTURE_2D, texture);
            
            // Gerçek resmi WebGL dokusuna aktar
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

            // Resmin boyutlarının 2'nin kuvveti olup olmadığını kontrol et
            // (mipmap'ler için gereklidir, değilse kenar sarma ve filtreleme ayarı)
            if (this._isPowerOf2(image.width) && this._isPowerOf2(image.height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
            callback(true, texture);
        };
        image.onerror = (e) => {
            console.error(`[Arz.js] Hata: Doku yüklenemedi: ${url}`, e); // Hata bildirimi
            callback(false, null);
        };
        image.src = url; // Dokuyu yüklemeye başla
    }

    /**
     * Bir değerin 2'nin kuvveti olup olmadığını kontrol eder.
     * @private
     * @param {number} value
     * @returns {boolean}
     */
    _isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }

    /**
     * Resizes the canvas to match its display size.
     * @param {HTMLCanvasElement} canvas - The canvas element to resize.
     * @returns {boolean} True if the canvas was resized, false otherwise.
     * @private
     */
    resizeCanvasToDisplaySize(canvas) {
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        const needResize = canvas.width !== displayWidth ||
                           canvas.height !== displayHeight;

        if (needResize) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }
        return needResize;
    }

    /**
     * Main drawing loop for the WebGL scene.
     * @param {DOMHighResTimeStamp} now - The current time provided by requestAnimationFrame.
     * @private
     */
   drawScene(now) {
        // Her iki doku da yüklenene kadar bekleyin
        if (!this.textureLoaded || !this.atmosphereTextureLoaded) {
            requestAnimationFrame(this.drawScene.bind(this));
            return;
        }

        if (this.autoRotate) {
            this.rotationMatrix = this._threeDThings.m4.multiply(this._threeDThings.m4.axisRotation([0, 1, 0], this.toRadian(this.autoRotateAngle)), this.rotationMatrix);
        }

        this.resizeCanvasToDisplaySize(this.canvas);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 1); // Siyah arka plan
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0); // RGBA, alfa 0 ise tamamen şeffaf
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // Hem renk hem derinlik tamponunu temizle

        // --- Şeffaflığı etkinleştir ---
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA); // Standart alfa karıştırma

        // --- Dünya Küresini Çiz (Önce Opak Nesneler) ---
        this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.enableVertexAttribArray(this.normalAttributeLocation);
        this.gl.enableVertexAttribArray(this.texCoordAttributeLocation);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sphere.vboVertex);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 3, this.gl.FLOAT, false, 32, 0);
        this.gl.vertexAttribPointer(this.normalAttributeLocation, 3, this.gl.FLOAT, false, 32, 12);
        this.gl.vertexAttribPointer(this.texCoordAttributeLocation, 2, this.gl.FLOAT, false, 32, 24);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.sphere.vboIndex);

        const projectionMatrix = this._threeDThings.m4.perspective(Math.PI / 180 * 45, this.canvas.width / this.canvas.height, 0.1, 1000);
        let modelView = this._threeDThings.m4.identity();
        modelView = this._threeDThings.m4.multiply(modelView, this._threeDThings.m4.inverse(this._threeDThings.m4.lookAt([0, 0, this.cameraDistance], [0, 0, 0], [0, 1, 0])));
        modelView = this._threeDThings.m4.multiply(modelView, this.rotationMatrix);
        
        this.gl.uniformMatrix4fv(this.projectionMatrixLocation, false, projectionMatrix);
        this.gl.uniformMatrix4fv(this.modelviewMatrixLocation, false, modelView);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.earthTexture);
        this.gl.uniform1i(this.earthTextureUniformLocation, 0);

        this.gl.drawElements(this.gl.TRIANGLES, this.sphere.getIndexCount(), this.gl.UNSIGNED_SHORT, 0);

        // --- ÖNEMLİ DEĞİŞİKLİK BURADA BAŞLIYOR ---
        // Dünya programının tüm etkin attribute array'lerini devre dışı bırak
        this.gl.disableVertexAttribArray(this.positionAttributeLocation);
        this.gl.disableVertexAttribArray(this.normalAttributeLocation);
        this.gl.disableVertexAttribArray(this.texCoordAttributeLocation);
        // --- DEĞİŞİKLİK BURADA BİTİYOR ---

        // --- Atmosfer Küresini Çiz (Şeffaf Nesneler) ---
        this.gl.useProgram(this.atmosphereProgram);
        this.gl.enableVertexAttribArray(this.atmospherePositionAttributeLocation);
        this.gl.enableVertexAttribArray(this.atmosphereTexCoordAttributeLocation);
        // Normal attributu atmosfer shader'ında kullanılmadığı için disable et
        this.gl.disableVertexAttribArray(this.normalAttributeLocation); // Bu satır zaten vardı, olduğu gibi kaldı.

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.atmosphereSphere.vboVertex);
        this.gl.vertexAttribPointer(this.atmospherePositionAttributeLocation, 3, this.gl.FLOAT, false, 32, 0);
        this.gl.vertexAttribPointer(this.atmosphereTexCoordAttributeLocation, 2, this.gl.FLOAT, false, 32, 24);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.atmosphereSphere.vboIndex);

        // Dünya ile aynı rotasyon ve pozisyon matrislerini kullan
        this.gl.uniformMatrix4fv(this.atmosphereProjectionMatrixLocation, false, projectionMatrix);
        this.gl.uniformMatrix4fv(this.atmosphereModelviewMatrixLocation, false, modelView);
        this.gl.uniform1f(this.atmosphereCameraDistanceUniformLocation, this.cameraDistance); // YENİ EKLENEN

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.atmosphereTexture);
        this.gl.uniform1i(this.atmosphereUniformTextureLocation, 0);

        this.gl.drawElements(this.gl.TRIANGLES, this.atmosphereSphere.getIndexCount(), this.gl.UNSIGNED_SHORT, 0);

        // --- Şeffaflığı devre dışı bırak (isteğe bağlı, başka opak nesne çizilmeyecekse gerekli değil) ---
        //this.gl.disable(this.gl.BLEND);      
        requestAnimationFrame(this.drawScene.bind(this));
    }
}

export default Arz;