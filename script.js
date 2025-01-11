document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const colorPicker = document.getElementById('colorPicker');
    const brushSizes = document.querySelectorAll('.brush-size');
    let currentBrushSize = 1;
    let isDrawing = false;
    const eraserBtn = document.getElementById('eraser');
    const colorHistory = document.getElementById('colorHistory');
    const usedColors = new Set();
    let isErasing = false;
    let lastUsedColor = '#000000';
    const shuffleBtn = document.getElementById('shuffle');

    // Create grid
    for (let i = 0; i < 32 * 32; i++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixel');
        grid.appendChild(pixel);
    }

    // Brush size selection
    brushSizes.forEach(brush => {
        brush.addEventListener('click', () => {
            brushSizes.forEach(b => b.classList.remove('active'));
            brush.classList.add('active');
            currentBrushSize = parseInt(brush.dataset.size);
        });
    });

    // Drawing functionality
    grid.addEventListener('mousedown', () => {
        isDrawing = true;
    });

    grid.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    grid.addEventListener('mouseleave', () => {
        isDrawing = false;
    });

    grid.addEventListener('mouseover', (e) => {
        if (!isDrawing) return;
        if (e.target.classList.contains('pixel')) {
            clearShadows();
            paintPixels(e.target);
        }
    });

    grid.addEventListener('click', (e) => {
        if (e.target.classList.contains('pixel')) {
            clearShadows();
            paintPixels(e.target);
        }
    });

    function paintPixels(centerPixel) {
        const color = isErasing ? '#ffffff' : colorPicker.value;
        if (!isErasing) {
            addColorToHistory(color);
        }
        const gridArray = Array.from(grid.children);
        const centerIndex = gridArray.indexOf(centerPixel);
        const gridWidth = 32;

        // Calculate affected pixels based on brush size in a diamond pattern
        const affected = [];
        for (let y = -currentBrushSize + 1; y < currentBrushSize; y++) {
            for (let x = -currentBrushSize + 1; x < currentBrushSize; x++) {
                // Diamond pattern check
                if (Math.abs(x) + Math.abs(y) < currentBrushSize) {
                    const index = centerIndex + x + (y * gridWidth);
                    if (index >= 0 && index < gridArray.length) {
                        const currentRow = Math.floor(centerIndex / gridWidth);
                        const targetRow = Math.floor(index / gridWidth);
                        if (Math.abs(currentRow - targetRow) < currentBrushSize) {
                            affected.push(gridArray[index]);
                        }
                    }
                }
            }
        }

        // Paint affected pixels
        affected.forEach(pixel => {
            pixel.style.backgroundColor = color;
        });
    }

    function clearShadows() {
        document.querySelectorAll('.pixel.shadow').forEach(pixel => {
            pixel.classList.remove('shadow');
        });
    }

    function showShadow(centerPixel) {
        clearShadows();
        const gridArray = Array.from(grid.children);
        const centerIndex = gridArray.indexOf(centerPixel);
        const gridWidth = 32;

        // Calculate affected pixels based on brush size in a diamond pattern
        for (let y = -currentBrushSize + 1; y < currentBrushSize; y++) {
            for (let x = -currentBrushSize + 1; x < currentBrushSize; x++) {
                // Diamond pattern check
                if (Math.abs(x) + Math.abs(y) < currentBrushSize) {
                    const index = centerIndex + x + (y * gridWidth);
                    if (index >= 0 && index < gridArray.length) {
                        const currentRow = Math.floor(centerIndex / gridWidth);
                        const targetRow = Math.floor(index / gridWidth);
                        if (Math.abs(currentRow - targetRow) < currentBrushSize) {
                            gridArray[index].classList.add('shadow');
                        }
                    }
                }
            }
        }
    }

    // Add these event listeners after the existing ones
    grid.addEventListener('mousemove', (e) => {
        if (e.target.classList.contains('pixel')) {
            showShadow(e.target);
        }
    });

    grid.addEventListener('mouseleave', (e) => {
        isDrawing = false;
        clearShadows();
    });

    // Add this function to handle color swatch creation
    function addColorToHistory(color) {
        if (usedColors.has(color)) return;
        usedColors.add(color);

        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.addEventListener('click', () => {
            isErasing = false;
            eraserBtn.classList.remove('active');
            colorPicker.value = color;
            lastUsedColor = color;
        });

        colorHistory.prepend(swatch);
        
        // Keep only the last 20 colors
        if (colorHistory.children.length > 20) {
            colorHistory.removeChild(colorHistory.lastChild);
            usedColors.delete(Array.from(usedColors)[0]);
        }
    }

    // Add eraser functionality
    eraserBtn.addEventListener('click', () => {
        isErasing = !isErasing;
        eraserBtn.classList.toggle('active');
        if (!isErasing) {
            colorPicker.value = lastUsedColor;
        }
    });

    // Modify the existing colorPicker event listener
    colorPicker.addEventListener('change', () => {
        isErasing = false;
        eraserBtn.classList.remove('active');
        lastUsedColor = colorPicker.value;
        addColorToHistory(colorPicker.value);
    });

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function shuffleGrid() {
        const pixels = grid.children;
        for (let pixel of pixels) {
            const randomColor = getRandomColor();
            pixel.style.backgroundColor = randomColor;
            addColorToHistory(randomColor);
        }
    }

    // Add this event listener with the other ones
    shuffleBtn.addEventListener('click', shuffleGrid);
}); 