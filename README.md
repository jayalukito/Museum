# 3D Museum Experience

This project is a simple 3D museum walkthrough created using Three.js. You can navigate the museum space using keyboard and mouse controls.

## Running the Project

Because this project uses ES6 modules (`import` statements in JavaScript), you need to serve the files using a local web server. Opening the `index.html` file directly in your browser via the `file:///` protocol will likely not work correctly (you might see a blank screen or errors in the console related to module loading).

Here are a couple of common ways to run a local web server:

### 1. Using Python's Built-in HTTP Server

If you have Python installed, this is one of the simplest methods:

1.  Open your terminal or command prompt.
2.  Navigate to the root directory of this project (where `index.html` is located).
3.  If you have Python 3, run:
    ```bash
    python -m http.server
    ```
    Or, if you might have Python 2 as default, try:
    ```bash
    python3 -m http.server
    ```
4.  By default, this will start a server on port 8000. Open your web browser and go to:
    `http://localhost:8000`

    If port 8000 is busy, the server might choose another port, or you can specify one:
    `python -m http.server 8080` (then go to `http://localhost:8080`)

### 2. Using Visual Studio Code with the "Live Server" Extension

If you are using Visual Studio Code as your editor:

1.  Install the "Live Server" extension by Ritwick Dey from the VS Code Extensions view (Ctrl+Shift+X or Cmd+Shift+X).
2.  Once installed, open the project folder in VS Code.
3.  Right-click on the `index.html` file in the Explorer panel.
4.  Select "Open with Live Server" from the context menu.
5.  This will automatically open the page in your default web browser, and it will also auto-refresh when you save changes to your files.

### 3. Using Node.js with `http-server`

If you have Node.js and npm installed:

1.  Open your terminal or command prompt.
2.  Navigate to the root directory of this project.
3.  Install `http-server` globally (if you haven't already):
    ```bash
    npm install -g http-server
    ```
4.  Start the server:
    ```bash
    http-server .
    ```
5.  This will typically serve the project on `http://localhost:8080` (check the terminal output for the exact address).

Choose any of these methods, and you should be able to explore the 3D museum!

## Controls

*   **W, A, S, D:** Move forward, left, backward, and right.
*   **Mouse:** Look around (control the camera). Click on the screen to lock the mouse pointer for camera control. Press `Esc` to unlock.
