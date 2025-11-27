/**
 * FIXO - API Helper
 * ==================
 * Jednotné funkce pro komunikaci s backendem
 * S offline fallback simulací
 */

// API Configuration
const API_CONFIG = {
    // Pro localhost development (zkusí oba porty)
    LOCAL: window.location.port ? `http://localhost:${window.location.port}` : 'http://localhost:3001',
    // Pro production (Render.com)
    PRODUCTION: 'https://fixo-api.onrender.com',
    // Automatická detekce
    get BASE_URL() {
        // Pokud je to localhost nebo 127.0.0.1, použij LOCAL
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return this.LOCAL;
        }
        // Jinak použij PRODUCTION
        return this.PRODUCTION;
    }
};

// Offline databáze pro simulaci
const OFFLINE_DATABASE = {
    issues: [
        {
            object: { id: 'faucet', name: 'Kohoutek', category: 'bathroom' },
            issue: { id: 'leak', name: 'Kapající kohoutek', description: 'Netěsnící těsnění způsobuje únik vody' },
            recommendations: {
                difficulty: 'Snadné',
                timeEstimate: '15 min',
                requiredTools: ['Klíč', 'Šroubovák', 'Nové těsnění'],
                steps: [
                    { step: 1, action: 'Zavřete hlavní přívod vody', time: '1 min', icon: '🚰' },
                    { step: 2, action: 'Odšroubujte hlavici kohoutku', time: '3 min', icon: '🔧' },
                    { step: 3, action: 'Vyjměte staré těsnění', time: '2 min', icon: '⭕' },
                    { step: 4, action: 'Vložte nové těsnění', time: '2 min', icon: '✅' },
                    { step: 5, action: 'Sestavte kohoutek zpět', time: '3 min', icon: '🔩' },
                    { step: 6, action: 'Otevřete vodu a zkontrolujte', time: '2 min', icon: '💧' }
                ],
                safetyWarnings: ['Vždy zavřete hlavní přívod vody před opravou']
            }
        },
        {
            object: { id: 'toilet', name: 'Toaleta', category: 'bathroom' },
            issue: { id: 'running', name: 'Protékající WC', description: 'Vadný plovák způsobuje neustálé protékání' },
            recommendations: {
                difficulty: 'Střední',
                timeEstimate: '20 min',
                requiredTools: ['Klíč', 'Nový plovák', 'Rukavice'],
                steps: [
                    { step: 1, action: 'Zavřete přívod vody k WC', time: '1 min', icon: '🚰' },
                    { step: 2, action: 'Vyprázdněte nádrž', time: '2 min', icon: '💧' },
                    { step: 3, action: 'Zkontrolujte plovák a ventil', time: '3 min', icon: '🔍' },
                    { step: 4, action: 'Vyměňte vadné díly', time: '10 min', icon: '🔧' },
                    { step: 5, action: 'Otevřete vodu a otestujte', time: '3 min', icon: '✅' }
                ],
                safetyWarnings: ['Použijte rukavice pro hygienu']
            }
        },
        {
            object: { id: 'door', name: 'Dveře', category: 'house' },
            issue: { id: 'squeaking', name: 'Vrzající dveře', description: 'Suché panty způsobují vrzání' },
            recommendations: {
                difficulty: 'Velmi snadné',
                timeEstimate: '5 min',
                requiredTools: ['WD-40 nebo olej', 'Hadřík'],
                steps: [
                    { step: 1, action: 'Otevřete dveře dokořán', time: '0.5 min', icon: '🚪' },
                    { step: 2, action: 'Nastříkejte mazivo na panty', time: '1 min', icon: '🛢️' },
                    { step: 3, action: 'Pohybujte dveřmi sem a tam', time: '1 min', icon: '↔️' },
                    { step: 4, action: 'Otřete přebytečné mazivo', time: '1 min', icon: '🧹' }
                ],
                safetyWarnings: ['Větrejte při použití sprejů']
            }
        },
        {
            object: { id: 'sink', name: 'Dřez', category: 'kitchen' },
            issue: { id: 'clogged', name: 'Ucpaný odpad', description: 'Ucpaný sifon brání odtoku vody' },
            recommendations: {
                difficulty: 'Snadné',
                timeEstimate: '15 min',
                requiredTools: ['Kbelík', 'Klíč', 'Drátěnka', 'Rukavice'],
                steps: [
                    { step: 1, action: 'Položte kbelík pod sifon', time: '1 min', icon: '🪣' },
                    { step: 2, action: 'Odšroubujte sifon', time: '3 min', icon: '🔧' },
                    { step: 3, action: 'Vyčistěte nečistoty', time: '5 min', icon: '🧹' },
                    { step: 4, action: 'Propláchněte sifon vodou', time: '2 min', icon: '💧' },
                    { step: 5, action: 'Sestavte zpět a zkontrolujte', time: '3 min', icon: '✅' }
                ],
                safetyWarnings: ['Použijte rukavice - může být špinavé']
            }
        },
        {
            object: { id: 'radiator', name: 'Radiátor', category: 'heating' },
            issue: { id: 'cold', name: 'Studený radiátor', description: 'Vzduch v systému brání ohřevu' },
            recommendations: {
                difficulty: 'Snadné',
                timeEstimate: '10 min',
                requiredTools: ['Odvzdušňovací klíč', 'Kbelík', 'Hadřík'],
                steps: [
                    { step: 1, action: 'Vypněte topení', time: '1 min', icon: '🌡️' },
                    { step: 2, action: 'Najděte odvzdušňovací ventil', time: '1 min', icon: '🔍' },
                    { step: 3, action: 'Přidržte kbelík pod ventilem', time: '0.5 min', icon: '🪣' },
                    { step: 4, action: 'Pomalu otevřete ventil', time: '2 min', icon: '🔧' },
                    { step: 5, action: 'Počkejte až začne téct voda', time: '3 min', icon: '💧' },
                    { step: 6, action: 'Zavřete ventil a zapněte topení', time: '1 min', icon: '✅' }
                ],
                safetyWarnings: ['Pozor na horkou vodu']
            }
        }
    ]
};

