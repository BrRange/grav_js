const body = document.querySelector("body");
const keys = {};
let controlMode = false;
let everyOther = true;
let fixedsNum = 10;
class Ball{
    constructor(element){
        this.element = element
        this.speed = [0, 0];
        this.loc = [offsetRNG(10000), offsetRNG(10000)];
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
    refresh(){
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
        this.angularSpeed = Math.random() / 500;
        this.deltaTime = 0//Math.random() * Math.PI * 2;
        this.anchorDist = (anchor.radius + this.radius) * (Math.random() + 1);
        let anchorCenter = anchor.getCenter();
        this.loc = [anchorCenter[0] - this.radius - this.anchorDist * Math.cos(this.deltaTime), anchorCenter[1] - this.radius + this.anchorDist * Math.sin(this.deltaTime)];
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
}
class Fixed extends Ball{
    constructor(element){
        super(element);
        let diameter = 10 + Math.random() * 200;
        this.weight = 1 + Math.random() * 10;
        this.element.style = `background-color: rgb(${this.weight * diameter / 3}, ${255 - this.weight * 25}, ${this.weight + diameter}); width: ${diameter}vh; height: ${diameter}vh; border: #844 solid ${diameter / 5}pt; position: absolute; border-radius: 100%;`;
        body.appendChild(this.element);
        this.radius = this.element.offsetHeight / 2;
        if(Math.random() > 0.2){
            this.moonSlot = new Moon(document.createElement("section"), this);
        } else {
            this.moonSlot = null;
        }
    }
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
        for (i in fixeds) {
            let inCheck = fixeds[i];
            let temp = this.getDist(inCheck) - inCheck.radius;
            close = close[1] > temp ? [inCheck, temp] : close;
            if(inCheck.moonSlot != null){
                inCheck = inCheck.moonSlot;
                temp = this.getDist(inCheck) - inCheck.radius;
                close = close[1] > temp ? [inCheck, temp] : close;
            }
        }
        return close[0];
    }
};
const moving = new Moving;
function offsetRNG(limits) {
    return Math.random() * (limits * 2 + 1) - limits;
}
let fixeds = [];
let fixed = null;
for (i = 0; i < fixedsNum; i++) {
    fixeds[i] = new Fixed(document.createElement("section"));
}
for(i in fixeds){
    for(j = Number(i + 1); j < fixedsNum; j++){
        let checkDist = fixeds[i].getDist(fixeds[j]);
        if(checkDist / 2 < fixeds[i].radius + fixeds[j].radius){
            let checkAngle = fixeds[i].getAngle(fixeds[j]);
            fixeds[j].loc[0] += (fixeds[i].radius + fixeds[j].radius) * 2 * checkAngle[0];
            fixeds[j].loc[1] += (fixeds[i].radius + fixeds[j].radius) * 2 * checkAngle[1];
        }
    }
}
function render(focusObj) {
    let focusCenter = focusObj.getCenter();
    let camOffset = [focusCenter[0] - window.innerWidth / 2, focusCenter[1] - window.innerHeight / 2];
    moving.loc[0] -= camOffset[0];
    moving.loc[1] -= camOffset[1];
    moving.refresh();
    for (i in fixeds) {
        let inCheck = fixeds[i];
        inCheck.loc[0] -= camOffset[0];
        inCheck.loc[1] -= camOffset[1];
        inCheck.refresh();
        if(inCheck.moonSlot != null){
            inCheck.moonSlot.move();
            inCheck.moonSlot.loc[0] -= camOffset[0];
            inCheck.moonSlot.loc[1] -= camOffset[1];
            inCheck.moonSlot.refresh();
        }
    }
}
setInterval(() => {
    if (everyOther) fixed = moving.getClosest();
    everyOther = !everyOther;
    moving.collide(fixed);
    let angle = moving.getAngle(fixed);
    if (!moving.clipping && !everyOther){
        for(i in fixeds){
            let inCheck = fixeds[i];
            let anglle = moving.getAngle(inCheck);
            let dist = moving.getDist(inCheck);
            let coef = inCheck.weight * inCheck.radius ** 2 / 100 / dist ** 2;
            moving.accelerate(coef * anglle[0], coef * anglle[1]);
            if(inCheck.moonSlot != null){
                inCheck = inCheck.moonSlot;
                anglle = moving.getAngle(inCheck);
                dist = moving.getDist(inCheck);
                coef = inCheck.weight * inCheck.radius ** 2 / 100 / dist ** 2;
                moving.accelerate(coef * anglle[0], coef * anglle[1]);
            }
        }
    }
    if (!controlMode) {
        if (keys["ArrowLeft"]) {
            moving.speed[0] -= angle[1] * 0.01;
            moving.speed[1] += angle[0] * 0.01;
        }
        if (keys["ArrowRight"]) {
            moving.speed[0] += angle[1] * 0.01;
            moving.speed[1] -= angle[0] * 0.01;
        }
        if (keys["ArrowUp"]) {
            moving.speed[0] -= angle[0] * (moving.grounded ? 0.1 : 0.02);
            moving.speed[1] -= angle[1] * (moving.grounded ? 0.1 : 0.02);
        }
        if (keys["ArrowDown"]) {
            moving.speed[0] += angle[0] * 0.01;
            moving.speed[1] += angle[1] * 0.01;
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
        moving.speed[0] += 0.03 * direction[0] / norm;
        moving.speed[1] += 0.03 * direction[1] / norm;
    }
    moving.move();
    render(keys["Control"] ? fixed : moving);
    let mCenter = moving.getCenter();
    let fCenter = fixed.getCenter();
    moving.element.style.background = controlMode ? "radial-gradient(#000, #FFF)" : `linear-gradient(${Math.atan2(fCenter[1] - mCenter[1], fCenter[0] - mCenter[0]) - Math.PI / 2}rad, #FFF, #000)`;
}, 0);
window.onkeydown = (e) => {
    keys[e.key] = true;
}
window.onkeyup = (e) => {
    keys[e.key] = false;
    if (e.key == "Shift") controlMode = !controlMode;
}
