# J'apprends à lire

Jeux pour apprendre à lire en français (enfants de 4 à 7 ans) : lettres, sons, syllabes et mots.
App web installable sur téléphone (icône sur l'écran d'accueil, plein écran, fonctionne sans internet).

**Adresse :** https://befret-project.github.io/apprendre-a-lire/

## Installer sur un téléphone

- **iPhone / iPad** : ouvrir l'adresse dans **Safari** → bouton Partager → « Sur l'écran d'accueil ».
- **Android** : ouvrir l'adresse dans **Chrome** → menu ⋮ → « Installer l'application ».

## Les jeux (du plus facile au plus difficile)

| Jeu | Ce que l'enfant fait |
|---|---|
| Les lettres | touche une lettre, entend son son et un mot (« mou… mouton ») |
| La pêche | attrape les bulles qui portent la bonne lettre |
| J'entends ? | dit 👍 / 👎 : « Est-ce que tu entends *ou* dans *loup* ? » |
| Je colle | consonne + voyelle = syllabe (m + a = ma) |
| Écoute et trouve | entend une syllabe et la retrouve parmi 3 |
| Le train | remplit les wagons avec les syllabes dans l'ordre (to·ma·te) |
| Lis le mot | lit le mot qui va avec l'image |

Profils : un par enfant (prénom + animal, étoiles séparées), gardés **uniquement sur l'appareil** (`localStorage`).

## Voix

- **Automatique** : voix du navigateur sur ordinateur (naturelle), **voix enregistrée** (`sons.js`) sur iPhone/iPad,
  car la voix intégrée de l'iPhone prononce mal les sons isolés. Réglable dans « Pour les parents ».
- Les sons enregistrés sont générés avec [Piper](https://github.com/rhasspy/piper) (voix `fr-siwis-medium`).

### Pourquoi les sons sont générés « avec un porteur »

Cette voix déforme la **dernière** voyelle prononcée (« o » trop ouvert → sonne anglais, « i » → « è »).
`gen2.py` fait dire chaque son suivi de « ta » (« mo ta »), coupe avant le « t », et ne garde un son que s'il passe
2 contrôles : transcription phonétique exacte (eSpeak) et 1er formant de la voyelle dans la plage du français (`formants.py`).

### Régénérer des sons

```sh
cd outils/sons
./telecharger-voix.sh                # une seule fois (Linux x86_64)
python3 gen.py                       # tous les sons, version simple -> ../../sons.js
# puis, pour les sons qui finissent par une voyelle : écrire jobs2.json  [["clé","texte",vitesse], ...]
python3 gen2.py                      # -> sons2.json + rapport de contrôle
python3 fusionner.py p_regarde       # fusionne dans sons.js (en excluant les clés listées)
```

Clés : `p_*` / `c_*` phrases et consignes, `s_*` syllabes et sons, `w_*` mots, `x_*` bruitages.

### « J'entends ? » : choix des mots

`pool.py` calcule la phonétique de chaque mot, `classify.py` les classe par son (a, i, o, u, ou, é) et **écarte les cas
ambigus** pour une débutante (sons nasals « an/on/in », « è » pour « é », « oi », paires u/ou, « ou » pour « o »).
Résultat dans `entends.json`, recopié dans `index.html`.

## Mettre en ligne une nouvelle version

1. Modifier les fichiers, tester.
2. **Augmenter `VERSION` dans `sw.js`** (ex. `lire-v2`) : sinon les téléphones gardent l'ancienne version en cache.
3. Pousser sur `main` : GitHub Pages publie automatiquement.
