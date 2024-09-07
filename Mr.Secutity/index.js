import { Client, GatewayIntentBits, PermissionsBitField, REST, Routes } from 'discord.js';
import { Filter } from 'bad-words';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildModeration, GatewayIntentBits.MessageContent] });

let settings = {
  banThreshold: 3,
  kickThreshold: 3,
  channelDeleteThreshold: 5,
  roleDeleteThreshold: 5,
  muteThreshold: 10,
  deafenThreshold: 10,
  bannedWords: ['defaultword1', 'defaultword2'],
  logChannelName: 'log-securitate',
  bypassUsers: []
};

const filter = new Filter();
let userActions = {};

const resetUserActions = (userId) => {
  userActions[userId] = {
    bans: 0,
    kicks: 0,
    channelDeletes: 0,
    roleDeletes: 0,
    mutes: 0,
    deafens: 0
  };
};

const logAction = (guild, message) => {
  const logChannel = guild.channels.cache.find(channel => channel.name === settings.logChannelName);
  if (logChannel) {
    logChannel.send(message);
  }
};

const alertAdmins = (guild, message) => {
  guild.members.cache.forEach(member => {
    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      member.send(message).catch(() => console.log(`Nu am putut trimite mesaj către ${member.user.tag}.`));
    }
  });
};

const isBypassed = (userId) => settings.bypassUsers.includes(userId);

const commands = [
  {
    name: 'set-ban-threshold',
    description: 'Setează pragul de banuri consecutive.',
    options: [{
      name: 'numar',
      type: 4,
      description: 'Numărul de banuri consecutive',
      required: true,
    }],
  },
  {
    name: 'set-kick-threshold',
    description: 'Setează pragul de kick-uri consecutive.',
    options: [{
      name: 'numar',
      type: 4,
      description: 'Numărul de kick-uri consecutive',
      required: true,
    }],
  },
  {
    name: 'set-banned-words',
    description: 'Setează lista de cuvinte interzise.',
    options: [{
      name: 'cuvinte',
      type: 3,
      description: 'Cuvinte interzise separate prin spațiu',
      required: true,
    }],
  },
  {
    name: 'bypass-add',
    description: 'Adaugă un utilizator la lista de bypass.',
    options: [{
      name: 'user',
      type: 6,
      description: 'Utilizator de adăugat',
      required: true,
    }],
  },
  {
    name: 'bypass-remove',
    description: 'Elimină un utilizator de pe lista de bypass.',
    options: [{
      name: 'user',
      type: 6,
      description: 'Utilizator de eliminat',
      required: true,
    }],
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Înregistrarea comenzilor...');
    await rest.put(
      Routes.applicationGuildCommands('ID_APLICATIE', 'ID_GUILD'),
      { body: commands },
    );
    console.log('Comenzi înregistrate cu succes.');
  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log('Botul de securitate este online!');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'set-ban-threshold') {
    const newThreshold = options.getInteger('numar');
    settings.banThreshold = newThreshold;
    await interaction.reply(`Pragul pentru banuri consecutive a fost setat la ${newThreshold}.`);
  }

  if (commandName === 'set-kick-threshold') {
    const newThreshold = options.getInteger('numar');
    settings.kickThreshold = newThreshold;
    await interaction.reply(`Pragul pentru kick-uri consecutive a fost setat la ${newThreshold}.`);
  }

  if (commandName === 'set-banned-words') {
    const newWords = options.getString('cuvinte').split(' ');
    settings.bannedWords = newWords;
    await interaction.reply(`Lista de cuvinte interzise a fost actualizată: ${newWords.join(', ')}.`);
  }

  if (commandName === 'bypass-add') {
    const userId = options.getUser('user').id;
    if (!settings.bypassUsers.includes(userId)) {
      settings.bypassUsers.push(userId);
      await interaction.reply(`Utilizatorul <@${userId}> a fost adăugat pe lista de bypass.`);
    } else {
      await interaction.reply('Utilizatorul este deja pe lista de bypass.');
    }
  }

  if (commandName === 'bypass-remove') {
    const userId = options.getUser('user').id;
    if (settings.bypassUsers.includes(userId)) {
      settings.bypassUsers = settings.bypassUsers.filter(id => id !== userId);
      await interaction.reply(`Utilizatorul <@${userId}> a fost eliminat de pe lista de bypass.`);
    } else {
      await interaction.reply('Utilizatorul nu este pe lista de bypass.');
    }
  }
});

