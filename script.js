/* ══════════════════════════════════════════
   script.js — wspólny dla index i podstron
══════════════════════════════════════════ */

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ══════════════════════════════════════════
   CURSOR
══════════════════════════════════════════ */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

if (cursor) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function animCursor() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    if (cursorRing) {
      cursorRing.style.left = rx + 'px';
      cursorRing.style.top  = ry + 'px';
    }
    requestAnimationFrame(animCursor);
  })();

  document.querySelectorAll('a, button, .skill-card, .edu-card, .cert-card-new, .contact-email, .galeria-item, .kwadrat, .nav-btn, .close-slider, .close-lightbox').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
  });
}

/* ══════════════════════════════════════════
   SCROLL PROGRESS & NAV
══════════════════════════════════════════ */
const scrollBar = document.getElementById('scroll-progress');
const mainNav   = document.getElementById('main-nav');

window.addEventListener('scroll', () => {
  if (scrollBar) {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    scrollBar.style.width = pct + '%';
  }
  if (mainNav) {
    mainNav.classList.toggle('scrolled', window.scrollY > 50);
  }
});

if (mainNav && window.scrollY > 50) mainNav.classList.add('scrolled');

/* ══════════════════════════════════════════
   HAMBURGER
══════════════════════════════════════════ */
const hamburger = document.getElementById('hamburger-btn');
const navLinks  = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

/* ══════════════════════════════════════════
   REVEAL ANIMACJE
══════════════════════════════════════════ */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('active');
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('section h2, .reveal-block').forEach(t => revObs.observe(t));

/* ══════════════════════════════════════════
   CONTACT HEADING REVEAL
══════════════════════════════════════════ */
const contactHeading = document.querySelector('.contact-heading');
if (contactHeading) {
  const hObs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { contactHeading.classList.add('visible'); hObs.disconnect(); }
  }, { threshold: 0.3 });
  hObs.observe(contactHeading);
}

/* ══════════════════════════════════════════
   SKILL CARD accordion (mobile)
══════════════════════════════════════════ */
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('click', () => {
    if (window.innerWidth <= 768) card.classList.toggle('active');
  });
});

/* ══════════════════════════════════════════
   BLOB THREE.JS
══════════════════════════════════════════ */
const canvasBlob = document.getElementById('blob-canvas');

