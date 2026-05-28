/* ===== LIVE CHAT ANIMATION ENGINE ===== */
function liveChat(bodyId, msgClass, botClass, typingClass) {
  const body = document.getElementById(bodyId);
  if (!body) return;

  const msgs = Array.from(body.querySelectorAll('.' + msgClass));

  // Inject typing indicator
  const typing = document.createElement('div');
  typing.className = typingClass;
  typing.innerHTML = '<span></span><span></span><span></span>';
  body.appendChild(typing);

  // Hide all messages
  msgs.forEach(m => {
    m.style.opacity = '0';
    m.style.transform = 'translateY(12px)';
    m.style.transition = 'opacity .32s ease, transform .32s ease';
  });

  let i = 0;
  const scroll = () => body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' });

  function next() {
    if (i >= msgs.length) {
      // Pause then restart from zero
      setTimeout(() => {
        msgs.forEach(m => {
          m.style.transition = 'none';
          m.style.opacity = '0';
          m.style.transform = 'translateY(12px)';
        });
        // Re-enable transitions after reset
        setTimeout(() => {
          msgs.forEach(m => {
            m.style.transition = 'opacity .32s ease, transform .32s ease';
          });
          i = 0;
          scroll();
          setTimeout(next, 800);
        }, 50);
      }, 5500);
      return;
    }

    const msg = msgs[i];
    const isBot = msg.classList.contains(botClass);

    if (isBot) {
      // Show typing indicator
      typing.style.display = 'inline-flex';
      scroll();
      const thinkMs = 900 + Math.random() * 700;
      setTimeout(() => {
        typing.style.display = 'none';
        msg.style.opacity = '1';
        msg.style.transform = 'none';
        scroll();
        i++;
        setTimeout(next, 520 + Math.random() * 280);
      }, thinkMs);
    } else {
      msg.style.opacity = '1';
      msg.style.transform = 'none';
      scroll();
      i++;
      setTimeout(next, 680 + Math.random() * 320);
    }
  }

  // Start after a brief delay
  setTimeout(next, 700);
}
