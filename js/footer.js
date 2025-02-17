document.addEventListener("DOMContentLoaded", function () {
  fetch("/components/footer.html")
      .then(response => response.text())
      .then(data => {
          document.body.insertAdjacentHTML("beforeend", data);
          generateLoveMessage(); // Call love message generator after loading the footer
      });
});

// Random Love Message Generator
function generateLoveMessage() {
  const loveMessages = [
      "Sen benim en güzel hikayemsin... 💖",
      "Aşkımız sonsuz ve her gün biraz daha büyüyor! 🥰",
      "Seninle her an bir masal gibi... 💫",
      "Kalbim seninle her an daha hızlı atıyor! ❤️",
      "Dünyanın en şanslı insanıyım çünkü seni seviyorum! 💕",
  ];

  const randomMessage = loveMessages[Math.floor(Math.random() * loveMessages.length)];
  document.getElementById("random-love-message").textContent = randomMessage;
}