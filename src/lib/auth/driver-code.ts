// Un compte chauffeur n'a pas d'e-mail réel : Supabase Auth en exige un
// quand même comme identifiant unique, donc on en fabrique un à partir du
// code d'accès (jamais envoyé, jamais consulté) — même principe que le
// compte élève de Scolaris (lib/auth/student-code.ts). Le chauffeur ne voit
// et ne tape que le code, transmis par l'expéditeur au moment de la
// création du compte. Fichier volontairement sans dépendance Supabase :
// utilisé à la fois côté serveur (création du compte) et côté client (page
// de connexion chauffeur).

export const DRIVER_EMAIL_DOMAIN = "chauffeurs.colispreuve.local";

// Exclut les caractères ambigus à l'écrit/à l'oral (0/O, 1/I/l).
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generateDriverCode(length = 8): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export function driverEmailFor(code: string): string {
  return `${code.trim().toUpperCase()}@${DRIVER_EMAIL_DOMAIN}`;
}
