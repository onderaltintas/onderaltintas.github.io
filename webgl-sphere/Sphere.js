/**
 * @file Sphere.js
 * @brief Represents a sphere geometry for WebGL rendering.
 * @author Song Ho Ahn (song.ahn@gmail.com)
 * @created 2020-03-12
 * @updated 2021-10-07
 *
 * With default constructor, it creates a sphere with radius=1, sectorCount=36,
 * stackCount=18, smooth=true.
 * The minimum # of sectors is 3 and stacks is 2.
 *
 * Example of OpenGL drawing calls (interleaved mode)
 * ===============================
 * gl.bindBuffer(gl.ARRAY_BUFFER, sphere.vboVertex);
 * gl.vertexAttribPointer(gl.program.attribute.vertexPosition, 3, gl.FLOAT, false, 32, 0);
 * gl.vertexAttribPointer(gl.program.attribute.vertexNormal, 3, gl.FLOAT, false, 32, 12);
 * gl.vertexAttribPointer(gl.program.attribute.vertexTexCoord, 2, gl.FLOAT, false, 32, 24);
 * gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.vboIndex);
 * gl.drawElements(gl.TRIANGLES, sphere.getIndexCount(), gl.UNSIGNED_SHORT, 0);
 */

class Sphere {
    /**
     * Creates an instance of Sphere.
     * @param {WebGLRenderingContext} gl - The WebGL rendering context.
     * @param {number} [radius=1] - The radius of the sphere.
     * @param {number} [sectors=36] - The number of sectors (longitude lines). Minimum is 3.
     * @param {number} [stacks=18] - The number of stacks (latitude lines). Minimum is 2.
     * @param {boolean} [smooth=true] - Whether to use smooth shading (true) or flat shading (false).
     */
    constructor(gl, radius = 1, sectors = 36, stacks = 18, smooth = true) {
        this.gl = gl;
        if (!gl) {
            console.warn("[WARNING] Sphere.constructor requires GL context as a param.");
        }

        this.radius = 1;
        this.sectorCount = 36;
        this.stackCount = 18;
        this.smooth = true;
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];
        this.indices = [];
        this.interleavedVertices = [];
        this.stride = 32; // stride for interleaved vertices, always=32
        if (gl) {
            this.vboVertex = gl.createBuffer();
            this.vboIndex = gl.createBuffer();
        }
        // init
        this.set(radius, sectors, stacks, smooth);
    }

    /**
     * Sets the sphere's properties and rebuilds its geometry.
     * @param {number} r - The radius of the sphere.
     * @param {number} se - The number of sectors.
     * @param {number} st - The number of stacks.
     * @param {boolean} sm - Whether to use smooth shading.
     * @returns {Sphere} The Sphere instance for chaining.
     */
    set(r, se, st, sm) {
        this.radius = r;
        this.sectorCount = se < 3 ? 3 : se;
        this.stackCount = st < 2 ? 2 : st;
        this.smooth = sm;
        if (sm) {
            this.buildVerticesSmooth();
        } else {
            this.buildVerticesFlat();
        }
        return this;
    }

    /**
     * Sets the radius of the sphere.
     * @param {number} r - The new radius.
     * @returns {Sphere} The Sphere instance for chaining.
     */
    setRadius(r) {
        if (this.radius !== r) {
            this.set(r, this.sectorCount, this.stackCount, this.smooth);
        }
        return this;
    }

    /**
     * Sets the number of sectors of the sphere.
     * @param {number} s - The new sector count.
     * @returns {Sphere} The Sphere instance for chaining.
     */
    setSectorCount(s) {
        if (this.sectorCount !== s) {
            this.set(this.radius, s, this.stackCount, this.smooth);
        }
        return this;
    }

    /**
     * Sets the number of stacks of the sphere.
     * @param {number} s - The new stack count.
     * @returns {Sphere} The Sphere instance for chaining.
     */
    setStackCount(s) {
        if (this.stackCount !== s) {
            this.set(this.radius, this.sectorCount, s, this.smooth);
        }
        return this;
    }

    /**
     * Sets the shading mode for the sphere.
     * @param {boolean} s - True for smooth shading, false for flat shading.
     * @returns {Sphere} The Sphere instance for chaining.
     */
    setSmooth(s) {
        if (this.smooth !== s) {
            this.smooth = s;
            if (this.smooth) {
                this.buildVerticesSmooth();
            } else {
                this.buildVerticesFlat();
            }
        }
        return this;
    }

    /**
     * Gets the total number of triangles in the sphere.
     * @returns {number} The number of triangles.
     */
    getTriangleCount() {
        return this.getIndexCount() / 3;
    }

    /**
     * Gets the total number of indices.
     * @returns {number} The number of indices.
     */
    getIndexCount() {
        return this.indices.length;
    }

    /**
     * Gets the total number of vertices (position components / 3).
     * @returns {number} The number of vertices.
     */
    getVertexCount() {
        return this.vertices.length / 3;
    }

    /**
     * Gets the total number of normals (normal components / 3).
     * @returns {number} The number of normals.
     */
    getNormalCount() {
        return this.normals.length / 3;
    }

    /**
     * Gets the total number of texture coordinates (texCoord components / 2).
     * @returns {number} The number of texture coordinates.
     */
    getTexCoordCount() {
        return this.texCoords.length / 2;
    }

    /**
     * Returns a string representation of the Sphere's properties.
     * @returns {string} A string describing the sphere.
     */
    toString() {
        return `===== Sphere =====
        Radius: ${this.radius}
  Sector Count: ${this.sectorCount}
   Stack Count: ${this.stackCount}
 Smooth Shader: ${this.smooth}
Triangle Count: ${this.getTriangleCount()}
   Index Count: ${this.getIndexCount()}
  Vertex Count: ${this.getVertexCount()}
  Normal Count: ${this.getNormalCount()}
TexCoord Count: ${this.getTexCoordCount()}`;
    }

    /**
     * Clears all internal vertex, normal, texCoord, and index arrays.
     */
    clearArrays() {
        this.vertices.length = 0;
        this.normals.length = 0;
        this.texCoords.length = 0;
        this.indices.length = 0;
        this.interleavedVertices.length = 0;
    }

    /**
     * Resizes the arrays for smooth shading.
     */
    resizeArraysSmooth() {
        this.clearArrays();
        const count = (this.sectorCount + 1) * (this.stackCount + 1);
        this.vertices = new Float32Array(3 * count);
        this.normals = new Float32Array(3 * count);
        this.texCoords = new Float32Array(2 * count);
        this.indices = new Uint16Array(6 * this.sectorCount * (this.stackCount - 1));
    }

    /**
     * Resizes the arrays for flat shading.
     */
    resizeArraysFlat() {
        this.clearArrays();
        const count = 6 * this.sectorCount + 4 * this.sectorCount * (this.stackCount - 2);
        this.vertices = new Float32Array(3 * count);
        this.normals = new Float32Array(3 * count);
        this.texCoords = new Float32Array(2 * count);
        this.indices = new Uint16Array(6 * this.sectorCount * (this.stackCount - 1));
    }

    /**
     * Generates vertices for smooth shading.
     * x = r * cos(u) * cos(v)
     * y = r * cos(u) * sin(v)
     * z = r * sin(u)
     * where u: stack(latitude) angle (-90 <= u <= 90)
     * v: sector(longitude) angle (0 <= v <= 360)
     */
    buildVerticesSmooth() {
        // resize typed arrays
        this.resizeArraysSmooth();

        let x, y, z, xy, nx, ny, nz, s, t;
        const lengthInv = 1.0 / this.radius;
        const sectorStep = 2 * Math.PI / this.sectorCount;
        const stackStep = Math.PI / this.stackCount;
        let sectorAngle, stackAngle;

        let ii = 0, jj = 0, kk = 0;
        for (let i = 0; i <= this.stackCount; ++i) {
            stackAngle = Math.PI / 2 - i * stackStep; // starting from pi/2 to -pi/2
            xy = this.radius * Math.cos(stackAngle); // r * cos(u)
            z = this.radius * Math.sin(stackAngle); // r * sin(u)

            // add (sectorCount+1) vertices per stack
            // the first and last vertices have same position and normal, but different tex coords
            for (let j = 0; j <= this.sectorCount; ++j) {
                sectorAngle = j * sectorStep; // starting from 0 to 2pi

                // vertex position
                x = xy * Math.cos(sectorAngle); // r * cos(u) * cos(v)
                y = xy * Math.sin(sectorAngle); // r * cos(u) * sin(v)
                this.addVertex(ii, x, y, z);

                // normalized vertex normal
                nx = x * lengthInv;
                ny = y * lengthInv;
                nz = z * lengthInv;
                this.addNormal(ii, nx, ny, nz);

                // vertex tex coord between [0, 1]
                s = j / this.sectorCount;
                t = i / this.stackCount;
                this.addTexCoord(jj, s, t);

                // next
                ii += 3;
                jj += 2;
            }
        }

        // indices
        //  k1--k1+1
        //  |  / |
        //  | /  |
        //  k2--k2+1
        for (let i = 0; i < this.stackCount; ++i) {
            let k1 = i * (this.sectorCount + 1); // beginning of current stack
            let k2 = k1 + this.sectorCount + 1; // beginning of next stack

            for (let j = 0; j < this.sectorCount; ++j, ++k1, ++k2) {
                // 2 triangles per sector excluding 1st and last stacks
                if (i !== 0) {
                    this.addIndices(kk, k1, k2, k1 + 1); // k1---k2---k1+1
                    kk += 3;
                }

                if (i !== (this.stackCount - 1)) {
                    this.addIndices(kk, k1 + 1, k2, k2 + 1); // k1+1---k2---k2+1
                    kk += 3;
                }
            }
        }

        // generate interleaved vertex array as well
        this.buildInterleavedVertices();
        this.buildVbos();
    }

    /**
     * Generates vertices for flat shading.
     */
    buildVerticesFlat() {
        let x, y, z, s, t, n, xy, v1, v2, v3, v4, vi1, vi2;
        const sectorStep = 2 * Math.PI / this.sectorCount;
        const stackStep = Math.PI / this.stackCount;
        let sectorAngle, stackAngle;
        const tmpVertices = [];
        let vertex = {}; // to store (x,y,z,s,t)

        // compute all vertices first, each vertex contains (x,y,z,s,t) except normal
        for (let i = 0; i <= this.stackCount; ++i) {
            stackAngle = Math.PI / 2 - i * stackStep; // starting from pi/2 to -pi/2
            xy = this.radius * Math.cos(stackAngle); // r * cos(u)
            z = this.radius * Math.sin(stackAngle); // r * sin(u)

            // add (sectorCount+1) vertices per stack
            // the first and last vertices have same position and normal, but different tex coords
            for (let j = 0; j <= this.sectorCount; ++j) {
                sectorAngle = j * sectorStep; // starting from 0 to 2pi
                vertex = {
                    x: xy * Math.cos(sectorAngle), // x = r * cos(u) * cos(v)
                    y: xy * Math.sin(sectorAngle), // y = r * cos(u) * sin(v)
                    z: z, // z = r * sin(u)
                    s: j / this.sectorCount,
                    t: i / this.stackCount
                };
                tmpVertices.push(vertex);
            }
        }

        // resize typed arrays
        this.resizeArraysFlat();

        let ii = 0, jj = 0, kk = 0, index = 0;
        for (let i = 0; i < this.stackCount; ++i) {
            vi1 = i * (this.sectorCount + 1); // index of tmpVertices
            vi2 = (i + 1) * (this.sectorCount + 1);

            for (let j = 0; j < this.sectorCount; ++j, ++vi1, ++vi2) {
                // get 4 vertices per sector
                //  v1-v3
                //  |  |
                //  v2-v4
                v1 = tmpVertices[vi1];
                v2 = tmpVertices[vi2];
                v3 = tmpVertices[vi1 + 1];
                v4 = tmpVertices[vi2 + 1];

                // if 1st stack and last stack, store only 1 triangle per sector
                // otherwise, store 2 triangles (quad) per sector
                if (i === 0) // a triangle for first stack ======================
                {
                    // put a triangle
                    this.addVertex(ii, v1.x, v1.y, v1.z);
                    this.addVertex(ii + 3, v2.x, v2.y, v2.z);
                    this.addVertex(ii + 6, v4.x, v4.y, v4.z);

                    // put tex coords of triangle
                    this.addTexCoord(jj, v1.s, v1.t);
                    this.addTexCoord(jj + 2, v2.s, v2.t);
                    this.addTexCoord(jj + 4, v4.s, v4.t);

                    // put normal
                    n = Sphere.computeFaceNormal(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v4.x, v4.y, v4.z);
                    this.addNormal(ii, n[0], n[1], n[2]);
                    this.addNormal(ii + 3, n[0], n[1], n[2]);
                    this.addNormal(ii + 6, n[0], n[1], n[2]);

                    // put indices of 1 triangle
                    this.addIndices(kk, index, index + 1, index + 2);

                    // next
                    ii += 9;
                    jj += 6;
                    kk += 3;
                    index += 3;
                } else if (i === (this.stackCount - 1)) // a triangle for last stack =====
                {
                    // put a triangle
                    this.addVertex(ii, v1.x, v1.y, v1.z);
                    this.addVertex(ii + 3, v2.x, v2.y, v2.z);
                    this.addVertex(ii + 6, v3.x, v3.y, v3.z);

                    // put tex coords of triangle
                    this.addTexCoord(jj, v1.s, v1.t);
                    this.addTexCoord(jj + 2, v2.s, v2.t);
                    this.addTexCoord(jj + 4, v3.s, v3.t);

                    // put normal
                    n = Sphere.computeFaceNormal(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z);
                    this.addNormal(ii, n[0], n[1], n[2]);
                    this.addNormal(ii + 3, n[0], n[1], n[2]);
                    this.addNormal(ii + 6, n[0], n[1], n[2]);

                    // put indices of 1 triangle
                    this.addIndices(kk, index, index + 1, index + 2);

                    // next
                    ii += 9;
                    jj += 6;
                    kk += 3;
                    index += 3;
                } else // 2 triangles for others ================================
                {
                    // put quad vertices: v1-v2-v3-v4
                    this.addVertex(ii, v1.x, v1.y, v1.z);
                    this.addVertex(ii + 3, v2.x, v2.y, v2.z);
                    this.addVertex(ii + 6, v3.x, v3.y, v3.z);
                    this.addVertex(ii + 9, v4.x, v4.y, v4.z);

                    // put tex coords of quad
                    this.addTexCoord(jj, v1.s, v1.t);
                    this.addTexCoord(jj + 2, v2.s, v2.t);
                    this.addTexCoord(jj + 4, v3.s, v3.t);
                    this.addTexCoord(jj + 6, v4.s, v4.t);

                    // put normal
                    n = Sphere.computeFaceNormal(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z);
                    this.addNormal(ii, n[0], n[1], n[2]);
                    this.addNormal(ii + 3, n[0], n[1], n[2]);
                    this.addNormal(ii + 6, n[0], n[1], n[2]);

                    // put indices of quad (2 triangles)
                    this.addIndices(kk, index, index + 1, index + 2);
                    this.addIndices(kk + 3, index + 2, index + 1, index + 3);

                    // next
                    ii += 12;
                    jj += 8;
                    kk += 6;
                    index += 4;
                }
            }
        }

        // generate interleaved vertex array as well
        this.buildInterleavedVertices();
        this.buildVbos();
    }

    /**
     * Generates interleaved vertices (V/N/T) for the sphere.
     * Stride must be 32 bytes (3 for vertex, 3 for normal, 2 for texCoord = 8 floats * 4 bytes/float).
     */
    buildInterleavedVertices() {
        const vertexCount = this.getVertexCount();
        this.interleavedVertices.length = 0;
        this.interleavedVertices = new Float32Array(vertexCount * 8); // v(3)+n(3)+t(2)

        let j = 0, k = 0;
        for (let i = 0; i < this.vertices.length; i += 3) {
            this.interleavedVertices[k] = this.vertices[i];
            this.interleavedVertices[k + 1] = this.vertices[i + 1];
            this.interleavedVertices[k + 2] = this.vertices[i + 2];

            this.interleavedVertices[k + 3] = this.normals[i];
            this.interleavedVertices[k + 4] = this.normals[i + 1];
            this.interleavedVertices[k + 5] = this.normals[i + 2];

            this.interleavedVertices[k + 6] = this.texCoords[j];
            this.interleavedVertices[k + 7] = this.texCoords[j + 1];

            j += 2;
            k += 8;
        }
    }

    /**
     * Copies interleaved vertex data to WebGL VBOs (Vertex Buffer Objects).
     */
    buildVbos() {
        const gl = this.gl;
        // copy vertices/normals/texcoords to VBO
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboVertex);
        gl.bufferData(gl.ARRAY_BUFFER, this.interleavedVertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // copy indices to VBO
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vboIndex);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    /**
     * Adds vertex coordinates to the internal `vertices` array.
     * @param {number} index - The starting index in the array.
     * @param {number} x - The x-coordinate.
     * @param {number} y - The y-coordinate.
     * @param {number} z - The z-coordinate.
     */
    addVertex(index, x, y, z) {
        this.vertices[index] = x;
        this.vertices[index + 1] = y;
        this.vertices[index + 2] = z;
    }

    /**
     * Adds normal coordinates to the internal `normals` array.
     * @param {number} index - The starting index in the array.
     * @param {number} x - The x-component of the normal.
     * @param {number} y - The y-component of the normal.
     * @param {number} z - The z-component of the normal.
     */
    addNormal(index, x, y, z) {
        this.normals[index] = x;
        this.normals[index + 1] = y;
        this.normals[index + 2] = z;
    }

    /**
     * Adds texture coordinates to the internal `texCoords` array.
     * @param {number} index - The starting index in the array.
     * @param {number} s - The s-component (u) of the texture coordinate.
     * @param {number} t - The t-component (v) of the texture coordinate.
     */
    addTexCoord(index, s, t) {
        this.texCoords[index] = s;
        this.texCoords[index + 1] = t;
    }

    /**
     * Adds indices to the internal `indices` array.
     * @param {number} index - The starting index in the array.
     * @param {number} i1 - The first index.
     * @param {number} i2 - The second index.
     * @param {number} i3 - The third index.
     */
    addIndices(index, i1, i2, i3) {
        this.indices[index] = i1;
        this.indices[index + 1] = i2;
        this.indices[index + 2] = i3;
    }

    /**
     * Statically computes the face normal for a triangle defined by three vertices.
     * @param {number} x1 - X-coordinate of the first vertex.
     * @param {number} y1 - Y-coordinate of the first vertex.
     * @param {number} z1 - Z-coordinate of the first vertex.
     * @param {number} x2 - X-coordinate of the second vertex.
     * @param {number} y2 - Y-coordinate of the second vertex.
     * @param {number} z2 - Z-coordinate of the second vertex.
     * @param {number} x3 - X-coordinate of the third vertex.
     * @param {number} y3 - Y-coordinate of the third vertex.
     * @param {number} z3 - Z-coordinate of the third vertex.
     * @returns {Float32Array} A 3-element array representing the normalized face normal.
     */
    static computeFaceNormal(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
        const normal = new Float32Array(3);
        const ex1 = x2 - x1;
        const ey1 = y2 - y1;
        const ez1 = z2 - z1;
        const ex2 = x3 - x1;
        const ey2 = y3 - y1;
        const ez2 = z3 - z1;
        // cross product: e1 x e2;
        const nx = ey1 * ez2 - ez1 * ey2;
        const ny = ez1 * ex2 - ex1 * ez2;
        const nz = ex1 * ey2 - ey1 * ex2;
        const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (length > 0.000001) {
            normal[0] = nx / length;
            normal[1] = ny / length;
            normal[2] = nz / length;
        }
        return normal;
    }
}

export default Sphere;