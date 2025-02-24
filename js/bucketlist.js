import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFqfowG12sSp9al5Ille1pvwHYZ-3TSqU",
  authDomain: "emreninbusrasi-ace67.firebaseapp.com",
  projectId: "emreninbusrasi-ace67",
  storageBucket: "emreninbusrasi-ace67.firebasestorage.app",
  messagingSenderId: "907776175732",
  appId: "1:907776175732:web:70827d8cb573ff6664eb21"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const bucketListRef = collection(db, "bucketlist");
const storage = getStorage(app);

// ✅ Select Page Elements
const bucketTitle = document.getElementById("bucketTitle");
const bucketDescription = document.getElementById("bucketDescription");
const addButton = document.getElementById("addButton");
const bucketList = document.getElementById("bucketList");
const sortOptions = document.getElementById("sortOptions");
const filterOptions = document.getElementById("filterOptions");
// Select pop-up elements
const popupContainer = document.getElementById("popupContainer");
const popupTitle = document.getElementById("popupTitle");
const popupDescription = document.getElementById("popupDescription");
const closePopup = document.getElementById("closePopup");
document.addEventListener("DOMContentLoaded", () => {
  popupContainer.style.display = "none"; // Hide pop-up on page load
});
// Function to Open the Pop-up
async function openPopup(item) {
  popupTitle.textContent = item.title;
  popupDescription.textContent = item.description;
  
  // Clear previous images
  const imageGallery = document.getElementById("imageGallery");
  imageGallery.innerHTML = "";

  // ✅ Fetch images from Firestore when opening the pop-up
  const itemDocRef = doc(db, "bucketlist", item.id);
  const itemSnapshot = await getDocs(bucketListRef);

  if (itemSnapshot) {
      const itemData = itemSnapshot.docs.find(doc => doc.id === item.id).data();
      if (itemData.images && itemData.images.length > 0) {
          itemData.images.forEach(imageURL => {
              displayImage(imageURL);
          });
      }
  }

  // ✅ Store the current item's ID for uploads
  popupContainer.dataset.currentItemId = item.id;
  popupContainer.style.display = "flex";
}


document.getElementById("uploadImageButton").addEventListener("click", async () => {
  const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select an image to upload.");
        return;
    }

    const itemId = popupContainer.dataset.currentItemId; // Get the current bucket list item ID
    const storageRef = ref(storage, `bucketlist_images/${itemId}/${file.name}`);

    try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // ✅ Fetch existing images from Firestore
        const itemDocRef = doc(db, "bucketlist", itemId);
        const itemSnapshot = await getDocs(bucketListRef);
        const itemData = itemSnapshot.docs.find(doc => doc.id === itemId).data();
        const updatedImages = itemData.images ? [...itemData.images, downloadURL] : [downloadURL];

        // ✅ Save updated images list to Firestore
        await updateDoc(itemDocRef, { images: updatedImages });

        // ✅ Display newly uploaded image
        displayImage(downloadURL);
        fileInput.value = ""; // Clear file input

    } catch (error) {
        console.error("Error uploading image:", error);
    }
});

function displayImage(imageURL) {
  const imageGallery = document.getElementById("imageGallery");
  
  const imageContainer = document.createElement("div");
  imageContainer.classList.add("image-item");

  const imgElement = document.createElement("img");
  imgElement.src = imageURL;
  imgElement.classList.add("uploaded-image");

  // ✅ Add delete button
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "🗑";
  deleteButton.classList.add("delete-img-btn");

  deleteButton.addEventListener("click", () => deleteImage(imageURL, imageContainer));

  imageContainer.appendChild(imgElement);
  imageContainer.appendChild(deleteButton);
  imageGallery.appendChild(imageContainer);
}

async function deleteImage(imageURL, imageContainer) {
  if (!confirm("Are you sure you want to delete this image?")) return;

  const itemId = popupContainer.dataset.currentItemId;
  const storageRef = ref(storage, imageURL);

  try {
      // ✅ Delete from Firebase Storage
      await deleteObject(storageRef);

      // ✅ Remove from Firestore
      const itemDocRef = doc(db, "bucketlist", itemId);
      const itemData = (await getDocs(bucketListRef)).docs.find(doc => doc.id === itemId).data();
      const updatedImages = itemData.images.filter(url => url !== imageURL);

      await updateDoc(itemDocRef, { images: updatedImages });

      // ✅ Remove from UI
      imageContainer.remove();

  } catch (error) {
      console.error("Error deleting image:", error);
  }
}

