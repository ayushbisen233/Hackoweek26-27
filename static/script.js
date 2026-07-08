let canvas = document.getElementById("board");
let ctx = canvas.getContext("2d");

// Premium stroke settings for cleaner drawing
ctx.strokeStyle = "#000000";
ctx.lineWidth = 3;
ctx.lineCap = "round";
ctx.lineJoin = "round";

let drawing = false;
let lines = [];

let headerHeight = 70;
let footerHeight = 70;

// Draw Header and Footer
function drawLayout() {
    // Header
    ctx.fillStyle = "blue"; // Classic Blue
    ctx.fillRect(0, 0, canvas.width, headerHeight);

    ctx.fillStyle = "white"; // Classic White text
    ctx.font = "bold 20px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Draw Here", canvas.width / 2, headerHeight / 2);

    // Footer
    ctx.fillStyle = "yellow"; // Classic Yellow
    ctx.fillRect(0, canvas.height - footerHeight, canvas.width, footerHeight);
}

drawLayout();

canvas.addEventListener("mousedown", function(e){

    let x = e.offsetX;
    let y = e.offsetY;

    if(y < headerHeight){
        alert("You cannot edit this section!");
        return;
    }

    if(y > canvas.height - footerHeight){
        alert("You cannot edit this section!");
        return;
    }

    drawing = true;

    ctx.beginPath();
    ctx.moveTo(x, y);

    lines.push({
        type: "start",
        x: x,
        y: y
    });

});

canvas.addEventListener("mousemove", function(e){

    if(!drawing){
        return;
    }

    let x = e.offsetX;
    let y = e.offsetY;

    ctx.lineTo(x, y);
    ctx.stroke();

    lines.push({
        type: "draw",
        x: x,
        y: y
    });

});

canvas.addEventListener("mouseup", function(){

    drawing = false;

});

canvas.addEventListener("mouseleave", function(){

    drawing = false;

});

function saveBoard(){

    fetch("/save",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            lines:lines
        })

    })

    .then(response=>response.json())

    .then(data=>{

        alert(data.message);

    });

}

function loadBoard(){

    fetch("/load")

    .then(response=>response.json())

    .then(data=>{

        ctx.clearRect(0,0,canvas.width,canvas.height);

        drawLayout();

        lines = data.lines;

        ctx.beginPath();

        for(let i=0;i<lines.length;i++){

            if(lines[i].type=="start"){

                ctx.beginPath();
                ctx.moveTo(lines[i].x,lines[i].y);

            }

            else{

                ctx.lineTo(lines[i].x,lines[i].y);
                ctx.stroke();

            }

        }

    });

}

function clearBoard(){

    fetch("/clear",{

        method:"DELETE"

    })

    .then(response=>response.json())

    .then(data=>{

        alert(data.message);

        lines=[];

        ctx.clearRect(0,0,canvas.width,canvas.height);

        drawLayout();

    });

}