var gl;

var squareVerticesBuffer;
var triangleVerticesBuffer;

var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
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

  // The first thing we should do is look up the location of the attribute for the program we just created
  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);
}

// function getShader(gl, id) {
//   var shaderScript, theSource, currentChild, shader;

//   shaderScript = document.getElementById(id);

//   if (!shaderScript) {
//     return null;
//   }

//   theSource = "";
//   currentChild = shaderScript.firstChild;

//   while(currentChild) {
//     if (currentChild.nodeType == 3) {
//       theSource += currentChild.textContent;
//     }
//     currentChild = currentChild.nextSibling;
//   }
//   // 片段着色器 
//   if (shaderScript.type == 'x-shader/x-fragment') {
//     shader = gl.createShader(gl.FRAGMENT_SHADER);
//   }
//   // 定点着色器 
//   else if (shaderScript.type == "x-shader/x-vertex") {
//     shader = gl.createShader(gl.VERTEX_SHADER);
//   } else {
//     // Unknown shader type
//     return null;
//   }

//   // send
//   return shader;
// }

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
  squareVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

  var vertices = [
    1.0,  1.0,  0.0,
    -1.0, 1.0,  0.0,
    1.0,  -1.0,  0.0,
    -1.0, -1.0,  0.0
  ];

  // 通过 Float32Array  将普通的 JS 列表变为可被 WebGL 处理的 buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  triangleVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerticesBuffer);
  vertices = [
    1.0,  1.0,  0.0,
    -1.0, 1.0,  0.0,
    // 1.0,  -1.0,  0.0,
    -1.0, -1.0,  0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
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
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  
  // setMatrixUniforms 函数将会超越网页文件的范畴，将以上的矩阵操作推送到到显卡
  setMatrixUniforms();

  // 换一种通俗的说法就是“用之前我给你的顶点数组来绘制一个三角形，顶点从 0 到 3”。
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  mvTranslate([3, 0.0, 0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
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

