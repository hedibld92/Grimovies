#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupGrimovies() {
  console.log('🎬 Configuration de Grimovies\n');
  
  try {
    // Vérifier si le fichier .env existe déjà
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const overwrite = await askQuestion('Un fichier .env existe déjà. Voulez-vous le remplacer ? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Configuration annulée.');
        rl.close();
        return;
      }
    }

    console.log('\n📝 Configuration des variables d\'environnement\n');
    
    // Demander les informations Supabase
    console.log('🔑 Configuration Supabase:');
    const supabaseUrl = await askQuestion('URL de votre projet Supabase: ');
    const supabaseKey = await askQuestion('Clé anonyme Supabase: ');
    
    // Demander la clé TMDB
    console.log('\n🎭 Configuration TMDB:');
    const tmdbKey = await askQuestion('Clé API TMDB: ');
    
    // Créer le contenu du fichier .env
    const envContent = `# Configuration Supabase
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseKey}

# Configuration TMDB (The Movie Database)
TMDB_API_KEY=${tmdbKey}

# Configuration optionnelle pour JustWatch ou autres services
JUSTWATCH_API_KEY=
`;

    // Écrire le fichier .env
    fs.writeFileSync(envPath, envContent);
    
    // Mettre à jour les fichiers de service avec les vraies valeurs
    updateServiceFiles(supabaseUrl, supabaseKey, tmdbKey);
    
    console.log('\n✅ Configuration terminée !');
    console.log('\n🚀 Vous pouvez maintenant lancer l\'application avec:');
    console.log('   npm start');
    console.log('   ou');
    console.log('   expo start');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
  }
  
  rl.close();
}

function updateServiceFiles(supabaseUrl, supabaseKey, tmdbKey) {
  // Mettre à jour le fichier Supabase
  const supabasePath = path.join(process.cwd(), 'src', 'services', 'supabase.js');
  if (fs.existsSync(supabasePath)) {
    let supabaseContent = fs.readFileSync(supabasePath, 'utf8');
    supabaseContent = supabaseContent.replace('YOUR_SUPABASE_URL', supabaseUrl);
    supabaseContent = supabaseContent.replace('YOUR_SUPABASE_ANON_KEY', supabaseKey);
    fs.writeFileSync(supabasePath, supabaseContent);
  }
  
  // Mettre à jour le fichier TMDB
  const tmdbPath = path.join(process.cwd(), 'src', 'services', 'tmdb.js');
  if (fs.existsSync(tmdbPath)) {
    let tmdbContent = fs.readFileSync(tmdbPath, 'utf8');
    tmdbContent = tmdbContent.replace('YOUR_TMDB_API_KEY', tmdbKey);
    fs.writeFileSync(tmdbPath, tmdbContent);
  }
}

// Lancer la configuration
setupGrimovies(); 