const dropArea = document.getElementById("drop-area");
const inputFile = document.getElementById("input-file");
const imageView = document.getElementById("img-view");

let allFiles = [];

inputFile.addEventListener("change", uploadImage);

function uploadImage() {
    const files = inputFile.files;
    const gallery = document.getElementById("thumbnail-gallery");

    for (const file of files) {
        allFiles.push(file);
        let imgLink = URL.createObjectURL(inputFile.files[0]);
        imageView.style.backgroundImage = `url(${imgLink})`;
        imageView.textContent = "";
        imageView.style.border = 0;

        let thumb = document.createElement("img");
        thumb.src = imgLink;
        thumb.classList.add("thumb");
        gallery.appendChild(thumb);
    }

    /*
    let imgLink = URL.createObjectURL(inputFile.files[0]);
    imageView.style.backgroundImage = `url(${imgLink})`;
    imageView.textContent = "";
    imageView.style.border = 0;
    */
}

dropArea.addEventListener("dragover", function(e){
    e.preventDefault();
});

dropArea.addEventListener("drop", function(e){
    e.preventDefault();
    inputFile.files = e.dataTransfer.files;
    uploadImage();
});

document.getElementById("submit-btn").addEventListener("click", () => {
    if (allFiles.length === 0) {
        alert("Please add some images first!");
        return;
    }
    console.log("Uploading these files: ", allFiles);
    alert("Upload Successful!");
});