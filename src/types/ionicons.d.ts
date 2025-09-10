// Archivo para resolver conflictos de tipos entre ionicons y Angular
declare module 'ionicons' {
  export * from 'ionicons/dist/types/components';
}

// Solucionar conflictos específicos de HTMLIonIconElement
declare global {
  interface HTMLElementTagNameMap {
    'ion-icon': HTMLIonIconElement;
  }

  interface HTMLIonIconElement extends HTMLElement {
    ariaHidden?: string | null;
    ariaLabel?: string | null;
    color?: string;
    flipRtl?: boolean;
    icon?: any;
    ios?: string;
    lazy?: boolean;
    md?: string;
    mode?: 'ios' | 'md';
    name?: string;
    sanitize?: boolean;
    size?: 'small' | 'large';
    src?: string;
  }
}
