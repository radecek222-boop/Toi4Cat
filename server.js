// FIXO Backend Server
// REST API pro aplikaci na diagnostiku domácích závad

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const aiAnalyzer = require('./src/aiAnalyzer');
const paymentGateway = require('./src/paymentGateway');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS konfigurace - MUSÍ být před vším ostatním!
const corsOptions = {
    origin: function (origin, callback) {
        // Povolit requesty bez origin (např. mobilní aplikace, Postman)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'https://radecek222-boop.github.io',
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5500',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5500'
        ];

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // Pro vývoj povolit všechny origins
            console.log('CORS: Povoleno pro origin:', origin);
            callback(null, true);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200, // Pro starší prohlížeče
    preflightContinue: false
};

// CORS middleware MUSÍ být úplně první!
app.use(cors(corsOptions));

// Explicitní OPTIONS handler pro všechny routes
app.options('*', cors(corsOptions));

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            connectSrc: [
                "'self'",
                "http://localhost:3001",
                "http://localhost:3000",
                "https://fixo-api.onrender.com",
                "https://radecek222-boop.github.io"
            ]
        }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

app.use(express.json({ limit: '10mb' })); // Zvýšit limit pro base64 obrazy
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Rate limiting - vynechat OPTIONS requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minut
    max: 100, // limit každé IP na 100 požadavků
    skip: (req) => req.method === 'OPTIONS' // Vynechat preflight requests
});
app.use('/api/', limiter);

// Servírování statických souborů (CSS, JS, images)
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/data', express.static(path.join(__dirname, 'data')));

// Servírování HTML stránek
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/analytics.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'analytics.html'));
});

app.get('/repair.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'repair.html'));
});

app.get('/partners.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'partners.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/contacts.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'contacts.html'));
});

app.get('/fixo-app.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'fixo-app.html'));
});

// Multer pro upload obrázků
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Povoleny jsou pouze obrázky (JPEG, PNG, GIF, WebP)'));
        }
    }
});

