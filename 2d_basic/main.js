var ctx, canvas;

function Point(x = 0, y = 0) {
  this.x = x;
  this.y = y;
}

Point.prototype.clone = function() {
  var new_point = new Point(this.x, this.y);
};

Point.prototype.move = function(dx, dy) {
  this.x += dx;
  this.y += dy;
};

var p_1 = new Point(4,5);
var p_2 = new Point(320, 256);

function start() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgb(200,0,0)';
  draw_line(p_1, p_2);
  

  var p3 = new Point(p_1.x, p_1.y+20);
  var p4 = new Point(p_2.x, p_2.y+20);
  draw_line_2(p3, p4);

  // ctx.beginPath();
  // ctx.moveTo(50, 50);
  // ctx.lineTo(100, 100);
  // ctx.stroke();
  var R = 400;
  for (var x = 0; x<R; x++) {
    var y = Math.sqrt(R*R - x*x);
    draw_point(x, Math.floor(y+0.5));
  }
}

function draw_point(x, y) {
  ctx.fillRect(x, y, 1, 1);
}

function draw_line(p1, p2) {
  var m = slope(p1, p2);
  var S = p1.x < p2.x ? p1 : p2;
  var E = p1.x < p2.x ? p2 : p1;

  var x = S.x;
  var y = S.y;
  var a = E.y - y, b = x - E.x;
  
  var d = 2*a + b;
  var IncE = 2*a;
  var IncNE = (a+b)*2;

  while(x < E.x) {
    if (d<= 0) {
      x++;
      d += IncE;
    } else {
      x++;
      y++;
      d += IncNE;
    }
    draw_point(x, y);
  }
}

// 
function draw_line_2(p1, p2) {
  var m = slope(p1, p2);
  var S = p1.x < p2.x ? p1 : p2;
  var E = p1.x < p2.x ? p2 : p1;
  var x = S.x;
  var y = S.y;
  while (x <= E.x) {
    draw_point(x, Math.round(y));
    x++;
    y++;
  }
}


function slope(p1, p2) {
  return (p2.y - p1.y) / (p2.x - p1.x);
}