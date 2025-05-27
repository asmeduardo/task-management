<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Task;
use PHPUnit\Framework\TestCase;

class TaskTest extends TestCase
{
    private Task $task;

    protected function setUp(): void
    {
        $this->task = new Task();
    }

    public function testTaskCreation(): void
    {
        $this->assertNull($this->task->getId());
        $this->assertNull($this->task->getTitle());
        $this->assertFalse($this->task->isCompleted());
        $this->assertEquals('media', $this->task->getPriority());
    }

    public function testSetTitle(): void
    {
        $title = 'Test Task';
        $this->task->setTitle($title);
        $this->assertEquals($title, $this->task->getTitle());
    }

    public function testSetDescription(): void
    {
        $description = 'Test Description';
        $this->task->setDescription($description);
        $this->assertEquals($description, $this->task->getDescription());
    }

    public function testSetCompleted(): void
    {
        $this->task->setCompleted(true);
        $this->assertTrue($this->task->isCompleted());
    }

    public function testSetPriority(): void
    {
        $priority = 'alta';
        $this->task->setPriority($priority);
        $this->assertEquals($priority, $this->task->getPriority());
    }

    public function testSetCategory(): void
    {
        $category = 'Trabalho';
        $this->task->setCategory($category);
        $this->assertEquals($category, $this->task->getCategory());
    }

    public function testSetDueDate(): void
    {
        $dueDate = new \DateTime('2025-12-31');
        $this->task->setDueDate($dueDate);
        $this->assertEquals($dueDate, $this->task->getDueDate());
    }

    public function testLifecycleCallbacks(): void
    {
        // Simula o comportamento do PrePersist
        $this->task->setCreatedAtValue();

        $this->assertInstanceOf(\DateTime::class, $this->task->getCreatedAt());
        $this->assertInstanceOf(\DateTime::class, $this->task->getUpdatedAt());
    }

    public function testPreUpdate(): void
    {
        // Simula o comportamento do PreUpdate
        $this->task->setCreatedAtValue(); // Primeiro set
        $originalUpdated = $this->task->getUpdatedAt();

        usleep(1000); // Garante diferença de tempo (1ms)

        $this->task->setUpdatedAtValue();
        $newUpdated = $this->task->getUpdatedAt();

        $this->assertGreaterThanOrEqual($originalUpdated, $newUpdated);
    }
}