// Databáze závad organizovaná do sekcí
const repairSections = {
    bathroom: {
        id: 'bathroom',
        name: 'Koupelna',
        icon: '🚿',
        items: {
            faucet: {
                id: 'faucet',
                name: 'Kohoutek',
                issues: [{
                    id: 'leak',
                    name: 'Kapající kohoutek',
                    description: 'Netěsnící těsnění',
                    severity: 'low',
                    difficulty: 'easy',
                    timeEstimate: 15,
                    cost: '50-200 Kč',
                    tools: ['Klíč', 'Šroubovák', 'Těsnění'],
                    steps: ['Zavřete vodu', 'Odšroubujte hlavici', 'Vyměňte těsnění', 'Sestavte zpět'],
                    warnings: ['Zavřete hlavní přívod vody'],
                    professionalNeeded: false
                }]
            },
            toilet: {
                id: 'toilet',
                name: 'Toaleta',
                issues: [{
                    id: 'running',
                    name: 'Protékající WC',
                    description: 'Vadný plovák',
                    severity: 'medium',
                    difficulty: 'medium',
                    timeEstimate: 20,
                    cost: '100-500 Kč',
                    tools: ['Klíč', 'Plovák'],
                    steps: ['Zavřete vodu', 'Vyprázdněte nádrž', 'Zkontrolujte plovák', 'Vyměňte díly'],
                    warnings: ['Použijte rukavice'],
                    professionalNeeded: false
                }]
            }
        }
    },
    house: {
        id: 'house',
        name: 'Dům',
        icon: '🏠',
        items: {
            door: {
                id: 'door',
                name: 'Dveře',
                issues: [{
                    id: 'squeaking',
                    name: 'Vrzající dveře',
                    description: 'Suché panty',
                    severity: 'low',
                    difficulty: 'very_easy',
                    timeEstimate: 5,
                    cost: '20-100 Kč',
                    tools: ['WD-40', 'Hadřík'],
                    steps: ['Otevřete dveře', 'Nastříkejte mazivo', 'Pohybujte dveřmi'],
                    warnings: ['Větrejte při použití sprejů'],
                    professionalNeeded: false
                }]
            },
            window: {
                id: 'window',
                name: 'Okno',
                issues: [{
                    id: 'draft',
                    name: 'Fouká od okna',
                    description: 'Staré těsnění',
                    severity: 'medium',
                    difficulty: 'easy',
                    timeEstimate: 30,
                    cost: '100-300 Kč',
                    tools: ['Těsnění', 'Nůž', 'Čistič'],
                    steps: ['Odstraňte staré těsnění', 'Očistěte spáru', 'Nalepte nové těsnění'],
                    warnings: ['Pracujte v suchu'],
                    professionalNeeded: false
                }]
            }
        }
    },
    electrical: {
        id: 'electrical',
        name: 'Elektřina',
        icon: '⚡',
        items: {
            outlet: {
                id: 'outlet',
                name: 'Zásuvka',
                issues: [{
                    id: 'not_working',
                    name: 'Nefunkční zásuvka',
                    description: 'Přerušený obvod',
                    severity: 'high',
                    difficulty: 'hard',
                    timeEstimate: 30,
                    cost: '200-1000 Kč',
                    tools: ['Tester napětí', 'Šroubovák'],
                    steps: ['⚠️ VYPNĚTE JISTIČ!', 'Ověřte testerem', 'Zkontrolujte zapojení'],
                    warnings: ['⚠️ NEBEZPEČÍ! Volejte elektrikáře pokud si nejste jisti'],
                    professionalNeeded: true
                }]
            },
            lightbulb: {
                id: 'lightbulb',
                name: 'Žárovka',
                issues: [{
                    id: 'not_lighting',
                    name: 'Žárovka nesvítí',
                    description: 'Vybitá žárovka',
                    severity: 'low',
                    difficulty: 'very_easy',
                    timeEstimate: 2,
                    cost: '50-200 Kč',
                    tools: ['Nová žárovka'],
                    steps: ['Vypněte vypínač', 'Vyšroubujte starou', 'Zašroubujte novou'],
                    warnings: ['Nechte vychladnout'],
                    professionalNeeded: false
                }]
            }
        }
    },
    heating: {
        id: 'heating',
        name: 'Topení',
        icon: '🌡️',
        items: {
            radiator: {
                id: 'radiator',
                name: 'Radiátor',
                issues: [{
                    id: 'cold',
                    name: 'Studený radiátor',
                    description: 'Vzduch v systému',
                    severity: 'low',
                    difficulty: 'easy',
                    timeEstimate: 10,
                    cost: '0-50 Kč',
                    tools: ['Odvzdušňovací klíč', 'Kbelík'],
                    steps: ['Vypněte topení', 'Najděte ventil', 'Odvzdušněte'],
                    warnings: ['Pozor na horkou vodu'],
                    professionalNeeded: false
                }]
            }
        }
    },
    kitchen: {
        id: 'kitchen',
        name: 'Kuchyň',
        icon: '🍳',
        items: {
            sink: {
                id: 'sink',
                name: 'Dřez',
                issues: [{
                    id: 'clogged',
                    name: 'Ucpaný odpad',
                    description: 'Ucpaný sifon',
                    severity: 'medium',
                    difficulty: 'easy',
                    timeEstimate: 15,
                    cost: '50-200 Kč',
                    tools: ['Kbelík', 'Klíč', 'Drátěnka'],
                    steps: ['Pod sifon dejte kbelík', 'Odšroubujte sifon', 'Vyčistěte', 'Sestavte zpět'],
                    warnings: ['Použijte rukavice'],
                    professionalNeeded: false
                }]
            }
        }
    },
    garden: {
        id: 'garden',
        name: 'Zahrada',
        icon: '🌱',
        items: {
            lawnmower: {
                id: 'lawnmower',
                name: 'Sekačka',
                issues: [{
                    id: 'not_starting',
                    name: 'Sekačka nenastartuje',
                    description: 'Starý benzín nebo zanesená svíčka',
                    severity: 'medium',
                    difficulty: 'medium',
                    timeEstimate: 20,
                    cost: '100-500 Kč',
                    tools: ['Nová svíčka', 'Čistič', 'Benzín'],
                    steps: ['Zkontrolujte benzín', 'Vyčistěte/vyměňte svíčku', 'Zkontrolujte filtr'],
                    warnings: ['Vypněte motor před prací'],
                    professionalNeeded: false
                }]
            },
            fence: {
                id: 'fence',
                name: 'Plot',
                issues: [{
                    id: 'loose',
                    name: 'Uvolněný plot',
                    description: 'Uvolněné sloupky',
                    severity: 'low',
                    difficulty: 'medium',
                    timeEstimate: 60,
                    cost: '200-1000 Kč',
                    tools: ['Kladivo', 'Hřebíky', 'Beton'],
                    steps: ['Zkontrolujte sloupky', 'Upevněte nebo zabetonujte', 'Dotáhněte spojení'],
                    warnings: ['Práce s těžkým materiálem'],
                    professionalNeeded: false
                }]
            }
        }
    }
};

