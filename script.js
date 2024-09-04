function getCenter(obj) {
    return [obj.loc[0] + obj.offsetWidth / 2, obj.loc[1] + obj.offsetHeight / 2]
}
function getDist(node1, node2) {
    return Math.sqrt((getCenter(node1)[0] - getCenter(node2)[0]) ** 2 + (getCenter(node1)[1] - getCenter(node2)[1]) ** 2)
}
function getAngle(source, target) {
    let angle = Math.atan2(getCenter(target)[1] - getCenter(source)[1], getCenter(target)[0] - getCenter(source)[0])
    return [Math.cos(angle), Math.sin(angle)]
}
function offsetRNG(limits) {
    return Math.random() * (limits * 2 + 1) - limits
}
function move(obj, x, y) {
    obj.speed[0] += x * (1 / obj.weight)
    obj.speed[1] += y * (1 / obj.weight)
    obj.loc[0] += obj.speed[0]
    obj.loc[1] += obj.speed[1]
}
function refresh(obj) {
    obj.style.left = obj.loc[0] + "px"
    obj.style.top = obj.loc[1] + "px"
}
function collide(node1, node2, bounce) {
    dist = getDist(node1, node2)
    if (dist < node1.offsetWidth / 2 + node2.offsetWidth / 2) {
        if (!node1.clipping) {
            node1.speed[0] = getAngle(node2, node1)[0] * Math.abs(node1.speed[0]) * bounce
            node1.speed[1] = getAngle(node2, node1)[1] * Math.abs(node1.speed[1]) * bounce
            node1.clipping = true
        } else {
            node1.loc[0] += (node1.offsetWidth / 2 + node2.offsetWidth / 2 - dist) * getAngle(node2, node1)[0]
            node1.loc[1] += (node1.offsetHeight / 2 + node2.offsetHeight / 2 - dist) * getAngle(node2, node1)[1]
            node1.clipping = false }
    } else {
        node1.clipping = false
    }
}
let fixeds = []
let fixed = null
for (i = 0; i < 10; i++) {
    fixeds[i] = document.createElement("section")
    document.querySelector("body").appendChild(fixeds[i])
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
const keys = {}
moving.clipping = false
moving.loc = [0, 0]
moving.speed = [0, 0]
moving.weight = 1
let controlMode = false
everyOther = true;
function render(focusObj) {
    camOffset = [getCenter(focusObj)[0] - window.innerWidth / 2, getCenter(focusObj)[1] - window.innerHeight / 2]
    for (c in document.querySelector("body").childNodes) {
        try {
            document.querySelector("body").childNodes[c].loc[0] -= camOffset[0]
            document.querySelector("body").childNodes[c].loc[1] -= camOffset[1]
            refresh(document.querySelector("body").childNodes[c], 0, 0)
        } catch {}
    }
}
setInterval(() => {
    if(everyOther) fixed = fixeds[getClosest(moving)]
    everyOther = !everyOther;
    collide(moving, fixed, 0.4)
    if (!moving.clipping) move(moving, 1 / getDist(moving, fixed) * getAngle(moving, fixed)[0] * moving.weight, 1 / getDist(moving, fixed) * getAngle(moving, fixed)[1] * moving.weight)
    if (!controlMode) {
        if (keys["ArrowLeft"]) {
            moving.speed[0] -= getAngle(moving, fixed)[1] * 0.01
            moving.speed[1] += getAngle(moving, fixed)[0] * 0.01
        }
        if (keys["ArrowRight"]) {
            moving.speed[0] += getAngle(moving, fixed)[1] * 0.01
            moving.speed[1] -= getAngle(moving, fixed)[0] * 0.01 }
            if (keys["ArrowUp"]) {
                moving.speed[0] -= getAngle(moving, fixed)[0] * 0.01
                moving.speed[1] -= getAngle(moving, fixed)[1] * 0.01
            }
            if (keys["ArrowDown"]) {
                moving.speed[0] += getAngle(moving, fixed)[0] * 0.05
                moving.speed[1] += getAngle(moving, fixed)[1] * 0.05
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
    moving.style.background = controlMode ? "radial-gradient(#000, #FFF)" : `linear-gradient(${Math.atan2(getCenter(fixed)[1] - getCenter(moving)[1], getCenter(fixed)[0] - getCenter(moving)[0]) - Math.PI / 2 }rad, #FFF, #000)`
}, 0)
        window.onkeydown = (e) => {
            keys[e.key] = true
        }
        window.onkeyup = (e) => {
            keys[e.key] = false
            if (e.key == "Shift") controlMode = !controlMode
        }