client.on('messageCreate', (message) => {
  if (message.author.bot || isBypassed(message.author.id)) return;

  if (filter.isProfane(message.content)) {
    message.delete()
      .then(() => {
        message.channel.send(`Mesajul lui ${message.author} a fost șters deoarece conține cuvinte inadecvate.`);
        logAction(message.guild, `Mesajul de la ${message.author.tag} conținând cuvinte inadecvate a fost șters.`);
      })
      .catch(err => {
        console.error('Eroare la ștergerea mesajului:', err);
        message.channel.send(`Nu am putut șterge mesajul lui ${message.author}. Verifică permisiunile botului.`);
      });
  }
});

client.on('guildBanAdd', (ban) => {
  const userId = ban.user.id;
  if (isBypassed(userId)) return;

  if (!userActions[userId]) resetUserActions(userId);
  userActions[userId].bans += 1;
  
  if (userActions[userId].bans >= settings.banThreshold) {
    ban.guild.members.ban(userId, { reason: 'Acțiuni repetitive detectate.' });
    resetUserActions(userId);
    logAction(ban.guild, `Utilizatorul ${ban.user.tag} a fost banat permanent după ce a depășit pragul de banuri consecutive.`);
  } else if (userActions[userId].bans === settings.banThreshold - 1) {
    alertAdmins(ban.guild, `Avertizare: Utilizatorul ${ban.user.tag} se apropie de pragul de banuri consecutive.`);
  }
});

client.on('guildMemberRemove', (member) => {
  const userId = member.id;
  if (isBypassed(userId)) return;

  if (!userActions[userId]) resetUserActions(userId);
  userActions[userId].kicks += 1;

  if (userActions[userId].kicks >= settings.kickThreshold) {
    member.guild.members.kick(userId, { reason: 'Acțiuni repetitive detectate.' });
    resetUserActions(userId);
    logAction(member.guild, `Utilizatorul ${member.user.tag} a fost dat afară după ce a depășit pragul de kick-uri consecutive.`);
  } else if (userActions[userId].kicks === settings.kickThreshold - 1) {
    alertAdmins(member.guild, `Avertizare: Utilizatorul ${member.user.tag} se apropie de pragul de kick-uri consecutive.`);
  }
});

client.on('voiceStateUpdate', (oldState, newState) => {
  const userId = newState.id;
  if (isBypassed(userId)) return;

  if (!userActions[userId]) resetUserActions(userId);
  
  if (oldState.serverMute !== newState.serverMute && newState.serverMute) {
    userActions[userId].mutes += 1;
    if (userActions[userId].mutes >= settings.muteThreshold) {
      newState.guild.members.cache.get(userId).timeout(20 * 60 * 1000, 'Mute-uri repetate detectate.');
      resetUserActions(userId);
      logAction(newState.guild, `Utilizatorul ${newState.member.user.tag} a primit un timeout de 20 de minute după mute-uri repetate.`);
    } else if (userActions[userId].mutes === settings.muteThreshold - 1) {
      alertAdmins(newState.guild, `Avertizare: Utilizatorul ${newState.member.user.tag} se apropie de pragul de mute-uri consecutive.`);
    }
  }

  if (oldState.serverDeaf !== newState.serverDeaf && newState.serverDeaf) {
    userActions[userId].deafens += 1;
    if (userActions[userId].deafens >= settings.deafenThreshold) {
      newState.guild.members.cache.get(userId).timeout(30 * 60 * 1000, 'Deafen-uri repetate detectate.');
      resetUserActions(userId);
      logAction(newState.guild, `Utilizatorul ${newState.member.user.tag} a primit un timeout de 30 de minute după deafen-uri repetate.`);
    } else if (userActions[userId].deafens === settings.deafenThreshold - 1) {
      alertAdmins(newState.guild, `Avertizare: Utilizatorul ${newState.member.user.tag} se apropie de pragul de deafen-uri consecutive.`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