// Pomocná funkce pro zpětnou kompatibilitu - konverze nové struktury na starou
function convertToOldFormat() {
    const oldFormat = {};
    Object.values(repairSections).forEach(section => {
        Object.entries(section.items).forEach(([itemKey, item]) => {
            oldFormat[itemKey] = {
                id: item.id,
                name: item.name,
                category: section.id,
                commonIssues: item.issues.map(issue => ({
                    id: issue.id,
                    name: issue.name,
                    description: issue.description,
                    severity: issue.severity,
                    difficulty: issue.difficulty,
                    timeEstimate: issue.timeEstimate,
                    costEstimate: issue.cost,
                    requiredTools: issue.tools,
                    steps: issue.steps.map((step, idx) => ({
                        order: idx + 1,
                        description: step
                    })),
                    safetyWarnings: issue.warnings,
                    professionalNeeded: issue.professionalNeeded
                }))
            };
        });
    });
    return oldFormat;
}

const repairDatabase = convertToOldFormat();

// API Endpoints

// Explicitní OPTIONS handlers pro všechny API endpointy
app.options('/api/*', cors(corsOptions));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Získat všechny sekce oprav (NOVÉ API)
app.get('/api/sections', (req, res) => {
    const sections = {};
    Object.entries(repairSections).forEach(([key, section]) => {
        const itemCount = Object.keys(section.items).length;
        const issueCount = Object.values(section.items).reduce(
            (sum, item) => sum + item.issues.length, 0
        );
        sections[key] = {
            id: section.id,
            name: section.name,
            icon: section.icon,
            itemCount,
            issueCount,
            items: section.items
        };
    });
    res.json({ sections });
});

// Získat konkrétní sekci
app.get('/api/sections/:sectionId', (req, res) => {
    const { sectionId } = req.params;
    const section = repairSections[sectionId];

    if (!section) {
        return res.status(404).json({ error: 'Sekce nenalezena' });
    }

    res.json({ section });
});

// Získat všechny kategorie závad (DEPRECATED - použijte /api/sections)
app.get('/api/categories', (req, res) => {
    const categories = {};
    Object.entries(repairSections).forEach(([key, section]) => {
        const itemCount = Object.keys(section.items).length;
        categories[key] = {
            name: section.name,
            icon: section.icon,
            count: itemCount
        };
    });

    res.json({ categories });
});

// Analyzovat obrázek (simulace AI)
app.post('/api/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nebyl nahrán žádný obrázek' });
        }

        // Simulace AI zpracování (v produkci by se volalo skutečné vision API)
        const analysisId = uuidv4();
        
        // Simulovat zpoždění analýzy
        setTimeout(() => {
            console.log(`Analýza ${analysisId} dokončena`);
        }, 2000);

        // Náhodně vybrat objekt z databáze
        const objects = Object.keys(repairDatabase);
        const randomObjectKey = objects[Math.floor(Math.random() * objects.length)];
        const detectedObject = repairDatabase[randomObjectKey];
        
        // Náhodně vybrat závadu
        const randomIssue = detectedObject.commonIssues[
            Math.floor(Math.random() * detectedObject.commonIssues.length)
        ];

        const result = {
            analysisId: analysisId,
            timestamp: new Date().toISOString(),
            image: {
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype
            },
            detection: {
                object: {
                    id: detectedObject.id,
                    name: detectedObject.name,
                    category: detectedObject.category,
                    confidence: Math.random() * 0.2 + 0.8 // 0.8 - 1.0
                },
                issue: {
                    id: randomIssue.id,
                    name: randomIssue.name,
                    description: randomIssue.description,
                    confidence: Math.random() * 0.15 + 0.85, // 0.85 - 1.0
                    severity: randomIssue.severity,
                    riskScore: randomIssue.riskScore
                }
            },
            possibleIssues: [],
            recommendations: {
                canDIY: !randomIssue.professionalNeeded,
                difficulty: randomIssue.difficulty,
                timeEstimate: randomIssue.timeEstimate,
                costEstimate: randomIssue.costEstimate,
                requiredTools: randomIssue.requiredTools,
                steps: randomIssue.steps,
                safetyWarnings: randomIssue.safetyWarnings
            }
        };

        res.json({ success: true, data: result });

    } catch (error) {
        console.error('Chyba při analýze:', error);
        res.status(500).json({
            error: 'Chyba při zpracování obrázku',
            message: error.message
        });
    }
});

