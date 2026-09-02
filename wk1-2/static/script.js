let canvas = document.getElementById("board");
let ctx = canvas.getContext("2d");

// Stroke settings
ctx.lineCap = "round";
ctx.lineJoin = "round";

let drawing = false;
let lines = [];
let mode = "draw"; // "draw" or "erase"

let headerHeight = 70;
let footerHeight = 70;

// ─── Layout ──────────────────────────────────────────────────────────────────
function drawLayout() {
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, canvas.width, headerHeight);

    ctx.fillStyle = "white";
    ctx.font = "bold 20px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Draw Here", canvas.width / 2, headerHeight / 2);

    ctx.fillStyle = "yellow";
    ctx.fillRect(0, canvas.height - footerHeight, canvas.width, footerHeight);
}

drawLayout();

// ─── Mode Toggle ─────────────────────────────────────────────────────────────
function setMode(newMode) {
    mode = newMode;
    const drawBtn  = document.getElementById("btn-draw");
    const eraseBtn = document.getElementById("btn-erase");
    if (mode === "draw") {
        drawBtn.classList.add("active-tool");
        eraseBtn.classList.remove("active-tool");
    } else {
        eraseBtn.classList.add("active-tool");
        drawBtn.classList.remove("active-tool");
    }
}

// ─── Mouse Events ─────────────────────────────────────────────────────────────
canvas.addEventListener("mousedown", function(e) {
    if (e.button !== 0) return; // Only left-click

    let x = e.offsetX;
    let y = e.offsetY;

    if (y < headerHeight || y > canvas.height - footerHeight) {
        alert("You cannot edit this section!");
        return;
    }

    drawing = true;

    if (mode === "erase") {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 20;
    } else {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);

    lines.push({ type: "start", x, y, mode });
});

canvas.addEventListener("mousemove", function(e) {
    if (!drawing) return;

    let x = e.offsetX;
    let y = e.offsetY;

    // Clamp to drawing zone
    if (y < headerHeight || y > canvas.height - footerHeight) return;

    if (mode === "erase") {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 20;
    } else {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
    }

    ctx.lineTo(x, y);
    ctx.stroke();

    lines.push({ type: "draw", x, y, mode });
});

canvas.addEventListener("mouseup",    () => { drawing = false; });
canvas.addEventListener("mouseleave", () => { drawing = false; });

// ─── API Functions ────────────────────────────────────────────────────────────
function saveBoard() {
    fetch("/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines })
    })
    .then(r => r.json())
    .then(data => alert(data.message));
}

function loadBoard() {
    fetch("/load")
    .then(r => r.json())
    .then(data => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawLayout();
        lines = data.lines;

        for (let i = 0; i < lines.length; i++) {
            let lm = lines[i].mode || "draw";
            ctx.strokeStyle = (lm === "erase") ? "#ffffff" : "#000000";
            ctx.lineWidth   = (lm === "erase") ? 20 : 3;

            if (lines[i].type === "start") {
                ctx.beginPath();
                ctx.moveTo(lines[i].x, lines[i].y);
            } else {
                ctx.lineTo(lines[i].x, lines[i].y);
                ctx.stroke();
            }
        }
    });
}

function clearBoard() {
    lines = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLayout();
    alert("Board cleared locally! Press Load to restore last saved drawing.");
}