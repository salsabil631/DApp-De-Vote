# Système de Vote Sécurisé sur Blockchain

**Membres du Projet** :
- Salsabil Amri
- Farah Hached
- Nawress Chtioui

Cette plateforme innovante permet aux utilisateurs de s'enregistrer en tant qu'électeurs, de proposer des idées, de voter en toute transparence et de consulter les résultats en temps réel. Grâce à la technologie blockchain, l'intégrité des votes est garantie.
## Table des Matières

- [Prérequis](#Pré-requis)
- [Configuration](#Déploiement)

## Prérequis

Assurez-vous d'avoir installé les outils suivants :

- [Node.js](https://nodejs.org/) et un gestionnaire de paquets (npm ou yarn)
- [Metamask](https://metamask.io/)  ou un portefeuille Ethereum compatible
- Hardhat pour le développement et le test des contrats


## Déploiement

### Déploiement du Contrat

Démarrez un nœud local Hardhat :
```bash
npx hardhat node
```
Déployez le contrat sur le réseau local en exécutant  :
```bash
npx hardhat ignition deploy ./ignition/modules/deploy.ts --network localhost
```
Lancez l'interface utilisateur dans le dossier frontend :
```bash
npm run dev
```

Accédez ensuite à http://localhost:3000 pour utiliser l'application.

### Fonctionnalités

1. **Connexion Blockchain** :  Connexion via un portefeuille numérique.
2. **Enregistrement des Utilisateurs** : Ajout sécurisé des électeurs.
3. **Proposition d’Idées** :  Possibilité d'ajouter des suggestions.
4. **Vote en Temps Réel** : Système de vote sécurisé et transparent.
5. **Consultation des Résultats** : Accès aux statistiques de vote.
6. **Détermination du Gagnant** : Comptabilisation automatique des voix.

Cette solution vise à moderniser les processus électoraux en garantissant une sécurité et une transparence maximales.