// Analyzovat obrázek ze base64 (pro frontend)
app.post('/api/analyze-base64', async (req, res) => {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ success: false, error: 'Nebyl poskytnut base64 obrázek' });
        }

        // Použít AI Analyzer
        const analysisResult = await aiAnalyzer.analyze(image);

        return res.json({ success: true, data: analysisResult });
    } catch (error) {
        console.error('Chyba při analýze obrázku:', error);
        return res.status(500).json({
            success: false,
            error: 'Chyba při zpracování obrázku',
            message: error.message
        });
    }
});

// DEPRECATED: Stará verze pro zpětnou kompatibilitu
app.post('/api/analyze-base64-old', async (req, res) => {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Nebyl poskytnut base64 obrázek' });
        }

        // Validovat base64 formát
        if (!image.startsWith('data:image/')) {
            return res.status(400).json({ error: 'Neplatný formát obrázku (očekává se data:image/...)' });
        }

        // Simulace AI zpracování (v produkci by se volalo skutečné vision API)
        const analysisId = uuidv4();

        // Získat velikost base64 obrázku
        const base64Length = image.split(',')[1]?.length || 0;
        const sizeInBytes = (base64Length * 3) / 4;

        // Náhodně vybrat objekt z databáze
        const objects = Object.keys(repairDatabase);
        const randomObjectKey = objects[Math.floor(Math.random() * objects.length)];
        const detectedObject = repairDatabase[randomObjectKey];

        // Náhodně vybrat závadu
        const randomIssue = detectedObject.commonIssues[
            Math.floor(Math.random() * detectedObject.commonIssues.length)
        ];

        const result = {
            analysisId: analysisId,
            timestamp: new Date().toISOString(),
            image: {
                size: sizeInBytes,
                format: 'base64'
            },
            detection: {
                object: {
                    id: detectedObject.id,
                    name: detectedObject.name,
                    category: detectedObject.category,
                    confidence: Math.random() * 0.2 + 0.8 // 0.8 - 1.0
                },
                issue: {
                    id: randomIssue.id,
                    name: randomIssue.name,
                    description: randomIssue.description,
                    confidence: Math.random() * 0.15 + 0.85, // 0.85 - 1.0
                    severity: randomIssue.severity,
                    riskScore: randomIssue.riskScore
                }
            },
            recommendations: {
                canDIY: !randomIssue.professionalNeeded,
                difficulty: randomIssue.difficulty,
                timeEstimate: randomIssue.timeEstimate,
                costEstimate: randomIssue.costEstimate,
                requiredTools: randomIssue.requiredTools,
                steps: randomIssue.steps,
                safetyWarnings: randomIssue.safetyWarnings
            }
        };

        res.json({ success: true, data: result });

    } catch (error) {
        console.error('Chyba při analýze base64:', error);
        res.status(500).json({
            error: 'Chyba při zpracování base64 obrázku',
            message: error.message
        });
    }
});

// Získat detail opravy
app.get('/api/repair/:objectId/:issueId', (req, res) => {
    const { objectId, issueId } = req.params;
    
    const object = repairDatabase[objectId];
    if (!object) {
        return res.status(404).json({ error: 'Objekt nenalezen' });
    }
    
    const issue = object.commonIssues.find(i => i.id === issueId);
    if (!issue) {
        return res.status(404).json({ error: 'Závada nenalezena' });
    }
    
    res.json({
        object: {
            id: object.id,
            name: object.name,
            category: object.category
        },
        issue: issue
    });
});

