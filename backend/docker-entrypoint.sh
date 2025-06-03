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

echo "🔑 Configurando chaves JWT..."

# Criar diretório para as chaves JWT se não existir
mkdir -p config/jwt

# Gerar chaves JWT se não existirem
if [ ! -f "config/jwt/private.pem" ] || [ ! -f "config/jwt/public.pem" ]; then
    echo "Gerando chaves JWT..."
    
    # Gerar chave privada
    openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:$JWT_PASSPHRASE
    
    # Gerar chave pública
    openssl pkey -in config/jwt/private.pem -passin pass:$JWT_PASSPHRASE -out config/jwt/public.pem -pubout
    
    # Ajustar permissões
    chmod 600 config/jwt/private.pem
    chmod 644 config/jwt/public.pem
    chown www-data:www-data config/jwt/*.pem
    
    echo "✅ Chaves JWT geradas com sucesso!"
else
    echo "✅ Chaves JWT já existem!"
fi

echo "📦 Executando migrações (se houver novas)..."

php bin/console doctrine:migrations:migrate --no-interaction --env=prod --allow-no-migration

echo "🧹 Limpando cache..."
php bin/console cache:clear --env=prod

echo "🚀 Iniciando servidor Symfony..."
exec symfony local:server:start --listen-ip=0.0.0.0 --port=8000 --no-tls