<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250526205108 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create users table and add user_id to tasks table';
    }

    public function up(Schema $schema): void
    {
        // Criar tabela de usuários
        $this->addSql('CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(180) UNIQUE NOT NULL,
            roles JSON NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
            updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
        )');

        // Adicionar índice no email
        $this->addSql('CREATE UNIQUE INDEX UNIQ_users_email ON users (email)');

        // Adicionar coluna user_id na tabela tasks
        $this->addSql('ALTER TABLE tasks ADD user_id INTEGER NOT NULL DEFAULT 1');

        // Criar foreign key constraint
        $this->addSql('ALTER TABLE tasks ADD CONSTRAINT FK_tasks_user_id FOREIGN KEY (user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');

        // Criar índice na foreign key
        $this->addSql('CREATE INDEX IDX_tasks_user_id ON tasks (user_id)');

        // Inserir usuário padrão para tarefas existentes (opcional)
        $this->addSql("INSERT INTO users (email, roles, password, name, created_at, updated_at) VALUES 
            ('admin@example.com', '[\"ROLE_USER\"]', '\$2y\$13\$dummy.hash.for.migration', 'Admin', NOW(), NOW())");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE tasks DROP CONSTRAINT FK_tasks_user_id');
        $this->addSql('DROP INDEX IDX_tasks_user_id');
        $this->addSql('ALTER TABLE tasks DROP user_id');
        $this->addSql('DROP TABLE users');
    }
}