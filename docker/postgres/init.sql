-- Criar usuário e banco se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'task_user') THEN
        CREATE USER task_user WITH PASSWORD 'task_password';
    END IF;
END
$$;

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE task_manager TO task_user;
GRANT ALL ON SCHEMA public TO task_user;