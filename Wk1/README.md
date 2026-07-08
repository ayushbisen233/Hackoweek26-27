# Creative Whiteboard Application

An interactive, web-based drawing board built with **Flask (Python)** on the backend and **HTML5, CSS3, and JavaScript** on the frontend. The project uses local storage in a JSON file (`board.json`) to persist drawings across browser reloads.

---

## Project Structure

```text
Hackoweek/
│
├── app.py                # Python Flask server & REST API
├── board.json            # Local JSON database for drawing strokes
│
├── templates/
│   └── index.html        # HTML structure of the interface
│
└── static/
    ├── style.css         # Minimalist stylesheet with classic colors & borders
    └── script.js         # Canvas interaction & API networking logic
```

---

## Detailed Code Explanation

### 1. `app.py` (Backend API)
The backend is built using Flask. It serves the HTML files and hosts the REST API endpoints.

**Setup & Initialization:**
- `from flask import Flask, render_template, request, jsonify`: Imports necessary modules from Flask for serving pages, handling requests, and sending JSON responses.
- `import json`: Imports Python's built-in JSON module for reading/writing the database file.
- `import os`: Imports OS module for file path operations.
- `app = Flask(__name__)`: Initializes the Flask application instance.
- `FILE_NAME = "board.json"`: Defines the constant for the database file name.
- `if not os.path.exists(FILE_NAME):`: Checks if `board.json` exists.
- `with open(FILE_NAME, "w") as file: json.dump({"lines": []}, file)`: If the file doesn't exist, it creates it with an empty array of lines.

**`home()` function:**
- `@app.route("/")`: Defines the root route (`/`) for the web app.
- `def home():`: Function executed when a user visits the root URL.
- `return render_template("index.html")`: Renders and returns the `index.html` template.

**`save_board()` function:**
- `@app.route("/save", methods=["POST"])`: Defines a route that accepts POST requests to save data.
- `def save_board():`: Function to save the board state.
- `data = request.get_json()`: Extracts the JSON payload from the incoming request (contains the drawing lines).
- `with open(FILE_NAME, "w") as file:`: Opens `board.json` in write mode, overwriting its contents.
- `json.dump(data, file)`: Writes the received JSON data into the file.
- `return jsonify({"message": "Board saved successfully!"})`: Returns a JSON response indicating success.

**`load_board()` function:**
- `@app.route("/load", methods=["GET"])`: Defines a route for retrieving the board data via GET request.
- `def load_board():`: Function to load the saved board state.
- `with open(FILE_NAME, "r") as file:`: Opens `board.json` in read mode.
- `data = json.load(file)`: Parses the JSON data from the file into a Python dictionary.
- `return jsonify(data)`: Returns the parsed data as a JSON response to the client.

**`clear_board()` function:**
- `@app.route("/clear", methods=["DELETE"])`: Defines a route to handle DELETE requests for clearing the board.
- `def clear_board():`: Function to clear the board state.
- `with open(FILE_NAME, "w") as file:`: Opens `board.json` in write mode.
- `json.dump({"lines": []}, file)`: Overwrites the file with an empty list of lines.
- `return jsonify({"message": "Board cleared!"})`: Returns a success message.

**App Execution:**
- `if __name__ == "__main__":`: Ensures the app runs only if the script is executed directly (not imported).
- `app.run(debug=True)`: Starts the Flask development server with debug mode enabled.

---

### 2. `templates/index.html` (HTML Interface)
Defines the structure and UI wrapper of the application.

- **Lines 1-13:** Standard HTML5 boilerplate, including the `<head>` section which sets the title, imports Google Fonts (Outfit), and links to `style.css`.
- **`<body>`:** Contains the main visible elements.
- **`<div class="app-container">`:** A wrapper to constrain and center the application layout.
- **`<header class="app-header">`:** Contains the application title `<h1>Creative Whiteboard</h1>`.
- **`<div class="toolbar">`:** Contains all interaction buttons.
- **`<button id="btn-draw" ... onclick="setMode('draw')">`:** Draw toggle button. Calls `setMode('draw')` when clicked.
- **`<button id="btn-erase" ... onclick="setMode('erase')">`:** Eraser toggle button. Calls `setMode('erase')` when clicked.
- **`<span class="toolbar-divider"></span>`:** Visual separator.
- **`<button class="btn btn-save" onclick="saveBoard()">`:** Save button that triggers `saveBoard()`.
- **`<button class="btn btn-load" onclick="loadBoard()">`:** Load button that triggers `loadBoard()`.
- **`<button class="btn btn-clear" onclick="clearBoard()">`:** Clear button that triggers `clearBoard()`.
- **`<div class="canvas-wrapper">`:** A wrapper for the drawing area.
- **`<canvas id="board" width="1020" height="680"></canvas>`:** The main drawing canvas element with specific dimensions.
- **`<script src="{{ url_for('static', filename='script.js') }}"></script>`:** Loads the frontend JavaScript file using Flask's `url_for` helper.

---

### 3. `static/script.js` (Frontend Logic)
Coordinates canvas rendering, mouse drawings, and network fetch calls.

