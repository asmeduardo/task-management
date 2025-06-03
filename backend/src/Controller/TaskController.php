<?php

namespace App\Controller;

use App\Entity\Task;
use App\Service\TaskService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/tasks', name: 'api_tasks_')]
class TaskController extends AbstractController
{
    private TaskService $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    #[Route('', name: 'index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        $filters = [
            'completed' => $request->query->get('completed') !== null ?
                filter_var($request->query->get('completed'), FILTER_VALIDATE_BOOLEAN) : null,
            'priority' => $request->query->get('priority'),
            'category' => $request->query->get('category'),
            'search' => $request->query->get('search'),
            'user' => $user
        ];

        $tasks = $this->taskService->getFilteredTasks($filters);

        return $this->json([
            'success' => true,
            'data' => $tasks,
            'count' => count($tasks)
        ], Response::HTTP_OK, [], ['groups' => ['task:read']]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json([
                'success' => false,
                'message' => 'Dados inválidos'
            ], Response::HTTP_BAD_REQUEST);
        }

        $result = $this->taskService->createTask($data, $user);

        if (!$result['success']) {
            return $this->json([
                'success' => false,
                'errors' => $result['errors']
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->json([
            'success' => true,
            'message' => 'Tarefa criada com sucesso',
            'data' => $result['task']
        ], Response::HTTP_CREATED, [], ['groups' => ['task:read']]);
    }

    #[Route('/stats', name: 'stats', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        $user = $this->getUser();
        $statistics = $this->taskService->getTaskStatistics($user);

        return $this->json([
            'success' => true,
            'data' => $statistics
        ], Response::HTTP_OK);
    }

    #[Route('/categories', name: 'categories', methods: ['GET'])]
    public function categories(): JsonResponse
    {
        $user = $this->getUser();
        $categories = $this->taskService->getAvailableCategories($user);

        return $this->json([
            'success' => true,
            'data' => $categories
        ], Response::HTTP_OK);
    }

    #[Route('/overdue', name: 'overdue', methods: ['GET'])]
    public function overdue(): JsonResponse
    {
        $user = $this->getUser();
        $overdueTasks = $this->taskService->getOverdueTasks($user);

        return $this->json([
            'success' => true,
            'data' => $overdueTasks,
            'count' => count($overdueTasks)
        ], Response::HTTP_OK, [], ['groups' => ['task:read']]);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(Task $task): JsonResponse
    {
        if ($task->getUser() !== $this->getUser()) {
            return $this->json([
                'success' => false,
                'message' => 'Acesso negado'
            ], Response::HTTP_FORBIDDEN);
        }

        return $this->json([
            'success' => true,
            'data' => $task
        ], Response::HTTP_OK, [], ['groups' => ['task:read']]);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(Request $request, Task $task): JsonResponse
    {
        if ($task->getUser() !== $this->getUser()) {
            return $this->json([
                'success' => false,
                'message' => 'Acesso negado'
            ], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json([
                'success' => false,
                'message' => 'Dados inválidos'
            ], Response::HTTP_BAD_REQUEST);
        }

        $result = $this->taskService->updateTask($task, $data);

        if (!$result['success']) {
            return $this->json([
                'success' => false,
                'errors' => $result['errors']
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->json([
            'success' => true,
            'message' => 'Tarefa atualizada com sucesso',
            'data' => $result['task']
        ], Response::HTTP_OK, [], ['groups' => ['task:read']]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(Task $task): JsonResponse
    {
        if ($task->getUser() !== $this->getUser()) {
            return $this->json([
                'success' => false,
                'message' => 'Acesso negado'
            ], Response::HTTP_FORBIDDEN);
        }

        $this->taskService->deleteTask($task);

        return $this->json([
            'success' => true,
            'message' => 'Tarefa removida com sucesso'
        ], Response::HTTP_OK);
    }

    #[Route('/{id}/toggle', name: 'toggle', methods: ['PATCH'])]
    public function toggle(Task $task): JsonResponse
    {
        if ($task->getUser() !== $this->getUser()) {
            return $this->json([
                'success' => false,
                'message' => 'Acesso negado'
            ], Response::HTTP_FORBIDDEN);
        }

        $updatedTask = $this->taskService->toggleTaskComplete($task);

        return $this->json([
            'success' => true,
            'message' => 'Status da tarefa atualizado',
            'data' => $updatedTask
        ], Response::HTTP_OK, [], ['groups' => ['task:read']]);
    }
}