import { useEffect, useRef } from "react";

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

        float t = sin(u_time + finalPattern) * 0.5 + 0.5;
        vec3 black = vec3(0.0);
        vec3 turquoise = vec3(0.0, 1.0, 1.0);
        vec3 purple = vec3(0.5, 0.0, 0.5);

        vec3 color = mix(turquoise, purple, t);
        color = mix(black, color, smoothstep(0.2, 0.8, finalPattern));

        gl_FragColor = vec4(color, 1.0);
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

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

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

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", updateOffset);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full">
      {/* Canvas Psicodélico */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-90"
      />
      {/* Imagem sobreposta */}
      <img
        src="https://i.ibb.co/jPSYgp4d/friend.png"
        alt="Friend"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          height: "100vh",
          width: "auto",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default PsychedelicArt;
