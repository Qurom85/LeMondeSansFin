const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const leaderboardList = document.getElementById('leaderboardList');
const instructionsBox = document.getElementById('instructions');
const closeInstructionsButton = document.getElementById('closeInstructions');

canvas.width = 800;
canvas.height = 600;

let player, monsters, projectiles, score, level, lives, gameStarted = false;
let playerName;

// Charger l'image de fond
const backgroundImage = new Image();
backgroundImage.src = 'candy_world.jpg';

// Afficher les instructions si c'est la première visite
function showInstructionsIfFirstVisit() {
    if (!localStorage.getItem('instructionsSeen')) {
        instructionsBox.classList.remove('hidden');
    }
}

// Fermer les instructions
closeInstructionsButton.addEventListener('click', () => {
    instructionsBox.classList.add('hidden');
    localStorage.setItem('instructionsSeen', 'true');
});

// Initialiser les éléments du jeu
function initGame() {
    playerName = prompt("Entrez votre nom:");
    if (!playerName) {
        alert("Nom requis pour jouer !");
        return;
    }
    
    player = { x: 50, y: 50, size: 20, speed: 5 };
    monsters = [];
    projectiles = [];
    score = 0;
    level = 1;
    lives = 5;
    gameStarted = true;
    startButton.style.display = 'none';
    gameLoop();
}

// Fonction pour faire apparaître un monstre
function spawnMonster() {
    const monster = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 20 + Math.random() * 30,
        speed: 1 + Math.random() * 2,
    };
    monsters.push(monster);
}

// Fonction pour tirer un projectile
function shootProjectile() {
    const projectile = {
        x: player.x + player.size / 2,
        y: player.y,
        size: 5,
        speed: 7
    };
    projectiles.push(projectile);
}

// Fonction principale de mise à jour du jeu
function update() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Dessiner le joueur
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // Mettre à jour et dessiner les projectiles
    ctx.fillStyle = 'yellow';
    projectiles.forEach((projectile, index) => {
        projectile.y -= projectile.speed;
        ctx.fillRect(projectile.x, projectile.y, projectile.size, projectile.size);

        // Supprimer le projectile s'il sort de l'écran
        if (projectile.y < 0) {
            projectiles.splice(index, 1);
        }
    });

    // Mettre à jour et dessiner les monstres
    ctx.fillStyle = 'red';
    monsters.forEach((monster, monsterIndex) => {
        monster.x += (player.x - monster.x) * monster.speed * 0.01;
        monster.y += (player.y - monster.y) * monster.speed * 0.01;
        
        ctx.fillRect(monster.x, monster.y, monster.size, monster.size);

        // Vérifier les collisions entre les projectiles et les monstres
        projectiles.forEach((projectile, projIndex) => {
            if (isColliding(projectile, monster)) {
                score += 10;
                monsters.splice(monsterIndex, 1);
                projectiles.splice(projIndex, 1);
            }
        });

        // Vérifier les collisions avec le joueur
        if (isColliding(player, monster)) {
            lives -= 0.5;
            monsters.splice(monsterIndex, 1);
            if (lives <= 0) {
                alert("Game Over! Cliquez sur Commencer pour rejouer.");
                saveScore(playerName, score);
                resetGame();
            }
        }
    });

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Vies: ${lives}`, 10, 20);
    ctx.fillText(`Niveau: ${level}`, 10, 50);
    ctx.fillText(`Score: ${score}`, 10, 80);
}

// Vérification des collisions
function isColliding(a, b) {
    return (
        a.x < b.x + b.size &&
        a.x + a.size > b.x &&
        a.y < b.y + b.size &&
        a.y + a.size > b.y
    );
}

// Réinitialiser le jeu
function resetGame() {
    gameStarted = false;
    startButton.style.display = 'block';
    updateLeaderboard();
}

// Boucle de jeu principale
function gameLoop() {
    if (gameStarted) {
        update();
        requestAnimationFrame(gameLoop);
    }
}

// Gérer le déplacement du joueur et tirer un projectile
function handleKeyPress(event) {
    switch (event.key) {
        case 'ArrowUp': player.y -= player.speed; break;
        case 'ArrowDown': player.y += player.speed; break;
        case 'ArrowLeft': player.x -= player.speed; break;
        case 'ArrowRight': player.x += player.speed; break;
        case ' ': shootProjectile(); break; // Barre d'espace pour tirer
    }
}

// Enregistrer le score dans le localStorage
function saveScore(name, score) {
    const newScore = { name, score };
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    
    // Ajouter le nouveau score et trier pour conserver les meilleurs scores
    leaderboard.push(newScore);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5); // Garde seulement les 5 meilleurs scores
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

// Mettre à jour le tableau des scores
function updateLeaderboard() {
    leaderboardList.innerHTML = '';
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${entry.name}: ${entry.score} points`;
        leaderboardList.appendChild(listItem);
    });
}

// Afficher les instructions si première visite
showInstructionsIfFirstVisit();

// Gestion de l'apparition des monstres
setInterval(() => {
    if (gameStarted) {
        spawnMonster();
        score += 10;
        if (score % 50 === 0) {
            level++;
            player.speed += 0.5;
        }
    }
}, 1000);

startButton.addEventListener('click', initGame);
window.addEventListener('keydown', handleKeyPress);
