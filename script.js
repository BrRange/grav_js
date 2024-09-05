const body = document.querySelector("body")
const keys = {}
moving.clipping = false
moving.loc = [0, 0]
moving.speed = [0, 0]
let controlMode = false
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
        if (!node1.clipping) {
            dotP = node1.speed[0] * angle[0] + node1.speed[1] * angle[1];
            node1.speed[0] -= 2 * dotP * angle[0] * bounce + 0.02 * node1.speed[0];
            node1.speed[1] -= 2 * dotP * angle[1] * bounce + 0.02 * node1.speed[1];
            node1.clipping = true
        } else {
            node1.loc[0] += (node1.offsetWidth / 2 + node2.offsetWidth / 2 - dist) * angle[0]
            node1.loc[1] += (node1.offsetHeight / 2 + node2.offsetHeight / 2 - dist) * angle[1]
            node1.clipping = false
        }
    } else {
        node1.clipping = false
    }
}
let fixeds = []
let fixed = null
for (i = 0; i < 10; i++) {
    fixeds[i] = document.createElement("section")
    body.appendChild(fixeds[i])
    fixeds[i].style = "background-color: #0F0; width: 50vh; height: 50vh; border: #844 solid 10pt; position: absolute; border-radius: 100%;"
    fixeds[i].weight = 10
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
        move(moving, 1 / dist * angle[0], 1 / dist * angle[1])
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
            moving.speed[0] -= angle[0] * 0.01
            moving.speed[1] -= angle[1] * 0.01
        }
        if (keys["ArrowDown"]) {
            moving.speed[0] += angle[0] * 0.05
            moving.speed[1] += angle[1] * 0.05
        }
    } else {
        if (keys["ArrowLeft"]) {
            moving.speed[0] -= 0.01
        }
        if (keys["ArrowRight"]) {
            moving.speed[0] += 0.01
        }
        if (keys["ArrowUp"]) {
            moving.speed[1] -= 0.01
        }
        if (keys["ArrowDown"]) {
            moving.speed[1] += 0.01
        }
    }
    render(keys["Control"] ? fixed : moving)
    moving.style.background = controlMode ? "radial-gradient(#000, #FFF)" : `linear-gradient(${Math.atan2(getCenter(fixed)[1] - getCenter(moving)[1], getCenter(fixed)[0] - getCenter(moving)[0]) - Math.PI / 2}rad, #FFF, #000)`
}, 0)
window.onkeydown = (e) => {
    keys[e.key] = true
}
window.onkeyup = (e) => {
    keys[e.key] = false
    if (e.key == "Shift") controlMode = !controlMode
}