// Close Pop-up When Clicking Close Button
closePopup.addEventListener("click", () => {
  popupContainer.style.display = "none";
});

// ✅ Function to Fetch and Display Items from Firestore
async function loadBucketList() {
  bucketList.innerHTML = ""; // Clear current list
    const querySnapshot = await getDocs(bucketListRef);
    let items = [];

    querySnapshot.forEach((doc) => {
        let data = doc.data();
        items.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            completed: data.completed,
            images: data.images || [],  // Ensure images are loaded
            timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
        });
    });

    // ✅ Apply Sorting
    if (sortOptions.value === "newest") {
        items.sort((a, b) => b.timestamp - a.timestamp);
    } else {
        items.sort((a, b) => a.timestamp - b.timestamp);
    }

    // ✅ Apply Filtering
    if (filterOptions.value === "completed") {
        items = items.filter(item => item.completed);
    } else if (filterOptions.value === "pending") {
        items = items.filter(item => !item.completed);
    }

    // ✅ Display each item correctly
    items.forEach(item => displayItem(item));
}

// ✅ Function to Display a Bucket List Item
function displayItem(item) {
  const itemContainer = document.createElement("div");
    itemContainer.classList.add("bucket-item");

    const title = document.createElement("h3");
    title.textContent = item.title;
    title.style.cursor = "pointer";

    // ✅ When clicking on the title, open the detailed view
    title.addEventListener("click", () => openPopup(item));

    // ✅ Create a button container to group buttons
    const buttonGroup = document.createElement("div");
    buttonGroup.classList.add("button-group");

    const completeButton = document.createElement("button");
    completeButton.textContent = item.completed ? "✔ Completed" : "Mark as Done";
    completeButton.classList.add("complete-btn");

    completeButton.addEventListener("click", async () => {
        await updateDoc(doc(db, "bucketlist", item.id), { completed: !item.completed });
        loadBucketList(); // Refresh List
    });

    const editButton = document.createElement("button");
    editButton.textContent = "✏ Edit";
    editButton.classList.add("edit-btn");

    editButton.addEventListener("click", async () => {
        const newTitle = prompt("Update Title:", item.title);
        const newDescription = prompt("Update Description:", item.description);

        if (newTitle && newDescription) {
            await updateDoc(doc(db, "bucketlist", item.id), {
                title: newTitle,
                description: newDescription
            });
            loadBucketList();
        }
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "🗑 Delete";
    deleteButton.classList.add("delete-btn");

    deleteButton.addEventListener("click", async () => {
        if (confirm("Are you sure you want to delete this item?")) {
            await deleteDoc(doc(db, "bucketlist", item.id));
            loadBucketList(); // Refresh List
        }
    });

    // ✅ Append buttons inside the button group
    buttonGroup.appendChild(completeButton);
    buttonGroup.appendChild(editButton);
    buttonGroup.appendChild(deleteButton);

    // ✅ Append elements in order: Title, Button Group
    itemContainer.appendChild(title);
    itemContainer.appendChild(buttonGroup);

    bucketList.appendChild(itemContainer);
}

// ✅ Add New Bucket List Item
addButton.addEventListener("click", async () => {
    const title = bucketTitle.value.trim();
    const description = bucketDescription.value.trim();

    if (!title) {
        alert("Please enter a bucket list item!");
        return;
    }

    await addDoc(bucketListRef, {
        title,
        description,
        completed: false,
        timestamp: new Date()
    });

    bucketTitle.value = "";
    bucketDescription.value = "";

    loadBucketList();
});

// ✅ Event Listeners for Sorting & Filtering
sortOptions.addEventListener("change", loadBucketList);
filterOptions.addEventListener("change", loadBucketList);

// ✅ Load Items When Page Loads
window.addEventListener("DOMContentLoaded", loadBucketList);
