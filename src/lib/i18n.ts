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
  'todos.assigned_to': { de: 'Zugewiesen an', en: 'Assigned to' },
  'todos.priority': { de: 'Priorität', en: 'Priority' },
  'todos.priority_low': { de: 'Niedrig', en: 'Low' },
  'todos.priority_medium': { de: 'Mittel', en: 'Medium' },
  'todos.priority_high': { de: 'Hoch', en: 'High' },
  'todos.due_date': { de: 'Fällig am', en: 'Due date' },
  'todos.due_placeholder': { de: 'tt.mm.jjjj', en: 'dd.mm.yyyy' },
  'todos.tags': { de: 'Tags', en: 'Tags' },
  'todos.linked': { de: 'Verknüpfungen', en: 'Linked items' },
  'todos.description': { de: 'Beschreibung', en: 'Description' },
  'todos.desc_placeholder': { de: 'Details, Notizen...', en: 'Details, notes...' },
  'todos.add_desc': { de: 'Beschreibung hinzufügen...', en: 'Add description...' },
  'todos.comments': { de: 'Kommentare', en: 'Comments' },
  'todos.comment_placeholder': { de: 'Kommentar schreiben...', en: 'Write a comment...' },
  'todos.reopen': { de: 'Wieder öffnen', en: 'Reopen' },
  'todos.mark_done': { de: 'Erledigt ✓', en: 'Done ✓' },

  // ─── Expenses ───
  'expenses.total': { de: 'Gesamtausgaben', en: 'Total expenses' },
  'expenses.open_debts': { de: 'Offene Schulden', en: 'Open debts' },
  'expenses.mark_paid': { de: 'Als bezahlt markieren', en: 'Mark as paid' },
  'expenses.all_settled': { de: 'Alles ausgeglichen ✓', en: 'All settled ✓' },
  'expenses.payments': { de: 'Zahlungen', en: 'Payments' },
  'expenses.list_title': { de: 'Ausgaben', en: 'Expenses' },
  'expenses.what_for': { de: 'Wofür?', en: 'What for?' },
  'expenses.amount': { de: 'Betrag (€)', en: 'Amount (€)' },
  'expenses.split_between': { de: 'Aufteilen zwischen:', en: 'Split between:' },
  'expenses.custom_split': { de: 'Individuell', en: 'Custom' },
  'expenses.equal_split': { de: 'Gleichmäßig', en: 'Equal' },
  'expenses.fits': { de: 'Passt ✓', en: 'Matches ✓' },
  'expenses.difference': { de: 'Differenz:', en: 'Difference:' },
  'expenses.category': { de: 'Kategorie:', en: 'Category:' },
  'expenses.recurring': { de: 'Wiederkehrend:', en: 'Recurring:' },
  'expenses.once': { de: 'Einmalig', en: 'One-time' },
  'expenses.weekly': { de: 'Wöchentlich', en: 'Weekly' },
  'expenses.monthly': { de: 'Monatlich', en: 'Monthly' },
  'expenses.add': { de: 'Hinzufügen', en: 'Add' },
  'expenses.empty': { de: 'Noch keine Ausgaben', en: 'No expenses yet' },
  'expenses.persons': { de: 'Pers.', en: 'ppl.' },
  'expenses.cat_food': { de: 'Essen', en: 'Food' },
  'expenses.cat_transport': { de: 'Transport', en: 'Transport' },
  'expenses.cat_entertainment': { de: 'Freizeit', en: 'Entertainment' },
  'expenses.cat_shopping': { de: 'Einkauf', en: 'Shopping' },
  'expenses.cat_housing': { de: 'Wohnen', en: 'Housing' },
  'expenses.cat_travel': { de: 'Reisen', en: 'Travel' },
  'expenses.cat_other': { de: 'Sonstiges', en: 'Other' },

  // ─── Events ───
  'events.upcoming': { de: 'Anstehend', en: 'Upcoming' },
  'events.past': { de: 'Vergangen', en: 'Past' },
  'events.empty': { de: 'Noch keine Events geplant 📅', en: 'No events planned 📅' },
  'events.none_today': { de: 'Keine Events an diesem Tag', en: 'No events on this day' },
  'events.name': { de: 'Event Name', en: 'Event name' },
  'events.location': { de: '📍 Ort (optional)', en: '📍 Location (optional)' },
  'events.desc': { de: 'Beschreibung (optional)', en: 'Description (optional)' },
  'events.repeat': { de: 'Wiederholen:', en: 'Repeat:' },
  'events.create': { de: 'Event erstellen', en: 'Create event' },
  'events.attending': { de: 'Dabei', en: 'Going' },
  'events.rsvp': { de: 'Zusagen', en: 'RSVP' },
  'events.today': { de: 'Heute', en: 'Today' },
  'events.tomorrow': { de: 'Morgen', en: 'Tomorrow' },
  'events.biweekly': { de: 'Alle 2 W.', en: 'Bi-weekly' },

  // ─── Places ───
  'places.name': { de: 'Name des Ortes', en: 'Place name' },
  'places.address': { de: '📍 Adresse (optional)', en: '📍 Address (optional)' },
  'places.add': { de: 'Ort hinzufügen', en: 'Add place' },
  'places.empty': { de: 'Noch keine Orte hinzugefügt 📍', en: 'No places added yet 📍' },
  'places.added_by': { de: 'Hinzugefügt von', en: 'Added by' },
  'places.visited_at': { de: 'Besucht am', en: 'Visited on' },
  'places.your_rating': { de: 'Deine Bewertung:', en: 'Your rating:' },
  'places.comment': { de: 'Kommentar (optional)', en: 'Comment (optional)' },
  'places.rate': { de: 'Bewerten', en: 'Rate' },
  'places.update_rating': { de: 'Aktualisieren', en: 'Update' },
  'places.change_rating': { de: 'Bewertung ändern', en: 'Change rating' },
  'places.add_rating': { de: '+ Bewertung abgeben', en: '+ Add rating' },
  'places.sort_newest': { de: 'Neueste', en: 'Newest' },
  'places.sort_best': { de: 'Beste', en: 'Best' },
  'places.sort_worst': { de: 'Schlechteste', en: 'Worst' },
  'places.sort_alpha': { de: 'Name A-Z', en: 'Name A-Z' },

  // ─── Ideas ───
  'ideas.voting': { de: 'Voting', en: 'Voting' },
  'ideas.bucket': { de: 'Bucket List', en: 'Bucket List' },
  'ideas.new_suggestion': { de: 'Neuer Vorschlag...', en: 'New suggestion...' },
  'ideas.new_bucket': { de: 'Was wollt ihr mal machen...', en: 'What do you want to do...' },
  'ideas.suggestions': { de: 'Vorschläge', en: 'Suggestions' },
  'ideas.empty': { de: 'Noch keine Vorschläge — sei der Erste!', en: 'No suggestions yet — be the first!' },
  'ideas.bucket_empty': { de: 'Keine offenen Einträge — füg was hinzu!', en: 'No open entries — add something!' },

  // ─── Map ───
  'map.share_on': { de: 'Standort wird geteilt', en: 'Sharing location' },
  'map.share_off': { de: 'Standort teilen', en: 'Share location' },
  'map.who_where': { de: 'Wo ist wer?', en: 'Who is where?' },
  'map.on_the_way': { de: 'Unterwegs', en: 'On the way' },
  'map.add_place': { de: 'Neuen Ort hinzufügen', en: 'Add new place' },
  'map.place_name': { de: 'Ortsname', en: 'Place name' },
  'map.latitude': { de: 'Breitengrad', en: 'Latitude' },
  'map.longitude': { de: 'Längengrad', en: 'Longitude' },
  'map.set_pin': { de: 'Pin setzen', en: 'Set pin' },
  'map.empty': { de: 'Noch keine Pins — füge euren ersten Ort hinzu!', en: 'No pins yet — add your first place!' },
  'map.visited': { de: 'Besucht', en: 'Visited' },
  'map.wishlist': { de: 'Wunschliste', en: 'Wishlist' },
  'map.filter_all': { de: 'Alle', en: 'All' },
  'map.filter_visited': { de: 'Besucht', en: 'Visited' },
  'map.filter_wish': { de: 'Wunsch', en: 'Wish' },

  // ─── Stats ───
  'stats.overview': { de: 'Übersicht', en: 'Overview' },
  'stats.tasks_done': { de: 'Aufgaben erledigt', en: 'Tasks completed' },
  'stats.top_spender': { de: 'Wer zahlt am meisten', en: 'Top spender' },
  'stats.group_roles': { de: 'Gruppen-Rollen', en: 'Group roles' },
  'stats.chat_activity': { de: 'Chat-Aktivität', en: 'Chat activity' },
  'stats.top_places': { de: 'Top Orte', en: 'Top places' },

  // ─── Chat embeds ───
  'chat.poll': { de: 'Abstimmung', en: 'Poll' },
  'chat.event_invite': { de: 'Event-Einladung', en: 'Event invite' },
  'chat.task': { de: 'Aufgabe', en: 'Task' },
  'chat.linked': { de: 'Verknüpft', en: 'Linked' },
  'chat.create_poll': { de: 'Abstimmung erstellen', en: 'Create poll' },
  'chat.poll_question': { de: 'Frage...', en: 'Question...' },
  'chat.add_option': { de: '+ Option', en: '+ Option' },
  'chat.send': { de: 'Senden', en: 'Send' },
  'chat.share_event': { de: 'Event teilen', en: 'Share event' },
  'chat.assign_task': { de: 'Aufgabe zuweisen', en: 'Assign task' },
  'chat.task_placeholder': { de: 'Aufgabe...', en: 'Task...' },
  'chat.assign_to': { de: 'Zuweisen an...', en: 'Assign to...' },
  'chat.link': { de: 'Link', en: 'Link' },
  'chat.placeholder': { de: 'Nachricht', en: 'Message' },
  'chat.start': { de: 'Starte die Konversation!', en: 'Start the conversation!' },

  // ─── Feed ───
  'feed.timeline': { de: 'Timeline', en: 'Timeline' },
  'feed.empty': { de: 'Noch keine Aktivitäten', en: 'No activities yet' },
  'feed.load_more': { de: 'Mehr laden', en: 'Load more' },

  // ─── General (new) ───
  'new': { de: 'Neu', en: 'New' },
  'add': { de: 'Hinzufügen', en: 'Add' },
  'send': { de: 'Senden', en: 'Send' },
  'loading': { de: 'Laden', en: 'Load' },
  'later': { de: 'Später', en: 'Later' },
  'upgrade': { de: 'Upgrade', en: 'Upgrade' },
  'manage': { de: 'Verwalten', en: 'Manage' },
  'join': { de: 'Beitreten', en: 'Join' },
  'subject': { de: 'Betreff', en: 'Subject' },
  'emoji_custom': { de: 'Eigenes Emoji eingeben', en: 'Type custom emoji' },

  // ─── Auth (additional) ───
  'auth.check_email': { de: 'Schau in dein Postfach und klicke den Link um deinen Account zu aktivieren.', en: 'Check your inbox and click the link to activate your account.' },
  'auth.back_to_login': { de: 'Zum Login →', en: 'Back to login →' },

  // ─── Notifications (text) ───
  'notif.new_task': { de: 'Neue Aufgabe', en: 'New task' },
  'notif.task_assigned': { de: 'Aufgabe für dich', en: 'Task for you' },
  'notif.task_assigned_body': { de: 'wurde dir zugewiesen', en: 'was assigned to you' },
  'notif.new_expense': { de: 'Neue Ausgabe', en: 'New expense' },
  'notif.expense_body': { de: 'hat hinzugefügt', en: 'added' },
  'notif.event_reminder': { de: 'In 1 Stunde', en: 'In 1 hour' },

  // ─── Profile (additional) ───
  'profile.pending_invites': { de: 'Ausstehende Einladungen', en: 'Pending invitations' },
  'profile.pro_active': { de: 'Alle Features freigeschaltet', en: 'All features unlocked' },
  'profile.pro_cancelled': { de: 'Gekündigt — aktiv bis', en: 'Cancelled — active until' },
  'profile.try_free': { de: '3 Tage kostenlos testen', en: '3-day free trial' },
  'profile.start_trial': { de: 'Gratis testen', en: 'Start free trial' },
  'profile.support': { de: 'Support & Feedback', en: 'Support & Feedback' },
  'profile.support_sub': { de: 'Hilfe, Feedback oder Probleme melden', en: 'Help, feedback or report issues' },
  'profile.donate': { de: 'Unterstütze uns', en: 'Support us' },
  'profile.donate_sub': { de: 'Hilf mit, die App weiterzuentwickeln', en: 'Help us keep building the app' },
  'profile.logout': { de: 'Ausloggen', en: 'Log out' },
  'profile.logout_sub': { de: 'Von diesem Gerät abmelden', en: 'Sign out from this device' },
  'profile.demo_confirm': { de: 'Demo-Gruppen werden hinzugefügt. Deine bestehenden Gruppen bleiben erhalten.', en: 'Demo groups will be added. Your existing groups are kept.' },
  'profile.feedback_thanks': { de: 'Danke für dein Feedback!', en: 'Thanks for your feedback!' },
  'profile.feedback_follow': { de: 'Wir melden uns so schnell wie möglich.', en: 'We\'ll get back to you as soon as possible.' },
  'profile.describe': { de: 'Beschreibe dein Anliegen...', en: 'Describe your issue...' },

  // ─── Paywall ───
  'paywall.you_are_pro': { de: 'Du bist Pro!', en: 'You\'re Pro!' },
  'paywall.thanks': { de: 'Danke für deinen Support!', en: 'Thanks for your support!' },
  'paywall.your_features': { de: 'Deine Pro-Features', en: 'Your Pro features' },
  'paywall.manage_sub': { de: 'Abo verwalten', en: 'Manage subscription' },
  'paywall.upgrade_title': { de: 'Upgrade auf Pro', en: 'Upgrade to Pro' },
  'paywall.upgrade_desc': { de: 'Schalte alle Features frei und nutze Friends ohne Limits.', en: 'Unlock all features and use Friends without limits.' },
  'paywall.monthly': { de: 'Monatlich', en: 'Monthly' },
  'paywall.yearly': { de: 'Jährlich', en: 'Yearly' },
  'paywall.per_month': { de: '/Monat', en: '/month' },
  'paywall.per_year': { de: '/Jahr', en: '/year' },
  'paywall.days_free': { de: 'Tage gratis', en: 'days free' },
  'paywall.what_you_get': { de: 'Was du bekommst', en: 'What you get' },
  'paywall.start_trial': { de: 'Kostenlos testen', en: 'Start free trial' },
  'paywall.upgrade_now': { de: 'Jetzt upgraden', en: 'Upgrade now' },
  'paywall.yearly_terms': { de: '3 Tage kostenlos, dann €24,99/Jahr. Jederzeit kündbar.', en: '3-day free trial, then €24.99/year. Cancel anytime.' },
  'paywall.monthly_terms': { de: 'Jederzeit kündbar. Sichere Zahlung über Lemonsqueezy.', en: 'Cancel anytime. Secure payment via Lemonsqueezy.' },
  'paywall.feat_groups': { de: 'Unlimitierte Gruppen & Mitglieder', en: 'Unlimited groups & members' },
  'paywall.feat_gps': { de: 'GPS Live-Standort', en: 'GPS live location' },
  'paywall.feat_split': { de: 'Individueller Kosten-Split', en: 'Custom expense split' },
  'paywall.feat_recurring': { de: 'Wiederkehrende Ausgaben & Events', en: 'Recurring expenses & events' },
  'paywall.feat_calendar': { de: 'Kalender-Export', en: 'Calendar export' },
  'paywall.feat_bucket': { de: 'Bucket List', en: 'Bucket List' },
  'paywall.feat_pins': { de: 'Unbegrenzte Karten-Pins', en: 'Unlimited map pins' },

  // ─── Pro Gate ───
  'pro.gate_message': { de: 'ist ein Pro-Feature. Upgrade um alle Funktionen freizuschalten.', en: 'is a Pro feature. Upgrade to unlock all features.' },

  // ─── Group share ───
  'gsettings.share_text': { de: 'Tritt unserer Gruppe bei!', en: 'Join our group!' },
  'gsettings.invite': { de: 'Mitglieder einladen', en: 'Invite members' },
  'gsettings.delete_confirm': { de: 'Alle Aufgaben, Ausgaben, Nachrichten und Events werden unwiderruflich gelöscht.', en: 'All tasks, expenses, messages and events will be permanently deleted.' },
  'gsettings.color': { de: 'Farbe:', en: 'Color:' },
  'gsettings.location_on': { de: 'Dein Standort ist für Mitglieder sichtbar', en: 'Your location is visible to members' },
  'gsettings.location_off': { de: 'Standort mit dieser Gruppe teilen', en: 'Share location with this group' },

  // ─── New Group ───
  'newgroup.create': { de: 'Erstellen', en: 'Create' },

  // ─── Linked items ───
  'linked.task': { de: 'Aufgabe', en: 'Task' },
  'linked.tasks': { de: 'Aufgaben', en: 'Tasks' },

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

  // ─── Chat (additional) ───
  'chat.votes': { de: 'Stimme', en: 'vote' },
  'chat.votes_plural': { de: 'Stimmen', en: 'votes' },
  'chat.who_is_coming': { de: 'Wer kommt mit?', en: 'Who is coming?' },

  // ─── Auth ───
  'auth.wrong_credentials': { de: 'Email oder Passwort falsch', en: 'Wrong email or password' },
  'auth.password_min': { de: 'Passwort muss mind. 6 Zeichen haben', en: 'Password must be at least 6 characters' },
  'auth.tagline': { de: 'Die App für deine Crew', en: 'The app for your crew' },
  'auth.confirm_sent': { de: 'Bestätigungs-Email gesendet!', en: 'Confirmation email sent!' },
  'auth.login': { de: 'Einloggen', en: 'Log in' },
  'auth.signup': { de: 'Registrieren', en: 'Sign up' },
  'auth.email': { de: 'Email', en: 'Email' },
  'auth.password': { de: 'Passwort', en: 'Password' },
  'auth.name': { de: 'Dein Name', en: 'Your name' },
  'auth.no_account': { de: 'Noch kein Konto?', en: 'No account yet?' },
  'auth.has_account': { de: 'Schon ein Konto?', en: 'Already have an account?' },

  // ─── Notifications ───
  'notif.mark_all_read': { de: 'Alle lesen', en: 'Mark all read' },

  // ─── Events (additional) ───
  'events.oclock': { de: 'Uhr', en: '' },
  'events.month_0': { de: 'Januar', en: 'January' },
  'events.month_1': { de: 'Februar', en: 'February' },
  'events.month_2': { de: 'März', en: 'March' },
  'events.month_3': { de: 'April', en: 'April' },
  'events.month_4': { de: 'Mai', en: 'May' },
  'events.month_5': { de: 'Juni', en: 'June' },
  'events.month_6': { de: 'Juli', en: 'July' },
  'events.month_7': { de: 'August', en: 'August' },
  'events.month_8': { de: 'September', en: 'September' },
  'events.month_9': { de: 'Oktober', en: 'October' },
  'events.month_10': { de: 'November', en: 'November' },
  'events.month_11': { de: 'Dezember', en: 'December' },
  'events.day_0': { de: 'Mo', en: 'Mo' },
  'events.day_1': { de: 'Di', en: 'Tu' },
  'events.day_2': { de: 'Mi', en: 'We' },
  'events.day_3': { de: 'Do', en: 'Th' },
  'events.day_4': { de: 'Fr', en: 'Fr' },
  'events.day_5': { de: 'Sa', en: 'Sa' },
  'events.day_6': { de: 'So', en: 'Su' },
  'events.weekly_short': { de: 'Wöchentl.', en: 'Weekly' },
  'events.biweekly_short': { de: 'Alle 2 W.', en: 'Bi-weekly' },
  'events.monthly_short': { de: 'Monatl.', en: 'Monthly' },

  // ─── Places (additional) ───
  'places.cat_restaurant': { de: 'Restaurant', en: 'Restaurant' },
  'places.cat_cafe': { de: 'Café', en: 'Café' },
  'places.cat_bar': { de: 'Bar', en: 'Bar' },
  'places.cat_activity': { de: 'Aktivität', en: 'Activity' },
  'places.cat_shopping': { de: 'Einkauf', en: 'Shopping' },
  'places.cat_other': { de: 'Sonstiges', en: 'Other' },

  // ─── Roles ───
  'role.admin': { de: 'Admin', en: 'Admin' },
  'role.member': { de: 'Mitglied', en: 'Member' },
  'role.viewer': { de: 'Zuschauer', en: 'Viewer' },

  // ─── Referral ───
  'referral.title': { de: 'Freunde einladen', en: 'Invite friends' },
  'referral.description': { de: 'Teile deinen Link und erhalte 1 Monat Pro gratis!', en: 'Share your link and get 1 month of Pro for free!' },
  'referral.share': { de: 'Link teilen', en: 'Share link' },
  'referral.copied': { de: 'Link kopiert!', en: 'Link copied!' },
  'referral.welcome': { de: 'hat dich eingeladen', en: 'invited you' },
  'referral.signup_cta': { de: 'Jetzt registrieren', en: 'Sign up now' },
  'referral.invalid': { de: 'Ungültiger Einladungslink', en: 'Invalid referral link' },

  'events.all_day': { de: 'Ganztägig', en: 'All day' },

  // ─── Birthday ───
  'profile.birthday': { de: 'Geburtstag', en: 'Birthday' },
  'profile.birthday_placeholder': { de: 'TT.MM.', en: 'DD.MM.' },
  'profile.birthday_set': { de: 'Geburtstag setzen', en: 'Set birthday' },
  'gsettings.show_birthdays': { de: 'Geburtstage anzeigen', en: 'Show birthdays' },
  'gsettings.show_birthdays_sub': { de: 'Geburtstage der Mitglieder im Kalender anzeigen', en: 'Show member birthdays in calendar' },

  // ─── Error ───
  'error.title': { de: 'Etwas ist schiefgelaufen', en: 'Something went wrong' },
  'error.body': { de: 'Die App hat einen unerwarteten Fehler festgestellt.', en: 'The app encountered an unexpected error.' },
  'error.reload': { de: 'Neu laden', en: 'Reload' },
} as const

type TranslationKey = keyof typeof translations

export function useT() {
  const lang = useAppStore((s) => s.profile.language)
  return (key: TranslationKey | (string & {})) => {
    const entry = translations[key as TranslationKey]
    return entry?.[lang] ?? entry?.de ?? key
  }
}

/** Non-hook version for use outside React components (class components, constants) */
export function getT(key: TranslationKey | (string & {})): string {
  const lang = useAppStore.getState().profile.language
  const entry = translations[key as TranslationKey]
  return entry?.[lang] ?? entry?.de ?? key
}