// Získat všechny objekty v databázi
app.get('/api/objects', (req, res) => {
    const { category } = req.query;
    
    let objects = Object.values(repairDatabase);
    
    if (category) {
        objects = objects.filter(obj => obj.category === category);
    }
    
    const simplified = objects.map(obj => ({
        id: obj.id,
        name: obj.name,
        category: obj.category,
        issueCount: obj.commonIssues.length
    }));
    
    res.json({ objects: simplified });
});

// Vyhledávání v databázi
app.get('/api/search', (req, res) => {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
        return res.status(400).json({ error: 'Vyhledávací dotaz musí mít alespoň 2 znaky' });
    }
    
    const query = q.toLowerCase();
    const results = [];
    
    Object.values(repairDatabase).forEach(object => {
        // Hledat v názvu objektu
        if (object.name.toLowerCase().includes(query) || 
            object.nameEN.toLowerCase().includes(query)) {
            results.push({
                type: 'object',
                id: object.id,
                name: object.name,
                category: object.category
            });
        }
        
        // Hledat v závadách
        object.commonIssues.forEach(issue => {
            if (issue.name.toLowerCase().includes(query) || 
                issue.nameEN.toLowerCase().includes(query) ||
                issue.description.toLowerCase().includes(query)) {
                results.push({
                    type: 'issue',
                    objectId: object.id,
                    objectName: object.name,
                    issueId: issue.id,
                    issueName: issue.name,
                    description: issue.description
                });
            }
        });
    });
    
    res.json({ 
        query: q,
        count: results.length,
        results: results.slice(0, 20) // Omezit na 20 výsledků
    });
});

// Uložit historii opravy
app.post('/api/history', (req, res) => {
    const { objectId, issueId, status, duration, notes } = req.body;
    
    if (!objectId || !issueId || !status) {
        return res.status(400).json({ error: 'Chybí povinné údaje' });
    }
    
    const historyItem = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        objectId,
        issueId,
        status, // 'started', 'completed', 'abandoned'
        duration,
        notes
    };
    
    // V produkci by se ukládalo do databáze
    console.log('Ukládám historii:', historyItem);
    
    res.json({ 
        success: true,
        data: historyItem 
    });
});

// Získat statistiky
app.get('/api/stats', (req, res) => {
    const totalObjects = Object.keys(repairDatabase).length;
    const totalIssues = Object.values(repairDatabase)
        .reduce((sum, obj) => sum + obj.commonIssues.length, 0);
    
    const categoryCounts = {};
    Object.values(repairDatabase).forEach(obj => {
        categoryCounts[obj.category] = (categoryCounts[obj.category] || 0) + 1;
    });
    
    res.json({
        totalObjects,
        totalIssues,
        categoryCounts,
        averageDifficulty: 'medium',
        averageTime: 18, // minut
        successRate: 0.87 // 87% úspěšnost
    });
});

// Získat nástroje a materiál
app.get('/api/tools', (req, res) => {
    const tools = {
        wrench: { name: 'Klíč', price: 150, unit: 'CZK' },
        screwdriver: { name: 'Šroubovák', price: 100, unit: 'CZK' },
        new_seal: { name: 'Těsnění', price: 50, unit: 'CZK' },
        new_flapper: { name: 'Plovák', price: 200, unit: 'CZK' },
        voltage_tester: { name: 'Tester napětí', price: 300, unit: 'CZK' },
        new_outlet: { name: 'Nová zásuvka', price: 150, unit: 'CZK' },
        wd40: { name: 'WD-40', price: 120, unit: 'CZK' },
        cloth: { name: 'Hadřík', price: 20, unit: 'CZK' },
        radiator_key: { name: 'Odvzdušňovací klíč', price: 80, unit: 'CZK' },
        bucket: { name: 'Kbelík', price: 50, unit: 'CZK' }
    };
    
    res.json({ tools });
});

// ============================================
// PROVIDER ENDPOINTS (Dodavatelé oprav)
// ============================================

// Databáze dodavatelů (v produkci by byla v samostatné DB)
const providersDatabase = [];

