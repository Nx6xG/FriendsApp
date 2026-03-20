import { useAppStore } from '@/stores/appStore'

const translations = {
  // ─── General ───
  'back': { de: 'Zurück', en: 'Back' },
  'cancel': { de: 'Abbrechen', en: 'Cancel' },
  'save': { de: 'Speichern', en: 'Save' },
  'delete': { de: 'Löschen', en: 'Delete' },
  'create': { de: 'Erstellen', en: 'Create' },
  'done': { de: 'Erledigt', en: 'Done' },
  'open': { de: 'Offen', en: 'Open' },
  'all': { de: 'Alle', en: 'All' },
  'more': { de: 'Mehr', en: 'More' },
  'close': { de: 'Schließen', en: 'Close' },

  // ─── Search ───
  'search.title': { de: 'Suche', en: 'Search' },
  'search.placeholder': { de: 'Suchen...', en: 'Search...' },
  'search.no_results': { de: 'Keine Ergebnisse', en: 'No results' },
  'search.todos': { de: 'Aufgaben', en: 'Tasks' },
  'search.expenses': { de: 'Ausgaben', en: 'Expenses' },
  'search.events': { de: 'Events', en: 'Events' },
  'search.places': { de: 'Orte', en: 'Places' },
  'search.chats': { de: 'Chat', en: 'Chat' },
  'search.suggestions': { de: 'Vorschläge', en: 'Suggestions' },
  'search.map_pins': { de: 'Karten-Pins', en: 'Map Pins' },

  // ─── Nav tabs ───
  'tab.feed': { de: 'Feed', en: 'Feed' },
  'tab.todos': { de: 'Aufgaben', en: 'Tasks' },
  'tab.expenses': { de: 'Kosten', en: 'Expenses' },
  'tab.chat': { de: 'Chat', en: 'Chat' },
  'tab.ideas': { de: 'Ideen', en: 'Ideas' },
  'tab.events': { de: 'Events', en: 'Events' },
  'tab.places': { de: 'Orte', en: 'Places' },
  'tab.stats': { de: 'Stats', en: 'Stats' },
  'tab.map': { de: 'Karte', en: 'Map' },
  'tab.more_features': { de: 'Weitere Features', en: 'More Features' },

  // ─── Home ───
  'home.greeting': { de: 'Hey', en: 'Hey' },
  'home.your_groups': { de: 'Deine Gruppen', en: 'Your Groups' },
  'home.no_groups': { de: 'Noch keine Gruppen', en: 'No groups yet' },
  'home.no_groups_sub': { de: 'Erstelle deine erste Gruppe und lade deine Freunde ein.', en: 'Create your first group and invite your friends.' },
  'home.new_group': { de: 'Neue Gruppe', en: 'New Group' },
  'home.members': { de: 'Mitglieder', en: 'Members' },
  'home.open_tasks': { de: 'offen', en: 'open' },

  // ─── New Group ───
  'newgroup.title': { de: 'Neue Gruppe', en: 'New Group' },
  'newgroup.name_placeholder': { de: 'Gruppenname', en: 'Group name' },
  'newgroup.members_placeholder': { de: 'Mitglieder (Komma getrennt)', en: 'Members (comma separated)' },

  // ─── Profile ───
  'profile.title': { de: 'Profil & Einstellungen', en: 'Profile & Settings' },
  'profile.change': { de: 'Ändern', en: 'Change' },
  'profile.set_status': { de: 'Status setzen...', en: 'Set status...' },
  'profile.choose_avatar': { de: 'Avatar wählen', en: 'Choose avatar' },
  'profile.status': { de: 'Status', en: 'Status' },
  'profile.groups_count': { de: 'Gruppen', en: 'Groups' },
  'profile.expenses_count': { de: 'Ausgaben', en: 'Expenses' },
  'profile.messages_count': { de: 'Nachrichten', en: 'Messages' },
  'profile.my_groups': { de: 'Meine Gruppen', en: 'My Groups' },
  'profile.hidden': { de: 'Ausgeblendet', en: 'Hidden' },

  // ─── Settings ───
  'settings.title': { de: 'Einstellungen', en: 'Settings' },
  'settings.notifications': { de: 'Benachrichtigungen', en: 'Notifications' },
  'settings.notifications_sub': { de: 'Push-Notifications für Events, Schulden, etc.', en: 'Push notifications for events, debts, etc.' },
  'settings.location': { de: 'Standort teilen', en: 'Share Location' },
  'settings.location_sub': { de: 'Freunden zeigen wo du bist', en: 'Show friends where you are' },
  'settings.dark_mode': { de: 'Dark Mode', en: 'Dark Mode' },
  'settings.language': { de: 'Sprache', en: 'Language' },
  'settings.other': { de: 'Sonstiges', en: 'Other' },
  'settings.privacy': { de: 'Datenschutz', en: 'Privacy' },
  'settings.privacy_sub': { de: 'Daten verschlüsselt in der EU gespeichert', en: 'Data encrypted and stored in EU' },
  'settings.about': { de: 'Über Friends', en: 'About Friends' },
  'settings.load_demo': { de: 'Demo laden', en: 'Load demo' },
  'settings.load_demo_sub': { de: 'App mit Beispieldaten füllen', en: 'Fill app with example data' },
  'settings.delete_all': { de: 'Alle Daten löschen', en: 'Delete all data' },
  'settings.delete_all_sub': { de: 'App komplett zurücksetzen', en: 'Reset app completely' },
  'settings.reset_confirm': { de: 'Zurücksetzen?', en: 'Reset?' },
  'settings.reset_confirm_sub': { de: 'Alle Daten werden gelöscht und du startest von vorne.', en: 'All data will be deleted and you start from scratch.' },
  'settings.reset_btn': { de: 'Zurücksetzen', en: 'Reset' },

  // ─── Notifications ───
  'notif.title': { de: 'Benachrichtigungen', en: 'Notifications' },
  'notif.unread': { de: 'ungelesen', en: 'unread' },
  'notif.mark_all': { de: 'Alle lesen', en: 'Mark all read' },
  'notif.empty': { de: 'Keine Benachrichtigungen', en: 'No notifications' },

  // ─── Onboarding ───
  'onboard.welcome': { de: 'Willkommen bei Friends', en: 'Welcome to Friends' },
  'onboard.welcome_sub': { de: 'Die App für deine Crew.', en: 'The app for your crew.' },
  'onboard.groups': { de: 'Gruppen erstellen', en: 'Create Groups' },
  'onboard.groups_sub': { de: 'Lege Gruppen an und lade deine Freunde ein.', en: 'Create groups and invite your friends.' },
  'onboard.features': { de: 'Alles an einem Ort', en: 'All in one place' },
  'onboard.features_sub': { de: 'Aufgaben, Kosten, Abstimmungen & Chat.', en: 'Tasks, expenses, polls & chat.' },
  'onboard.next': { de: 'Weiter', en: 'Next' },
  'onboard.name_title': { de: 'Wie heißt du?', en: 'What\'s your name?' },
  'onboard.name_placeholder': { de: 'Dein Name', en: 'Your name' },
  'onboard.start': { de: 'Los geht\'s', en: 'Let\'s go' },
  'onboard.demo': { de: 'Demo-Modus starten', en: 'Start demo mode' },

  // ─── Todos ───
  'todos.new': { de: 'Neue Aufgabe...', en: 'New task...' },
  'todos.who': { de: 'Wer?', en: 'Who?' },
  'todos.all_done': { de: 'Alles erledigt 🎉', en: 'All done 🎉' },

  // ─── Ideas ───
  'ideas.voting': { de: 'Voting', en: 'Voting' },
  'ideas.bucket': { de: 'Bucket List', en: 'Bucket List' },
  'ideas.new_suggestion': { de: 'Neuer Vorschlag...', en: 'New suggestion...' },
  'ideas.new_bucket': { de: 'Was wollt ihr mal machen...', en: 'What do you want to do...' },
  'ideas.suggestions': { de: 'Vorschläge', en: 'Suggestions' },
  'ideas.empty': { de: 'Noch keine Vorschläge — sei der Erste! 💡', en: 'No suggestions yet — be the first! 💡' },
  'ideas.bucket_empty': { de: 'Keine offenen Einträge — füg was hinzu! ✨', en: 'No open entries — add something! ✨' },

  // ─── Chat ───
  'chat.placeholder': { de: 'Nachricht...', en: 'Message...' },
  'chat.start': { de: 'Starte die Konversation! 💬', en: 'Start the conversation! 💬' },

  // ─── Group Settings ───
  'gsettings.group': { de: 'Gruppe', en: 'Group' },
  'gsettings.tags': { de: 'Aufgaben-Tags', en: 'Task Tags' },
  'gsettings.tags_sub': { de: 'Tags können Aufgaben zugewiesen werden um sie zu kategorisieren.', en: 'Tags can be assigned to tasks to categorize them.' },
  'gsettings.no_tags': { de: 'Noch keine Tags erstellt', en: 'No tags created yet' },
  'gsettings.new_tag': { de: 'Neuen Tag erstellen...', en: 'Create new tag...' },
  'gsettings.members': { de: 'Mitglieder & Rollen', en: 'Members & Roles' },
  'gsettings.my_settings': { de: 'Meine Einstellungen', en: 'My Settings' },
  'gsettings.my_settings_sub': { de: 'Gilt nur für dich in dieser Gruppe.', en: 'Only applies to you in this group.' },
  'gsettings.nav_tabs': { de: 'Navigation (max. 4 Tabs)', en: 'Navigation (max. 4 tabs)' },
  'gsettings.start_tab': { de: 'Start-Tab beim Öffnen', en: 'Start tab on open' },
  'gsettings.danger': { de: 'Gefahrenzone', en: 'Danger Zone' },
  'gsettings.delete_group': { de: 'Gruppe löschen', en: 'Delete Group' },
  'gsettings.delete_group_sub': { de: 'Alle Daten dieser Gruppe werden gelöscht', en: 'All data in this group will be deleted' },
} as const

type TranslationKey = keyof typeof translations

export function useT() {
  const lang = useAppStore((s) => s.profile.language)
  return (key: TranslationKey) => translations[key]?.[lang] ?? translations[key]?.de ?? key
}
