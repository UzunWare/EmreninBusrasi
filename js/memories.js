import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-storage.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFqfowG12sSp9al5Ille1pvwHYZ-3TSqU",
  authDomain: "emreninbusrasi-ace67.firebaseapp.com",
  projectId: "emreninbusrasi-ace67",
  storageBucket: "emreninbusrasi-ace67.firebasestorage.app",
  messagingSenderId: "907776175732",
  appId: "1:907776175732:web:70827d8cb573ff6664eb21"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const gallery = document.getElementById("gallery");

const popupContainer = document.getElementById("popupContainer");
const popupImage = document.getElementById("popupImage");
const popupTitle = document.getElementById("popupTitle");
const popupDescription = document.getElementById("popupDescription");
const popupUpload = document.getElementById("popupUpload");
const popupCancel = document.getElementById("popupCancel");
const popupHeader = document.getElementById("popupHeader");

// Temporary variables to store selected file and edit mode
let selectedFile = null;
let editImageId = null;




uploadButton.addEventListener("click", () => fileInput.click());

//Handle file selection
fileInput.addEventListener("change", (event) => {
  selectedFile = event.target.files[0]; // get the selected file
  if (selectedFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
      popupImage.src = e.target.result;
      popupTitle.value = "";
      popupDescription.value = "";
      editImageId = null;
      popupHeader.textContent = "Upload Image";
      popupContainer.style.display = "flex";
    };
    reader.readAsDataURL(selectedFile);
  }
});

popupUpload.addEventListener("click", async () => {
  if (!popupTitle.value || !popupDescription.value) {
      alert("Please enter a title and description.");
      return;
  }

  if (editImageId) {
      // Editing an existing image
      const docRef = doc(db, "gallery", editImageId);
      await updateDoc(docRef, {
          title: popupTitle.value,
          description: popupDescription.value
      });
      console.log("Document updated:", editImageId);
      //location.reload(); // Refresh to update changes

      const editedPhotoContainer = document.getElementById(`photo-${editImageId}`);
      if (editedPhotoContainer) {
          editedPhotoContainer.querySelector(".photo-title").textContent = popupTitle.value;
          editedPhotoContainer.querySelector(".photo-desc").textContent = popupDescription.value;
      }

      popupContainer.style.display = "none"; // Close the pop-up
      editImageId = null; // Reset edit mode
  } else {
      // Uploading a new image
      if (!selectedFile) {
          alert("No image selected!");
          return;
      }

      const storageRef = ref(storage, "gallery/" + selectedFile.name);
      const uploadTask = uploadBytes(storageRef, selectedFile);

      uploadTask.then(async (snapshot) => {
          const downloadURL = await getDownloadURL(snapshot.ref);
          saveImageData(popupTitle.value, popupDescription.value, downloadURL);
          popupContainer.style.display = "none";
      }).catch(error => {
          console.error("Upload failed:", error);
      });
  }
});

popupCancel.addEventListener("click", () => {
  popupContainer.style.display = "none";
});

async function uploadImage(file) {
  // Ask use for a title and description
  const title = prompt("Enter a title for this image:");
  const description = prompt("Enter a description for this image:");

  if (!title || !description) {
    alert("Title and description are required!");
    return;
  }


  if (!file) {
    alert("Lütfen bir dosya seçin!");
    return;
  }

  const storageRef = ref(storage, "gallery/" + file.name);
  //document.getElementById("status").innerText = "Uploading...";

  try {
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef); // URL al
    //document.getElementById("status").innerHTML = `Yükleme tamamlandı!`;
    //<a href="${downloadURL}" target="_blank">Müziği Dinle</a>
    console.log("Resim Yüklendi: ", downloadURL); // Konsolda müzik linki göster

    saveImageData(title, description, downloadURL);
  } catch (error) {
    console.error("Yükleme Hatası:", error);
    //document.getElementById("status").innerText = "Yükleme başarısız!";
  }
  // const storageRef = ref("gallery/"+file.name);
  // const uploadTask = storageRef.put(file);

  // uploadTask.on(
  //   "state_changed",
  //   (snapshot) => {
  //     const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //     console.log("Upload Progress: " + progress + "%");
  //   },
  //   (error) => {
  //     console.error("Upload failed:", error);
  //   },
  //   () => {
  //     //Upload completed, get the download URL
  //     uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
  //       console.log("File available at:", downloadURL);
  //       displayImage(downloadURL); // Display image in gallery
  //     })
  //   }
  // )
}

