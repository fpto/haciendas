// Nombre de la cookie que guarda la hacienda activa. Vive en su propio módulo
// (sin imports de servidor como `next/headers`) para poder compartirse tanto en
// componentes de servidor como de cliente sin arrastrar código solo-servidor al
// bundle del navegador.
export const ACTIVE_HACIENDA_COOKIE = "active_hacienda";
