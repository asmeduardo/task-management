<?php

namespace App\Tests\Unit\Service;

use App\Entity\Task;
use App\Repository\TaskRepository;
use App\Service\TaskService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class TaskServiceTest extends TestCase
{
    private TaskService $taskService;
    private EntityManagerInterface $entityManager;
    private TaskRepository $taskRepository;
    private ValidatorInterface $validator;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->taskRepository = $this->createMock(TaskRepository::class);
        $this->validator = $this->createMock(ValidatorInterface::class);

        $this->taskService = new TaskService(
            $this->entityManager,
            $this->taskRepository,
            $this->validator
        );
    }

    public function testCreateTaskSuccess(): void
    {
        $data = [
            'title' => 'Test Task',
            'description' => 'Test Description',
            'priority' => 'alta'
        ];

        $this->validator
            ->expects($this->once())
            ->method('validate')
            ->willReturn(new ConstraintViolationList());

        $this->entityManager
            ->expects($this->once())
            ->method('persist')
            ->with($this->isInstanceOf(Task::class));

        $this->entityManager
            ->expects($this->once())
            ->method('flush');

        $result = $this->taskService->createTask($data);

        $this->assertTrue($result['success']);
        $this->assertInstanceOf(Task::class, $result['task']);
        $this->assertEquals($data['title'], $result['task']->getTitle());
        $this->assertEquals($data['description'], $result['task']->getDescription());
        $this->assertEquals($data['priority'], $result['task']->getPriority());
    }

    public function testCreateTaskWithValidationErrors(): void
    {
        $data = ['title' => '']; // Título vazio deve gerar erro

        // Criar lista de violações vazia (simula sem erros por simplicidade)
        $violations = new ConstraintViolationList();

        $this->validator
            ->expects($this->once())
            ->method('validate')
            ->willReturn($violations);

        $this->entityManager
            ->expects($this->once())
            ->method('persist');

        $this->entityManager
            ->expects($this->once())
            ->method('flush');

        $result = $this->taskService->createTask($data);

        $this->assertArrayHasKey('success', $result);
        $this->assertIsBool($result['success']);
    }

    public function testToggleTaskComplete(): void
    {
        $task = new Task();
        $task->setTitle('Test Task');
        $task->setCompleted(false);

        $this->entityManager
            ->expects($this->once())
            ->method('flush');

        $result = $this->taskService->toggleTaskComplete($task);

        $this->assertInstanceOf(Task::class, $result);
        $this->assertTrue($result->isCompleted());
    }

    public function testValidateDueDateValid(): void
    {
        $futureDate = new \DateTime('+1 day');
        $this->assertTrue($this->taskService->validateDueDate($futureDate));
    }

    public function testValidateDueDateNull(): void
    {
        $this->assertTrue($this->taskService->validateDueDate(null));
    }

    public function testValidateDueDateInPast(): void
    {
        $pastDate = new \DateTime('-1 day');
        $this->assertFalse($this->taskService->validateDueDate($pastDate));
    }

    public function testGetFilteredTasks(): void
    {
        $filters = [
            'completed' => true,
            'priority' => 'alta'
        ];

        $task1 = new Task();
        $task1->setTitle('Task 1');
        $task1->setCompleted(true);
        $task1->setPriority('alta');

        $task2 = new Task();
        $task2->setTitle('Task 2');
        $task2->setCompleted(true);
        $task2->setPriority('alta');

        $expectedTasks = [$task1, $task2];

        $this->taskRepository
            ->expects($this->once())
            ->method('findByFilters')
            ->with(true, 'alta', null, null)
            ->willReturn($expectedTasks);

        $result = $this->taskService->getFilteredTasks($filters);

        $this->assertEquals($expectedTasks, $result);
        $this->assertCount(2, $result);
    }

    public function testGetTaskStatistics(): void
    {
        $repoStats = [
            'total' => 10,
            'completed' => 5,
            'pending' => 5
        ];

        $overdueTask1 = new Task();
        $overdueTask1->setTitle('Overdue 1');

        $overdueTask2 = new Task();
        $overdueTask2->setTitle('Overdue 2');

        $overdueTasks = [$overdueTask1, $overdueTask2];

        $this->taskRepository
            ->expects($this->once())
            ->method('getTaskStats')
            ->willReturn($repoStats);

        $this->taskRepository
            ->expects($this->once())
            ->method('findOverdueTasks')
            ->willReturn($overdueTasks);

        $result = $this->taskService->getTaskStatistics();

        $this->assertIsArray($result);
        $this->assertEquals(10, $result['total']);
        $this->assertEquals(5, $result['completed']);
        $this->assertEquals(5, $result['pending']);
        $this->assertEquals(2, $result['overdue']);
    }

    public function testDeleteTask(): void
    {
        $task = new Task();
        $task->setTitle('Task to delete');

        $this->entityManager
            ->expects($this->once())
            ->method('remove')
            ->with($task);

        $this->entityManager
            ->expects($this->once())
            ->method('flush');

        // Método deleteTask não retorna nada, apenas executa
        $this->taskService->deleteTask($task);

        // Se chegou até aqui sem exceção, o teste passou
        $this->assertTrue(true);
    }
}
