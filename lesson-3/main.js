var gl;

var squareVertexColorBuffer;
var squareVertexPositionBuffer;
var triangleVertexColorBuffer;
var triangleVertexPositionBuffer;

var mvMatrix;
var shaderProgram;
var perspectiveMatrix;

var horizAspect = 480.0/640.0;

var rTri = 0;
var rSquare = 0;

var deg = 0;

function start() {
  var canvas = document.getElementById('glcanvas');
  gl = initWebGL(canvas);
  if (gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    
    gl.viewport(0, 0, canvas.width, canvas.height);

    initShaders();
    initBuffers();

    // drawScene();
    tick();
    // setInterval(drawScene, 15);
  }
}

function initWebGL(canvas) {
  window.gl = null;
  try {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
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
  var fragmentShader = getShader(gl, 'shader-fs');
  var vertexShader = getShader(gl, 'shader-vs');

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor');
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
      return null;
    }
  }

  shader = gl.createShader(type);
  gl.shaderSource(shader, theSource);

  gl.compileShader(shader);

  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));  
    gl.deleteShader(shader);
    return null;  
  }
  return shader;
}

function initBuffers() {
  squareVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  var vertices = [
    1.0,  1.0,  0.0,
    -1.0, 1.0,  0.0,
    1.0,  -1.0,  0.0,
    -1.0, -1.0,  0.0
  ];
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

mvMatrix = Matrix.I(4);
var mvMatrixStack = [];

function mvPushMatrix() {
  var copy = mvMatrix.dup();
  mvMatrixStack.push(copy);
}

function mvPopMatrix() {
  if (mvMatrixStack.length == 0) {
    throw "Invalid popMatrix!";
  }
  mvMatrix = mvMatrixStack.pop();
}

function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  perspectiveMatrix = makePerspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
  loadIdentity();
  mvTranslate([-1.5, 0.0, -10.0]);
  // mvTranslate([-1.5, 0.0, -10.0]);
  mvPushMatrix();
  mvRotate(deg, 3, 'x');
  // mvRotate(deg, 3, 'x');
  // mvTranslate([-1.5, 0.0, 0.0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
  mvPopMatrix();

  // // loadIdentity();
  // mvTranslate([1.5, 0.0, -10.0]);
  // mvPushMatrix();
  // mvRotate(deg, 3, 'z');
  // // mvRotate(Math.PI/3 , 3, 'z')

  // gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  // gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  // gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
  // gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexColorBuffer.itemSize,gl.FLOAT, false, 0, 0);
  // setMatrixUniforms();
  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, triangleVertexPositionBuffer.numItems);
  // mvPopMatrix();
}

var lastTime = 0;

function animate() {
  var timeNow = new Date().getTime();
  if (lastTime != 0) {
    var elapsed = timeNow - lastTime;

    deg += (90 * elapsed) / 1000.0;
    // rSquare += (75 * elapsed) / 1000.0;
  }
  lastTime = timeNow;
}

function tick() {
  requestAnimationFrame(tick);
  drawScene();
  animate();
  // deg++;
}

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvRotate(deg, dimesion, axis) {
  var cos_deg = Math.cos(deg*Math.PI/360);
  var sin_deg = Math.cos(deg*Math.PI/360);
  if (dimesion === 3) {
    var r = Matrix.I(4);
    if (axis == 'x') {
      r.elements[1][1] = cos_deg;
      r.elements[1][2] = -sin_deg;
      r.elements[2][1] = sin_deg;
      r.elements[2][2] = cos_deg;
    } else if (axis == 'y') {
      r.elements[0][0] = cos_deg;
      r.elements[0][2] = sin_deg;
      r.elements[2][0] = -sin_deg;
      r.elements[2][2] = cos_deg;
    } else {
      r.elements[0][0] = cos_deg;
      r.elements[0][1] = -sin_deg;
      r.elements[1][0] = sin_deg;
      r.elements[1][1] = cos_deg;
    }
    // console.log('r:', r);
    multMatrix(r.ensure4x4());
    // return r;
    return;
  } else if (dimesion === 2) {
    var r = Matrix.I(3);
    r.elements[0][0] = cos_deg;
    r.elements[0][1] = -sin_deg;
    r.elements[1][0] = sin_deg;
    r.elements[1][1] = cos_deg;
    multMatrix(r);
    // return r;
    return;
  }
  throw "Invalid lenght for Ratation"
}

function mvTranslate(v) {
  var t_m = Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4();
  // multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
  // console.log('translate:', t_m);
  multMatrix(t_m);
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

