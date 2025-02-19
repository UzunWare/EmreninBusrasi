import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-storage.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, updateDoc, doc, orderBy, query, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", function () {
  const openNotesButton = document.getElementById("openNotesButton");
  const notesModal = document.getElementById("notesModal");
  const closeButton = document.querySelector(".close-button");
  const saveNoteButton = document.getElementById("saveNoteButton");
  const noteInput = document.getElementById("noteInput");
  const notesContainer = document.getElementById("notesContainer");

  const noteViewModal = document.createElement("div");
  noteViewModal.id = "noteViewModal";
  noteViewModal.classList.add("modal");
  noteViewModal.innerHTML = `
        <div class="modal-content">
            <span class="close-view-button">&times;</span>
            <h3>Note Details</h3>
            <p id="fullNoteText"></p>
            <small id="noteTimestamp"></small>
        </div>
    `;
  document.body.appendChild(noteViewModal);
  const closeViewButton = noteViewModal.querySelector(".close-view-button");

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
  //const notesCollection = collection(db, "notes");
  notesModal.style.display = "none";
  noteViewModal.style.display = "none";
  // Open notes modal
  openNotesButton.addEventListener("click", () => {
    if (notesModal.style.display !== "flex") {
      notesModal.style.display = "flex";
      loadNotes(); // Load notes only when the modal is opened
  }
  });

  // Close notes modal
  closeButton.addEventListener("click", () => {
      notesModal.style.display = "none";
  });

  // ✅ Also close the modal when clicking outside of it
  window.addEventListener("click", (event) => {
    if (event.target === notesModal) {
        notesModal.style.display = "none";
    }
    if (event.target === noteViewModal) {
        noteViewModal.style.display = "none";
    }
  });

  // ✅ Close the pop-up when clicking its close button
  closeViewButton.addEventListener("click", () => {
    noteViewModal.style.display = "none";
  });

  // Save note
  saveNoteButton.addEventListener("click", () => {
    saveNotes();
  });

  async function saveNotes() {
    const noteText = noteInput.value.trim();
    if (noteText !== "") {
      try {
          const docRef = await addDoc(collection(db, "notes"), {
              text: noteText,
              timestamp: serverTimestamp(),
              read: false
          });
          noteInput.value = "";
          loadNotes();
      } catch (error) {
          console.error("Error saving note:", error);
      }
    }
  }

  function getRelativeTime(timestamp) {
    if (!timestamp) return "Unknown time";
    const date = timestamp.toDate();
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    if (diffInSeconds < 172800) return "Yesterday";
    return date.toLocaleDateString(); // Returns like "Feb 18, 2024"
  }


  // ✅ Load Notes from Firestore
  async function loadNotes() {
    notesContainer.innerHTML = "";

    try {
        //const q = query(notesCollection, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(collection(db, "notes"));

        querySnapshot.forEach((docSnapshot) => {
            const noteData = docSnapshot.data();
            const noteId = docSnapshot.id;
            const noteText = noteData.text.length > 15
              ? noteData.text.substring(0, 15) + "..."
              : noteData.text;

            const isNew = !noteData.read;
            const newBadge = isNew ?  `<span class="new-badge">🔴 New</span>` : "";
            
            const noteElement = document.createElement("div");
            noteElement.classList.add("note");
            noteElement.innerHTML = `
                <span class="note-preview">${noteText} ${newBadge}</span>
                <span class="note-timestamp">${getRelativeTime(noteData.timestamp)}</span>
                <span class="delete-note" data-id="${noteId}">❌</span>
            `;
            notesContainer.appendChild(noteElement);

            // ✅ Open pop-up modal when clicking a note
            noteElement.querySelector(".note-preview").addEventListener("click", async () => {
              document.getElementById("fullNoteText").innerText = noteData.text;
              document.getElementById("noteTimestamp").innerText = noteData.timestamp 
                  ? new Date(noteData.timestamp.toDate()).toLocaleString() 
                  : "Unknown time";
              noteViewModal.style.display = "flex";

              if (isNew) {
                await markAsRead(noteId);
              }
            });
        });

        // ✅ Delete note when clicking ❌
        document.querySelectorAll(".delete-note").forEach((btn) => {
            btn.addEventListener("click", async function () {
                const noteId = this.getAttribute("data-id");
                try {
                    await deleteDoc(doc(db, "notes", noteId));
                    loadNotes();
                } catch (error) {
                    console.error("Error deleting note:", error);
                }
            });
        });

    } catch (error) {
        console.error("Error loading notes:", error);
    }
  }

  async function markAsRead(noteId) {
    const noteRef = doc(db, "notes", noteId);
    try {
        await updateDoc(noteRef, { read: true }); // 🔥 Mark the note as read
        loadNotes(); // Refresh list to remove "New" label
    } catch (error) {
        console.error("Error updating note status:", error);
    }
  }
});