**Variables and Setup:**
- `let canvas = document.getElementById("board");`: Gets a reference to the HTML canvas element.
- `let ctx = canvas.getContext("2d");`: Gets the 2D rendering context to draw on the canvas.
- `ctx.lineCap = "round";` / `ctx.lineJoin = "round";`: Makes the ends and corners of the strokes rounded for a smoother look.
- `let drawing = false;`: A boolean flag tracking whether the mouse button is currently held down.
- `let lines = [];`: An array to store every stroke/path drawn.
- `let mode = "draw";`: A variable tracking the current active tool (`"draw"` or `"erase"`).
- `let headerHeight = 70;` / `let footerHeight = 70;`: Defines the dimensions of the non-editable header and footer regions on the canvas.

**`drawLayout()` function:**
- Sets `ctx.fillStyle = "blue";` and draws a blue rectangle at the top using `ctx.fillRect(0, 0, canvas.width, headerHeight);`.
- Configures text style (`ctx.fillStyle = "white";`, `ctx.font`, `ctx.textAlign`, `ctx.textBaseline`).
- Draws the text "Draw Here" centered in the blue header using `ctx.fillText(...)`.
- Sets `ctx.fillStyle = "yellow";` and draws a yellow rectangle at the bottom using `ctx.fillRect(0, canvas.height - footerHeight, canvas.width, footerHeight);`.
- `drawLayout();` is immediately called at the bottom to initially render this layout.

**`setMode(newMode)` function:**
- `mode = newMode;`: Updates the global `mode` variable.
- Retrieves references to the draw and erase buttons using `document.getElementById()`.
- Toggles the `"active-tool"` CSS class between the buttons based on the selected mode to visually highlight the active tool.

**Mouse Event Listeners:**
- `canvas.addEventListener("mousedown", function(e) { ... })`: Triggers when a mouse button is pressed.
  - `if (e.button !== 0) return;`: Restricts drawing to the left mouse button only.
  - Gets the X and Y coordinates relative to the canvas (`e.offsetX`, `e.offsetY`).
  - `if (y < headerHeight || y > canvas.height - footerHeight)`: Checks if the click is within the static header/footer. If so, shows an alert and `return`s early.
  - `drawing = true;`: Sets the flag to indicate drawing has started.
  - If `mode === "erase"`, it sets the stroke color to white (`#ffffff`) and thickness to 20 to simulate an eraser. Otherwise, it sets it to black (`#000000`) and thickness to 3.
  - `ctx.beginPath();` starts a new path.
  - `ctx.moveTo(x, y);` moves the virtual pen to the starting coordinates without drawing anything.
  - `lines.push({ type: "start", x, y, mode });`: Saves this starting point and the current mode to the `lines` array.

- `canvas.addEventListener("mousemove", function(e) { ... })`: Triggers when the mouse moves over the canvas.
  - `if (!drawing) return;`: Exits immediately if the mouse button isn't held down.
  - `if (y < headerHeight || y > canvas.height - footerHeight) return;`: Prevents drawing in the header/footer zones.
  - Sets stroke style and width based on the current mode (draw or erase).
  - `ctx.lineTo(x, y);`: Connects the previous point to the current mouse position.
  - `ctx.stroke();`: Actually renders the line on the canvas.
  - `lines.push({ type: "draw", x, y, mode });`: Saves the drawing point.

- `canvas.addEventListener("mouseup", () => { drawing = false; });`: Stops drawing when the mouse button is released.
- `canvas.addEventListener("mouseleave", () => { drawing = false; });`: Stops drawing if the cursor leaves the canvas area.

**`saveBoard()` function:**
- Uses the Fetch API to make a `POST` request to the `/save` endpoint.
- Sends the `lines` array as a JSON string in the request body.
- Parses the JSON response and shows an alert with the server's message.

**`loadBoard()` function:**
- Makes a `GET` request to the `/load` endpoint.
- Parses the returned JSON data.
- `ctx.clearRect(0, 0, canvas.width, canvas.height);`: Completely clears the canvas.
- `drawLayout();`: Redraws the static blue/yellow regions.
- `lines = data.lines;`: Replaces the local `lines` array with the loaded data.
- Loops through every item in `lines`:
  - Sets the stroke color and width based on the saved `mode` for that specific point.
  - If `type === "start"`, it calls `beginPath()` and `moveTo()`.
  - If `type === "draw"`, it calls `lineTo()` and `stroke()` to redraw the path segment.

**`clearBoard()` function:**
- `lines = [];`: Empties the local lines array.
- `ctx.clearRect(...)`: Clears the canvas visually.
- `drawLayout();`: Redraws the header and footer.
- Shows an alert to inform the user. Note that this doesn't call the `/clear` backend API, meaning a page reload or clicking "Load" will restore the previously saved state.

---

### 4. `static/style.css` (Design System)
Provides a clean, high-contrast visual style utilizing classic solid colors and dark outline borders (no gradients or shadows).

- **Colors & Themes**: Page background is set to a solid white (`#ffffff`). Buttons use classic solid fills.
- **Dark Borders & Outlines**: All main components are highlighted with bold dark borders.
- **Typography & Interactions**: Uses modern typography (`Outfit`) with font weight hierarchies. Active button states scale down slightly (`transform: scale(0.97)`) on click for interactive feedback. Tool buttons also have an `.active-tool` state with inverted colors.

---

## How to Run

1. **Install Flask** (if you haven't already):
   ```bash
   pip install flask
   ```

2. **Run the server**:
   ```bash
   python app.py
   ```

3. **Open the browser**:
   Navigate to [http://127.0.0.1:5000](http://127.0.0.1:5000).
