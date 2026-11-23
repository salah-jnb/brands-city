// Dialog "plein écran" sur téléphone, centré et borné sur écran large.
// Structure attendue à l'intérieur : en-tête, corps scrollable (flex-1), pied collant.
export const responsiveDialog =
  'flex flex-col gap-0 p-0 w-full h-[100dvh] max-h-[100dvh] overflow-hidden rounded-none ' +
  'max-sm:left-0 max-sm:top-0 max-sm:translate-x-0 max-sm:translate-y-0 ' +
  'max-sm:data-[state=open]:animate-none max-sm:data-[state=closed]:animate-none ' +
  'sm:h-auto sm:max-h-[90vh] sm:rounded-lg';

export const dialogHeaderClass = 'px-4 sm:px-6 py-4 border-b border-border pr-12 text-left';
export const dialogBodyClass = 'flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4';
export const dialogFooterClass =
  'border-t border-border bg-background px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]';
