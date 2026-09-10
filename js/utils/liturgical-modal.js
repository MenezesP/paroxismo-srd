/**
 * PAROXISMO - LITURGICAL MODAL & NOTIFICATION ENGINE
 * Substitui window.confirm e window.alert por dialogos goticos liturgicos no DOM,
 * compativeis com iframes restritos de Discord Activity e mobile.
 */

export function showLiturgicalConfirm({
  title = "EXPURGO DE ARTEFATO",
  subtitle = "[ ARSENAL TÁTICO ]",
  message = "Deseja remover este item?",
  confirmText = "DESEQUIPAR",
  cancelText = "CANCELAR",
  danger = true,
  onConfirm = () => {}
}) {
  document.getElementById('paroxismo-confirm-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'paroxismo-confirm-modal';
  modal.className = 'fixed inset-0 z-[10000] bg-black/85 flex items-center justify-center p-4 animate-fadeIn select-none';

  modal.innerHTML = `
    <div class="relative max-w-md w-full bg-[#080a10] border-2 border-[#e21b23] shadow-[0_0_50px_rgba(226,27,35,0.45)] p-6 space-y-4 font-mono text-left">
      <div class="border-b border-[#232a3d] pb-2.5 flex items-center justify-between">
        <div>
          <span class="text-[9px] uppercase tracking-widest text-[#e21b23] font-black block">${subtitle}</span>
          <h4 class="text-xl font-serif font-black text-white leading-tight">${title}</h4>
        </div>
        <button id="close-paroxismo-modal-x" class="text-[#8e95a5] hover:text-[#e21b23] text-xl font-bold cursor-pointer p-1 transition-colors">✕</button>
      </div>
      
      <div class="text-xs text-[#c8cbd2] leading-relaxed">
        ${message}
      </div>

      <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#1a2130]">
        <button id="paroxismo-modal-cancel-btn" class="px-4 py-2 bg-[#05070a] hover:bg-[#151a24] text-[#8e95a5] hover:text-white border border-[#232a3d] text-xs font-bold transition-all cursor-pointer">
          [ ${cancelText} ]
        </button>
        <button id="paroxismo-modal-confirm-btn" class="px-5 py-2 ${danger ? 'bg-[#e21b23] hover:bg-white text-black font-black' : 'bg-white hover:bg-[#e21b23] text-black font-black'} text-xs transition-all shadow-[0_0_15px_rgba(226,27,35,0.4)] cursor-pointer">
          [ ${confirmText} ]
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const cleanup = () => modal.remove();

  modal.querySelector('#close-paroxismo-modal-x')?.addEventListener('click', cleanup);
  modal.querySelector('#paroxismo-modal-cancel-btn')?.addEventListener('click', cleanup);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) cleanup();
  });

  const confirmBtn = modal.querySelector('#paroxismo-modal-confirm-btn');
  confirmBtn?.addEventListener('click', () => {
    cleanup();
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  });

  setTimeout(() => confirmBtn?.focus(), 50);
}

export function showLiturgicalToast({
  title = "NOTIFICACAO",
  subtitle = "",
  message = "",
  duration = 4000,
  type = "info"
}) {
  document.getElementById('paroxismo-liturgical-toast')?.remove();

  const toast = document.createElement('div');
  toast.id = 'paroxismo-liturgical-toast';

  const borderColor = type === 'error' ? 'border-[#ff333d]' : type === 'success' ? 'border-[#06b6d4]' : 'border-[#e21b23]';
  const shadowColor = type === 'error' ? 'shadow-[0_0_30px_rgba(255,51,61,0.5)]' : type === 'success' ? 'shadow-[0_0_30px_rgba(6,182,212,0.5)]' : 'shadow-[0_0_25px_rgba(226,27,35,0.4)]';
  const tagColor = type === 'error' ? 'text-[#ff333d]' : type === 'success' ? 'text-[#06b6d4]' : 'text-[#e21b23]';

  toast.className = `fixed bottom-6 right-6 z-[10001] bg-[#07090e] border-2 ${borderColor} ${shadowColor} p-4 min-w-[280px] max-w-[380px] animate-fadeIn flex flex-col gap-1.5 font-mono select-none`;

  toast.innerHTML = `
    <div class="flex items-center justify-between border-b border-[#222a3d] pb-1.5">
      <span class="text-[10px] uppercase font-black ${tagColor}">[ ${title} ]</span>
      <button id="close-liturgical-toast-btn" class="text-xs text-[#8e95a5] hover:text-white cursor-pointer">✕</button>
    </div>
    ${subtitle ? `<div class="text-xs font-serif font-black text-white">${subtitle}</div>` : ''}
    <div class="text-[11px] text-[#c8cbd2] leading-snug">${message}</div>
  `;

  document.body.appendChild(toast);
  toast.querySelector('#close-liturgical-toast-btn')?.addEventListener('click', () => toast.remove());
  setTimeout(() => toast.remove(), duration);
}

if (typeof window !== 'undefined') {
  window.ParoxismoModal = {
    confirm: showLiturgicalConfirm,
    toast: showLiturgicalToast
  };
}
