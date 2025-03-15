import { useEffect, useRef } from "react";

const vertexShaderSource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_offset;
  
  void main() {
    vec2 uv = (gl_FragCoord.xy - u_offset) / u_resolution.xy;
    vec2 p = uv - 0.5;
    p.x *= u_resolution.x / u_resolution.y;
    
    float len = length(p);
    float angle = atan(p.y, p.x);
    
    float pattern = cos(10.0 * angle - u_time) * sin(10.0 * len + u_time);
    float shapePattern = cos(len * 15.0 - u_time) * sin(angle * 12.0 + u_time);
    float finalPattern = mix(pattern, shapePattern, 0.7);
    
    float colorR = cos(u_time - angle * 5.0 - finalPattern) * 0.5 + 0.5;
    float colorG = cos(u_time - len * 10.0 + finalPattern) * 0.5 + 0.5;
    float colorB = sin(u_time * 0.5 - angle * 2.0 - finalPattern) * 0.5 + 0.5;
    
    gl_FragColor = vec4(colorR, colorG, colorB, 1.0);
  }
`;

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const createProgram = (gl, vertexShader, fragmentShader) => {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    return null;
  }
  return program;
};

const PsychedelicArt = () => {
  const canvasRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl");
    if (!gl) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      document.body.style.overflow = "hidden";
      document.body.style.cursor = "none";
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const offsetLocation = gl.getUniformLocation(program, "u_offset");
    
    gl.useProgram(program);
    
    const updateOffset = (event) => {
      offsetRef.current.x = event.clientX - window.innerWidth / 2;
      offsetRef.current.y = event.clientY - window.innerHeight / 2;
    };
    window.addEventListener("mousemove", updateOffset);
    
    const render = (time) => {
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time * 0.001);
      gl.uniform2f(offsetLocation, offsetRef.current.x * 0.1, offsetRef.current.y * 0.1);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    };
    render(0);
    
    const keepScreenAwake = () => {
      if (document.visibilityState === "visible") {
        const video = document.createElement("video");
        video.src = "data:video/mp4;base64,AAAA";
        video.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", keepScreenAwake);
    keepScreenAwake();
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", updateOffset);
      document.removeEventListener("visibilitychange", keepScreenAwake);
    };
  }, []);
  
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-90" />
    </div>
  );
};

export default PsychedelicArt;