// Registrace nového dodavatele
app.post('/api/providers/register', async (req, res) => {
    try {
        const { companyName, ico, contactName, email, phone, serviceRadius, specialization, description, location, plan } = req.body;

        // Validace povinných polí
        if (!companyName || !ico || !contactName || !email || !phone || !location || !location.latitude || !location.longitude) {
            return res.status(400).json({ success: false, error: 'Chybí povinné údaje' });
        }

        // Vytvořit nového dodavatele
        const provider = {
            id: uuidv4(),
            companyName,
            ico,
            contactName,
            email,
            phone,
            serviceRadius: serviceRadius || 10,
            specialization: specialization || [],
            description: description || '',
            location: {
                latitude: location.latitude,
                longitude: location.longitude
            },
            plan: plan || 'basic',
            verified: false,
            rating: 0,
            reviewCount: 0,
            createdAt: new Date().toISOString(),
            active: true
        };

        // Uložit do databáze
        providersDatabase.push(provider);

        console.log(`✅ Nový dodavatel registrován: ${companyName} (${provider.id})`);

        // Pokud je to premium nebo enterprise plán, vytvořit platební intent
        let paymentData = null;
        if (plan === 'premium' || plan === 'enterprise') {
            const amount = plan === 'premium' ? 299 : 999;
            const paymentIntent = await paymentGateway.createPaymentIntent({
                amount,
                currency: 'czk',
                description: `FIXO Provider ${plan.charAt(0).toUpperCase() + plan.slice(1)} - ${companyName}`,
                metadata: {
                    providerId: provider.id,
                    plan: plan,
                    email: email
                }
            });

            paymentData = {
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.clientSecret,
                amount: paymentIntent.amount,
                paymentUrl: `/payment?intent=${paymentIntent.id}` // Pro demo
            };
        }

        res.json({
            success: true,
            data: {
                provider: {
                    id: provider.id,
                    companyName: provider.companyName,
                    plan: provider.plan
                },
                payment: paymentData
            }
        });

    } catch (error) {
        console.error('Provider registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Chyba při registraci dodavatele',
            message: error.message
        });
    }
});

// Získat všechny dodavatele
app.get('/api/providers', (req, res) => {
    const { specialization, plan } = req.query;

    let providers = providersDatabase.filter(p => p.active);

    // Filtrovat podle specializace
    if (specialization) {
        providers = providers.filter(p => p.specialization.includes(specialization));
    }

    // Filtrovat podle plánu
    if (plan) {
        providers = providers.filter(p => p.plan === plan);
    }

    res.json({
        success: true,
        count: providers.length,
        data: providers.map(p => ({
            id: p.id,
            companyName: p.companyName,
            specialization: p.specialization,
            serviceRadius: p.serviceRadius,
            location: p.location,
            plan: p.plan,
            verified: p.verified,
            rating: p.rating,
            reviewCount: p.reviewCount
        }))
    });
});

// Najít dodavatele v okolí (geolokace)
app.get('/api/providers/nearby', (req, res) => {
    const { lat, lng, radius, specialization } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ success: false, error: 'Chybí parametry lat a lng' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = radius ? parseFloat(radius) : 20; // km

    // Haversine formula pro výpočet vzdálenosti
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Poloměr Země v km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Najít dodavatele v okolí
    let nearbyProviders = providersDatabase
        .filter(p => p.active)
        .map(p => {
            const distance = calculateDistance(
                userLat, userLng,
                p.location.latitude, p.location.longitude
            );
            return { ...p, distance };
        })
        .filter(p => p.distance <= searchRadius && p.distance <= p.serviceRadius);

    // Filtrovat podle specializace
    if (specialization) {
        nearbyProviders = nearbyProviders.filter(p => p.specialization.includes(specialization));
    }

    // Seřadit podle vzdálenosti
    nearbyProviders.sort((a, b) => a.distance - b.distance);

    res.json({
        success: true,
        searchRadius,
        count: nearbyProviders.length,
        data: nearbyProviders.map(p => ({
            id: p.id,
            companyName: p.companyName,
            contactName: p.contactName,
            phone: p.phone,
            email: p.email,
            specialization: p.specialization,
            description: p.description,
            distance: Math.round(p.distance * 10) / 10, // Zaokrouhlit na 1 des. místo
            location: p.location,
            plan: p.plan,
            verified: p.verified,
            rating: p.rating,
            reviewCount: p.reviewCount
        }))
    });
});

