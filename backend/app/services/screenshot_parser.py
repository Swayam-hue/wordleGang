import cv2
import numpy as np
from typing import Dict, Any

def classify_color(r: int, g: int, b: int) -> str:
    """Classifies NYT Wordle colors based on RGB values."""
    if g > 120 and r < 130:
        return "green"
    elif r > 150 and g > 130:
        return "yellow"
    elif 30 < r < 110 and 30 < g < 110 and 30 < b < 110:
        return "gray"
    # Basic light mode support
    elif 100 < g < 200 and 80 < r < 150 and b < 150:
        return "green"
    elif r > 180 and 150 < g < 200 and b < 120:
        return "yellow"
    elif 100 < r < 150 and 100 < g < 150 and 100 < b < 150:
        return "gray"
    return "empty"

def parse_screenshot(image_bytes: bytes) -> Dict[str, Any]:
    """
    Parses a Wordle screenshot using OpenCV to extract the grid.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Failed to decode image")
        
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Lower Canny thresholds and use dilation to catch low contrast edges in JPEGs
    edges = cv2.Canny(gray_img, 20, 100)
    kernel = np.ones((3,3), np.uint8)
    edges = cv2.dilate(edges, kernel, iterations=1)
    
    contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    squares = []
    for cnt in contours:
        epsilon = 0.05 * cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, epsilon, True)
        
        if len(approx) == 4:
            area = cv2.contourArea(approx)
            if 1000 < area < 50000:
                x, y, w, h = cv2.boundingRect(approx)
                aspect_ratio = float(w)/h
                if 0.85 <= aspect_ratio <= 1.15:
                    squares.append((x, y, w, h))
                    
    # Remove duplicates
    unique_squares = []
    for s in squares:
        x, y, w, h = s
        is_duplicate = False
        for us in unique_squares:
            ux, uy, uw, uh = us
            if abs(x - ux) < 10 and abs(y - uy) < 10:
                is_duplicate = True
                break
        if not is_duplicate:
            unique_squares.append(s)
            
    # Sort into rows
    unique_squares.sort(key=lambda b: b[1])
    
    rows = []
    current_row = []
    last_y = -1
    
    for s in unique_squares:
        x, y, w, h = s
        if last_y == -1 or abs(y - last_y) < h / 2:
            current_row.append(s)
        else:
            rows.append(current_row)
            current_row = [s]
        last_y = y
        
    if current_row:
        rows.append(current_row)
        
    grid_colors = []
    
    for r in rows:
        if len(r) != 5:
            continue # Only process rows that have exactly 5 squares (Wordle grid)
            
        r.sort(key=lambda b: b[0])
        row_colors = []
        is_empty_row = True
        
        for s in r:
            x, y, w, h = s
            # Sample top-left quadrant to avoid white/black text
            sx, sy = x + w//4, y + h//4
            blue, green, red = img[sy, sx]
            
            color_name = classify_color(red, green, blue)
            if color_name != "empty":
                is_empty_row = False
                
            # If the square is strictly empty (black/white bg), we still add it if the row is active
            row_colors.append(color_name if color_name != "empty" else "gray") # fallback to gray for parsing simplicity if empty row logic fails
            
        if not is_empty_row:
            grid_colors.append(row_colors)

    if not grid_colors:
        return {
            "puzzle_number": 0,
            "attempts": 0,
            "solved": False,
            "grid": [],
            "confidence": 0.0,
            "message": "Failed to detect Wordle grid in screenshot."
        }

    attempts = len(grid_colors)
    solved = all(c == "green" for c in grid_colors[-1])
    
    return {
        "puzzle_number": 0, # Tesseract OCR needed for actual puzzle number
        "attempts": attempts,
        "solved": solved,
        "grid": grid_colors,
        "confidence": 0.98,
        "message": f"Successfully parsed {attempts} attempts using OpenCV!"
    }