if (canvasBlob && typeof THREE !== 'undefined') {
  let sceneBlob, cameraBlob, rendererBlob, blobGroup, geometryBlob, basePositionsBlob;
  let clickNoiseFactor = { value: 0 };
  let blobMouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const blobColors = [0xff003c, 0x00f5ff, 0x8b5cf6, 0x3d3def, 0xff003c];
  let currentBlobColorIndex = 0;

  sceneBlob   = new THREE.Scene();
  const p     = canvasBlob.parentElement;
  let w = p.clientWidth  || window.innerWidth / 2;
  let h = p.clientHeight || window.innerHeight;
  cameraBlob  = new THREE.PerspectiveCamera(45, w / h, 0.1, 10);
  cameraBlob.position.z = 3;
  rendererBlob = new THREE.WebGLRenderer({ canvas: canvasBlob, alpha: true, antialias: true });
  rendererBlob.setSize(w, h);
  rendererBlob.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  geometryBlob = new THREE.SphereGeometry(1, 64, 64);

  const blobSolidMat = new THREE.ShaderMaterial({
    wireframe: false, transparent: true,
    vertexShader: `varying vec3 vPosition; varying vec3 vNormal;
      void main(){ vPosition=position; vNormal=normal; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `varying vec3 vPosition; varying vec3 vNormal; uniform vec3 uColor;
      void main(){
        float transition=(vPosition.y+1.0)/2.0;
        float alpha=1.0-smoothstep(0.2,0.9,transition);
        vec3 lightDir=normalize(vec3(3.0,4.0,3.0));
        float diff=max(dot(normalize(vNormal),lightDir),0.0);
        vec3 ambient=vec3(0.12)*uColor;
        vec3 emissive=vec3(0.0,0.0,0.08);
        vec3 finalColor=ambient+(uColor*diff*1.3)+emissive;
        gl_FragColor=vec4(finalColor,alpha);
      }`,
    uniforms: { uColor: { value: new THREE.Color(0xff003c) } }
  });

  const blobWireMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, wireframe: true, transparent: true, opacity: 0.35 });

  blobGroup = new THREE.Group();
  blobGroup.add(new THREE.Mesh(geometryBlob, blobSolidMat));
  blobGroup.add(new THREE.Mesh(geometryBlob, blobWireMat));
  const bs = window.innerWidth < 900 ? 0.4 : 0.55;
  blobGroup.scale.set(bs, bs, bs);
  sceneBlob.add(blobGroup);
  sceneBlob.add(new THREE.AmbientLight(0xffffff, 0.2));
  basePositionsBlob = geometryBlob.attributes.position.array.slice();

  window.addEventListener('mousemove', e => {
    blobMouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    blobMouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  /* ── KURSOR grab na canvasie ── */
  canvasBlob.style.cursor = 'grab';

  canvasBlob.addEventListener('mouseenter', () => {
    if (cursor) cursor.style.display = 'none';
    if (cursorRing) cursorRing.style.display = 'none';
  });
  canvasBlob.addEventListener('mouseleave', () => {
    if (cursor) cursor.style.display = '';
    if (cursorRing) cursorRing.style.display = '';
    canvasBlob.style.cursor = 'grab';
  });

  /* ── KLIK — zmiana koloru + deformacja ── */
  canvasBlob.addEventListener('click', () => {
    currentBlobColorIndex = (currentBlobColorIndex + 1) % blobColors.length;
    const nc = new THREE.Color(blobColors[currentBlobColorIndex]);
    if (typeof gsap !== 'undefined') {
      gsap.to(blobSolidMat.uniforms.uColor.value, { r: nc.r, g: nc.g, b: nc.b, duration: 0.8 });
      gsap.to(clickNoiseFactor, { value: 2.5, duration: 0.2, ease: 'power2.out',
        onComplete: () => gsap.to(clickNoiseFactor, { value: 0, duration: 2, ease: 'power2.out' }) });
      const cs = window.innerWidth < 900 ? 0.4 : 0.55;
      gsap.to(blobGroup.scale, { x: cs * 1.2, y: cs * 1.2, z: cs * 1.2, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' });
    }
  });

  /* ── DRAG TO SPIN ── */
  let isDragging = false;
  let dragLastX = 0, dragLastY = 0;
  let dragVelX = 0, dragVelY = 0;

  canvasBlob.addEventListener('mousedown', e => {
    isDragging = true;
    dragLastX = e.clientX;
    dragLastY = e.clientY;
    dragVelX = 0;
    dragVelY = 0;
    canvasBlob.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    dragVelX = e.clientX - dragLastX;
    dragVelY = e.clientY - dragLastY;
    blobGroup.rotation.y += dragVelX * 0.008;
    blobGroup.rotation.x += dragVelY * 0.008;
    dragLastX = e.clientX;
    dragLastY = e.clientY;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    canvasBlob.style.cursor = 'grab';
  });

  /* ── UKRYJ HINT po pierwszej interakcji ── */
  const blobHintEl    = document.getElementById('blob-hint');
  const blobHintArc   = document.querySelector('.blob-hint-arc');
  const blobHintLabel = document.querySelector('.blob-hint-label');

  function hideHint() {
    [blobHintEl, blobHintArc, blobHintLabel].forEach(el => {
      if (el) { el.style.animation = 'none'; el.style.opacity = '0'; el.style.pointerEvents = 'none'; }
    });
  }

  if (blobHintEl) {
    canvasBlob.addEventListener('mousedown', hideHint, { once: true });
    canvasBlob.addEventListener('click',     hideHint, { once: true });
  }

  /* ── NAPRZEMIENNE NAPISY: pokręć mną / kliknij ── */
  const blobLabelEl = document.getElementById('blob-hint-label');
  if (blobLabelEl) {
    const labels = ['pokręć mną', 'kliknij'];
    let labelIdx = 0;
    setInterval(() => {
      blobLabelEl.style.opacity = '0';
      setTimeout(() => {
        labelIdx = (labelIdx + 1) % labels.length;
        blobLabelEl.textContent = labels[labelIdx];
        blobLabelEl.style.opacity = '';
      }, 400);
    }, 2200);
  }

  /* ── PĘTLA ANIMACJI ── */
  (function animBlob() {
    requestAnimationFrame(animBlob);

    blobMouse.x += (blobMouse.targetX - blobMouse.x) * 0.05;
    blobMouse.y += (blobMouse.targetY - blobMouse.y) * 0.05;

    if (!isDragging) {
      blobGroup.position.x = blobMouse.x * 0.2;
      blobGroup.position.y = blobMouse.y * 0.2;
    }

    const time = Date.now() * 0.0008;
    const baseNoise = 0.28 + Math.sin(Date.now() * 0.0004) * 0.08;
    const intensity = baseNoise + clickNoiseFactor.value * 0.25;
    const pos = geometryBlob.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const ix = i * 3;
      const vx = basePositionsBlob[ix], vy = basePositionsBlob[ix + 1], vz = basePositionsBlob[ix + 2];
      const wave = Math.sin(vx * 2.5 + time) * Math.cos(vy * 2.2 + time * 0.7) * intensity + Math.sin(vz * 2 + time * 1.3) * 0.08;
      pos.array[ix]     = vx * (1 + wave);
      pos.array[ix + 1] = vy * (1 + wave);
      pos.array[ix + 2] = vz * (1 + wave);
    }
    pos.needsUpdate = true;
    geometryBlob.computeVertexNormals();

    if (!isDragging) {
      dragVelX *= 0.92;
      dragVelY *= 0.92;
      blobGroup.rotation.y += 0.003 + dragVelX * 0.005;
      blobGroup.rotation.x += dragVelY * 0.005;
    }

    blobGroup.rotation.x += isDragging ? 0 : blobMouse.y * 0.002;

    rendererBlob.render(sceneBlob, cameraBlob);
  })();

  window.addEventListener('resize', () => {
    const p2 = canvasBlob.parentElement;
    const w2 = p2.clientWidth || window.innerWidth / 2;
    const h2 = p2.clientHeight || window.innerHeight;
    cameraBlob.aspect = w2 / h2;
    cameraBlob.updateProjectionMatrix();
    rendererBlob.setSize(w2, h2);
    const s = window.innerWidth < 900 ? 0.4 : 0.55;
    blobGroup.scale.set(s, s, s);
  });
}

/* ══════════════════════════════════════════
   SLIDER
══════════════════════════════════════════ */
const sliderModal = document.getElementById('slider-modal');
if (sliderModal) {
  const sliderImg   = document.getElementById('slider-img');
  const closeSlider = document.querySelector('.close-slider');
  let sliderIndex = 0;
  let sliderImages = [];

  function initSlider() {
    const items = document.querySelectorAll('.galeria-item');
    if (items.length === 0) return;
    sliderImages = Array.from(items).map(item => item.getAttribute('data-full') || item.querySelector('img')?.src || '');
    items.forEach((item, index) => {
      item.addEventListener('click', () => {
        sliderIndex = index;
        showSlide();
        sliderModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    });
  }

  function showSlide() {
    if (sliderImages[sliderIndex]) sliderImg.src = sliderImages[sliderIndex];
  }
  function sliderNext() { sliderIndex = (sliderIndex + 1) % sliderImages.length; showSlide(); }
  function sliderPrev() { sliderIndex = (sliderIndex - 1 + sliderImages.length) % sliderImages.length; showSlide(); }

  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  if (nextBtn) nextBtn.addEventListener('click', e => { e.stopPropagation(); sliderNext(); });
  if (prevBtn) prevBtn.addEventListener('click', e => { e.stopPropagation(); sliderPrev(); });

  if (closeSlider) closeSlider.addEventListener('click', () => { sliderModal.style.display = 'none'; document.body.style.overflow = ''; });
  sliderModal.addEventListener('click', e => { if (e.target === sliderModal) { sliderModal.style.display = 'none'; document.body.style.overflow = ''; } });

  document.addEventListener('keydown', e => {
    if (sliderModal.style.display === 'flex') {
      if (e.key === 'ArrowRight') sliderNext();
      if (e.key === 'ArrowLeft')  sliderPrev();
      if (e.key === 'Escape')     { sliderModal.style.display = 'none'; document.body.style.overflow = ''; }
    }
  });

  window.addEventListener('load', initSlider);
}

/* ══════════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════════ */
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lightboxImg     = document.getElementById('lightbox-img');
  const closeLightboxEl = document.querySelector('.close-lightbox');
  let lbImages = [];
  let lbIndex  = 0;

  document.querySelectorAll('.grid-kwadraty').forEach(gallery => {
    const imgs = Array.from(gallery.querySelectorAll('.kwadrat img'));
    gallery.querySelectorAll('.kwadrat').forEach((item, index) => {
      item.addEventListener('click', () => {
        lbImages = imgs;
        lbIndex  = index;
        updateLightbox();
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    });
  });

  function updateLightbox() { if (lightboxImg && lbImages[lbIndex]) lightboxImg.src = lbImages[lbIndex].src; }
  function lbNext() { lbIndex = (lbIndex + 1) % lbImages.length; updateLightbox(); }
  function lbPrev() { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; updateLightbox(); }

  document.querySelectorAll('.lb-next').forEach(b => b.addEventListener('click', lbNext));
  document.querySelectorAll('.lb-prev').forEach(b => b.addEventListener('click', lbPrev));
  if (closeLightboxEl) closeLightboxEl.addEventListener('click', () => { lightbox.style.display = 'none'; document.body.style.overflow = ''; });
  lightbox.addEventListener('click', e => { if (e.target === lightbox) { lightbox.style.display = 'none'; document.body.style.overflow = ''; } });

  document.addEventListener('keydown', e => {
    if (lightbox.style.display === 'flex') {
      if (e.key === 'ArrowRight') lbNext();
      if (e.key === 'ArrowLeft')  lbPrev();
      if (e.key === 'Escape')     { lightbox.style.display = 'none'; document.body.style.overflow = ''; }
    }
  });
}

/* ══════════════════════════════════════════
   MODAL
══════════════════════════════════════════ */
const projectModal = document.getElementById('project-modal');
if (projectModal) {
  const modalImage = document.getElementById('modal-image');
  const modalDesc  = document.getElementById('modal-description');
  const modalLink  = document.getElementById('modal-link');
  const closeBtn   = document.querySelector('.close-btn');

  document.querySelectorAll('.card[data-image]').forEach(card => {
    card.addEventListener('click', () => {
      if (modalImage) modalImage.src = card.dataset.image || '';
      if (modalDesc)  modalDesc.textContent = card.dataset.description || '';
      if (modalLink)  {
        modalLink.href = card.dataset.link || '#';
        modalLink.style.display = (!card.dataset.link || card.dataset.link === '#') ? 'none' : 'block';
      }
      projectModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', () => { projectModal.style.display = 'none'; document.body.style.overflow = ''; });
  projectModal.addEventListener('click', e => { if (e.target === projectModal) { projectModal.style.display = 'none'; document.body.style.overflow = ''; } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && projectModal.style.display === 'flex') { projectModal.style.display = 'none'; document.body.style.overflow = ''; } });
}