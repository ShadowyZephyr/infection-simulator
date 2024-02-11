window.onload = () => {
    makeElementDraggable('info');
    makeElementDraggable('settings');
    makeElementDraggable('stats');
}
function makeElementDraggable(elementId) {
    let element = document.getElementById(elementId);
    let posX, posY, mouseX, mouseY;

    if (element) {
        const computedStyle = window.getComputedStyle(element);
        element.style.top = computedStyle.top;
        element.style.left = computedStyle.left;
        element.onmousedown = dragMouseDown;
    } else {
        console.warn("Element with id '" + elementId + "' not found.");
    }

    function dragMouseDown(e) {
        e = e || window.event;
        if(!(e.target.tagName == 'INPUT')) {
            e.preventDefault();
            mouseX = e.clientX;
            mouseY = e.clientY;
            document.onmousemove = elementDrag;
            document.onmouseup = closeDragElement;
        }
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        posX = e.clientX - mouseX;
        posY = e.clientY - mouseY;
        mouseX = e.clientX;
        mouseY = e.clientY;
        const top = parseInt(element.style.top, 10);
        const left = parseInt(element.style.left, 10);
        element.style.top = (top + posY) + "px";
        element.style.left = (left + posX) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function x(id) {
    const element = document.getElementById(id);
    element.style.display = 'none';
}