// Získat detail dodavatele
app.get('/api/providers/:id', (req, res) => {
    const { id } = req.params;
    const provider = providersDatabase.find(p => p.id === id);

    if (!provider) {
        return res.status(404).json({ success: false, error: 'Dodavatel nenalezen' });
    }

    res.json({
        success: true,
        data: {
            id: provider.id,
            companyName: provider.companyName,
            ico: provider.ico,
            contactName: provider.contactName,
            phone: provider.phone,
            email: provider.email,
            specialization: provider.specialization,
            description: provider.description,
            serviceRadius: provider.serviceRadius,
            location: provider.location,
            plan: provider.plan,
            verified: provider.verified,
            rating: provider.rating,
            reviewCount: provider.reviewCount,
            createdAt: provider.createdAt
        }
    });
});

// ============================================
// PAYMENT ENDPOINTS
// ============================================

// Get pricing plans (pro uživatele)
app.get('/api/pricing', (req, res) => {
    try {
        const plans = paymentGateway.getPricingPlans();
        res.json({ success: true, data: plans });
    } catch (error) {
        console.error('Error fetching pricing:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get provider pricing plans (pro dodavatele)
app.get('/api/pricing/providers', (req, res) => {
    try {
        const plans = paymentGateway.getProviderPlans();
        res.json({ success: true, data: plans });
    } catch (error) {
        console.error('Error fetching provider pricing:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create payment intent
app.post('/api/payment/create-intent', async (req, res) => {
    try {
        const { amount, currency, description, metadata } = req.body;

        if (!amount) {
            return res.status(400).json({ success: false, error: 'Amount is required' });
        }

        const paymentIntent = await paymentGateway.createPaymentIntent({
            amount,
            currency: currency || 'czk',
            description,
            metadata
        });

        res.json({ success: true, data: paymentIntent });
    } catch (error) {
        console.error('Payment intent error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Verify payment
app.post('/api/payment/verify', async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ success: false, error: 'Payment intent ID is required' });
        }

        const verification = await paymentGateway.verifyPayment(paymentIntentId);

        res.json({ success: true, data: verification });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Něco se pokazilo!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint nenalezen' });
});

// Spustit server
app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════╗
    ║     FIXO Backend Server          ║
    ║     Running on port ${PORT}         ║
    ║     http://localhost:${PORT}        ║
    ╚══════════════════════════════════╝
    `);
    console.log('API Endpoints:');
    console.log('\n📊 CORE:');
    console.log('  GET  /api/health         - Health check');
    console.log('  GET  /api/sections       - Sekce oprav (Koupelna, Dům, Zahrada...)');
    console.log('  GET  /api/categories     - Seznam kategorií (deprecated)');
    console.log('\n🔍 REPAIRS:');
    console.log('  POST /api/analyze        - Analyzovat obrázek (multipart)');
    console.log('  POST /api/analyze-base64 - Analyzovat obrázek (base64)');
    console.log('  GET  /api/repair/:id/:id - Detail opravy');
    console.log('  GET  /api/objects        - Seznam objektů');
    console.log('  GET  /api/search         - Vyhledávání');
    console.log('  POST /api/history        - Uložit historii');
    console.log('  GET  /api/stats          - Statistiky');
    console.log('  GET  /api/tools          - Seznam nástrojů');
    console.log('\n👷 PROVIDERS:');
    console.log('  POST /api/providers/register - 🆕 Registrace dodavatele');
    console.log('  GET  /api/providers      - 🆕 Seznam všech dodavatelů');
    console.log('  GET  /api/providers/nearby - 🆕 Dodavatelé v okolí (geolokace)');
    console.log('  GET  /api/providers/:id  - 🆕 Detail dodavatele');
    console.log('\n💳 PAYMENTS:');
    console.log('  GET  /api/pricing        - Cenové plány pro uživatele');
    console.log('  GET  /api/pricing/providers - 🆕 Cenové plány pro dodavatele');
    console.log('  POST /api/payment/create-intent - Vytvořit platbu');
    console.log('  POST /api/payment/verify - Ověřit platbu');
});

module.exports = app;