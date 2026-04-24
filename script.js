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

const fileInput = document.getElementById('noteFile');
const uploadBtn = document.getElementById('uploadBtn');
const listItems = document.getElementById('listItems');

uploadBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) return alert("Please select a file first!");

    try {
        // Create a unique reference for the file in Storage
        const storageRef = ref(storage, 'notes/' + file.name);
        
        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);
        
        // Get the public download link
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Save the file metadata to Firestore so everyone can see it
        await addDoc(collection(db, "notes"), {
            name: file.name,
            url: downloadURL,
            timestamp: new Date()
        });

        alert("Note uploaded successfully!");
    } catch (e) {
        console.error("Error uploading: ", e);
    }
});

// 2. Real-time Display Function
// This listens for any changes in the "notes" collection and updates the UI instantly
const q = query(collection(db, "notes"), orderBy("timestamp", "desc"));
onSnapshot(q, (snapshot) => {
    listItems.innerHTML = ""; // Clear list
    snapshot.forEach((doc) => {
        const note = doc.data();
        const li = document.createElement('li');
        li.innerHTML = `<a href="${note.url}" target="_blank">${note.name}</a>`;
        listItems.appendChild(li);
    });
});
