# 3D Building Model Dropzone & Setup Guide

Welcome! This folder is prepared for your actual 3D building model.

## Supported Formats:
- **`.glb`** (Binary glTF - Highly Recommended! Single file with textures & materials packed inside)
- **`.gltf`** + `.bin` / textures

## How to use your 3D Model:

### Option 1: Automatic Default Loading
1. Export your 3D building model from Blender, SketchUp, Revit, or Maya as `.glb`.
2. Save/copy the file directly into this folder with the name:
   `c:\xampp\htdocs\MappingProgram\assets\models\building.glb`
3. Reload the website! The app automatically detects this file and displays it in the 3D viewer.

### Option 2: Live Test in Browser (No reload needed!)
1. Open the website.
2. Click the **"3D Model"** button in the top navigation bar (or drag and drop your `.glb` file directly anywhere onto the 3D canvas).
3. Select your `.glb` or `.gltf` file to test and preview it immediately!

### Linking Your Model's Rooms to the UI:
Each room in `data/rooms.json` has `coordinates: { "x": ..., "y": ..., "z": ... }` and `floor: ...`.
You can easily adjust the `x`, `y`, and `z` numbers in `data/rooms.json` to match the exact room locations of your model!
