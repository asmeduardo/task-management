<?php

namespace App\DataFixtures;

use App\Entity\Task;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class TaskFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // Tarefas de exemplo para desenvolvimento
        $tasks = [
            [
                'title' => 'Implementar autenticação JWT',
                'description' => 'Adicionar sistema de login e registro com JWT tokens',
                'priority' => 'alta',
                'category' => 'Desenvolvimento',
                'completed' => false,
                'dueDate' => new \DateTime('+3 days')
            ],
            [
                'title' => 'Configurar Docker para desenvolvimento',
                'description' => 'Criar Dockerfile e docker-compose.yml para ambiente local',
                'priority' => 'media',
                'category' => 'DevOps',
                'completed' => true,
                'dueDate' => null
            ],
            [
                'title' => 'Escrever documentação da API',
                'description' => 'Documentar todos os endpoints usando OpenAPI/Swagger',
                'priority' => 'media',
                'category' => 'Documentação',
                'completed' => false,
                'dueDate' => new \DateTime('+1 week')
            ],
            [
                'title' => 'Implementar testes E2E',
                'description' => 'Adicionar testes end-to-end com Cypress',
                'priority' => 'baixa',
                'category' => 'Testes',
                'completed' => false,
                'dueDate' => new \DateTime('+2 weeks')
            ],
            [
                'title' => 'Otimizar consultas do banco',
                'description' => 'Analisar e otimizar queries lentas identificadas',
                'priority' => 'alta',
                'category' => 'Performance',
                'completed' => false,
                'dueDate' => new \DateTime('+5 days')
            ],
            [
                'title' => 'Setup CI/CD Pipeline',
                'description' => 'Configurar GitHub Actions para deploy automático',
                'priority' => 'media',
                'category' => 'DevOps',
                'completed' => true,
                'dueDate' => null
            ],
            [
                'title' => 'Revisar código da sprint passada',
                'description' => 'Code review das funcionalidades implementadas',
                'priority' => 'baixa',
                'category' => 'Revisão',
                'completed' => true,
                'dueDate' => null
            ],
            [
                'title' => 'Implementar sistema de notificações',
                'description' => 'Notificações por email para tarefas vencidas',
                'priority' => 'media',
                'category' => 'Feature',
                'completed' => false,
                'dueDate' => new \DateTime('+1 month')
            ],
            [
                'title' => 'Backup automático do banco',
                'description' => 'Script para backup diário automático',
                'priority' => 'alta',
                'category' => 'Infraestrutura',
                'completed' => false,
                'dueDate' => new \DateTime('-2 days') // Tarefa vencida
            ],
            [
                'title' => 'Atualizar dependências',
                'description' => 'Atualizar Symfony e outras dependências para versões mais recentes',
                'priority' => 'baixa',
                'category' => 'Manutenção',
                'completed' => false,
                'dueDate' => new \DateTime('+3 weeks')
            ]
        ];

        foreach ($tasks as $taskData) {
            $task = new Task();
            $task->setTitle($taskData['title']);
            $task->setDescription($taskData['description']);
            $task->setPriority($taskData['priority']);
            $task->setCategory($taskData['category']);
            $task->setCompleted($taskData['completed']);
            $task->setDueDate($taskData['dueDate']);

            $manager->persist($task);
        }

        $manager->flush();
    }
}
