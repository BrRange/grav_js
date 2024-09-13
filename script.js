const body = document.querySelector("body");
const keys = {};
let controlMode = false;
let everyOther = true;
class Ball{
    constructor(){
        this.speed = [0, 0];
        this.loc = [offsetRNG(10000), offsetRNG(10000)];
    }
    getCenter(){
        return [this.loc[0] + this.radius, this.loc[1] + this.radius]
    }
    getVector(target){
        let center = this.getCenter();
        let centerEnd = target.getCenter();
        return [centerEnd[0] - center[0], centerEnd[1] - center[1]];
    }
    getDist(target){
        let vector = this.getVector(target);
        return Math.sqrt(vector[0] ** 2 + vector[1] ** 2)
    }
    getAngle(target){
        let mag = this.getDist(target);
        if(mag == 0) mag = 1;
        let vector = this.getVector(target)
        return [vector[0] / mag, vector[1] / mag];
    }
};
class Fixed extends Ball{
    constructor(element){
        super();
        this.element = element;
        let diameter = 10 + Math.random() * 200;
        this.weight = 1 + Math.random() * 10;
        this.element.style = `background-color: rgb(${this.weight * diameter / 3}, ${255 - this.weight * 25}, ${this.weight + diameter}); width: ${diameter}vh; height: ${diameter}vh; border: #844 solid ${diameter / 5}pt; position: absolute; border-radius: 100%;`
        body.appendChild(this.element);
        this.radius = this.element.offsetHeight / 2;
    }
};
class Moving extends Ball{
    constructor(){
        super();
        this.element = movingElement;
        this.clipping = false;
        this.grounded = false;
        this.radius = this.element.offsetHeight / 2; 
    }
    move(x, y) {
        this.speed[0] += x
        this.speed[1] += y
        this.loc[0] += this.speed[0]
        this.loc[1] += this.speed[1]
    }
    collide(target) {
        let dist = this.getDist(target);
        let angle = target.getAngle(this);
        if (dist < this.radius + target.radius) {
            this.grounded = true;
            if (!this.clipping) {
                let dotP = this.speed[0] * angle[0] + this.speed[1] * angle[1];
                this.speed[0] -= 2 * dotP * angle[0] * 0.6 + 0.05 * this.speed[0] * Math.abs(angle[1]);
                this.speed[1] -= 2 * dotP * angle[1] * 0.6 + 0.05 * this.speed[1] * Math.abs(angle[0]);
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
    getClosest() {
        let num = [0, this.getDist(fixeds[0]) - fixeds[0].radius]
        for (i = 1; i < fixeds.length; i++) {
            let temp = this.getDist(fixeds[i]) - fixeds[i].radius;
            num = [num[1] > temp ? i : num[0], num[1] > temp ? temp : num[1]]
        }
        return num[0]
    }
};
const moving = new Moving;
function offsetRNG(limits) {
    return Math.random() * (limits * 2 + 1) - limits
}
function refresh(obj) {
    obj.element.style.left = obj.loc[0] + "px"
    obj.element.style.top = obj.loc[1] + "px"
}
let fixeds = [];
let fixed = null;
for (i = 0; i < 10; i++) {
    fixeds[i] = new Fixed(document.createElement("section"));
}
function render(focusObj) {
    let focusCenter = focusObj.getCenter();
    let camOffset = [focusCenter[0] - window.innerWidth / 2, focusCenter[1] - window.innerHeight / 2];
    moving.loc[0] -= camOffset[0];
    moving.loc[1] -= camOffset[1];
    refresh(moving);
    for (i in fixeds) {
        fixeds[i].loc[0] -= camOffset[0];
        fixeds[i].loc[1] -= camOffset[1];
        refresh(fixeds[i]);
    }
}
setInterval(() => {
    if (everyOther) fixed = fixeds[moving.getClosest()];
    everyOther = !everyOther;
    moving.collide(fixed)
    let angle = moving.getAngle(fixed);
    if (!moving.clipping && !everyOther){
        for(i in fixeds){
            let anglle = moving.getAngle(fixeds[i]);
            let dist = moving.getDist(fixeds[i]);
            let coef = fixeds[i].weight * fixeds[i].radius ** 2 / 100 / dist ** 2
            moving.move(coef * anglle[0], coef * anglle[1])
        }
    }
    if (!controlMode) {
        if (keys["ArrowLeft"]) {
            moving.speed[0] -= angle[1] * 0.01
            moving.speed[1] += angle[0] * 0.01
        }
        if (keys["ArrowRight"]) {
            moving.speed[0] += angle[1] * 0.01
            moving.speed[1] -= angle[0] * 0.01
        }
        if (keys["ArrowUp"]) {
            moving.speed[0] -= angle[0] * (moving.grounded ? 0.1 : 0.02);
            moving.speed[1] -= angle[1] * (moving.grounded ? 0.1 : 0.02);
        }
        if (keys["ArrowDown"]) {
            moving.speed[0] += angle[0] * 0.01
            moving.speed[1] += angle[1] * 0.01
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
    render(keys["Control"] ? fixed : moving)
    let mCenter = moving.getCenter();
    let fCenter = fixed.getCenter();
    moving.element.style.background = controlMode ? "radial-gradient(#000, #FFF)" : `linear-gradient(${Math.atan2(fCenter[1] - mCenter[1], fCenter[0] - mCenter[0]) - Math.PI / 2}rad, #FFF, #000)`
}, 0)
window.onkeydown = (e) => {
    keys[e.key] = true;
}
window.onkeyup = (e) => {
    keys[e.key] = false;
    if (e.key == "Shift") controlMode = !controlMode;
}