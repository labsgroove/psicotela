import { useEffect, useRef } from "react";

const vertexShaderSource = `...`; // (mantém igual)
const fragmentShaderSource = `...`; // (mantém igual)

const createShader = (gl, type, source) => { ... }; // (mantém igual)
const createProgram = (gl, vertexShader, fragmentShader) => { ... }; // (mantém igual)

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
    <div className="fixed top-0 left-0 w-full h-full">
      {/* Canvas de fundo psicodélico */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-90"
      />
      {/* Imagem sobreposta ocupando altura da tela */}
      <img
        src="https://i.ibb.co/jPSYgp4d/friend.png"
        alt="Friend"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "auto",
          minWidth: "100vw",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default PsychedelicArt;
