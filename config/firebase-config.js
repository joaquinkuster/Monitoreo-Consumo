const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const path = require('path');

class FirebaseConfig {
    constructor() {
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) {
            return;
        }

        try {
            const credentialPaths = [
                path.join(__dirname, '../credentials/firebase-credentials.json'),
                path.join(process.cwd(), 'credentials/firebase-credentials.json')
            ];

            let serviceAccountPath = null;
            for (const credPath of credentialPaths) {
                try {
                    require.resolve(credPath);
                    serviceAccountPath = credPath;
                    console.log(`✅ Credenciales Firebase encontradas en: ${credPath}`);
                    break;
                } catch (err) {
                    continue;
                }
            }

            if (!serviceAccountPath) {
                throw new Error('No se pudo encontrar el archivo de credenciales de Firebase');
            }

            initializeApp({
                credential: cert(require(serviceAccountPath)),
                databaseURL: "https://mqtt-mosquitto-3ae51-default-rtdb.firebaseio.com/"
            });

            this.initialized = true;
            console.log('✅ Firebase inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando Firebase:', error);
            throw error;
        }
    }

    getDatabase() {
        if (!this.initialized) {
            this.initialize();
        }
        return getDatabase();
    }
}

module.exports = new FirebaseConfig();