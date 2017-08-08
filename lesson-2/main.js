var gl;

var squareVertexColorBuffer;
var squareVertexPositionBuffer;
var triangleVertexColorBuffer;
var triangleVertexPositionBuffer;

var mvMatrix;
var shaderProgram;
var perspectiveMatrix;

var horizAspect = 480.0/640.0;


function start() {
  var canvas = document.getElementById("glcanvas");

  gl = initWebGL(canvas);

  if (gl) {
    // 设置清除颜色为黑色，不透明
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 开启“深度测试”, Z-缓存
    gl.enable(gl.DEPTH_TEST);
    // 设置深度测试，近的物体遮挡远的物体
    gl.depthFunc(gl.LEQUAL);
    // 清除颜色和深度缓存
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    
    gl.viewport(0, 0, canvas.width, canvas.height);

    initShaders();
    initBuffers();
    setInterval(drawScene, 15);
  }
}

// 创建 WebGL 上下文
function initWebGL(canvas) {
  window.gl = null;
  try {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  } catch(e) {
    console.log(e);
  }

  if (!gl) {
    alert("WebGL初始化失败， 可能是因为您的浏览器不支持");
    gl = null;
  }

  return gl;
}

function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");

  // 创建着色器
  // Program是系统中原生于WebGL里的二进制码，你可以把它看作是一种在显卡中运行指定指令的方法
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // 如果创建着色器失败
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMatrix');
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');
}

function getShader(gl, id, type) {
  var shaderScript, theSource, currentChild, shader;
  
  shaderScript = document.getElementById(id);
  
  if (!shaderScript) {
    return null;
  }
  
  theSource = shaderScript.text;
  if (!type) {
    if (shaderScript.type == 'x-shader/x-fragment') {
      type = gl.FRAGMENT_SHADER;
    } else if (shaderScript.type == 'x-shader/x-vertex') {
      type = gl.VERTEX_SHADER;
    } else {
      // Unknown shader type
      return null;
    }
  }
  shader = gl.createShader(type);
  gl.shaderSource(shader, theSource);
    
  // Compile the shader program
  gl.compileShader(shader);  
    
  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
      console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));  
      gl.deleteShader(shader);
      return null;  
  }
    
  return shader;
}

function initBuffers() {
  //  buffer 是存储在显卡中的，对于大型大的绘图，这样会更加有效率
  squareVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  var vertices = [
    1.0,  1.0,  0.0,
    -1.0, 1.0,  0.0,
    1.0,  -1.0,  0.0,
    -1.0, -1.0,  0.0
  ];
  // 通过 Float32Array  将普通的 JS 列表变为可被 WebGL 处理的 buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  squareVertexPositionBuffer.itemSize = 3;
  squareVertexPositionBuffer.numItems = 4;

  squareVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
  // 一个点对应一个颜色
  var colors = [
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.5, 0.5, 0.5, 0.5
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  squareVertexColorBuffer.itemSize = 4;
  squareVertexColorBuffer.numItems = 4;

  triangleVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  vertices = [
    0.0,  1.0,  0.0,
    -1.0, -1.0,  0.0,
    1.0, -1.0,  0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  triangleVertexPositionBuffer.itemSize = 3;
  triangleVertexPositionBuffer.numItems = 3;

  triangleVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
  var colors = [
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  triangleVertexColorBuffer.itemSize = 4;
  triangleVertexColorBuffer.numItems = 3;

}


function drawScene() {
  // 用背景色擦除上下文
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // 建立摄像机透视矩阵
  perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);

  loadIdentity();

  // 把正方形放在距离摄像机6个单位的的位置
  mvTranslate([-1.5, 0.0, -6.0]);

  // 如果要使用一个数组对象，就需要调用 gl.bindBuffer 来将其指定为当前数组对象，然后在调用
  // 代码进行操作。
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  /**
   * // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration (Must be 1, 2, 3 or 4)
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data, 对于 gl.FLOAT 来说，这个参数是没有效果的
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset)
   */
  // it binds the current ARRAY_BUFFER to the attribute.
  // 第一个参数: A GLuint specifying the index of the vertex attribute that is to be modified.
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  // setMatrixUniforms 函数将会超越网页文件的范畴，将以上的矩阵操作推送到到显卡
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);

  mvTranslate([3, 0.0, 0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexColorBuffer.itemSize,gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, triangleVertexPositionBuffer.numItems);
}

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

