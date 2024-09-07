
# Mr.Security

<img src="https://cdn.discordapp.com/attachments/923343160334241873/1282075571051823174/0fb9d8d5-b255-44ab-963c-a4be2b03241b.webp?ex=66de096b&is=66dcb7eb&hm=49564212bc826f659bbf68ab8805f516ce6e8b44aa101f05a933f4158ffe4c68&" width="1000" height="387" >

[![Discord](https://img.shields.io/discord/your-discord-server-id.svg?label=Discord&logo=discord&color=7289DA)](https://discord.gg/your-invite-link)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Mr.Security Bot** este un bot de securitate pentru Discord care ajută la moderarea comunității tale prin monitorizarea mesajelor, gestionarea cuvintelor interzise, aplicarea regulilor de securitate și protejarea serverului împotriva utilizatorilor rău intenționați.

## Caracteristici

- **Monitorizarea mesajelor**: Detectează și șterge mesajele care conțin cuvinte interzise sau ofensatoare.
- **Comenzi personalizabile**: Permite administratorilor să configureze reguli de securitate și să ajusteze pragurile pentru acțiuni precum ban, kick, mute etc.
- **Sistem de excepții (bypass)**: Adaugă sau elimină utilizatori de pe lista de bypass pentru a fi excluși de la regulile de securitate.
- **Alerte pentru administratori**: Trimite alerte către administratori atunci când utilizatorii se apropie de praguri de sancțiune.
- **Logare acțiuni**: Înregistrează acțiunile botului într-un canal de logare specificat.

## Tehnologii Utilizate

- **Node.js** și **Discord.js**: Pentru interacțiunea cu API-ul Discord.
- **bad-words**: Filtrare cuvinte ofensatoare.
- **dotenv**: Pentru gestionarea variabilelor de mediu.

## Instalare

1. Clonează acest repository:

   ```bash
   git clone https://github.com/username/mr-security-bot.git
   cd mr-security-bot
   ```

2. Instalează pachetele necesare:

   ```bash
   npm install
   ```

3. Creează un fișier `.env` în directorul rădăcină și adaugă următorul conținut:

   ```env
   DISCORD_TOKEN=your_bot_token
   ```

   Înlocuiește `your_bot_token` cu tokenul botului tău de pe [Discord Developer Portal](https://discord.com/developers/applications).

4. Înregistrează comenzile botului:

   Asigură-te că ai înlocuit `ID_APLICATIE` și `ID_GUILD` în codul din `index.js` cu ID-ul aplicației botului și ID-ul serverului tău Discord. Rulează scriptul pentru a înregistra comenzile:

   ```bash
   node index.js
   ```

## Utilizare

După instalare și configurare, rulează botul:

```bash
node index.js
```

Botul se va conecta la serverul tău Discord și va începe să monitorizeze mesajele și acțiunile conform regulilor configurate.

### Comenzi Disponibile

| Comandă                      | Descriere                                                                             |
|------------------------------|---------------------------------------------------------------------------------------|
| `/set-ban-threshold <numar>` | Setează numărul de banuri consecutive pentru a declanșa un ban permanent.              |
| `/set-kick-threshold <numar>`| Setează numărul de kick-uri consecutive pentru a declanșa un ban permanent.            |
| `/set-banned-words <cuvinte>`| Setează lista de cuvinte interzise, separate prin spațiu.                              |
| `/bypass-add @utilizator`    | Adaugă un utilizator la lista de bypass.                                               |
| `/bypass-remove @utilizator` | Elimină un utilizator de pe lista de bypass.                                           |


## Licență

Distribuit sub licența MIT. Vezi [LICENSE](LICENSE) pentru mai multe informații.
