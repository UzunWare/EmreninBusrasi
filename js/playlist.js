import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-storage.js";

const storage = getStorage();

window.playMusic = function (url) {
  document.getElementById("audioPlayer").src = url;
  document.getElementById("audioPlayer").play();
}

document.getElementById("uploadFile").addEventListener("click", async () => {
  const file = document.getElementById("fileInput").files[0];
  if (!file) {
    alert("Lütfen bir dosya seçin!");
    return;
  }

  const storageRef = ref(storage, "musics/" + file.name);
  document.getElementById("status").innerText = "Uploading...";

  try {
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef); // URL al
    document.getElementById("status").innerHTML = `Yükleme tamamlandı!`;
    //<a href="${downloadURL}" target="_blank">Müziği Dinle</a>
    console.log("Müzik Yüklendi: ", downloadURL); // Konsolda müzik linki göster

    listFiles();
  } catch (error) {
    console.error("Yükleme Hatası:", error);
    document.getElementById("status").innerText = "Yükleme başarısız!";
  }
});

async function listFiles() {
  const storageRef = ref(storage, "musics/");
  const fileList = document.getElementById("musicList");
  fileList.innerHTML = ""; // Listeyi temizle

  try {
    const res = await listAll(storageRef);
    res.items.forEach(async (itemRef) => {
      const url = await getDownloadURL(itemRef);
      const li = document.createElement("li");
      
      const playButton = document.createElement("button");
      playButton.textContent = itemRef.name;
      playButton.onclick = () => playMusic(url);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "🗑️ Sil";
      deleteButton.style.marginLeft = "10px";
      deleteButton.onclick = () => deleteFile(itemRef.fullPath);

      li.appendChild(playButton);
      li.appendChild(deleteButton);
      //li.innerHTML = `<button onclick="playMusic('${url}')">${itemRef.name}</button>`;
      fileList.appendChild(li);
    });
  } catch (error) {
    console.error("Listeleme hatası:", error);
    document.getElementById("status").innerText = "Yükleme başarısız!";

  }
}

async function deleteFile(filePath) {
  const fileRef = ref(storage, filePath);

  try {
    await deleteObject(fileRef);
    alert("Müzik başarıyla silindi!");
    listFiles();
  } catch (error) {
    console.error("Silme hatası:", error);
    alert("Müzik silinemedi!");
  }
}


// Sayfa yüklendiğinde müzikleri listele
window.onload = listFiles;
