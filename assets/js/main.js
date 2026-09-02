// ===================================================================
// Écuries des Noyers — v6 — script principal
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Menu mobile (burger) ---------- */
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.main-nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('open');
      burger.classList.toggle('open');
    });
  }

  /* ---------- Sous-menus déroulants (Écurie / Présentation) sur mobile ---------- */
  document.querySelectorAll('.has-dropdown > .nav-toggle-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (window.innerWidth <= 760) {
        e.preventDefault();
        btn.closest('.has-dropdown').classList.toggle('open');
      }
    });
  });

  /* ---------- Animation au scroll (reveal) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Fiches chevaux dépliables (Élevage / Cavalerie) ---------- */
  document.querySelectorAll('.horse-card .horse-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const card = toggle.closest('.horse-card');
      const wasOpen = card.classList.contains('open');
      card.classList.toggle('open', !wasOpen);
      toggle.querySelector('.label').textContent = wasOpen ? 'En savoir plus' : 'Réduire';
    });
  });

  /* ---------- Formulaire de contact ---------- */
  const form = document.querySelector('form.contact-form');
  if (form) {
    // Pré-remplissage automatique du sujet selon la page d'origine (?raison=... et ?cheval=...)
    const params = new URLSearchParams(window.location.search);
    const raison = params.get('raison');
    const cheval = params.get('cheval');
    const raisonSelect = form.querySelector('#raison');
    const chevalSelect = form.querySelector('#cheval-interet');

    if (raison && raisonSelect) {
      const opt = [...raisonSelect.options].find(o => o.value === raison);
      if (opt) raisonSelect.value = raison;
    }
    if (cheval && chevalSelect) {
      const opt = [...chevalSelect.options].find(o => o.value === cheval);
      if (opt) chevalSelect.value = cheval;
    }
    // Affiche le bloc "cheval concerné" seulement si la raison est liée à l'élevage,
    // et met à jour l'objet du message envoyé par email selon la raison choisie.
    const subjectField = form.querySelector('input[name="subject"]');
    const toggleChevalField = () => {
      const chevalField = form.querySelector('#cheval-field');
      const val = raisonSelect ? raisonSelect.value : '';
      if (chevalField) chevalField.style.display = (val === 'achat-cheval') ? 'block' : 'none';
      if (subjectField && raisonSelect && raisonSelect.selectedOptions.length) {
        const label = raisonSelect.selectedOptions[0].textContent;
        subjectField.value = val ? `Site Écuries des Noyers — ${label}` : 'Nouveau message — site Écuries des Noyers';
      }
    };
    if (raisonSelect) {
      raisonSelect.addEventListener('change', toggleChevalField);
      toggleChevalField();
    }

    // Envoi du formulaire — service tiers léger (Web3Forms), sans backend à héberger.
    // ⚠️ Remplacer YOUR_ACCESS_KEY_HERE par la clé générée sur https://web3forms.com
    // (gratuit, il suffit de créer un compte avec l'email de réception souhaité).
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('form-status');
      const btn = form.querySelector('button[type="submit"]');
      const data = new FormData(form);

      btn.disabled = true;
      btn.textContent = 'Envoi en cours…';

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: data
        });
        const json = await res.json();
        if (json.success) {
          status.textContent = 'Message envoyé, nous revenons vers vous rapidement.';
          status.className = 'ok';
          form.reset();
        } else {
          throw new Error(json.message || 'Erreur inconnue');
        }
      } catch (err) {
        status.textContent = "L'envoi a échoué. Vous pouvez nous écrire directement à contact@ecuriesdesnoyers.fr en attendant.";
        status.className = 'err';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Envoyer le message';
      }
    });
  }

});
