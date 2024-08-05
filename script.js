const input = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const output = document.getElementById('output');
const saveButton = document.getElementById('saveButton');
const redditLink = document.getElementById('redditLink');
const uploadArea = document.getElementById('uploadArea');

let originalFileName = '';

input.addEventListener('change', function(e) {
    uploadArea.classList.remove('highlight');
    const file = e.target.files[0];
    originalFileName = file.name;
    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the original image
            ctx.drawImage(img, 0, 0);

            // Draw the red "X"
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
            ctx.lineWidth = img.width / 20;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(img.width, img.height);
            ctx.moveTo(img.width, 0);
            ctx.lineTo(0, img.height);
            ctx.stroke();

            // Display the result
            output.src = canvas.toDataURL();
            output.style.display = 'block';
            saveButton.style.display = 'inline-block';
            redditLink.style.display = 'inline-block';
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
});

saveButton.addEventListener('click', function() {
    const link = document.createElement('a');
    
    // Create the new filename
    const fileExtension = originalFileName.split('.').pop();
    const newFileName = `Crossed Out ${originalFileName}`;
    
    link.download = newFileName;
    link.href = canvas.toDataURL(`image/${fileExtension}`);
    link.click();
});

function highlightUploadArea() {
    if (!input.files || input.files.length === 0) {
        uploadArea.classList.add('highlight');
    }
}

// Call this function every 5 seconds
setInterval(highlightUploadArea, 5000);

// Remove highlight when the page is interacted with
document.addEventListener('click', function() {
    uploadArea.classList.remove('highlight');
});

// Reapply highlight if no file is selected after 5 seconds of inactivity
let inactivityTimer;
document.addEventListener('mousemove', function() {
    clearTimeout(inactivityTimer);
    uploadArea.classList.remove('highlight');
    inactivityTimer = setTimeout(highlightUploadArea, 5000);
});