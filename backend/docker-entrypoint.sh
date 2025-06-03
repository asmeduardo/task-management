#!/bin/bash
set -e

echo "🔧 Configurando backend..."

echo "⏳ Aguardando PostgreSQL..."

wait_for_postgres() {
    until php -r "
        try {
            \$pdo = new PDO('pgsql:host=postgres;port=5432;dbname=task_manager', 'task_user', 'task_password');
            echo 'Connected successfully';
            exit(0);
        } catch (PDOException \$e) {
            exit(1);
        }
    " 2>/dev/null; do
        echo "PostgreSQL não está pronto - aguardando..."
        sleep 2
    done
}

wait_for_postgres
echo "✅ PostgreSQL está pronto!"

echo "📦 Executando migrações (se houver novas)..."

php bin/console doctrine:migrations:migrate --no-interaction --env=prod --allow-no-migration

echo "🧹 Limpando cache..."
php bin/console cache:clear --env=prod

echo "🚀 Iniciando servidor Symfony..."
exec symfony local:server:start --listen-ip=0.0.0.0 --port=8000 --no-tls