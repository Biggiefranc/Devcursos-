import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase/firebase-config";

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

mainNav?.querySelectorAll("a, button").forEach((link) =>
  link.addEventListener("click", () => {
    menuTrigger?.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("is-open");
  }),
);

function renderSession(user) {
  const signedIn = Boolean(user);
  document.querySelectorAll("[data-session-guest]").forEach((node) => {
    node.hidden = signedIn;
  });
  document.querySelectorAll("[data-session-member]").forEach((node) => {
    node.hidden = !signedIn;
  });
}

document.querySelectorAll("[data-session-sign-out]").forEach((button) => {
  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Não foi possível encerrar a sessão.", error);
    } finally {
      button.disabled = false;
    }
  });
});

onAuthStateChanged(auth, renderSession);
