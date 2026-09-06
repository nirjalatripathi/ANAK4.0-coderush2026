import { useEffect } from 'react';

export default function Modal({ title, children, onClose, wide = false }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-950/60 p-4 pt-16" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={`card-gov w-full ${wide ? 'max-w-4xl' : 'max-w-xl'} p-6`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="serif text-2xl text-navy-900">{title}</h2>
          <button type="button" className="btn-outline min-h-10 px-3 py-1 text-sm" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
