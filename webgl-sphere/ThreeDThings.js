/*
 * Copyright 2021 GFXFundamentals.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 * * Neither the name of GFXFundamentals. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * ThreeDThings.js - Modifications Notice
 *
 * This file, ThreeDThings.js, was created by Önder Altıntaş.
 *
 * The following modifications were made by Önder Altıntaş:
 * - webgl-utils.js, m3.js, and m4.js files were combined into this single file.
 * - ES6+ refactoring was applied to the combined codebase, including changes
 * to variable declarations (var to const/let), arrow functions, and
 * module exports/imports where applicable.
 */

class ThreeDThings {
    constructor() {
        this.m3 = {
            degToRad: function(d) { return d * Math.PI / 180; },
            distance: function(x1, y1, x2, y2) {
                var dx = x1 - x2;
                var dy = y1 - y2;
                return Math.sqrt(dx * dx + dy * dy);
            },
            dot: function(x1, y1, x2, y2) { return x1 * x2 + y1 * y2; },
            identity: function(dst) {
                dst = dst || new Float32Array(9);
                dst[0] = 1; dst[1] = 0; dst[2] = 0;
                dst[3] = 0; dst[4] = 1; dst[5] = 0;
                dst[6] = 0; dst[7] = 0; dst[8] = 1;
                return dst;
            },
            inverse: function(m, dst) {
                dst = dst || new Float32Array(9);
                const m00 = m[0]; const m01 = m[1]; const m02 = m[2];
                const m10 = m[3]; const m11 = m[4]; const m12 = m[5];
                const m20 = m[6]; const m21 = m[7]; const m22 = m[8];
                const b01 = m22 * m11 - m12 * m21;
                const b11 = -m22 * m10 + m12 * m20;
                const b21 = m21 * m10 - m11 * m20;
                const det = m00 * b01 + m01 * b11 + m02 * b21;
                const invDet = 1.0 / det;
                dst[0] = b01 * invDet;
                dst[1] = (-m22 * m01 + m02 * m21) * invDet;
                dst[2] = (m12 * m01 - m02 * m11) * invDet;
                dst[3] = b11 * invDet;
                dst[4] = (m22 * m00 - m02 * m20) * invDet;
                dst[5] = (-m12 * m00 + m02 * m10) * invDet;
                dst[6] = b21 * invDet;
                dst[7] = (-m21 * m00 + m01 * m20) * invDet;
                dst[8] = (m11 * m00 - m01 * m10) * invDet;
                return dst;
            },
            multiply: function(a, b, dst) {
                dst = dst || new Float32Array(9);
                var a00 = a[0]; var a01 = a[1]; var a02 = a[2];
                var a10 = a[3]; var a11 = a[4]; var a12 = a[5];
                var a20 = a[6]; var a21 = a[7]; var a22 = a[8];
                var b00 = b[0]; var b01 = b[1]; var b02 = b[2];
                var b10 = b[3]; var b11 = b[4]; var b12 = b[5];
                var b20 = b[6]; var b21 = b[7]; var b22 = b[8];
                dst[0] = b00 * a00 + b01 * a10 + b02 * a20;
                dst[1] = b00 * a01 + b01 * a11 + b02 * a21;
                dst[2] = b00 * a02 + b01 * a12 + b02 * a22;
                dst[3] = b10 * a00 + b11 * a10 + b12 * a20;
                dst[4] = b10 * a01 + b11 * a11 + b12 * a21;
                dst[5] = b10 * a02 + b11 * a12 + b12 * a22;
                dst[6] = b20 * a00 + b21 * a10 + b22 * a20;
                dst[7] = b20 * a01 + b21 * a11 + b22 * a21;
                dst[8] = b20 * a02 + b21 * a12 + b22 * a22;
                return dst;
            },
            normalize: function(x, y) {
                var l = Math.sqrt(x * x + y * y);
                return l > 0.00001 ? [x / l, y / l] : [0, 0];
            },
            projection: function(width, height, dst) {
                dst = dst || new Float32Array(9);
                dst[0] = 2 / width; dst[1] = 0; dst[2] = 0;
                dst[3] = 0; dst[4] = -2 / height; dst[5] = 0;
                dst[6] = -1; dst[7] = 1; dst[8] = 1;
                return dst;
            },
            radToDeg: function(r) { return r * 180 / Math.PI; },
            reflect: function(ix, iy, nx, ny) {
                var d = nx * ix + ny * iy;
                return [ix - 2 * d * nx, iy - 2 * d * ny];
            },
            rotation: function(angleInRadians, dst) {
                var c = Math.cos(angleInRadians);
                var s = Math.sin(angleInRadians);
                dst = dst || new Float32Array(9);
                dst[0] = c; dst[1] = -s; dst[2] = 0;
                dst[3] = s; dst[4] = c; dst[5] = 0;
                dst[6] = 0; dst[7] = 0; dst[8] = 1;
                return dst;
            },
            rotate: function(m, angleInRadians, dst) {
                return this.multiply(m, this.rotation(angleInRadians), dst);
            },
            scaling: function(sx, sy, dst) {
                dst = dst || new Float32Array(9);
                dst[0] = sx; dst[1] = 0; dst[2] = 0;
                dst[3] = 0; dst[4] = sy; dst[5] = 0;
                dst[6] = 0; dst[7] = 0; dst[8] = 1;
                return dst;
            },
            scale: function(m, sx, sy, dst) {
                return this.multiply(m, this.scaling(sx, sy), dst);
            },
            transformPoint: function(m, v) {
                var v0 = v[0]; var v1 = v[1];
                var d = v0 * m[2] + v1 * m[5] + m[8];
                return [
                    (v0 * m[0] + v1 * m[3] + m[6]) / d,
                    (v0 * m[1] + v1 * m[4] + m[7]) / d
                ];
            },
            translation: function(tx, ty, dst) {
                dst = dst || new Float32Array(9);
                dst[0] = 1; dst[1] = 0; dst[2] = 0;
                dst[3] = 0; dst[4] = 1; dst[5] = 0;
                dst[6] = tx; dst[7] = ty; dst[8] = 1;
                return dst;
            },
            translate: function(m, tx, ty, dst) {
                return this.multiply(m, this.translation(tx, ty), dst);
            },
            project: function(m, width, height, dst) {
                return this.multiply(m, this.projection(width, height), dst);
            }
        };

        this.m4 = {
            copy: function(src, dst) {
                dst = dst || new Float32Array(16);
                for (let i = 0; i < 16; i++) dst[i] = src[i];
                return dst;
            },
            lookAt: function(cameraPosition, target, up, dst) {
                dst = dst || new Float32Array(16);
                const zAxis = this.normalize(this.subtractVectors(cameraPosition, target));
                const xAxis = this.normalize(this.cross(up, zAxis));
                const yAxis = this.normalize(this.cross(zAxis, xAxis));
                dst[0] = xAxis[0]; dst[1] = xAxis[1]; dst[2] = xAxis[2]; dst[3] = 0;
                dst[4] = yAxis[0]; dst[5] = yAxis[1]; dst[6] = yAxis[2]; dst[7] = 0;
                dst[8] = zAxis[0]; dst[9] = zAxis[1]; dst[10] = zAxis[2]; dst[11] = 0;
                dst[12] = cameraPosition[0]; dst[13] = cameraPosition[1]; dst[14] = cameraPosition[2]; dst[15] = 1;
                return dst;
            },
            addVectors: function(a, b, dst) {
                dst = dst || new Float32Array(3);
                dst[0] = a[0] + b[0]; dst[1] = a[1] + b[1]; dst[2] = a[2] + b[2];
                return dst;
            },
            subtractVectors: function(a, b, dst) {
                dst = dst || new Float32Array(3);
                dst[0] = a[0] - b[0]; dst[1] = a[1] - b[1]; dst[2] = a[2] - b[2];
                return dst;
            },
            scaleVector: function(v, s, dst) {
                dst = dst || new Float32Array(3);
                dst[0] = v[0] * s; dst[1] = v[1] * s; dst[2] = v[2] * s;
                return dst;
            },
            distance: function(a, b) {
                const dx = a[0] - b[0]; const dy = a[1] - b[1]; const dz = a[2] - b[2];
                return Math.sqrt(dx * dx + dy * dy + dz * dz);
            },
            distanceSq: function(a, b) {
                const dx = a[0] - b[0]; const dy = a[1] - b[1]; const dz = a[2] - b[2];
                return dx * dx + dy * dy + dz * dz;
            },
            normalize: function(v, dst) {
                dst = dst || new Float32Array(3);
                const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
                if (length > 0.00001) {
                    dst[0] = v[0] / length; dst[1] = v[1] / length; dst[2] = v[2] / length;
                }
                return dst;
            },
            compose: function(translation, quaternion, scale, dst) {
                dst = dst || new Float32Array(16);
                const x = quaternion[0]; const y = quaternion[1]; const z = quaternion[2]; const w = quaternion[3];
                const x2 = x + x; const y2 = y + y; const z2 = z + z;
                const xx = x * x2; const xy = x * y2; const xz = x * z2;
                const yy = y * y2; const yz = y * z2; const zz = z * z2;
                const wx = w * x2; const wy = w * y2; const wz = w * z2;
                const sx = scale[0]; const sy = scale[1]; const sz = scale[2];
                dst[0] = (1 - (yy + zz)) * sx;
                dst[1] = (xy + wz) * sx;
                dst[2] = (xz - wy) * sx;
                dst[3] = 0;
                dst[4] = (xy - wz) * sy;
                dst[5] = (1 - (xx + zz)) * sy;
                dst[6] = (yz + wx) * sy;
                dst[7] = 0;
                dst[8] = (xz + wy) * sz;
                dst[9] = (yz - wx) * sz;
                dst[10] = (1 - (xx + yy)) * sz;
                dst[11] = 0;
                dst[12] = translation[0]; dst[13] = translation[1]; dst[14] = translation[2]; dst[15] = 1;
                return dst;
            },
            cross: function(a, b, dst) {
                dst = dst || new Float32Array(3);
                dst[0] = a[1] * b[2] - a[2] * b[1];
                dst[1] = a[2] * b[0] - a[0] * b[2];
                dst[2] = a[0] * b[1] - a[1] * b[0];
                return dst;
            },
            decompose: function(mat, translation, quaternion, scale) {
                const matrix = this.copy(mat);
                const sx = this.length(matrix.subarray(0, 3));
                const sy = this.length(matrix.subarray(4, 7));
                const sz = this.length(matrix.subarray(8, 11));
                const det = this.determinate(matrix);
                if (det < 0) sx = -sx;
                translation[0] = mat[12]; translation[1] = mat[13]; translation[2] = mat[14];
                const invSX = 1 / sx; const invSY = 1 / sy; const invSZ = 1 / sz;
                for (let i = 0; i < 3; i++) matrix[i] *= invSX;
                for (let i = 4; i < 7; i++) matrix[i] *= invSY;
                for (let i = 8; i < 11; i++) matrix[i] *= invSZ;
                this.quatFromRotationMatrix(matrix, quaternion);
                scale[0] = sx; scale[1] = sy; scale[2] = sz;
            },
            dot: function(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; },
            identity: function(dst) {
                dst = dst || new Float32Array(16);
                dst.fill(0);
                dst[0] = 1; dst[5] = 1; dst[10] = 1; dst[15] = 1;
                return dst;
            },
            transpose: function(m, dst) {
                dst = dst || new Float32Array(16);
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        dst[i * 4 + j] = m[j * 4 + i];
                    }
                }
                return dst;
            },
            length: function(v) { return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); },
            lengthSq: function(v) { return v[0] * v[0] + v[1] * v[1] + v[2] * v[2]; },
            orthographic: function(left, right, bottom, top, near, far, dst) {
                dst = dst || new Float32Array(16);
                dst[0] = 2 / (right - left); dst[5] = 2 / (top - bottom); dst[10] = 2 / (near - far);
                dst[12] = (left + right) / (left - right);
                dst[13] = (bottom + top) / (bottom - top);
                dst[14] = (near + far) / (near - far);
                dst[15] = 1;
                return dst;
            },
            frustum: function(left, right, bottom, top, near, far, dst) {
                dst = dst || new Float32Array(16);
                const dx = right - left; const dy = top - bottom; const dz = far - near;
                dst[0] = 2 * near / dx; dst[5] = 2 * near / dy;
                dst[8] = (left + right) / dx; dst[9] = (top + bottom) / dy;
                dst[10] = -(far + near) / dz; dst[11] = -1;
                dst[14] = -2 * near * far / dz; dst[15] = 0;
                return dst;
            },
            perspective: function(fieldOfViewInRadians, aspect, near, far, dst) {
                dst = dst || new Float32Array(16);
                const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
                const rangeInv = 1.0 / (near - far);
                dst[0] = f / aspect; dst[5] = f;
                dst[10] = (near + far) * rangeInv; dst[11] = -1;
                dst[14] = near * far * rangeInv * 2; dst[15] = 0;
                return dst;
            },
            translation: function(tx, ty, tz, dst) {
                dst = dst || new Float32Array(16);
                dst[0] = 1; dst[5] = 1; dst[10] = 1; dst[15] = 1;
                dst[12] = tx; dst[13] = ty; dst[14] = tz;
                return dst;
            },
            translate: function(m, tx, ty, tz, dst) {
                dst = dst || new Float32Array(16);
                for (let i = 0; i < 12; i++) dst[i] = m[i];
                dst[12] = m[0] * tx + m[4] * ty + m[8] * tz + m[12];
                dst[13] = m[1] * tx + m[5] * ty + m[9] * tz + m[13];
                dst[14] = m[2] * tx + m[6] * ty + m[10] * tz + m[14];
                dst[15] = m[3] * tx + m[7] * ty + m[11] * tz + m[15];
                return dst;
            },
            xRotation: function(angleInRadians, dst) {
                dst = dst || new Float32Array(16);
                const c = Math.cos(angleInRadians); const s = Math.sin(angleInRadians);
                dst[0] = 1; dst[15] = 1;
                dst[5] = c; dst[6] = s;
                dst[9] = -s; dst[10] = c;
                return dst;
            },
            yRotation: function(angleInRadians, dst) {
                dst = dst || new Float32Array(16);
                const c = Math.cos(angleInRadians); const s = Math.sin(angleInRadians);
                dst[5] = 1; dst[15] = 1;
                dst[0] = c; dst[2] = -s;
                dst[8] = s; dst[10] = c;
                return dst;
            },
            zRotation: function(angleInRadians, dst) {
                dst = dst || new Float32Array(16);
                const c = Math.cos(angleInRadians); const s = Math.sin(angleInRadians);
                dst[0] = c; dst[1] = s; dst[4] = -s; dst[5] = c; dst[10] = 1; dst[15] = 1;
                return dst;
            },
            xRotate: function(m, angleInRadians, dst) {
                dst = dst || new Float32Array(16);
                const c = Math.cos(angleInRadians); const s = Math.sin(angleInRadians);
                const m10 = m[4]; const m11 = m[5]; const m12 = m[6]; const m13 = m[7];
                const m20 = m[8]; const m21 = m[9]; const m22 = m[10]; const m23 = m[11];
                dst[4] = c * m10 + s * m20; dst[5] = c * m11 + s * m21; dst[6] = c * m12 + s * m22; dst[7] = c * m13 + s * m23;
                dst[8] = c * m20 - s * m10; dst[9] = c * m21 - s * m11; dst[10] = c * m22 - s * m12; dst[11] = c * m23 - s * m13;
                for (let i = 0; i < 16; i++) if (dst[i] === undefined) dst[i] = m[i];
                return dst;
            },
            yRotate: function(m, angleInRadians, dst) {
                dst = dst || new Float32Array(16);
                const c = Math.cos(angleInRadians); const s = Math.sin(angleInRadians);
                const m00 = m[0]; const m01 = m[1]; const m02 = m[2]; const m03 = m[3];
                const m20 = m[8]; const m21 = m[9]; const m22 = m[10]; const m23 = m[11];
                dst[0] = c * m00 - s * m20; dst[1] = c * m01 - s * m21; dst[2] = c * m02 - s * m22; dst[3] = c * m03 - s * m23;
                dst[8] = c * m20 + s * m00; dst[9] = c * m21 + s * m01; dst[10] = c * m22 + s * m02; dst[11] = c * m23 + s * m03;
                for (let i = 0; i < 16; i++) if (dst[i] === undefined) dst[i] = m[i];
                return dst;
            },
            zRotate: function(m, angleInRadians, dst) {
                dst = dst || new Float32Array(16);
                const c = Math.cos(angleInRadians); const s = Math.sin(angleInRadians);
                const m00 = m[0]; const m01 = m[1]; const m02 = m[2]; const m03 = m[3];
                const m10 = m[4]; const m11 = m[5]; const m12 = m[6]; const m13 = m[7];
                dst[0] = c * m00 + s * m10; dst[1] = c * m01 + s * m11; dst[2] = c * m02 + s * m12; dst[3] = c * m03 + s * m13;
                dst[4] = c * m10 - s * m00; dst[5] = c * m11 - s * m01; dst[6] = c * m12 - s * m02; dst[7] = c * m13 - s * m03;
                for (let i = 8; i < 16; i++) dst[i] = m[i];
                return dst;
            },
            axisRotation: function(axis, angleInRadians, dst) {
                dst = dst || new Float32Array(16);
                let x = axis[0]; let y = axis[1]; let z = axis[2];
                const n = Math.sqrt(x * x + y * y + z * z);
                x /= n; y /= n; z /= n;
                const xx = x * x; const yy = y * y; const zz = z * z;
                const c = Math.cos(angleInRadians); const s = Math.sin(angleInRadians);
                const oneMinusCosine = 1 - c;
                dst[0] = xx + (1 - xx) * c;
                dst[1] = x * y * oneMinusCosine + z * s;
                dst[2] = x * z * oneMinusCosine - y * s;
                dst[3] = 0;
                dst[4] = x * y * oneMinusCosine - z * s;
                dst[5] = yy + (1 - yy) * c;
                dst[6] = y * z * oneMinusCosine + x * s;
                dst[7] = 0;
                dst[8] = x * z * oneMinusCosine + y * s;
                dst[9] = y * z * oneMinusCosine - x * s;
                dst[10] = zz + (1 - zz) * c;
                dst[11] = 0;
                dst[12] = 0; dst[13] = 0; dst[14] = 0; dst[15] = 1;
                return dst;
            },
            axisRotate: function(m, axis, angleInRadians, dst) {
                return this.multiply(m, this.axisRotation(axis, angleInRadians), dst);
            },
            scaling: function(sx, sy, sz, dst) {
                dst = dst || new Float32Array(16);
                dst[0] = sx; dst[5] = sy; dst[10] = sz; dst[15] = 1;
                return dst;
            },
            scale: function(m, sx, sy, sz, dst) {
                dst = dst || new Float32Array(16);
                dst[0] = sx * m[0]; dst[1] = sx * m[1]; dst[2] = sx * m[2]; dst[3] = sx * m[3];
                dst[4] = sy * m[4]; dst[5] = sy * m[5]; dst[6] = sy * m[6]; dst[7] = sy * m[7];
                dst[8] = sz * m[8]; dst[9] = sz * m[9]; dst[10] = sz * m[10]; dst[11] = sz * m[11];
                for (let i = 12; i < 16; i++) dst[i] = m[i];
                return dst;
            },
            multiply: function(a, b, dst) {
                dst = dst || new Float32Array(16);
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        let sum = 0;
                        for (let k = 0; k < 4; k++) {
                            sum += a[k * 4 + j] * b[i * 4 + k];
                        }
                        dst[i * 4 + j] = sum;
                    }
                }
                return dst;
            },
            inverse: function(m, dst) {
                dst = dst || new Float32Array(16);
                const tmp = new Float32Array(16);
                const src = new Float32Array(16);
                for (let i = 0; i < 16; i++) src[i] = m[i];
                const det = this.determinate(src);
                if (Math.abs(det) < 0.000001) return null;
                for (let i = 0; i < 4; i++) {
                    const row = i * 4;
                    for (let j = 0; j < 4; j++) {
                        tmp[j * 4 + i] = this.cofactor(src, i, j) / det;
                    }
                }
                for (let i = 0; i < 16; i++) dst[i] = tmp[i];
                return dst;
            },
            transformVector: function(m, v, dst) {
                dst = dst || new Float32Array(4);
                for (let i = 0; i < 4; i++) {
                    dst[i] = 0;
                    for (let j = 0; j < 4; j++) {
                        dst[i] += v[j] * m[j * 4 + i];
                    }
                }
                return dst;
            },
            transformPoint: function(m, v, dst) {
                dst = dst || new Float32Array(3);
                const v0 = v[0]; const v1 = v[1]; const v2 = v[2];
                const d = v0 * m[3] + v1 * m[7] + v2 * m[11] + m[15];
                dst[0] = (v0 * m[0] + v1 * m[4] + v2 * m[8] + m[12]) / d;
                dst[1] = (v0 * m[1] + v1 * m[5] + v2 * m[9] + m[13]) / d;
                dst[2] = (v0 * m[2] + v1 * m[6] + v2 * m[10] + m[14]) / d;
                return dst;
            },
            transformDirection: function(m, v, dst) {
                dst = dst || new Float32Array(3);
                const v0 = v[0]; const v1 = v[1]; const v2 = v[2];
                dst[0] = v0 * m[0] + v1 * m[4] + v2 * m[8];
                dst[1] = v0 * m[1] + v1 * m[5] + v2 * m[9];
                dst[2] = v0 * m[2] + v1 * m[6] + v2 * m[10];
                return dst;
            },
            transformNormal: function(m, v, dst) {
                dst = dst || new Float32Array(3);
                const mi = this.inverse(m);
                const v0 = v[0]; const v1 = v[1]; const v2 = v[2];
                dst[0] = v0 * mi[0] + v1 * mi[1] + v2 * mi[2];
                dst[1] = v0 * mi[4] + v1 * mi[5] + v2 * mi[6];
                dst[2] = v0 * mi[8] + v1 * mi[9] + v2 * mi[10];
                return dst;
            },
            setDefaultType: function(Ctor) {
                const OldType = Float32Array;
                Float32Array = Ctor;
                return OldType;
            },
            quatFromRotationMatrix: function(m, dst) {
                const m11 = m[0]; const m12 = m[4]; const m13 = m[8];
                const m21 = m[1]; const m22 = m[5]; const m23 = m[9];
                const m31 = m[2]; const m32 = m[6]; const m33 = m[10];
                const trace = m11 + m22 + m33;
                if (trace > 0) {
                    const s = 0.5 / Math.sqrt(trace + 1);
                    dst[3] = 0.25 / s;
                    dst[0] = (m32 - m23) * s;
                    dst[1] = (m13 - m31) * s;
                    dst[2] = (m21 - m12) * s;
                } else if (m11 > m22 && m11 > m33) {
                    const s = 2 * Math.sqrt(1 + m11 - m22 - m33);
                    dst[3] = (m32 - m23) / s;
                    dst[0] = 0.25 * s;
                    dst[1] = (m12 + m21) / s;
                    dst[2] = (m13 + m31) / s;
                } else if (m22 > m33) {
                    const s = 2 * Math.sqrt(1 + m22 - m11 - m33);
                    dst[3] = (m13 - m31) / s;
                    dst[0] = (m12 + m21) / s;
                    dst[1] = 0.25 * s;
                    dst[2] = (m23 + m32) / s;
                } else {
                    const s = 2 * Math.sqrt(1 + m33 - m11 - m22);
                    dst[3] = (m21 - m12) / s;
                    dst[0] = (m13 + m31) / s;
                    dst[1] = (m23 + m32) / s;
                    dst[2] = 0.25 * s;
                }
            },
            determinate: function(m) {
                const m00 = m[0]; const m01 = m[1]; const m02 = m[2]; const m03 = m[3];
                const m10 = m[4]; const m11 = m[5]; const m12 = m[6]; const m13 = m[7];
                const m20 = m[8]; const m21 = m[9]; const m22 = m[10]; const m23 = m[11];
                const m30 = m[12]; const m31 = m[13]; const m32 = m[14]; const m33 = m[15];
                return (
                    m03 * m12 * m21 * m30 - m02 * m13 * m21 * m30 - m03 * m11 * m22 * m30 + m01 * m13 * m22 * m30 +
                    m02 * m11 * m23 * m30 - m01 * m12 * m23 * m30 - m03 * m12 * m20 * m31 + m02 * m13 * m20 * m31 +
                    m03 * m10 * m22 * m31 - m00 * m13 * m22 * m31 - m02 * m10 * m23 * m31 + m00 * m12 * m23 * m31 +
                    m03 * m11 * m20 * m32 - m01 * m13 * m20 * m32 - m03 * m10 * m21 * m32 + m00 * m13 * m21 * m32 +
                    m01 * m10 * m23 * m32 - m00 * m11 * m23 * m32 - m02 * m11 * m20 * m33 + m01 * m12 * m20 * m33 +
                    m02 * m10 * m21 * m33 - m00 * m12 * m21 * m33 - m01 * m10 * m22 * m33 + m00 * m11 * m22 * m33
                );
            },
            cofactor: function(m, row, col) {
                const temp = [];
                let count = 0;
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        if (i !== row && j !== col) {
                            temp[count++] = m[i * 4 + j];
                        }
                    }
                }
                const a = temp[0]; const b = temp[1]; const c = temp[2];
                const d = temp[3]; const e = temp[4]; const f = temp[5];
                const g = temp[6]; const h = temp[7]; const i = temp[8];
                const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
                return ((row + col) % 2 === 0 ? 1 : -1) * det;
            }
        };

        this.webGLUtils = {
            createAugmentedTypedArray: function(numComponents, numElements, opt_type) {
                const Type = opt_type || Float32Array;
                const array = new Type(numComponents * numElements);
                let cursor = 0;
                array.push = function() {
                    for (let i = 0; i < arguments.length; i++) {
                        const value = arguments[i];
                        if (Array.isArray(value) || (value.buffer instanceof ArrayBuffer)) {
                            for (let j = 0; j < value.length; j++) {
                                array[cursor++] = value[j];
                            }
                        } else {
                            array[cursor++] = value;
                        }
                    }
                };
                array.reset = function(opt_index) { cursor = opt_index || 0; };
                array.numComponents = numComponents;
                Object.defineProperty(array, 'numElements', {
                    get: function() { return this.length / this.numComponents | 0; }
                });
                return array;
            },
            createAttribsFromArrays: function(gl, arrays, opt_mapping) {
                const mapping = opt_mapping || (() => {
                    const map = {};
                    for (const key in arrays) {
                        if (key !== 'indices') map['a_' + key] = key;
                    }
                    return map;
                })();
                const attribs = {};
                for (const attribName in mapping) {
                    const bufferName = mapping[attribName];
                    const origArray = arrays[bufferName];
                    if (origArray.value) {
                        attribs[attribName] = { value: origArray.value };
                    } else {
                        const array = this.makeTypedArray(origArray, bufferName);
                        attribs[attribName] = {
                            buffer: this.createBufferFromTypedArray(gl, array),
                            numComponents: origArray.numComponents || array.numComponents || this.guessNumComponentsFromName(bufferName, array.length),
                            type: this.getGLTypeForTypedArray(gl, array),
                            normalize: this.getNormalizationForTypedArray(array)
                        };
                    }
                }
                return attribs;
            },
            createBuffersFromArrays: function(gl, arrays) {
                const buffers = {};
                for (const key in arrays) {
                    const type = key === 'indices' ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
                    const array = this.makeTypedArray(arrays[key], key);
                    buffers[key] = this.createBufferFromTypedArray(gl, array, type);
                }
                if (arrays.indices) buffers.numElements = arrays.indices.length;
                else if (arrays.position) buffers.numElements = arrays.position.length / 3;
                return buffers;
            },
            createBufferInfoFromArrays: function(gl, arrays, opt_mapping) {
                const bufferInfo = { attribs: this.createAttribsFromArrays(gl, arrays, opt_mapping) };
                let indices = arrays.indices;
                if (indices) {
                    indices = this.makeTypedArray(indices, 'indices');
                    bufferInfo.indices = this.createBufferFromTypedArray(gl, indices, gl.ELEMENT_ARRAY_BUFFER);
                    bufferInfo.numElements = indices.length;
                } else {
                    bufferInfo.numElements = this.getNumElementsFromNonIndexedArrays(arrays);
                }
                return bufferInfo;
            },
            createAttributeSetters: function(gl, program) {
                const attribSetters = {};
                const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
                for (let i = 0; i < numAttribs; i++) {
                    const attribInfo = gl.getActiveAttrib(program, i);
                    if (!attribInfo) break;
                    const index = gl.getAttribLocation(program, attribInfo.name);
                    attribSetters[attribInfo.name] = function(b) {
                        if (b.value) {
                            gl.disableVertexAttribArray(index);
                            if (b.value.length === 4) gl.vertexAttrib4fv(index, b.value);
                            else if (b.value.length === 3) gl.vertexAttrib3fv(index, b.value);
                            else if (b.value.length === 2) gl.vertexAttrib2fv(index, b.value);
                            else if (b.value.length === 1) gl.vertexAttrib1fv(index, b.value);
                        } else {
                            gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
                            gl.enableVertexAttribArray(index);
                            gl.vertexAttribPointer(index, b.numComponents || b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
                        }
                    };
                }
                return attribSetters;
            },
            createProgram: function(gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
                const errFn = opt_errorCallback || function(msg) { console.error(msg); };
                const program = gl.createProgram();
                shaders.forEach(shader => gl.attachShader(program, shader));
                if (opt_attribs) {
                    opt_attribs.forEach((attrib, ndx) => {
                        gl.bindAttribLocation(program, opt_locations ? opt_locations[ndx] : ndx, attrib);
                    });
                }
                gl.linkProgram(program);
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    errFn('Error in program linking:' + gl.getProgramInfoLog(program));
                    gl.deleteProgram(program);
                    return null;
                }
                return program;
            },
            createProgramFromScripts: function(gl, shaderScriptIds, opt_attribs, opt_locations, opt_errorCallback) {
                const shaders = shaderScriptIds.map(id => {
                    const shaderScript = document.getElementById(id);
                    if (!shaderScript) throw '*** Error: unknown script element' + id;
                    let shaderType;
                    if (shaderScript.type === 'x-shader/x-vertex') shaderType = gl.VERTEX_SHADER;
                    else if (shaderScript.type === 'x-shader/x-fragment') shaderType = gl.FRAGMENT_SHADER;
                    return this.loadShader(gl, shaderScript.text, shaderType, opt_errorCallback);
                });
                return this.createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
            },
            createProgramFromSources: function(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
                const defaultShaderType = ['VERTEX_SHADER', 'FRAGMENT_SHADER'];
                const shaders = shaderSources.map((source, i) => {
                    return this.loadShader(gl, source, gl[defaultShaderType[i]], opt_errorCallback);
                });
                return this.createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
            },
            createProgramInfo: function(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
                shaderSources = shaderSources.map(source => {
                    const script = document.getElementById(source);
                    return script ? script.text : source;
                });
                const program = this.createProgramFromSources(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback);
                if (!program) return null;
                return {
                    program: program,
                    uniformSetters: this.createUniformSetters(gl, program),
                    attribSetters: this.createAttributeSetters(gl, program)
                };
            },
            createUniformSetters: function(gl, program) {
                let textureUnit = 0;
                const uniformSetters = {};
                const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
                for (let i = 0; i < numUniforms; i++) {
                    const uniformInfo = gl.getActiveUniform(program, i);
                    if (!uniformInfo) break;
                    let name = uniformInfo.name;
                    if (name.endsWith('[0]')) name = name.slice(0, -3);
                    const location = gl.getUniformLocation(program, uniformInfo.name);
                    const isArray = uniformInfo.size > 1 && uniformInfo.name.endsWith('[0]');
                    const type = uniformInfo.type;
                    let setter;
                    if (type === gl.FLOAT && isArray) setter = v => gl.uniform1fv(location, v);
                    else if (type === gl.FLOAT) setter = v => gl.uniform1f(location, v);
                    else if (type === gl.FLOAT_VEC2) setter = v => gl.uniform2fv(location, v);
                    else if (type === gl.FLOAT_VEC3) setter = v => gl.uniform3fv(location, v);
                    else if (type === gl.FLOAT_VEC4) setter = v => gl.uniform4fv(location, v);
                    else if (type === gl.INT && isArray) setter = v => gl.uniform1iv(location, v);
                    else if (type === gl.INT) setter = v => gl.uniform1i(location, v);
                    else if (type === gl.INT_VEC2) setter = v => gl.uniform2iv(location, v);
                    else if (type === gl.INT_VEC3) setter = v => gl.uniform3iv(location, v);
                    else if (type === gl.INT_VEC4) setter = v => gl.uniform4iv(location, v);
                    else if (type === gl.BOOL) setter = v => gl.uniform1iv(location, v);
                    else if (type === gl.BOOL_VEC2) setter = v => gl.uniform2iv(location, v);
                    else if (type === gl.BOOL_VEC3) setter = v => gl.uniform3iv(location, v);
                    else if (type === gl.BOOL_VEC4) setter = v => gl.uniform4iv(location, v);
                    else if (type === gl.FLOAT_MAT2) setter = v => gl.uniformMatrix2fv(location, false, v);
                    else if (type === gl.FLOAT_MAT3) setter = v => gl.uniformMatrix3fv(location, false, v);
                    else if (type === gl.FLOAT_MAT4) setter = v => gl.uniformMatrix4fv(location, false, v);
                    else if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
                        const units = Array.from({length: uniformInfo.size}, () => textureUnit++);
                        setter = textures => {
                            gl.uniform1iv(location, units);
                            textures.forEach((texture, i) => {
                                gl.activeTexture(gl.TEXTURE0 + units[i]);
                                gl.bindTexture(this.getBindPointForSamplerType(gl, type), texture);
                            });
                        };
                    } else if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
                        const unit = textureUnit++;
                        setter = texture => {
                            gl.uniform1i(location, unit);
                            gl.activeTexture(gl.TEXTURE0 + unit);
                            gl.bindTexture(this.getBindPointForSamplerType(gl, type), texture);
                        };
                    }
                    uniformSetters[name] = setter;
                }
                return uniformSetters;
            },
            createVAOAndSetAttributes: function(gl, setters, attribs, indices) {
                const vao = gl.createVertexArray();
                gl.bindVertexArray(vao);
                this.setAttributes(setters, attribs);
                if (indices) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
                gl.bindVertexArray(null);
                return vao;
            },
            createVAOFromBufferInfo: function(gl, programInfo, bufferInfo) {
                return this.createVAOAndSetAttributes(gl, programInfo.attribSetters || programInfo, bufferInfo.attribs, bufferInfo.indices);
            },
            drawBufferInfo: function(gl, bufferInfo, primitiveType, count, offset) {
                primitiveType = primitiveType || gl.TRIANGLES;
                const numElements = count || bufferInfo.numElements;
                offset = offset || 0;
                if (bufferInfo.indices) {
                    gl.drawElements(primitiveType, numElements, gl.UNSIGNED_SHORT, offset);
                } else {
                    gl.drawArrays(primitiveType, offset, numElements);
                }
            },
            drawObjectList: function(gl, objectsToDraw) {
                let lastUsedProgramInfo = null;
                let lastUsedBufferInfo = null;
                objectsToDraw.forEach(object => {
                    const programInfo = object.programInfo;
                    const bufferInfo = object.bufferInfo;
                    if (programInfo !== lastUsedProgramInfo) {
                        gl.useProgram(programInfo.program);
                        lastUsedProgramInfo = programInfo;
                    }
                    if (bufferInfo !== lastUsedBufferInfo) {
                        this.setBuffersAndAttributes(gl, programInfo.attribSetters, bufferInfo);
                        lastUsedBufferInfo = bufferInfo;
                    }
                    this.setUniforms(programInfo.uniformSetters, object.uniforms);
                    this.drawBufferInfo(gl, bufferInfo);
                });
            },
            glEnumToString: function(gl, v) {
                const results = [];
                for (const key in gl) {
                    if (gl[key] === v) results.push(key);
                }
                return results.length ? results.join(' | ') : `0x${v.toString(16)}`;
            },
            getExtensionWithKnownPrefixes: function(gl, name) {
                const prefixes = ['', 'MOZ_', 'OP_', 'WEBKIT_'];
                for (const prefix of prefixes) {
                    const ext = gl.getExtension(prefix + name);
                    if (ext) return ext;
                }
                return undefined;
            },
            resizeCanvasToDisplaySize: function(canvas, multiplier) {
                multiplier = multiplier || 1;
                const width = Math.floor(canvas.clientWidth * multiplier);
                const height = Math.floor(canvas.clientHeight * multiplier);
                if (canvas.width !== width || canvas.height !== height) {
                    canvas.width = width;
                    canvas.height = height;
                    return true;
                }
                return false;
            },
            setAttributes: function(setters, attribs) {
                setters = setters.attribSetters || setters;
                for (const name in attribs) {
                    if (setters[name]) setters[name](attribs[name]);
                }
            },
            setBuffersAndAttributes: function(gl, setters, buffers) {
                this.setAttributes(setters, buffers.attribs);
                if (buffers.indices) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
            },
            setUniforms: function(setters, ...values) {
                setters = setters.uniformSetters || setters;
                values.forEach(uniforms => {
                    for (const name in uniforms) {
                        if (setters[name]) setters[name](uniforms[name]);
                    }
                });
            },
            loadShader: function(gl, shaderSource, shaderType, opt_errorCallback) {
                const errFn = opt_errorCallback || function(msg) { console.error(msg); };
                const shader = gl.createShader(shaderType);
                gl.shaderSource(shader, shaderSource);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    errFn('Shader compile error: ' + gl.getShaderInfoLog(shader) + '\n' + shaderSource);
                    gl.deleteShader(shader);
                    return null;
                }
                return shader;
            },
            getBindPointForSamplerType: function(gl, type) {
                if (type === gl.SAMPLER_2D) return gl.TEXTURE_2D;
                if (type === gl.SAMPLER_CUBE) return gl.TEXTURE_CUBE_MAP;
                return undefined;
            },
            makeTypedArray: function(array, name) {
                if (array.buffer instanceof ArrayBuffer) return array;
                if (array.data && array.data.buffer instanceof ArrayBuffer) return array.data;
                if (Array.isArray(array)) array = { data: array };
                if (!array.numComponents) array.numComponents = this.guessNumComponentsFromName(name, array.data.length);
                let type = array.type;
                if (!type && name === 'indices') type = Uint16Array;
                const typedArray = this.createAugmentedTypedArray(array.numComponents, array.data.length / array.numComponents | 0, type);
                typedArray.push(array.data);
                return typedArray;
            },
            getGLTypeForTypedArray: function(gl, typedArray) {
                if (typedArray instanceof Int8Array) return gl.BYTE;
                if (typedArray instanceof Uint8Array) return gl.UNSIGNED_BYTE;
                if (typedArray instanceof Int16Array) return gl.SHORT;
                if (typedArray instanceof Uint16Array) return gl.UNSIGNED_SHORT;
                if (typedArray instanceof Int32Array) return gl.INT;
                if (typedArray instanceof Uint32Array) return gl.UNSIGNED_INT;
                if (typedArray instanceof Float32Array) return gl.FLOAT;
                throw 'unsupported typed array type';
            },
            getNormalizationForTypedArray: function(typedArray) {
                return typedArray instanceof Int8Array || typedArray instanceof Uint8Array;
            },
            guessNumComponentsFromName: function(name, length) {
                let numComponents;
                if (name.includes('coord')) numComponents = 2;
                else if (name.includes('color')) numComponents = 4;
                else numComponents = 3;
                if (length % numComponents !== 0) throw 'Can not guess numComponents';
                return numComponents;
            },
            getNumElementsFromNonIndexedArrays: function(arrays) {
                const positionKeys = ['position', 'positions', 'a_position'];
                let key = positionKeys.find(k => k in arrays) || Object.keys(arrays)[0];
                const array = arrays[key];
                const data = array.data || array;
                const numComponents = this.guessNumComponentsFromName(key, data.length);
                return data.length / numComponents;
            },
            createBufferFromTypedArray: function(gl, array, type, drawType) {
                type = type || gl.ARRAY_BUFFER;
                const buffer = gl.createBuffer();
                gl.bindBuffer(type, buffer);
                gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
                return buffer;
            }
        };
    }
}

export default ThreeDThings;