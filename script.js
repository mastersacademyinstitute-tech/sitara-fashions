const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => siteNav.classList.toggle("open"));
}

const canvas = document.querySelector("#hero-canvas");
const hero = document.querySelector(".hero-scroll");
const meter = document.querySelector(".meter-fill");

if (canvas && hero) {
  const context = canvas.getContext("2d");
  const frameCount = 240;
  const images = [];
  let loaded = 0;
  let currentFrame = 0;

  const framePath = (index) => `assets/frames/frame_${String(index + 1).padStart(6, "0")}.jpg`;

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    drawFrame(currentFrame);
  }

  function drawFrame(index) {
    const img = images[index];
    if (!img || !img.complete) return;

    const canvasRatio = canvas.width / canvas.height;
    const imageRatio = img.width / img.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (imageRatio > canvasRatio) {
      drawHeight = canvas.height;
      drawWidth = drawHeight * imageRatio;
      const focalX = window.innerWidth < 700 ? 0.68 : 0.5;
      offsetX = (canvas.width * 0.5) - (drawWidth * focalX);
      offsetX = Math.min(0, Math.max(canvas.width - drawWidth, offsetX));
    } else {
      drawWidth = canvas.width;
      drawHeight = drawWidth / imageRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  function updateFrame() {
    const rect = hero.getBoundingClientRect();
    const scrollable = hero.offsetHeight - window.innerHeight;
    const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
    currentFrame = Math.min(frameCount - 1, Math.floor(progress * (frameCount - 1)));
    drawFrame(currentFrame);
    if (meter) meter.style.transform = `scaleX(${progress})`;
  }

  for (let i = 0; i < frameCount; i += 1) {
    const img = new Image();
    img.src = framePath(i);
    img.onload = () => {
      loaded += 1;
      if (loaded === 1) {
        resizeCanvas();
        drawFrame(0);
      }
    };
    images.push(img);
  }

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("scroll", updateFrame, { passive: true });
  resizeCanvas();
  updateFrame();
}

const supabaseConfig = window.SITARA_SUPABASE || {};
const hasSupabaseConfig = Boolean(supabaseConfig.url && supabaseConfig.anonKey && window.supabase);
const supabaseClient = hasSupabaseConfig
  ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
  : null;

document.querySelectorAll("[data-lead-form]").forEach((form) => {
  const status = form.querySelector(".form-status");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = {
      source: form.dataset.leadForm || "website",
      name: data.name || "",
      phone: data.phone || "",
      city: data.city || "",
      interest: data.interest || "",
      message: data.message || "",
      page_url: window.location.href,
    };

    if (!payload.name || !payload.phone) {
      if (status) status.textContent = "Please add your name and phone number.";
      return;
    }

    if (!supabaseClient) {
      if (status) status.textContent = "Supabase is ready. Add your URL and anon key in supabase-config.js to save leads.";
      return;
    }

    if (status) status.textContent = "Saving enquiry...";
    const { error } = await supabaseClient.from(supabaseConfig.table || "sitara_leads").insert(payload);

    if (error) {
      if (status) status.textContent = "Could not save enquiry. Please try WhatsApp or call the store.";
      return;
    }

    form.reset();
    if (status) status.textContent = "Enquiry saved. Sitara Fashions will contact you soon.";
  });
});
