<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250526205108 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create tasks table with all required fields';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE tasks (
            id INT AUTO_INCREMENT NOT NULL, 
            title VARCHAR(255) NOT NULL, 
            description LONGTEXT DEFAULT NULL, 
            completed TINYINT(1) NOT NULL DEFAULT 0, 
            priority VARCHAR(50) NOT NULL DEFAULT "media", 
            category VARCHAR(100) DEFAULT NULL, 
            created_at DATETIME NOT NULL, 
            updated_at DATETIME NOT NULL, 
            due_date DATETIME DEFAULT NULL, 
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('CREATE INDEX IDX_tasks_completed ON tasks (completed)');
        $this->addSql('CREATE INDEX IDX_tasks_priority ON tasks (priority)');
        $this->addSql('CREATE INDEX IDX_tasks_category ON tasks (category)');
        $this->addSql('CREATE INDEX IDX_tasks_due_date ON tasks (due_date)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE tasks');
    }
}
