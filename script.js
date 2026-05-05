/*

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


const cloudName = "dbe8gp9jl"; 
const uploadPreset = "notes_preset";

document.getElementById('uploadBtn').onclick = async () => {
    const file = document.getElementById('photoInput').files[0];
    const description = document.getElementById('descInput').value;

    if (!file || !description) return alert("Please add a photo and a description!");

    // STEP 1: Upload Image to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://cloudinary.com{cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    });
    const imageData = await response.json();
    const imageUrl = imageData.secure_url; // This is your link!

    // STEP 2: Save Link + Description to Firebase Firestore
    await addDoc(collection(db, "notes"), {
        photoUrl: imageUrl,
        noteDescription: description,
        createdAt: new Date()
    });

    alert("Notes uploaded successfully!");
};


onSnapshot(collection(db, "notes"), (snapshot) => {
    const container = document.getElementById('notesDisplay');
    container.innerHTML = ""; 
    
    snapshot.forEach((doc) => {
        const data = doc.data();
        container.innerHTML += `
            <div class="note-card">
                <img src="${data.photoUrl}" width="300px">
                <p>${data.noteDescription}</p>
            </div>
        `;
    });
});

//////////////////////THIS IS WHERE ONE CODE ENDS///////////////////////////



import { initializeApp } from "https://gstatic.com";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://gstatic.com";

// 1. YOUR FIREBASE CONFIG (Paste yours here)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. CLOUDINARY CONFIG
const cloudName = "dbe8gp9jl"; 
const uploadPreset = "notes_preset";

// 3. VARIABLES FOR DRAG & DROP
const dropArea = document.getElementById("drop-area");
const inputFile = document.getElementById("input-file");
const imageView = document.getElementById("img-view");
const gallery = document.getElementById("thumbnail-gallery");

let allFiles = []; // This stores the actual file objects

// 4. HANDLING FILE SELECTION
inputFile.addEventListener("change", handleFiles);

function handleFiles() {
    const files = inputFile.files;
    for (const file of files) {
        allFiles.push(file); // Add file to our array
        
        // Show preview in the drop area
        let imgLink = URL.createObjectURL(file);
        imageView.style.backgroundImage = `url(${imgLink})`;
        imageView.textContent = "";
        imageView.style.border = 0;

        // Add to thumbnail gallery
        let thumb = document.createElement("img");
        thumb.src = imgLink;
        thumb.style.width = "60px";
        thumb.style.margin = "5px";
        gallery.appendChild(thumb);
    }
}

// 5. DRAG & DROP LISTENERS
dropArea.addEventListener("dragover", (e) => e.preventDefault());
dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    inputFile.files = e.dataTransfer.files;
    handleFiles();
});

// 6. THE BIG UPLOAD BUTTON
document.getElementById("submit-btn").addEventListener("click", async () => {
    // Grab text from the inputs
    const title = document.getElementById('titleInput')?.value || "Untitled";
    const className = document.getElementById('classInput')?.value || "No Class";
    const description = document.getElementById('descInput')?.value || "";

    if (allFiles.length === 0) {
        alert("Please add at least one image!");
        return;
    }

    try {
        // Change button text to show it's working
        document.getElementById("submit-btn").innerText = "Uploading...";
        
        // STEP 1: Upload the first file to Cloudinary
        const formData = new FormData();
        formData.append('file', allFiles[0]); 
        formData.append('upload_preset', uploadPreset);

        const response = await fetch(`https://cloudinary.com{cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        const imageData = await response.json();
        
        if (!imageData.secure_url) {
            throw new Error(imageData.error ? imageData.error.message : "Cloudinary Upload Failed");
        }

        const imageUrl = imageData.secure_url;

        // STEP 2: Save metadata to Firebase Firestore
        await addDoc(collection(db, "notes"), {
            title: title,
            className: className,
            description: description,
            photoUrl: imageUrl,
            timestamp: new Date()
        });

        alert("Upload Successful!");
        window.location.href = "files.html"; // Redirect to your viewer page

    } catch (e) {
        console.error("Error: ", e);
        alert("Upload failed: " + e.message);
        document.getElementById("submit-btn").innerText = "Upload";
    }
});

// 7. DISPLAY LOGIC (For the files.html page)
const notesContainer = document.getElementById('notesDisplay');
if (notesContainer) {
    const q = query(collection(db, "notes"), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
        notesContainer.innerHTML = ""; 
        snapshot.forEach((doc) => {
            const note = doc.data();
            const card = document.createElement('div');
            card.className = "note-card";
            card.innerHTML = `
                <h3>${note.title}</h3>
                <p><strong>${note.className}</strong></p>
                <img src="${note.photoUrl}" style="width:100%; border-radius:8px;">
                <p>${note.description}</p>
                <hr>
            `;
            notesContainer.appendChild(card);
        });
    });
}
*/
const cloudName = "dbe8gp9jl"; 
const uploadPreset = "notes_preset";

const dropArea = document.getElementById("drop-area");
const inputFile = document.getElementById("input-file");
const imageView = document.getElementById("img-view");
const gallery = document.getElementById("thumbnail-gallery");

let selectedFile = null; // Store the actual file object here

// --- 1. SHOW IMAGE IMMEDIATELY ---
inputFile.addEventListener("change", () => {
    selectedFile = inputFile.files[0]; // Grab the first JPEG/PNG
    if (selectedFile) {
        let imgLink = URL.createObjectURL(selectedFile);
        // This puts the image inside your "lil box"
        imageView.style.backgroundImage = `url(${imgLink})`;
        imageView.textContent = ""; 
        imageView.style.border = 0;
    }
});

// --- 2. THE UPLOAD LOGIC ---
document.getElementById("submit-btn").onclick = async () => {
    // Grab text from your info-boxes
    const title = document.getElementById('titleInput').value;
    const className = document.getElementById('classInput').value;
    const description = document.getElementById('descInput').value;

    if (!selectedFile) return alert("Please select a JPEG image first!");

    try {
        document.getElementById("submit-btn").innerText = "Uploading...";

        const formData = new FormData();
        formData.append('file', selectedFile); 
        formData.append('upload_preset', uploadPreset);
        
        // This attaches your text directly to the file in Cloudinary
        formData.append('context', `title=${title}|class=${className}|desc=${description}`);
        formData.append('tags', 'senior_project_notes'); 

        const response = await fetch(`https://cloudinary.com{cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.secure_url) {
            alert("Upload Successful!");
            window.location.href = "files.html"; // Send them to the gallery
        } else {
            alert("Upload failed: " + data.error.message);
        }

    } catch (e) {
        console.error("Error:", e);
        alert("Something went wrong. Check your internet or Cloudinary settings.");
    } finally {
        document.getElementById("submit-btn").innerText = "Upload";
    }
};




