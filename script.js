const body = document.querySelector("body");
const G = 0.00000001;
const keys = {};
const objects = [];


function harmonic(x, y){
  return 1 / ((1 / x) + (1 / y));
}

class Vec2{
  constructor(x = 0, y = 0){
    this.x = x;
    this.y = y;
  }
  add(v){
    return new Vec2(this.x + v.x, this.y + v.y);
  }
  sub(v){
    return new Vec2(this.x - v.x, this.y - v.y);
  }
  scale(t){
    return new Vec2(this.x * t, this.y * t);
  }
  piecewise(v){
    return new Vec2(this.x * v.x, this.y * v.y);
  }
  dot(v){
    const pw = this.piecewise(v);
    return pw.x + pw.y;
  }
  mag(){
    return Math.sqrt(this.dot(this));
  }
  normal(){
    const mag = this.mag();
    if(!mag) return new Vec2;
    return new Vec2(this.x / mag, this.y / mag);
  }
};

class Camera{
  constructor(pos, zoom){
    this.pos = pos;
    this.zoom = zoom;
  }
};

class Ball{
  constructor(pos, radius, density, colorNucleus, colorBody, colorBorder){
    this.pos = pos;
    this.speed = new Vec2;
    this.radius = radius;
    this.density = density;
    this.bounce = 1;
    this.element = document.createElement("section");
    this.element.style.background = `radial-gradient(${colorNucleus}, ${colorBody})`;
    this.element.style.border = `${this.radius * 0.1}px solid ${colorBorder}`;
    body.appendChild(this.element);
  }
  tick(dt){
    this.pos = this.pos.add(this.speed.scale(dt));
  }
  render(cam){
    let screenPos = this.pos.sub(cam.pos).sub(new Vec2(this.radius, this.radius)).scale(cam.zoom);
    const win = new Vec2(window.innerWidth, window.innerHeight).scale(0.5);
    screenPos = screenPos.add(win);
    this.element.style.left = `${screenPos.x}px`;
    this.element.style.top = `${screenPos.y}px`;
    this.element.style.width = this.element.style.height = `${2 * this.radius * cam.zoom}px`;
    this.element.style.boxSizing = "border-box";
    this.element.style.borderWidth = `${this.radius * 0.1 * cam.zoom}px`;
  }
  getMass(){
    return this.radius * this.radius * Math.PI * this.density;
  }
};

class Movable extends Ball{
  constructor(pos, radius, density, colorNucleus, colorBody, colorBorder){
    super(pos, radius, density, colorNucleus, colorBody, colorBorder);
  }
  gravPull(obj){
    const diff = obj.pos.sub(this.pos);
    if(diff.mag())
      return diff.normal().scale(obj.getMass());
    return new Vec2;
  }
  tick(dt){
    let forceG = new Vec2;
    for(const obj of objects){
      if(this == obj) continue;
      forceG = forceG.add(this.gravPull(obj));
    }
    for(const obj of objects){
      if(this == obj) continue;
      this.collide(obj, dt / 1000);
    }
    this.speed = this.speed.add(forceG.scale(G * dt));
    this.pos = this.pos.add(this.speed);
  }
  collisionDelta(obj){
    const P = obj.pos.sub(this.pos);
    const V = obj.speed.sub(this.speed);
    const R = this.radius + obj.radius;
    const PV = P.dot(V);
    const PP = P.dot(P);
    const VV = V.dot(V);
    const RR = R * R;
    if((PV * PV + VV * (RR - PP)) == 0 || VV == 0) return -1;
    return -(PV + Math.sqrt(PV * PV + VV * (RR - PP))) / VV;
  }
  collide(obj, dt){
    const diff = this.pos.sub(obj.pos);
    const dist = diff.mag();
    const radius = this.radius + obj.radius;
    const bounce = harmonic(this.bounce, obj.bounce);
    let normal = this.pos.sub(obj.pos).normal();
    if(dist <= radius) this.pos = this.pos.add(normal.scale(radius - dist));
    let delta = this.collisionDelta(obj);
    while(dt > 0 && delta > 0 && delta <= dt){
      this.pos = this.pos.add(this.speed.scale(delta));
      obj.pos = obj.pos.add(obj.speed.scale(delta));
      normal = this.pos.sub(obj.pos).normal();
      const thisMass = Math.abs(this.getMass());
      const objMass = Math.abs(obj.getMass());
      const relSpeed = this.speed.sub(obj.speed);
      const impulse = (1 + bounce) * relSpeed.dot(normal) * harmonic(thisMass, objMass);
      this.speed = this.speed.sub(normal.scale(impulse / thisMass));
      obj.speed = obj.speed.add(normal.scale(impulse / objMass));
      dt -= delta;
      delta = this.collisionDelta(obj);
    }
    return dt;
  }
};

const camera = new Camera(new Vec2, 1);
const player = new Movable(new Vec2, 20, 1, "#f00", "#ff0", "#f00");

objects.push(player);
objects.push(new Movable(new Vec2(1000, 2000), 500, 1, "#000", "#0f0", "#0f0"));
objects.push(new Movable(new Vec2(-10000, 2000), 2500, 1, "#000", "#0f0", "#0f0"));
objects.push(new Movable(new Vec2(1000, -20000), 800, 1, "#000", "#0f0", "#0f0"));
objects.push(new Movable(new Vec2(100000, -200000), 200, 2, "#000", "#0f0", "#0f0"));
objects.push(new Movable(new Vec2(100000, 200000), 800, 1, "#000", "#0f0", "#0f0"));
objects.push(new Movable(new Vec2(10, 1), 20, 1, "#fff", "#0f0", "#0f0"));

var globalTimer = 0;
const FPS = 60;

function mainLoop(currentTimer){
  const dt = currentTimer - globalTimer;
  if(dt < 1000 / FPS){
    requestAnimationFrame(mainLoop);
    return;
  }
  if(keys['1']) camera.zoom = 1;
  if(keys['2']) camera.zoom = 0.01;
  globalTimer = currentTimer;
  for(const obj of objects) obj.tick(dt);
  for(const obj of objects) obj.render(camera);
  camera.pos = camera.pos.add(player.pos.sub(camera.pos).scale(0.9));
  requestAnimationFrame(mainLoop);
}

for(const obj of objects) obj.render(camera);
requestAnimationFrame(mainLoop);

window.onkeydown = (e) => {
    keys[e.key] = true;
}

window.onkeyup = (e) => {
    keys[e.key] = false;
    if (e.key == "Shift") {
        controlMode = !controlMode;
        moving.element.style.borderColor = "#FFF";
        moving.element.style.boxShadow = "";
    }
}