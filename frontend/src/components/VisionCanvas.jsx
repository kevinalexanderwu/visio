import { useEffect, useRef, useState } from 'react';
import fragmentShaderSource from '../shaders/vision.frag?raw';

const vertexSource = `attribute vec2 aPosition; varying vec2 vUv; void main(){ vUv=(aPosition+1.0)*0.5; gl_Position=vec4(aPosition,0.0,1.0); }`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source); gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

export default function VisionCanvas({ values }) {
  const canvasRef = useRef(null);
  const valuesRef = useRef(values);
  const [status, setStatus] = useState('loading');
  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if (!gl) { setStatus('unsupported'); return; }
    let program;
    let frame;
    let alive = true;
    const image = new Image(); const depth = new Image();
    const fail = () => { if (alive) setStatus('missing'); };
    image.onerror = fail; depth.onerror = fail;
    image.onload = () => { if (depth.complete && depth.naturalWidth) initialize(); };
    depth.onload = () => { if (image.complete && image.naturalWidth) initialize(); };
    function texture(img, unit, grayscale = false) {
      const tex = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      if (grayscale) gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, img);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      return tex;
    }
    function initialize() {
      if (!alive) return;
      if (image.naturalWidth !== depth.naturalWidth || image.naturalHeight !== depth.naturalHeight) { setStatus('dimensions'); return; }
      try {
        program = gl.createProgram();
        gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource));
        gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)); gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
        gl.useProgram(program);
        const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(program, 'aPosition'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        texture(image, 0); texture(depth, 1, true);
        gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0); gl.uniform1i(gl.getUniformLocation(program, 'uDepth'), 1);
        gl.uniform2f(gl.getUniformLocation(program, 'uTexel'), 1 / image.naturalWidth, 1 / image.naturalHeight);
        setStatus('ready');
        const draw = () => {
          if (!alive) return;
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const w = Math.max(1, canvas.clientWidth * dpr | 0); const h = Math.max(1, canvas.clientHeight * dpr | 0);
          if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
          gl.viewport(0, 0, w, h);
          const v = valuesRef.current;
          gl.uniform1f(gl.getUniformLocation(program, 'uMinus'), v.minus);
          gl.uniform1f(gl.getUniformLocation(program, 'uPlus'), v.plus);
          gl.uniform1f(gl.getUniformLocation(program, 'uCylinder'), v.cylinder);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); frame = requestAnimationFrame(draw);
        };
        draw();
      } catch (e) { console.error('WebGL initialization failed', e); setStatus('unsupported'); }
    }
    image.src = '/assets/scene.jpg'; depth.src = '/assets/scene-depth.png';
    return () => { alive = false; cancelAnimationFrame(frame); };
  }, []);

  return <div className="preview"><canvas ref={canvasRef} aria-label="Depth-aware vision simulation" />
    {status !== 'ready' && <div className="asset-message"><div className="asset-icon">◌</div><strong>{status === 'loading' ? 'Loading scene…' : status === 'unsupported' ? 'WebGL unavailable' : status === 'dimensions' ? 'Asset dimensions do not match' : 'Add your scene assets'}</strong><p>{status === 'missing' ? 'Place one POV photograph at public/assets/scene.jpg and its matching grayscale depth map at public/assets/scene-depth.png.' : status === 'dimensions' ? 'The photograph and depth map must have identical pixel dimensions.' : status === 'unsupported' ? 'Enable WebGL in a supported browser to run the simulation.' : 'Preparing the image and depth map.'}</p>{status === 'missing' && <code>public/assets/scene.jpg<br/>public/assets/scene-depth.png</code>}</div>}
  </div>;
}
