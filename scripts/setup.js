#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupGrimovies() {
  console.log('Configuration de Grimovies\n');

  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const overwrite = await askQuestion('Un fichier .env existe déjà. Voulez-vous le remplacer ? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Configuration annulée.');
        rl.close();
        return;
      }
    }

    console.log('\nVariables d\'environnement\n');

    console.log('Supabase:');
    const supabaseUrl = await askQuestion('URL de votre projet Supabase: ');
    const supabaseKey = await askQuestion('Clé anonyme Supabase: ');

    console.log('\nTMDB:');
    const tmdbKey = await askQuestion('Clé API TMDB: ');

    const envContent = `SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseKey}
TMDB_API_KEY=${tmdbKey}
`;

    fs.writeFileSync(envPath, envContent);

    console.log('\nConfiguration terminée. Les clés restent dans .env (non versionné).');
    console.log('Lancez l\'application avec: npm start');
  } catch (error) {
    console.error('Erreur lors de la configuration:', error.message);
  }

  rl.close();
}

setupGrimovies();
