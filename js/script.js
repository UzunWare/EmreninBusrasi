
document.addEventListener("DOMContentLoaded", () => {

  const button = document.getElementById("revealButton");
  const messageContainer = document.getElementById("surpriseContainer");
  const message = document.getElementById("message");

  
  // Sürpriz Mesajları
  const messages = [
      "Sen benim için çok özelsin! 💖",
      "Bu dünyada en çok değer verdiğim kişi sensin! ❤️",
      "Seninle birlikte olduğum her an paha biçilemez! ✨",
      "İyi ki hayatımdasın! 💕",
      "Seni her zaman seveceğim! 😘"
  ];

  // Butona tıklanınca rastgele bir mesaj göster
  if (button) {
    button.addEventListener("click", function() {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      message.innerText = randomMessage;
      messageContainer.classList.remove("hidden");
    });
  }
  else {
    console.error("Button not found.")
  }
});

