const header = document.querySelector("[data-header]");
const menuTrigger = document.querySelector(".menu-trigger");
const mainNav = document.querySelector(".main-nav");

if (header) {
  const updateHeader = () =>
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

menuTrigger?.addEventListener("click", () => {
  const expanded = menuTrigger.getAttribute("aria-expanded") === "true";
  menuTrigger.setAttribute("aria-expanded", String(!expanded));
  mainNav?.classList.toggle("is-open", !expanded);
});

mainNav?.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    menuTrigger?.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("is-open");
  }),
);

const revealNodes = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -28px 0px" },
  );
  revealNodes.forEach((node) => revealObserver.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}
