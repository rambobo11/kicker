# Kicker, état des lieux

Une seule prochaine action. Les idées atterrissent, les grosses tâches se découpent, les routines ne crient pas en même temps.

Relevé du code sur cette machine, 16 octobre 2026.

Le site en ligne est en retard. https://kicker-rosy.vercel.app est au commit `3fbb502` : Start, découpage, mode sombre, barre latérale simple, région Paris. Tout ce qui suit et qui n’est pas dans cette phrase est seulement en local, pas encore poussé.

Pour travailler : `npm run dev`, puis http://localhost:3000. Si ce port est déjà pris, le serveur passe au suivant. Le mot de passe est `APP_PASSWORD` dans `.env.local`. Ne pas le commiter.

## Comment t’en servir

1. Ouvre Start. En haut : **Tout**, **Pro** ou **Perso**. Le mot choisi est noir, les autres gris. Le choix reste si tu changes de page.
2. Kicker montre une seule tâche. **C’est fait** la termine. **Pas celle-là** la saute pour cette visite seulement. **Pas aujourd’hui** la sort jusqu’à demain 4 h, heure de Paris.
3. Si la tâche est grosse, **Découper** en fait 2 ou 3 micros. Le parent quitte Start tant qu’un micro reste ouvert.
4. Les idées qui ne sont pas la prochaine action vont dans Brain dump. Moins de cinq minutes : Quick wins.
5. Les routines vivent dans leur écran. Start n’en montre une que s’il ne reste aucun micro dans le contexte choisi.

## Les quatre écrans

| Écran | Rôle | Gestes |
| --- | --- | --- |
| Start | Une seule prochaine action | C’est fait, Pas celle-là, Pas aujourd’hui, Découper |
| Brain dump | Tout ce qui traverse l’esprit, y compris ce qui est reporté à demain | Ajouter, cocher, Découper. En bas, Faites : corriger le titre, la catégorie, ou Remettre |
| Quick wins | Moins de cinq minutes | Ajouter déjà marqué micro, cocher |
| Routines | Entretien sans date limite | Intervalle, jauge, C’est fait |

Catégories : Engie, ESGI, BBX, Basket, Base Camp, Home, Other. Le formulaire ouvre sur Base Camp.

| Contexte | Ce que Start garde |
| --- | --- |
| Tout | Toutes les catégories |
| Pro | Engie, ESGI |
| Perso | BBX, Basket, Base Camp |

Home et Other n’entrent ni dans Pro ni dans Perso. Ils n’apparaissent que dans Tout. Un micro d’un autre contexte ne bloque pas la routine de celui que tu regardes.

## Deux dispositions

La largeur de la fenêtre décide, pas le nom de l’appareil.

### iPhone, sous 1024 px

Une colonne. Barre du bas : Start, Brain, Wins, Routines. Le titre d’une tâche la termine. Découper reste sous la ligne. Sombre et cadenas en haut. Pas de raccourcis clavier.

### Mac, à partir de 1024 px

Barre de 252 px à gauche : Start, Brain dump, Quick wins, Routines. Icône colorée, pastille sur la page ouverte. Sombre et cadenas en bas de cette barre.

Au milieu, la liste. À droite, le détail. Un clic de ligne sélectionne. La case termine. Découper et C’est fait sont dans le détail.

Raccourcis, seulement sur Start, et seulement si aucun champ texte n’a le focus :

| Touche | Action |
| --- | --- |
| Espace | C’est fait |
| Flèche droite ou S | Pas celle-là |
| D | Ouvre Découper et place le curseur dans le premier champ |

## Règles de la file

Micros incomplets, plus anciens d’abord. Puis les autres tâches, plus anciennes d’abord.

| Geste | Effet |
| --- | --- |
| Pas celle-là | Saut pour cette visite. Recharger la page ramène la première. Si tout a été passé : Reprendre la première. |
| Pas aujourd’hui | `snoozed_until` = demain 4 h, heure de Paris. Start l’ignore tant que cette heure est dans le futur. Brain dump la montre toujours. |
| Découper | 2 ou 3 micros, même catégorie, `parent_id` vers le parent. Le parent sort de Start tant qu’un micro n’est pas fait, même si ce micro est reporté à demain. |
| Dernier micro fait | Le parent est terminé tout seul. Une note dit « Les petits pas sont faits. … est terminé. » Annuler le rouvre. Les micros restent faits. |

S’il n’en reste qu’une, l’écran le dit. Terminer retire la tâche de Start. Elle reste en bas du brain dump, sous Faites, pour corriger le titre, la catégorie, ou la remettre dans la file.

## Routines

Urgence = jours écoulés depuis la dernière fois, divisés par l’intervalle. Intervalles : 1, 3, 7, 14, 30 jours. Jamais faite compte comme en retard. Pas de série.

| Urgence | Pastille | Jauge |
| --- | --- | --- |
| Moins de 0,7 | Large | Verte |
| De 0,7 à 1 | Bientôt | Orange |
| 1 ou plus, ou jamais faite | En retard ou À faire | Rouge |

| Situation dans le contexte choisi | Start montre |
| --- | --- |
| Au moins un micro incomplet | Le micro. Aucune routine. |
| Aucune micro, une tâche grosse, une routine en retard | La tâche, puis Et aussi en plus discret. |
| Plus aucune tâche, une routine en retard | La routine, seule. |
| Plusieurs routines en retard | La plus urgente seulement. |

## Ce qui n’est pas dans l’app

| Sujet | État |
| --- | --- |
| Passkey Mac et iPhone | Discuté, pas construit. Le mot de passe resterait le repli. |
| Mode voyage | Reporté. |
| Checklist nutrition | Reportée. |
| Journal de ce qui est fini | Pas de logbook. Les tâches faites sont en bas du brain dump, pour les corriger ou les remettre. |
| Listes par catégorie | La catégorie colore la ligne. Seuls Tout, Pro et Perso filtrent, et seulement sur Start. |
| Compteurs dans la barre | Absents. |
| Plusieurs personnes | Un mot de passe, pas de compte. |
| Séries | Refusées. |

## Sous le capot

Next.js, Supabase, cookie de session signé. Cinq mauvais mots de passe bloquent quinze minutes. Les pages ouvertes se calculent à Paris. Le mode sombre et le contexte se souviennent dans le navigateur.