function displayImage(id, title, description, imageURL) {
  const photoContainer = document.createElement("div");
    photoContainer.classList.add("photo-container");
    photoContainer.id = `photo-${id}`; // ✅ Unique ID for updating

    const imageElement = document.createElement("img");
    imageElement.src = imageURL;
    imageElement.classList.add("photo");

    // ✅ Open full-size image when clicked
    imageElement.addEventListener("click", () => {
        document.getElementById("fullImage").src = imageURL;
        document.getElementById("fullImageContainer").style.display = "flex";
    });

    document.getElementById("fullImageContainer").style.display = "none";


    const titleElement = document.createElement("h3");
    titleElement.classList.add("photo-title"); // ✅ Used for updating later
    titleElement.textContent = title;

    const descElement = document.createElement("p");
    descElement.classList.add("photo-desc"); // ✅ Used for updating later
    descElement.textContent = description;

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("edit-button");

    // Open pop-up for editing
    editButton.addEventListener("click", () => {
        popupImage.src = imageURL;
        popupTitle.value = title;
        popupDescription.value = description;
        editImageId = id; // Store the document ID for updating
        popupHeader.textContent = "Edit Image Details";
        popupContainer.style.display = "flex";
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", () => deleteImage(id, imageURL, photoContainer));

    photoContainer.appendChild(imageElement);
    photoContainer.appendChild(titleElement);
    photoContainer.appendChild(descElement);
    photoContainer.appendChild(editButton);
    photoContainer.appendChild(deleteButton);

    gallery.appendChild(photoContainer);
}

async function deleteImage(id, imageURL, photoContainer) {
  try {
    // Convert the image URL into a Storage reference
    const storageRef = ref(storage, imageURL);

    // Delete from Firebase Storage
    await deleteObject(storageRef);
    console.log("Image deleted from storage");

    // Delete from Firestore
    await deleteDoc(doc(db, "gallery", id));
    console.log("Document deleted from Firestore");

    // Remove from UI
    photoContainer.remove();
} catch (error) {
    console.error("Error deleting image:", error);
}
}

async function saveImageData(title, description, imageURL) {
  if (!title || !description || !imageURL) {
    console.error("Error: Missing title, description, or imageURL");
    return;
  }
  
  try {
    const docRef = await addDoc(collection(db, "gallery"),{
      title: title,
      description: description,
      imageURL: imageURL,
      timestamp: new Date()
    });
    console.log("Document written with ID: ", docRef.id);
    displayImage(docRef.id, title, description, imageURL);
  } catch (error) {
    console.error("Error adding document: ", error);
  }
  
  
}


async function loadImages() {
  console.log("Fetching images...");
    try {
        const querySnapshot = await getDocs(collection(db, "gallery"));
        let images = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("Fetched Image:", data); // ✅ Debugging log
            images.push({
                id: doc.id,
                title: data.title,
                description: data.description,
                imageURL: data.imageURL,
                timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
            });
        });

        // ✅ Debug: Check if images exist
        console.log("Total images fetched:", images.length);

        sortAndDisplayImages(images);
        return images;
    } catch (error) {
        console.error("Error loading images:", error);
        return [];
    }

}

function sortAndDisplayImages(images) {
  const sortOption = document.getElementById("sortOptions").value;

  if (sortOption === "newest") {
    images.sort((a, b) => b.timestamp - a.timestamp);
  } else if (sortOption === "oldest") {
    images.sort((a, b) => a.timestamp - b.timestamp);
  }
  displayImages(images);
}

// ✅ Filtering function
function filterImages(images) {
  const searchQuery = document.getElementById("searchInput").value.toLowerCase();
  return images.filter(image =>
      image.title.toLowerCase().includes(searchQuery) ||
      image.description.toLowerCase().includes(searchQuery)
  );
}

// ✅ Function to display images
function displayImages(images) {
  gallery.innerHTML = ""; // Clear existing images

  images.forEach((image) => {
      displayImage(image.id, image.title, image.description, image.imageURL);
  });
}

document.getElementById("closeFullImage").addEventListener("click", () => {
  document.getElementById("fullImageContainer").style.display = "none";
});

// ✅ Event listeners for sorting & filtering
document.getElementById("sortOptions").addEventListener("change", () => loadImages());
document.getElementById("searchInput").addEventListener("input", async () => {
  const images = await loadImages(); // ✅ Ensure images are fetched
  const filteredImages = filterImages(images);
  displayImages(filteredImages);
});

// ✅ Load images when the page loads
window.addEventListener("DOMContentLoaded", loadImages);

window.db = db;
