# FIXO - Deployment Guide

## 📋 Předpoklady

- Docker & Docker Compose nainstalovaný
- Git
- Min. 2GB RAM
- 10GB volného místa na disku
- Port 80, 3000, 9000, 9001 volné

## 🚀 Rychlý start

### 1. Naklonování repozitáře

```bash
git clone https://github.com/your-org/fixo.git
cd fixo
```

### 2. Nastavení prostředí

```bash
# Vytvořit .env soubor
cat > .env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://fixo_user:fixo_secure_password@postgres:5432/fixo
REDIS_URL=redis://redis:6379
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=fixo_admin
MINIO_SECRET_KEY=fixo_secure_password_change_me
JWT_SECRET=your_jwt_secret_here_change_me
EOF
```

### 3. Spuštění aplikace

```bash
# Spustit všechny služby
docker-compose up -d

# Zkontrolovat status
docker-compose ps

# Zobrazit logy
docker-compose logs -f
```

### 4. Ověření funkčnosti

```bash
# Test backendu
curl http://localhost:3000/api/health

# Otevřít frontend
open http://localhost
```

## 🔧 Konfigurace

### Databáze

PostgreSQL je automaticky inicializována při prvním spuštění. Pro produkci změňte hesla v `docker-compose.yml`:

```yaml
POSTGRES_PASSWORD: your_secure_password_here
```

### Storage

MinIO běží na portech:
- 9000: API
- 9001: Web konzole

Přihlašovací údaje:
- Username: fixo_admin
- Password: fixo_secure_password_change_me

### Cache

Redis je nakonfigurován s persistencí dat. Pro větší výkon můžete upravit konfiguraci:

```bash
docker exec -it fixo-cache redis-cli CONFIG SET maxmemory 256mb
docker exec -it fixo-cache redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

## 📊 Monitoring

### Zdravotní kontroly

```bash
# Backend API
curl http://localhost:3000/api/health

# PostgreSQL
docker exec fixo-db pg_isready

# Redis
docker exec fixo-cache redis-cli ping

# MinIO
curl http://localhost:9000/minio/health/live
```

### Logy

```bash
# Všechny služby
docker-compose logs -f

# Konkrétní služba
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Metriky

```bash
# Docker statistiky
docker stats

# Využití disku
docker system df
```

## 🔐 Bezpečnost

### SSL/TLS

Pro produkci doporučujeme použít Let's Encrypt:

```bash
# Instalace Certbot
apt-get install certbot python3-certbot-nginx

# Získání certifikátu
certbot --nginx -d your-domain.com
```

### Firewall

```bash
# Povolit pouze potřebné porty
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### Zálohy

```bash
# Zálohovat databázi
docker exec fixo-db pg_dump -U fixo_user fixo > backup_$(date +%Y%m%d).sql

# Zálohovat uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz ./uploads

# Zálohovat MinIO data
docker run --rm -v minio-data:/data -v $(pwd):/backup alpine tar czf /backup/minio_backup_$(date +%Y%m%d).tar.gz /data
```

## 🔄 Aktualizace

```bash
# Stáhnout nejnovější změny
git pull origin main

# Rebuild a restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🐛 Řešení problémů

### Backend nefunguje

```bash
# Zkontrolovat logy
docker-compose logs backend

# Restart služby
docker-compose restart backend

# Rebuild image
docker-compose build --no-cache backend
```

### Databáze je nedostupná

```bash
# Zkontrolovat status
docker exec fixo-db pg_isready

# Zobrazit logy
docker-compose logs postgres

# Restart databáze
docker-compose restart postgres
```

### Málo místa na disku

```bash
# Vyčistit staré obrazy
docker system prune -a

# Vyčistit logy
truncate -s 0 $(docker inspect --format='{{.LogPath}}' fixo-backend)
```

## 📈 Škálování

### Horizontální škálování

Pro vysokou zátěž můžete spustit více instancí backendu:

```yaml
backend:
  ...
  deploy:
    replicas: 3
```

### Load Balancer

Přidat nginx load balancer:

```nginx
upstream backend {
    least_conn;
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;
}
```

### Kubernetes

Pro enterprise nasazení je připraven Kubernetes manifest:

```bash
kubectl apply -f k8s/
```

## 🌍 Produkční nasazení

### AWS

```bash
# ECS deployment
ecs-cli compose up --cluster fixo-cluster

# nebo EC2 s Docker
ssh ec2-user@your-instance
# následovat standardní instalaci
```

### Azure

```bash
# Azure Container Instances
az container create --resource-group fixo-rg --file docker-compose.yml
```

### Google Cloud

```bash
# Cloud Run
gcloud run deploy fixo --source .
```

### DigitalOcean

```bash
# App Platform
doctl apps create --spec .do/app.yaml
```

## 📞 Podpora

- GitHub Issues: https://github.com/your-org/fixo/issues
- Email: support@fixo.app
- Dokumentace: https://docs.fixo.app

## 📝 Licence

MIT License - viz LICENSE soubor

---

**FIXO Team** | *Fix Anything. Anywhere. Instantly.*