<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250526205108 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create tasks table with all required fields for PostgreSQL';
    }

    public function up(Schema $schema): void
    {
        
        $this->addSql('CREATE TABLE tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL, 
            description TEXT DEFAULT NULL,
            completed BOOLEAN NOT NULL DEFAULT FALSE,
            priority VARCHAR(50) NOT NULL DEFAULT \'media\',
            category VARCHAR(100) DEFAULT NULL, 
            created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
            updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
            due_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL 
        )');

        $this->addSql('CREATE INDEX IDX_tasks_completed ON tasks (completed)');
        $this->addSql('CREATE INDEX IDX_tasks_priority ON tasks (priority)');
        $this->addSql('CREATE INDEX IDX_tasks_category ON tasks (category)');
        $this->addSql('CREATE INDEX IDX_tasks_due_date ON tasks (due_date)');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('DROP TABLE tasks');
    }
}