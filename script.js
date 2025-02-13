function playSong(songPath) {
  let audioPlayer = document.getElementById("audio-player");
  let audioSource = document.getElementById("audio-source");

  audioSource.src = songPath;
  audioPlayer.load();
  audioPlayer.play();
}

document.addEventListener("DOMContentLoaded", function() {
  const button = document.getElementById("revealButton");
  const messageContainer = document.getElementById("surpriseContainer");
  const message = document.getElementById("message");
  
  fetch("navbar.html")
  .then(response => response.text())
  .then(data => {
      document.getElementById("navbar-container").innerHTML = data;
  });
  // Sürpriz Mesajları
  const messages = [
      "Sen benim için çok özelsin! 💖",
      "Bu dünyada en çok değer verdiğim kişi sensin! ❤️",
      "Seninle birlikte olduğum her an paha biçilemez! ✨",
      "İyi ki hayatımdasın! 💕",
      "Seni her zaman seveceğim! 😘"
  ];

  // Butona tıklanınca rastgele bir mesaj göster
  button.addEventListener("click", function() {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      message.innerText = randomMessage;
      messageContainer.classList.remove("hidden");
  });
});
