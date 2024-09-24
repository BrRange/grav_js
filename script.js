const body = document.querySelector("body");
const keys = {};
let objects = [];
let controlMode = false;
let everyOther = true;
let planetNum = 10;
class Ball{
    constructor(element){
        this.element = element
        this.speed = [0, 0];
        this.loc = [offsetRNG(10000), offsetRNG(10000)];
        objects[objects.length] = this;
    }
    getCenter(){
        return [this.loc[0] + this.radius, this.loc[1] + this.radius];
    }
    getVector(target){
        let center = this.getCenter();
        let centerEnd = target.getCenter();
        return [centerEnd[0] - center[0], centerEnd[1] - center[1]];
    }
    getDist(target){
        let vector = this.getVector(target);
        return Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
    }
    getAngle(target){
        let mag = this.getDist(target);
        if(mag == 0) mag = 1;
        let vector = this.getVector(target);
        return [vector[0] / mag, vector[1] / mag];
    }
    render(target){
        let focusCenter = target.getCenter();
        let camOffset = [focusCenter[0] - window.innerWidth / 2, focusCenter[1] - window.innerHeight / 2];
        this.loc[0] -= camOffset[0];
        this.loc[1] -= camOffset[1];
        this.element.style.left = this.loc[0] + "px";
        this.element.style.top = this.loc[1] + "px";
    }
};
class Moon extends Ball{
    constructor(element, anchor){
        super(element);
        this.anchor = anchor;
        let diameter = 5 + Math.random() * 100;
        this.weight = 1 + Math.random() * 10;
        this.element.style = `background-color: rgb(${this.weight * diameter / 3}, ${255 - this.weight * 25}, ${this.weight + diameter}); width: ${diameter}vh; height: ${diameter}vh; border: #844 solid ${diameter / 5}pt; position: absolute; border-radius: 100%;`;
        if(Math.random() < 0.05){
            this.weight *= -1;
            this.element.style.background = `radial-gradient(#FFF, rgb(${this.weight * diameter / 3}, ${255 - this.weight * 25}, ${this.weight + diameter}))`;
            this.element.style.borderColor = "#FFF"
        }
        body.appendChild(this.element);
        this.radius = this.element.offsetHeight / 2;
        this.angularSpeed = Math.random() / 500 * (Math.random() > 0.5 ? 1 : -1);
        this.deltaTime = Math.PI / 2//Math.random() * Math.PI * 2;
        this.anchorDist = (anchor.radius + this.radius) * (Math.random() + 1);
        if(Math.random() < 0.2){
            this.anchorDist *= 10;
        }
        let anchorCenter = anchor.getCenter();
        this.loc = [anchorCenter[0] - this.radius - this.anchorDist * Math.cos(this.deltaTime), anchorCenter[1] - this.radius - this.anchorDist * Math.sin(this.deltaTime)];
    }
    move(){
        this.deltaTime += this.angularSpeed;
        this.speed = [
            this.anchorDist * Math.sin(this.deltaTime) * this.angularSpeed,
            this.anchorDist * -Math.cos(this.deltaTime) * this.angularSpeed
        ];
        this.loc[0] += this.speed[0];
        this.loc[1] += this.speed[1];
    }
    tick(){
        this.move();
    }
}
class Fixed extends Ball{
    constructor(element){
        super(element);
        let diameter = 10 + Math.random() * 200;
        this.weight = 1 + Math.random() * 10;
        this.element.style = `background-color: rgb(${this.weight * diameter / 3}, ${255 - this.weight * 25}, ${this.weight + diameter}); width: ${diameter}vh; height: ${diameter}vh; border: #844 solid ${diameter / 5}pt; position: absolute; border-radius: 100%;`;
        body.appendChild(this.element);
        this.radius = this.element.offsetHeight / 2;
        if(Math.random() < 1){
            this.moonSlot = new Moon(document.createElement("section"), this);
        } else {
            this.moonSlot = null;
        }
    }
    tick(){}
};
class Moving extends Ball{
    constructor(){
        super(movingElement);
        this.clipping = false;
        this.grounded = false;
        this.radius = this.element.offsetHeight / 2; 
    }
    accelerate(x, y) {
        this.speed[0] += x;
        this.speed[1] += y;
    }
    move(){
        this.loc[0] += this.speed[0];
        this.loc[1] += this.speed[1];
    }
    collide(target) {
        let dist = this.getDist(target);
        let angle = target.getAngle(this);
        if (dist < this.radius + target.radius) {
            this.grounded = true;
            if (!this.clipping) {
                let relSpeed = [this.speed[0] - target.speed[0], this.speed[1] - target.speed[1]];
                let dotP = relSpeed[0] * angle[0] + relSpeed[1] * angle[1];
                this.speed[0] -= 2 * dotP * angle[0] * 0.6 + 0.05 * relSpeed[0] * Math.abs(angle[1]);
                this.speed[1] -= 2 * dotP * angle[1] * 0.6 + 0.05 * relSpeed[1] * Math.abs(angle[0]);
                this.clipping = true;
            } else {
                this.loc[0] += (this.radius + target.radius - dist) * angle[0];
                this.loc[1] += (this.radius + target.radius - dist) * angle[1];
                this.clipping = false;
            }
        } else {
            this.clipping = false;
            this.grounded = false;
        }
    }
    getClosest(){
        let close = [null, Infinity];
        for (i in objects) {
            if(objects[i] == this) continue;
            let inCheck = objects[i];
            let temp = this.getDist(inCheck) - inCheck.radius;
            close = close[1] > temp ? [inCheck, temp] : close;
        }
        return close[0];
    }
    tick(){
        this.move();
        this.collide(closest);
    }
};
const moving = new Moving;
function offsetRNG(limits) {
    return Math.random() * (limits * 2 + 1) - limits;
}
let closest = null;
for (i = 0; i < planetNum; i++) {
    new Fixed(document.createElement("section"));
}
for(i in objects){
    for(j = Number(i + 1); j < planetNum; j++){
        if(!(objects[i] instanceof Fixed) || !(objects[j] instanceof Fixed)) continue;
        let checkDist = objects[i].getDist(objects[j]);
        if(checkDist / 2 < objects[i].radius + objects[j].radius){
            let checkAngle = objects[i].getAngle(objects[j]);
            objects[j].loc[0] += (objects[i].radius + objects[j].radius) * 2 * checkAngle[0];
            objects[j].loc[1] += (objects[i].radius + objects[j].radius) * 2 * checkAngle[1];
        }
    }
}
function mainLoop(){
    if (everyOther) closest = moving.getClosest();
    everyOther = !everyOther;
    let angle = moving.getAngle(closest);
    if (!moving.clipping && !everyOther){
        for(i in objects){
            if(objects[i] instanceof Moving) continue;
            let inCheck = objects[i];
            let anglle = moving.getAngle(inCheck);
            let dist = moving.getDist(inCheck);
            let coef = inCheck.weight * inCheck.radius ** 2 / 100 / dist ** 2;
            moving.accelerate(coef * anglle[0], coef * anglle[1]);
        }
    }
    if (!controlMode) {
        if (keys["ArrowLeft"]) {
            moving.accelerate(angle[1] * -0.01, angle[0] * 0.01);
        }
        if (keys["ArrowRight"]) {
            moving.accelerate(angle[1] * 0.01, angle[0] * -0.01);
        }
        if (keys["ArrowUp"]) {
            moving.accelerate(angle[0] * -(moving.grounded ? 0.1 : 0.02), angle[1] * -(moving.grounded ? 0.1 : 0.02));
        }
        if (keys["ArrowDown"]) {
            moving.accelerate(angle[0] * 0.01, angle[1] * 0.01);
        }
    } else {
        let direction = [0, 0];
        if (keys["ArrowLeft"]) {
            direction[0] -= 1;
        }
        if (keys["ArrowRight"]) {
            direction[0] += 1;
        }
        if (keys["ArrowUp"]) {
            direction[1] -= 1;
        }
        if (keys["ArrowDown"]) {
            direction[1] += 1;
        }
        let norm = Math.sqrt(direction[0] ** 2 + direction[1] ** 2);
        if(norm == 0) norm = 1;
        moving.accelerate(0.03 * direction[0] / norm, 0.03 * direction[1] / norm);
    }
    let focusObj = keys["Control"] ? closest : moving;
    for(i in objects){
        objects[i].render(focusObj);
        objects[i].tick();
    }
    let mCenter = moving.getCenter();
    let fCenter = closest.getCenter();
    moving.element.style.background = controlMode ? "radial-gradient(#000, #FFF)" : `linear-gradient(${Math.atan2(fCenter[1] - mCenter[1], fCenter[0] - mCenter[0]) - Math.PI / 2}rad, #FFF, #000)`;
}
setInterval(mainLoop, 0);
window.onkeydown = (e) => {
    keys[e.key] = true;
}
window.onkeyup = (e) => {
    keys[e.key] = false;
    if (e.key == "Shift") controlMode = !controlMode;
}