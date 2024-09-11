const body = document.querySelector("body");
const keys = {};
moving.clipping = false;
moving.grounded = false;
moving.loc = [0, 0];
moving.speed = [0, 0];
let controlMode = false;
everyOther = true;
function getCenter(obj) {
    return [obj.loc[0] + obj.offsetWidth / 2, obj.loc[1] + obj.offsetHeight / 2]
}
function getVector(node1, node2) {
    center1 = getCenter(node1);
    center2 = getCenter(node2);
    return [center2[0] - center1[0], center2[1] - center1[1]];
}
function getDist(node1, node2) {
    vector = getVector(node1, node2);
    return Math.sqrt(vector[0] ** 2 + vector[1] ** 2)
}
function getAngle(source, target) {
    mag = getDist(source, target);
    if(mag == 0) mag = 1;
    vector = getVector(source, target)
    return [vector[0] / mag, vector[1] / mag];
}
function offsetRNG(limits) {
    return Math.random() * (limits * 2 + 1) - limits
}
function move(obj, x, y) {
    obj.speed[0] += x
    obj.speed[1] += y
    obj.loc[0] += obj.speed[0]
    obj.loc[1] += obj.speed[1]
}
function refresh(obj) {
    obj.style.left = obj.loc[0] + "px"
    obj.style.top = obj.loc[1] + "px"
}
function collide(node1, node2, bounce) {
    dist = getDist(node1, node2);
    angle = getAngle(node2, node1);
    if (dist < node1.offsetWidth / 2 + node2.offsetWidth / 2) {
        node1.grounded = true;
        if (!node1.clipping) {
            dotP = node1.speed[0] * angle[0] + node1.speed[1] * angle[1];
            node1.speed[0] -= 2 * dotP * angle[0] * bounce + 0.05 * node1.speed[0] * Math.abs(angle[1]);
            node1.speed[1] -= 2 * dotP * angle[1] * bounce + 0.05 * node1.speed[1] * Math.abs(angle[0]);
            node1.clipping = true;
        } else {
            node1.loc[0] += (node1.offsetWidth / 2 + node2.offsetWidth / 2 - dist) * angle[0];
            node1.loc[1] += (node1.offsetHeight / 2 + node2.offsetHeight / 2 - dist) * angle[1];
            node1.clipping = false;
        }
    } else {
        node1.clipping = false;
        node1.grounded = false;
    }
}
let fixeds = []
let fixed = null
for (i = 0; i < 10; i++) {
    fixeds[i] = document.createElement("section")
    body.appendChild(fixeds[i])
    fixeds[i].weight = 1 + Math.random() * 10;
    fixeds[i].diameter = 10 + Math.random() * 50
    fixeds[i].style = `background-color: rgb(${fixeds[i].weight * fixeds[i].diameter / 3}, ${255 - fixeds[i].weight * 25}, ${fixeds[i].weight + fixeds[i].diameter}); width: ${fixeds[i].diameter}vh; height: ${fixeds[i].diameter}vh; border: #844 solid ${fixeds[i].diameter / 5}pt; position: absolute; border-radius: 100%;`
    fixeds[i].speed = [0, 0]
    fixeds[i].loc = [offsetRNG(5000), offsetRNG(5000)]
    move(fixeds[i], 0, 0)
}
function getClosest(obj) {
    let num = [0, getDist(obj, fixeds[0])]
    for (i = 1; i < fixeds.length; i++) {
        temp = getDist(obj, fixeds[i])
        num = [num[1] > temp ? i : num[0], num[1] > temp ? temp : num[1]]
    }
    return num[0]
}
function render(focusObj) {
    focusCenter = getCenter(focusObj);
    camOffset = [focusCenter[0] - window.innerWidth / 2, focusCenter[1] - window.innerHeight / 2]
    for (c in body.childNodes) {
        try {
            body.childNodes[c].loc[0] -= camOffset[0]
            body.childNodes[c].loc[1] -= camOffset[1]
            refresh(body.childNodes[c])
        } catch { }
    }
}
setInterval(() => {
    if (everyOther) fixed = fixeds[getClosest(moving)]
    everyOther = !everyOther;
    collide(moving, fixed, 0.6)
    angle = getAngle(moving, fixed);
    if (!moving.clipping){
        dist = getDist(moving, fixed);
        move(moving, fixed.weight * fixed.diameter ** 2 * angle[0] / 20 / dist ** 2, fixed.weight * fixed.diameter ** 2 * angle[1] / 20 / dist ** 2)
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
            moving.speed[0] -= angle[0] * 0.02
            moving.speed[1] -= angle[1] * 0.02
        }
        if (keys["ArrowDown"]) {
            moving.speed[0] += angle[0] * 0.05
            moving.speed[1] += angle[1] * 0.05
        }
    } else {
        direction = [0, 0];
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
        norm = Math.sqrt(direction[0] ** 2 + direction[1] ** 2);
        if(norm == 0) norm = 1;
        moving.speed[0] += 0.02 * direction[0] / norm;
        moving.speed[1] += 0.02 * direction[1] / norm;
    }
    render(keys["Control"] ? fixed : moving)
    mCenter = getCenter(moving);
    fCenter = getCenter(fixed);
    moving.style.background = controlMode ? "radial-gradient(#000, #FFF)" : `linear-gradient(${Math.atan2(fCenter[1] - mCenter[1], fCenter[0] - mCenter[0]) - Math.PI / 2}rad, #FFF, #000)`
}, 0)
window.onkeydown = (e) => {
    keys[e.key] = true
}
window.onkeyup = (e) => {
    keys[e.key] = false
    if (e.key == "Shift") controlMode = !controlMode
    if (e.key == " " && moving.grounded){
        moving.loc[0] -= angle[0] * 15;
        moving.loc[1] -= angle[1] * 15;
    }
}
