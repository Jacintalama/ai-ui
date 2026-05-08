// Lightbox overlay for image galleries.
// Usage: <div x-data="lightbox" x-init="init()"> ... </div>
// Each gallery <img> carries data-img-slot="gallery" + data-idx="N" and @click="show(parseInt($el.dataset.idx))".
export const lightbox = () => ({
  open: false,
  src: "",
  alt: "",
  idx: 0,
  images: [],
  init() {
    // Collect all gallery images at boot. Each <img> must have data-img-slot="gallery".
    this.images = Array.from(document.querySelectorAll('[data-img-slot="gallery"]'))
      .map((img) => ({ src: img.dataset.full || img.src, alt: img.alt }));
    document.addEventListener("keydown", (e) => {
      if (!this.open) return;
      if (e.key === "Escape") { this.open = false; return; }
      if (e.key === "ArrowRight") this.next();
      if (e.key === "ArrowLeft") this.prev();
    });
  },
  show(i) {
    if (i < 0 || i >= this.images.length) return;
    this.idx = i;
    this.src = this.images[i].src;
    this.alt = this.images[i].alt;
    this.open = true;
  },
  next() { this.show((this.idx + 1) % this.images.length); },
  prev() { this.show((this.idx - 1 + this.images.length) % this.images.length); },
});
