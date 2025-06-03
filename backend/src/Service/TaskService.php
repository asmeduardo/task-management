<?php

namespace App\Service;

use App\Entity\Task;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class TaskService
{
    private EntityManagerInterface $entityManager;
    private TaskRepository $taskRepository;
    private ValidatorInterface $validator;

    public function __construct(
        EntityManagerInterface $entityManager,
        TaskRepository $taskRepository,
        ValidatorInterface $validator
    ) {
        $this->entityManager = $entityManager;
        $this->taskRepository = $taskRepository;
        $this->validator = $validator;
    }

    /**
     * Cria uma nova tarefa com validação
     */
    public function createTask(array $data): array
    {
        $task = new Task();
        $this->populateTaskFromArray($task, $data);

        $errors = $this->validator->validate($task);

        if (count($errors) > 0) {
            return [
                'success' => false,
                'errors' => $this->formatValidationErrors($errors)
            ];
        }

        $this->entityManager->persist($task);
        $this->entityManager->flush();

        return [
            'success' => true,
            'task' => $task
        ];
    }

    /**
     * Atualiza uma tarefa existente
     */
    public function updateTask(Task $task, array $data): array
    {
        $this->populateTaskFromArray($task, $data);

        $errors = $this->validator->validate($task);

        if (count($errors) > 0) {
            return [
                'success' => false,
                'errors' => $this->formatValidationErrors($errors)
            ];
        }

        $this->entityManager->flush();

        return [
            'success' => true,
            'task' => $task
        ];
    }

    /**
     * Remove uma tarefa
     */
    public function deleteTask(Task $task): void
    {
        $this->entityManager->remove($task);
        $this->entityManager->flush();
    }

    /**
     * Marca/desmarca tarefa como completa
     */
    public function toggleTaskComplete(Task $task): Task
    {
        $task->setCompleted(!$task->isCompleted());
        $this->entityManager->flush();

        return $task;
    }

    /**
     * Busca tarefas com filtros
     */
    public function getFilteredTasks(array $filters): array
    {
        return $this->taskRepository->findByFilters(
            $filters['completed'] ?? null,
            $filters['priority'] ?? null,
            $filters['category'] ?? null,
            $filters['search'] ?? null
        );
    }

    /**
     * Obtém estatísticas das tarefas
     */
    public function getTaskStatistics(): array
    {
        $stats = $this->taskRepository->getTaskStats();
        $overdue = count($this->taskRepository->findOverdueTasks());

        return array_merge($stats, ['overdue' => $overdue]);
    }

    /**
     * Busca tarefas vencidas
     */
    public function getOverdueTasks(): array
    {
        return $this->taskRepository->findOverdueTasks();
    }

    /**
     * Obtém categorias disponíveis
     */
    public function getAvailableCategories(): array
    {
        return $this->taskRepository->getAvailableCategories();
    }

    /**
     * Valida se uma data de vencimento é válida
     */
    public function validateDueDate(?\DateTime $dueDate): bool
    {
        if ($dueDate === null) {
            return true;
        }

        $now = new \DateTime();
        return $dueDate >= $now;
    }

    /**
     * Popula tarefa com dados do array
     */
    private function populateTaskFromArray(Task $task, array $data): void
    {
        if (isset($data['title'])) {
            $task->setTitle($data['title']);
        }

        if (isset($data['description'])) {
            $task->setDescription($data['description']);
        }

        if (isset($data['completed'])) {
            $task->setCompleted((bool) $data['completed']);
        }

        if (isset($data['priority'])) {
            $task->setPriority($data['priority']);
        }

        if (isset($data['category'])) {
            $task->setCategory($data['category']);
        }

        if (isset($data['dueDate'])) {
            $dueDate = null;
            if ($data['dueDate']) {
                $dueDate = new \DateTime($data['dueDate']);
            }
            $task->setDueDate($dueDate);
        }
    }

    /**
     * Formata erros de validação
     */
    private function formatValidationErrors($errors): array
    {
        $formattedErrors = [];

        foreach ($errors as $error) {
            $formattedErrors[] = [
                'field' => $error->getPropertyPath(),
                'message' => $error->getMessage()
            ];
        }

        return $formattedErrors;
    }
}