/**
 * Simulace analýzy obrázku (offline fallback)
 * @returns {Object} Simulovaný výsledek analýzy
 */
function simulateAnalysis() {
    const randomIndex = Math.floor(Math.random() * OFFLINE_DATABASE.issues.length);
    const selected = OFFLINE_DATABASE.issues[randomIndex];

    return {
        analysisId: 'offline-' + Date.now(),
        timestamp: new Date().toISOString(),
        provider: 'offline-simulation',
        detection: {
            object: {
                ...selected.object,
                confidence: 0.85 + Math.random() * 0.14
            },
            issue: {
                id: selected.issue.id,
                name: selected.issue.name,
                description: selected.issue.description,
                confidence: 0.80 + Math.random() * 0.19,
                riskScore: Math.floor(Math.random() * 5) + 1
            }
        },
        recommendations: selected.recommendations
    };
}

/**
 * Analyzovat obrázek pomocí AI
 * @param {string} imageDataUrl - Base64 data URL obrázku
 * @returns {Promise<Object>} Výsledek analýzy
 */
async function analyzeImage(imageDataUrl) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(`${API_CONFIG.BASE_URL}/api/analyze-base64`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: imageDataUrl }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Analýza selhala');
        }

        return result.data;
    } catch (error) {
        console.warn('API nedostupné, používám offline simulaci:', error.message);

        // Fallback na offline simulaci
        return simulateAnalysis();
    }
}

/**
 * Analyzovat problém z textového popisu
 * @param {string} description - Popis problému
 * @param {string} imageDataUrl - (Volitelně) Base64 data URL obrázku
 * @returns {Promise<Object>} Výsledek analýzy
 */
async function analyzeDescription(description, imageDataUrl = null) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${API_CONFIG.BASE_URL}/api/analyze-description`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description,
                image: imageDataUrl
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Analýza selhala');
        }

        return result.data;
    } catch (error) {
        console.warn('API nedostupné, používám offline simulaci:', error.message);
        return simulateAnalysis();
    }
}

/**
 * Načíst databázi oprav
 * @returns {Promise<Object>} Databáze oprav
 */
async function getRepairsDatabase() {
    try {
        const response = await fetch('/data/repairs.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error (getRepairsDatabase):', error);
        throw error;
    }
}

/**
 * Zobrazit notifikaci (mini overlay)
 * @param {string} message - Zpráva
 * @param {string} type - Typ: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Jak dlouho zobrazit (ms), default 3000
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Odstranit existující notifikace
    const existing = document.querySelectorAll('.mini-overlay');
    existing.forEach(el => el.remove());

    // Vytvořit novou notifikaci
    const notification = document.createElement('div');
    notification.className = `mini-overlay ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    notification.innerHTML = `
        <div class="mini-overlay-header">
            <div class="mini-overlay-title">
                <i class="fas ${icons[type]}"></i>
                <span>${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </div>
            <button class="mini-overlay-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="mini-overlay-body">${message}</div>
    `;

    document.body.appendChild(notification);

    // Auto-remove po duration
    if (duration > 0) {
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}

/**
 * Zobrazit loading overlay
 * @param {string} message - Zpráva během načítání
 */
function showLoading(message = 'Načítání...') {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'overlay';
    overlay.innerHTML = `
        <div class="modal modal-sm text-center">
            <div class="modal-body">
                <div style="font-size: 3rem; margin-bottom: 1rem;">
                    <i class="fas fa-spinner fa-spin" style="color: var(--color-primary);"></i>
                </div>
                <p style="font-size: var(--font-size-lg); font-weight: 600;">${message}</p>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

/**
 * Skrýt loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

/**
 * Komprese obrázku před odesláním
 * @param {File} file - Soubor obrázku
 * @param {number} maxWidth - Maximální šířka
 * @param {number} quality - Kvalita (0-1)
 * @returns {Promise<string>} Base64 data URL
 */
function compressImage(file, maxWidth = 1920, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize pokud je větší než maxWidth
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Konverze na base64
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };

            img.onerror = reject;
            img.src = e.target.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Export pro použití v HTML
window.FIXO_API = {
    config: API_CONFIG,
    analyzeImage,
    analyzeDescription,
    getRepairsDatabase,
    showNotification,
    showLoading,
    hideLoading,
    compressImage,
    simulateAnalysis
};
